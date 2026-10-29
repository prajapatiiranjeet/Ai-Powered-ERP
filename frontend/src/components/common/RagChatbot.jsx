import { useCallback, useEffect, useRef, useState } from 'react';
import { ragService } from '../../services/ragService.js';
import { useAuth } from '../../context/AuthContext.jsx';

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
  return <span className="sherpal-mark" style={{ width: size, height: size }} aria-hidden="true">S</span>;
}

function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function getWelcomeMessage(userName) {
  const firstName = String(userName || '').trim().split(/\s+/)[0];
  const greeting = getTimeGreeting();
  return `${greeting}${firstName ? `, ${firstName}` : ''}! How can I help you today?`;
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
  const { user } = useAuth();
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
    text: getWelcomeMessage(user?.name),
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
    id: Date.now(), from: 'bot', text: getWelcomeMessage(user?.name),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);

  const widgetPositionStyle = position
    ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
    : { right: DEFAULT_WIDGET_OFFSET.right, bottom: DEFAULT_WIDGET_OFFSET.bottom, left: 'auto', top: 'auto' };

  const clampedSize = clampSizeToViewport(size.width, size.height);

  return (
    <>
      {!visible && <button type="button" className="sherpal-launcher fixed z-[60]" onClick={openWidget} aria-label="Open SHERPAL AI" style={{ right: DEFAULT_WIDGET_OFFSET.right, bottom: DEFAULT_WIDGET_OFFSET.bottom }}><SherpalAvatar size={46} /></button>}
      {visible && <div className="sherpal-backdrop" aria-hidden="true" />}
      {visible && <section ref={widgetRef} className="sherpal-widget fixed z-[60]" role="dialog" aria-modal="true" aria-labelledby="sherpal-title"
        style={{ ...widgetPositionStyle, width:'min(' + clampedSize.width + 'px, calc(100vw - 32px))', height:minimized ? 76 : 'min(' + clampedSize.height + 'px, calc(100vh - 32px))', opacity:open ? 1 : 0, transform:open ? 'translateY(0) scale(1)' : 'translateY(8px) scale(.985)', pointerEvents:open ? 'auto' : 'none', transition:isDragging || isResizing ? 'none' : 'opacity 180ms ease, transform 180ms ease' }}>
        {!minimized && <button type="button" aria-label="Resize SHERPAL AI" onPointerDown={startResize} className="sherpal-resize"><Icon name="grip" size={15} /></button>}
        <header onPointerDown={startDrag} className="sherpal-head" style={{ cursor:minimized ? 'default' : isDragging ? 'grabbing' : 'grab' }}>
          <div className="sherpal-head__identity"><SherpalAvatar size={40} /><div className="min-w-0"><p id="sherpal-title" className="sherpal-head__name">SHERPAL AI</p><p className="sherpal-head__context">Campus assistant · {roleLabels[role] || role} workspace</p></div></div>
          <div className="sherpal-head__controls">
            <ControlButton label={soundEnabled ? 'Mute sound' : 'Enable sound'} onClick={() => setSoundEnabled((current) => !current)}><Icon name={soundEnabled ? 'sound' : 'mute'} /></ControlButton>
            {!minimized && <ControlButton label="Clear chat" onClick={clearChat}><Icon name="trash" /></ControlButton>}
            <ControlButton label={minimized ? 'Expand chat' : 'Minimize chat'} onClick={() => setMinimized((current) => !current)}><Icon name={minimized ? 'plus' : 'minus'} /></ControlButton>
            <ControlButton label="Close chat" onClick={closeWidget}><Icon name="close" /></ControlButton>
          </div>
        </header>
        {!minimized && <>
          <div className="sherpal-status"><span className="sherpal-status__dot" aria-hidden="true" />Ask about university information</div>
          <div ref={messagesRef} className="sherpal-scroll sherpal-transcript" aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => <article key={message.id} className={'sherpal-message' + (message.from === 'user' ? ' sherpal-message--user' : '')}>
              {message.from !== 'user' && <SherpalAvatar size={25} />}
              <div className="sherpal-message__stack"><div className="sherpal-message__bubble">{formatMessage(message.text)}</div><time className="sherpal-message__time">{message.time}</time></div>
            </article>)}
            {isTyping && <div className="sherpal-typing" role="status" aria-label="SHERPAL is responding"><span style={{ animationDelay:'0ms' }} /><span style={{ animationDelay:'120ms' }} /><span style={{ animationDelay:'240ms' }} /></div>}
          </div>
          {!question.trim() && <div className="sherpal-scroll sherpal-suggestions" aria-label="Suggested questions">{quickPrompts.map((prompt) => <button key={prompt} type="button" className="sherpal-chip" onClick={() => handleSend(prompt)}>{prompt}</button>)}</div>}
          <form onSubmit={(event) => { event.preventDefault(); handleSend(); }} className="sherpal-composer">
            <div className="sherpal-composer__row"><textarea ref={textareaRef} rows={1} value={question} onChange={updateQuestion} disabled={isTyping} placeholder="Ask SHERPAL about campus…" aria-label="Message SHERPAL AI" onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }} /><button type="submit" disabled={!question.trim() || isTyping} aria-label="Send message" className="sherpal-send"><Icon name="send" size={17} /></button></div>
            <p className="sherpal-composer__hint">Enter to send · Shift + Enter for a new line</p>
          </form>
        </>}
      </section>}
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
      className="sherpal-control"
    >
      {children}
    </button>
  );
}
