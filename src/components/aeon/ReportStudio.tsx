// @ts-nocheck
import { useMemo, useState } from "react";
import { Astro } from "@/lib/aeon/astro.js";
import { REPORT_STYLES, REPORT_TYPES, createReportPdf } from "@/lib/aeon/report-studio.js";
import { Icon } from "./bits";

function monthlySky(chart, zone) {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  return Array.from({ length: 12 }, (_, i) => {
    const at = new Date(start);
    at.setUTCMonth(at.getUTCMonth() + i);
    at.setUTCDate(15);
    const key = at.toISOString().slice(0, 10);
    let events = [];
    try { events = Astro.daily(chart, key, zone).chosen; } catch { /* Do not fabricate unavailable sky samples. */ }
    return { month: new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "UTC" }).format(at) + " / " + key, events };
  });
}
function WheelPreview({ chart, accent, foreground }) {
  const point = (lon, r = 94) => {
    const a = ((lon - (chart.asc ?? 0)) - 90) * Math.PI / 180;
    return { x: 140 + r * Math.cos(a), y: 140 + r * Math.sin(a) };
  };
  const aspects = Astro.aspects(chart.bodies, chart.bodies, 4, true).slice(0, 12);
  return (
    <svg className="studio-wheel" viewBox="0 0 280 280" role="img" aria-label="Decorative preview showing calculated planetary placements">
      <circle cx="140" cy="140" r="110" fill="none" stroke={accent} strokeOpacity=".64" strokeWidth="1.3"/>
      <circle cx="140" cy="140" r="94" fill="none" stroke={accent} strokeOpacity=".55"/>
      <circle cx="140" cy="140" r="68" fill="none" stroke={accent} strokeOpacity=".37"/>
      {Array.from({ length: 12 }, (_, i) => {
        const a = i * Math.PI / 6;
        return <line key={i} x1={140 + 95 * Math.cos(a)} y1={140 + 95 * Math.sin(a)} x2={140 + 109 * Math.cos(a)} y2={140 + 109 * Math.sin(a)} stroke={accent} strokeOpacity=".7"/>;
      })}
      {aspects.map((aspect, i) => {
        const a = chart.bodies.find((b) => b.body === aspect.left);
        const b = chart.bodies.find((b) => b.body === aspect.right);
        if (!a || !b) return null;
        const p = point(a.lon, 67), q = point(b.lon, 67);
        return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={accent} strokeOpacity=".35" strokeWidth=".8"/>;
      })}
      {chart.bodies.map((body) => {
        const p = point(body.lon);
        return <g key={body.body}><circle cx={p.x} cy={p.y} r={body.body === "Sun" || body.body === "Moon" ? 6 : 3.5} fill={accent} stroke={foreground} strokeWidth=".5"><title>{body.body} in {Astro.SIGNS[body.sign]}</title></circle></g>;
      })}
      <text x="140" y="147" textAnchor="middle" fill={accent} fontFamily="Georgia, serif" fontSize="30">✳</text>
    </svg>
  );
}
export function ReportStudio({ owner, people, houseSystem, zone, onEditProfile, onOpenChart }) {
  const options = useMemo(() => [owner, ...(people || []).filter((p) => p.id !== owner.id)], [owner, people]);
  const [selectedId, setSelectedId] = useState(owner.id);
  const [reportType, setReportType] = useState("blueprint");
  const [styleId, setStyleId] = useState("luxe");
  const [partnerId, setPartnerId] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const profile = options.find((p) => p.id === selectedId) || owner;
  const partners = options.filter((p) => p.id !== profile.id);
  const partner = partners.find((p) => p.id === partnerId) || partners[0] || null;
  const style = REPORT_STYLES.find((s) => s.id === styleId) || REPORT_STYLES[0];
  const kind = REPORT_TYPES.find((t) => t.id === reportType) || REPORT_TYPES[0];
  const chart = useMemo(() => Astro.chart(profile, houseSystem), [profile, houseSystem]);
  const aspects = useMemo(() => Astro.aspects(chart.bodies, chart.bodies, 6, true), [chart]);
  const partnerChart = useMemo(() => partner ? Astro.chart(partner, houseSystem) : null, [partner, houseSystem]);
  const crossAspects = useMemo(() => partnerChart ? Astro.aspects(chart.bodies, partnerChart.bodies, 4) : [], [chart, partnerChart]);
  const months = useMemo(() => reportType === "year" ? monthlySky(chart, zone) : [], [reportType, chart, zone]);
  const estimate = 49 + (reportType === "year" ? 2 : reportType === "synastry" ? 1 : 0);
  const canGenerate = reportType !== "synastry" || (partner && consent);

  function selectKind(id) {
    setReportType(id);
    setError("");
    setDone("");
    setConsent(false);
  }
  function generate() {
    setError("");
    setDone("");
    if (reportType === "synastry" && !canGenerate) {
      setError("Select a second chart and confirm permission before creating a comparison.");
      return;
    }
    try {
      const result = createReportPdf({
        profile, chart, type: reportType, style: styleId, aspects,
        ...(reportType === "year" ? { timeline: months } : {}),
        ...(reportType === "synastry" ? { partner, partnerChart, crossAspects, consent } : {}),
      });
      const data = new Uint8Array(result.bytes.byteLength);
      data.set(result.bytes);
      const url = URL.createObjectURL(new Blob([data.buffer], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setDone(result.pageCount + " illustrated pages prepared for " + profile.name + ". Your PDF contains private birth details.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The report could not be generated. Review the selected chart and try again.");
    }
  }
  return (
    <div className="studio">
      <div className="page-heading">
        <div>
          <div className="eyebrow">AEON / PERSONAL DOSSIERS</div>
          <h1>Your story, among the stars.</h1>
          <p className="intro">An illustrated guide to planets, signs, houses and the patterns connecting them, written in everyday language and grounded in your calculated chart.</p>
        </div>
        <button className="button secondary" type="button" onClick={onOpenChart}><Icon name="chart"/> View natal chart</button>
      </div>
      <div className="studio-shell">
        <div className="studio-controls">
          <div className="studio-section-heading"><span className="eyebrow">01 / WHO IS IT FOR?</span><h2>Choose your sky</h2></div>
          <div className="studio-profile-row">
            <label htmlFor="studio-profile" className="sr-only">Report profile</label>
            <select id="studio-profile" className="select-quiet studio-select" value={profile.id} onChange={(e) => { setSelectedId(e.target.value); setPartnerId(""); setConsent(false); setError(""); setDone(""); }}>
              {options.map((person) => <option key={person.id} value={person.id}>{person.name}{person.sample ? " (sample)" : ""}</option>)}
            </select>
            <button className="text-button" type="button" onClick={onEditProfile}><Icon name="edit"/> {owner.sample ? "Add your birth details" : "Edit my birth details"}</button>
          </div>
          {profile.sample && <p className="studio-help">You are viewing a fictional sample chart. Add your birth details to create a genuinely personal report.</p>}
          {chart.precision !== "exact" && <p className="studio-help">Birth time: {chart.precision}. The PDF identifies uncertain placements and never invents missing houses or a rising sign.</p>}

          <div className="studio-section-heading"><span className="eyebrow">02 / CHOOSE YOUR READING</span><h2>What would you like to explore?</h2></div>
          <div className="studio-type-grid">
            {REPORT_TYPES.map((option, index) => (
              <button key={option.id} type="button" className={"studio-type" + (reportType === option.id ? " selected" : "")} aria-pressed={reportType === option.id} onClick={() => selectKind(option.id)}>
                <span className="studio-type-index">0{index+1} <span aria-hidden="true">{reportType === option.id ? "✦" : "✧"}</span></span>
                <strong>{option.label}</strong>
                <span>{option.intro}</span>
              </button>
            ))}
          </div>
          {reportType === "synastry" && (
            <div className="studio-consent">
              <h3>Choose a second consenting adult</h3>
              {partner ? (
                <>
                  <label htmlFor="studio-partner" className="sr-only">Second profile for comparison</label>
                  <select className="select-quiet studio-select" id="studio-partner" value={partner.id} onChange={(e) => { setPartnerId(e.target.value); setConsent(false); }}>
                    {partners.map((p) => <option key={p.id} value={p.id}>{p.name}{p.sample ? " (sample)" : ""}</option>)}
                  </select>
                  <label className="check-label"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I have permission to use this adult's birth details for this private report.</label>
                </>
              ) : <p className="studio-help">Add a second saved adult chart in Connections before generating synastry.</p>}
            </div>
          )}

          <div className="studio-section-heading"><span className="eyebrow">03 / ART DIRECTION</span><h2>Make it a universe of its own</h2></div>
          <div className="studio-styles" role="group" aria-label="Report design styles">
            {REPORT_STYLES.map((option) => (
              <button type="button" key={option.id} className={"studio-style" + (styleId === option.id ? " selected" : "")} aria-pressed={styleId === option.id} onClick={() => { setStyleId(option.id); setDone(""); }}>
                <span className="studio-style-art" style={{ background: option.colors[0], color: option.colors[1], borderColor: option.colors[1] }}>
                  <span className="studio-style-orbit">{option.symbol}</span>
                  <span className="studio-style-title">aeon</span>
                </span>
                <span className="studio-style-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
        <aside className="studio-preview-area" aria-label="Dossier preview and download">
          <div className="studio-preview-heading"><span className="eyebrow">LIVE DESIGN PREVIEW</span><span className="small muted">{estimate} pages</span></div>
          <div className="studio-preview-cover" style={{ background: style.colors[0], color: style.colors[2] }}>
            <div className="studio-preview-header" style={{ color: style.colors[1] }}>AEON <span>✳</span></div>
            <span className="studio-preview-kicker" style={{ color: style.colors[1] }}>PERSONAL ILLUSTRATED DOSSIER</span>
            <WheelPreview chart={chart} accent={style.colors[1]} foreground={style.colors[0]}/>
            <div className="studio-preview-name">{profile.name}</div>
            <div className="studio-preview-title">{kind.label}</div>
            <p className="studio-preview-caption" style={{ color: style.colors[1] }}>YOUR SKY. YOUR PERSPECTIVE.</p>
          </div>
          <div className="studio-preview-details">
            <div><strong>{estimate}</strong><span>pages, including illustrated placements and houses</span></div>
            <div><strong>10 + 12</strong><span>planet chapters and house explanations</span></div>
            <div><strong>PRIVATE</strong><span>generated on your device, no upload</span></div>
          </div>
          <p className="studio-help">{reportType === "year" ? "The Year Ahead diary samples the sky at local noon on the 15th of each month. It does not calculate every exact transit hit." : "Each reading includes a glossary, actual chart placements, interpretive context, real-life examples and reflection prompts."}</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          {done && <p className="notice neutral" role="status">{done}</p>}
          <button className="button studio-download" type="button" onClick={generate} disabled={!canGenerate}>
            <Icon name="download"/> Create illustrated PDF <span aria-hidden="true">↗</span>
          </button>
          <p className="studio-disclaimer">Astrology is interpretive, not medical or psychological science. AEON readings are reflective, not predictions. PDF export is locally generated and currently free; purchases and cloud report storage are not connected.</p>
        </aside>
      </div>
    </div>
  );
}
