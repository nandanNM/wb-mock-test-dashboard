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

### Demo login

The backend has no auth endpoint yet, so login is mocked in
[`src/features/auth/auth-service.ts`](src/features/auth/auth-service.ts):

- **Email:** `admin@example.com`
- **Password:** `password`

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

| Variable            | Description                  | Default           |
| ------------------- | ---------------------------- | ----------------- |
| `VITE_APP_NAME`     | App name shown across the UI | `Admin Dashboard` |
| `VITE_API_BASE_URL` | Backend API base URL         | `/api`            |
| `VITE_API_TIMEOUT`  | Per-request timeout (ms)     | `15000`           |

The frontend talks to the backend through `VITE_API_BASE_URL`. In dev, Vite
proxies `/api` → `http://localhost:8080` (see [`vite.config.ts`](vite.config.ts));
in production, nginx proxies `/api/` → the Go backend (see
[`deploy/nginx.conf`](deploy/nginx.conf)). The axios client in
[`src/lib/api.ts`](src/lib/api.ts) reads the base URL, attaches the auth token,
and unwraps the backend's `{ data }` / `{ error }` envelope. See
[`src/services/users.ts`](src/services/users.ts) for a sample data-fetching
service against `/v1/users`.

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

- **Auth** is structured around an `AuthProvider` + `useAuth()` hook. Swapping
  the mock for a real backend is a one-function change in `auth-service.ts`.
  The token is persisted to `localStorage` and attached to every request by an
  axios interceptor; a `401` clears it and the route guard redirects to login.
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
