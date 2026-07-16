# ADR 003 — Database

## Decision

Introduce **Prisma + MongoDB** as the sole persistence layer for the admin platform (and for website quote → enquiry persistence in Phase 1).

**Prisma version pin:** use **Prisma ORM v6.19.x** (not v7). Prisma 7 does not yet support MongoDB; stay on v6 until upstream Mongo support lands.

**Phase 0 collections/models only:**

- `User`
- `Enquiry`
- `Job`
- `Activity`
- `Counter` (atomic sequence storage for reference numbers)
- `LoginAttempt` (auth rate limiting)

Human-readable references (`ENQ-YYYYMMDD-####`, `JOB-YYYYMMDD-####`, future `CUS-#####`) are generated only by **`ReferenceService`**, which wraps atomic `$inc` upserts on `Counter`. Callers never format references themselves.

The Enquiry ↔ Job relation is **one-to-one with the FK on `Job`** (`Job.enquiryId`). `Enquiry.job` is a back-relation only.

## Context

Today the marketing app has no database; quote requests are emailed via Resend and discarded. Ops needs durable enquiries and scheduled jobs (calendar = job projection). MongoDB fits document-ish quote payloads (`Enquiry.payload` Json) while Prisma gives typed access consistent with the TypeScript codebase.

## Why

- Greenfield Prisma schema keeps types and migrations/workflows in-repo.
- Minimal Phase 0 model set avoids speculative Customer/Quote/Payment/Staff/Vehicle/Storage tables.
- Atomic counters prevent reference collisions under concurrent website submissions.
- Searchable enquiry fields (`fromAddress`, `toAddress`, `postcodeFrom`, `postcodeTo`, `moveDate`, `propertyType`) are real columns + indexes; full form snapshot remains in `payload`.
- `Activity.type` is an enum so dashboards and filters stay consistent.
- `ACCEPTED` and `DEPOSIT_PAID` stay distinct enquiry statuses (acceptance ≠ money received).

### Reference numbers

- Storage: `Counter` with ids like `enquiry:20260716`, `job:20260716`, `customer`.
- Algorithm: `findOneAndUpdate` + `$inc: { seq: 1 }` + `upsert: true` + return updated doc.
- Formatting: exclusively inside `lib/services/reference-service.ts`.
- UI/URLs: show `reference` only — never MongoDB `ObjectId`.

### Relation ownership

`jobService.createFromEnquiry` creates a `Job` with `enquiryId` set. It does **not** write `Enquiry.jobId` (that field does not exist).

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| SQL from day one | Mongo already chosen; quote snapshots map cleanly to Json |
| Premature Customer/Quote/Payment/Staff/Vehicle/Storage models | Arrive with their phases |
| Dual FK Enquiry.jobId + Job.enquiryId | Invalid/ambiguous 1:1; Job owns the FK |
| Naive `count() + 1` references | Race conditions under concurrency |
| Encoding reference format in callers | Format changes would scatter; `ReferenceService` owns it |
| Redis-only counters | Extra infra; Mongo atomic ops are enough |
