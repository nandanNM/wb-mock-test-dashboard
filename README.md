# Admin Dashboard

A clean, production-ready admin dashboard built with **React + Vite + TypeScript**,
**Tailwind CSS v4**, and **shadcn/ui** (slate theme).

## Stack

| Concern        | Tooling                                            |
| -------------- | -------------------------------------------------- |
| Build / dev    | Vite 8                                             |
| UI framework   | React 19 + TypeScript                              |
| Styling        | Tailwind CSS v4 (`@tailwindcss/vite`)              |
| Components     | shadcn/ui (new-york style, slate base) + lucide    |
| Routing        | react-router-dom v7                                |
| HTTP           | axios (typed client with auth + error interceptors)|
| Notifications  | sonner                                             |
| Linting        | ESLint 10 (flat config) + typescript-eslint        |
| Formatting     | Prettier                                           |
| Git hooks      | Husky + lint-staged (pre-commit)                   |

## Getting started

```bash
pnpm install
cp .env.example .env   # already present; adjust as needed
pnpm dev               # http://localhost:5173
```

### Authentication

Auth is **Google OAuth**, handled server-side by the backend at
`api.wb.codernandan.in`:

1. **Login** is a full-page redirect to
   `/v1/auth/google/start?client=web` (`loginWithGoogle()`).
2. The backend completes OAuth, sets an httpOnly `refresh_token` cookie + a
   JS-readable `csrf_token` cookie on `.codernandan.in`, then redirects back to
   the dashboard.
3. On app load, [`AuthProvider`](src/features/auth/AuthProvider.tsx) calls
   `POST /v1/auth/refresh` (with credentials + `X-CSRF-Token`) to mint a 10-min
   access token held **in memory only**, then loads the profile from `/v1/me`.
4. The axios client retries once on `401 token_expired` (single-flight refresh).
5. **Logout** calls `POST /v1/auth/logout`, which clears the cookies.

Because the frontend and API are same-site under `*.codernandan.in`, cookies
flow automatically — every request uses `withCredentials: true`. Local dev on
`localhost` can't receive those cookies, so the full login flow only works on
the deployed domain.

RBAC: `useAuth()` exposes `hasRole(role)` and `can(permission)` (sourced from
`/v1/me`); gate UI with them and pages with
[`RequirePermission`](src/components/auth/RequirePermission.tsx). The backend
enforces RBAC regardless — client checks are UX only.

## Scripts

```bash
pnpm dev           # start the dev server
pnpm build         # type-check + production build
pnpm preview       # preview the production build
pnpm lint          # ESLint
pnpm lint:fix      # ESLint with --fix
pnpm format        # Prettier write
pnpm format:check  # Prettier check
pnpm typecheck     # tsc --noEmit
```

## Environment variables

Defined in `.env` (git-ignored) and documented in `.env.example`. Access them
through the typed helper in [`src/config/env.ts`](src/config/env.ts) rather than
reading `import.meta.env` directly.

| Variable           | Description                  | Default                          |
| ------------------ | ---------------------------- | -------------------------------- |
| `VITE_APP_NAME`    | App name shown across the UI | `Admin Dashboard`                |
| `VITE_API_URL`     | Backend API origin           | `https://api.wb.codernandan.in`  |
| `VITE_API_TIMEOUT` | Per-request timeout (ms)     | `15000`                          |

The axios client in [`src/lib/api.ts`](src/lib/api.ts) calls `VITE_API_URL`
directly with `withCredentials: true`, attaches the in-memory bearer token,
handles single-flight refresh, and unwraps the backend's `{ data }` / `{ error }`
envelope. See [`src/services/users.ts`](src/services/users.ts) for a sample
data-fetching service against `/v1/admin/users` (paginated).

## Project structure

```
src/
├── components/
│   ├── layout/      # Sidebar, Topbar (app chrome)
│   ├── theme/       # ThemeProvider, useTheme, ThemeToggle
│   └── ui/          # shadcn/ui primitives
├── config/          # typed env access
├── features/
│   └── auth/        # auth context, provider, hook, service, types
├── layouts/         # AuthLayout, DashboardLayout
├── lib/             # api client (axios), cn() util
├── pages/           # route screens (Login, Dashboard, NotFound, …)
├── routes/          # router config + route guards (Protected/Public)
├── services/        # axios data-fetching services (e.g. users)
├── App.tsx          # provider composition + RouterProvider
├── main.tsx         # entry
└── index.css        # Tailwind v4 + shadcn slate theme tokens
```

## Architecture notes

- **Auth** is structured around an `AuthProvider` + `useAuth()` hook. The access
  token lives in memory (never `localStorage`); the httpOnly refresh cookie
  restores the session on reload. An axios response interceptor performs a
  single-flight refresh-and-retry on `401 token_expired` and clears the token on
  other `401`s, so the route guard redirects to login.
- **Routing** uses nested layout routes. `PublicRoute` keeps logged-in users
  out of `/login`; `ProtectedRoute` gates the dashboard and preserves the
  attempted URL for post-login redirect.
- **Theming** supports light / dark / system with persistence, wired into both
  Tailwind (`.dark` class) and the sonner toaster.

## Adding shadcn/ui components

`components.json` is configured, so you can add more primitives with:

```bash
pnpm dlx shadcn@latest add table dialog tabs
```
