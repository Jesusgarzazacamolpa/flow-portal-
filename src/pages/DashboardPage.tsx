import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useTheme, THEME_CHANGE_EVENT } from '../components/ThemeProvider';
import { useLocation } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();

  // Determine which module to show based on the URL path
  const currentPath = location.pathname === '/' ? 'dashboard' : location.pathname.replace('/', '');
  
  console.log('DashboardPage DEBUG:', { 
    user: user, 
    currentPath, 
    role: user?.role 
  });
  
  let iframeUrl = '';
  if (user?.role === 'ADMIN') {
    console.log('Setting iframe for ADMIN path:', currentPath);
    if (currentPath === 'shield') {
      iframeUrl = 'http://localhost:5173/shield';
    } else if (currentPath === 'interventions') {
      iframeUrl = 'http://localhost:5173/interventions';
    } else {
      iframeUrl = 'http://localhost:4200';
    }
  } else if (user?.role === 'USER') {
    iframeUrl = 'http://localhost:4200';
  } else {
    iframeUrl = 'http://localhost:4200';
  }
  
  console.log('iFrame URL final:', iframeUrl);
  
  useEffect(() => {
    console.log('iFrame URL changed to:', iframeUrl, 'path:', currentPath);
  }, [iframeUrl]);

  const sendMessageToIframe = (message: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
    }
  };

  // Send theme changes to iframe whenever theme changes
  useEffect(() => {
    sendMessageToIframe({ type: 'THEME_CHANGE', theme });
  }, [theme]);

  // Listen for theme change events and forward to iframe
  useEffect(() => {
    const handler = () => {
      sendMessageToIframe({ type: 'THEME_CHANGE', theme });
    };
    window.addEventListener(THEME_CHANGE_EVENT, handler);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handler);
  }, [theme]);

  return (
    <div className="flex flex-col space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">Bienvenido, {user?.username || 'Usuario'}</p>
      </header>

      {/* Embedded iframe */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <iframe
          key={location.pathname}
          ref={iframeRef}
          src={iframeUrl}
          title="Embedded Module"
          sandbox="allow-scripts allow-same-origin allow-forms"
          className="h-[calc(100vh-240px)] w-full border-0"
          onLoad={() => {
            sendMessageToIframe({ type: 'EMBEDDED', embedded: true });
          }}
        />
      </div>
    </div>
  );
}
