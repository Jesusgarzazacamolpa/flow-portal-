export const USER_ROLES = ['ADMIN', 'USER', 'OPERATOR'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

export function toUserRole(value: unknown): UserRole {
  return isUserRole(value) ? value : 'USER';
}
