# Flow Portal Frontend (Login)

Portal maestro para orquestar aplicaciones remotas (flow-viewer Angular + app-shell React).

## Tecnologías
- **React 18** + Vite
- **TypeScript**
- **React Router DOM v6**
- **Tailwind CSS v3**
- **Zap** - Logger estructurado

## Arquitectura

```
flow-portal/
├── src/
│   ├── components/
│   │   ├── AuthProvider.tsx      # Contexto de autenticación
│   │   ├── ProtectedRoute.tsx    # Ruta protegida con loading state
│   │   ├── ThemeProvider.tsx     # Contexto de tema + eventos
│   │   └── PortalLayout.tsx      # Layout con nav + iframe
│   ├── pages/
│   │   ├── AppRoutes.tsx         # Rutas principales
│   │   ├── LoginPage.tsx         # Página de login
│   │   └── DashboardPage.tsx     # Dashboard con iframe embedido
│   ├── services/
│   │   └── auth.ts               # Servicio de autenticación (cookies)
│   ├── types/
│   │   └── index.ts              # Interfaces TypeScript
│   ├── App.tsx                   # Componente raíz
│   ├── main.tsx                  # Punto de entrada
│   └── index.css                 # Tailwind CSS
└── vite.config.js
```

## Rutas

| Path | Component | Auth | Rol |
|------|-----------|------|-----|
| `/login` | LoginPage | Público | - |
| `/` | DashboardPage | Privado | ADMIN/USER |
| `/dashboard` | DashboardPage | Privado | ADMIN/USER |
| `/shield` | DashboardPage | Privado | ADMIN |
| `/interventions` | DashboardPage | Privado | ADMIN |

## Autenticación (Cookie-based)

1. **Login:** POST a `/auth/login` con `credentials: 'include'`
2. **Cookie:** httpOnly, 3h duración
3. **Validación:** OnLoad verifica con GET `/auth/user` usando cookie
4. **Logout:** POST a `/auth/logout`

### AuthProvider
```typescript
interface AuthContextType {
  user: User | null;        // Usuario autenticado
  isAuthenticated: boolean; // Estado derivado
  isLoading: boolean;       // Loading en checkToken()
  login: () => Promise<void>;
  logout: () => Promise<void>;
}
```

### ProtectedRoute
```tsx
const { isAuthenticated, isLoading } = useAuth();
if (isLoading) return <Loading />;
return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
```

## Dashboard (Iframe Embedido)

### Rutas y módulos
- `/dashboard` → `http://localhost:4200` (Angular)
- `/shield` → `http://localhost:5173/shield` (React)
- `/interventions` → `http://localhost:5173/interventions` (React)

### Comunicación iframe
El portal envía mensajes al iframe vía `postMessage`:
```javascript
// Theme change
{ type: 'THEME_CHANGE', theme: 'dark' }
// Embedded mode
{ type: 'EMBEDDED', embedded: true }
// Auth token (legacy)
{ type: 'AUTH_TOKEN', token: '...', embedded: true }
```

## Instalación

```bash
npm install
npm run dev  # http://localhost:5174
```

## Variables de entorno

```
VITE_API_URL=http://localhost:8085  # Auth service URL
```

## Temas

- **Light:** default, toggle a dark
- **Dark:** toggle desde button en nav
- **Persistencia:** localStorage (`theme: 'dark'|'light'`)
- **Sincronización:** Cambios de tema se envían al iframe vía postMessage

## Dependencias principales

| Package | Versión | Uso |
|---------|---------|-----|
| react | 18.x | UI framework |
| react-router-dom | 6.x | Enrutamiento |
| tailwindcss | 3.x | Estilos |
| vite | 5.x | Bundler |
| typescript | 5.x | Tipado |
