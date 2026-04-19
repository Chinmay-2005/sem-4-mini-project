import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('user');   // 'user' | 'mentor'
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const { user, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user]);

  // Password strength
  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8)            s++;
    if (/[A-Z]/.test(password))          s++;
    if (/[0-9]/.test(password))          s++;
    if (/[^A-Za-z0-9]/.test(password))  s++;
    return s;
  })();
  const strengthColors = ['', '#e74c3c', '#f39c12', '#f1c40f', '#27ae60'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');

    const { error: err } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (err) { setError(err.message); return; }

    setSuccess('Account created! Redirecting to your dashboard…');
    setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
  };

  const handleGoogle = async () => {
    const { error: err } = await signInWithGoogle();
    if (err) setError(err.message);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-secondary)' }}>

      {/* ── Left: Branding ───────────────────────────── */}
      <div className="auth-brand-panel">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ background: '#3498db', padding: '8px', borderRadius: '4px', display: 'flex' }}>
              <Briefcase size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px', fontFamily: "'Lato', sans-serif" }}>
              Nexus <span style={{ color: '#95a5a6', fontWeight: 400 }}>Mentorship</span>
            </span>
          </div>

          <h1 className="auth-brand-headline">
            Start your journey<br />to <span style={{ color: '#3498db' }}>smarter</span><br />startup growth.
          </h1>

          <p className="auth-brand-sub">
            Choose your role and get instant access to elite mentors, AI-powered advice, and a network that scales with you.
          </p>

          {/* Role preview cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '25px' }}>
            {[
              { icon: User, label: 'Founders', desc: 'Book sessions, get AI advice, scale your startup.' },
              { icon: BookOpen, label: 'Mentors', desc: 'Manage your profile, accept bookings, grow your impact.' }
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px', padding: '12px 15px'
              }}>
                <div style={{ background: 'rgba(52,152,219,0.2)', padding: '8px', borderRadius: '4px', display: 'flex' }}>
                  <Icon size={16} color="#3498db" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Signup Form ───────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '6px', fontFamily: "'Lato', sans-serif" }}>Create account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Join Nexus Mentorship — it's free
            </p>
          </div>

          {/* Google OAuth */}
          <button id="btn-google-signup" onClick={handleGoogle} className="google-oauth-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider"><div /><span>OR</span><div /></div>

          {error   && <div className="auth-alert auth-alert-error">  <AlertCircle  size={14}/>{error}  </div>}
          {success && <div className="auth-alert auth-alert-success"><CheckCircle2 size={14}/>{success}</div>}

          {/* Role Selector */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              I am a…
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { value: 'user',   icon: User,     label: 'Founder',  sub: 'Looking for mentors' },
                { value: 'mentor', icon: BookOpen, label: 'Mentor',   sub: 'Offering expertise'  }
              ].map(({ value, icon: Icon, label, sub }) => (
                <button key={value} type="button" id={`role-${value}`}
                  onClick={() => setRole(value)}
                  style={{
                    padding: '12px', borderRadius: '4px', cursor: 'pointer',
                    border: `2px solid ${role === value ? '#3498db' : 'var(--border-light)'}`,
                    background: role === value ? '#eaf4fc' : 'var(--bg-secondary)',
                    color: 'var(--text-primary)', textAlign: 'left', transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}>
                  <Icon size={16} color={role === value ? '#3498db' : 'var(--text-muted)'} style={{ marginBottom: '5px' }} />
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-wrap">
                <User size={14} className="auth-input-icon" />
                <input id="input-signup-name" type="text" value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Smith" required className="auth-input" />
              </div>
            </div>

            <div className="auth-field">
              <label>Email address</label>
              <div className="auth-input-wrap">
                <Mail size={14} className="auth-input-icon" />
                <input id="input-signup-email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" required className="auth-input" />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <Lock size={14} className="auth-input-icon" />
                <input id="input-signup-password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" required className="auth-input"
                  style={{ paddingRight: '40px' }} />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i <= strength ? strengthColors[strength] : 'var(--bg-elevated)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <button id="btn-signup-submit" type="submit" disabled={loading}
              className="btn btn-primary btn-block"
              style={{ padding: '12px', fontSize: '14px', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating account…' : `JOIN AS ${role === 'mentor' ? 'A MENTOR' : 'A FOUNDER'} →`}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
