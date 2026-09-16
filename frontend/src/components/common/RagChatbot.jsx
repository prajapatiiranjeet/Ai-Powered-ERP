import { useCallback, useEffect, useRef, useState } from 'react';
import { ragService } from '../../services/ragService.js';

const LION_URL = 'https://cdn-icons-png.flaticon.com/512/4081/4081582.png';
const roleLabels = { ADMIN: 'Admin', FACULTY: 'Faculty', STUDENT: 'Student' };
const quickPrompts = [
  'Exam Schedule & Syllabus',
  'Fee Payment & Receipts',
  'Attendance Report',
  'Results & Grades'
];

const DEFAULT_WIDGET_OFFSET = { right: 24, bottom: 24 };
const DEFAULT_SIZE = { width: 380, height: 560 };
const MIN_WIDGET_WIDTH = 300;
const MAX_WIDGET_WIDTH = 600;
const MIN_WIDGET_HEIGHT = 420;
const WIDGET_VIEWPORT_PADDING = 8;

function Icon({ name, size = 17 }) {
  const paths = {
    sound: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M17 9.5a4 4 0 0 1 0 5M19.5 7a7.5 7.5 0 0 1 0 10" /></>,
    mute: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m18 9-5 6m0-6 5 6" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" /></>,
    minus: <path d="M5 12h14" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    send: <><path d="m21 3-7.2 18-3.2-7.6L3 10.2 21 3Z" /><path d="M10.6 13.4 21 3" /></>,
    grip: <><path d="M7 7h.01M12 7h.01M17 7h.01M7 12h.01M12 12h.01M17 12h.01" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function SherpalAvatar({ size = 32 }) {
  return (
    <span
      className="relative grid flex-shrink-0 place-items-center overflow-hidden rounded-2xl"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 28%, rgba(52,211,153,0.55) 0%, rgba(16,185,129,0.28) 36%, rgba(4,47,35,0.92) 76%, rgba(2,20,15,1) 100%)'
      }}
    >
      <img
        src={LION_URL}
        alt=""
        aria-hidden="true"
        style={{
          width: Math.round(size * 0.78),
          height: Math.round(size * 0.78),
          objectFit: 'cover',
          filter:
            'saturate(1.05) contrast(1.02) brightness(0.98) drop-shadow(0 1px 0 rgba(255,255,255,0.12)) drop-shadow(0 3px 6px rgba(0,0,0,0.55))'
        }}
      />
    </span>
  );
}

function formatInline(text, keyPrefix = '') {
  return String(text).split(/(\*\*.*?\*\*|`.*?`)/g).map((chunk, index) => {
    const key = `${keyPrefix}-${index}`;
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return <strong key={key} className="font-bold">{chunk.slice(2, -2)}</strong>;
    }
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return <code key={key} className="rounded bg-slate-800/10 px-1.5 py-[1px] font-mono text-[12px] text-emerald-800 ring-1 ring-slate-800/10 dark:bg-emerald-900/60 dark:text-emerald-200 dark:ring-emerald-400/20">{chunk.slice(1, -1)}</code>;
    }
    return chunk;
  });
}

function splitTableRow(line) {
  const normalized = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return normalized.split('|').map((cell) => cell.trim());
}

function isTableSeparator(line) {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderTable(lines, startIndex) {
  const headers = splitTableRow(lines[startIndex]);
  const rows = [];
  let index = startIndex + 2;

  while (index < lines.length && lines[index].trim().startsWith('|')) {
    const cells = splitTableRow(lines[index]);
    rows.push([...cells.slice(0, headers.length), ...Array(Math.max(0, headers.length - cells.length)).fill('')]);
    index += 1;
  }

  return {
    nextIndex: index,
    element: (
      <div className="sherpal-table-wrap my-2 w-full overflow-x-auto rounded-xl border border-emerald-200/70 bg-white/75 dark:border-emerald-700/50 dark:bg-slate-950/35">
        <table className="min-w-full border-collapse text-left text-[11px] leading-snug">
          <thead className="bg-emerald-50/80 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-100">
            <tr>
              {headers.map((header, headerIndex) => (
                <th key={`header-${headerIndex}`} className="whitespace-nowrap border-b border-emerald-200/80 px-2.5 py-2 font-bold dark:border-emerald-700/60">
                  {formatInline(header, `header-${headerIndex}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="align-top even:bg-slate-50/70 dark:even:bg-white/[0.03]">
                {row.map((cell, cellIndex) => (
                  <td key={`cell-${rowIndex}-${cellIndex}`} className="border-b border-slate-200/80 px-2.5 py-2 text-slate-700 dark:border-slate-700/70 dark:text-slate-200">
                    {formatInline(cell, `cell-${rowIndex}-${cellIndex}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  };
}

function formatMessage(text) {
  const lines = String(text || '').split('\n');
  const content = [];
  let index = 0;

  while (index < lines.length) {
    if (lines[index].trim().startsWith('|') && lines[index + 1] && isTableSeparator(lines[index + 1])) {
      const table = renderTable(lines, index);
      content.push(<span key={`table-${index}`}>{table.element}</span>);
      index = table.nextIndex;
      continue;
    }

    content.push(
      <span key={`line-${index}`}>
        {formatInline(lines[index], `line-${index}`)}
        {index < lines.length - 1 && <br />}
      </span>
    );
    index += 1;
  }

  return content;
}

function playChime(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = type === 'send' ? 620 : 860;
    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  } catch {
    // Browsers can block audio until user interaction.
  }
}

function clampToViewport(nextX, nextY, width, height) {
  const maxX = Math.max(WIDGET_VIEWPORT_PADDING, window.innerWidth - width - WIDGET_VIEWPORT_PADDING);
  const maxY = Math.max(WIDGET_VIEWPORT_PADDING, window.innerHeight - height - WIDGET_VIEWPORT_PADDING);
  return {
    x: Math.min(Math.max(WIDGET_VIEWPORT_PADDING, nextX), maxX),
    y: Math.min(Math.max(WIDGET_VIEWPORT_PADDING, nextY), maxY)
  };
}

export default function RagChatbot({ role = 'STUDENT' }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [messages, setMessages] = useState(() => [{
    id: 1,
    from: 'bot',
    text: `Hello ${roleLabels[role] || 'there'}! I am **SHERPAL AI**, your New Innovation University assistant. How can I help you today?`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);

  const widgetRef = useRef(null);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const frameRef = useRef(null);

  const openWidget = () => {
    setPosition(null);
    setMinimized(false);
    setVisible(true);
    requestAnimationFrame(() => setOpen(true));
  };

  const closeWidget = () => {
    setOpen(false);
    window.setTimeout(() => {
      setPosition(null);
      dragRef.current = null;
      resizeRef.current = null;
      setIsDragging(false);
      setIsResizing(false);
      setVisible(false);
    }, 300);
  };

  useEffect(() => {
    if (open && !minimized) messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, open, minimized]);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const clampSizeToViewport = useCallback((width, height) => {
    const viewportMaxWidth = Math.max(MIN_WIDGET_WIDTH, window.innerWidth - WIDGET_VIEWPORT_PADDING * 2);
    const viewportMaxHeight = Math.max(MIN_WIDGET_HEIGHT, window.innerHeight - WIDGET_VIEWPORT_PADDING * 2);
    return {
      width: Math.min(Math.max(MIN_WIDGET_WIDTH, width), Math.min(MAX_WIDGET_WIDTH, viewportMaxWidth)),
      height: Math.min(Math.max(MIN_WIDGET_HEIGHT, height), Math.min(800, viewportMaxHeight))
    };
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (dragRef.current) {
      const widgetWidth = widgetRef.current?.offsetWidth || size.width;
      const widgetHeight = widgetRef.current?.offsetHeight || size.height;
      const nextX = event.clientX - dragRef.current.offsetX;
      const nextY = event.clientY - dragRef.current.offsetY;
      setPosition(clampToViewport(nextX, nextY, widgetWidth, widgetHeight));
    }

    if (resizeRef.current) {
      const nextWidth = resizeRef.current.startWidth + (resizeRef.current.startX - event.clientX);
      const nextHeight = resizeRef.current.startHeight + (resizeRef.current.startY - event.clientY);
      const clamped = clampSizeToViewport(nextWidth, nextHeight);
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(() => {
          setSize(clamped);
          frameRef.current = null;
        });
      }
      if (position) {
        const maxX = Math.max(WIDGET_VIEWPORT_PADDING, window.innerWidth - clamped.width - WIDGET_VIEWPORT_PADDING);
        const maxY = Math.max(WIDGET_VIEWPORT_PADDING, window.innerHeight - clamped.height - WIDGET_VIEWPORT_PADDING);
        setPosition((prev) => (prev ? {
          x: Math.min(Math.max(WIDGET_VIEWPORT_PADDING, prev.x), maxX),
          y: Math.min(Math.max(WIDGET_VIEWPORT_PADDING, prev.y), maxY)
        } : prev));
      }
    }
  }, [size.width, size.height, clampSizeToViewport, position]);

  const stopPointerAction = useCallback(() => {
    dragRef.current = null;
    resizeRef.current = null;
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopPointerAction);
    window.addEventListener('pointercancel', stopPointerAction);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopPointerAction);
      window.removeEventListener('pointercancel', stopPointerAction);
    };
  }, [handlePointerMove, stopPointerAction]);

  const startDrag = (event) => {
    if (event.target.closest('button, a, textarea, input, select')) return;
    if (minimized) return;
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    setIsDragging(true);
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
  };

  const startResize = (event) => {
    event.stopPropagation();
    event.preventDefault();
    resizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: size.width,
      startHeight: size.height
    };
    setIsResizing(true);
  };

  const updateQuestion = (event) => {
    setQuestion(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 72)}px`;
  };

  const handleSend = async (textToSend = question) => {
    const query = textToSend.trim();
    if (!query || isTyping) return;
    if (soundEnabled) playChime('send');
    setMessages((current) => [...current, {
      id: Date.now(), from: 'user', text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setQuestion('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);
    try {
      const answer = await ragService.ask(role, query);
      if (soundEnabled) playChime('receive');
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        from: 'bot',
        text: typeof answer === 'string' ? answer : answer?.answer || 'SHERPAL AI returned an empty response.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        from: 'bot',
        text: `SHERPAL AI could not answer right now. ${error?.message || 'Please try again.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => setMessages([{
    id: Date.now(), from: 'bot', text: 'Conversation cleared. What can I help you find?',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);

  const widgetPositionStyle = position
    ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
    : { right: DEFAULT_WIDGET_OFFSET.right, bottom: DEFAULT_WIDGET_OFFSET.bottom, left: 'auto', top: 'auto' };

  const clampedSize = clampSizeToViewport(size.width, size.height);

  return (
    <>
      <style>{`
        @keyframes sherpalMessage { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sherpalDot { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-4px); opacity: 1; } }
        @keyframes sherpalAvatarPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }
        .sherpal-widget * { box-sizing: border-box; font-family: inherit; }
        .sherpal-backdrop { position: fixed; inset: 0; z-index: 55; background: rgba(8, 25, 18, .28); backdrop-filter: blur(2px); }
        html.dark .sherpal-backdrop { background: rgba(4, 15, 12, .52); }
        .sherpal-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .sherpal-scroll::-webkit-scrollbar-track { background: rgba(18,84,79,.12); border-radius: 999px; }
        .sherpal-scroll::-webkit-scrollbar-thumb { background: rgba(16,185,129,.5); border-radius: 99px; }
        html.dark .sherpal-scroll::-webkit-scrollbar-thumb { background: rgba(52,211,153,.55); }
        .sherpal-message { animation: sherpalMessage 150ms ease both; }
        .sherpal-chip { flex: 0 0 auto; transition: background 150ms ease, color 150ms ease, transform 150ms ease, border-color 150ms ease; }
        .sherpal-chip:hover { background: rgba(16,185,129,.12) !important; color: #047857 !important; border-color: rgba(16,185,129,.4) !important; }
        html.dark .sherpal-chip:hover { background: rgba(16,185,129,.18) !important; color: #6ee7b7 !important; border-color: rgba(52,211,153,.45) !important; }
        .sherpal-launcher { transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease; animation: sherpalAvatarPulse 2.6s ease-in-out infinite; }
        .sherpal-launcher:hover { transform: translateY(-1px) scale(1.02); filter: saturate(1.05); }
        .sherpal-typing-dot { animation: sherpalDot 900ms ease-in-out infinite; background: #fbbf24; }
        html.dark .sherpal-typing-dot { background: #fcd34d; }
        @media (max-width: 767px) {
          .sherpal-backdrop { background: rgba(8, 25, 18, .42); }
          .sherpal-launcher { right: 16px !important; bottom: 16px !important; width: 54px !important; height: 54px !important; }
          .sherpal-widget { inset: 0 !important; width: 100vw !important; height: 100dvh !important; max-height: none !important; border-radius: 0 !important; border-left: 0 !important; border-right: 0 !important; }
          .sherpal-widget .sherpal-scroll { overscroll-behavior: contain; }
        }
      `}</style>

      {!visible && (
        <button
          type="button"
          className="sherpal-launcher fixed z-[60] flex items-center justify-center"
          onClick={openWidget}
          aria-label="Open SHERPAL AI"
          style={{
            right: DEFAULT_WIDGET_OFFSET.right,
            bottom: DEFAULT_WIDGET_OFFSET.bottom,
            width: 60,
            height: 60,
            padding: 4
          }}
        >
          <SherpalAvatar size={52} />
        </button>
      )}

      {visible && <div className="sherpal-backdrop" aria-hidden="true" />}

      {visible && (
        <section
          ref={widgetRef}
          className="sherpal-widget fixed z-[60] flex flex-col overflow-hidden rounded-[22px] border border-emerald-700/30 bg-white text-slate-900 shadow-[0_22px_70px_rgba(0,0,0,.28)] backdrop-blur-xl dark:border-emerald-500/30 dark:bg-[#0a1d18] dark:text-slate-100 dark:shadow-[0_22px_70px_rgba(0,0,0,.6)]"
          aria-label="SHERPAL AI Assistant"
          style={{
            ...widgetPositionStyle,
            width: `min(${clampedSize.width}px, calc(100vw - 32px))`,
            height: minimized ? 68 : `min(${clampedSize.height}px, calc(100vh - 32px))`,
            opacity: open ? 1 : 0,
            transform: open ? 'scale(1)' : 'scale(.92)',
            pointerEvents: open ? 'auto' : 'none',
            transition: isDragging || isResizing ? 'none' : 'opacity 280ms ease, transform 280ms ease, box-shadow 200ms ease'
          }}
        >
          {!minimized && (
            <button
              type="button"
              aria-label="Resize SHERPAL AI"
              onPointerDown={startResize}
              className="absolute left-0.5 top-0.5 z-[2] grid h-[25px] w-[25px] place-items-center rounded-md border-0 bg-transparent p-0 text-emerald-800/70 hover:bg-white/30 dark:text-emerald-300/70 dark:hover:bg-white/5 cursor-nw-resize"
            >
              <Icon name="grip" size={18} />
            </button>
          )}

          <header
            onPointerDown={startDrag}
            className="flex min-h-[68px] items-center justify-between gap-2.5 border-b border-emerald-700/25 bg-[linear-gradient(180deg,rgba(8,48,36,0.98),rgba(5,32,24,0.98))] px-4 py-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.28)] select-none dark:border-emerald-400/20"
            style={{ cursor: minimized ? 'default' : (isDragging ? 'grabbing' : 'grab') }}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <SherpalAvatar size={36} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <strong className="truncate text-[14px] tracking-[.08em] text-white">SHERPAL AI</strong>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-1.5 py-[1px] text-[9px] font-bold tracking-[.08em] text-emerald-100 ring-1 ring-emerald-300/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.9)]" />
                    RAG
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-emerald-100/85">
                  New Innovation University assistant for {roleLabels[role] || role} users.
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <ControlButton label={soundEnabled ? 'Mute sound' : 'Enable sound'} onClick={() => setSoundEnabled((current) => !current)}>
                <Icon name={soundEnabled ? 'sound' : 'mute'} />
              </ControlButton>
              {!minimized && (
                <ControlButton label="Clear chat" onClick={clearChat}>
                  <Icon name="trash" />
                </ControlButton>
              )}
              <ControlButton label={minimized ? 'Expand chat' : 'Minimize chat'} onClick={() => setMinimized((current) => !current)}>
                <Icon name={minimized ? 'plus' : 'minus'} />
              </ControlButton>
              <ControlButton label="Close chat" onClick={closeWidget}>
                <Icon name="close" />
              </ControlButton>
            </div>
          </header>

          {!minimized && (
            <>
              <div
                ref={messagesRef}
                className="sherpal-scroll flex-1 min-h-0 overflow-y-auto bg-slate-50 px-3.5 py-4 dark:bg-[#081914]"
              >
                {messages.map((message) => (
                  <article key={message.id} className="sherpal-message mb-3 flex" style={{ justifyContent: message.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '84%', display: 'flex', flexDirection: 'column', alignItems: message.from === 'user' ? 'flex-end' : 'flex-start' }}>
                      {message.from === 'user' ? (
                        <div className="rounded-2xl rounded-br-[5px] bg-gradient-to-br from-[#2d6a3f] to-[#1f5835] px-3.5 py-2.5 text-[13px] leading-snug font-medium text-white shadow shadow-emerald-900/10 break-words">
                          {formatMessage(message.text)}
                        </div>
                      ) : (
                        <div className="rounded-2xl rounded-bl-[5px] border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] leading-snug font-medium text-slate-800 shadow-sm break-words dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100">
                          {formatMessage(message.text)}
                        </div>
                      )}
                      <time className="mt-1 px-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {message.time}
                      </time>
                    </div>
                  </article>
                ))}
                {isTyping && (
                  <div className="flex w-fit gap-1.5 rounded-2xl rounded-bl-[5px] border border-slate-200 bg-slate-100 px-3.5 py-3 dark:border-slate-700/70 dark:bg-slate-800/80">
                    <span className="sherpal-typing-dot h-1.5 w-1.5 rounded-full" style={{ animationDelay: '0ms' }} />
                    <span className="sherpal-typing-dot h-1.5 w-1.5 rounded-full" style={{ animationDelay: '120ms' }} />
                    <span className="sherpal-typing-dot h-1.5 w-1.5 rounded-full" style={{ animationDelay: '240ms' }} />
                  </div>
                )}
              </div>

              {!question.trim() && (
                <div className="sherpal-scroll flex gap-1.5 overflow-x-auto border-t border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700/80 dark:bg-slate-950">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="sherpal-chip rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap text-slate-700 hover:border-emerald-500/50 hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      onClick={() => handleSend(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(event) => { event.preventDefault(); handleSend(); }}
                className="border-t border-slate-200 bg-white px-3 py-3 dark:border-slate-700/80 dark:bg-slate-950"
              >
                <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-1.5 shadow-sm dark:border-slate-600 dark:bg-slate-900">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={question}
                    onChange={updateQuestion}
                    disabled={isTyping}
                    placeholder="Type your message to Sherpal AI..."
                    onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }}
                    className="min-h-[30px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[13px] leading-snug font-medium text-slate-900 placeholder:text-slate-500 outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!question.trim() || isTyping}
                    aria-label="Send message"
                    className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2d6a3f] to-[#164c2b] text-white shadow-sm transition-transform hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
                  >
                    <Icon name="send" size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      )}
    </>
  );
}

function ControlButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-md border-0 bg-transparent p-0 text-white/88 transition hover:bg-white/15 hover:text-white active:scale-95"
    >
      {children}
    </button>
  );
}
