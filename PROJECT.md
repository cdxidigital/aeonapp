# Project: AEON

**Release:** Beta 0.9 | **Mode:** Extended | **Template:** Project Build Standard 1.0.0 | **Updated:** 2026-11-08 (Australia/Perth)  
**Canonical state:** [project-state.json](project-state.json) | **Source:** [cdxidigital/aeonapp](https://github.com/cdxidigital/aeonapp)  
**Default-branch baseline:** \`main@a775d9deab8d3119a716417de01da8a2aceeacbf\`  
**Active work branch:** \`feat/aeon-project-build-standard\` (review-only, not a public deployment)

## Brief

**User / problem:** Adults who want understandable natal-chart and reflective astrology experiences, with transparent astronomical calculations and private journaling. The current web app exists; the immediate problem is incomplete release QA and insufficient continuity between development sessions.

**Desired release:** A free, reliable **local-first private web beta** with Today, Chart, Connections, Almanac, Journal, first-visit onboarding and Illustrated Readings. Users can use a clearly labeled sample, enter their own birth details, understand time uncertainty, export/import encrypted or legacy backups and download report PDFs. A beta reviewer should be able to prove the whole journey works across supported desktop/mobile browsers.

**Now (only active progress denominator):** Repair and finish Beta 0.9 build, repeatable PDF fixtures, privacy/copy review, browser and backup QA, quality CI, preview/rollback smoke, beta handover and review.

**Next:** Web 1.0 verified accounts, owner-scoped PostgreSQL storage, opt-in cloud sync, deletion/recovery and observability.

**Later:** Paid Free/Plus/Cosmos entitlements and independently verified web/store purchases; signed Android/iOS applications; further report and transit enhancements. Nothing in Next/Later counts in Beta 0.9 percentage.

**Constraints:** Preserve React 19/TanStack/Vite + Astronomy Engine and local-first privacy; no replacement with the unrelated FastAPI/Expo prototype. Avoid fabricated rising signs, health predictions or deterministic partner verdicts. No unapproved production changes, payment activation, app-store release or destructive migration. User budget and release date remain **unknown**, not assumed.

## Decisions (do not re-ask)

| ID | Date | Decision | Evidence | Supersedes |
| --- | --- | --- | --- | --- |
| D01 | 2026-11-08 | Release only the bounded local-first web beta now; cloud, billing, mobile are separate releases. | [Existing launch plan](docs/LAUNCH_ROADMAP.md) | The unbounded "everything to launch" denominator |
| D02 | 2026-11-08 | Work from current \`main@a775d9d\`; PR #5 is merged, PR #6 open but its feature files are already present on main. Do not double-merge. | [PR #5](https://github.com/cdxidigital/aeonapp/pull/5), [PR #6](https://github.com/cdxidigital/aeonapp/pull/6) and matched main tree | Prior pre-merge assumption |
| D03 | 2026-11-08 | Keep cinematic opening, tutorials, existing Paper/Night/Live themes, accessible chart language and reading studio. | [Current AEON shell](src/components/aeon/AeonApp.tsx) | Any unrelated redesign |
| D04 | 2026-11-08 | Count test/build job evidence, not unrelated successful bot workflow. | [Failed quality job](https://github.com/cdxidigital/aeonapp/actions/runs/41041692581), [successful Dependabot](https://github.com/cdxidigital/aeonapp/actions/runs/41041716733) | Misleading overall green status |

## Progress and stages

**41% | 23 of 56 active-release effort points evidenced done | Stage 5/8: Build | Building.** Code-present tasks are counted separately from real-browser verification; a source implementation is not a released service.

| Gate | Status | Exit / next evidence |
| --- | --- | --- |
| 1 Brief | Passed | Beta outcome, audience, exclusions, constraints recorded |
| 2 Roadmap | Passed | Stage-gated Now/Next/Later, effort points and dependencies |
| 3 Design | Passed | Existing navigation, onboarding, responsive themes and reading UI inspected |
| 4 Foundation | Passed | React/TanStack, local store, Astro, scripts and workflow definitions inspected |
| 5 Build | Pending | Run newly added PDF QA fixture generator; polish settings/error disclosure |
| 6 Verify | Pending | PDF visual review, browser accessibility, data recovery, privacy and failing GitHub Actions quality job |
| 7 Release | Pending | Revision-matched preview smoke, rollback drill and release authorization |
| 8 Handover | Pending | Operational guide, recovery and support/feedback owners |

Detailed acceptance criteria, evidence, blockers and task dependencies live only in **[project-state.json](project-state.json)**.

## Continuation

**Last evidenced outcome:** Current default branch includes first-visit/onboarding, charts, report studio, browser export and encrypted backup source. The new QA script and executable instructions have been committed to the review branch. The default-branch GitHub Actions quality job failed before any steps; the apparent green run was Dependabot, not the release build.

**Current task T11:** Run \`npm ci && npm run qa:pdf\` (or \`npm run qa:pdf:all\`) on an authorized checkout, inspect synthetic manifest and render the generated PDF pages. New harness: [scripts/qa-aeon-pdf.mjs](scripts/qa-aeon-pdf.mjs). Execution has **not** been verified from this connector-only session.

**Exact next action:** Obtain an executable checkout/build environment, run synthetic sample generation and Node tests, render all representative samples into PNGs, inspect them following [Beta QA Checklist](docs/BETA_QA_CHECKLIST.md). Then fix issues and run the browser/device matrix, with linked evidence on the same SHA.

**Known blockers:** (B01) GitHub Actions runner/job has no visible steps; repository administrator to inspect org/runner policy. (B02) Vercel connector currently rejects account access, so the latest preview cannot be reverified here. (B03) Browser/renderer/device checks not yet executed. None is an automatic reason to delete unfinished release tasks.

**Release authority:** Merges, production promotion, billing and public releases remain separate explicit decisions. Draft branch is not deployed to production.

## Scope history

2026-11-08: Replaced an unbounded continuous launch roadmap with **Beta 0.9 / 56 relative effort points**. Before: no valid point denominator (no meaningful percentage). After: 23/56 evidenced done, 41%. Cloud storage, payments and native app work remain in Next/Later. No artificial reduction of unfinished beta tasks. No budget or target launch date invented.

## Improvement log

- **I01 (pending reusable trial):** Existing features were repeatedly restated as future work because PR #5 was merged and PR #6 remained open while main already contained the files. Project-local rule: compare current default branch and PR state before crediting work. Trial across other projects not yet performed.
- **I02 (adopted locally):** A successful Dependabot workflow did not prove AEON's quality gate passed. Track job-level status, exact SHA, command and reviewer evidence instead of overall green icons.
- **Template:** Pinned to Project Build Standard 1.0.0. No changes to installed skill, no background execution and no global evolution claimed.
