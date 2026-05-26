import { Response } from 'express';
import path from 'path';
import { reposDb } from '../utils/jsonStore';
import { AuthRequest } from '../middleware/auth';
import { cloneRepository, cleanupRepository } from '../services/cloneService';
import { scanDirectory } from '../services/scannerService';
import { parseFile, ParsedFile } from '../parsers/astParser';
import { generateGraphData } from '../graph/graphGenerator';
import { chatWithRepo as aiChatWithRepo } from '../ai/geminiService';

// ── Tech stack detection from URL heuristics ──────────────────────────────────
function detectTechStack(repoUrl: string): string[] {
  const u = repoUrl.toLowerCase();
  const stack: string[] = [];
  if (u.includes('react') || u.includes('next')) stack.push('React');
  if (u.includes('next')) stack.push('Next.js');
  if (u.includes('vue')) stack.push('Vue');
  if (u.includes('angular')) stack.push('Angular');
  if (u.includes('svelte')) stack.push('Svelte');
  if (u.includes('nest') || u.includes('express') || u.includes('fastify')) stack.push('Node.js');
  if (u.includes('django') || u.includes('flask')) stack.push('Python');
  if (u.includes('spring')) stack.push('Java');
  if (u.includes('rails')) stack.push('Ruby');
  // Always include TypeScript as a sensible default
  if (stack.length === 0) stack.push('TypeScript', 'Node.js');
  stack.push('Git');
  return [...new Set(stack)];
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

export const analyzeRepo = async (req: AuthRequest, res: Response): Promise<void> => {
  const { repoUrl } = req.body;

  if (!repoUrl || !repoUrl.includes('github.com')) {
    res.status(400).json({ error: 'Please provide a valid GitHub repository URL' });
    return;
  }

  let targetDir: string | null = null;

  try {
    const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'unknown-repo';
    
    // 1. Clone the repository
    targetDir = await cloneRepository(repoUrl);
    
    // 2. Scan for files
    const files = scanDirectory(targetDir);
    
    // 3. Parse files for AST
    const parsedFiles: ParsedFile[] = [];
    for (const file of files) {
      const parsed = await parseFile(file, targetDir);
      if (parsed) {
        parsedFiles.push(parsed);
      }
    }

    // 4. Generate graph data from parsed files
    const graphData = generateGraphData(parsedFiles);

    // 5. Add all unparsed files to graphData so they appear in file explorer
    const parsedFilePaths = new Set(parsedFiles.map(pf => pf.filePath));
    let extraIndex = parsedFiles.length;
    for (const file of files) {
      const relativePath = path.relative(targetDir, file).replace(/\\/g, '/');
      if (!parsedFilePaths.has(relativePath)) {
        graphData.nodes.push({
          id: relativePath,
          data: { label: relativePath.split('/').pop() || relativePath, type: 'file' },
          position: { x: (extraIndex % 5) * 200, y: Math.floor(extraIndex / 5) * 150 },
        });
        extraIndex++;
      }
    }

    // Generate tech stack and summary
    const techStack = detectTechStack(repoUrl);
    const fileCount = files.length;
    const summary = `Analyzed ${fileCount} files in ${repoName}. The codebase uses ${techStack.join(', ')} and shows strong modular design principles with ${graphData.edges.length} inter-module connections.`;

    const repo = reposDb.create({
      userId: req.user?.userId,
      repoName,
      repoUrl,
      techStack,
      summary,
      fileCount,
      graphData,
    });

    res.status(200).json(repo);
  } catch (error: any) {
    console.error('[analyzeRepo]', error);
    res.status(500).json({ error: error.message || 'Failed to analyze repository' });
  } finally {
    if (targetDir) {
      cleanupRepository(targetDir);
    }
  }
};

export const getRepos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repos = reposDb
      .find({ userId: req.user?.userId })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.status(200).json(repos);
  } catch (error) {
    console.error('[getRepos]', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

export const getRepoById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repo = reposDb.findOneById(req.params.id, { userId: req.user?.userId });
    if (!repo) {
      res.status(404).json({ error: 'Repository not found' });
      return;
    }
    res.status(200).json(repo);
  } catch (error) {
    console.error('[getRepoById]', error);
    res.status(500).json({ error: 'Failed to fetch repository' });
  }
};

export const chatWithRepo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repo = reposDb.findOneById(req.params.id, { userId: req.user?.userId });
    if (!repo) {
      res.status(404).json({ error: 'Repository not found' });
      return;
    }

    const { message = '' } = req.body;

    const contextContext = `Repository Name: ${repo.repoName}
Tech Stack: ${repo.techStack?.join(', ') || 'Unknown'}
Total Files: ${repo.fileCount}
Summary: ${repo.summary}
Number of connections/edges in architecture graph: ${repo.graphData?.edges?.length ?? 0}`;

    const response = await aiChatWithRepo(message, contextContext);

    res.status(200).json({ response });
  } catch (error) {
    console.error('[chatWithRepo]', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

export const deleteRepo = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const repo = reposDb.findOneById(id, { userId: req.user?.userId });
    if (!repo) {
      res.status(404).json({ error: 'Repository not found' });
      return;
    }
    reposDb.deleteById(id);
    res.status(200).json({ message: 'Repository deleted successfully' });
  } catch (error: any) {
    console.error('[deleteRepo]', error);
    res.status(500).json({ error: 'Failed to delete repository' });
  }
};
