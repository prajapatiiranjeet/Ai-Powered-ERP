import { useState, useRef, useEffect } from 'react';
import { ragService } from '../../services/ragService.js';

const roleLabels = { ADMIN: 'Admin', FACULTY: 'Faculty', STUDENT: 'Student' };

const quickPromptsByRole = {
  STUDENT: [
    { icon: '📚', text: 'Exam Schedule & Syllabus' },
    { icon: '💳', text: 'Fee Payment & Receipts' },
    { icon: '📝', text: 'Attendance Requirements' },
    { icon: '🏛️', text: 'Campus Facilities & Timings' },
  ],
  FACULTY: [
    { icon: '📊', text: 'Student Grade Submission' },
    { icon: '🗓️', text: 'Faculty Leave Application' },
    { icon: '📖', text: 'Course Materials & Roster' },
    { icon: '💡', text: 'Research Grant Support' },
  ],
  ADMIN: [
    { icon: '👥', text: 'User Account Management' },
    { icon: '📈', text: 'System Health & Metrics' },
    { icon: '🔒', text: 'Security & Audit Logs' },
    { icon: '📄', text: 'Generate Department Reports' },
  ]
};

// Web audio synthesizer for clean, subtle UI audio feedback
const playChimeSound = (type = 'send') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    if (type === 'send') {
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    } else {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch {
    // Ignore audio context policy block
  }
};

export default function RagChatbot({ role = 'STUDENT' }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: `Hello ${roleLabels[role] ?? 'there'}! I am **SHERPAL**, your intelligent NIU campus assistant. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open && !minimized) {
      scrollToBottom();
    }
  }, [messages, open, minimized, isTyping]);

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || question).trim();
    if (!queryText || isTyping) return;

    if (soundEnabled) playChimeSound('send');

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      from: 'user',
      text: queryText,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsTyping(true);

    try {
      const answer = await ragService.ask(role, queryText);
      if (soundEnabled) playChimeSound('receive');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: typeof answer === 'string' ? answer : answer?.answer || 'SHERPAL returned an empty response.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: `Sorry, SHERPAL could not answer right now. ${error?.message || 'Please try again.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        from: 'bot',
        text: `Chat cleared. What else can **SHERPAL** help you with?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const quickPrompts = quickPromptsByRole[role] || quickPromptsByRole.STUDENT;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6 font-sans">
      {/* Chat Window */}
      {open && (
        <section
          className={`glass-chat-container flex w-[min(400px,calc(100vw-2rem))] flex-col rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 animate-chat-pop ${
            minimized ? 'h-[68px]' : 'h-[min(580px,calc(100vh-6.5rem))]'
          }`}
          aria-label="SHERPAL AI Assistant"
        >
          {/* Header */}
          <div className="glass-chat-header flex items-center justify-between p-3.5 text-white">
            <div className="flex items-center gap-3">
              {/* Bot Avatar */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-niu-gold-400 p-0.5 shadow-md shadow-emerald-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 text-emerald-400">
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" />
                    <rect width="16" height="12" x="4" y="8" rx="2" />
                    <path d="M2 14h2M20 14h2M9 14h.01M15 14h.01" />
                  </svg>
                </div>
                {/* Live Online Glow Dot */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-900"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold tracking-tight text-white">
                    SHERPAL
                  </h3>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                    AI
                  </span>
                </div>
                <p className="text-[11px] font-medium text-emerald-200/80">
                  NIU Campus Assistant · {roleLabels[role] ?? role}
                </p>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1 text-slate-300">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors"
                title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? (
                  <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                ) : (
                  <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                )}
              </button>

              {/* Clear Chat */}
              {!minimized && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors"
                  title="Clear Conversation"
                  aria-label="Clear Chat"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              )}

              {/* Minimize / Expand */}
              <button
                type="button"
                onClick={() => setMinimized(!minimized)}
                className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors"
                title={minimized ? 'Expand Window' : 'Minimize Window'}
                aria-label="Minimize Chat"
              >
                {minimized ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                )}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          {!minimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm text-slate-100 scrollbar-thin scrollbar-thumb-slate-700">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.from === 'user'
                          ? 'glass-bubble-user rounded-2xl rounded-tr-xs text-white'
                          : 'glass-bubble-bot rounded-2xl rounded-tl-xs text-slate-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {msg.text.split('**').map((part, i) =>
                          i % 2 === 1 ? <strong key={i} className="font-extrabold text-emerald-300">{part}</strong> : part
                        )}
                      </p>
                    </div>
                    <span className="mt-1 px-1 text-[10px] font-medium text-slate-400/80">
                      {msg.time}
                    </span>
                  </div>
                ))}

                {/* Typing Dots Indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start">
                    <div className="glass-bubble-bot flex items-center gap-2 rounded-2xl rounded-tl-xs px-3.5 py-2.5">
                      <span className="text-xs font-medium text-emerald-300">SHERPAL is thinking</span>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 border-t border-white/5 bg-slate-950/40">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">
                  Quick Prompts
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(prompt.text)}
                      className="glass-pill whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-emerald-300 flex items-center gap-1.5 flex-shrink-0"
                    >
                      <span>{prompt.icon}</span>
                      <span>{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSubmit} className="p-3 bg-slate-950/60 border-t border-white/10">
                <div className="glass-input-box flex items-center gap-2 rounded-2xl p-1.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all">
                  <input
                    type="text"
                    className="min-w-0 flex-1 bg-transparent px-3 py-1 text-sm text-white placeholder-slate-400 outline-none"
                    placeholder="Ask SHERPAL anything..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!question.trim() || isTyping}
                    className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      )}

      {/* Sleek Minimal Floating Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setMinimized(false);
        }}
        className="group relative flex items-center gap-2.5 rounded-full bg-slate-900/85 hover:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xl shadow-slate-950/40 backdrop-blur-xl border border-emerald-500/35 transition-all duration-300 hover:scale-105 hover:border-emerald-400/60 active:scale-95"
        aria-expanded={open}
        aria-label={open ? 'Close SHERPAL assistant' : 'Open SHERPAL assistant'}
      >
        {/* Soft subtle green glow ring on hover */}
        <div className="absolute -inset-0.5 rounded-full bg-emerald-500/20 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>

        <div className="relative flex items-center gap-2">
          {/* Minimal Sparkle Icon with Online Pulse Dot */}
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400">
            <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2M20 14h2M9 14h.01M15 14h.01" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          </div>

          <span className="tracking-wide text-slate-100 font-bold">
            {open ? (minimized ? 'SHERPAL' : 'Close') : 'SHERPAL'}
          </span>
        </div>
      </button>
    </div>
  );
}
