import { IRepository } from '../models/Repository';
import { ParsedFile } from '../parsers/astParser';

export const getRelevantContext = (question: string, repo: IRepository): string => {
  if (!repo.astAnalysis || !Array.isArray(repo.astAnalysis) || repo.astAnalysis.length === 0) {
    return 'No repository file metadata available.';
  }

  const queryTerms = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['what', 'how', 'where', 'why', 'who', 'the', 'this', 'that', 'file', 'code', 'repo', 'repository', 'in', 'is', 'are', 'explain'].includes(t));

  const parsedFiles = repo.astAnalysis as ParsedFile[];
  const graph = repo.dependencyGraph as unknown as { nodes: any[], edges: { source: string, target: string }[] };

  // If there are no highly specific keywords, just return a random subset
  if (queryTerms.length === 0) {
    return formatContext(parsedFiles.slice(0, 10), graph);
  }

  // Score files based on query keyword matches
  const scoredFiles = parsedFiles.map(file => {
    let score = 0;
    
    // File path matches (highest weight)
    const filePathLower = file.filePath.toLowerCase();
    queryTerms.forEach(term => {
      if (filePathLower.includes(term)) score += 10;
    });

    // Functions matches
    if (file.functions && file.functions.length > 0) {
      file.functions.forEach(fn => {
        const fnLower = fn.toLowerCase();
        queryTerms.forEach(term => {
          if (fnLower.includes(term)) score += 5;
        });
      });
    }

    // Exports matches
    if (file.exports && file.exports.length > 0) {
      file.exports.forEach(exp => {
        const expLower = exp.toLowerCase();
        queryTerms.forEach(term => {
          if (expLower.includes(term)) score += 4;
        });
      });
    }

    // Imports matches
    if (file.imports && file.imports.length > 0) {
      file.imports.forEach(imp => {
        const impLower = imp.toLowerCase();
        queryTerms.forEach(term => {
          if (impLower.includes(term)) score += 2;
        });
      });
    }
    
    // Check if the query specifically asks for "database" or "auth"
    if (queryTerms.includes('database') || queryTerms.includes('db')) {
      if (filePathLower.includes('db') || filePathLower.includes('database') || filePathLower.includes('model') || file.imports?.some(i => i.includes('mongoose') || i.includes('typeorm') || i.includes('prisma'))) score += 15;
    }
    if (queryTerms.includes('auth') || queryTerms.includes('login') || queryTerms.includes('register')) {
      if (filePathLower.includes('auth') || filePathLower.includes('login') || filePathLower.includes('user') || file.imports?.some(i => i.includes('jwt') || i.includes('bcrypt') || i.includes('passport'))) score += 15;
    }

    return { file, score };
  });

  // Sort by score descending and filter out zero scores
  const topFiles = scoredFiles
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15) // Max 15 highly relevant files to avoid token limits
    .map(s => s.file);

  // If no files matched, fallback to top important files
  if (topFiles.length === 0) {
    const fallbackPaths = new Set(repo.importantFiles || []);
    const fallbackFiles = parsedFiles.filter(pf => fallbackPaths.has(pf.filePath)).slice(0, 10);
    return formatContext(fallbackFiles.length > 0 ? fallbackFiles : parsedFiles.slice(0, 10), graph);
  }

  return formatContext(topFiles, graph);
};

const formatContext = (files: ParsedFile[], graph: any): string => {
  let context = '--- RELEVANT FILES CONTEXT (AST & DEPENDENCIES) ---\n\n';
  
  files.forEach(file => {
    context += `File Path: ${file.filePath}\n`;
    if (file.imports && file.imports.length > 0) {
      context += `  Imports: ${file.imports.slice(0, 15).join(', ')}${file.imports.length > 15 ? '...' : ''}\n`;
    }
    if (file.exports && file.exports.length > 0) {
      context += `  Exports (Classes/Variables/Components): ${file.exports.slice(0, 15).join(', ')}${file.exports.length > 15 ? '...' : ''}\n`;
    }
    if (file.functions && file.functions.length > 0) {
      context += `  Functions/Methods: ${file.functions.slice(0, 20).join(', ')}${file.functions.length > 20 ? '...' : ''}\n`;
    }
    
    // Add Dependency graph information
    if (graph && graph.edges) {
      const dependencies = graph.edges.filter((e: any) => e.source === file.filePath).map((e: any) => e.target);
      const dependents = graph.edges.filter((e: any) => e.target === file.filePath).map((e: any) => e.source);
      
      if (dependencies.length > 0) {
        context += `  Depends on files (Imports from): ${dependencies.slice(0, 10).join(', ')}${dependencies.length > 10 ? '...' : ''}\n`;
      }
      if (dependents.length > 0) {
        context += `  Imported by files (Used by): ${dependents.slice(0, 10).join(', ')}${dependents.length > 10 ? '...' : ''}\n`;
      }
    }
    context += '\n';
  });

  return context;
};
