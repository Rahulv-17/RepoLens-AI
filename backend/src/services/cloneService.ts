import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import os from 'os';

export const cloneRepository = async (repoUrl: string): Promise<string> => {
  const git = simpleGit();
  const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repo';
  const timestamp = Date.now();
  const targetDir = path.join(os.tmpdir(), `repolens_${repoName}_${timestamp}`);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    await git.clone(repoUrl, targetDir);
    return targetDir;
  } catch (error) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    throw new Error('Failed to clone repository. Make sure the URL is public and valid.');
  }
};

export const cleanupRepository = (targetDir: string): void => {
  try {
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`Failed to cleanup directory: ${targetDir}`, error);
  }
};
