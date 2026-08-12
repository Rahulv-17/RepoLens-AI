import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: 'easeOut' as const },
});

const features = [
  {
    icon: 'smart_toy',
    title: 'AI Repository Chat',
    desc: 'Interact with your codebase using natural language. Ask about architectural patterns, bug origins, or refactoring strategies across the entire project scope.',
    color: 'rgba(0,240,255,0.08)',
    border: 'rgba(0,240,255,0.15)',
    iconColor: '#00f0ff',
    span: 'md:col-span-8',
    large: true,
    decorIcon: 'forum',
  },
  {
    icon: 'account_tree',
    title: 'Dependency Graphs',
    desc: 'Visualize how modules interact. Trace imports and exports through a dynamic, interactive graph system.',
    color: 'rgba(208,188,255,0.08)',
    border: 'rgba(208,188,255,0.15)',
    iconColor: '#d0bcff',
    span: 'md:col-span-4',
    large: false,
  },
  {
    icon: 'architecture',
    title: 'AST Analysis',
    desc: 'Go beyond text search. Our engine parses Abstract Syntax Trees to understand context and intent in your functions.',
    color: 'rgba(254,214,57,0.08)',
    border: 'rgba(254,214,57,0.15)',
    iconColor: '#fed639',
    span: 'md:col-span-4',
    large: false,
  },
  {
    icon: 'layers',
    title: 'Tech Stack Detection',
    desc: 'Instantly identify frameworks, databases, and microservices. RepoLens automatically categorizes your project\'s DNA.',
    color: 'rgba(219,252,255,0.05)',
    border: 'rgba(219,252,255,0.12)',
    iconColor: '#dbfcff',
    span: 'md:col-span-8',
    large: false,
    techPills: ['Next.js', 'TypeScript', 'TailwindCSS', 'PostgreSQL', 'Prisma', 'Redis'],
  },
];

export function LandingPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) navigate('/signup');
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0d1515' }}>
      {/* Material Icons font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Navbar />

      {/* ── Background Atmosphere ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 animated-grid" />
        <div className="pulse-layer absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'rgba(0,240,255,0.07)', filter: 'blur(120px)' }} />
        <div className="pulse-layer absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: 'rgba(87,27,193,0.07)', filter: 'blur(150px)', animationDelay: '-4s' }} />
      </div>

      <main className="relative pt-16">
        {/* ══════════════════ HERO ══════════════════ */}
        <section className="min-h-[88vh] flex flex-col items-center justify-center px-6 py-24 text-center">
          {/* Badge */}
          <motion.div {...fadeUp(0.1)}
            className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{
              border: '1px solid rgba(0,240,255,0.25)',
              background: 'rgba(0,240,255,0.05)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="material-symbols-outlined text-base" style={{ color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span style={{
              fontFamily: 'Geist, sans-serif', fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.08em', color: '#00f0ff', textTransform: 'uppercase',
            }}>
              New: AST-Based Navigation
            </span>
          </motion.div>

          {/* Hero Heading */}
          <motion.h1 {...fadeUp(0.2)}
            className="max-w-4xl mb-6"
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: 'clamp(40px, 7vw, 72px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(to bottom, #ffffff 30%, rgba(255,255,255,0.55))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Understand any codebase in seconds
          </motion.h1>

          {/* Sub */}
          <motion.p {...fadeUp(0.3)}
            className="max-w-2xl mb-12 text-lg"
            style={{ color: '#b9cacb', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}
          >
            RepoLens AI transforms complex repositories into structured knowledge. Get deep architectural insights, dependency maps, and instant logic explanations powered by Obsidian Intelligence.
          </motion.p>

          {/* ── Analysis Input Box ── */}
          <motion.div {...fadeUp(0.4)} className="w-full max-w-2xl">
            <form onSubmit={handleAnalyze}>
              <div className="flex flex-col md:flex-row gap-3 p-2 rounded-xl shadow-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex-1 flex items-center px-4 gap-3 rounded-lg transition-all group glow-focus"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="material-symbols-outlined" style={{ color: '#849495', fontSize: '20px' }}>link</span>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/facebook/react"
                    className="w-full bg-transparent border-none outline-none py-4"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '14px',
                      color: '#dce4e5',
                    }}
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,240,255,0.35)' }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg transition-all"
                  style={{
                    background: '#00f0ff',
                    color: '#00363a',
                    fontFamily: 'Geist, sans-serif',
                    fontWeight: 600,
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    boxShadow: '0 0 15px rgba(0,240,255,0.25)',
                  }}
                >
                  ANALYZE
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                </motion.button>
              </div>
            </form>

            {/* Trust badges */}
            <motion.div {...fadeUp(0.5)} className="mt-6 flex flex-wrap items-center justify-center gap-6" style={{ color: 'rgba(185,202,203,0.5)' }}>
              {['Public Repos', 'Private Access', 'No Indexing Lag'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ color: 'rgba(0,240,255,0.5)' }}>check_circle</span>
                  <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════════════ BENTO FEATURE GRID ══════════════════ */}
        <section className="px-6 py-24" style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -2 }}
                className={`${f.span} glass-panel rounded-xl relative overflow-hidden group cursor-default`}
                style={{ padding: '32px' }}
              >
                {/* Feature icon */}
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: f.color, border: `1px solid ${f.border}` }}
                >
                  <span className="material-symbols-outlined" style={{ color: f.iconColor }}>{f.icon}</span>
                </div>

                <h3 style={{
                  fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '20px',
                  letterSpacing: '-0.02em', color: '#dce4e5', marginBottom: '12px',
                }}>
                  {f.title}
                </h3>
                <p style={{ color: '#b9cacb', fontSize: '15px', lineHeight: 1.65, maxWidth: '480px' }}>
                  {f.desc}
                </p>

                {/* Tech pills for tech stack card */}
                {f.techPills && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {f.techPills.map(tech => (
                      <span key={tech} className="px-3 py-1 rounded text-xs"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          fontFamily: "'JetBrains Mono', monospace",
                          color: '#b9cacb',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Large card decorative icon */}
                {f.large && (
                  <>
                    <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
                      style={{ background: 'linear-gradient(to left, rgba(0,240,255,0.04), transparent)' }} />
                    <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                      <span className="material-symbols-outlined" style={{ fontSize: '200px', color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>
                        {f.decorIcon}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════ DEMO SECTION ══════════════════ */}
        <section className="py-24" style={{ background: 'rgba(21,29,30,0.5)' }}>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Graph Preview */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
                {/* Window chrome */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,95,87,0.5)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(254,188,46,0.5)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(0,240,255,0.4)' }} />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'rgba(185,202,203,0.4)' }}>
                    repolens-ui/GraphView.tsx
                  </span>
                </div>
                {/* Graph canvas preview */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <div className="absolute inset-0 fine-grid opacity-30" />
                  <div className="absolute inset-0 dot-overlay" />
                  {/* Simulated graph nodes */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 360">
                    {/* Edges */}
                    {[
                      [300,180,150,100],[300,180,450,100],[300,180,120,260],[300,180,480,260],[300,180,300,290],
                      [150,100,80,200],[150,100,220,200],[450,100,380,200],[450,100,520,200],
                    ].map(([x1,y1,x2,y2], i) => (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="rgba(0,240,255,0.12)" strokeWidth="1" />
                    ))}
                    {/* Nodes */}
                    {[
                      [300,180,'main.ts','#00f0ff',true],
                      [150,100,'auth.service.ts','#d0bcff',false],
                      [450,100,'api.client.ts','#d0bcff',false],
                      [120,260,'utils.ts','#849495',false],
                      [480,260,'logger.ts','#849495',false],
                      [300,290,'config.ts','#849495',false],
                      [80,200,'user.entity.ts','#849495',false],
                      [220,200,'router.ts','#849495',false],
                      [380,200,'schema.json','#849495',false],
                      [520,200,'types.ts','#849495',false],
                    ].map(([cx, cy, label, color, isMain], i) => (
                      <g key={i}>
                        {isMain && (
                          <circle cx={cx as number} cy={cy as number} r="28"
                            fill={`rgba(0,240,255,0.08)`} stroke="rgba(0,240,255,0.3)" strokeWidth="1" />
                        )}
                        <rect
                          x={(cx as number) - 52} y={(cy as number) - 16}
                          width="104" height="32" rx="8"
                          fill={isMain ? 'rgba(25,33,34,0.95)' : 'rgba(13,21,21,0.8)'}
                          stroke={color as string} strokeWidth={isMain ? 1.5 : 0.8} strokeOpacity={isMain ? 0.6 : 0.25}
                        />
                        <text x={cx as number} y={(cy as number) + 5}
                          textAnchor="middle" fill="#dce4e5"
                          fontSize={isMain ? 10 : 9} fontFamily="JetBrains Mono"
                          fillOpacity={isMain ? 1 : 0.7}
                        >
                          {label as string}
                        </text>
                      </g>
                    ))}
                  </svg>
                  {/* Status overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="glass-panel rounded-xl px-5 py-3 flex items-center gap-3"
                      style={{ boxShadow: '0 0 20px rgba(0,240,255,0.15)' }}
                    >
                      <span className="material-symbols-outlined" style={{ color: '#00f0ff' }}>hub</span>
                      <span style={{
                        fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600,
                        letterSpacing: '0.06em', color: '#00f0ff', textTransform: 'uppercase',
                      }}>
                        Mapping Dependencies... 84%
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="order-1 lg:order-2 space-y-8"
            >
              <div>
                <span style={{
                  fontFamily: 'Geist, sans-serif', fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.12em', color: '#c4abff', textTransform: 'uppercase',
                }}>
                  Interactive Experience
                </span>
                <h2 style={{
                  fontFamily: 'Geist, sans-serif', fontWeight: 700,
                  fontSize: 'clamp(32px, 4.5vw, 52px)',
                  lineHeight: 1.1, letterSpacing: '-0.03em', color: '#dce4e5', marginTop: '12px',
                }}>
                  Insight at the speed of thought
                </h2>
                <p className="mt-4" style={{ color: '#b9cacb', lineHeight: 1.7, fontSize: '15px' }}>
                  Our AI doesn't just read code—it understands the intent behind every line. Context-aware analysis allows you to navigate large-scale enterprise projects as if you wrote them yourself.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: 'speed', color: '#00f0ff', title: 'Sub-second indexing', desc: 'Real-time processing for repositories up to 500k lines.' },
                  { icon: 'security', color: '#d0bcff', title: 'Enterprise-grade isolation', desc: 'Your code never leaves our secure volatile instances.' },
                ].map(item => (
                  <motion.div key={item.title} whileHover={{ x: 4 }}
                    className="flex items-start gap-4 p-4 glass-panel rounded-xl transition-colors"
                    style={{ cursor: 'default' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
                  >
                    <span className="material-symbols-outlined p-2 rounded-xl"
                      style={{ color: item.color, background: `${item.color}15`, fontSize: '20px' }}>
                      {item.icon}
                    </span>
                    <div>
                      <h4 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, color: '#dce4e5', fontSize: '15px' }}>
                        {item.title}
                      </h4>
                      <p style={{ color: '#b9cacb', fontSize: '13px', marginTop: '2px' }}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════ CTA SECTION ══════════════════ */}
        <section className="py-24 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto glass-panel rounded-3xl text-center relative overflow-hidden"
            style={{ padding: '64px' }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.07) 0%, transparent 50%, rgba(87,27,193,0.07) 100%)' }} />

            <h2 style={{
              fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)',
              letterSpacing: '-0.03em', color: '#dce4e5', lineHeight: 1.2, marginBottom: '16px',
            }}>
              Ready to decode your future?
            </h2>
            <p style={{ color: '#b9cacb', fontSize: '15px', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.7 }}>
              Join thousands of developers using RepoLens AI to master their codebases. Start for free on any public repository.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(0,240,255,0.3)' }}
                  whileTap={{ scale: 0.96 }}
                  className="px-10 py-4 rounded-xl font-semibold"
                  style={{
                    background: '#00f0ff', color: '#00363a',
                    fontFamily: 'Geist, sans-serif', fontSize: '13px', letterSpacing: '0.06em',
                    boxShadow: '0 0 15px rgba(0,240,255,0.2)',
                  }}
                >
                  GET STARTED FREE
                </motion.button>
              </Link>
              <a href="mailto:sales@repolens.ai">
                <motion.button
                  whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 rounded-xl font-medium transition-colors"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#dce4e5',
                    fontFamily: 'Geist, sans-serif', fontSize: '13px', letterSpacing: '0.06em',
                  }}
                >
                  Contact Sales
                </motion.button>
              </a>

            </div>
          </motion.div>
        </section>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#080f10', padding: '48px 24px' }}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="RepoLens AI Logo" className="h-6 w-auto object-contain rounded-sm" />
                <span style={{ fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: '15px', color: '#00f0ff' }}>
                  RepoLens AI
                </span>
              </div>
              <p style={{ color: '#849495', fontSize: '13px', lineHeight: 1.6, maxWidth: '200px', marginBottom: '20px' }}>
                Decode any codebase in seconds with AI-powered analysis.
              </p>
              <div className="flex gap-3 mt-6">
                <a href="https://www.instagram.com/being.rahulistic/" target="_blank" rel="noreferrer" 
                   className="p-2.5 rounded-full transition-colors flex items-center justify-center h-10 w-10"
                   style={{ background: 'rgba(255,255,255,0.03)', color: '#b9cacb', border: '1px solid rgba(255,255,255,0.05)' }}
                   onMouseEnter={e => { (e.currentTarget.style.color = '#00f0ff'); (e.currentTarget.style.borderColor = '#00f0ff'); }}
                   onMouseLeave={e => { (e.currentTarget.style.color = '#b9cacb'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'); }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://www.linkedin.com/in/rahulvaddi/" target="_blank" rel="noreferrer" 
                   className="p-2.5 rounded-full transition-colors flex items-center justify-center h-10 w-10"
                   style={{ background: 'rgba(255,255,255,0.03)', color: '#b9cacb', border: '1px solid rgba(255,255,255,0.05)' }}
                   onMouseEnter={e => { (e.currentTarget.style.color = '#00f0ff'); (e.currentTarget.style.borderColor = '#00f0ff'); }}
                   onMouseLeave={e => { (e.currentTarget.style.color = '#b9cacb'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'); }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://github.com/Rahulv-17" target="_blank" rel="noreferrer" 
                   className="p-2.5 rounded-full transition-colors flex items-center justify-center h-10 w-10"
                   style={{ background: 'rgba(255,255,255,0.03)', color: '#b9cacb', border: '1px solid rgba(255,255,255,0.05)' }}
                   onMouseEnter={e => { (e.currentTarget.style.color = '#00f0ff'); (e.currentTarget.style.borderColor = '#00f0ff'); }}
                   onMouseLeave={e => { (e.currentTarget.style.color = '#b9cacb'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'); }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
              </div>
            </div>
            {[
              { title: 'Product', links: ['Explorer', 'Dependency Graph', 'AI Chat', 'Changelog'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Blog', 'Status'] },
              { title: 'Company', links: ['About', 'Privacy', 'Terms', 'Contact'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{
                  fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '11px',
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: '#849495', marginBottom: '16px',
                }}>
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" style={{ color: '#b9cacb', fontSize: '13px', textDecoration: 'none' }}
                        onMouseEnter={e => ((e.target as HTMLElement).style.color = '#00f0ff')}
                        onMouseLeave={e => ((e.target as HTMLElement).style.color = '#b9cacb')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ color: '#849495', fontSize: '12px' }}>© 2026 RepoLens AI. All rights reserved.</p>
            <p style={{ color: '#849495', fontSize: '12px' }}>Made by Rahul Vaddi , For developers.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
