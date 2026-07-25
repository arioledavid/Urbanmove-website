# ADR 005 — Job Workflow & Calendar Projection

## Decision

### Lead → job intake

Website quote forms send an **ops email** (Resend) only. There is no enquiry entity in the admin platform.

Staff convert leads offline (email / phone / deposit), then **create a Job manually** in admin (`/jobs/new` → `jobService.create`).

### Job lifecycle

```
Draft → Scheduled → In progress → Completed
```

Side exit: **Cancelled** (reopen to Draft only).

**Job defaults at creation:** status `DRAFT`. Staff set `scheduledStart` / `scheduledEnd` on the job detail page and advance status through the job workflow.

Implemented in `src/lib/job-workflow.ts`.

### Calendar is a Job projection

**Decision (standalone):** There is **no `CalendarEvent` model**, and there will not be one for “calendar as a feature.”

The calendar UI reads `Job.scheduledStart` / `Job.scheduledEnd` (and status) and renders a schedule view. It owns no data. Avoiding double-booking is a Jobs+Calendar problem.

## Context

Double-booking risk is managed via the jobs calendar. Commercial intake (quotes, deposits) happens outside the admin app; admin owns scheduling and delivery once a job exists.

## Why

- Matches how staff work: email leads first, system of record when work is booked.
- Keeps schema small: schedule and contact fields on `Job` are enough.
- No orphan pipeline records for spam or abandoned quotes.

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Enquiry pipeline with Convert to Job gate | Removed — jobs are created manually from converted email leads |
| `CalendarEvent` model (or copying jobs into events) | Dual sources of truth; sync bugs |
| In-app quote document generation | Explicitly deferred |
