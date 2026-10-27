const DEFAULT_API_URL = 'http://localhost:8085';

const DEFAULT_MODULE_URLS = {
  dashboard: 'http://localhost:4200',
  shield: 'http://localhost:5173/shield',
  interventions: 'http://localhost:5173/interventions',
} as const;

export function readUrl(value: string | undefined, fallback: string): string {
  const candidate = value?.trim();
  return candidate ? candidate.replace(/\/+$/, '') : fallback;
}

export const env = {
  apiUrl: readUrl(import.meta.env.VITE_API_URL, DEFAULT_API_URL),
  moduleUrls: {
    dashboard: readUrl(import.meta.env.VITE_MODULE_DASHBOARD_URL, DEFAULT_MODULE_URLS.dashboard),
    shield: readUrl(import.meta.env.VITE_MODULE_SHIELD_URL, DEFAULT_MODULE_URLS.shield),
    interventions: readUrl(
      import.meta.env.VITE_MODULE_INTERVENTIONS_URL,
      DEFAULT_MODULE_URLS.interventions,
    ),
  },
} as const;
