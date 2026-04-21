import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Mail, BookOpen, X, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Hardcoded fallback mentors — always available instantly
const FALLBACK_MENTORS = [
  {
    id: 'fallback-1', full_name: 'David Kim', avatar_url: null,
    mentor_details: { title: 'Founder & CEO (Exited @ $180M)', bio: 'Bootstrapped to $50M ARR and successfully exited via acquisition. Mentors founders on capital-efficient growth loops, M&A preparation, and post-exit strategy.', expertise: ['Consumer Tech', 'Product Led Growth', 'M&A'], rating: 4.9, sessions_count: 176, available: true }
  },
  {
    id: 'fallback-2', full_name: 'Elena Rodriguez', avatar_url: null,
    mentor_details: { title: 'Ex-CFO at Stripe', bio: 'Scaled payments infrastructure globally across 40+ countries. Specializes in Series B to IPO financial strategy and FinTech regulatory compliance.', expertise: ['Fintech', 'Fundraising', 'Scale-ups'], rating: 4.9, sessions_count: 142, available: true }
  },
  {
    id: 'fallback-3', full_name: 'Marcus Chen', avatar_url: null,
    mentor_details: { title: 'Former VP Engineering, Coinbase', bio: 'Built scalable engineering teams from 10 to 500+. Passionate about robust distributed systems, zero-downtime deployments, and security-first architecture.', expertise: ['Blockchain', 'System Architecture', 'Security'], rating: 5.0, sessions_count: 89, available: true }
  },
  {
    id: 'fallback-4', full_name: 'Sarah Jenkins', avatar_url: null,
    mentor_details: { title: 'Partner at Sequoia Capital', bio: '10+ years investing in enterprise software. Helps founders refine their pitch deck, pricing strategy, and navigate the venture fundraising landscape.', expertise: ['Venture Capital', 'B2B SaaS', 'GTM Strategy'], rating: 4.8, sessions_count: 207, available: true }
  }
];

export default function Mentors() {
  const [mentors,    setMentors]    = useState(FALLBACK_MENTORS);
  const [loading,    setLoading]    = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookStatus, setBookStatus] = useState({});      // { [mentorId]: 'success'|'error' }

  // Filter state
  const [showFilters,  setShowFilters]  = useState(false);
  const [filterTag,    setFilterTag]    = useState('');
  const [filterRating, setFilterRating] = useState(0);

  // Modal state
  const [modalMentor,  setModalMentor]  = useState(null); // mentor object for modal
  const [bookMsg,      setBookMsg]      = useState('');
  const [bookDate,     setBookDate]     = useState('');
  const [bookTime,     setBookTime]     = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  // Toast state
  const [toast, setToast] = useState(null); // { type: 'success'|'error', text: '...' }

  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  // Try to load real data from Supabase in the background (non-blocking)
  useEffect(() => {
    let isMounted = true;
    const fetchMentors = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 4000)
        );
        const queryPromise = supabase
          .from('profiles')
          .select(`id, full_name, avatar_url, mentor_details (title, bio, expertise, rating, sessions_count, available)`)
          .eq('role', 'mentor')
          .order('full_name');
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
        if (!isMounted) return;
        if (!error && data && data.length > 0) {
          setMentors(data.filter(m => m.mentor_details !== null));
        }
      } catch { /* fallback already showing */ }
    };
    fetchMentors();
    return () => { isMounted = false; };
  }, []);

  // Collect all unique expertise tags
  const allTags = [...new Set(mentors.flatMap(m => m.mentor_details?.expertise || []))].sort();

  // Filtered mentors
  const filtered = mentors.filter(m => {
    const t = searchTerm.toLowerCase();
    const name = m.full_name || '';
    const title = m.mentor_details?.title || '';
    const exp = m.mentor_details?.expertise || [];
    const matchesSearch = name.toLowerCase().includes(t) || title.toLowerCase().includes(t) || exp.some(e => typeof e === 'string' && e.toLowerCase().includes(t));
    const matchesTag = !filterTag || exp.includes(filterTag);
    const matchesRating = !filterRating || (m.mentor_details?.rating || 0) >= filterRating;
    return matchesSearch && matchesTag && matchesRating;
  });

  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000');

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBook = async () => {
    if (!modalMentor || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      mentor_id: modalMentor.id,
      message: bookMsg || '',
      status: 'pending'
    });

    if (!error) {
      // Send email notification (non-blocking)
      fetch(`${API_URL}/api/notify/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorName: modalMentor.full_name,
          mentorTitle: modalMentor.mentor_details?.title,
          userName: user.user_metadata?.full_name || user.email,
          userEmail: user.email,
          message: `${bookMsg || 'No message'}${bookDate ? ` | Preferred: ${bookDate} ${bookTime}` : ''}`
        })
      }).catch(err => console.log('Email notification failed:', err));

      showToast('success', `Session requested with ${modalMentor.full_name}! Check your dashboard for updates.`);
    } else {
      showToast('error', 'Failed to request session. Please try again.');
    }

    setModalMentor(null);
    setBookMsg('');
    setBookDate('');
    setBookTime('');
    setSubmitting(false);
  };

  const openModal = (mentor) => {
    if (!user) { window.location.href = '/sem-4-mini-project/login'; return; }
    setModalMentor(mentor);
  };

  return (
    <div className="animate-fade-in">

      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '70px', right: '20px', zIndex: 9999,
          padding: '14px 20px', borderRadius: '6px', maxWidth: '380px',
          background: toast.type === 'success' ? '#27ae60' : '#e74c3c',
          color: 'white', fontSize: '13px', fontWeight: 600,
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <CheckCircle size={18} />
          {toast.text}
          <button onClick={() => setToast(null)} style={{
            background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 'auto', padding: '0'
          }}><X size={16} /></button>
        </div>
      )}

      {/* ── Booking Modal ── */}
      {modalMentor && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setModalMentor(null)}>
          <div style={{
            background: 'white', borderRadius: '8px', width: '90%', maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #2c3e50, #3498db)',
              padding: '20px 24px', color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'white' }}>Request Session</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                  with {modalMentor.full_name}
                </p>
              </div>
              <button onClick={() => setModalMentor(null)} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><X size={16} /></button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Mentor Info */}
              <div style={{
                display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px',
                padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee'
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #3498db, #2980b9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', color: 'white'
                }}>
                  {modalMentor.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{modalMentor.full_name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{modalMentor.mentor_details?.title}</div>
                </div>
                {modalMentor.mentor_details?.rating && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: 700 }}>
                    <Star size={14} fill="#f39c12" color="#f39c12" /> {modalMentor.mentor_details.rating}
                  </div>
                )}
              </div>

              {/* Message */}
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                What do you need help with?
              </label>
              <textarea
                placeholder="E.g., I need advice on my Series A pitch deck…"
                value={bookMsg} onChange={e => setBookMsg(e.target.value)}
                rows={3} className="form-control"
                style={{ fontSize: '13px', marginBottom: '16px', resize: 'vertical' }}
              />

              {/* Date & Time */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Calendar size={12} /> Preferred Date
                  </label>
                  <input type="date" value={bookDate} onChange={e => setBookDate(e.target.value)}
                    className="form-control" style={{ fontSize: '13px' }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Clock size={12} /> Preferred Time
                  </label>
                  <input type="time" value={bookTime} onChange={e => setBookTime(e.target.value)}
                    className="form-control" style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setModalMentor(null)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button onClick={handleBook} disabled={submitting} className="btn btn-primary" style={{ flex: 2 }}>
                  {submitting ? 'Submitting…' : '🚀 Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
        padding: '45px 0', color: 'white',
        borderBottom: '3px solid #2980b9'
      }}>
        <div className="layout-container">
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '6px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Mentor Directory
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>
            Connect with industry leaders who have navigated the path before.
          </p>
        </div>
      </div>

      <div className="page-container">

        {/* Search + Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: showFilters ? '10px' : '25px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', padding: '0 12px', flex: 1, minWidth: '280px',
            background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: '4px',
            boxShadow: 'var(--shadow-inset)'
          }}>
            <Search size={16} color="var(--text-muted)" style={{ marginRight: '10px', flexShrink: 0 }} />
            <input type="text" placeholder="Search by name, expertise, or role…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent', border: 'none', color: 'var(--text-primary)',
                width: '100%', outline: 'none', fontSize: '14px', padding: '10px 0',
                fontFamily: 'inherit'
              }} />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            style={{ transition: 'all 0.2s' }}
          >
            <Filter size={14} /> Filters {(filterTag || filterRating) ? `(${[filterTag, filterRating ? `${filterRating}+★` : ''].filter(Boolean).join(', ')})` : ''}
          </button>
        </div>

        {/* ── Filter Panel ── */}
        {showFilters && (
          <div className="panel" style={{
            padding: '16px 20px', marginBottom: '25px',
            display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap',
            animation: 'slideDown 0.2s ease-out',
            borderLeft: '3px solid #3498db'
          }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Expertise / Tag
              </label>
              <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
                className="form-control" style={{ fontSize: '13px' }}>
                <option value="">All Expertise</option>
                {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
            <div style={{ minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Minimum Rating
              </label>
              <select value={filterRating} onChange={e => setFilterRating(Number(e.target.value))}
                className="form-control" style={{ fontSize: '13px' }}>
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
                <option value={5}>5 Stars Only</option>
              </select>
            </div>
            <button onClick={() => { setFilterTag(''); setFilterRating(0); }}
              className="btn btn-outline btn-sm"
              style={{ marginBottom: '1px' }}>
              Clear Filters
            </button>
          </div>
        )}

        {/* Not logged in notice */}
        {!user && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            💡 <a href="/sem-4-mini-project/login" style={{ fontWeight: 700, color: '#1a5276' }}>Sign in</a> to book a session with a mentor.
          </div>
        )}

        {/* Mentor Cards */}
        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <strong>Error loading mentors:</strong> {errorMsg}
          </div>
        )}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '20px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="panel" style={{ padding: '20px', animation: 'pulse 1.5s infinite' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-elevated)', marginBottom: '12px' }} />
                <div style={{ width: '60%', height: '16px', background: 'var(--bg-elevated)', borderRadius: '3px', marginBottom: '8px' }} />
                <div style={{ width: '40%', height: '12px', background: 'var(--bg-elevated)', borderRadius: '3px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '20px' }}>
            {filtered.map(mentor => {
              const d = mentor.mentor_details;
              const initials = mentor.full_name.split(' ').map(n=>n[0]).join('').slice(0,2);
              const booked = bookStatus[mentor.id];

              return (
                <div key={mentor.id} className="panel" style={{
                  overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                  {/* Panel Header */}
                  <div style={{
                    background: 'linear-gradient(to bottom, #fafafa, #f0f0f0)',
                    borderBottom: '1px solid var(--border-light)',
                    padding: '15px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                        background: mentor.avatar_url ? `url(${mentor.avatar_url}) center/cover` : 'linear-gradient(135deg, #3498db, #2980b9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '14px', color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                      }}>
                        {!mentor.avatar_url && initials}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{mentor.full_name}</h3>
                        <p style={{ color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 600, margin: 0 }}>{d?.title}</p>
                      </div>
                    </div>
                    {d?.rating && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '3px',
                        background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: '3px',
                        fontSize: '12px', fontWeight: 700, border: '1px solid var(--border-light)'
                      }}>
                        <Star size={12} fill="#f39c12" color="#f39c12" /> {d.rating}
                      </div>
                    )}
                  </div>

                  {/* Panel Body */}
                  <div style={{ padding: '15px 20px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>{d?.bio}</p>

                    {d?.expertise?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                        {d.expertise.map(exp => (
                          <span key={exp} className="label label-primary" style={{
                            fontSize: '10px', cursor: 'pointer', transition: 'opacity 0.2s'
                          }}
                          onClick={() => { setFilterTag(exp); setShowFilters(true); }}>
                            {exp}
                          </span>
                        ))}
                      </div>
                    )}

                    {d?.sessions_count > 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
                        <BookOpen size={12} /> {d.sessions_count} sessions completed
                      </p>
                    )}

                    {/* Booking actions */}
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', gap: '6px' }}>
                      {booked === 'success' ? (
                        <div style={{ flex: 1, textAlign: 'center', color: 'var(--success)', fontWeight: 700, fontSize: '13px', padding: '8px' }}>✓ Session requested!</div>
                      ) : (
                        <>
                          <button onClick={() => openModal(mentor)} className="btn btn-primary btn-sm" style={{
                            flex: 1, transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(52,152,219,0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            Request Session
                          </button>
                          <button className="btn btn-outline btn-sm" style={{
                            padding: '6px 10px', transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#3498db'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ''; }}>
                            <Mail size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && !loading && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                No mentors found matching "{searchTerm}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
