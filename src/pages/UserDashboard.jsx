import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bot, Calendar, TrendingUp, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function UserDashboard() {
  const { profile, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Founder';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      const { data } = await supabase
        .from('bookings')
        .select(`
          id, status, message, created_at,
          mentor:profiles!bookings_mentor_id_fkey (
            full_name, avatar_url,
            mentor_details (title, rating)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setBookings(data || []);
      setLoadingBookings(false);
    };
    if (user) fetchBookings();
  }, [user]);

  const statusBadge = (status) => {
    const map = {
      pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   label: 'Pending',   icon: Clock },
      confirmed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)',   label: 'Confirmed', icon: CheckCircle },
      completed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   label: 'Completed', icon: CheckCircle },
      cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    label: 'Cancelled', icon: XCircle },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        color: s.color, background: s.bg, padding: '0.25rem 0.65rem',
        borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600
      }}>
        <s.icon size={11} /> {s.label}
      </span>
    );
  };

  const quickActions = [
    { icon: Users,     label: 'Find a Mentor',   sub: '500+ experts waiting',    to: '/mentors',   id: 'qa-mentors' },
    { icon: Bot,       label: 'AI Advisor',       sub: 'Instant strategy advice', to: '/agent',     id: 'qa-agent'   },
    { icon: TrendingUp,label: 'Explore Insights', sub: 'Market intelligence',     to: '/mentors',   id: 'qa-insights'},
  ];

  return (
    <div className="page-container animate-fade-in">

      {/* ── Welcome Header ── */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
            background: profile?.avatar_url
              ? `url(${profile.avatar_url}) center/cover`
              : 'linear-gradient(135deg, var(--accent-primary), #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 700, color: 'white',
            boxShadow: '0 0 0 3px var(--bg-primary), 0 0 0 5px var(--accent-primary)'
          }}>
            {!profile?.avatar_url && initials}
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{greeting},</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{name} 👋</h1>
          </div>
        </div>
        <div style={{
          padding: '0.5rem 1rem', borderRadius: '20px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600
        }}>
          ● Founder Account
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {[
          { label: 'Sessions Booked', value: bookings.length, color: 'var(--accent-primary)' },
          { label: 'Mentors Available', value: '500+',        color: 'var(--success)'       },
          { label: 'AI Conversations',  value: '∞',           color: '#a78bfa'               },
        ].map(s => (
          <div key={s.label} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Quick Actions ── */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {quickActions.map(({ icon: Icon, label, sub, to, id }) => (
            <Link key={id} id={id} to={to} style={{ textDecoration: 'none' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.borderColor = 'var(--border-light)'; }}>
                <div style={{ background: 'var(--accent-subtle)', padding: '0.75rem', borderRadius: '10px', flexShrink: 0 }}>
                  <Icon size={20} color="var(--accent-primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{sub}</div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── My Bookings ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>My Sessions</h2>
          <Link to="/mentors" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
            + Book New Session
          </Link>
        </div>

        {loadingBookings ? (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '3rem' }}>
            <div className="typing-indicator"><span/><span/><span/></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No sessions yet.</p>
            <Link to="/mentors" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Find a Mentor
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bookings.map(b => (
              <div key={b.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent-primary), #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: 'white', fontSize: '1rem'
                }}>
                  {(b.mentor?.full_name||'M').split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ fontWeight: 600 }}>{b.mentor?.full_name || 'Mentor'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{b.mentor?.mentor_details?.title}</div>
                </div>
                {b.message && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 2, minWidth: '120px', fontStyle: 'italic' }}>
                    "{b.message.slice(0,60)}{b.message.length > 60 ? '…' : ''}"
                  </div>
                )}
                <div>{statusBadge(b.status)}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
