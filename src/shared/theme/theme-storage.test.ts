import { vi } from 'vitest';
import { THEME_STORAGE_KEY, isTheme, readStoredTheme, storeTheme } from './theme-storage';

describe('theme-storage', () => {
  it('validates theme values', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('blue')).toBe(false);
  });

  it('reads a stored theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    expect(readStoredTheme()).toBe('dark');
  });

  it('ignores invalid stored values', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    expect(readStoredTheme()).toBeNull();
  });

  it('persists the theme', () => {
    storeTheme('dark');

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('survives storage failures', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(readStoredTheme()).toBeNull();
    expect(() => storeTheme('light')).not.toThrow();

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
