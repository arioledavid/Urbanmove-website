# SEO Audit: UrbanMove Logistics

> Last updated: 2026-07-31 · Status: Technical foundation complete; Aberdeen-first content + schema enrichment in progress; DNS/GSC/GTM cutover still pending

## Status Summary

| Area | Status |
|------|--------|
| Metadata API (titles, descriptions) | Complete: all routes |
| metadataBase / title template | Complete: `src/lib/seo.ts` |
| Open Graph / Twitter cards | Complete: root defaults + per-page overrides; dedicated 1200×630 OG for man & van + storage only |
| robots.txt | Complete: `src/app/robots.ts` |
| sitemap.xml | Complete: `src/app/sitemap.ts`, 14 indexable routes (6 static + 8 services); service order via `NAV_SERVICE_ORDER` |
| JSON-LD structured data | Complete: MovingCompany (marketing layout) + Service + BreadcrumbList (service pages) + FAQPage |
| Canonical URLs | Complete: all routes |
| Custom 404 | Complete: `src/app/not-found.tsx`, noindex |
| Footer | Complete: company, contact, social, and all 8 service links |
| /services hub page | Complete: `src/app/(marketing)/services/page.tsx` |
| Nav / service name consistency | Complete: SSOT in `services-data.ts` |
| Man & Van / Storage service pages | Complete, with `/og/*.jpg` assets |
| About/Contact local copy | Mostly complete; Aberdeen-first pass applied 2026-07-31 |
| Apple touch icon / web manifest | Complete: `src/app/manifest.ts`, `public/apple-touch-icon.png` |
| Analytics (GTM / GA4) | Wired in marketing layout; env-driven, see Analytics section |
| NAP consistency | Complete: `BUSINESS` in `src/lib/seo.ts` |
| Old IONOS → Vercel redirects | Path redirects complete; DNS cutover pending |

## Architecture

- Next.js App Router, routes in `src/app/`
- Central SEO config: `src/lib/seo.ts` provides OG helpers, keywords, NAP, JSON-LD builders (`buildSocialMetadata()`, `buildServiceMetadata()`, `getMovingCompanyJsonLd()`, `getServiceJsonLd()`, `getBreadcrumbJsonLd()`)
- Service data SSOT: `src/lib/services-data.ts` feeds nav, sitemap, footer, hub, home sticky-scroll, hero flip labels
- Display order: `NAV_SERVICE_ORDER` (nav, footer, hub, sitemap) and `HOME_SERVICE_ORDER` (home hero + sticky scroll)
- Structured data: `src/components/seo/json-ld.tsx`; MovingCompany injected in `(marketing)/layout.tsx`
- Analytics: GTM and/or GA4 in `src/app/(marketing)/layout.tsx` only (admin excluded)

## Analytics & Tag Management

| Item | Location / notes |
|------|------------------|
| Marketing layout | `src/app/(marketing)/layout.tsx` |
| GTM | Loads when `NEXT_PUBLIC_GTM_ID` starts with `GTM-` |
| GA4 (direct) | Loads when `NEXT_PUBLIC_GA_ID` is set, **or** when `NEXT_PUBLIC_GTM_ID` starts with `G-` (legacy convenience) |
| Recommended production setup | Prefer **GTM only**: set `NEXT_PUBLIC_GTM_ID=GTM-…` and configure GA4 inside GTM. Do **not** also set `NEXT_PUBLIC_GA_ID`, because that double-counts page views. |
| Quote form events | Not yet tracked: fire custom `dataLayer` events on successful `/api/quote` submission |
| Search Console verification | Not in code yet; add meta tag or DNS TXT after property creation |

## Environment Variables (SEO / analytics)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GTM_ID` | GTM container (`GTM-…`) or legacy GA4 id (`G-…`) |
| `NEXT_PUBLIC_GA_ID` | Optional direct GA4; omit if GA4 runs inside GTM |

Server-only vars (`RESEND_*`) are unrelated to SEO.

## NAP & Business Schema

All name, address, and phone values flow from `BUSINESS` in `src/lib/seo.ts`:

| Field | Value | Used in |
|-------|-------|---------|
| Name | UrbanMove Logistics | Footer, JSON-LD, emails |
| Phone (E.164) | `+447776446254` | JSON-LD, `tel:` hrefs |
| Phone (display) | `+44 7776 446254` | Footer, legal, quote emails |
| Email | info@urbanmovelogistics.co.uk | Footer, JSON-LD, legal |
| Address | 64B Menzies Rd, Aberdeen AB11 9BH | JSON-LD + footer |
| Geo | lat `57.136649`, lng `-2.092033` (AB11 9BH) | MovingCompany JSON-LD |

JSON-LD `sameAs` includes Google Business Profile, Instagram, and TikTok URLs.

**Not yet in schema (need verified business data):** `openingHours`, `priceRange`, `AggregateRating` / `Review`.

## Routes (14 indexable + 1 noindex)

| Route | OG Image |
|-------|----------|
| `/` | `/og-image.png` |
| `/about` | `/og-image.png` |
| `/contact` | `/og-image.png` |
| `/services` | `/og-image.png` |
| `/services/house-office-removals` | `/removal.jpg` (needs dedicated `/og/` crop) |
| `/services/man-and-van` | `/og/manandvan.jpg` (1200×630) |
| `/services/storage-solutions` | `/og/storage-service.jpg` (1200×630) |
| `/services/furniture-delivery-assembly` | `/furniture-delivery.png` (needs `/og/`) |
| `/services/household-waste-clearance` | `/household-waste.jpg` (needs `/og/`) |
| `/services/student-moves` | `/student-moves.png` (needs `/og/`) |
| `/services/cargo` | `/cargo.png` (needs `/og/`) |
| `/services/same-day-courier` | `/same-day-courier.png` (needs `/og/`) |
| `/privacy` | `/og-image.png` |
| `/legal` | `/og-image.png` |
| `/404` (noindex) | inherited |

## Keywords (`DEFAULT_KEYWORDS` in `src/lib/seo.ts`)

Aberdeen-first local terms: removals, house removals, office removals, man and van, storage, furniture storage, same day courier, waste clearance, furniture delivery, student moves. Plus `cargo logistics UK` and brand name.

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
3. Set `NEXT_PUBLIC_GTM_ID` in Vercel (GTM-only; do not also set `NEXT_PUBLIC_GA_ID`)
4. Create Google Search Console property, verify, submit `/sitemap.xml` after DNS propagates

## Update roadmap

### Phase 0: Docs (done 2026-07-31)
Refresh this file to match code (analytics location, GA env support, schema/OG/CWV gaps).

### Phase 1: Ops & measurement (blocking for real SEO results)
1. DNS cutover + www/apex + HTTPS
2. Production GTM ID (GA4 inside GTM only)
3. Search Console verification + sitemap submit
4. Quote success → GTM `dataLayer` conversion event

### Phase 2: Aberdeen-first content (in progress / applied 2026-07-31)
| Surface | Intent |
|---------|--------|
| Home H1 | Brand voice + Aberdeen signal |
| Hero flip + typo | Fix “accross”; Aberdeen-led framing |
| Root + services hub meta / body | Lead Aberdeen; UK secondary |
| Reviews heading / trust line | Semantic heading + Aberdeen-first copy |
| FAQ service-areas | Local-first; national/international secondary |
| Footer tagline | Aberdeen-first |
| About hero alt | Aberdeen-first |

### Phase 3: Structured data enrichment (in progress / applied 2026-07-31)
1. `geo` on MovingCompany
2. `BreadcrumbList` on service hub + detail pages
3. Align Service `areaServed` with company (Aberdeen + UK)
4. Deferred: `openingHours`, `priceRange`, ratings (need verified data only)

### Phase 4: Assets & Core Web Vitals
1. Generate `/og/*.jpg` at 1200×630 for the six services still using page images
2. Compress oversized service PNGs (~1.8–1.9MB)
3. Hero video: `preload="metadata"` (not `auto`)
4. Sitemap: stable `lastModified` (not `new Date()` per request)
5. Optional: Vercel Speed Insights

### Phase 5: Growth (later)
- Unique location/service landing pages only with real copy ownership
- GBP / citation NAP consistency
- Keyword-aware internal linking
- No blog without a content owner

**Out of scope:** hreflang (single-locale EN), indexing `/api` or admin.

## Open Items

1. **DNS cutover**: see Migration
2. **GTM + GSC**: production container, verification, sitemap submit
3. **Quote conversion events**: `dataLayer` on `/api/quote` success
4. **Dedicated OG images**: 6 remaining services
5. **Image/video weight**: compress service assets; hero video preload tightened in Phase 4
6. **Verified schema fields**: opening hours, price range, aggregate ratings when data is real
7. **Service body copy**: several heroes still premium/generic vs Aberdeen-strong metadata

## Change Log

- 2026-06-23: Initial audit (pre-migration site review)
- 2026-06-28: Technical implementation complete: OG images, local copy, /services hub, footer links, Twitter card overrides confirmed
- 2026-06-28: GTM added via `@next/third-parties`; NAP phone display standardised to `+44` format; SEO docs expanded with analytics, env vars, and migration tables
- 2026-06-29: Added Man & Van and Storage Solutions service pages; sitemap expanded to 14 routes; `getServiceHeroDescription()` for richer service metadata; hub and home features copy updated; sitemap uses `NAV_SERVICE_ORDER`
- 2026-06-29: Optimized Man & Van and Storage OG images: dedicated `/og/*.jpg` assets at 1200×630
- 2026-07-31: Plan audit; corrected analytics location/GA dual-path docs; added roadmap Phases 0–5; Aberdeen-first content pass; MovingCompany geo + BreadcrumbList + service areaServed alignment; sitemap lastModified + hero video preload hygiene
