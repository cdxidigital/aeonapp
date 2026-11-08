# AEON Beta 0.9 | Release Verification Playbook

**Release:** Free, local-first responsive web beta. **Owner:** AEON engineering/release reviewer. **Source:** \`PROJECT.md\` and \`project-state.json\`.  
**Policy:** An executable preview is not a verified user journey. Never check a gate without a test result or direct evidence linked to the tested SHA. Use fictional data only in test artifacts.

## 1. Reproducible checks (run on the exact candidate commit)

\`\`\`sh
npm ci
npm run typecheck
npm test
npm run lint
npm run build
npm run qa:pdf
npm run qa:pdf:all
\`\`\`

Capture: timestamp, platform/Node version, commit SHA, command, exit code, relevant logs and link to screenshot/artifact. Failed or blocked tests remain failed/blocked until rerun; a passed Vercel build is not proof of browser interaction or printable report appearance.

## 2. PDF rendering matrix

The \`scripts/qa-aeon-pdf.mjs\` task generates **synthetic fixtures**, never verified natal calculations, in \`.qa/aeon-pdf/\`. The default matrix includes six visual styles, all six reading types, and one unknown-birth-time chart. \`--all\` covers all 36 type/style combinations plus the unknown-time fixture. Every PDF is accompanied by \`manifest.json\`, with \`visuallyReviewed: false\` until independently inspected.

Use a PDF renderer (e.g., \`pdftoppm\` or PDFium) to render **every page** of representative variants into PNGs. Example:

\`\`\`sh
mkdir -p .qa/renders/blueprint-luxe
pdfinfo .qa/aeon-pdf/blueprint-luxe.pdf
pdftoppm -png -r 150 .qa/aeon-pdf/blueprint-luxe.pdf .qa/renders/blueprint-luxe/page
\`\`\`

For each generated PDF, record page count from renderer, malformed PDF errors, footer readability, text collisions, broken glyphs, missing labels, colour contrast, chart/legend accuracy and printable margins. Check the cover, every planet chapter, all twelve houses, continued pages, glossary and provenance. Use a second renderer where output differs.

**Known release issue:** PDF built-in fonts currently transliterate or replace some Unicode characters. Do not sell premium PDFs until the international-font fix and review have passed. QA automation does not certify design quality or chart accuracy.

## 3. Browser and device scenarios

| Scenario | Procedure | Pass criteria |
| --- | --- | --- |
| First visit | New profile in clean browser storage; skip and replay tutorial | Fictional sample clearly identified; no mandatory personal details; progressive steps keyboard usable |
| Return visit | Enter valid profile, close tab/reopen | Birth details, tone/theme and journaling persist on same origin without corrupting entries |
| Unknown birth time | Set time unknown in profile form | Ascendant/houses withheld; uncertainty explained consistently in Chart and report |
| Daily reading | Visit Today, change date/timezone; open chart | Measured positions clearly separated from narrative; no fabricated precision |
| Connections | Add/remove a fictional second adult profile | Synastry requires explicit checkbox; comparison not deterministic compatibility judgement |
| Journal | Add, edit, delete synthetic entry; export | No data loss; cancellation leaves original intact; privacy warning shown |
| Protected backup | Export .aeon using 12+ character passphrase, import in separate clean profile | Data restores exactly; wrong passphrase and tampered data refuse import without overwriting existing data |
| Plain backup | Legacy .json export/import | Data preserved; unencrypted privacy warning clearly visible |
| PDF | Export 6 styles and 6 report types; inspect every page | Correct report/profile; no truncation, missing glyphs, invisible text or clipping |
| Accessibility | Keyboard-only Tab/Shift+Tab/Escape, focus and labels | No traps; correct semantics, visible focus, scalable text and reduced motion |
| Mobile widths | 320, 390, 768, 1440 CSS pixels; dark/light | No horizontal scroll, blocked buttons, overlay collisions or unreadable 8px text |
| Offline/PWA | Install and reload offline after initial load | Offline behaviour matches documented promise; export/restore still available when feasible |
| Privacy | Inspect network activity with private actions and report download | No unintended transmission of journal or birth data; no source map with credentials |

Record actual browser versions/devices, screenshots and failures. A screenshot alone is not a functional test. Do not simulate production authentication, payments or native packages in the beta checklist.

## 4. Release controls

- [ ] Source SHA, deployed preview ID and test evidence all refer to the same revision.
- [ ] Full test/build/lint gate passes on a real runner; investigate Actions jobs that fail with no steps before treating CI as green.
- [ ] Generated PDF pages visually reviewed; international-text behaviour handled or explicitly scoped/blocked.
- [ ] Restore drill completed on a second browser; passphrase recovery warning validated.
- [ ] Responsive, accessible, reduced-motion and keyboard smoke evidence recorded.
- [ ] Privacy, terms, support channel and incident contact approved for beta users.
- [ ] Rollback target and previous known-good deployment recorded; rollback tested.
- [ ] Release owner approves beta promotion and records decision in \`PROJECT.md\`.
- [ ] Handover instructions and first-week defect/usage measurement created.

## 5. Incident and rollback

Disable signups/invitations or stop beta promotion if report generation fails, private data appears in logs, browser backups corrupt data, or unapproved payments are shown. Preserve sanitized evidence, isolate offending release, return to the last verified deployment (do not improvise a database down-migration), and inform the release owner. All open incidents remain tied to a task in \`project-state.json\`.

## 6. Result ledger (fill only from execution)

| SHA / deployment | Check or device | Result | Evidence | Owner/date |
| --- | --- | --- | --- | --- |
| Not yet recorded | PDF raster and visual inspection | Not run | Pending | Engineering |
| Not yet recorded | Mobile responsive and keyboard | Not run | Pending | QA |
| Not yet recorded | Cross-browser encrypted restore | Not run | Pending | QA |
| Main \`a775d9d\` | GitHub Actions quality job | Failed to start steps | Run 41041692581 | Repository owner |

Keep the public launch, payments, database migrations and mobile store submission in **Next/Later** until separately scoped and approved.
