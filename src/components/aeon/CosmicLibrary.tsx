import { useMemo, useState } from "react";
import { buildWisdomIndex, searchWisdom, WISDOM_ARCHIVE_URL } from "@/lib/aeon/wisdom-dream.mjs";

/** Records must be verified by the ingestion pipeline before being passed here. */
export function CosmicLibrary({ sources = [] }: { sources?: unknown[] }) {
  const [query, setQuery] = useState("");
  const index = useMemo(() => buildWisdomIndex(sources), [sources]);
  const results = useMemo(
    () => query.trim() ? searchWisdom(index, query) : index.records,
    [index, query],
  );
  return (
    <section aria-labelledby="cosmic-library-title" style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(16px, 3vw, 36px) 0" }}>
      <p className="eyebrow">AEON · WISDOM DREAM</p>
      <h1 id="cosmic-library-title">Cosmic Library</h1>
      <p className="modal-copy">Explore documented ideas, consciousness and philosophy through source-backed material. Interpretations are invitations to reflect, not established scientific facts.</p>
      <div className="field" style={{ marginTop: 24 }}>
        <label htmlFor="cosmic-library-search">Search verified knowledge</label>
        <input id="cosmic-library-search" type="search" value={query}
          onChange={event => setQuery(event.target.value)} placeholder="Search a topic or teaching"
          autoComplete="off" />
      </div>
      <p className="calculation-note" role="status" aria-live="polite">
        {index.records.length} verified {index.records.length === 1 ? "source" : "sources"} indexed
        {query.trim() ? ` · ${results.length} matching` : ""}.
      </p>
      {index.records.length === 0 ? (
        <div className="context-box" role="status" style={{ marginTop: 24 }}>
          <h2>Knowledge archive awaiting verification</h2>
          <p>No individual Wisdom Dream videos or transcripts have been verified for this library yet. We won't invent teachings or present an archive snapshot as a transcript.</p>
          <p>Once verified sources are indexed, they will appear here automatically.</p>
          <a href={WISDOM_ARCHIVE_URL} target="_blank" rel="noopener noreferrer">View historical channel archive ↗</a>
        </div>
      ) : results.length === 0 ? (
        <p role="status">No verified sources match that search. Try another topic.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
          {results.map(source => (
            <li key={source.id} className="context-box">
              <p className="eyebrow">VERIFIED SOURCE · {source.kind.replaceAll("-", " ")}</p>
              <h2>{source.title}</h2>
              {source.summary ? <p>{source.summary}</p> : null}
              <p className="calculation-note">Retrieved {source.retrievedAt}. {source.evidence}</p>
              <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">Open original source ↗</a>
            </li>
          ))}
        </ul>
      )}
      <p className="calculation-note" style={{ marginTop: 24 }}>Your birth details and private journal are not sent to this library.</p>
    </section>
  );
}
