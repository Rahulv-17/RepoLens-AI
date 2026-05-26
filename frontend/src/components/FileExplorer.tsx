import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileNode {
  id: string;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  ext: string;
}

function buildTree(nodes: FileNode[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  // Sort so folders come first
  const sorted = [...nodes].sort((a, b) => {
    const aDepth = (a.id.match(/\//g) || []).length;
    const bDepth = (b.id.match(/\//g) || []).length;
    return aDepth - bDepth;
  });

  sorted.forEach(node => {
    const parts = node.id.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const path = parts.slice(0, i + 1).join('/');
      const isLast = i === parts.length - 1;

      let existing = map.get(path);
      if (!existing) {
        const ext = part.includes('.') ? part.split('.').pop()! : '';
        existing = {
          name: part,
          path,
          isFolder: !isLast,
          children: [],
          ext,
        };
        map.set(path, existing);
        current.push(existing);
      }
      if (!isLast) {
        existing.isFolder = true;
        current = existing.children;
      }
    }
  });

  return root;
}

function getFileColor(ext: string): string {
  const map: Record<string, string> = {
    ts: '#60a5fa', tsx: '#60a5fa', js: '#fbbf24', jsx: '#fbbf24',
    json: '#34d399', css: '#a78bfa', scss: '#a78bfa', html: '#f87171',
    md: '#9ca3af', py: '#34d399', go: '#60a5fa', rs: '#f97316',
    env: '#fbbf24', yml: '#34d399', yaml: '#34d399',
  };
  return map[ext.toLowerCase()] || '#849495';
}

function FileIcon({ ext, isFolder, isOpen }: { ext: string; isFolder: boolean; isOpen: boolean }) {
  if (isFolder) {
    return (
      <span className="material-symbols-outlined text-base"
        style={{ color: isOpen ? '#fbbf24' : '#d97706', fontVariationSettings: `'FILL' ${isOpen ? 1 : 0}` }}>
        {isOpen ? 'folder_open' : 'folder'}
      </span>
    );
  }
  return (
    <span className="material-symbols-outlined text-base" style={{ color: getFileColor(ext) }}>
      description
    </span>
  );
}

function TreeItem({
  node, depth, activeFile, onSelect,
}: {
  node: TreeNode;
  depth: number;
  activeFile: string;
  onSelect: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(depth < 1);

  const isActive = activeFile === node.path;

  return (
    <div>
      <div
        onClick={() => {
          if (node.isFolder) setIsOpen(v => !v);
          else onSelect(node.path);
        }}
        className="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer group transition-all select-none"
        style={{
          paddingLeft: `${8 + depth * 16}px`,
          background: isActive ? 'rgba(0,240,255,0.08)' : 'transparent',
          borderRight: isActive ? '2px solid #00f0ff' : '2px solid transparent',
          color: isActive ? '#00f0ff' : '#b9cacb',
        }}
        onMouseEnter={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.color = '#00f0ff';
        }}
        onMouseLeave={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.color = '#b9cacb';
        }}
      >
        {node.isFolder && (
          <span className="material-symbols-outlined text-xs" style={{ color: '#849495', transition: 'transform 0.2s', transform: isOpen ? 'rotate(0)' : 'rotate(-90deg)' }}>
            keyboard_arrow_down
          </span>
        )}
        {!node.isFolder && <span className="w-4" />}
        <FileIcon ext={node.ext} isFolder={node.isFolder} isOpen={isOpen} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {node.name}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {node.isFolder && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {node.children.map(child => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FileExplorer({ nodes }: { nodes: FileNode[] }) {
  const [activeFile, setActiveFile] = useState('');
  const tree = useMemo(() => buildTree(nodes), [nodes]);

  if (!nodes || nodes.length === 0) {
    return (
      <p style={{ color: '#849495', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
        No files detected.
      </p>
    );
  }

  return (
    <div className="custom-scrollbar overflow-y-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="mb-3 px-2">
        <span style={{
          fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'rgba(132,148,149,0.5)', fontFamily: 'Geist, sans-serif', fontWeight: 600,
        }}>
          File Tree
        </span>
      </div>
      {tree.map(node => (
        <TreeItem
          key={node.path}
          node={node}
          depth={0}
          activeFile={activeFile}
          onSelect={setActiveFile}
        />
      ))}
      {nodes.length > 200 && (
        <p className="px-3 mt-2" style={{ color: '#849495', fontSize: '10px', fontStyle: 'italic' }}>
          +{nodes.length - 200} more files not shown
        </p>
      )}
    </div>
  );
}
