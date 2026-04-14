import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Briefcase, ExternalLink, Mail } from 'lucide-react';

const mockMentors = [
  {
    id: 1,
    name: "Elena Rodriguez",
    role: "Ex-CFO at Stripe",
    expertise: ["Fintech", "Fundraising", "Scale-ups"],
    bio: "Scaled payments infrastructure globally. Specializes in Series B to IPO transition.",
    rating: 4.9,
    avatar: "ER"
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Former VP Engineering, Coinbase",
    expertise: ["Blockchain", "System Architecture", "Security"],
    bio: "Built scalable engineering teams from 10 to 500+. Passionate about robust distributed systems.",
    rating: 5.0,
    avatar: "MC"
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    role: "Partner at Sequoia",
    expertise: ["Venture Capital", "B2B SaaS", "GTM Strategy"],
    bio: "10+ years investing in enterprise software. Helps founders refine their pitch and pricing.",
    rating: 4.8,
    avatar: "SJ"
  },
  {
    id: 4,
    name: "David Kim",
    role: "Founder & CEO (Exited)",
    expertise: ["Consumer Tech", "Product Led Growth", "M&A"],
    bio: "Bootstrapped to $50M ARR and acquired. Mentors on capital-efficient growth loops.",
    rating: 4.9,
    avatar: "DK"
  }
];

export default function Mentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate network request
  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // fake delay
      setMentors(mockMentors);
      setLoading(false);
    };
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mentor Directory</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Connect with industry leaders who have navigated the path before.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', flex: '1', minWidth: '300px' }}>
          <Search size={20} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Search by name, expertise, or industry..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' 
            }}
          />
        </div>
        <button className="btn btn-outline">
          <Filter size={18} /> Filters
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ height: '300px', padding: '1.5rem', animation: 'pulse 1.5s infinite' }}>
               <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-elevated)', marginBottom: '1rem' }} />
               <div style={{ width: '60%', height: '24px', background: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '0.5rem' }} />
               <div style={{ width: '40%', height: '16px', background: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '2rem' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {filteredMentors.map(mentor => (
            <div key={mentor.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.2rem', color: 'var(--success)' }}>
                    {mentor.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{mentor.name}</h3>
                    <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 500 }}>{mentor.role}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', background: 'var(--bg-elevated)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  <Star size={14} fill="currentColor" color="#fbbf24" /> {mentor.rating}
                </div>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, flex: 1 }}>
                {mentor.bio}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                {mentor.expertise.map((exp, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {exp}
                  </span>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>Request Session</button>
                <button className="btn btn-outline" style={{ padding: '0.75rem' }}><Mail size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
