import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email,         setEmail]        = useState('');
  const [password,      setPassword]     = useState('');
  const [showPw,        setShowPw]       = useState(false);
  const [emailLoading,  setEmailLoading] = useState(false);
  const [gLoading,      setGLoading]     = useState(false);
  const [error,         setError]        = useState('');
  const [success,       setSuccess]      = useState('');

  const { user, signInWithEmail, signInWithGoogle } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  // Already logged in? Redirect immediately
  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user]);

  const handleEmail = async (e) => {
    e.preventDefault();
    setEmailLoading(true); setError('');
    const { error: err } = await signInWithEmail(email, password);
    if (err) { setError(err.message); setEmailLoading(false); return; }
    setSuccess('Logged in! Redirecting…');
    navigate(from, { replace: true });
  };

  const handleGoogle = async () => {
    setGLoading(true); setError('');
    const { error: err } = await signInWithGoogle();
    if (err) { setError(err.message); setGLoading(false); }
    // On success, page redirects to Google → Supabase → /dashboard
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>

      {/* ── Left: Branding Panel ─────────────────────── */}
      <div className="auth-brand-panel">
        {/* Glow blobs */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3.5rem' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '0.6rem', borderRadius: '10px', display: 'flex' }}>
              <Briefcase size={22} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
              Nexus <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Mentorship</span>
            </span>
          </div>

          <h1 className="auth-brand-headline">
            The platform where<br />
            <span style={{ color: 'var(--accent-primary)' }}>founders</span> connect<br />
            with world-class mentors.
          </h1>

          <p className="auth-brand-sub">
            Join 500+ founders who are scaling faster with expert guidance,
            strategic networks, and AI-powered insights.
          </p>

          {/* Stats */}
          <div className="auth-stats">
            {[['$2B+', 'Funding raised by members'], ['500+', 'Elite industry mentors'], ['98%', 'Founder success rate']].map(([m, l]) => (
              <div key={l} className="auth-stat">
                <span className="auth-stat-number">{m}</span>
                <span className="auth-stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">

          <div style={{ marginBottom: '2.25rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>Welcome back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Sign in to your Nexus account
            </p>
          </div>

          {/* Google OAuth */}
          <button id="btn-google-login" onClick={handleGoogle} disabled={gLoading} className="google-oauth-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {gLoading ? 'Redirecting to Google…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="auth-divider"><div /><span>OR</span><div /></div>

          {/* Alerts */}
          {error   && <div className="auth-alert auth-alert-error">  <AlertCircle  size={15}/>{error}  </div>}
          {success && <div className="auth-alert auth-alert-success"><CheckCircle2 size={15}/>{success}</div>}

          {/* Email / Password Form */}
          <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="auth-field">
              <label>Email address</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input id="input-login-email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" required className="auth-input" />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input id="input-login-password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required className="auth-input"
                  style={{ paddingRight: '3rem' }} />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button id="btn-email-login" type="submit" disabled={emailLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', fontSize: '1rem', marginTop: '0.25rem', opacity: emailLoading ? 0.7 : 1 }}>
              {emailLoading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="auth-demo-hint">
            <strong>Demo credentials:</strong><br />
            User: demo.user@nexusdemo.com / User123!<br />
            Mentor: elena.rodriguez@nexusdemo.com / Mentor123!
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1.5rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
