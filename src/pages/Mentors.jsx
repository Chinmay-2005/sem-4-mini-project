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

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, avatar_url,
          mentor_details (title, bio, expertise, rating, sessions_count, available)
        `)
        .eq('role', 'mentor')
        .order('full_name');

      if (!error && data) {
        setMentors(data.filter(m => m.mentor_details !== null));
      }
      setLoading(false);
    })();
  }, []);

  const filtered = mentors.filter(m => {
    const t = searchTerm.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(t) ||
      m.mentor_details?.title?.toLowerCase().includes(t) ||
      m.mentor_details?.expertise?.some(e => e.toLowerCase().includes(t))
    );
  });

  const handleBook = async (mentorId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      mentor_id: mentorId,
      message: bookMsg || '',
      status: 'pending'
    });
    setBookStatus(prev => ({ ...prev, [mentorId]: error ? 'error' : 'success' }));
    setBooking(null);
    setBookMsg('');
    setTimeout(() => setBookStatus(prev => ({ ...prev, [mentorId]: null })), 3000);
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mentor Directory</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Connect with industry leaders who have navigated the path before.</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1rem', flex: '1', minWidth: '280px' }}>
          <Search size={18} color="var(--text-secondary)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
          <input type="text" placeholder="Search by name, expertise, or role…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '0.95rem' }} />
        </div>
        <button className="btn btn-outline"><Filter size={16} /> Filters</button>
      </div>

      {/* Not logged in warning */}
      {!user && (
        <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '0.75rem 1.25rem', marginBottom: '2rem', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
          💡 <a href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in</a> to book a session with a mentor.
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '2rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ height: '280px', padding: '1.5rem', animation: 'pulse 1.5s infinite' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-elevated)', marginBottom: '1rem' }} />
              <div style={{ width: '60%', height: '20px', background: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '0.5rem' }} />
              <div style={{ width: '40%', height: '14px', background: 'var(--bg-elevated)', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '2rem' }}>
          {filtered.map(mentor => {
            const d = mentor.mentor_details;
            const initials = mentor.full_name.split(' ').map(n=>n[0]).join('').slice(0,2);
            const booked = bookStatus[mentor.id];

            return (
              <div key={mentor.id} className="glass-panel"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                      background: mentor.avatar_url ? `url(${mentor.avatar_url}) center/cover` : 'linear-gradient(135deg, #10b981, #3b82f6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1.1rem', color: 'white'
                    }}>
                      {!mentor.avatar_url && initials}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{mentor.full_name}</h3>
                      <p style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 500 }}>{d?.title}</p>
                    </div>
                  </div>
                  {d?.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-elevated)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <Star size={13} fill="#fbbf24" color="#fbbf24" /> {d.rating}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, flex: 1 }}>{d?.bio}</p>

                {/* Expertise tags */}
                {d?.expertise?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {d.expertise.map(exp => (
                      <span key={exp} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {exp}
                      </span>
                    ))}
                  </div>
                )}

                {/* Session count */}
                {d?.sessions_count > 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <BookOpen size={11} /> {d.sessions_count} sessions completed
                  </p>
                )}

                {/* Booking inline */}
                {booking === mentor.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                    <textarea placeholder="Briefly describe what you need help with… (optional)"
                      value={bookMsg} onChange={e => setBookMsg(e.target.value)}
                      rows={2} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white', padding: '0.6rem', fontSize: '0.85rem', resize: 'none', fontFamily: 'inherit', outline: 'none' }} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleBook(mentor.id)} className="btn btn-primary" style={{ flex: 1, padding: '0.6rem' }}>Confirm Request</button>
                      <button onClick={() => setBooking(null)} className="btn btn-outline" style={{ padding: '0.6rem 0.9rem' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {booked === 'success' ? (
                      <div style={{ flex: 1, textAlign: 'center', color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Session requested!</div>
                    ) : booked === 'error' ? (
                      <div style={{ flex: 1, textAlign: 'center', color: '#ef4444', fontSize: '0.9rem' }}>Failed. Try again.</div>
                    ) : (
                      <>
                        <button onClick={() => setBooking(mentor.id)} className="btn btn-primary" style={{ flex: 1 }}>Request Session</button>
                        <button className="btn btn-outline" style={{ padding: '0.75rem' }}><Mail size={16} /></button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              No mentors found matching "{searchTerm}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
