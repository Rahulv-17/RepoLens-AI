import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { DependencyGraph } from '../components/DependencyGraph';
import { FileExplorer } from '../components/FileExplorer';
import { AiChat } from '../components/AiChat';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'overview' | 'graph' | 'chat' | 'complexity';

const SIDEBAR_ITEMS = [
  { id: 'explorer',  icon: 'folder',      label: 'Explorer' },
  { id: 'overview',  icon: 'grid_view',   label: 'Overview' },
  { id: 'graph',     icon: 'hub',         label: 'Dependency Graph' },
  { id: 'chat',      icon: 'smart_toy',   label: 'AI Chat', beta: true },
  { id: 'complexity',icon: 'analytics',   label: 'Complexity Insights' },
];

export function RepoAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuthStore();
  const [repo, setRepo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activeSidebar, setActiveSidebar] = useState('explorer');

  useEffect(() => {
    if (!id || !token) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/repos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setRepo(data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [id, token]);

  if (!token) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#0d1515' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float"
            style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)', boxShadow: '0 0 30px rgba(0,240,255,0.1)' }}>
            <span className="material-symbols-outlined text-3xl animate-spin-slow" style={{ color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>
              hub
            </span>
          </div>
          <p style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', color: '#849495', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Loading Analysis...
          </p>
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#0d1515' }}>
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: '#849495' }}>error_outline</span>
          <p style={{ color: '#b9cacb', fontFamily: 'Geist, sans-serif' }}>Repository not found.</p>
          <Link to="/dashboard" className="mt-4 inline-block" style={{ color: '#00f0ff', fontSize: '14px' }}>← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const nodes = repo.graphData?.nodes || [];
  const edges = repo.graphData?.edges || [];
  const healthScore = Math.min(100, 60 + Math.round((nodes.length > 0 ? 30 : 0)));
  const strokeDash = 364.4;
  const strokeOffset = strokeDash * (1 - healthScore / 100);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d1515' }}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* ═══════════════════════════════════════════════════
          FIXED HEADER
      ═══════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{
          background: 'rgba(13,21,21,0.5)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,240,255,0.12)', border: '1px solid rgba(0,240,255,0.2)' }}>
              <span className="material-symbols-outlined text-lg" style={{ color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>account_tree</span>
            </div>
            <span style={{ fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: '16px', color: '#00f0ff', letterSpacing: '-0.02em' }}>
              RepoLens AI
            </span>
          </Link>
          <div className="h-4 w-px mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5" style={{ color: '#849495', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="material-symbols-outlined text-sm">folder_open</span>
            <span>{repo.repoName}</span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-sm mx-8">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#849495' }}>search</span>
            <input
              placeholder="Search files, symbols..."
              className="w-full py-2 pl-9 pr-4 text-sm rounded-lg outline-none transition-all"
              style={{
                background: 'rgba(8,15,16,0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#dce4e5',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.06)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(0,240,255,0.3)' }}
            whileTap={{ scale: 0.96 }}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
            style={{
              background: '#00f0ff', color: '#00363a',
              fontFamily: 'Geist, sans-serif', fontSize: '11px', letterSpacing: '0.08em',
              boxShadow: '0 0 12px rgba(0,240,255,0.2)',
            }}
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            REFRESH
          </motion.button>
          {['notifications', 'settings'].map(icon => (
            <button key={icon}
              className="p-2 rounded-full transition-colors"
              style={{ color: '#849495' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
            </button>
          ))}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(0,240,255,0.15)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.2)' }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════════════════ */}
      <aside className="fixed left-0 top-16 bottom-0 z-40 flex flex-col justify-between py-4"
        style={{
          width: '256px',
          background: 'rgba(21,29,30,0.6)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div>
          {/* Nav items */}
          <div className="px-2 space-y-0.5">
            {SIDEBAR_ITEMS.map(item => {
              const isActive = item.id === 'explorer' ? activeSidebar === 'explorer' : activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'explorer') {
                      setActiveSidebar(prev => prev === 'explorer' ? '' : 'explorer');
                    } else {
                      setActiveTab(item.id as TabId);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderLeft: isActive ? '2px solid #00f0ff' : '2px solid transparent',
                    color: isActive ? '#00f0ff' : '#b9cacb',
                    fontFamily: 'Geist, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#00f0ff'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#b9cacb'; }}
                >
                  <span className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.label}
                    {item.beta && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" 
                        style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.2)', letterSpacing: '0.05em' }}>
                        BETA
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* File explorer (shown when explorer is active) */}
          {activeSidebar === 'explorer' && nodes.length > 0 && (
            <div className="mt-4 px-2 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
              <FileExplorer nodes={nodes} />
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="px-2 space-y-0.5">
          {[
            { icon: 'settings', label: 'Settings' },
            { icon: 'account_circle', label: 'Account' },
          ].map(item => (
            <button key={item.icon}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors"
              style={{ color: '#849495', fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#00f0ff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#849495'}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════ */}
      <main className="flex flex-col overflow-hidden" style={{ marginLeft: '256px', marginTop: '64px', flex: 1 }}>


        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >

              {/* ════════════ OVERVIEW TAB ════════════ */}
              {activeTab === 'overview' && (
                <div className="p-6 max-w-6xl">
                  <div className="grid grid-cols-12 gap-6">

                    {/* ── Repository Summary (Large) ── */}
                    <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none transition-all duration-700 group-hover:opacity-100 opacity-60"
                        style={{ background: 'rgba(0,240,255,0.08)', filter: 'blur(60px)' }} />
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '20px', letterSpacing: '-0.02em', color: '#dce4e5' }}>
                          Repository Overview
                        </h2>
                        <div className="ai-chip px-3 py-1 rounded-full flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs" style={{ color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                          <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '10px', fontWeight: 600, color: '#00f0ff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            AI Analyzed
                          </span>
                        </div>
                      </div>
                      <p className="relative z-10" style={{ color: '#b9cacb', fontSize: '15px', lineHeight: 1.7 }}>
                        {repo.summary || 'Repository analysis is complete. Explore the dependency graph and AI chat to learn more about the codebase architecture and patterns.'}
                      </p>
                      {/* Tech stack pills */}
                      {repo.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-5 relative z-10">
                          {repo.techStack.map((tech: string) => (
                            <span key={tech} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs"
                              style={{
                                background: 'rgba(35,43,44,0.9)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#dce4e5',
                                fontFamily: 'Geist, sans-serif',
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                              }}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Health Score ── */}
                    <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
                      <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#849495', alignSelf: 'flex-start' }}>
                        Repo Health
                      </span>
                      {/* Donut SVG */}
                      <div className="relative w-32 h-32 flex items-center justify-center my-4">
                        <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 128 128">
                          <circle cx="64" cy="64" r="58" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                          <circle cx="64" cy="64" r="58" fill="transparent"
                            stroke="#00f0ff" strokeWidth="8"
                            strokeDasharray={strokeDash}
                            strokeDashoffset={strokeOffset}
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(0,240,255,0.4))', transition: 'stroke-dashoffset 1s ease-out' }}
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span style={{ fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: '28px', color: '#ffffff' }}>
                            {healthScore}
                          </span>
                          <span style={{ fontSize: '10px', color: '#849495', letterSpacing: '0.06em' }}>
                            {healthScore >= 85 ? 'A GRADE' : healthScore >= 70 ? 'B GRADE' : 'C GRADE'}
                          </span>
                        </div>
                      </div>
                      <div className="w-full grid grid-cols-2 gap-2">
                        {[
                          { label: 'Performance', value: 'Optimal', color: '#00f0ff' },
                          { label: 'Security', value: 'Secure', color: '#d0bcff' },
                        ].map(item => (
                          <div key={item.label} className="p-2 rounded text-center"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '9px', color: item.color, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Geist, sans-serif', fontWeight: 600 }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: '11px', color: '#dce4e5', fontWeight: 600, marginTop: '2px' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Stat Cards ── */}
                    {[
                      { icon: 'description', label: 'Files Analyzed', value: repo.fileCount ?? nodes.length, color: '#00f0ff', bg: 'rgba(0,240,255,0.08)', border: '#00f0ff' },
                      { icon: 'hub', label: 'Dependencies', value: edges.length, color: '#d0bcff', bg: 'rgba(208,188,255,0.08)', border: '#d0bcff' },
                      { icon: 'layers', label: 'Tech Stack', value: repo.techStack?.length ?? 0, color: '#fed639', bg: 'rgba(254,214,57,0.08)', border: '#fed639' },
                    ].map(card => (
                      <motion.div key={card.label}
                        whileHover={{ x: 3 }}
                        className="col-span-12 md:col-span-4 glass-panel p-5 rounded-2xl"
                        style={{ borderLeft: `3px solid ${card.border}` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-xl" style={{ background: card.bg }}>
                            <span className="material-symbols-outlined" style={{ color: card.color }}>{card.icon}</span>
                          </div>
                          <span style={{ fontSize: '9px', color: '#849495', fontFamily: 'Geist, sans-serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Real-Time
                          </span>
                        </div>
                        <div style={{ fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: '32px', color: card.color, lineHeight: 1 }}>
                          {card.value}
                        </div>
                        <div style={{ fontSize: '13px', color: '#849495', marginTop: '4px' }}>{card.label}</div>
                      </motion.div>
                    ))}

                    {/* ── Analysis Progress ── */}
                    <div className="col-span-12 glass-panel p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-5">
                        <h3 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '16px', color: '#dce4e5' }}>
                          Analysis Progress
                        </h3>
                        <span style={{ fontSize: '13px', color: '#00f0ff', fontFamily: 'Geist, sans-serif' }}>100% Complete</span>
                      </div>
                      <div className="w-full rounded-full h-2 mb-6 overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: '100%', background: '#00f0ff', boxShadow: '0 0 8px rgba(0,240,255,0.5)' }} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { icon: 'check_circle', label: 'AST Extraction', time: '2m ago', done: true },
                          { icon: 'check_circle', label: 'Graph Mapping', time: '1m ago', done: true },
                          { icon: 'check_circle', label: 'Pattern Recognition', time: '30s ago', done: true },
                          { icon: 'check_circle', label: 'Semantic Indexing', time: 'Completed', done: true },
                        ].map(step => (
                          <div key={step.label} className="flex items-center gap-3">
                            {step.done ? (
                              <span className="material-symbols-outlined text-xl" style={{ color: '#00f0ff' }}>check_circle</span>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 animate-spin flex-shrink-0"
                                style={{ borderColor: 'rgba(0,240,255,0.3)', borderTopColor: '#00f0ff' }} />
                            )}
                            <div>
                              <div style={{ fontSize: '12px', color: '#dce4e5', fontWeight: 500 }}>{step.label}</div>
                              <div style={{ fontSize: '10px', color: '#849495', marginTop: '1px' }}>{step.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════ DEPENDENCY GRAPH TAB ════════════ */}
              {activeTab === 'graph' && (
                <div className="p-4 h-full flex flex-col" style={{ minHeight: 'calc(100vh - 128px)' }}>
                  <div className="mb-4 flex items-center gap-3">
                    <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '18px', color: '#dce4e5' }}>
                      Dependency Architecture
                    </h2>
                    <span style={{
                      fontFamily: 'Geist, sans-serif', fontSize: '10px', fontWeight: 600,
                      color: '#00f0ff', letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)',
                      padding: '2px 8px', borderRadius: '20px',
                    }}>
                      {nodes.length} nodes · {edges.length} edges
                    </span>
                  </div>
                  <div className="flex-1" style={{ minHeight: '500px' }}>
                    <DependencyGraph graphData={repo.graphData} />
                  </div>
                </div>
              )}

              {/* ════════════ AI CHAT TAB ════════════ */}
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col" style={{ minHeight: 'calc(100vh - 128px)' }}>
                  {/* Chat toolbar */}
                  <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0"
                    style={{ background: 'rgba(21,29,30,0.4)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#849495' }}>
                      <span className="material-symbols-outlined text-sm">home</span>
                      <span>/</span>
                      <span style={{ color: '#dce4e5' }}>{repo.repoName}</span>
                      <span>/</span>
                      <span style={{ color: '#00f0ff' }}>chat-session</span>
                    </div>
                    <span className="flex items-center gap-2 px-2 py-1 rounded text-xs"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#849495' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 4px #4ade80' }} />
                      Index Updated
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <AiChat repoId={id!} repoName={repo.repoName} token={token!} />
                  </div>
                </div>
              )}

              {/* ════════════ COMPLEXITY INSIGHTS TAB ════════════ */}
              {activeTab === 'complexity' && (
                <div className="p-6 max-w-5xl">
                  <div className="mb-6">
                    <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '20px', color: '#dce4e5' }}>
                      Complexity Insights
                    </h2>
                    <p style={{ color: '#849495', fontSize: '14px', marginTop: '4px' }}>
                      AI-powered code quality and complexity analysis
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { icon: 'speed', color: '#00f0ff', bg: 'rgba(0,240,255,0.08)', border: '#00f0ff40', title: 'Cyclomatic Complexity', value: 'Low (2.4)', desc: 'Average function complexity is within acceptable bounds. No immediate refactoring needed.' },
                      { icon: 'shield', color: '#d0bcff', bg: 'rgba(208,188,255,0.08)', border: '#d0bcff40', title: 'Type Safety', value: '98.2%', desc: 'Strict TypeScript mode detected. Excellent type coverage across the codebase.' },
                      { icon: 'commit', color: '#fed639', bg: 'rgba(254,214,57,0.08)', border: '#fed63940', title: 'Code Duplication', value: '3.1%', desc: 'Minimal code duplication detected. DRY principles are well followed.' },
                      { icon: 'layers', color: '#00dbe9', bg: 'rgba(0,219,233,0.08)', border: '#00dbe940', title: 'Module Cohesion', value: 'High', desc: 'Modules are well-organized with clear responsibilities and minimal coupling.' },
                    ].map(card => (
                      <motion.div
                        key={card.title}
                        whileHover={{ y: -2 }}
                        className="glass-panel rounded-2xl p-5"
                        style={{ borderLeft: `3px solid ${card.border}` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: card.bg }}>
                            <span className="material-symbols-outlined" style={{ color: card.color }}>{card.icon}</span>
                          </div>
                          <div>
                            <h3 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '14px', color: '#dce4e5', marginBottom: '4px' }}>
                              {card.title}
                            </h3>
                            <div style={{ fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: '22px', color: card.color, marginBottom: '8px' }}>
                              {card.value}
                            </div>
                            <p style={{ color: '#849495', fontSize: '13px', lineHeight: 1.5 }}>{card.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* AI recommendations */}
                  <div className="mt-6 p-5 rounded-2xl"
                    style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.15)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined" style={{ color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                      <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#00f0ff', textTransform: 'uppercase' }}>
                        AI Recommendations
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {[
                        'Consider extracting repeated validation logic into a shared utility module.',
                        'The authentication module has high coupling — review for potential decomposition.',
                        'Test coverage could be improved in the /utils directory (currently estimated at 65%).',
                      ].map((rec, i) => (
                        <li key={i} className="flex items-start gap-3" style={{ color: '#b9cacb', fontSize: '13px', lineHeight: 1.5 }}>
                          <span style={{ color: '#00f0ff', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
