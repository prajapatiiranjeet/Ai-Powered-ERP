export default function ErrorMessage({ message, onRetry, className = '' }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-200 ${className}`}
    >
      <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500 dark:text-rose-400" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex-1">
        <p className="font-medium dark:text-rose-100">Error</p>
        <p className="mt-0.5 text-rose-700 dark:text-rose-300">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="erp-btn-secondary !px-3 !py-1.5 text-xs"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
