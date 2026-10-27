import { readUrl } from './env';

describe('readUrl', () => {
  it('trims the value and removes trailing slashes', () => {
    expect(readUrl('  http://localhost:9000///  ', 'http://fallback')).toBe(
      'http://localhost:9000',
    );
  });

  it('returns the fallback when the value is missing or blank', () => {
    expect(readUrl(undefined, 'http://fallback')).toBe('http://fallback');
    expect(readUrl('   ', 'http://fallback')).toBe('http://fallback');
  });
});
