# Flow Portal Frontend

Portal maestro de la plataforma de orquestación de flujos: maneja el login de los usuarios y
embebe las aplicaciones remotas (`flow-viewer` Angular y el app-shell React) en un iframe.

## Tecnologías

- **React 18** + Vite 5 con TypeScript estricto
- **React Router 7** (rutas lazy con `React.lazy` + `Suspense`)
- **TanStack React Query 5** para estado de servidor y caché de la sesión
- **React Context** para el tema (claro/oscuro)
- **Tailwind CSS 3**
- **Vitest + React Testing Library + MSW** para pruebas
- **ESLint 9 (flat config) + Prettier**

## Estructura

```
src/
├── app/
│   ├── App.tsx               # Raíz reutilizable (montable en otro host)
│   ├── AppProviders.tsx      # QueryClient + ThemeProvider + Router
│   ├── queryClient.ts        # Configuración de React Query
│   └── router.tsx            # Rutas y guards (lazy loading)
├── modules/
│   └── registry.ts           # Registro de módulos, roles y URLs remotas
├── features/
│   ├── auth/
│   │   ├── api/authApi.ts            # Endpoints /auth/*
│   │   ├── hooks/useAuth.ts          # useSession, useLogin, useLogout, useAuth
│   │   ├── components/ProtectedRoute.tsx
│   │   ├── components/RoleGuard.tsx
│   │   └── pages/LoginPage.tsx
│   └── dashboard/
│       ├── hooks/useCurrentModule.ts # Módulo según la ruta
│       ├── hooks/useIframeBridge.ts  # postMessage hacia el iframe
│       ├── components/RemoteModuleFrame.tsx
│       └── pages/DashboardPage.tsx
├── shared/
│   ├── api/apiClient.ts      # fetch tipado + ApiError
│   ├── config/env.ts         # Variables de entorno con defaults
│   ├── layout/PortalLayout.tsx
│   ├── theme/                # ThemeProvider, hook y persistencia
│   ├── types/                # User, UserRole, LoginRequest
│   └── ui/                   # FullPageLoader, ErrorPanel
├── test/                     # setup, handlers MSW, fixtures y utils de render
├── index.css
└── main.tsx
```

Cada feature concentra su API, hooks, componentes y página. Lo transversal vive en `shared/`, y
`modules/registry.ts` es la única fuente de verdad de rutas, roles y URLs remotas.

## Rutas

| Path              | Componente     | Acceso                      |
| ----------------- | -------------- | --------------------------- |
| `/login`          | LoginPage      | Público                     |
| `/`, `/dashboard` | DashboardPage  | ADMIN, USER, OPERATOR       |
| `/shield`         | DashboardPage  | ADMIN (RoleGuard)           |
| `/interventions`  | DashboardPage  | ADMIN, OPERATOR (RoleGuard) |
| `*`               | Redirect a `/` | Privado                     |

`/dashboard` redirige a `/`; cualquier ruta desconocida vuelve al dashboard.

## Estado

- **Sesión:** React Query (`['auth', 'session']`). `useSession` valida la cookie contra
  `GET /auth/user`; `useLogin` escribe el usuario en la caché y `useLogout` la limpia incluso si
  el request falla.
- **UI local:** `useState` en formularios; el estado global del tema vive en `ThemeProvider`.
- **Errores:** `ProtectedRoute` muestra `ErrorPanel` con reintento si falla la verificación.

## Autenticación (cookie)

1. `POST /auth/login` con `credentials: 'include'` y `{ username, password }`.
2. El backend responde `{ username, role, token }` y setea la cookie httpOnly.
3. `GET /auth/user` recupera la sesión al cargar la app.
4. `POST /auth/logout` cierra la sesión.

Un rol desconocido se degrada a `USER` (mínimo privilegio).

## Módulos remotos (iframe)

`RemoteModuleFrame` embebe la URL del módulo con
`sandbox="allow-scripts allow-same-origin allow-forms"` y se comunica por `postMessage`:

| Mensaje                                | Cuándo                                              |
| -------------------------------------- | --------------------------------------------------- |
| `{ type: 'EMBEDDED', embedded: true }` | Al cargar el iframe y al recibir `IFRAME_READY`     |
| `{ type: 'THEME_CHANGE', theme }`      | Al montar, al cambiar el tema y tras `IFRAME_READY` |

Los módulos remotos deben responder `{ type: 'IFRAME_READY' }` cuando terminan de arrancar; así se
elimina la carrera entre el evento `load` y el registro de sus listeners.

## Scripts

```bash
npm install
npm run dev            # http://localhost:5174
npm run build          # typecheck + build de producción
npm run preview

npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
npm run lint:fix
npm run format         # Prettier (escribe)
npm run format:check

npm test               # Vitest (run)
npm run test:watch
npm run test:coverage  # cobertura v8, umbral 80% en líneas/funciones/branches/statements
```

## Variables de entorno

| Variable                        | Default                               |
| ------------------------------- | ------------------------------------- |
| `VITE_API_URL`                  | `http://localhost:8085`               |
| `VITE_MODULE_DASHBOARD_URL`     | `http://localhost:4200`               |
| `VITE_MODULE_SHIELD_URL`        | `http://localhost:5173/shield`        |
| `VITE_MODULE_INTERVENTIONS_URL` | `http://localhost:5173/interventions` |

Los valores se normalizan (trim y sin `/` final) en `src/shared/config/env.ts`.

## Pruebas

- `src/test/setup.ts` levanta MSW y limpia el DOM/localStorage entre pruebas.
- `src/test/msw/handlers.ts` define los endpoints de auth; cada test puede sobreescribirlos con
  `server.use(...)` para simular errores o roles.
- `renderWithProviders` envuelve el componente en QueryClient, ThemeProvider y MemoryRouter.
- Se cubren flujos de usuario (login, guardas por rol, logout, tema), hooks (`renderHook`) y
  errores de red/servidor. Cobertura actual: **100% líneas, 97.95% branches**.

## Tema

- Claro por defecto; el toggle en el header alterna y persiste en `localStorage`.
- El cambio se propaga al iframe mediante `THEME_CHANGE`.

## Microfrontends

El portal se consume por iframe (host) y expone `App` en `src/app/App.tsx` como raíz reutilizable.
La estructura por features y el `modules/registry.ts` permiten migrar a Module Federation sin
cambiar los límites entre features.
