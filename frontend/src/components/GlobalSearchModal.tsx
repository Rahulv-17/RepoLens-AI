import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      fetchRepos();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const fetchRepos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/repos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      }
    } catch (e) {
      console.error('Failed to fetch repos for search', e);
    }
  };

  const filteredItems = repos.filter(r => {
    const q = query.toLowerCase();
    const inName = r.repoName.toLowerCase().includes(q);
    const inTech = r.techStack?.some((t: string) => t.toLowerCase().includes(q));
    const inFiles = r.importantFiles?.some((f: string) => f.toLowerCase().includes(q));
    return inName || inTech || inFiles;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        navigate(`/repo/${filteredItems[selectedIndex]._id}`);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(25,33,34,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)'
          }}
        >
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,240,255,0.4), transparent)' }} />
          
          <div className="flex items-center px-4 py-3 border-b border-white/5">
            <span className="material-symbols-outlined text-xl mr-3" style={{ color: '#849495' }}>search</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search repositories, tech stacks, or important files..."
              className="flex-1 bg-transparent border-none outline-none text-base"
              style={{ color: '#dce4e5', fontFamily: "'JetBrains Mono', monospace" }}
            />
            <div className="flex gap-1 ml-3">
              <kbd className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: '#849495' }}>ESC</kbd>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center" style={{ color: '#849495' }}>
                No repositories found matching "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                {filteredItems.map((repo, i) => {
                  const selected = i === selectedIndex;
                  return (
                    <button
                      key={repo._id}
                      onClick={() => { navigate(`/repo/${repo._id}`); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-left"
                      style={{
                        background: selected ? 'rgba(0,240,255,0.08)' : 'transparent',
                        border: selected ? '1px solid rgba(0,240,255,0.2)' : '1px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <span className="material-symbols-outlined text-lg" style={{ color: selected ? '#00f0ff' : '#849495' }}>folder_open</span>
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold" style={{ color: '#dce4e5', fontFamily: 'Geist, sans-serif' }}>
                            {repo.repoName}
                          </div>
                          <div className="truncate text-xs mt-0.5" style={{ color: '#849495' }}>
                            {repo.techStack?.slice(0, 3).join(', ')} • {repo.metrics?.fileCount || 0} files
                          </div>
                        </div>
                      </div>
                      {selected && (
                        <span className="material-symbols-outlined flex-shrink-0 ml-4" style={{ color: '#00f0ff' }}>
                          arrow_forward
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-xs" style={{ color: '#849495' }}>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 font-sans">↑↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 font-sans">↵</kbd> to open</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
