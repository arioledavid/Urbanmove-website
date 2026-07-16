# ADR 002 — Authentication

## Decision

Use **Auth.js (NextAuth v5)** with the **Credentials** provider, **invite-only** users, and **role-based** access (`ADMIN` | `STAFF`).

Use the **JWT session strategy**. Split Auth.js config so `proxy.ts` only validates/decodes the session token and never runs password verification or Prisma.

Protect admin routes in `proxy.ts` (optimistic gate) and again via `auth()` in admin layouts / Server Actions (defence in depth).

Rate-limit failed logins with a MongoDB-backed `LoginAttempt` model (not Redis in Phase 0).

Future roles must extend authorization rules without changing existing `ADMIN` behavior — **adding a role must never narrow what `ADMIN` can already do.**

### Session lifetime policy

| Setting | Value |
|---------|--------|
| JWT lifetime | **8 hours** |
| Sliding refresh | Renew on activity when within **30 minutes** of expiry |
| “Remember me” / extended sessions | **Not supported** in Phase 0 |

### Password policy

| Rule | Value |
|------|--------|
| Minimum length | **12 characters** |
| Hashing | **bcrypt** (cost factor ≥ 12) |
| Reset | Admin-issued reset only; no security questions, no password hints |
| Self-service forgot-password | Not in Phase 0 |

### JWT claims allowlist

| Included | Excluded |
|----------|----------|
| `sub`, `email`, `role`, `active`, `iat`, `exp` | `name`, `avatar`, `preferences`, `permissions`, or any other user data |

Keep the token minimal. Load display-only profile fields from the database (or a thin server query) when a page needs them — not from the JWT.

### Password change invalidates sessions

JWT sessions cannot be revoked by deleting a server-side row. Mechanism from Phase 0:

1. `User.passwordChangedAt DateTime` on the schema (set on create and on every password change).
2. In the JWT / session validation path (callbacks used when the token is read), **reject** (force re-login) any token whose `iat` is earlier than the user’s current `passwordChangedAt`.
3. On password change, set `passwordChangedAt = now()`. Previously issued tokens fail on next validation — no blocklist required.

The password-change UI may land in a later phase; the **schema field and callback rule ship in Phase 0** so this is not retrofitted.

## Context

Admin is a small internal tool on `admin.urbanmovelogistics.co.uk`. There is no public signup. Password verification needs Node-capable crypto (`bcrypt`). Route protection must run in `proxy.ts` before admin pages render. Host-only cookies (ADR 001) require auth to stay same-origin on the admin host — Server Actions and `/api/auth/*` in this app, not a separate API origin.

## Why

### Auth.js + Credentials + roles

- Fits invite-only email/password for a handful of staff.
- Roles live on `User` and ride in the JWT for authorization checks (`role`, `active` only — see allowlist).
- Avoids a second auth vendor for Phase 0.
- Additive roles preserve `ADMIN` as a stable superuser baseline.

### Session strategy: JWT (not database)

1. Auth.js **Credentials** provider does not create adapter-backed DB sessions the way OAuth providers do; pairing Credentials with `session: { strategy: "database" }` is unsupported / error-prone.
2. JWT lets `proxy.ts` validate the session by decrypting/verifying the cookie **without a database round-trip** on every navigation.
3. Prisma/Mongo are not required on the hot proxy path.
4. `passwordChangedAt` vs token `iat` gives practical revocation without a blocklist.

Trade-off: full “sign out everywhere” without a password change still relies on short TTL (8h) and `active` checks in sensitive Actions. Acceptable for this team size.

### Node vs proxy runtime split

| Path | Runtime | What runs |
|------|---------|-----------|
| Credentials `authorize()` (password verify) | **Node** — Auth.js Route Handlers / sign-in flow only | Look up user, bcrypt compare, return user or null |
| `auth()` inside `proxy.ts` | **Node by default on Next.js 16** (`proxy` defaults to Node; `runtime` config is not allowed on proxy files) | Decode/validate JWT session cookie; redirect if missing |
| Admin layouts / Server Actions `auth()` | Node | Full session + role checks; may re-check `passwordChangedAt` / `active` |

**Rules:**

- Never call bcrypt (or load the Credentials `authorize` implementation) from the proxy module graph.
- Keep a thin `auth.config.ts` (edge-safe / proxy-safe: providers metadata, callbacks that only touch the token, pages) for proxy initialization.
- Keep full `auth.ts` (Credentials `authorize`, Prisma user lookup, password hashing, `passwordChangedAt` checks that need DB) for Route Handlers and the rest of the app.
- Even though Next.js 16 proxy is Node-default, we still **must not** treat proxy as a place for login or DB session fetches — only token validation and host routing (ADR 001). Proxy scope is further constrained in ADR 001.

We do **not** need to force proxy onto Edge. We also must not set `export const runtime` on `proxy.ts` (unsupported; throws).

### Login rate limiting

- Store attempts in MongoDB `LoginAttempt` keyed by `ip + normalized email`.
- Fixed window (e.g. 15 minutes), lock after N failures (e.g. 5), set `lockedUntil`, track `lastAttemptAt`.
- Why MongoDB: already required; in-memory counters fail across Vercel isolates; Redis deferred until load justifies it.
- Upgrade path: same `loginRateLimit` interface → Redis/Upstash later.

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Better Auth / Clerk | Auth.js already scoped and approved |
| Database session strategy with Credentials | Unsupported/fragile with Credentials; forces DB on every proxy check |
| Public self-registration | Internal ops tool; invite-only only |
| Redis rate limit in Phase 0 | Extra infra before proven need |
| Relying on proxy alone for authz | Proxy is optimistic; layouts/actions must re-check |
| Token blocklist for password change | Extra store; `passwordChangedAt` vs `iat` is enough |
| “Remember me” in Phase 0 | Longer-lived cookies increase risk for little ops benefit |
| Fat JWT (name, avatar, preferences, permissions) | Bloat and stale claims; keep allowlist minimal |
