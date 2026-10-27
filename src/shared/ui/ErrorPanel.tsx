export interface ErrorPanelProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorPanel({ message, onRetry }: ErrorPanelProps) {
  return (
    <div
      role="alert"
      className="mx-auto mt-16 max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-900 dark:bg-slate-900"
    >
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
