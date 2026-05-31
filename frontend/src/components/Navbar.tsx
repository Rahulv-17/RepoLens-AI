import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

interface NavbarProps {
  /** Which nav item is currently active */
  active?: 'explorer' | 'search' | 'extensions' | 'ai' | 'none';
  /** Show repo breadcrumb in header */
  repoName?: string;
  /** Show search bar */
  showSearch?: boolean;
}

export function Navbar({ active = 'none', repoName, showSearch = false }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16"
      style={{
        background: 'rgba(13,21,21,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 1px 0 rgba(0,240,255,0.03)',
      }}
    >
      {/* Logo + Breadcrumb */}
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

        {/* Desktop nav links (landing page only) */}
        {!repoName && (
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {[
              { label: 'Explorer', key: 'explorer' },
              { label: 'Search', key: 'search' },
              { label: 'Extensions', key: 'extensions' },
              { label: 'AI Assistant', key: 'ai' },
            ].map((item) => (
              <span key={item.key}
                className="px-3 py-1 rounded-lg transition-colors cursor-pointer"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: active === item.key ? '#00f0ff' : '#b9cacb',
                  background: active === item.key ? 'rgba(0,240,255,0.05)' : 'transparent',
                  borderBottom: active === item.key ? '2px solid #00f0ff' : '2px solid transparent',
                  borderRadius: active === item.key ? '0' : undefined,
                }}
              >
                {item.label}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Search (optional) */}
      {showSearch && (
        <div className="flex-1 max-w-xl px-8 hidden md:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors"
              style={{ color: '#849495' }}>
              search
            </span>
            <input
              className="w-full py-2 pl-10 pr-4 text-sm rounded-lg focus:outline-none transition-all glow-focus"
              placeholder="Search files, symbols, or components..."
              style={{
                background: 'rgba(8,15,16,0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#dce4e5',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
              }}
            />
          </div>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full transition-colors"
          style={{ color: '#b9cacb' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
        <button className="p-2 rounded-full transition-colors"
          style={{ color: '#b9cacb' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        {user ? (
          <div className="flex items-center gap-3 ml-2">
            <Link to="/dashboard">
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ color: '#b9cacb', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Dashboard
              </button>
            </Link>
            <div className="w-8 h-8 rounded-full overflow-hidden border"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            >
              <div className="w-full h-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(0,240,255,0.15)', color: '#00f0ff' }}
              >
                {user.username[0].toUpperCase()}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#b9cacb',
                fontFamily: 'Geist, sans-serif',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              LOGOUT
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
  );
}
