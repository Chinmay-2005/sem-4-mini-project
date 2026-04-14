import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navigation, Briefcase, Bot, LayoutDashboard, ChevronRight, Menu, X } from 'lucide-react';
import Home from './pages/Home';
import Mentors from './pages/Mentors';
import Agent from './pages/Agent';
import './index.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Overview' },
    { path: '/mentors', label: 'Mentors' },
    { path: '/agent', label: 'AI Advisor' }
  ];

  return (
    <nav className="glass-panel" style={{ margin: '1rem', position: 'sticky', top: '1rem', zIndex: 50, padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Briefcase size={20} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>Nexus <span style={{ color: 'var(--text-muted)' }}>Mentorship</span></span>
      </div>
      
      {/* Desktop Nav */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
        {navLinks.map((link) => (
          <Link 
            key={link.path} 
            to={link.path}
            style={{ 
              color: location.pathname === link.path ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: location.pathname === link.path ? 600 : 400,
              transition: 'color 0.2s',
              borderBottom: location.pathname === link.path ? '2px solid var(--accent-primary)' : '2px solid transparent',
              paddingBottom: '2px'
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link to="/agent" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
          <Bot size={16} /> Meet AI Agent
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

const Footer = () => (
  <footer style={{ borderTop: '1px solid var(--border-light)', padding: '2rem 0', marginTop: 'auto' }}>
    <div className="layout-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
      <p>© {new Date().getFullYear()} Nexus Mentorship Core. All rights reserved.</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="https://github.com/manav" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          GitHub Source
        </a>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/agent" element={<Agent />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
