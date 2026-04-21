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
      pending:   { cls: 'label-warning', label: 'Pending' },
      confirmed: { cls: 'label-success', label: 'Confirmed' },
      completed: { cls: 'label-info',    label: 'Completed' },
      cancelled: { cls: 'label-danger',  label: 'Cancelled' },
    };
    const s = map[status] || map.pending;
    return <span className={`label ${s.cls}`}>{s.label}</span>;
  };

  const quickActions = [
    { icon: Users,     label: 'Find a Mentor',   sub: '500+ experts waiting',    to: '/mentors',   id: 'qa-mentors' },
    { icon: Bot,       label: 'AI Advisor',       sub: 'Instant strategy advice', to: '/agent',     id: 'qa-agent'   },
    { icon: TrendingUp,label: 'Explore Insights', sub: 'Market intelligence',     to: '/mentors',   id: 'qa-insights'},
  ];

  return (
    <div className="animate-fade-in">

      {/* ── Dashboard Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
        padding: '30px 0', color: 'white',
        borderBottom: '3px solid #2980b9'
      }}>
        <div className="layout-container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
              background: profile?.avatar_url
                ? `url(${profile.avatar_url}) center/cover`
                : 'linear-gradient(135deg, #3498db, #2980b9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 900, color: 'white',
              border: '3px solid rgba(255,255,255,0.3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {!profile?.avatar_url && initials}
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '2px' }}>{greeting},</p>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>{name}</h1>
            </div>
          </div>
          <span className="label label-success" style={{ fontSize: '11px', padding: '5px 12px' }}>
            FOUNDER ACCOUNT
          </span>
        </div>
      </div>

      <div className="page-container">

        {/* ── Stats Row ── */}
        <div className="stats-bar" style={{ marginTop: '-30px', marginBottom: '30px' }}>
          {[
            { label: 'Sessions Booked', value: bookings.length, color: '#3498db' },
            { label: 'Mentors Available', value: '500+', color: '#27ae60' },
            { label: 'AI Conversations', value: '∞', color: '#9b59b6' },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '15px', fontFamily: "'Lato', sans-serif" }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
            {quickActions.map(({ icon: Icon, label, sub, to, id }) => (
              <Link key={id} id={id} to={to} style={{ textDecoration: 'none' }}>
                <div className="panel" style={{
                  padding: '20px', display: 'flex', alignItems: 'center', gap: '15px',
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3498db, #2980b9)',
                    padding: '10px', borderRadius: '4px', flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(52,152,219,0.3)'
                  }}>
                    <Icon size={20} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{sub}</div>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── My Bookings ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, fontFamily: "'Lato', sans-serif" }}>My Sessions</h2>
            <Link to="/mentors" className="btn btn-primary btn-sm">
              + Book New Session
            </Link>
          </div>

          {loadingBookings ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="typing-indicator"><span/><span/><span/></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '50px 30px', border: '2px dashed var(--border-medium)', background: 'linear-gradient(135deg, #f8f9fa 0%, #eef2f7 100%)' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 18px',
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(52,152,219,0.3)'
              }}>
                <Calendar size={32} color="white" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>No Sessions Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '320px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                Book your first mentoring session to get expert advice on your startup journey.
              </p>
              <Link to="/mentors" className="btn btn-primary" style={{ padding: '10px 28px', fontSize: '14px' }}>
                🚀 Find a Mentor
              </Link>
            </div>
          ) : (
            <div className="panel">
              <table className="table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th>Mentor</th>
                    <th>Role</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #3498db, #2980b9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: 'white', fontSize: '11px'
                          }}>
                            {(b.mentor?.full_name||'M').split(' ').map(n=>n[0]).join('').slice(0,2)}
                          </div>
                          <strong>{b.mentor?.full_name || 'Mentor'}</strong>
                        </div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {b.mentor?.mentor_details?.title || '—'}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        {b.message ? `"${b.message.slice(0,50)}${b.message.length > 50 ? '…' : ''}"` : '—'}
                      </td>
                      <td>{statusBadge(b.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
