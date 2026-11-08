/**
 * Generate synthetic AEON PDF samples for release QA.
 *
 * These charts are deliberately fabricated geometry, NOT validated ephemeris
 * calculations. Never use them as personal readings or science fixtures.
 *
 * Usage:
 *   node scripts/qa-aeon-pdf.mjs
 *   node scripts/qa-aeon-pdf.mjs --all
 *   node scripts/qa-aeon-pdf.mjs --out=/tmp/aeon-pdf-qa
 *
 * Inspect every rendered page manually before clearing the PDF visual gate.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { REPORT_STYLES, REPORT_TYPES, createReportPdf } from "../src/lib/aeon/report-studio.js";

const all = process.argv.includes("--all");
const outArg = process.argv.find((arg) => arg.startsWith("--out="));
const outputDirectory = resolve(outArg ? outArg.slice(6) : ".qa/aeon-pdf");
const names = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
const profile = {
  id: "aeon-qa-one",
  name: "Zoë QA Example",
  birthDate: "1991-01-22",
  birthTime: "14:30",
  precision: "exact",
  place: { name: "Perth, Western Australia", lat: -31.95, lng: 115.86, zone: "Australia/Perth" },
};
const partner = {
  ...profile, id: "aeon-qa-two", name: "Taylor QA Example",
  birthDate: "1989-05-10",
  birthTime: "10:00",
};
function mockChart(person, precision = "exact", delta = 0) {
  return {
    profileId: person.id,
    system: "whole",
    precision,
    date: "1991-01-22T06:30:00.000Z",
    engine: "SYNTHETIC QA FIXTURE - not ephemeris-verified",
    asc: precision === "unknown" ? null : 88.3,
    cusps: precision === "unknown" ? null : Array.from({ length: 12 }, (_, i) => (60 + 30 * i) % 360),
    bodies: names.map((body, i) => ({
      body,
      sign: (i + delta) % 12,
      lon: (i * 34 + 12 + delta * 5) % 360,
      house: precision === "unknown" ? null : (i % 12) + 1,
      uncertainty: precision === "unknown" ? 1 : 0,
      signs: [(i + delta) % 12],
      retrograde: false,
    })),
  };
}
const chart = mockChart(profile);
const partnerChart = mockChart(partner, "exact", 2);
const aspects = [{ left: "Sun", right: "Moon", name: "sextile", orb: 1.25, angle: 60, kind: "flow" }];
const crossAspects = [{ left: "Venus", right: "Mars", name: "trine", orb: 2, angle: 120, kind: "flow" }];
const timeline = Array.from({ length: 12 }, (_, i) => ({
  month: new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(2027, i, 15))),
  events: [], // Intentional: never fabricate dated planetary transit events.
}));
const allTypes = REPORT_TYPES.map((x) => x.id);
const allStyles = REPORT_STYLES.map((x) => x.id);
assert.equal(allTypes.length, 6);
assert.equal(allStyles.length, 6);
const cases = all
  ? allStyles.flatMap((style) => allTypes.map((type) => ({ type, style, precision: "exact" })))
  : [
      ...allStyles.map((style) => ({ type: "blueprint", style, precision: "exact" })),
      ...allTypes.filter((type) => type !== "blueprint").map((type) => ({ type, style: "luxe", precision: "exact" })),
    ];
cases.push({ type: "blueprint", style: "mono", precision: "unknown" });
mkdirSync(outputDirectory, { recursive: true });
const manifest = {
  format: "aeon-pdf-qa.v1",
  createdAt: new Date().toISOString(),
  sourceRevision: process.env.GITHUB_SHA || "unversioned-local-source",
  fixture: "SYNTHETIC QA DATA ONLY; not real astronomical positions or personal birth data",
  reportStyles: allStyles,
  reportTypes: allTypes,
  warnings: [
    "Passing binary validation does not prove that the PDF is readable or attractive.",
    "Built-in PDF fonts currently transliterate some Unicode characters, including names.",
    "Do not publish fixture reports or report real chart accuracy from these fake positions.",
    "Each rendered page must be inspected for clipping, legibility, fidelity and missing glyphs.",
  ],
  outputs: [],
};
for (const item of cases) {
  const unknown = item.precision === "unknown";
  const sample = unknown ? { ...profile, id: "aeon-qa-unknown", name: "Unknown Time QA", birthTime: "12:00", precision: "unknown" } : profile;
  const data = {
    profile: sample,
    chart: unknown ? mockChart(sample, "unknown") : chart,
    type: item.type,
    style: item.style,
    aspects,
    ...(item.type === "year" ? { timeline } : {}),
    ...(item.type === "synastry"
      ? { partner, partnerChart, crossAspects, consent: true } // Fictional profiles only.
      : {}),
  };
  const result = createReportPdf(data);
  const bytes = Buffer.from(result.bytes);
  assert.ok(bytes.length > 1000, "Empty PDF output");
  assert.ok(bytes.subarray(0, 8).toString("latin1").startsWith("%PDF-1."), "Not a PDF");
  assert.ok(bytes.toString("latin1").includes("%%EOF"), "Missing PDF EOF");
  assert.ok(result.pageCount >= 50 && result.pageCount < 200, "Unexpected page count");
  const filename = (unknown ? "unknown-time-" : "") + item.type + "-" + item.style + ".pdf";
  writeFileSync(join(outputDirectory, filename), bytes);
  manifest.outputs.push({ filename, type: item.type, style: item.style, precision: item.precision, pages: result.pageCount, bytes: bytes.length, visuallyReviewed: false });
}
writeFileSync(join(outputDirectory, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("AEON PDF QA: wrote " + manifest.outputs.length + " synthetic samples to " + outputDirectory);
console.log("Binary checks passed. Visual approval, real chart precision, accessibility and release gate remain UNVERIFIED.");
