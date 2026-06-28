# SEO Audit — Urban Move Logistics

> Last updated: 2026-06-28 · Status: Technical foundation complete; analytics wired; ongoing content refinement

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
| Google Tag Manager | Complete — `@next/third-parties` in src/app/layout.tsx; env-driven via `NEXT_PUBLIC_GTM_ID` |
| Direct GA4 / gtag snippet | None — configure GA4 inside GTM to avoid double-counting |
| NAP consistency (name, address, phone) | Complete — single source in `BUSINESS` (`src/lib/seo.ts`); display phone uses `+44 7776 446254`, JSON-LD/tel links use E.164 `+447776446254` |
| Old IONOS site → Vercel migration / redirects | Path redirects complete in next.config.ts; DNS cutover pending — see Migration section |

## Architecture

- Next.js 16, App Router, routes in `src/app/`
- Central SEO config: `src/lib/seo.ts` — shared helpers for OG images, keywords, business details, JSON-LD builders (`buildSocialMetadata()`, `buildServiceMetadata()`), and NAP constants (`BUSINESS`, `formatTelephoneDisplay()`)
- Service data single source of truth: `src/lib/services-data.ts` — drives nav, sitemap, footer links, hub page cards, and home page section labels
- Structured data component: `src/components/seo/json-ld.tsx` — renders JSON-LD `<script>` tags; MovingCompany schema injected in root layout
- Analytics: `GoogleTagManager` from `@next/third-parties/google` in `src/app/layout.tsx` — loads only when `NEXT_PUBLIC_GTM_ID` is set; no direct GA4/gtag in codebase

## Analytics & Tag Management

| Item | Location / notes |
|------|------------------|
| GTM container | `src/app/layout.tsx` — `<GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />` inside `<body>` |
| Env var (local) | `.env.local` — `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX` (replace with real container ID) |
| Env var (production) | Vercel Project Settings → Environment Variables — `.env.local` is not deployed |
| GA4 | **Not wired directly.** Add GA4 as a tag inside the GTM container. Do not add a separate `gtag.js` snippet — it will double-count page views alongside GTM-managed GA4. |
| Quote form events | Not yet tracked — if needed, fire custom events via GTM data layer on successful `/api/quote` submission |

## Environment Variables (SEO / analytics)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID (public; baked into client bundle) |

Server-only vars (`RESEND_*`) are unrelated to SEO — see contact form / email docs if added separately.

## NAP & Business Schema

All name, address, and phone values flow from `BUSINESS` in `src/lib/seo.ts`:

| Field | Value | Used in |
|-------|-------|---------|
| Name | Urban Move Logistics | Footer, JSON-LD, emails |
| Phone (E.164) | `+447776446254` | JSON-LD, `tel:` hrefs |
| Phone (display) | `+44 7776 446254` | Footer, legal page, quote emails — via `formatTelephoneDisplay()` |
| Email | info@urbanmovelogistics.co.uk | Footer, JSON-LD, legal |
| Address | Flat B, 64 Menzies Road, Aberdeen AB11 9BH | JSON-LD |

JSON-LD `sameAs` includes Google Business Profile, Instagram, and TikTok URLs.

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

## Migration (IONOS → Vercel)

Path redirects are live in `next.config.ts`:

| Old path | New path |
|----------|----------|
| `/about-us`, `/about-us/` | `/about` |
| `/contact-us`, `/contact-us/` | `/contact` |
| `/legal-notice`, `/legal-notice/` | `/legal` |

**Still pending before cutover:**

1. Point DNS for `urbanmovelogistics.co.uk` / `www.urbanmovelogistics.co.uk` to Vercel
2. Configure www ↔ apex and HTTP → HTTPS redirects in Vercel dashboard
3. Set `NEXT_PUBLIC_GTM_ID` in Vercel environment variables
4. Submit updated sitemap in Google Search Console after DNS propagates

## Open Items

1. **DNS cutover** — see Migration section above
2. **GTM container setup** — replace placeholder `GTM-XXXXXXX` with production container ID; configure GA4 and conversion tags inside GTM
3. **Aberdeen-first copy** — reconcile remaining 'across the UK' phrasing in about hero alt text and footer tagline with local SEO framing

## Change Log

- 2026-06-23: Initial audit (pre-migration site review)
- 2026-06-28: Technical implementation complete — OG images, local copy, /services hub, footer links, Twitter card overrides confirmed
- 2026-06-28: GTM added via `@next/third-parties`; NAP phone display standardised to `+44` format; SEO docs expanded with analytics, env vars, and migration tables
