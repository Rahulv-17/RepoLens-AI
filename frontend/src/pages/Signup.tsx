import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ValidationItem = ({ isValid, text }: { isValid: boolean, text: string }) => (
  <div className="flex items-center gap-1.5 text-[10px] mt-1 transition-colors duration-300" 
    style={{ color: isValid ? '#78b5a0' : '#849495' }}>
    <span className="material-symbols-outlined text-[12px]">
      {isValid ? 'check_circle' : 'radio_button_unchecked'}
    </span>
    {text}
  </div>
);

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

  // Validations
  const isUsernameValid = USERNAME_REGEX.test(username);
  const isEmailValid = EMAIL_REGEX.test(email);
  const passwordValidations = useMemo(() => {
    return {
      length: password.length >= 8 && password.length <= 16,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
  }, [password]);

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  const isConfirmMatch = password === confirmPassword && confirmPassword.length > 0;

  const canSubmit = isUsernameValid && isEmailValid && isPasswordValid && isConfirmMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
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

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google signup failed');
        setAuth(data.token, data.user);
        navigate('/dashboard');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Google signup failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google signup was unsuccessful. Try again later.');
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#080c0d' }}
    >
      {/* ── ATMOSPHERIC BACKGROUND ── */}
      <div className="absolute inset-0 animated-grid pointer-events-none opacity-40" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'rgba(208,188,255,0.04)', filter: 'blur(100px)' }} />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'rgba(0,240,255,0.04)', filter: 'blur(120px)', animationDelay: '-3s' }} />

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
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(208,188,255,0.3), transparent)' }} />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">
                <img src="/logo.png" alt="RepoLens AI Logo" className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(208,188,255,0.2)]" />
              </div>
              <h1 className="text-2xl font-bold font-['Geist'] text-[#dce4e5] tracking-tight">
                Create an account
              </h1>
              <p className="mt-1.5 text-[13px] text-[#849495]">
                Start analyzing repositories for free
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="p-3 rounded-xl text-xs flex items-center bg-[rgba(255,180,171,0.08)] border border-[rgba(255,180,171,0.15)] text-[#ffb4ab]"
                  >
                    <span className="material-symbols-outlined text-sm mr-2">error_outline</span>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-[#849495] font-['Geist'] mb-1.5 block">
                  Username
                </label>
                <input
                  type="text" required value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#d0bcff]/50 bg-[rgba(0,0,0,0.4)] border border-white/5 text-[#dce4e5] font-['Inter']"
                  style={{ borderColor: username && !isUsernameValid ? 'rgba(255,180,171,0.3)' : '' }}
                />
                {username && (
                  <ValidationItem isValid={isUsernameValid} text="4-20 chars (letters, numbers, underscore)" />
                )}
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-[#849495] font-['Geist'] mb-1.5 block">
                  Email
                </label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#d0bcff]/50 bg-[rgba(0,0,0,0.4)] border border-white/5 text-[#dce4e5] font-['Inter']"
                  style={{ borderColor: email && !isEmailValid ? 'rgba(255,180,171,0.3)' : '' }}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-[#849495] font-['Geist'] mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all focus:border-[#d0bcff]/50 bg-[rgba(0,0,0,0.4)] border border-white/5 text-[#dce4e5] font-['JetBrains_Mono']"
                    style={{ letterSpacing: showPassword ? 'normal' : '0.15em', borderColor: password && !isPasswordValid ? 'rgba(255,180,171,0.3)' : '' }}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#849495] hover:text-[#b9cacb] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {password && (
                  <div className="mt-2 grid grid-cols-2 gap-x-1 gap-y-0.5">
                    <ValidationItem isValid={passwordValidations.length} text="8-16 chars" />
                    <ValidationItem isValid={passwordValidations.uppercase} text="Uppercase" />
                    <ValidationItem isValid={passwordValidations.lowercase} text="Lowercase" />
                    <ValidationItem isValid={passwordValidations.number} text="Number" />
                    <ValidationItem isValid={passwordValidations.special} text="Special char" />
                  </div>
                )}
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
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#d0bcff]/50 bg-[rgba(0,0,0,0.4)] border border-white/5 text-[#dce4e5] font-['JetBrains_Mono']"
                  style={{ letterSpacing: showPassword ? 'normal' : '0.15em', borderColor: confirmPassword && !isConfirmMatch ? 'rgba(255,180,171,0.3)' : '' }}
                />
                {confirmPassword && (
                  <ValidationItem isValid={isConfirmMatch} text="Passwords match" />
                )}
              </div>

              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.01, boxShadow: '0 0 20px rgba(208,188,255,0.2)' } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
                className="w-full py-3.5 mt-4 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
                style={{
                  background: canSubmit ? '#d0bcff' : 'rgba(208,188,255,0.1)',
                  color: canSubmit ? '#3c0091' : 'rgba(208,188,255,0.3)',
                  fontFamily: 'Geist, sans-serif',
                  letterSpacing: '0.06em',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(60,0,145,0.3)', borderTopColor: '#3c0091' }} />
                ) : 'CREATE ACCOUNT'}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-white/5"></div>
              <span className="px-3 text-[10px] text-white/30 uppercase tracking-widest font-semibold">or continue with</span>
              <div className="flex-1 border-t border-white/5"></div>
            </div>

            {/* Custom Google Button */}
            <motion.button
              onClick={() => loginWithGoogle()}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-[13px] font-medium flex items-center justify-center gap-3 transition-colors bg-[rgba(255,255,255,0.02)] border border-white/5 text-[#dce4e5]"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </motion.button>

            <p className="text-center mt-6 text-[12px] text-[#849495]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#d0bcff] font-semibold hover:underline decoration-1 underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] text-[#849495] hover:text-[#b9cacb] transition-colors">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
