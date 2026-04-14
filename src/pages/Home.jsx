import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Users, Shield, Zap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.3s', cursor: 'pointer' }} 
       onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
       onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
      <Icon size={24} />
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{description}</p>
  </div>
);

export default function Home() {
  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
      
      {/* Hero Section */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem', marginTop: '4rem' }}>
        <div style={{ background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '0.5rem 1rem', borderRadius: '20px', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={14} /> Powering the next generation of founders
        </div>
        
        <h1 style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, maxWidth: '800px' }}>
          Accelerate Your Startup <br />
          <span style={{ color: 'var(--text-secondary)' }}>With World-Class Mentorship</span>
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', lineHeight: 1.6 }}>
          Connect with industry veterans, get intelligent insights from our AI, and secure the networking advantage you need to scale seamlessly.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/mentors" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Find a Mentor <ChevronRight size={20} />
          </Link>
          <Link to="/agent" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Consult AI Advisor
          </Link>
        </div>
      </section>

      {/* Stats/Social Proof Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
        {[
          { metric: '$2B+', label: 'Funding Raised' },
          { metric: '500+', label: 'Active Mentors' },
          { metric: '98%', label: 'Founder Success Rate' },
          { metric: '24/7', label: 'AI Availability' }
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'monospace' }}>{stat.metric}</div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Value Prop */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>The Mentorship Advantage</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Leveraging institutional knowledge and advanced artificial intelligence to navigate market challenges.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <FeatureCard 
            icon={Users} 
            title="Elite Network" 
            description="Gain direct access to former founders and executives who have successfully navigated IPOs and multi-million dollar exits." 
          />
          <FeatureCard 
            icon={TrendingUp} 
            title="Growth Strategies" 
            description="Data-driven insights to optimize your go-to-market strategy, retention rates, and unit economics." 
          />
          <FeatureCard 
            icon={Shield} 
            title="Risk Mitigation" 
            description="Proactively identify operational bottlenecks and compliance risks before they impact your runway." 
          />
        </div>
      </section>

    </div>
  );
}
