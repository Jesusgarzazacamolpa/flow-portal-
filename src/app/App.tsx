import { AppProviders } from './AppProviders';
import { AppRoutes } from './router';

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
