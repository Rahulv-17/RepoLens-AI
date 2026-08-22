import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import toast from 'react-hot-toast';

// Helper to generate base64 from cropped area
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.85); // Compress as JPEG at 85% quality
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, token, logout, setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Cropping State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username || '');
      setProfilePicture(user.profilePicture || '');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setActiveTab('profile');
      setImageSrc(null);
    }
  }, [isOpen, user]);

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

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCrop = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
        setProfilePicture(croppedImageBase64);
        setImageSrc(null); // Close crop view
      }
    } catch (e) {
      console.error(e);
      setError('Failed to crop image');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password && !isPasswordValid) {
      setError('Password does not meet requirements');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const body: any = {};
      if (username !== user?.username) body.username = username;
      if (profilePicture !== (user?.profilePicture || '')) body.profilePicture = profilePicture;
      if (password) body.password = password;

      if (Object.keys(body).length === 0) {
        setError('No changes to save');
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setAuth(token!, data.user);
      toast.success('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      logout();
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    background: 'rgba(8,15,16,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#dce4e5',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl flex flex-col"
          style={{
            background: 'rgba(15,20,22,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            maxHeight: '90vh' // Prevent modal from being too tall on small screens
          }}
        >
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,240,255,0.4), transparent)', flexShrink: 0 }} />
          
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '20px', color: '#dce4e5' }}>
                Your Profile
              </h2>
              <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#849495' }}>
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* If in Crop Mode */}
            {imageSrc ? (
              <div className="flex flex-col h-[400px]">
                <div className="relative flex-1 rounded-xl overflow-hidden mb-4" style={{ background: '#000' }}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => setImageSrc(null)} className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: '#849495', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Cancel
                  </button>
                  <button onClick={handleApplyCrop} className="px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: '#00f0ff', color: '#00363a' }}
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Form View */
              <>
                <div className="flex gap-4 border-b border-white/10 mb-6">
                  {['profile', 'account'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className="pb-2 text-sm font-medium transition-colors relative"
                      style={{ color: activeTab === tab ? '#00f0ff' : '#849495', textTransform: 'capitalize' }}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00f0ff]" />
                      )}
                    </button>
                  ))}
                </div>

                {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.2)', color: '#ffb4ab' }}>{error}</div>}

                {activeTab === 'profile' && (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="flex flex-col items-center mb-6">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 flex-shrink-0 transition-all group-hover:scale-105" 
                             style={{ borderColor: 'rgba(0,240,255,0.4)', background: 'rgba(0,240,255,0.1)' }}>
                          {profilePicture ? (
                             <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: '#00f0ff' }}>
                               {username?.[0]?.toUpperCase() || 'U'}
                             </div>
                          )}
                        </div>
                        <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                             style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
                          <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                        </div>
                      </div>
                      <p className="text-xs mt-3 text-center" style={{ color: '#849495' }}>Click to select photo</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#849495' }}>Username</label>
                      <input
                        type="text" value={username} onChange={e => setUsername(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#00f0ff]/50"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#849495' }}>New Password (Optional)</label>
                      <input
                        type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#00f0ff]/50"
                        style={inputStyle}
                      />
                    </div>

                    {password && (
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#849495' }}>Confirm New Password</label>
                        <input
                          type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[#00f0ff]/50"
                          style={inputStyle}
                        />
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: '#00f0ff', color: '#00363a', opacity: isLoading ? 0.7 : 1 }}>
                        {isLoading ? 'SAVING...' : 'SAVE CHANGES'}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <h3 className="text-[#dce4e5] font-semibold text-sm mb-2">Session</h3>
                      <p className="text-xs text-[#849495] mb-4">
                        Sign out of your account on this device.
                      </p>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors w-full"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#dce4e5', border: '1px solid rgba(255,255,255,0.1)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      >
                        LOGOUT
                      </button>
                    </div>

                    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,180,171,0.05)', border: '1px solid rgba(255,180,171,0.2)' }}>
                      <h3 className="text-[#ffb4ab] font-semibold text-sm mb-2">Danger Zone</h3>
                      <p className="text-xs text-[#849495] mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors w-full"
                        style={{ background: 'rgba(255,180,171,0.1)', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' }}
                      >
                        {isLoading ? 'DELETING...' : 'DELETE ACCOUNT'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* ── Custom Delete Confirm Modal ── */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] flex items-center justify-center p-6"
              style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="p-6 rounded-2xl max-w-sm w-full shadow-2xl border"
                style={{
                  background: 'rgba(15, 20, 20, 0.95)',
                  borderColor: 'rgba(255, 180, 171, 0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255, 180, 171, 0.1) inset'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 180, 171, 0.1)' }}>
                    <span className="material-symbols-outlined text-[#ffb4ab]">warning</span>
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: '#dce4e5', fontFamily: 'Geist, sans-serif' }}>Delete Account</h3>
                </div>
                <p className="text-sm mb-6" style={{ color: '#849495', lineHeight: 1.5 }}>
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                    style={{ color: '#dce4e5', background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteAccount}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-90"
                    style={{ color: '#1a0000', background: '#ffb4ab' }}
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
