import { useCallback, useEffect } from 'react';
import type { RefObject } from 'react';
import { useTheme } from '@/shared/theme/theme-context';
import type { Theme } from '@/shared/theme/theme-storage';

export type PortalToModuleMessage =
  { type: 'EMBEDDED'; embedded: boolean } | { type: 'THEME_CHANGE'; theme: Theme };

export interface IframeBridge {
  handleLoad: () => void;
}

function isIframeReadyMessage(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === 'IFRAME_READY'
  );
}

export function useIframeBridge(iframeRef: RefObject<HTMLIFrameElement>): IframeBridge {
  const { theme } = useTheme();

  const post = useCallback(
    (message: PortalToModuleMessage) => {
      iframeRef.current?.contentWindow?.postMessage(message, '*');
    },
    [iframeRef],
  );

  const handleLoad = useCallback(() => {
    post({ type: 'EMBEDDED', embedded: true });
    post({ type: 'THEME_CHANGE', theme });
  }, [post, theme]);

  useEffect(() => {
    post({ type: 'THEME_CHANGE', theme });
  }, [post, theme]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (isIframeReadyMessage(event.data)) {
        post({ type: 'EMBEDDED', embedded: true });
        post({ type: 'THEME_CHANGE', theme });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [post, theme]);

  return { handleLoad };
}
