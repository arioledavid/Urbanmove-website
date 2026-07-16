# ADR 006 — Coding Standards (Anti-Drift Rules)

## Decision

These rules are mandatory for admin and for any code that writes domain data (including `POST /api/quote` in Phase 1). Violations are defects, not style nits.

### 1. Every mutation goes through a Service

- **Allowed to import Prisma:** `src/lib/services/**`, `src/lib/db/**`, seeds, and one-off maintenance scripts.
- **Forbidden to import Prisma / call the client:** Pages, Layouts, Components, and Server Actions.
- Route Handlers may only orchestrate (parse request → call service → map `Result` to HTTP).

Call chain:

```
Page / Route Handler → Server Action or thin handler → Service → Prisma → MongoDB
```

### 2. Every service returns `Result<T>`

```ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

- Expected failures (validation, illegal status transition, not found) → `success: false`.
- Do not throw for expected failures.
- Unexpected errors: log server-side, return a generic `success: false` message; never leak Prisma/stack traces to the client.

### 3. Every significant mutation writes Activity

Inside the service method that performed the change, call:

```ts
await activityService.log({ … })
```

Minimum Phase 0/1 types (enum):  
`ENQUIRY_CREATED`, `ENQUIRY_UPDATED`, `ENQUIRY_STATUS_CHANGED`,  
`JOB_CREATED`, `JOB_UPDATED`, `JOB_STATUS_CHANGED`,  
`LOGIN_SUCCESS`, `LOGIN_FAILURE`.

Extend the enum when new mutation kinds appear. Prefer direct calls over an event bus (ADR 004).

### 4. Human-readable references only in UI and URLs

- User-facing entities expose `reference` (e.g. `ENQ-20260716-0001`).
- **Never** show MongoDB `ObjectId` in the UI, copy, or routes (`/admin/enquiries/ENQ-…`, not `/…/664f…`).
- Only `ReferenceService` formats and allocates references (ADR 003).

### 5. Server Actions are thin

```ts
"use server";

export async function createEnquiry(input: EnquiryInput) {
  // transport-level checks only (e.g. shape / auth present)
  return enquiryService.create(input); // already Result<T>
}
```

- One primary service call per Action.
- No business rules in Actions (status gates, reference allocation, activity logging belong in services).
- No try/catch for expected `Result` failures.

## Context

Without written constraints, Next.js apps accumulate Prisma calls in Server Components and duplicated validation between the public quote API and admin forms. These five rules keep Phase 1–4 from rewriting the architecture.

## Why

- Single domain entry point keeps website intake and admin edits consistent.
- `Result<T>` standardises error UX and Action code.
- Activity feed and dashboard “recent activity” stay trustworthy.
- Reference URLs stay stable if databases are re-seeded or migrated.
- Thin Actions keep auth/session checks obvious and testable.

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| “Just this once” Prisma in an Action | Becomes the norm within a week |
| Throwing `Error` for validation | Inconsistent handling; easy to leak internals |
| Optional activity logging | Gaps destroy audit value |
| ObjectIds in URLs “until we add slugs” | Permanent leakage of internals; ugly bookmarks |
| Fat Actions with workflow logic | Bypasses services; duplicates Phase 1 gates |
