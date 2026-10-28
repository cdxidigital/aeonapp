# AEON Developer Guide

**Product:** AEON | Your sky. Your perspective.
**Repository:** https://github.com/cdxidigital/aeonapp
**Reference:** AEON Product & Developer Dossier, v1.0, 28 October 2026
**Feature branch:** feat/aeon-illustrated-report-studio

## Confirmed stack and boundaries

The actual repository is a React 19 / TanStack Start, Vite, TypeScript web application deployed using Vercel. It implements Astronomy Engine calculations, browser-local profiles/journals, Today, Chart, Connections, Almanac and guided reflection. Cloud account authentication and the production database are **not** connected. The independent FastAPI/Expo prototype described in the dossier is not part of this GitHub repository and must not be presented as deployed.

## Local development and QA

Use Node 22 or newer, install with npm ci and start with npm run dev (port 8080).

- npm run typecheck: TypeScript validation
- npm run test:aeon: focused Reading Studio regression suite
- npm run build: automatically runs typecheck and focused tests, then compiles via Vite/Nitro and runs the existing database-migration script
- npm test: full historical suite, including generic Grok PWA tests that currently conflict with the AEON-specific site metadata configuration

Build-time dependencies are installed with npm ci on Vercel. Generated .vercel output must not be committed. GitHub Actions verifies full tests, typecheck and build when a runner is available.

## Source map

| Source | Ownership |
| --- | --- |
| src/components/aeon/AeonApp.tsx | Application shell, chart navigation, profile form, settings and journaling |
| src/components/aeon/ReportStudio.tsx | Dossier selection, artwork preview, permission gate and browser PDF download |
| src/lib/aeon/astro.js | Calculated planet positions, angles, house cusps, aspects and dated sky snapshots |
| src/lib/aeon/content.js | Planet, sign and house interpretation library |
| src/lib/aeon/store.js | Local device data, backup and deletion |
| src/lib/aeon/report-studio.js | Reading chapters, visual themes, PDF vector composition, file export |
| src/lib/aeon/report-studio.test.mjs | Report type/style, provenance, uncertain birth time, consent and PDF-structure tests |
| src/styles.css | Responsive application and studio design tokens |
| migrations/ | Existing SQL migrations, skipped without DATABASE_URL |

## New Illustrated Reading Studio

User flow: open **Readings** from the navigation, select a chart profile, choose one of six reading categories and one of six art directions, see a calculated chart-wheel preview, then generate/download a private PDF.

Reading categories: Cosmic Blueprint; Love & Relationships; Wellbeing; Life Path; Year Ahead; Synastry.

Art directions: Celestial Luxe; Modern Insight; Sacred Geometry; Ancient Codex; Data Cosmos; Minimal Monochrome.

The core reading comprises **50 pages**: cover, method/introduction, placement ledger, illustrated natal wheel, Big Three, element/modality and aspect notes, guide to planets, 20 planet chapters (two per planet), house introduction, 12 house chapters, synthesis, four themed life-area chapters, personal reflection, glossary and provenance.

The annual variant adds two month-sample pages (52 total); this **does not** claim to calculate exact yearly transit windows. Synastry adds a partner-comparison page (51 total) and requires a saved second adult chart and explicit permission. All six report categories share the natal core in the first upgrade; a deeper, individually commissioned editorial structure for each category is a subsequent release.

**Editorial contract:** A planet describes a traditional topic; a sign a style; a house a life area; an aspect a measured angle. The calculations are reproducible astronomy. Interpretive meanings are reflective traditions, not verified medical, psychological or predictive claims. Missing birth times must never be replaced with invented rising signs or houses. Empty houses are not missing life areas. No relationship compatibility rankings.

**Privacy:** PDF bytes are assembled in the browser, downloaded directly and not uploaded to a report service. The output includes private birth details and is not automatically backed up to an account.

**Renderer limitations:** The first iteration uses PDF built-in fonts and basic ASCII transliteration; international typographic coverage, automatic overflow pagination, archival PDF conformance, sophisticated full-page artwork, PDF accessibility tags and page-by-page visual review are not yet implemented. These are required before commercial report sales. All outputs need a visual verification step.

## Production services planned, not yet delivered

As proposed in the dossier:

1. Identity, recovery, session control, export and deletion.
2. Authenticated, owner-scoped profiles with historical timezone validation and explicit consent for comparisons.
3. PostgreSQL with migrations, testable ownership controls and encrypted private records.
4. Asynchronous report jobs, private storage, signed download URLs and idempotency.
5. Versioned calculation and interpretation provenance; evidence-bound Oracle.
6. Android and iOS app builds, offline handling, accessibility and real-device QA.
7. Store-verified purchases, refunds, renewal grace periods, entitlement and restoration tests.
8. Logging, backups, retention schedules, observability and security checks.

Proposed API resources include profiles/{id}/chart, now, timeline, connections, journal/cycle, oracle/sessions, studio/catalog, studio/reports and billing/verify/webhooks. **These are proposed contracts, not functioning production endpoints.**

The dossier's Free, Plus and Cosmos tiers and indicative AUD prices are proposals only, not active offers. Do not display checkout before server-side verification and required platform approvals.

## Pre-release checks

Review source diff and pass typecheck, focused AEON tests, PDF file-structure checks, actual PDF rendering and accessibility tests. Test all six types/styles on real and sample birth data, unknown/approximate birth time, historical dates, empty houses and relationship consent. Inspect every report page for clipping, contrast and legibility. Confirm preview is deployed from freshly built source rather than stale .vercel/output. Merge only after review and perform separately approved production and mobile releases.

**Definition of done:** Working source, verified integration, accurate calculations with uncertainty, tested authorization, accessible UI, documented behaviour and confirmed deployment or release. Compilation alone is not a launch.
