import { Response } from 'express';
import path from 'path';
import { Repository } from '../models/Repository';
import { ChatHistory } from '../models/ChatHistory';
import { AuthRequest } from '../middleware/authMiddleware';
import { cloneRepository, cleanupRepository } from '../services/cloneService';
import { scanDirectory } from '../services/scannerService';
import { parseFile, ParsedFile } from '../parsers/astParser';
import { generateGraphData } from '../graph/graphGenerator';
import { chatWithRepo as aiChatWithRepo } from '../ai/geminiService';
import { getRelevantContext } from '../ai/contextRetriever';

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
    const dependencyCount = graphData.edges.length;
    const importantFiles = parsedFiles.filter(f => f.exports.length > 0 || f.imports.length > 5).map(f => f.filePath).slice(0, 10);
    const summary = `Analyzed ${fileCount} files in ${repoName}. The codebase uses ${techStack.join(', ')} and shows strong modular design principles with ${dependencyCount} inter-module connections.`;

    const repo = await Repository.create({
      owner: req.user?.userId,
      repoName,
      repoUrl,
      techStack,
      summary,
      astAnalysis: parsedFiles,
      dependencyGraph: graphData,
      importantFiles,
      metrics: {
        fileCount,
        dependencyCount,
        complexityScore: Math.floor(dependencyCount / (fileCount || 1) * 10),
        averageHealth: Math.max(0, 100 - Math.floor(dependencyCount / (fileCount || 1) * 2)),
      }
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
    const repos = await Repository.find({ owner: req.user?.userId }).sort({ createdAt: -1 });
    res.status(200).json(repos);
  } catch (error) {
    console.error('[getRepos]', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

export const getRepoById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, owner: req.user?.userId });
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
    const repo = await Repository.findOne({ _id: req.params.id, owner: req.user?.userId });
    if (!repo) {
      res.status(404).json({ error: 'Repository not found' });
      return;
    }

    const { message = '' } = req.body;

    if (!message.trim()) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    // Save user message to history
    await ChatHistory.create({
      user: req.user?.userId,
      repository: repo._id,
      role: 'user',
      content: message
    });

    // Retrieve last 10 messages for context
    const history = await ChatHistory.find({ user: req.user?.userId, repository: repo._id })
      .sort({ createdAt: -1 })
      .limit(10);
      
    history.reverse();
    const historyContext = history.map(h => `${h.role}: ${h.content}`).join('\n');

    const relevantASTContext = getRelevantContext(message, repo);

    const contextContext = `Repository Name: ${repo.repoName}
Tech Stack: ${repo.techStack?.join(', ') || 'Unknown'}
Total Files: ${repo.metrics?.fileCount}
Summary: ${repo.summary}
Number of connections/edges in architecture graph: ${repo.metrics?.dependencyCount ?? 0}

${relevantASTContext}

Recent Conversation History:
${historyContext}
`;

    const response = await aiChatWithRepo(message, contextContext);

    // Save assistant message to history
    await ChatHistory.create({
      user: req.user?.userId,
      repository: repo._id,
      role: 'assistant',
      content: response
    });

    res.status(200).json({ response });
  } catch (error: any) {
    console.error('[chatWithRepo]', error);
    res.status(500).json({ error: error.message || 'Failed to process chat message' });
  }
};

export const deleteRepo = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const repo = await Repository.findOneAndDelete({ _id: id, owner: req.user?.userId });
    if (!repo) {
      res.status(404).json({ error: 'Repository not found' });
      return;
    }
    // Delete associated chat history
    await ChatHistory.deleteMany({ repository: id });
    res.status(200).json({ message: 'Repository deleted successfully' });
  } catch (error: any) {
    console.error('[deleteRepo]', error);
    res.status(500).json({ error: 'Failed to delete repository' });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const history = await ChatHistory.find({ repository: req.params.id, user: req.user?.userId })
      .sort({ createdAt: 1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('[getChatHistory]', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

export const clearChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await ChatHistory.deleteMany({ repository: req.params.id, user: req.user?.userId });
    res.status(200).json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('[clearChatHistory]', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};
