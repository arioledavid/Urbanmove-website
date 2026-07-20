# ADR 001 — Subdomain Routing & Cookie Strategy

## Decision

Run marketing and admin in **one Next.js app / one Vercel project / one deployment**, with two hostnames:

- Marketing: `www.urbanmovelogistics.co.uk` (canonical; matches existing `SITE_URL`)
- Admin: `admin.urbanmovelogistics.co.uk`

Internal App Router paths always use the `/admin` prefix. On the admin host, browsers see **clean URLs** (no `/admin` prefix); `src/proxy.ts` rewrites them to `/admin/*`.

Requests to `/admin` (or `/admin/*`) on the marketing host **308 redirect** to the equivalent clean path on the admin subdomain — they do not 404 and do not render admin UI under `www`.

Auth session cookies are **host-only** on `admin.urbanmovelogistics.co.uk` (no `Domain=.urbanmovelogistics.co.uk`).

### Canonical URL policy

Every admin page has **exactly one** canonical URL: the clean path on the admin host. All other entry shapes normalize to it:

| User enters | Result |
|-------------|--------|
| `www…/admin/jobs` | 308 → `admin…/jobs` |
| `admin…/admin/jobs` | 308 → `admin…/jobs` |
| `admin…/jobs` | canonical (200) |

### Proxy scope boundary

`proxy.ts` is responsible only for host routing, URL normalization, and authentication gating (session presence check). It must never perform business logic, database mutations, writes of any kind, or analytics/tracking calls. Anything beyond routing and auth-gating belongs in a Server Action, Route Handler, or Service.

### Extensibility note

Hostname detection (`isAdminHost` / equivalent) is intentionally the **single place** host-routing decisions are made, so future subdomains (e.g. a customer portal or driver app) can extend that helper without touching `proxy.ts` core logic. No action required until such a subdomain is actually planned.

## Context

The public site already lives at `www.urbanmovelogistics.co.uk`. The ops platform must live at `admin.urbanmovelogistics.co.uk` without a second service, second deploy, or Node/Express backend. Auth cookies must stay same-origin with admin Server Actions / Auth.js handlers.

Local equivalents: `localhost:3000` (marketing) and `admin.lvh.me:3000` (admin). Use `admin.lvh.me` rather than `admin.localhost` — Node.js cannot resolve `admin.localhost` for dev-server proxying unless you add `127.0.0.1 admin.localhost` to `/etc/hosts`.

## Why

- One deployment keeps env, Prisma, and Auth.js aligned.
- Clean admin URLs match the product hostname; `/admin` remains the stable internal namespace for route groups and code.
- Redirecting `www/admin` → admin host prevents mixed chrome, duplicate admin origins, and accidental indexing under marketing.
- Host-only cookies avoid exposing the admin session to every subdomain; cross-host sharing is unnecessary because login only happens on the admin origin after redirect.
- A single hostname helper keeps future subdomain expansion localized.

### `proxy.ts` behaviour (agreed)

1. Resolve hostname from `x-forwarded-host` (Vercel) else `Host` (strip port).
2. **Non-admin host:** if path is `/admin` or `/admin/*`, 308 to `ADMIN_ORIGIN` with `/admin` stripped and query preserved; otherwise `next()`.
3. **Admin host:**
   - Pass `/api/*` through (Auth.js lives at `/api/auth/*`).
   - If path still starts with `/admin`, 308 to the clean equivalent on the same host.
   - Otherwise rewrite `/` → `/admin`, `/dashboard` → `/admin/dashboard`, etc.
   - For rewritten targets other than `/admin/login`, require a valid session; if missing, redirect to `/login?callbackUrl=…`.

### Cookie attributes (production)

| Attribute | Value |
|-----------|--------|
| `Domain` | omitted (host-only) |
| `Path` | `/` |
| `HttpOnly` | `true` |
| `Secure` | `true` |
| `SameSite` | `lax` |

`AUTH_URL` / trust-host settings point at the admin origin. See ADR 002 for session strategy.

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Separate Vercel project for admin | Deploy/env drift; contradicts single-app decision |
| Serve admin only under `www…/admin` | Conflicts with `admin.` hostname goal |
| Soft 404 `/admin` on marketing | Breaks links; redirect is clearer |
| Parent-domain cookies (`.urbanmovelogistics.co.uk`) | Wider session exposure with no benefit under redirect model |
| Multi-zone / second Next app | Out of scope; single deployment mandated |
