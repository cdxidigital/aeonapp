# AEON × Wisdom Dream · Integration checkpoint

Status: initial knowledge index implementation on feature branch. Not deployed.

## Product decision
Wisdom Dream is an integrated, source-aware AEON knowledge module, not a separate app or login. Existing astrology, journals and reports remain unchanged.

## Evidence boundary
The Wisdom Dream channel ID is `UCQqMHMbq5sgk9IdT3uN5bjg`. A historical Wayback channel wrapper exists, but no complete verified video/transcript corpus is available. Do not seed fictitious teachings. Source records require a URL, verification evidence and retrieval date.

## Now
- [x] Implement pure, verified-record indexing and topic search.
- [x] Add positive and negative unit tests (execution not yet verified).
- [ ] Inspect and integrate a Cosmic Library screen into AEON navigation.
- [ ] Build a server-side, permission-aware ingestion process.
- [ ] Connect cited retrieval to AEON's AI assistant.
- [ ] Run typecheck, unit tests, build and visual regression checks.

## Acceptance
Unverified records are rejected. Searches return only attributed verified records. Empty sources produce empty results, not fabricated teachings. Existing AEON data stays local/private by default.

## Commands
`node --test src/lib/aeon/wisdom-dream.test.mjs`

## Next
Integrate the library into AEON's existing navigation, then add ingestion and citation UX. No user data or credentials are required for the initial index.
