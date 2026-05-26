import { ParsedFile } from '../parsers/astParser';

export interface GraphNode {
  id: string;
  data: { label: string; type: string };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const generateGraphData = (parsedFiles: ParsedFile[]): GraphData => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const fileSet = new Set<string>();

  parsedFiles.forEach((file, index) => {
    nodes.push({
      id: file.filePath,
      data: { label: file.filePath.split('/').pop() || file.filePath, type: 'file' },
      position: { x: (index % 5) * 200, y: Math.floor(index / 5) * 150 },
    });
    fileSet.add(file.filePath);
  });

  parsedFiles.forEach(file => {
    let fileDir = file.filePath.substring(0, file.filePath.lastIndexOf('/'));
    if (!fileDir && file.filePath.indexOf('/') === -1) fileDir = '.';

    file.imports.forEach(imp => {
      let matchedTarget: string | null = null;

      if (imp.startsWith('.')) {
        // Resolve relative path
        const segments = fileDir === '.' ? [] : fileDir.split('/');
        for (const seg of imp.split('/')) {
          if (seg === '.') continue;
          if (seg === '..') segments.pop();
          else segments.push(seg);
        }
        const resolvedBase = segments.join('/');

        // Check possible extensions
        const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.ts', '/index.jsx', '/index.tsx'];
        for (const ext of extensions) {
          if (fileSet.has(resolvedBase + ext)) {
            matchedTarget = resolvedBase + ext;
            break;
          }
        }
      } else {
        // Resolve alias / absolute
        const importBase = imp.split('/').pop()?.replace(/\.(js|ts|jsx|tsx)$/, '');
        if (importBase) {
          const targets = Array.from(fileSet).filter(f => f.split('/').pop()?.replace(/\.(js|ts|jsx|tsx)$/, '') === importBase);
          if (targets.length > 0) matchedTarget = targets[0];
        }
      }

      if (matchedTarget && matchedTarget !== file.filePath) {
        // Avoid duplicate edges
        const edgeId = `e-${file.filePath}-${matchedTarget}`;
        if (!edges.some(e => e.id === edgeId)) {
          edges.push({
            id: edgeId,
            source: file.filePath,
            target: matchedTarget,
            animated: true,
          });
        }
      }
    });
  });

  return { nodes, edges };
};
