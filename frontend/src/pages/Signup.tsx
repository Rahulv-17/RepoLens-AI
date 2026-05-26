import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

export function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setAuth(data.token, data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(8,15,16,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#dce4e5',
    fontFamily: 'Inter, sans-serif',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0,240,255,0.5)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.08), inset 0 0 0 1px rgba(0,240,255,0.1)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#0d1515' }}
    >
      {/* Background atmosphere */}
      <div className="absolute inset-0 animated-grid pointer-events-none" />
      <div className="pulse-layer absolute top-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'rgba(87,27,193,0.07)', filter: 'blur(120px)' }} />
      <div className="pulse-layer absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'rgba(0,240,255,0.05)', filter: 'blur(100px)', animationDelay: '-2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(25,33,34,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Top glow line — violet for signup */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(208,188,255,0.4), transparent)' }} />

          <div className="p-8">
            {/* Logo area */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                style={{ background: 'rgba(208,188,255,0.1)', border: '1px solid rgba(208,188,255,0.25)' }}
              >
                <span className="material-symbols-outlined text-2xl" style={{ color: '#d0bcff', fontVariationSettings: "'FILL' 1" }}>
                  rocket_launch
                </span>
              </div>
              <h1 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: '22px', letterSpacing: '-0.02em', color: '#dce4e5' }}>
                Create an account
              </h1>
              <p className="mt-1" style={{ color: '#849495', fontSize: '14px' }}>
                Start analyzing repositories for free
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.2)', color: '#ffb4ab' }}
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-2">error_outline</span>
                  {error}
                </motion.div>
              )}

              {/* Username */}
              <div>
                <label style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#849495' }}>
                  Username
                </label>
                <input
                  type="text" required value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="johndoe"
                  autoComplete="username"
                  className="mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#849495' }}>
                  Email
                </label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#849495' }}>
                  Password
                </label>
                <div className="mt-1.5 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all"
                    style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", letterSpacing: showPassword ? 'normal' : '0.15em' }}
                    onFocus={handleFocus} onBlur={handleBlur}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#849495' }}
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#849495' }}>
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", letterSpacing: showPassword ? 'normal' : '0.15em' }}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.01, boxShadow: '0 0 20px rgba(208,188,255,0.25)' } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2"
                style={{
                  background: isLoading ? 'rgba(208,188,255,0.6)' : '#d0bcff',
                  color: '#3c0091',
                  fontFamily: 'Geist, sans-serif',
                  letterSpacing: '0.08em',
                  fontSize: '12px',
                  boxShadow: '0 0 15px rgba(208,188,255,0.15)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(60,0,145,0.3)', borderTopColor: '#3c0091' }} />
                    CREATING...
                  </>
                ) : 'CREATE ACCOUNT'}
              </motion.button>
            </form>

            <p className="text-center mt-6" style={{ color: '#849495', fontSize: '13px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#d0bcff', textDecoration: 'none', fontWeight: 600 }}
                onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = 'underline')}
                onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = 'none')}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="flex items-center justify-center gap-1.5 transition-colors"
            style={{ color: '#849495', fontSize: '13px', textDecoration: 'none' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#b9cacb')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#849495')}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
