import { useAuth } from '@/features/auth/hooks/useAuth';
import { RemoteModuleFrame } from '../components/RemoteModuleFrame';
import { useCurrentModule } from '../hooks/useCurrentModule';

export function DashboardPage() {
  const { user } = useAuth();
  const module = useCurrentModule();

  return (
    <div className="flex flex-col space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{module.label}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bienvenido, {user?.username ?? 'Usuario'}
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <RemoteModuleFrame module={module} />
      </div>
    </div>
  );
}
