import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Users, Shield, Zap, CheckCircle } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">
      <Icon size={28} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export default function Home() {
  return (
    <div className="animate-fade-in">

      {/* ── Hero Banner — big gradient, centered text ── */}
      <div className="hero-banner">
        <div style={{ maxWidth: '1170px', margin: '0 auto', padding: '0 15px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 16px', borderRadius: '3px', color: 'white',
            fontSize: '12px', fontWeight: 700, marginBottom: '20px',
            textTransform: 'uppercase', letterSpacing: '1px'
          }}>
            <Zap size={14} /> Powering the next generation of founders
          </div>

          <h1>
            Accelerate Your Startup<br />
            With World-Class Mentorship
          </h1>

          <p>
            Connect with industry veterans, get intelligent insights from our AI advisor,
            and secure the networking advantage you need to scale your startup.
          </p>

          <div>
            <Link to="/mentors" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Find a Mentor <ChevronRight size={18} />
            </Link>
            <Link to="/agent" className="btn btn-outline btn-lg" style={{
              textDecoration: 'none',
              color: 'white', borderColor: 'rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.08)'
            }}>
              Consult AI Advisor
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Bar — overlapping the hero ── */}
      <div className="page-container" style={{ paddingTop: 0, paddingBottom: '50px' }}>
        <div className="stats-bar">
          {[
            { metric: '$2B+', label: 'Funding Raised' },
            { metric: '500+', label: 'Active Mentors' },
            { metric: '98%', label: 'Success Rate' },
            { metric: '24/7', label: 'AI Available' }
          ].map((stat, i) => (
            <div key={i} className="stat-item">
              <div className="stat-number">{stat.metric}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features Section ── */}
      <div className="page-container" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <h2>The Mentorship Advantage</h2>
          <p>Leveraging institutional knowledge and advanced artificial intelligence to navigate market challenges.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
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
      </div>

      {/* ── How It Works Section ── */}
      <div style={{ background: 'var(--bg-primary)', padding: '60px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', marginTop: '40px' }}>
        <div className="page-container" style={{ padding: '0 15px' }}>
          <div className="section-heading">
            <h2>How It Works</h2>
            <p>Get started in three simple steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up as a founder or a mentor. Setup takes less than 2 minutes.' },
              { step: '2', title: 'Find Your Match', desc: 'Browse our curated directory and filter mentors by expertise area.' },
              { step: '3', title: 'Start Growing', desc: 'Book sessions, get AI-powered advice, and accelerate your success.' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3498db, #2980b9)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 900, margin: '0 auto 15px',
                  boxShadow: '0 4px 12px rgba(52,152,219,0.3)',
                  fontFamily: "'Lato', sans-serif"
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Section ── */}
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="page-container">
          <div style={{
            background: 'linear-gradient(135deg, #2c3e50, #3498db)',
            borderRadius: '6px', padding: '50px 40px', color: 'white',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '10px' }}>Ready to accelerate your startup?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '25px' }}>
              Join thousands of founders who are scaling faster with expert mentorship.
            </p>
            <Link to="/signup" className="btn btn-lg" style={{
              background: 'linear-gradient(to bottom, #27ae60, #219a52)',
              color: 'white', borderColor: '#1e8449',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              textShadow: '0 1px 1px rgba(0,0,0,0.2)',
              textDecoration: 'none'
            }}>
              <CheckCircle size={18} /> GET STARTED FREE
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
