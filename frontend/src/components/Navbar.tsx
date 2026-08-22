import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { ProfileModal } from './ProfileModal';

interface NavbarProps {
  active?: 'explorer' | 'search' | 'extensions' | 'ai' | 'none';
  repoName?: string;
  showSearch?: boolean;
}

export function Navbar({ repoName }: NavbarProps) {
  const { user } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16"
        style={{
          background: 'rgba(13,21,21,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 1px 0 rgba(0,240,255,0.03)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="RepoLens AI Logo" className="h-8 w-auto object-contain rounded-lg" />
            <span style={{
              fontFamily: 'Geist, sans-serif',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: '-0.02em',
              color: '#00f0ff',
            }}>
              RepoLens AI
            </span>
          </Link>

          {repoName && (
            <>
              <div className="h-4 w-px mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="flex items-center gap-2" style={{ color: '#849495', fontSize: '13px' }}>
                <span className="material-symbols-outlined text-sm">folder_open</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{repoName}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-4 ml-2">
              <Link to="/dashboard">
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ color: '#b9cacb', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Dashboard
                </button>
              </Link>
              
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 transition-all hover:scale-105"
                style={{ borderColor: 'rgba(0,240,255,0.4)', background: 'rgba(0,240,255,0.1)' }}
                title="Edit Profile"
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold"
                    style={{ color: '#00f0ff' }}
                  >
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>

            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login">
                <button className="px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: '#b9cacb' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold glow-cyan transition-all"
                  style={{
                    background: '#00f0ff',
                    color: '#00363a',
                    fontFamily: 'Geist, sans-serif',
                    letterSpacing: '0.04em',
                    fontSize: '12px',
                  }}
                >
                  GET STARTED
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </header>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
