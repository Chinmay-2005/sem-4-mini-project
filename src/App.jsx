import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Briefcase, LogOut, LogIn } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import './index.css';

// ── Lazy-loaded pages (code-split → faster first paint) ──────────
const Home            = lazy(() => import('./pages/Home'));
const Mentors         = lazy(() => import('./pages/Mentors'));
const Agent           = lazy(() => import('./pages/Agent'));
const Login           = lazy(() => import('./pages/Login'));
const Signup          = lazy(() => import('./pages/Signup'));
const UserDashboard   = lazy(() => import('./pages/UserDashboard'));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));

// ── Loading spinner for Suspense ──────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', flexDirection: 'column', gap: '15px'
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid #dcdcdc',
        borderTopColor: '#3498db',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#999', fontSize: '13px' }}>Loading page…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Dashboard router ──────────────────────────────────────────────
function Dashboard() {
  const { profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  return profile?.role === 'mentor' ? <MentorDashboard /> : <UserDashboard />;
}

// ── Navbar — 2015 dark top bar ────────────────────────────────────
function Navbar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  return (
    <nav style={{
      background: 'linear-gradient(to bottom, #34495e, #2c3e50)',
      borderBottom: '3px solid #3498db',
      position: 'sticky', top: 0, zIndex: 50,
      padding: '0 15px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        maxWidth: '1170px', margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: '56px'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none'
        }}>
          <div style={{
            background: '#3498db', padding: '6px', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Briefcase size={16} color="white" />
          </div>
          <span style={{
            fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px',
            color: 'white', fontFamily: "'Lato', sans-serif"
          }}>
            Nexus<span style={{ color: '#95a5a6', fontWeight: 400, marginLeft: '4px' }}>Mentorship</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }} className="desktop-nav">
          {[
            { path: '/', label: 'Home' },
            { path: '/mentors', label: 'Mentors' },
            { path: '/agent', label: 'AI Advisor' },
          ].map(link => (
            <Link key={link.path} to={link.path} style={{
              padding: '8px 14px',
              borderRadius: '3px',
              fontSize: '13px',
              fontWeight: isActive(link.path) ? 700 : 400,
              color: isActive(link.path) ? '#ffffff' : '#bdc3c7',
              background: isActive(link.path) ? 'rgba(52,152,219,0.25)' : 'transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: isActive(link.path) ? '2px solid #3498db' : '2px solid transparent',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
          {user ? (
            <>
              <Link to="/dashboard" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px', borderRadius: '3px',
                border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
                fontSize: '13px', fontWeight: 600, color: 'white',
                textDecoration: 'none'
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : '#3498db',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: 'white'
                }}>
                  {!profile?.avatar_url && (profile?.full_name || 'U').charAt(0)}
                </div>
                {profile?.full_name?.split(' ')[0] || 'Dashboard'}
                <span style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '3px',
                  background: profile?.role === 'mentor' ? 'rgba(39,174,96,0.2)' : 'rgba(52,152,219,0.2)',
                  color: profile?.role === 'mentor' ? '#27ae60' : '#3498db',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px'
                }}>{profile?.role || 'user'}</span>
              </Link>
              <button onClick={() => signOut()} title="Sign Out" style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '3px',
                padding: '6px', cursor: 'pointer', color: '#bdc3c7', display: 'flex',
                transition: 'color 0.15s, background 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e74c3c'; e.currentTarget.style.background = 'rgba(231,76,60,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#bdc3c7'; e.currentTarget.style.background = 'none'; }}>
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{
                padding: '6px 14px', fontSize: '12px',
                color: '#ecf0f1', borderColor: 'rgba(255,255,255,0.2)',
                background: 'transparent', textDecoration: 'none'
              }}>
                <LogIn size={13} /> SIGN IN
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{
                padding: '6px 14px', fontSize: '12px',
                textDecoration: 'none'
              }}>
                GET STARTED
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Footer — 2015 dark footer ─────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(to bottom, #2c3e50, #1a252f)',
      padding: '30px 0', marginTop: 'auto',
      borderTop: '3px solid #3498db',
      color: '#95a5a6'
    }}>
      <div className="layout-container" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '13px', flexWrap: 'wrap', gap: '10px'
      }}>
        <p>© {new Date().getFullYear()} Nexus Mentorship. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/mentors" style={{ color: '#95a5a6', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#3498db'}
            onMouseLeave={e => e.currentTarget.style.color = '#95a5a6'}>Mentors</Link>
          <Link to="/agent" style={{ color: '#95a5a6', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#3498db'}
            onMouseLeave={e => e.currentTarget.style.color = '#95a5a6'}>AI Advisor</Link>
          <a href="https://github.com/0x4r35/sem-4-mini-project" target="_blank" rel="noreferrer"
            style={{ color: '#95a5a6', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#3498db'}
            onMouseLeave={e => e.currentTarget.style.color = '#95a5a6'}>GitHub</a>
        </div>
      </div>
    </footer>
  );
}

// ── App Shell ─────────────────────────────────────────────────────
function AppShell() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/login"   element={<Login />} />
            <Route path="/signup"  element={<Signup />} />
            <Route path="/agent"   element={<ProtectedRoute><Agent /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
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
