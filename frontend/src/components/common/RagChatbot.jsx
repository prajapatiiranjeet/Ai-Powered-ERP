import { useState, useRef, useEffect } from 'react';
import { ragService } from '../../services/ragService.js';
import LionIcon from './LionIcon.jsx';

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
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    } else {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
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

// Formats inline text (bold, code)
function parseInlineFormatting(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-emerald-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-emerald-950/80 px-1.5 py-0.5 font-mono text-[11px] text-emerald-300 border border-emerald-500/30">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Renders Markdown Tables (| Col1 | Col2 |), bullet points, and paragraphs cleanly
function renderFormattedMessage(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableHeader = [];
  let tableRows = [];
  let currentKey = 0;

  const flushTable = () => {
    if (tableHeader.length > 0) {
      elements.push(
        <div key={`table-${currentKey++}`} className="my-2.5 overflow-x-auto rounded-xl border border-emerald-500/30 bg-slate-950/80 p-0.5 shadow-inner">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-950/90 border-b border-emerald-500/30 text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider">
                {tableHeader.map((th, idx) => (
                  <th key={idx} className="px-3 py-2 border-r border-emerald-500/20 last:border-r-0">
                    {th.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className={`border-b border-white/5 ${rIdx % 2 === 1 ? 'bg-slate-900/60' : 'bg-slate-950/40'} hover:bg-emerald-950/40 transition`}>
                  {row.map((td, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-200 border-r border-white/5 last:border-r-0">
                      {parseInlineFormatting(td.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    inTable = false;
    tableHeader = [];
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isTableRow = line.startsWith('|') && line.endsWith('|');

    if (isTableRow) {
      const cells = line.split('|').slice(1, -1);
      const isDivider = cells.every(c => c.trim().replace(/-/g, '').length === 0);

      if (isDivider) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
    } else {
      if (inTable) {
        flushTable();
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={`li-${currentKey++}`} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-emerald-400 font-bold">•</span>
            <span className="flex-1">{parseInlineFormatting(line.slice(2))}</span>
          </div>
        );
      } else if (line) {
        elements.push(
          <p key={`p-${currentKey++}`} className="my-1 leading-relaxed">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    }
  }

  if (inTable) {
    flushTable();
  }

  return elements;
}

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
      text: `Hello ${roleLabels[role] ?? 'there'}! I am **SHERPAL AI**, your intelligent campus assistant. How can I help you today?`,
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
          text: typeof answer === 'string' ? answer : answer?.answer || 'SHERPAL AI returned an empty response.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: `Sorry, SHERPAL AI could not answer right now. ${error?.message || 'Please try again.'}`,
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
        text: `Conversation cleared. What else can **SHERPAL AI** help you with?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const quickPrompts = quickPromptsByRole[role] || quickPromptsByRole.STUDENT;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6 font-sans">
      {/* Chat Window Container */}
      {open && (
        <section
          className={`relative flex w-[min(410px,calc(100vw-2rem))] flex-col rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 animate-chat-pop border border-white/20 dark:border-emerald-500/30 backdrop-blur-2xl ${
            minimized ? 'h-[68px]' : 'h-[min(580px,calc(100vh-6.5rem))]'
          }`}
          style={{
            background: 'linear-gradient(145deg, rgba(8, 24, 19, 0.96), rgba(12, 38, 30, 0.95))',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
          aria-label="SHERPAL AI Assistant"
        >
          {/* Header Bar */}
          <div className="relative z-10 flex items-center justify-between p-3.5 border-b border-white/10 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-slate-950/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {/* Lion Avatar Badge */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 p-1.5 text-emerald-400 border border-emerald-400/40 shadow-md">
                <LionIcon className="h-5 w-5" glow={true} />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-950"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight text-white">
                    SHERPAL AI
                  </h3>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                    RAG
                  </span>
                </div>
                <p className="text-[11px] font-medium text-emerald-200/80">
                  NIU Assistant · {roleLabels[role] ?? role}
                </p>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1 text-slate-300">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-xl p-1.5 hover:bg-white/10 hover:text-white transition-colors"
                title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? (
                  <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                ) : (
                  <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                )}
              </button>

              {!minimized && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="rounded-xl p-1.5 hover:bg-white/10 hover:text-white transition-colors"
                  title="Clear Conversation"
                  aria-label="Clear Chat"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMinimized(!minimized)}
                className="rounded-xl p-1.5 hover:bg-white/10 hover:text-white transition-colors"
                title={minimized ? 'Expand Window' : 'Minimize Window'}
                aria-label="Minimize Chat"
              >
                {minimized ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-1.5 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!minimized && (
            <>
              <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3.5 text-sm text-slate-100 scrollbar-thin scrollbar-thumb-emerald-800/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {msg.from === 'bot' ? (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 p-1 text-emerald-400 border border-emerald-500/30 shadow">
                        <LionIcon className="h-4.5 w-4.5" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xs font-bold text-white shadow">
                        U
                      </div>
                    )}

                    <div className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[88%] px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          msg.from === 'user'
                            ? 'rounded-2xl rounded-tr-xs bg-emerald-600 text-white border border-emerald-400/30'
                            : 'rounded-2xl rounded-tl-xs bg-slate-900/90 text-slate-100 border border-white/10'
                        }`}
                      >
                        {renderFormattedMessage(msg.text)}
                      </div>
                      <span className="mt-1 px-1 text-[10px] font-medium text-emerald-300/50">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 p-1 text-emerald-400 border border-emerald-500/30">
                      <LionIcon className="h-4.5 w-4.5 animate-pulse" glow={true} />
                    </div>
                    <div className="rounded-2xl rounded-tl-xs bg-slate-900/90 px-3.5 py-2.5 border border-white/10 flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-300">Sherpal AI thinking</span>
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
              <div className="px-3 py-2 border-t border-white/5 bg-slate-950/50">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(prompt.text)}
                      className="whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-emerald-600/30 hover:border-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 flex-shrink-0"
                    >
                      <span>{prompt.icon}</span>
                      <span>{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Writing Section - Clean, Sleek & Neat */}
              <form onSubmit={handleSubmit} className="p-3 bg-slate-950/90 border-t border-white/10">
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-slate-900/90 p-1.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all">
                  <input
                    type="text"
                    className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-medium text-white placeholder-slate-400 outline-none"
                    placeholder="Type your message to Sherpal AI..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!question.trim() || isTyping}
                    className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    aria-label="Send message"
                    title="Send message"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Floating Button with Lion Icon */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setMinimized(false);
        }}
        className="group relative flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-400 active:scale-95"
        aria-expanded={open}
        aria-label={open ? 'Close SHERPAL AI assistant' : 'Open SHERPAL AI assistant'}
      >
        <div className="relative flex items-center gap-2">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 p-1 text-emerald-400 border border-emerald-400/40">
            <LionIcon className="h-4 w-4" glow={true} />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          <span className="tracking-wide text-slate-100 font-extrabold">
            {open ? (minimized ? 'SHERPAL AI' : 'Close') : 'SHERPAL AI'}
          </span>
        </div>
      </button>
    </div>
  );
}
