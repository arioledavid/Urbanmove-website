# SEO Audit — Urban Move Logistics

> Last updated: 2026-06-28 · Status: Technical foundation complete; ongoing content refinement

## Status Summary

| Area | Status |
|------|--------|
| Metadata API (titles, descriptions) | Complete — all routes |
| metadataBase / title template | Complete — src/lib/seo.ts |
| Open Graph / Twitter cards | Complete — root defaults + per-page overrides, including per-service images |
| robots.txt | Complete — src/app/robots.ts |
| sitemap.xml | Complete — src/app/sitemap.ts, 12 routes incl. /services |
| JSON-LD structured data | Complete — MovingCompany (layout) + Service schema (per service page) |
| Canonical URLs | Complete — all routes |
| Custom 404 | Complete — src/app/not-found.tsx, noindex |
| Footer | Complete — company, contact, social, and all 6 service links |
| /services hub page | Complete — src/app/services/page.tsx |
| Nav consistency (Cargo naming) | Complete |
| Service name consistency (home vs service pages) | Complete — single source of truth in services-data.ts |
| OG share image | Complete — /og-image.png (1424×752), per-service fallback images |
| About/Contact local copy | Mostly complete — flag: about-hero-section.tsx alt text and footer still contain 'across the UK' phrasing, inconsistent with Aberdeen-first framing elsewhere. Needs follow-up. |
| Apple touch icon / web manifest | Complete — src/app/manifest.ts, public/apple-touch-icon.png, icons.apple in layout.tsx |
| Old IONOS site → Vercel migration / redirects | **Not implemented — see Migration section below** |

## Architecture

- Next.js 16, App Router, routes in `src/app/`
- Central SEO config: `src/lib/seo.ts` — shared helpers for OG images, keywords, business details, JSON-LD builders (`buildSocialMetadata()`, `buildServiceMetadata()`)
- Service data single source of truth: `src/lib/services-data.ts` — drives nav, sitemap, footer links, hub page cards, and home page section labels

## Routes (12 indexable + 1 noindex)

| Route | OG Image |
|-------|----------|
| `/` | `/og-image.png` |
| `/about` | `/og-image.png` |
| `/contact` | `/og-image.png` |
| `/services` | `/og-image.png` |
| `/services/house-office-removals` | `/removal.jpg` |
| `/services/same-day-courier` | `/same-day-courier.png` |
| `/services/furniture-delivery-assembly` | `/furniture-delivery.png` |
| `/services/household-waste-clearance` | `/household-waste.jpg` |
| `/services/student-moves` | `/student-moves.png` |
| `/services/cargo` | `/cargo.png` |
| `/privacy` | `/og-image.png` |
| `/legal` | `/og-image.png` |
| `/404` (noindex) | `/og-image.png` (inherited) |

## Open Items

1. **Migration from old IONOS site** — DNS still on old host, currently on Vercel preview URL. Path redirects (/about-us/, /contact-us/, /legal-notice/) implemented in next.config.js. Domain-level www/apex/protocol redirects to be configured in Vercel dashboard before DNS cutover. See migration section in project notes for full plan.

## Change Log

- 2026-06-23: Initial audit (pre-migration site review)
- 2026-06-28: Technical implementation complete — OG images, local copy, /services hub, footer links, Twitter card overrides confirmed
