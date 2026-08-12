import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { RepoAnalysis } from './pages/RepoAnalysis';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useSearchStore } from './store/searchStore';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Toaster } from 'react-hot-toast';

function App() {
  const token = useAuthStore(state => state.token);
  const { isSearchOpen, toggleSearch, closeSearch } = useSearchStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  return (
    <Router>
      <div className="min-h-screen bg-background text-on-surface antialiased selection:bg-primary-container/20 selection:text-white">
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/signup" element={token ? <Navigate to="/dashboard" replace /> : <Signup />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/repo/:id" element={<RepoAnalysis />} />
          </Route>
        </Routes>
        
        {token && (
          <GlobalSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
        )}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(15,20,22,0.95)',
              backdropFilter: 'blur(10px)',
              color: '#dce4e5',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            },
            success: {
              iconTheme: { primary: '#00f0ff', secondary: '#00363a' }
            }
          }}
        />
      </div>
    </Router>
  );
}

export default App;
