/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_MODULE_DASHBOARD_URL?: string;
  readonly VITE_MODULE_SHIELD_URL?: string;
  readonly VITE_MODULE_INTERVENTIONS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
