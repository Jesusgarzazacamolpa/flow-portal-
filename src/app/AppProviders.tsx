import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { queryClient } from './queryClient';

export interface AppProvidersProps {
  children: ReactNode;
  client?: QueryClient;
}

export function AppProviders({ children, client = queryClient }: AppProvidersProps) {
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
