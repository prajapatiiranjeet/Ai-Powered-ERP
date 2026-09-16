const SIZE_MAP = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export default function LoadingSpinner({ size = 'md', color = 'text-indigo-600', label, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status">
      <svg
        className={`animate-spin ${SIZE_MAP[size] ?? SIZE_MAP.md} ${color}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {label ? <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span> : null}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
