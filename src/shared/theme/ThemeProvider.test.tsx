import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './theme-context';

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

describe('ThemeProvider', () => {
  it('starts in light mode and toggles to dark, persisting the choice', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: 'light' });
    expect(document.documentElement).not.toHaveClass('dark');

    await user.click(button);

    expect(button).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem('theme')).toBe('dark');

    await user.click(button);

    expect(button).toHaveTextContent('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('restores the stored theme', () => {
    window.localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
  });

  it('throws when the hook is used outside of the provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ThemeProbe />)).toThrow('useTheme must be used within ThemeProvider');

    consoleError.mockRestore();
  });
});
