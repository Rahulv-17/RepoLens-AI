import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      setMessage(data.message || 'Password reset successfully.');
      setPassword('');
      setConfirmPassword('');
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
                <span className="material-symbols-outlined text-4xl text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">key</span>
              </div>
              <h1 className="text-2xl font-bold font-['Geist'] text-[#dce4e5] tracking-tight">
                Reset Password
              </h1>
              <p className="mt-1.5 text-[13px] text-[#849495]">
                Enter your new secure password.
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
                    className="p-3 rounded-xl text-xs flex flex-col items-start gap-3 bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.15)] text-[#00f0ff]"
                  >
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-sm mr-2">check_circle</span>
                      {message}
                    </div>
                    <Link to="/login" className="px-4 py-2 bg-[#00f0ff] text-[#00363a] rounded-lg text-xs font-bold font-['Geist'] tracking-wide self-start mt-2">
                      GO TO LOGIN
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {!message && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold tracking-widest uppercase text-[#849495] font-['Geist'] mb-1.5 block">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl px-4 py-3.5 pr-12 text-sm outline-none transition-all focus:border-[#00f0ff]/50 bg-[rgba(0,0,0,0.4)] border border-white/5 text-[#dce4e5] font-['JetBrains_Mono']"
                        style={{ letterSpacing: showPassword ? 'normal' : '0.15em' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#849495] hover:text-[#b9cacb] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold tracking-widest uppercase text-[#849495] font-['Geist'] mb-1.5 block">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:border-[#00f0ff]/50 bg-[rgba(0,0,0,0.4)] border border-white/5 text-[#dce4e5] font-['JetBrains_Mono']"
                      style={{ letterSpacing: showPassword ? 'normal' : '0.15em' }}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={!isLoading ? { scale: 1.01, boxShadow: '0 0 20px rgba(0,240,255,0.2)' } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    className="w-full py-3.5 mt-4 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: isLoading ? 'rgba(0,240,255,0.6)' : '#00f0ff',
                      color: '#00363a',
                      fontFamily: 'Geist, sans-serif',
                      letterSpacing: '0.06em',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : 'RESET PASSWORD'}
                  </motion.button>
                </>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
