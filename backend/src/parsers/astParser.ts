import path from 'path';
import fs from 'fs';

export interface ParsedFile {
  filePath: string;
  imports:   string[];
  exports:   string[];
  functions: string[];
}

export const initParser = async (): Promise<void> => {
  // No initialization needed for regex parser
};

export const parseFile = async (filePath: string, rootDir: string): Promise<ParsedFile | null> => {
  const ext = path.extname(filePath);
  if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    return null;
  }

  try {
    const code = fs.readFileSync(filePath, 'utf8');

    const imports:   string[] = [];
    const exports:   string[] = [];
    const functions: string[] = [];

    // Extract imports
    const importRegex = /import\s+(?:[^'"]*?from\s+)?['"]([^'"]+)['"]/gs;
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    const exportFromRegex = /export\s+(?:[^'"]*?from\s+)?['"]([^'"]+)['"]/gs;
    
    let match;
    while ((match = importRegex.exec(code)) !== null) imports.push(match[1]);
    while ((match = requireRegex.exec(code)) !== null) imports.push(match[1]);
    while ((match = exportFromRegex.exec(code)) !== null) imports.push(match[1]); // Treat re-exports as dependencies

    // Extract basic exports
    if (/export\s+/.test(code) || /module\.exports/.test(code)) {
      exports.push('export');
    }

    // Extract function names (naive approach for graph insight)
    const functionRegex = /function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g;
    const arrowRegex = /(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/g;
    
    while ((match = functionRegex.exec(code)) !== null) functions.push(match[1]);
    while ((match = arrowRegex.exec(code)) !== null) functions.push(match[1]);

    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    
    return { filePath: relativePath, imports, exports, functions };
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, err);
    return null;
  }
};
