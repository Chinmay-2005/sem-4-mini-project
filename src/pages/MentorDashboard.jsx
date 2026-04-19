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

  const pending   = requests.filter(r => r.status === 'pending').length;
  const confirmed = requests.filter(r => r.status === 'confirmed').length;

  return (
    <div className="animate-fade-in">

      {/* ── Dashboard Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e8449 0%, #27ae60 100%)',
        padding: '30px 0', color: 'white',
        borderBottom: '3px solid #1e8449'
      }}>
        <div className="layout-container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
              background: profile?.avatar_url
                ? `url(${profile.avatar_url}) center/cover`
                : 'linear-gradient(135deg, #27ae60, #1e8449)',
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
              {details?.title && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{details.title}</p>}
            </div>
          </div>
          <span className="label label-success" style={{ fontSize: '11px', padding: '5px 12px', background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            MENTOR ACCOUNT
          </span>
        </div>
      </div>

      <div className="page-container">

        {/* ── Stats ── */}
        <div className="stats-bar" style={{ marginTop: '-30px', marginBottom: '30px' }}>
          {[
            { label: 'Total Requests',     value: requests.length,  color: '#3498db' },
            { label: 'Pending',            value: pending,          color: '#f39c12' },
            { label: 'Confirmed Sessions', value: confirmed,        color: '#27ae60' },
            { label: 'Rating',             value: details?.rating ? `${details.rating}★` : 'N/A', color: '#9b59b6' },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>

          {/* ── Booking Requests ── */}
          <div>
            <div className="panel">
              <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Session Requests</span>
                {pending > 0 && <span className="label label-warning">{pending} PENDING</span>}
              </div>
              <div className="panel-body">
                {loadingReq ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                    <div className="typing-indicator"><span/><span/><span/></div>
                  </div>
                ) : requests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    <Clock size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
                    <p>No session requests yet.</p>
                    <p style={{ fontSize: '12px' }}>Your profile is live — founders can book you!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {requests.map(r => (
                      <div key={r.id} style={{
                        padding: '15px', border: '1px solid var(--border-light)', borderRadius: '4px',
                        background: 'var(--bg-secondary)',
                        display: 'flex', flexDirection: 'column', gap: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>{r.user?.full_name || 'Founder'}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{r.user?.email}</div>
                          </div>
                          <span className={`label ${
                            r.status === 'pending' ? 'label-warning' :
                            r.status === 'confirmed' ? 'label-success' :
                            r.status === 'completed' ? 'label-info' : 'label-danger'
                          }`}>{r.status?.toUpperCase()}</span>
                        </div>
                        {r.message && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                            "{r.message}"
                          </p>
                        )}
                        {r.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => updateStatus(r.id, 'confirmed')} className="btn btn-success btn-sm" style={{ flex: 1 }}>
                              <CheckCircle size={13} /> Accept
                            </button>
                            <button onClick={() => updateStatus(r.id, 'cancelled')} className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                              <XCircle size={13} /> Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Edit Profile ── */}
          <div>
            <div className="panel">
              <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>My Profile</span>
                {!editing
                  ? <button onClick={() => setEditing(true)} style={{
                      background: 'none', border: 'none', color: 'var(--accent-primary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      fontWeight: 600, fontSize: '12px'
                    }}><Edit3 size={13}/> Edit</button>
                  : <button onClick={() => setEditing(false)} style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', display: 'flex'
                    }}><X size={14}/></button>
                }
              </div>
              <div className="panel-body">

                {statusMsg && (
                  <div className="alert alert-success" style={{ marginBottom: '15px' }}>
                    <CheckCircle size={14} /> {statusMsg}
                  </div>
                )}

                {editing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { label: 'Title / Role', key: 'title', placeholder: 'e.g. Ex-CFO at Stripe' },
                      { label: 'Bio',          key: 'bio',   placeholder: 'Your professional story…', multi: true },
                      { label: 'Expertise (comma-separated)', key: 'expertise', placeholder: 'Fintech, Fundraising, Scale-ups' },
                    ].map(f => (
                      <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                        <label>{f.label}</label>
                        {f.multi
                          ? <textarea value={editForm[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                              placeholder={f.placeholder} rows={3} className="form-control" />
                          : <input type="text" value={editForm[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                              placeholder={f.placeholder} className="form-control" />
                        }
                      </div>
                    ))}
                    <button onClick={saveProfile} disabled={saving} className="btn btn-success" style={{ opacity: saving ? 0.6 : 1 }}>
                      <Save size={14}/> {saving ? 'Saving…' : 'SAVE PROFILE'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #27ae60, #1e8449)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color: 'white', fontSize: '16px',
                        boxShadow: '0 2px 6px rgba(39,174,96,0.3)'
                      }}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '15px' }}>{name}</div>
                        <div style={{ color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 600 }}>{details?.title || 'No title set'}</div>
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7 }}>
                      {details?.bio || <em>No bio yet. Click Edit to add one.</em>}
                    </p>

                    {details?.expertise?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {details.expertise.map(e => (
                          <span key={e} className="label label-primary">{e}</span>
                        ))}
                      </div>
                    )}

                    {details?.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <Star size={14} fill="#f39c12" color="#f39c12" />
                        <strong>{details.rating}</strong> rating · {details.sessions_count || 0} sessions
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
