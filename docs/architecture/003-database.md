# ADR 003 — Database

## Decision

Introduce **Prisma + MongoDB** as the sole persistence layer for the admin platform.

**Prisma version pin:** use **Prisma ORM v6.19.x** (not v7). Prisma 7 does not yet support MongoDB; stay on v6 until upstream Mongo support lands.

**Core collections/models:**

- `User`
- `Job` (includes contact fields; created manually from converted email leads)
- `Activity`
- `Counter` (atomic sequence storage for reference numbers)
- `LoginAttempt` (auth rate limiting)

Human-readable references (`JOB-YYYYMMDD-####`, future `CUS-#####`) are generated only by **`ReferenceService`**, which wraps atomic `$inc` upserts on `Counter`. Callers never format references themselves.

Website quote requests are **email-only** (Resend) — they are not persisted as database records. Staff create jobs manually in admin when a lead converts.

## Context

Ops needs durable scheduled jobs (calendar = job projection). Quote intake arrives by email; jobs are entered when the commercial conversation converts.

## Why

- Greenfield Prisma schema keeps types and migrations/workflows in-repo.
- Minimal model set avoids speculative Customer/Quote/Payment/Staff/Vehicle/Storage tables.
- Atomic counters prevent reference collisions under concurrent job creation.
- Contact lives on `Job` so jobs are self-contained without an enquiry pipeline.
- `Activity.type` is an enum so dashboards and filters stay consistent. Legacy `ENQUIRY_*` activity types remain in the enum for historical rows.

### Reference numbers

- Storage: `Counter` with ids like `job:20260716`, `customer` (legacy `enquiry:…` counters may still exist).
- Algorithm: `findOneAndUpdate` + `$inc: { seq: 1 }` + `upsert: true` + return updated doc.
- Formatting: exclusively inside `lib/services/reference-service.ts`.
- UI/URLs: show `reference` only — never MongoDB `ObjectId`.

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| SQL from day one | Mongo already chosen |
| Premature Customer/Quote/Payment/Staff/Vehicle/Storage models | Arrive with their phases |
| Persisting website quotes as Enquiry records | Leads stay in email; jobs are created manually when converted |
| Naive `count() + 1` references | Race conditions under concurrency |
| Encoding reference format in callers | Format changes would scatter; `ReferenceService` owns it |
| Redis-only counters | Extra infra; Mongo atomic ops are enough |
