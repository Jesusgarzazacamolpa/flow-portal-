import type { User } from '@/shared/types';

export const adminUser: User = {
  id: 'admin',
  username: 'admin',
  email: 'admin@floworchestrator.com',
  role: 'ADMIN',
};

export const operatorUser: User = {
  id: 'operator',
  username: 'operator',
  email: 'operator@floworchestrator.com',
  role: 'OPERATOR',
};

export const standardUser: User = {
  id: 'user',
  username: 'user',
  email: 'user@floworchestrator.com',
  role: 'USER',
};
