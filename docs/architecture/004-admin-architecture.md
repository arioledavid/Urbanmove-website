# ADR 004 — Admin Architecture

## Decision

Structure the app with **route groups** and a mandatory call chain:

```
Page / Route Handler → Server Action (thin) → Service → Prisma → MongoDB
```

No exceptions: website quote intake, admin mutations, seeds, and future imports all call the same service methods.

Every service method returns **`Result<T>`**:

```ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Significant mutations call **`activityService.log(...)` directly** inside the relevant service method (not via an event bus).

Services are the only layer that writes `Activity` (see ADR 006, rule 3).

Reference numbers are generated only by `ReferenceService`; no caller formats or allocates one directly (see ADR 003).

Admin UI lives under `(admin)` with a shell (sidebar, top bar). Marketing chrome stays under `(marketing)`. Root layout holds only fonts/tokens/html shell.

## Context

The repo is a Next.js App Router marketing site. Admin must grow module-by-module without becoming a second backend or a ball of Prisma calls in React trees. The team is small; indirection for its own sake (repositories, microservices, brokers) would slow delivery.

## Why

### Route groups

- Removes marketing `Navbar`/`Footer` from admin (required before any admin UI).
- Keeps public SEO/analytics concerns out of ops layouts.

### Service layer + thin Server Actions

- One place for validation and business rules (e.g. job creation only at `DEPOSIT_PAID`).
- Actions validate transport-level input, call one service method, return its `Result`.
- Expected failures are `success: false` — not thrown — so Actions stay free of try/catch noise. Unexpected errors are logged and converted to a generic `Result` failure before reaching the client.

### `Result<T>`

- Uniform client handling (toast / inline error).
- Prevents leaking Prisma exceptions to the browser.

### Activity as a direct call

- Cross-cutting audit/feed from day one with zero broker infrastructure.
- **Future note:** if automation needs grow (webhooks, fan-out), this may evolve into a more formal event mechanism. Do not build that now.

### Folder intent (Phase 0)

```
src/app/(marketing)/…
src/app/(admin)/admin/…
src/lib/services/          # enquiry, job, activity, reference, auth helpers
src/lib/db/                # Prisma client
src/components/admin/      # shell + module UI
docs/architecture/         # ADRs
prisma/schema.prisma
src/proxy.ts
```

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Prisma in Pages / Components / Actions | Bypasses rules; duplicates logic; breaks website/admin parity |
| Repository layer over Prisma | Extra abstraction with one ORM and one DB |
| Separate Express/Node API | Second deploy; breaks host-only cookie same-origin model (ADR 001) |
| Microservices / event bus in Phase 0 | Overkill for team and traffic scale |
| Throwing for expected validation/business failures | Forces Action try/catch; inconsistent UX |
