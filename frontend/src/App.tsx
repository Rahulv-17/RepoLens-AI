import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { RepoAnalysis } from './pages/RepoAnalysis';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-on-surface antialiased selection:bg-primary-container/20 selection:text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repo/:id" element={<RepoAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
