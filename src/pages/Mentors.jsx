import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Mail, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Mentors() {
  const [mentors,    setMentors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [booking,    setBooking]    = useState(null);   // mentor id being booked
  const [bookMsg,    setBookMsg]    = useState('');
  const [bookStatus, setBookStatus] = useState({});      // { [mentorId]: 'success'|'error' }

  const { user } = useAuth();

  const [errorMsg, setErrorMsg] = useState('');

  // Hardcoded fallback mentors — always available for demos
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

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchMentors = async () => {
      try {
        setLoading(true);

        // Race the Supabase query against a 5-second timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
        );

        const queryPromise = supabase
          .from('profiles')
          .select(`
            id, full_name, avatar_url,
            mentor_details (title, bio, expertise, rating, sessions_count, available)
          `)
          .eq('role', 'mentor')
          .order('full_name');

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (!isMounted) return;

        if (error) {
          console.error('Supabase error:', error);
          setErrorMsg(error.message);
          setMentors(FALLBACK_MENTORS);
        } else if (data && data.length > 0) {
          setMentors(data.filter(m => m.mentor_details !== null));
        } else {
          // No data returned — use fallback
          setMentors(FALLBACK_MENTORS);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (isMounted) {
          setMentors(FALLBACK_MENTORS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMentors();
    return () => { isMounted = false; controller.abort(); };
  }, []);

  const filtered = mentors.filter(m => {
    const t = searchTerm.toLowerCase();
    const name = m.full_name || '';
    const title = m.mentor_details?.title || '';
    const exp = m.mentor_details?.expertise || [];
    return (
      name.toLowerCase().includes(t) ||
      title.toLowerCase().includes(t) ||
      exp.some(e => typeof e === 'string' && e.toLowerCase().includes(t))
    );
  });

  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000');

  const handleBook = async (mentorId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const mentor = mentors.find(m => m.id === mentorId);
    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      mentor_id: mentorId,
      message: bookMsg || '',
      status: 'pending'
    });
    setBookStatus(prev => ({ ...prev, [mentorId]: error ? 'error' : 'success' }));
    setBooking(null);

    // Send email notification (non-blocking)
    if (!error && mentor) {
      fetch(`${API_URL}/api/notify/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorName: mentor.full_name,
          mentorTitle: mentor.mentor_details?.title,
          userName: user.user_metadata?.full_name || user.email,
          userEmail: user.email,
          message: bookMsg || ''
        })
      }).catch(err => console.log('Email notification failed:', err));
    }

    setBookMsg('');
    setTimeout(() => setBookStatus(prev => ({ ...prev, [mentorId]: null })), 3000);
  };

  return (
    <div className="animate-fade-in">

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

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
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
          <button className="btn btn-outline"><Filter size={14} /> Filters</button>
        </div>

        {/* Not logged in notice */}
        {!user && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            💡 <a href="/login" style={{ fontWeight: 700, color: '#1a5276' }}>Sign in</a> to book a session with a mentor.
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
                <div key={mentor.id} className="panel" style={{ overflow: 'hidden' }}>
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
                    {/* Bio */}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>{d?.bio}</p>

                    {/* Expertise tags */}
                    {d?.expertise?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                        {d.expertise.map(exp => (
                          <span key={exp} className="label label-primary" style={{ fontSize: '10px' }}>
                            {exp}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Session count */}
                    {d?.sessions_count > 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
                        <BookOpen size={12} /> {d.sessions_count} sessions completed
                      </p>
                    )}

                    {/* Booking UI */}
                    {booking === mentor.id ? (
                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea placeholder="Briefly describe what you need help with… (optional)"
                          value={bookMsg} onChange={e => setBookMsg(e.target.value)}
                          rows={2} className="form-control" style={{ fontSize: '13px' }} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleBook(mentor.id)} className="btn btn-success btn-sm" style={{ flex: 1 }}>Confirm</button>
                          <button onClick={() => setBooking(null)} className="btn btn-outline btn-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', gap: '6px' }}>
                        {booked === 'success' ? (
                          <div style={{ flex: 1, textAlign: 'center', color: 'var(--success)', fontWeight: 700, fontSize: '13px', padding: '8px' }}>✓ Session requested!</div>
                        ) : booked === 'error' ? (
                          <div style={{ flex: 1, textAlign: 'center', color: 'var(--danger)', fontSize: '13px', padding: '8px' }}>Failed. Try again.</div>
                        ) : (
                          <>
                            <button onClick={() => setBooking(mentor.id)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                              Request Session
                            </button>
                            <button className="btn btn-outline btn-sm" style={{ padding: '6px 10px' }}><Mail size={14} /></button>
                          </>
                        )}
                      </div>
                    )}
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
    </div>
  );
}
