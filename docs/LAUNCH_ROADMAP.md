# AEON | Launch Roadmap and Release Gates

**Status:** Active development, not production-ready.  
**Repository:** [cdxidigital/aeonapp](https://github.com/cdxidigital/aeonapp)  
**Source of truth:** Current React/TanStack/Vite repository. Reference: *AEON Product & Developer Dossier v1.0* (28 October 2026).  
**Delivery model:** Local-first web beta -> authenticated web launch -> paid web -> native Android/iOS.  
**Review branches:** \`feat/aeon-illustrated-report-studio\` (PR #5) followed by \`feat/aeon-launch-hardening\` (stacked changes).
**Rule:** Do not merge, promote to production, submit to an app store or activate charges until the appropriate explicit approval and checks are recorded.

## 1. Release decisions

| Choice | Current decision | Revisit when |
| --- | --- | --- |
| Initial platform | Responsive PWA/web beta, hosted on Vercel | Native sprint |
| Anonymous/local mode | Maintain it; do not force sign-in during beta | Account migration |
| Profile data | Browser-local; user-controlled export/delete | Authenticated DB available |
| Portable backups | Offer encrypted \`.aeon\` export and explicit legacy \`.json\` import/export | Recovery and usability QA |
| Astronomical engine | Preserve astronomy-engine and version every calculation | Historical fixture/house validation |
| Illustrated dossiers | Six types/styles, browser-side PDFs | PDF accessibility/Unicode and design QA |
| Relationship readings | Consent acknowledgement, no deterministic compatibility rank | Account-to-account consent protocol |
| Paid subscriptions | **OFF** until store/web verification and entitlements work | Payment sandbox passed |
| AI Oracle | Deterministic local evidence-based tool only | New provider and evidence security tests |
| Production database | **OFF** until owner-scoped schema/migrations/backup/restore pass | Server launch |
| Native mobile | Dedicated Android/iOS workstream, not a renamed website binary | App-store acceptance and device QA |

### Release names and scope

- **Beta 0.9:** Free, private, browser-local. Chart, Today, Almanac, Connections, Journal and Illustrated Readings. No promises of cloud sync, paid accounts or actual predictive certainty.
- **Web 1.0:** Verified identity, account management, encrypted private data, opt-in local-data migration, owner-scoped cloud persistence, deletion/export and operational monitoring. The free experience remains available.
- **Paid 1.1:** Free / Plus / Cosmos commercial packages with authoritative entitlements, accurate pricing, taxes, restore/cancel/refund handling and provider-confirmed purchases.
- **Mobile 1.2:** Real Android and iOS builds with proper navigation, secure credential storage, store billing and verified release artifacts.

## 2. Delivery gates

### Gate A | Private web beta: reliability and privacy (CURRENT)

**Engineering:**
- [x] Existing astronomical calculation and local-first chart/journal flows identified in repo.
- [x] Illustrated Reading Studio, six types/styles and downloadable PDF engine committed to draft PR #5.
- [x] Typecheck plus full historical test suite required before production-source preview builds.
- [x] Initial encrypted backup module with Web Crypto AES-256-GCM, unique salt/nonce, PBKDF2-SHA256 and authenticated metadata.
- [x] New .aeon export/restore interface alongside legacy .json compatibility.
- [x] PDF overflow splitting implemented so long text continues rather than silently disappearing.
- [ ] Browser QA of personal and uncertain-time chart onboarding, timezones, navigation and local persistence.
- [ ] Real download/restore tests in Chrome, Safari and Android browser, including wrong-password/tampered-file rejection, accessibility, screen-lock and memory pressure.
- [ ] PDF QA: rasterize **every page** of every representative style/type combination; inspect fonts, non-ASCII names, legends, chart fidelity, overflow, image contrast, page counts and print quality.
- [ ] Repair any release-blocking regressions; run \`npm run lint\`, \`npm run typecheck\`, \`npm test\`, \`npm run build\`, browser console/screenshot checks and an offline/PWA check.
- [ ] GitHub Actions workflow must execute with meaningful job steps; investigate workflow/organization policy or runner allocation separately from app test results.
- [ ] Verify privacy copy, consent language and scientific boundaries on every report type.
- [ ] Confirm release URL, support contact, terms/privacy policy, domain and incident owner.

**Go/no-go:** A beta can be promoted only after a reviewer records (1) all builds/tests green, (2) PDF review complete, (3) keyboard/mobile/a11y smoke complete, (4) data recovery tested, (5) no critical security findings and (6) release/rollback approval. A READY Vercel preview alone does not pass this gate.

### Gate B | Secure cloud accounts and persistence

**Implementation order:**
1. Confirm production identity and database providers, deployment ownership, secret management and backup destination.
2. Upgrade and security-review Better Auth plus adapters before activating authentication; synchronize affected auth nodes and audit open dependency advisories.
3. Add explicit \`authEnabled\` / \`cloudSyncEnabled\` gates. Existing local users must continue working without surprise data transfers.
4. Define owner-scoped PostgreSQL schema with migrations: \`users\`, \`profiles\`, \`chart_snapshots\`, \`journal_entries\`, \`connections\`, \`consents\`, \`report_jobs\`, \`report_files\`, \`billing_events\`, \`subscriptions\`, \`audit_events\`.
5. Enforce user identity from verified server session, never from client-submitted \`owner_id\`; apply server query ownership and DB policies with cross-account denial tests. Journal content and birth details must not appear in general request logs or analytics.
6. Add opt-in migration from device-local store, preview/compare before upload, conflict handling and rollback. No automatic bulk upload.
7. Add email/recovery, session controls, export, deletion, encrypted backups/restore drills, key rotation and retention workflows.
8. Add server-side rate limits, request validation, audit event redaction, smoke probes and error reporting without sensitive payloads.
9. Add signed/expiring private report links, queue/job idempotency and retry semantics only after server services are actually provisioned.

**Go/no-go:** Real users can sign up/sign out/recover, synchronize, export and delete their own data; no cross-user access; DB rollback and backup restore rehearsed; multiple-device sync/conflict tests green.

### Gate C | Subscription and reporting commerce

Indicative **AUD proposals from the dossier** (not active sale prices): Free $0; Plus A$7.99/mo or A$79.99/yr; Cosmos A$14.99/mo or A$149.99/yr. Reconfirm pricing and tax treatment before implementation.

**Must implement before taking payment:**
- Provider SKUs and platform-specific checkout: web processor for web; Apple/Google permitted in-app purchases for native apps where required.
- Provider-signed webhook/receipt verification on the server; durable unique event IDs and replay-safe handlers.
- Subscription ledger with grace, retry, renew, downgrade, cancel, refund, chargeback, restore and entitlement expiry.
- All paid feature decisions server-authoritative; users cannot set their own plan or report quota.
- Receipt and reporting audit trail, clear cancellation/refund UI, tax-inclusive Australian pricing and customer support route.
- Operational metrics: payment success/failure, entitlement drift, report completion, rendering cost, retention, support complaints.
- Legal/commercial review of report claims and ephemeris/data licensing.

**Go/no-go:** Paid test purchases, cancellations, restorations, refunds and webhook replay pass in sandbox; finance signs off pricing and provider settlement; production billing activation receives approval.

### Gate D | Mobile platforms

- Select a proper React Native/Expo client using the same versioned calculations, content, API and visual tokens. Do not imply the independent earlier Expo prototype is integrated until it is merged, adapted and tested.
- Design native mobile onboarding, offline reading and navigation; use platform secure storage for tokens, not browser localStorage for secrets.
- Verify timezones, notification consent, account deletion, subscription flows, screen-reader navigation, dynamic font size, keyboard and reduced motion.
- Build Android AAB/APK and iOS IPA in supported CI/macOS; store keys in approved secure signing systems; prepare screenshots, privacy disclosures and support links.
- Complete actual physical-device tests and App Store/Play internal testing; resolve review issues prior to public submission.

**Go/no-go:** Signed distributables verified, real-device tests recorded, store privacy labels accurate, purchase restore confirmed; explicit owner approval for submission and rollout.

### Gate E | Post-launch reliability

- Error/latency dashboards, queue monitoring, incident escalation and encrypted backups.
- 30/60/90-day cohort retention, PDF success rate, report latency, onboarding completion, crash-free sessions and refunds measured from consent-respecting analytics.
- Schedule private access review and controlled penetration testing before paid/native scale.
- Keep an emergency switch for paid report queues and cloud sync without disabling local reading or data export.
- Never promise horoscope accuracy, health insights or medical/scientific certainty.

## 3. Verification matrix

| Surface | Command or test | Required evidence |
| --- | --- | --- |
| Type safety | \`npm run typecheck\` | Zero blocking errors |
| Unit/regression | \`npm test\` | Full suite exit zero and report tests |
| Security tests | \`npm run test:aeon\` | AES/restore/tampering; consent, uncertainty, PDF |
| Release compile | \`npm run build\` | Source-built output, no stale cached assets |
| Lint | \`npm run lint\` | Zero new warnings/errors over accepted baseline |
| Browser usability | Supported mobile + desktop browser smoke | Screenshots, clean console and no clipping |
| Reports | Render every sample PDF page to PNG | Reviewed contact sheets, font and clipping acceptance |
| Identity/isolation | Integration tests against staging DB | Users A/B denied cross-record reads and writes |
| Billing | Signed sandbox provider callbacks | Duplicate, out-of-order, refund and restore evidence |
| Mobile | Android/iOS real device and store internal tests | Signed artifacts, accessibility and billing restore logs |
| Operations | Backup/restore and rollback drill | Restore time, data checksum and owner sign-off |

## 4. Security, privacy and scientific boundaries

Birth charts and journals are private information. The new password-encrypted backup format protects exported files only: **browser localStorage remains readable to the local browser origin**, and encryption does **not** create secure cloud accounts. Never make claims of complete encryption at rest until a designed and audited cloud/local key-management system is implemented.

Each calculated position must have provenance, local civil time handling and a clear confidence/uncertainty explanation. Astrology is an interpretive tradition, not evidence for diagnosing health, guaranteeing relationships or predicting death. No simulated exact transits, invented birth-time angles, fabricated relationship consent or client-set paid tier.

### Active release risks

| Risk | Severity | Required decision/action |
| --- | --- | --- |
| No production identity/database | Critical for Web 1.0 | Select and provision providers securely |
| PDF ASCII transliteration and unreviewed visual pages | Critical for commercial dossiers | Add Unicode font support and page-by-page raster QA |
| No completed app-store builds | Critical for mobile | Set package/bundle IDs and signing accounts |
| GitHub Actions jobs fail before running steps | High | Inspect repository/org Actions policy and runner permissions |
| Platform billing and entitlements absent | Critical for paid launch | Build signed receipt verification and sandbox test matrix |
| Timezone and house/calculation validation | High | Reference fixtures, DST/historical tests and documented tolerances |
| Birth journal in browser localStorage | High for shared devices | User guidance, optional browser PIN/locked vault later, cloud migration design |
| Dependent merge stack | Medium | Merge PR #5 before the launch-hardening PR or rebase in order |

## 5. Required owner decisions

Before Web 1.0: confirm domain, legal entity/support inbox, identity provider, hosting/DB region, data retention period, backup operator, privacy policy owner and incident contact. Before Paid: approve SKUs and refund language, provider accounts, app-store payment positioning. Before Native: approve Android package ID, iOS bundle ID, Developer/Play credentials and release audience. These are controlled release inputs, not assumptions that implementation has finished.

## 6. Rollback and launch operations

1. Keep every beta release tagged to an immutable Git SHA and matched Vercel deployment ID.
2. Use staged preview then approved promotion; do not force-merge draft branches.
3. For faulty web releases, stop rollout and redeploy the last known-good source/deployment. Test this procedure before launch.
4. For migrations, take encrypted backups, apply forward-only staged migrations, define compatibility/restore windows; do not rely on a destructive down migration.
5. For data incidents, isolate the affected service, preserve sanitized audit evidence, rotate compromised keys and execute the legal/incident runbook with the designated owner.

### Evidence record

A commit, a passing unit test, a Vercel READY deployment and a signed app-store publication are **different** states. Update this roadmap only with observations and verifiable links. The current completion status is **partial** until the beta QA gates and associated permissions are satisfied.
