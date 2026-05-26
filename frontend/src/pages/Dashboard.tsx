import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';

export function Dashboard() {
  const { user, token } = useAuthStore();
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzeError, setAnalyzeError] = useState('');

  useEffect(() => {
    if (token) fetchRepos();
  }, [token]);

  const fetchRepos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/repos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRepos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    setIsAnalyzing(true);
    setAnalyzeError('');
    try {
      const res = await fetch('http://localhost:5000/api/repos/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ repoUrl }),
      });
      const newRepo = await res.json();
      if (res.ok) {
        setRepoUrl('');
        setRepos([newRepo, ...repos]);
      } else {
        setAnalyzeError(newRepo.error || 'Analysis failed');
      }
    } catch {
      setAnalyzeError('Failed to analyze repository');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:5000/api/repos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRepos(repos.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete repository', err);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen relative" style={{ background: '#0d1515' }}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 animated-grid" />
        <div className="pulse-layer absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: 'rgba(0,240,255,0.05)', filter: 'blur(150px)' }} />
        <div className="pulse-layer absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'rgba(87,27,193,0.05)', filter: 'blur(130px)', animationDelay: '-5s' }} />
      </div>

      <Navbar />

      <div className="pt-16 px-6 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-10"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-2xl" style={{ color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>waving_hand</span>
            <h1 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: '28px', letterSpacing: '-0.03em', color: '#dce4e5' }}>
              Welcome back, {user.username}
            </h1>
          </div>
          <p style={{ color: '#849495', fontSize: '14px', marginLeft: '36px' }}>
            Manage and analyze your repositories with AI-powered insights.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 pb-16">
          {/* ── Left Panel: Analyze ── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-panel rounded-2xl overflow-hidden sticky top-24"
            >
              {/* Top glow */}
              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,240,255,0.5), transparent)' }} />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
                    <span className="material-symbols-outlined" style={{ color: '#00f0ff', fontSize: '18px' }}>search</span>
                  </div>
                  <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '16px', color: '#dce4e5' }}>
                    Analyze New Repo
                  </h2>
                </div>
                <p style={{ color: '#849495', fontSize: '13px', marginBottom: '20px', lineHeight: 1.6 }}>
                  Paste a public GitHub repository URL to generate AI-powered insights.
                </p>

                <form onSubmit={handleAnalyze} className="space-y-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: '#849495' }}>link</span>
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/org/repo"
                      disabled={isAnalyzing}
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(8,15,16,0.8)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#dce4e5',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '12px',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(0,240,255,0.5)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.06)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {analyzeError && (
                    <p style={{ color: '#ffb4ab', fontSize: '12px' }}>{analyzeError}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isAnalyzing || !repoUrl}
                    whileHover={!isAnalyzing && repoUrl ? { scale: 1.01, boxShadow: '0 0 20px rgba(0,240,255,0.3)' } : {}}
                    whileTap={!isAnalyzing ? { scale: 0.97 } : {}}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
                    style={{
                      background: (!isAnalyzing && repoUrl) ? '#00f0ff' : 'rgba(0,240,255,0.3)',
                      color: '#00363a',
                      fontFamily: 'Geist, sans-serif',
                      fontSize: '12px',
                      letterSpacing: '0.08em',
                      cursor: (isAnalyzing || !repoUrl) ? 'not-allowed' : 'pointer',
                      boxShadow: (!isAnalyzing && repoUrl) ? '0 0 15px rgba(0,240,255,0.2)' : 'none',
                    }}
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="w-4 h-4 border-2 rounded-full animate-spin"
                          style={{ borderColor: 'rgba(0,54,58,0.3)', borderTopColor: '#003c3f' }} />
                        ANALYZING...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        ANALYZE REPOSITORY
                      </>
                    )}
                  </motion.button>
                </form>

                {isAnalyzing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
                    {['Cloning repository...', 'Running AST extraction...', 'Building dependency graph...'].map((step, i) => (
                      <div key={step} className="flex items-center gap-2" style={{ fontSize: '11px', color: '#849495' }}>
                        <span className="w-3 h-3 border border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin"
                          style={{ animationDelay: `${i * 150}ms` }} />
                        {step}
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Stats */}
                <div className="mt-6 pt-5 grid grid-cols-2 gap-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {[
                    { label: 'Repos Analyzed', value: repos.length },
                    { label: 'Avg Files', value: repos.length > 0 ? Math.round(repos.reduce((a, r) => a + (r.fileCount || 0), 0) / repos.length) : 0 },
                  ].map(stat => (
                    <div key={stat.label} className="text-center p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: '22px', color: '#00f0ff' }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '10px', color: '#849495', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Panel: Repo Cards ── */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="material-symbols-outlined" style={{ color: '#b9cacb' }}>folder_open</span>
              <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '16px', color: '#dce4e5' }}>
                Recent Repositories
              </h2>
              {repos.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff', fontFamily: 'Geist, sans-serif', fontWeight: 600 }}>
                  {repos.length}
                </span>
              )}
            </motion.div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse" style={{ height: '160px' }}>
                    <div className="h-4 rounded mb-3" style={{ background: 'rgba(255,255,255,0.05)', width: '60%' }} />
                    <div className="h-3 rounded mb-2" style={{ background: 'rgba(255,255,255,0.03)', width: '80%' }} />
                    <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', width: '40%' }} />
                  </div>
                ))}
              </div>
            ) : repos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-2xl flex flex-col items-center justify-center text-center py-20"
                style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: '#849495' }}>folder_off</span>
                </div>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '16px', color: '#b9cacb', marginBottom: '8px' }}>
                  No repositories yet
                </h3>
                <p style={{ color: '#849495', fontSize: '13px', maxWidth: '240px' }}>
                  Paste a GitHub URL on the left to analyze your first repository.
                </p>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {repos.map((repo, i) => (
                    <motion.div
                      key={repo._id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                      layout
                    >
                      <Link to={`/repo/${repo._id}`} style={{ textDecoration: 'none' }}>
                        <motion.div
                          whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                          className="glass-panel rounded-2xl p-5 h-full flex flex-col group cursor-pointer transition-all"
                          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.2)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)')}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.15)' }}>
                                <span className="material-symbols-outlined text-sm" style={{ color: '#00f0ff' }}>code</span>
                              </div>
                              <h3 className="truncate" style={{
                                fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '14px',
                                color: '#dce4e5', transition: 'color 0.2s',
                              }}
                                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#00f0ff')}
                                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#dce4e5')}
                              >
                                {repo.repoName}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={(e) => handleDelete(e, repo._id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                style={{ color: '#ff8a80' }}
                                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,138,128,0.1)')}
                                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                                title="Delete Scan"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                              <span className="material-symbols-outlined text-lg transition-colors"
                                style={{ color: '#849495' }}>
                                arrow_forward
                              </span>
                            </div>
                          </div>

                          {/* Tech stack */}
                          {repo.techStack?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {repo.techStack.slice(0, 4).map((tech: string) => (
                                <span key={tech} className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#b9cacb',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '10px',
                                  }}
                                >
                                  {tech}
                                </span>
                              ))}
                              {repo.techStack.length > 4 && (
                                <span style={{ fontSize: '10px', color: '#849495', padding: '0 4px', lineHeight: '20px' }}>
                                  +{repo.techStack.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="mt-auto flex items-center justify-between"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
                            <span className="flex items-center gap-1.5" style={{ color: '#849495', fontSize: '11px' }}>
                              <span className="material-symbols-outlined text-sm">description</span>
                              {repo.fileCount ?? '—'} files
                            </span>
                            <span style={{ color: '#849495', fontSize: '11px' }}>
                              {new Date(repo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Left accent border on hover */}
                          <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full transition-all group-hover:opacity-100 opacity-0"
                            style={{ background: '#00f0ff', boxShadow: '0 0 8px #00f0ff' }} />
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
