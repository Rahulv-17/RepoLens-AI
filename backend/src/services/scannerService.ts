import fs from 'fs';
import path from 'path';

const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', 'out', 'coverage'];
const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

export const scanDirectory = (dir: string): string[] => {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    
    if (stat && stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(path.basename(file))) {
        results = results.concat(scanDirectory(file));
      }
    } else {
      results.push(file);
    }
  });

  return results;
};
