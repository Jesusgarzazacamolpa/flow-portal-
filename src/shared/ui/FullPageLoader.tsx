export interface FullPageLoaderProps {
  label?: string;
}

export function FullPageLoader({ label = 'Cargando…' }: FullPageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950"
    >
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
