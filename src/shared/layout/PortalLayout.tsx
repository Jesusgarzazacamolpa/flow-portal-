import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getNavigationModules } from '@/modules/registry';
import { useTheme } from '@/shared/theme/theme-context';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? 'text-sky-600 font-medium'
    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200';
}

export function PortalLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const modules = getNavigationModules(user?.role);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-sky-600 no-underline">
              Flow Portal
            </Link>
            <div className="flex items-center gap-4 text-sm">
              {modules.map((module) => (
                <NavLink
                  key={module.id}
                  to={module.path}
                  end={module.path === '/'}
                  className={navLinkClass}
                >
                  {module.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
            >
              <span aria-hidden="true" className="text-xl">
                {theme === 'dark' ? '☀️' : '🌙'}
              </span>
            </button>
            {user && (
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {user.username} ({user.role})
              </span>
            )}
            <button
              type="button"
              onClick={() => logout()}
              className="text-sm text-slate-600 underline hover:text-red-600 dark:text-slate-400"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
