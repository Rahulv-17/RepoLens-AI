import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  repoId: string;
  repoName: string;
  token: string;
}

const SUGGESTED_PROMPTS = [
  '"Where is auth handled?"',
  '"Explain the data flow"',
  '"Find bottlenecks"',
  '"Generate unit tests"',
  '"List all API endpoints"',
];

export function AiChat({ repoId, repoName, token }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 192) + 'px';
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsStreaming(true);

    try {
      const res = await fetch(`http://localhost:5000/api/repos/${repoId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.ok ? (data.response || data.message || 'Analysis complete.') : `Error: ${data.error || 'Request failed'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Unable to connect to the AI service. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-6 relative">
      {/* Decorative glows */}
      <div className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none -z-10"
        style={{ background: 'rgba(0,240,255,0.06)', filter: 'blur(120px)', borderRadius: '50%' }} />
      <div className="fixed top-1/4 left-1/4 w-72 h-72 pointer-events-none -z-10"
        style={{ background: 'rgba(87,27,193,0.05)', filter: 'blur(100px)', borderRadius: '50%' }} />

      {/* ── Empty State ── */}
      {messages.length === 0 && !isStreaming && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'rgba(0,240,255,0.1)',
                border: '1px solid rgba(0,240,255,0.2)',
                boxShadow: '0 0 20px rgba(0,240,255,0.1)',
              }}
            >
              <span className="material-symbols-outlined text-3xl" style={{ color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '20px', color: '#dce4e5' }}>
                AI Repository Chat
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" 
                style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.2)', letterSpacing: '0.05em' }}>
                BETA
              </span>
            </div>
            <p style={{ color: '#849495', fontSize: '14px', maxWidth: '360px', lineHeight: 1.6 }}>
              Ask anything about <span style={{ color: '#00f0ff' }}>{repoName}</span>. I've analyzed the entire codebase and can answer questions about architecture, data flow, and implementation details.
            </p>
          </motion.div>
        </div>
      )}

      {/* ── Message History ── */}
      {(messages.length > 0 || isStreaming) && (
        <div className="flex-1 overflow-y-auto py-8 space-y-8 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'gap-4'}`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] flex flex-col items-end">
                    <div className="px-5 py-3 rounded-2xl rounded-tr-none"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(20px)',
                        color: '#dce4e5',
                        fontSize: '15px',
                        lineHeight: 1.6,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {msg.content}
                    </div>
                    <span style={{ fontSize: '10px', color: '#849495', marginTop: '6px' }}>{formatTime(msg.timestamp)}</span>
                  </div>
                ) : (
                  <>
                    {/* AI avatar */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ background: '#00f0ff', boxShadow: '0 0 12px rgba(0,240,255,0.3)' }}>
                      <span className="material-symbols-outlined text-base" style={{ color: '#00363a', fontVariationSettings: "'FILL' 1" }}>
                        smart_toy
                      </span>
                    </div>
                    <div className="max-w-[85%]">
                      <div className="p-5 rounded-2xl rounded-tl-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,240,255,0.03) 100%)',
                          border: '1px solid rgba(0,240,255,0.15)',
                          backdropFilter: 'blur(20px)',
                        }}
                      >
                        {/* AI Analysis badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: 'rgba(0,240,255,0.08)',
                              border: '1px solid rgba(0,240,255,0.2)',
                              color: '#00f0ff',
                              fontFamily: 'Geist, sans-serif',
                              letterSpacing: '0.08em',
                            }}>
                            AI ANALYSIS
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00f0ff' }} />
                          <span style={{ fontSize: '10px', color: '#849495' }}>Verified Context</span>
                        </div>

                        <div className="markdown-body" style={{ color: '#dce4e5', fontSize: '15px', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-2 px-1">
                        <span style={{ fontSize: '10px', color: '#849495' }}>{formatTime(msg.timestamp)}</span>
                        <div className="flex gap-2">
                          {['thumb_up', 'thumb_down', 'refresh'].map(icon => (
                            <button key={icon}
                              className="transition-colors"
                              style={{ color: '#849495' }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = icon === 'thumb_down' ? '#ffb4ab' : '#00f0ff')}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#849495')}
                            >
                              <span className="material-symbols-outlined text-base">{icon}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming dots */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(35,43,44,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="material-symbols-outlined text-base animate-pulse-cyan" style={{ color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: '#00f0ff',
                        animation: `bounce-dot 1.2s ${delay}ms infinite ease-in-out`,
                      }} />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: '#849495', fontStyle: 'italic', fontFamily: 'Geist, sans-serif', letterSpacing: '0.04em' }}>
                  AI is exploring the source tree...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="pb-6 pt-4">
        {/* Suggested prompts */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED_PROMPTS.map(prompt => (
              <motion.button
                key={prompt}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(prompt.replace(/"/g, ''))}
                className="px-4 py-2 rounded-full text-xs transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#b9cacb',
                  fontFamily: 'Inter, sans-serif',
                  backdropFilter: 'blur(20px)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.3)';
                  (e.currentTarget as HTMLElement).style.color = '#00f0ff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#b9cacb';
                }}
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        )}

        {/* Text input */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none"
            style={{ background: 'rgba(0,240,255,0.03)', filter: 'blur(20px)' }} />
          <div className="relative rounded-2xl p-2 flex flex-col gap-2"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the repository..."
              disabled={isStreaming}
              rows={1}
              className="w-full bg-transparent border-none outline-none resize-none custom-scrollbar px-4 py-3"
              style={{
                color: '#dce4e5',
                fontSize: '15px',
                lineHeight: 1.6,
                fontFamily: 'Inter, sans-serif',
                minHeight: '56px',
                maxHeight: '192px',
              }}
            />

            <div className="flex items-center justify-between px-2 pb-1">
              <div />

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(0,240,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all"
                style={{
                  background: input.trim() && !isStreaming ? '#00f0ff' : 'rgba(0,240,255,0.2)',
                  color: '#00363a',
                  fontFamily: 'Geist, sans-serif',
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  cursor: (!input.trim() || isStreaming) ? 'not-allowed' : 'pointer',
                }}
              >
                SEND
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
              </motion.button>
            </div>
          </div>
        </div>

        <p className="text-center mt-3" style={{ fontSize: '10px', color: '#849495', fontFamily: 'Geist, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.5 }}>
          RepoLens AI can make mistakes. Verify critical code.
        </p>
      </div>
    </div>
  );
}
