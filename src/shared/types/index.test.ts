import { USER_ROLES, isUserRole, toUserRole } from './index';

describe('isUserRole', () => {
  it.each(USER_ROLES)('accepts %s', (role) => {
    expect(isUserRole(role)).toBe(true);
  });

  it('rejects unknown roles and non-string values', () => {
    expect(isUserRole('GUEST')).toBe(false);
    expect(isUserRole(42)).toBe(false);
    expect(isUserRole(null)).toBe(false);
  });
});

describe('toUserRole', () => {
  it('keeps a known role', () => {
    expect(toUserRole('OPERATOR')).toBe('OPERATOR');
  });

  it('falls back to USER for unknown roles', () => {
    expect(toUserRole('GUEST')).toBe('USER');
  });
});
