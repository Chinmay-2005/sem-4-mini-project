import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import OpenAI from 'openai';

// Ensure the OpenAI key is loaded securely
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // This is needed for a frontend-only deploy, though not recommended for prod.
});

export default function Agent() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am your AI Startup Advisor. Whether you need strategies for product-led growth, advice on term sheets, or tips for scaling your engineering team, I'm here to help." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: "Error: No API Key provided in environment variables (VITE_OPENAI_API_KEY). For deployment, ensure it's set as a GitHub Repository Secret." }]);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an elite startup advisor and mentor. You provide highly professional, concise, and actionable advice tailored to tech founders and fintech executives. Avoid generic responses; use industry terminology accurately.' },
          ...messages,
          userMessage
        ]
      });

      setMessages(prev => [...prev, response.choices[0].message]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error connecting to the neural network. Please verify your API key or try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', padding: '2rem', height: 'calc(100vh - 100px)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Setup Advisor</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Instant, context-aware strategic advice customized for high-growth tech ventures.</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0', border: '1px solid var(--border-light)' }}>
        
        {/* Chat Feed */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} color="var(--success)" />}
              </div>
              <div style={{ background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-elevated)', padding: '1rem 1.5rem', borderRadius: '16px', borderTopLeftRadius: msg.role === 'assistant' ? 0 : '16px', borderTopRightRadius: msg.role === 'user' ? 0 : '16px', color: 'var(--text-primary)', maxWidth: '80%', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <Bot size={20} color="var(--success)" />
              </div>
              <div style={{ background: 'var(--bg-elevated)', padding: '1.5rem', borderRadius: '16px', borderTopLeftRadius: 0 }}>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-secondary)', display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about retention metrics, seed rounds, or tech stacks..." 
            style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading} className="btn btn-primary" style={{ padding: '0 1.5rem', borderRadius: '12px' }}>
            {loading ? <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={24} />}
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </button>
        </form>
      </div>
    </div>
  );
}
