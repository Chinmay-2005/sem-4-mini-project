import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

// Backend API URL — defaults to localhost for development.
// In production, set VITE_API_URL to your deployed Render backend URL.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/ai/chat';

export default function Agent() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am your AI Startup Advisor, Nexus Advisor. Whether you need strategies for product-led growth, advice on term sheets, or tips for scaling your engineering team, I'm here to help." }
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
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
            content: msg.content
          })),
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.content;

      if (!aiText) throw new Error("Received empty response from AI advisor.");
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      console.error('AI Advisor Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}. Please make sure the backend server is running.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">

      {/* ── Page Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #27ae60 100%)',
        padding: '35px 0', color: 'white',
        borderBottom: '3px solid #219a52'
      }}>
        <div className="layout-container">
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '6px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            AI Startup Advisor
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            Instant, context-aware strategic advice customized for high-growth tech ventures.
          </p>
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className="page-container" style={{ padding: '25px 15px', height: 'calc(100vh - 200px)', maxWidth: '900px' }}>
        <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Panel Heading */}
          <div className="panel-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={16} color="var(--success)" /> Chat Session
            <span className="label label-success" style={{ marginLeft: 'auto' }}>ONLINE</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '15px',
            background: '#fafafa'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #3498db, #2980b9)'
                    : 'linear-gradient(135deg, #27ae60, #219a52)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div style={{
                  background: msg.role === 'user' ? '#3498db' : 'var(--bg-primary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  padding: '12px 16px', borderRadius: '4px',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-light)',
                  maxWidth: '75%', lineHeight: 1.6, fontSize: '13px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #27ae60, #219a52)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0
                }}>
                  <Bot size={18} />
                </div>
                <div style={{
                  background: 'var(--bg-primary)', padding: '15px 18px', borderRadius: '4px',
                  border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)'
                }}>
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <form onSubmit={handleSend} style={{
            padding: '15px 20px', borderTop: '1px solid var(--border-light)',
            background: 'linear-gradient(to bottom, #fafafa, #f0f0f0)',
            display: 'flex', gap: '10px'
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about retention metrics, seed rounds, or tech stacks..."
              className="form-control"
              style={{ flex: 1, fontSize: '13px' }}
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading} className="btn btn-primary" style={{ padding: '8px 18px' }}>
              {loading
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : <Send size={18} />}
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
