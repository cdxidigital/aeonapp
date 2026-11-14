// Source-aware Wisdom Dream index for AEON.
// No teachings are bundled: records enter the index only after verification.
export const WISDOM_CHANNEL_ID = "UCQqMHMbq5sgk9IdT3uN5bjg";
export const WISDOM_ARCHIVE_URL = "https://web.archive.org/web/20260218004048/https://www.youtube.com/channel/" + WISDOM_CHANNEL_ID;

const allowedKinds = new Set(["youtube-video", "archive-video", "user-transcript", "document"]);
function validUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}
function text(value) { return typeof value === "string" ? value.trim() : ""; }
export function validateWisdomRecord(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "Record must be an object." };
  const id = text(input.id), title = text(input.title), sourceUrl = text(input.sourceUrl);
  if (!id || !title || !validUrl(sourceUrl) || !allowedKinds.has(input.kind))
    return { ok: false, error: "A verified record requires id, title, source URL and supported kind." };
  if (input.verified !== true) return { ok: false, error: "Unverified records cannot enter the knowledge index." };
  if (!text(input.evidence) || !text(input.retrievedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(input.retrievedAt))
    return { ok: false, error: "Evidence and retrieval date are required." };
  if (input.kind === "archive-video" && !text(input.captureTimestamp))
    return { ok: false, error: "Archived video records require a capture timestamp." };
  const summary = text(input.summary);
  const topics = Array.isArray(input.topics) ? [...new Set(input.topics.map(text).filter(Boolean))].slice(0, 30) : [];
  return { ok: true, record: {
    id, title, kind: input.kind, sourceUrl, verified: true,
    evidence: text(input.evidence), retrievedAt: input.retrievedAt,
    captureTimestamp: text(input.captureTimestamp) || null,
    videoId: text(input.videoId) || null,
    transcriptOrigin: text(input.transcriptOrigin) || null,
    summary, topics
  }};
}
export function buildWisdomIndex(inputs = []) {
  if (!Array.isArray(inputs)) throw new TypeError("Knowledge records must be an array.");
  const records = new Map(), rejected = [];
  for (const input of inputs) {
    const result = validateWisdomRecord(input);
    if (!result.ok) { rejected.push({ id: text(input?.id) || null, reason: result.error }); continue; }
    if (records.has(result.record.id)) { rejected.push({ id: result.record.id, reason: "Duplicate source ID." }); continue; }
    records.set(result.record.id, result.record);
  }
  return { records: [...records.values()], rejected };
}
export function searchWisdom(index, query, limit = 10) {
  const needle = text(query).toLocaleLowerCase();
  if (!needle) return [];
  const count = Math.max(0, Math.min(50, Number.isFinite(limit) ? Math.floor(limit) : 10));
  return (index?.records || [])
    .filter(record => record.verified === true)
    .map(record => {
      const title = record.title.toLocaleLowerCase();
      const topics = record.topics.join(" ").toLocaleLowerCase();
      const summary = record.summary.toLocaleLowerCase();
      const score = (title.includes(needle) ? 4 : 0) + (topics.includes(needle) ? 3 : 0) + (summary.includes(needle) ? 1 : 0);
      return { record, score };
    }).filter(result => result.score > 0)
    .sort((a,b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
    .slice(0, count).map(({record}) => record);
}
export function wisdomAnswerContext(records) {
  return records.filter(record => record.verified === true).map(record => ({
    title: record.title, sourceUrl: record.sourceUrl, evidence: record.evidence,
    summary: record.summary, retrievedAt: record.retrievedAt,
    attribution: "Wisdom Dream source; not an AEON factual endorsement"
  }));
}
