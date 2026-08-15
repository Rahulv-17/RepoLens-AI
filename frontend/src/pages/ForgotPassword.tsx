import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || cooldown > 0) return;

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      setMessage(data.message || 'If an account exists, a reset link has been sent.');
      setCooldown(30);

      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#080c0d' }}
    >
      {/* ── ATMOSPHERIC BACKGROUND ── */}
      <div className="absolute inset-0 animated-grid pointer-events-none opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'rgba(0,240,255,0.04)', filter: 'blur(100px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'rgba(87,27,193,0.04)', filter: 'blur(120px)', animationDelay: '-3s' }} />

      {/* ── CENTERED GLASSMORPHISM CARD ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(15,20,22,0.65)',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Subtle top glow line */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,240,255,0.3), transparent)' }} />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">
                <span className="material-symbols-outlined text-4xl text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">lock_reset</span>
              </div>
              <h1 className="text-2xl font-bold font-['Geist'] text-[#dce4e5] tracking-tight">
                Forgot Password?
              </h1>
              <p className="mt-1.5 text-[13px] text-[#849495]">
                Enter your email to receive a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="p-3 rounded-xl text-xs flex items-center bg-[rgba(255,180,171,0.08)] border border-[rgba(255,180,171,0.15)] text-[#ffb4ab]"
                  >
                    <span className="material-symbols-outlined text-sm mr-2">error_outline</span>
                    {error}
                  </motion.div>
                )}
                {message && (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="p-3 rounded-xl text-xs flex items-center bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.15)] text-[#00f0ff]"
                  >
                    <span className="material-symbols-outlined text-sm mr-2">check_circle</span>
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-[#849495] font-['Geist'] mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:border-[#00f0ff]/50 bg-[rgba(0,0,0,0.4)] border border-white/5 text-[#dce4e5] font-['Inter']"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || cooldown > 0}
                whileHover={(!isLoading && cooldown === 0) ? { scale: 1.01, boxShadow: '0 0 20px rgba(0,240,255,0.2)' } : {}}
                whileTap={(!isLoading && cooldown === 0) ? { scale: 0.98 } : {}}
                className="w-full py-3.5 mt-4 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
                style={{
                  background: (isLoading || cooldown > 0) ? 'rgba(0,240,255,0.6)' : '#00f0ff',
                  color: '#00363a',
                  fontFamily: 'Geist, sans-serif',
                  letterSpacing: '0.06em',
                  cursor: (isLoading || cooldown > 0) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || cooldown > 0) ? 0.7 : 1
                }}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : cooldown > 0 ? (
                  `WAIT ${cooldown}S`
                ) : 'SEND LINK'}
              </motion.button>
            </form>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-[12px] text-[#849495] hover:text-[#b9cacb] transition-colors">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
