# ADR 005 — Enquiry Workflow, Job Gate & Calendar Projection

## Decision

### Enquiry lifecycle

Staff progress an enquiry through these statuses (UI is workflow-oriented, not generic CRUD):

```
New → Contacted → Quote Sent → Accepted → Deposit Paid
  → Job Created → Scheduled → Completed
```

Terminal side paths: **`Lost`**, **`Spam`**.

`ACCEPTED` and `DEPOSIT_PAID` are **distinct** and must both remain trackable — accepting a quote is not the same event as the deposit landing.

Quotes/templating/PDF generation are **out of scope** for Phase 0 and Phase 1. “Quote Sent” means staff marked that a quote was sent **outside** the system (manual process continues until a later phase).

### Job creation gate

A **Job is created only when the enquiry is `DEPOSIT_PAID`** — not before.

`jobService.createFromEnquiry`:

1. Loads enquiry; fails with `Result` error unless `status === DEPOSIT_PAID`.
2. Creates `Job` with `enquiryId` (Job owns the FK; see ADR 003).
3. Advances enquiry to `JOB_CREATED`.
4. Logs Activity (`JOB_CREATED` / status change as appropriate).

**Job defaults at conversion:** status `DRAFT` (no schedule yet). Staff set `scheduledStart` / `scheduledEnd` on the job detail page. When a job moves to `SCHEDULED` / `IN_PROGRESS` / `COMPLETED`, the linked enquiry status is advanced to match (`SCHEDULED` / `COMPLETED`).

### Enquiry status transition rules (Phase 1)

| From | Allowed next |
|------|----------------|
| Main path before Deposit Paid | Next step only (no skipping, no backward) |
| Deposit Paid | Convert to Job (separate action) — not a manual status jump |
| Any status before Job Created | Side exits: `Lost`, `Spam` |
| Lost / Spam | Reopen to `Contacted` only |
| Job Created → Scheduled → Completed | Driven by job updates, not the enquiry workflow buttons |

Implemented in `src/lib/enquiry-workflow.ts`.

### Calendar is a Job projection

**Decision (standalone):** There is **no `CalendarEvent` model**, and there will not be one for “calendar as a feature.”

The calendar UI reads `Job.scheduledStart` / `Job.scheduledEnd` (and status) and renders a schedule view. It owns no data. Avoiding double-booking is a Jobs+Calendar problem and ships together in **Phase 1** (not deferred behind an Enquiries-only phase).

## Context

Today double-booking risk is managed manually. The highest-value ops surface is seeing when jobs are scheduled. Enquiries feed that pipeline; the calendar does not need its own entity graph.

## Why

- Matches how staff already think about the pipeline.
- Prevents orphan jobs before deposit commitment.
- Keeps schema small: schedule fields on `Job` are enough for conflict visibility.
- Separating Accepted vs Deposit Paid preserves real-world payment lag in reporting and filters.

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Creating a Job at Quote Sent / Accepted | Jobs before deposit create noise and calendar clutter |
| Collapsing Accepted + Deposit Paid | Loses a real business distinction |
| `CalendarEvent` model (or copying jobs into events) | Dual sources of truth; sync bugs |
| Enquiries-only Phase 1, Calendar later | Defers the actual business problem (double-booking) |
| In-app quote document generation in Phase 0/1 | Explicitly deferred until existing quote docs are reviewed |
