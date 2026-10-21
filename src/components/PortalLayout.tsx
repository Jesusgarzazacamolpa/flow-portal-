import { ReactNode, useEffect, useState, useRef } from 'react';
import { useTheme, THEME_CHANGE_EVENT } from './ThemeProvider';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface PortalLayoutProps {
  children?: ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const { toggleTheme, theme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-sky-600 font-medium'
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200';

  // Send theme changes to iframe whenever theme changes
  useEffect(() => {
    const sendThemeToIframe = () => {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'THEME_CHANGE', theme },
          '*'
        );
      }
    };

    // Listen for theme change events
    window.addEventListener(THEME_CHANGE_EVENT, sendThemeToIframe);

    // Send initial theme
    sendThemeToIframe();

    return () => window.removeEventListener(THEME_CHANGE_EVENT, sendThemeToIframe);
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <a href="/" className="text-xl font-bold text-sky-600 no-underline">
              Flow Portal
            </a>
            <div className="flex items-center gap-4 text-sm">
              <NavLink to="/" className={navLinkClass}>
                Dashboard
              </NavLink>
              {user?.role === 'ADMIN' && (
                <>
                  <NavLink to="/shield" className={navLinkClass}>
                    Shield
                  </NavLink>
                  <NavLink to="/interventions" className={navLinkClass}>
                    Intervención Humana
                  </NavLink>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-md p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            {user && (
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {user.username} ({user.role})
              </span>
            )}
            <button
              onClick={logout}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 underline"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6">
        {children || <Outlet />}
      </main>
    </div>
  );
}
