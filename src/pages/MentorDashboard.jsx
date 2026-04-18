import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, XCircle, Clock, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function MentorDashboard() {
  const { profile, user, fetchProfile } = useAuth();
  const [requests, setRequests]         = useState([]);
  const [loadingReq, setLoadingReq]     = useState(true);
  const [editing, setEditing]           = useState(false);
  const [saving,  setSaving]            = useState(false);
  const [editForm, setEditForm]         = useState({ title: '', bio: '', expertise: '' });
  const [statusMsg, setStatusMsg]       = useState('');

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Mentor';
  const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const details = profile?.mentor_details;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning'; if (h < 18) return 'Good afternoon'; return 'Good evening';
  })();

  useEffect(() => {
    if (details) {
      setEditForm({
        title: details.title || '',
        bio: details.bio || '',
        expertise: (details.expertise || []).join(', ')
      });
    }
  }, [details]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingReq(true);
      const { data } = await supabase
        .from('bookings')
        .select(`
          id, status, message, created_at,
          user:profiles!bookings_user_id_fkey (full_name, email, avatar_url)
        `)
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false });
      setRequests(data || []);
      setLoadingReq(false);
    })();
  }, [user]);

  const updateStatus = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const saveProfile = async () => {
    setSaving(true);
    const expertiseArray = editForm.expertise.split(',').map(s => s.trim()).filter(Boolean);
    const { error } = await supabase
      .from('mentor_details')
      .upsert({ id: user.id, title: editForm.title, bio: editForm.bio, expertise: expertiseArray }, { onConflict: 'id' });
    if (!error) {
      await fetchProfile(user.id);
      setStatusMsg('Profile saved ✓');
      setEditing(false);
      setTimeout(() => setStatusMsg(''), 2500);
    }
    setSaving(false);
  };

  const statusBadge = (status) => {
    const cfgs = {
      pending:   { color: '#f59e0b', label: 'Pending'   },
      confirmed: { color: '#10b981', label: 'Confirmed' },
      completed: { color: '#3b82f6', label: 'Completed' },
      cancelled: { color: '#ef4444', label: 'Cancelled' },
    };
    const c = cfgs[status] || cfgs.pending;
    return <span style={{ color: c.color, fontWeight: 600, fontSize: '0.8rem' }}>{c.label}</span>;
  };

  const pending   = requests.filter(r => r.status === 'pending').length;
  const confirmed = requests.filter(r => r.status === 'confirmed').length;

  return (
    <div className="page-container animate-fade-in">

      {/* ── Welcome Header ── */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
            background: profile?.avatar_url
              ? `url(${profile.avatar_url}) center/cover`
              : 'linear-gradient(135deg, #10b981, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 700, color: 'white',
            boxShadow: '0 0 0 3px var(--bg-primary), 0 0 0 5px #10b981'
          }}>
            {!profile?.avatar_url && initials}
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{greeting},</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{name} 🎓</h1>
            {details?.title && <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 500 }}>{details.title}</p>}
          </div>
        </div>
        <div style={{
          display: 'flex', gap: '0.5rem', alignItems: 'center',
          padding: '0.5rem 1rem', borderRadius: '20px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600
        }}>
          ● Mentor Account
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {[
          { label: 'Total Requests',     value: requests.length,                    color: 'var(--accent-primary)' },
          { label: 'Pending',            value: pending,                            color: '#f59e0b'               },
          { label: 'Confirmed Sessions', value: confirmed,                          color: '#10b981'               },
          { label: 'Rating',             value: details?.rating ? `${details.rating}★` : 'N/A', color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

        {/* ── Booking Requests ── */}
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem' }}>Session Requests</h2>
          {loadingReq ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="typing-indicator"><span/><span/><span/></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No session requests yet.<br/>Your profile is live — founders can book you!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.map(r => (
                <div key={r.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.user?.full_name || 'Founder'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.user?.email}</div>
                    </div>
                    {statusBadge(r.status)}
                  </div>
                  {r.message && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                      "{r.message}"
                    </p>
                  )}
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => updateStatus(r.id, 'confirmed')}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none',
                          background: 'rgba(16,185,129,0.15)', color: '#10b981', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
                        <CheckCircle size={14} /> Accept
                      </button>
                      <button onClick={() => updateStatus(r.id, 'cancelled')}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none',
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
                        <XCircle size={14} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Edit Profile ── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>My Profile</h2>
            {!editing
              ? <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}><Edit3 size={15}/> Edit</button>
              : <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16}/></button>
                </div>
            }
          </div>

          {statusMsg && (
            <div className="auth-alert auth-alert-success" style={{ marginBottom: '1rem' }}>
              <CheckCircle size={14} /> {statusMsg}
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {editing ? (
              <>
                {[
                  { label: 'Title / Role', key: 'title', placeholder: 'e.g. Ex-CFO at Stripe' },
                  { label: 'Bio',          key: 'bio',   placeholder: 'Your professional story…', multi: true },
                  { label: 'Expertise (comma-separated)', key: 'expertise', placeholder: 'Fintech, Fundraising, Scale-ups' },
                ].map(f => (
                  <div key={f.key} className="auth-field">
                    <label>{f.label}</label>
                    {f.multi
                      ? <textarea value={editForm[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder} rows={3}
                          style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                      : <input type="text" value={editForm[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder} className="auth-input" />
                    }
                  </div>
                ))}
                <button onClick={saveProfile} disabled={saving} className="btn btn-primary" style={{ borderRadius: '8px', opacity: saving ? 0.7 : 1 }}>
                  <Save size={15}/> {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'white', fontSize: '1.1rem'
                  }}>{initials}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{name}</div>
                    <div style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>{details?.title || 'No title set'}</div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {details?.bio || <em>No bio yet. Click Edit to add one.</em>}
                </p>

                {details?.expertise?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {details.expertise.map(e => (
                      <span key={e} style={{ background: 'var(--accent-subtle)', border: '1px solid rgba(37,99,235,0.2)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 500 }}>{e}</span>
                    ))}
                  </div>
                )}

                {details?.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Star size={15} fill="#fbbf24" color="#fbbf24" />
                    <strong>{details.rating}</strong> rating · {details.sessions_count || 0} sessions
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
