import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { MODULES } from '@/modules/registry';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { renderWithProviders } from '@/test/utils/render';
import { RemoteModuleFrame } from './RemoteModuleFrame';

function renderFrame() {
  const shield = MODULES.find((module) => module.id === 'shield');

  if (!shield) {
    throw new Error('Shield module is not registered');
  }

  return renderWithProviders(
    <Routes>
      <Route
        path="/"
        element={
          <ThemeProvider>
            <RemoteModuleFrame module={shield} />
          </ThemeProvider>
        }
      />
    </Routes>,
  );
}

describe('RemoteModuleFrame', () => {
  it('renders the remote module with the sandbox attributes', () => {
    renderFrame();

    const iframe = screen.getByTitle('Módulo Shield');

    expect(iframe).toHaveAttribute('src', 'http://localhost:5173/shield');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
  });

  it('notifies the remote module when it finishes loading', () => {
    renderFrame();

    const iframe = screen.getByTitle('Módulo Shield') as HTMLIFrameElement;
    const postMessage = vi.spyOn(iframe.contentWindow!, 'postMessage');

    iframe.dispatchEvent(new Event('load'));

    expect(postMessage).toHaveBeenCalledWith({ type: 'EMBEDDED', embedded: true }, '*');
    expect(postMessage).toHaveBeenCalledWith({ type: 'THEME_CHANGE', theme: 'light' }, '*');
  });
});
