import { act, renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { useIframeBridge } from './useIframeBridge';

function createIframeRef(): {
  ref: RefObject<HTMLIFrameElement>;
  postMessage: ReturnType<typeof vi.fn>;
} {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  const postMessage = vi.fn();
  Object.defineProperty(iframe.contentWindow!, 'postMessage', {
    value: postMessage,
    writable: true,
  });
  return { ref: { current: iframe }, postMessage };
}

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

afterEach(() => {
  document.querySelectorAll('iframe').forEach((iframe) => iframe.remove());
});

describe('useIframeBridge', () => {
  it('sends the current theme when mounted', () => {
    const { ref, postMessage } = createIframeRef();

    renderHook(() => useIframeBridge(ref), { wrapper });

    expect(postMessage).toHaveBeenCalledWith({ type: 'THEME_CHANGE', theme: 'light' }, '*');
  });

  it('sends the embed configuration when the iframe loads', () => {
    const { ref, postMessage } = createIframeRef();
    const { result } = renderHook(() => useIframeBridge(ref), { wrapper });

    act(() => result.current.handleLoad());

    expect(postMessage).toHaveBeenCalledWith({ type: 'EMBEDDED', embedded: true }, '*');
    expect(postMessage).toHaveBeenCalledWith({ type: 'THEME_CHANGE', theme: 'light' }, '*');
  });

  it('re-sends the configuration when the module reports it is ready', () => {
    const { ref, postMessage } = createIframeRef();
    renderHook(() => useIframeBridge(ref), { wrapper });
    postMessage.mockClear();

    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'IFRAME_READY' } }));
    });

    expect(postMessage).toHaveBeenCalledWith({ type: 'EMBEDDED', embedded: true }, '*');
    expect(postMessage).toHaveBeenCalledTimes(2);
  });

  it('ignores unrelated window messages', () => {
    const { ref, postMessage } = createIframeRef();
    renderHook(() => useIframeBridge(ref), { wrapper });
    postMessage.mockClear();

    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'OTHER' } }));
      window.dispatchEvent(new MessageEvent('message', { data: null }));
    });

    expect(postMessage).not.toHaveBeenCalled();
  });

  it('does nothing when the iframe is not mounted yet', () => {
    const ref: RefObject<HTMLIFrameElement> = { current: null };
    const { result } = renderHook(() => useIframeBridge(ref), { wrapper });

    expect(() => act(() => result.current.handleLoad())).not.toThrow();
  });
});
