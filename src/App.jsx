import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Briefcase, Bot, LogOut, LayoutDashboard, Users, LogIn } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Mentors from './pages/Mentors';
import Agent from './pages/Agent';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import MentorDashboard from './pages/MentorDashboard';
import './index.css';

// ── Dashboard router (picks User or Mentor view by role) ──────────────
function Dashboard() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  return profile?.role === 'mentor' ? <MentorDashboard /> : <UserDashboard />;
}

// ── Top Navigation ────────────────────────────────────────────────────
function Navbar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  const navLinks = [
    { path: '/',        label: 'Overview' },
    { path: '/mentors', label: 'Mentors'  },
    { path: '/agent',   label: 'AI Advisor' },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="glass-panel" style={{
      margin: '1rem', position: 'sticky', top: '1rem', zIndex: 50,
      padding: '0.6rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
          <Briefcase size={18} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
          Nexus <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Mentorship</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
        {navLinks.map(link => (
          <Link key={link.path} to={link.path} style={{
            color: isActive(link.path) ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: isActive(link.path) ? 600 : 400,
            borderBottom: isActive(link.path) ? '2px solid var(--accent-primary)' : '2px solid transparent',
            paddingBottom: '2px', transition: 'color 0.2s',
          }}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* Auth buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
        {user ? (
          <>
            {/* Avatar + Dashboard */}
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent-primary), #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0
              }}>
                {!profile?.avatar_url && (profile?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {profile?.full_name?.split(' ')[0] || 'Dashboard'}
              </span>
              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: profile?.role === 'mentor' ? 'rgba(16,185,129,0.15)' : 'var(--accent-subtle)', color: profile?.role === 'mentor' ? 'var(--success)' : 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {profile?.role || 'user'}
              </span>
            </Link>
            <button onClick={handleLogout} title="Sign Out"
              style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
              <LogIn size={15} /> Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Get Started
            </Link>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
      `}</style>
    </nav>
  );
}

// ── Footer ────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ borderTop: '1px solid var(--border-light)', padding: '2rem 0', marginTop: 'auto' }}>
    <div className="layout-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', flexWrap: 'wrap', gap: '1rem' }}>
      <p>© {new Date().getFullYear()} Nexus Mentorship Core. All rights reserved.</p>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/mentors" style={{ color: 'var(--text-muted)' }}>Mentors</Link>
        <Link to="/agent"   style={{ color: 'var(--text-muted)' }}>AI Advisor</Link>
        <a href="https://github.com/0x4r35/sem-4-mini-project" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>GitHub</a>
      </div>
    </div>
  </footer>
);

// ── App Shell ─────────────────────────────────────────────────────────
function AppShell() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"        element={<Home    />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/login"   element={<Login   />} />
          <Route path="/signup"  element={<Signup  />} />

          {/* Protected — any authenticated user */}
          <Route path="/agent"     element={<ProtectedRoute><Agent /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}
