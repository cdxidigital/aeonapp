// @ts-nocheck
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Astro } from "@/lib/aeon/astro.js";
import { Content } from "@/lib/aeon/content.js";
import { Store } from "@/lib/aeon/store.js";
import { UI } from "@/lib/aeon/visuals.js";
import { Icon, KindPill, Modal, ProfileForm, Svg, ZoneField, download, hash, uid } from "./bits";
import { ReportStudio } from "./ReportStudio";

const PAGES = ["today", "chart", "connections", "almanac", "readings", "journal"] as const;
type Page = (typeof PAGES)[number];
const MOODS = ["Open", "Grounded", "Restless", "Hopeful", "Reflective"];
const NAV: [Page, string, string][] = [
  ["today", "today", "Today"],
  ["chart", "chart", "Your chart"],
  ["connections", "people", "Connections"],
  ["almanac", "calendar", "Almanac"],
  ["readings", "spark", "Readings"],
  ["journal", "journal", "Journal"],
];

function houseName(house: string) {
  return { porphyry: "Porphyry", whole: "Whole Sign", equal: "Equal" }[house] || house;
}

export function applyTheme(theme: string) {
  const mode =
    theme === "system"
      ? window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme === "dark"
        ? "dark"
        : "light";
  document.documentElement.dataset.theme = mode;
  document.body.dataset.theme = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", mode === "dark" ? "#202722" : "#f5f2eb");
}

function snapshotOf(event: any, state: any, owner: any, day: string) {
  const reading = Content.reading(event, state.prefs.tone);
  const revision = JSON.stringify({
    birthDate: owner.birthDate,
    birthTime: owner.birthTime,
    place: owner.place,
    precision: owner.precision,
    fold: owner.fold || 0,
    house: state.prefs.house,
  });
  return {
    id: "reading-" + hash(revision + day + state.prefs.zone + (event?.id || "reflection") + state.prefs.tone + Astro.VERSION),
    date: day,
    name: owner.name,
    topic: reading.topic,
    title: reading.headline,
    text: reading.text,
    context: reading.context,
    zone: state.prefs.zone,
    engine: Astro.VERSION,
    precision: owner.precision,
    kind: reading.kind,
    chartRevision: revision,
  };
}

export function AeonApp({ initialIso, initialZone }: { initialIso: string; initialZone: string }) {
  const boot = useState(() => {
    const state = Store.defaults();
    const zone = Astro.validZone(initialZone) ? initialZone : "Australia/Perth";
    state.prefs = { ...state.prefs, zone, theme: "light" };
    const day = Astro.dateKey(new Date(initialIso), zone);
    return {
      state,
      warning: null as string | null,
      day,
      page: "today" as Page,
    };
  })[0];
  const [booted, setBooted] = useState(false);

  const [state, setState] = useState<any>(boot.state);
  const [warning, setWarning] = useState<string | null>(boot.warning);
  const [storageOk, setStorageOk] = useState(true);
  const [page, setPage] = useState<Page>(boot.page);
  const [day, setDay] = useState(boot.day);
  const [month, setMonth] = useState(boot.day.slice(0, 7));
  const [personId, setPersonId] = useState<string | null>(null);
  const [journalTab, setJournalTab] = useState<"entries" | "saved">("entries");
  const [editEntry, setEditEntry] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [note, setNote] = useState<{ text: string; date: string; mood: string } | null>(null);
  const [edits, setEdits] = useState<Record<string, { text: string; date: string; mood: string }>>({});
  const [journalError, setJournalError] = useState("");
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<any[]>([]);
  const [cityStatus, setCityStatus] = useState<"loading" | "ready" | "error">("loading");
  const [modal, setModal] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [systemDark, setSystemDark] = useState(false);
  const pending = useRef<null | (() => void)>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const owner = state.profile || Store.sample;
  const natal = useMemo(() => Astro.chart(owner, state.prefs.house), [owner, state.prefs.house]);
  const wheelHtml = useMemo(() => UI.wheel(natal), [natal]);
  const sky = useMemo(() => {
    try {
      return Astro.daily(natal, day, state.prefs.zone);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "This day could not be calculated.", chosen: [], events: [], positions: natal.bodies };
    }
  }, [natal, day, state.prefs.zone]);

  function toast(message: string) {
    setToastMsg(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 4000);
  }

  function commit(next: any, message?: string) {
    const ok = Store.save(localStorage, next);
    setState(next);
    setStorageOk(ok);
    if (!ok) toast("Browser storage is unavailable. Export a backup to keep these changes.");
    else if (message) toast(message);
    return ok;
  }

  function closeModal() {
    pending.current = null;
    setModal(null);
  }

  function navigate(next: Page) {
    closeModal();
    setPage(next);
    if (location.hash.slice(1) !== next) location.hash = next;
    window.scrollTo({ top: 0 });
    document.getElementById("main")?.focus({ preventScroll: true });
  }

  function confirm(title: string, message: string, action: () => void, back: { type: string } | null = null) {
    pending.current = action;
    setModal({ type: "confirm", title, message, back });
  }

  function dismissConfirm() {
    const back = modal?.back ?? null;
    pending.current = null;
    setModal(back);
  }

  useLayoutEffect(() => {
    const loaded = Store.load(localStorage);
    const hashPage = location.hash.slice(1);
    const today = Astro.dateKey(new Date(), loaded.state.prefs.zone);
    applyTheme(loaded.state.prefs.theme);
    setState(loaded.state);
    setWarning(loaded.warning);
    setPage((PAGES as readonly string[]).includes(hashPage) ? (hashPage as Page) : "today");
    setDay(today);
    setMonth(today.slice(0, 7));
    setSystemDark(!!window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    setBooted(true);
  }, []);

  useLayoutEffect(() => {
    if (!booted) return;
    applyTheme(state.prefs.theme);
  }, [state.prefs.theme, systemDark, booted]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const titles: Record<Page, string> = {
      today: "Today",
      chart: "Your chart",
      connections: "Connections",
      almanac: "Almanac",
      readings: "Illustrated Readings",
      journal: "Journal",
    };
    document.title = `${titles[page]} · AEON`;
  }, [page]);

  useEffect(() => {
    const onHash = () => {
      const next = location.hash.slice(1);
      if ((PAGES as readonly string[]).includes(next) && next !== page) {
        pending.current = null;
        setModal(null);
        setPage(next as Page);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/cities.json")
      .then((response) => {
        if (!response.ok) throw Error("City list unavailable");
        return response.json();
      })
      .then((rows) => {
        if (cancelled) return;
        setCities(
          rows.map((city: any) => ({
            ...city,
            searchKey: [city.name, city.ascii || "", city.region || "", city.country].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
          })),
        );
        setCityStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setCityStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function shiftDay(amount: number) {
    try {
      const key = Astro.addDays(day, amount);
      Astro.validateDate(key);
      setDay(key);
    } catch (error) {
      toast(error instanceof Error ? error.message : "That date is outside the almanac.");
    }
  }

  function shiftMonth(amount: number) {
    const [year, mon] = month.split("-").map(Number);
    const date = new Date(Date.UTC(year, mon - 1 + amount, 1));
    if (date.getUTCFullYear() < 1900 || date.getUTCFullYear() > 2100) {
      toast("The almanac covers 1900–2100.");
      return;
    }
    setMonth(date.toISOString().slice(0, 7));
  }

  function goToday() {
    const today = Astro.dateKey(new Date(), state.prefs.zone);
    setDay(today);
  }

  function updatePrefs(partial: any) {
    commit({ ...state, prefs: { ...state.prefs, ...partial } });
  }

  const appearance: "light" | "dark" = state.prefs.theme === "dark" || (state.prefs.theme === "system" && systemDark) ? "dark" : "light";

  function toggleTheme() {
    updatePrefs({ theme: appearance === "dark" ? "light" : "dark" });
  }

  function savedId(id: string) {
    return state.bookmarks.some((bookmark: any) => bookmark.id === id);
  }

  function toggleSave(key: string) {
    const event = key === "main" ? sky.chosen[0] : sky.events.find((item: any) => item.id === key);
    const snap = snapshotOf(event, state, owner, day);
    const exists = state.bookmarks.some((bookmark: any) => bookmark.id === snap.id);
    if (!exists && state.bookmarks.length >= 2000) {
      toast("Export a backup and make room before saving more readings.");
      return;
    }
    const bookmarks = exists ? state.bookmarks.filter((bookmark: any) => bookmark.id !== snap.id) : [...state.bookmarks, snap];
    const ok = commit({ ...state, bookmarks });
    toast(exists ? "Reading removed from Saved." : ok ? "Reading saved exactly as you read it." : "Reading saved for this session. Export a backup to keep it.");
  }

  function reflect(nextPrompt?: string) {
    const reading = Content.reading(sky.chosen?.[0], state.prefs.tone);
    setEditEntry(null);
    setPrompt(nextPrompt || reading.prompt);
    setJournalTab("entries");
    navigate("journal");
    window.setTimeout(() => document.getElementById("journal-text")?.focus(), 40);
  }

  function writeComposer(partial: { text?: string; date?: string; mood?: string }) {
    if (editEntry) {
      const currentEntry = state.entries.find((item: any) => item.id === editEntry);
      if (!currentEntry) return;
      setEdits((prev) => {
        const current = prev[editEntry] || { text: currentEntry.text, date: currentEntry.date, mood: currentEntry.mood || "Open" };
        return { ...prev, [editEntry]: { ...current, ...partial } };
      });
      return;
    }
    setNote((prev) => ({ ...(prev || { text: "", date: day, mood: "Open" }), ...partial }));
  }

  function saveProfile(profile: any, kind: "owner" | "person") {
    if (kind === "owner") {
      const ok = commit({ ...state, profile });
      closeModal();
      toast(ok ? "Your chart is ready." : "Your chart is ready for this session. Export a backup to keep it.");
      return;
    }
    const people = [...state.people];
    const index = people.findIndex((person: any) => person.id === profile.id);
    if (index >= 0) people[index] = profile;
    else people.push(profile);
    const ok = commit({ ...state, people });
    setPersonId(profile.id);
    navigate("connections");
    toast(ok ? "Your chart is ready." : "Your chart is ready for this session. Export a backup to keep it.");
  }

  const people = state.people.length ? state.people : [Store.samplePerson];
  const person = people.find((item: any) => item.id === personId) || people[0];
  const now = booted ? new Date() : new Date(initialIso);
  const todayKey = Astro.dateKey(now, state.prefs.zone);
  const nowMoon = Astro.moon(now);
  const lead = sky.chosen?.[0];
  const leadReading = Content.reading(lead, state.prefs.tone);
  const sunNow = sky.positions?.find((body: any) => body.body === "Sun");

  function dateNav() {
    return (
      <div className="date-nav">
        <button className="circle-button" type="button" aria-label="Previous day" onClick={() => shiftDay(-1)}>
          <Icon name="left" />
        </button>
        <span className="date-text">{UI.dateLabel(day, { day: "numeric", month: "short" })}</span>
        <button className="circle-button" type="button" aria-label="Next day" onClick={() => shiftDay(1)}>
          <Icon name="chevron" />
        </button>
        {day !== todayKey && (
          <button className="today-link" type="button" onClick={goToday}>
            Today
          </button>
        )}
      </div>
    );
  }

  function todayPage() {
    const ritual = leadReading.ritual;
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">YOUR DAILY PERSPECTIVE</div>
            <h1>A little closer to yourself.</h1>
          </div>
          {dateNav()}
        </div>
        <p className="greeting">
          Your day, {owner.name}. {UI.dateLabel(day, { day: "numeric", month: "long" })}.
        </p>
        {sky.error && <div className="notice">{sky.error}</div>}
        <section className="hero" aria-label="Your daily reading">
          <div className="hero-copy">
            <div className="eyebrow">
              A MOMENT OF {leadReading.kind === "flow" ? "POSSIBILITY" : leadReading.kind === "friction" ? "PERSPECTIVE" : "INTENTION"}
            </div>
            <h2>{leadReading.headline}</h2>
            <p className="hero-description">{leadReading.text.split(". ")[0]}.</p>
            <div className="hero-actions">
              <button className="button" type="button" onClick={() => setModal({ type: "reading", id: "main" })}>
                Your daily reading <Icon name="arrow" />
              </button>
              <button className="text-button" type="button" onClick={() => setModal({ type: "reading", id: "main" })}>
                Why this reading? <Icon name="info" />
              </button>
              <button className="text-button" type="button" onClick={() => navigate("readings")}>
                Illustrated reading studio <Icon name="spark" />
              </button>
            </div>
          </div>
          <div className="hero-art">
            {sunNow && <Svg html={UI.celestial(sunNow.lon)} />}
            <span className="orb-caption">SUN IN {sunNow ? Astro.SIGNS[sunNow.sign].toUpperCase() : ""}</span>
          </div>
          <span className="hero-index">
            {day.slice(-2)} / {day.slice(5, 7)}
          </span>
        </section>
        <div className="section-head">
          <h2>Where energy meets intention.</h2>
          <span className="caps">YOUR SKY, IN CONTEXT</span>
        </div>
        <section className="grid-three" aria-label="Your transit insights">
          {sky.chosen?.length ? (
            sky.chosen.map((event: any) => {
              const reading = Content.reading(event, state.prefs.tone);
              const snap = snapshotOf(event, state, owner, day);
              const kept = savedId(snap.id);
              return (
                <article className="insight-card" key={event.id}>
                  <div className="card-top">
                    <span className="topic-glyph" aria-hidden="true">
                      {Astro.SYMBOLS[event.left]}
                    </span>
                    <KindPill kind={reading.kind} />
                  </div>
                  <h3>{reading.topic}</h3>
                  <p>{reading.text}</p>
                  <button className="card-open" type="button" aria-label={`Read ${reading.topic}`} onClick={() => setModal({ type: "reading", id: event.id })} />
                  <div className="card-footer">
                    <span>
                      {event.left} {event.verb} {event.right} · {event.orb.toFixed(1)}° orb
                    </span>
                    <button
                      className={`icon-button${kept ? " saved" : ""}`}
                      type="button"
                      aria-label={`${kept ? "Unsave" : "Save"} ${reading.topic}`}
                      aria-pressed={kept}
                      onClick={() => toggleSave(event.id)}
                    >
                      <Icon name="bookmark" />
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="notice neutral">No close major transits at this snapshot. Your reflection above is a general prompt.</div>
          )}
        </section>
        <section className="lower-grid">
          <div className="rituals">
            <h2 className="mini-heading">Small things. A little more space.</h2>
            <div className="ritual-cols">
              <div>
                <div className="eyebrow">LEAN INTO</div>
                <ul>
                  {ritual.lean.map((item: string) => (
                    <li key={item}>
                      <span>+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="release">
                <div className="eyebrow">LET GO OF</div>
                <ul>
                  {ritual.release.map((item: string) => (
                    <li key={item}>
                      <span>−</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="reflection-invite">
            <div className="eyebrow">A QUESTION TO SIT WITH</div>
            <p>{leadReading.prompt}</p>
            <button className="text-button" type="button" onClick={() => reflect()}>
              Make a little room to reflect <Icon name="arrow" />
            </button>
          </div>
        </section>
        <div className="privacy-line">
          <Icon name="lock" />
          Your chart and reflections stay in this browser. Export a backup in Settings.
        </div>
        <div className="calculation-note">
          {owner.sample ? "Exploring a fictional sample chart. Make it yours above. · " : ""}
          Reading snapshot: {UI.dateLabel(day, { day: "numeric", month: "short", year: "numeric" })}, 12:00 in {state.prefs.zone}. Original interpretations selected from calculated transits.
          {owner.precision !== "exact" ? " Birth-time uncertainty affects these estimates." : ""}
        </div>
      </>
    );
  }

  function chartPage() {
    const balance: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    natal.bodies.forEach((body: any) => {
      if (body.signs.length === 1) balance[Content.signs[body.sign].element] += 1;
    });
    const signText = (body: any) => body.signs.map((index: number) => Astro.SIGNS[index]).join(" / ");
    const aspects = Astro.aspects(natal.bodies, natal.bodies, 6, true).slice(0, 8);
    const cards = [
      ["Sun", "YOUR SUN", signText(natal.bodies[0]), Astro.SYMBOLS.Sun, "Your sense of self"],
      ["Moon", "YOUR MOON", signText(natal.bodies[1]), Astro.SYMBOLS.Moon, "Your inner weather"],
      ["Ascendant", "YOUR RISING", natal.asc == null ? "Time unknown" : Astro.SIGNS[Math.floor(natal.asc / 30)], "↗", "How you meet the world"],
    ];
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">THE SKY THAT STARTED YOUR STORY</div>
            <h1>A map of your beginnings.</h1>
            <p className="intro">A planet is the topic. A sign is the style it uses. A house is the area of life it lands in. You decide what fits.</p>
          </div>
          <button className="text-button" type="button" onClick={() => setModal({ type: "profile", kind: "owner", id: null })}>
            <Icon name="edit" /> Edit details
          </button>
        </div>
        {natal.precision !== "exact" && (
          <div className="notice">
            {natal.precision === "unknown"
              ? "Birth time unknown: placements use local noon as a reference. Possible sign changes are shown. Rising sign and houses are withheld."
              : "Approximate time: the chart uses your entered time with a ±1 hour uncertainty range. Rising and house positions are indicative; sign changes are shown."}
          </div>
        )}
        {natal.precision !== "unknown" && !natal.cusps && (
          <div className="notice">Porphyry houses are unavailable at this latitude. Select Whole Sign or Equal houses, or explore planetary placements alone.</div>
        )}
        <section className="big-three" aria-label="Your sun, moon and rising signs">
          {cards.map(([body, label, value, glyph, sub]) => (
            <button key={body} type="button" onClick={() => setModal({ type: "planet", body })}>
              <span className="big-symbol">{glyph}</span>
              <span>
                <span className="eyebrow">{label}</span>
                <span className="serif">{value}</span>
                <small>{sub}</small>
              </span>
            </button>
          ))}
        </section>
        <div className="chart-grid">
          <section className="chart-panel">
            <div className="controls-row">
              <span className="eyebrow">YOUR NATAL CHART</span>
              <label>
                <span className="sr-only">House system</span>
                <select className="select-quiet" value={state.prefs.house} onChange={(event) => updatePrefs({ house: event.target.value })}>
                  <option value="porphyry">Porphyry</option>
                  <option value="whole">Whole Sign</option>
                  <option value="equal">Equal</option>
                </select>
              </label>
            </div>
            <Svg html={wheelHtml} />
            <div className="chart-meta">
              {UI.dateLabel(owner.birthDate)} · {owner.precision === "unknown" ? "Time unknown" : owner.birthTime}
              {owner.precision === "approximate" ? " (approximate)" : ""}
              <br />
              {owner.place.name} · {UI.offset(natal.offset)}
            </div>
          </section>
          <section className="panel">
            <table className="placements">
              <caption>Your placements</caption>
              <thead>
                <tr>
                  <th scope="col">PLANET</th>
                  <th scope="col">SIGN</th>
                  <th scope="col">POSITION</th>
                  <th scope="col">HOUSE</th>
                </tr>
              </thead>
              <tbody>
                {natal.bodies.map((body: any) => {
                  const position = Astro.positionLabel(body.lon);
                  return (
                    <tr key={body.body}>
                      <td className="planet-name">
                        <button type="button" onClick={() => setModal({ type: "planet", body: body.body })}>
                          <span aria-hidden="true">{Astro.SYMBOLS[body.body]}</span>
                          {body.body}
                          {body.retrograde && (
                            <sup className="retro" title="Retrograde">
                              R
                            </sup>
                          )}
                        </button>
                      </td>
                      <td>{signText(body)}</td>
                      <td>
                        {natal.precision !== "exact" ? "≈ " : ""}
                        {position.degree}
                      </td>
                      <td>{body.house || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="calculation-note">
              Tropical · geocentric · {houseName(state.prefs.house)} houses.
              <br />
              Positions calculated with Astronomy Engine 2.1.19. {natal.precision !== "exact" ? "Approximate positions are marked ≈. " : ""}
              Open a planet for the plain-language reading.
            </p>
          </section>
        </div>
        <div className="section-head">
          <h2>In plain words.</h2>
          <span className="caps">HOW TO READ A PLACEMENT</span>
        </div>
        <section className="plain-reading" aria-label="Your placements in plain words">
          {natal.bodies.map((body: any) => {
            const planet = Content.planets[body.body];
            const house = body.house ? Content.houses[body.house - 1] : null;
            const signNames = body.signs.map((index: number) => Astro.SIGNS[index]).join(" / ");
            return (
              <article key={body.body}>
                <h3>
                  <button type="button" onClick={() => setModal({ type: "planet", body: body.body })}>
                    {Astro.SYMBOLS[body.body]} {body.body} · {signNames}
                    {house ? ` · house ${body.house}` : ""}
                  </button>
                </h3>
                <p>{planet.text}</p>
                <p>
                  {body.signs.map((index: number) => `${Astro.SIGNS[index]} is the style. ${Content.signs[index].text}`).join(" ")}
                </p>
                <p>
                  {house
                    ? `House ${body.house} is ${house.name.toLowerCase()}. ${house.plain} ${house.ask}`
                    : "The house, the area of life, needs a reliable birth time. Until then this is a topic and a style, not a department of your life."}
                </p>
              </article>
            );
          })}
        </section>
        <div className="section-head">
          <h2>The twelve houses.</h2>
          <span className="caps">AREAS OF LIFE, NOT A SCORE</span>
        </div>
        <ol className="house-key">
          {Content.houses.map((house: { name: string; plain: string }, index: number) => (
            <li key={house.name}>
              <strong>
                {index + 1}. {house.name}.
              </strong>{" "}
              {house.plain}
            </li>
          ))}
        </ol>
        <section className="element-row" aria-label="Element counts">
          {Object.entries(balance).map(([element, count]) => (
            <div className="element" key={element}>
              <span className="label">{element}</span>
              <span className="serif">
                {count}
                <small className="small muted"> / 10</small>
              </span>
              <div className="element-bar">
                <span style={{ width: `${count * 10}%` }} />
              </div>
            </div>
          ))}
        </section>
        <p className="calculation-note">Fire starts, earth steadies, air thinks, water feels. This is a count of the ten planets, not a personality score. Uncertain signs are left out.</p>
        <div className="section-head">
          <h2>The conversation within.</h2>
          <span className="caps">CLOSE NATAL ASPECTS</span>
        </div>
        <section className="panel aspect-list">
          {aspects.length ? (
            aspects.map((event: any) => (
              <div className="aspect-row" key={event.id}>
                <div>
                  {Astro.SYMBOLS[event.left]} {event.left} <span>{event.verb}</span> {Astro.SYMBOLS[event.right]} {event.right}
                </div>
                <span>{event.orb.toFixed(2)}° orb</span>
              </div>
            ))
          ) : (
            <p className="small muted">No close major aspects available with these settings.</p>
          )}
        </section>
        <p className="calculation-note">Aspect windows here use a 6° maximum orb. Your daily readings use a narrower 2.5° window. Exact positions and narratives can differ from other astrology apps.</p>
      </>
    );
  }

  function connectionsPage() {
    const theirs = Astro.chart(person, state.prefs.house);
    const compare = Astro.aspects(natal.bodies, theirs.bodies, 4);
    const counts = { flow: 0, focus: 0, friction: 0 };
    compare.forEach((event: any) => {
      counts[event.kind as keyof typeof counts] += 1;
    });
    const chosen: any[] = [];
    for (const kind of ["flow", "focus", "friction"] as const) {
      const event = compare.find((item: any) => item.kind === kind);
      if (event) chosen.push(event);
    }
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">TWO SKIES. A LITTLE UNDERSTANDING.</div>
            <h1>Make room for each other.</h1>
            <p className="intro">Explore the meeting points between two charts, with curiosity instead of a verdict.</p>
          </div>
        </div>
        <div className="notice neutral">
          These are private saved charts, not connected accounts. No one is notified. {person.sample ? "Alex is a fictional sample you can explore." : ""}
        </div>
        <div className="connections-layout">
          <aside className="connections-sidebar">
            <button className="button" type="button" onClick={() => setModal({ type: "profile", kind: "person", id: null })}>
              <Icon name="plus" /> Add a chart
            </button>
            <div className="section-head">
              <span className="eyebrow">CHARTS YOU KEEP</span>
            </div>
            <div className="people-list">
              {people.map((item: any) => (
                <div className={`person-card${person.id === item.id ? " active" : ""}`} key={item.id}>
                  <span className="avatar">{item.name[0]}</span>
                  <div>
                    <span className="serif">{item.name}</span>
                    <div className="small">{item.sample ? "FICTIONAL SAMPLE" : UI.dateLabel(item.birthDate, { day: "numeric", month: "short" })}</div>
                  </div>
                  <button type="button" aria-label={`Compare with ${item.name}`} onClick={() => setPersonId(item.id)} />
                  {!item.sample && (
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`Delete ${item.name}’s chart`}
                      onClick={() =>
                        confirm("Remove this saved chart?", `${item.name}’s birth details will be removed from this browser.`, () => {
                          commit({ ...state, people: state.people.filter((person: any) => person.id !== item.id) });
                          setPersonId(null);
                          toast("Saved chart removed.");
                        })
                      }
                    >
                      <Icon name="close" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="calculation-note">Save another adult’s details with their permission. Comparisons stay on this device.</p>
          </aside>
          <section className="panel">
            <div className="comparison-header">
              <span className="avatar">{owner.name[0]}</span>
              <span className="pair-plus">✳</span>
              <span className="avatar">{person.name[0]}</span>
            </div>
            <div className="comparison-title">
              <h2>
                {owner.name} & {person.name}
              </h2>
              <p className="small muted">Different stories. Space for a conversation.</p>
            </div>
            <div className="comparison-metrics">
              {(
                [
                  ["flow", "Shared ease"],
                  ["focus", "Points of focus"],
                  ["friction", "Different tempos"],
                ] as const
              ).map(([kind, label]) => (
                <div key={kind}>
                  <span className="serif">{counts[kind]}</span>
                  <span className="caps">{label}</span>
                </div>
              ))}
            </div>
            <p className="small muted">Counts of major cross-chart aspects within 4°. These are reflective themes, not a relationship success score.</p>
            {chosen.length ? (
              chosen.map((event) => (
                <article className="pair-detail" key={event.id}>
                  <KindPill kind={event.kind} />
                  <h3>
                    Your {event.left} {event.verb} {person.name}’s {event.right}
                  </h3>
                  <p>
                    {event.kind === "flow"
                      ? "This pairing can be a useful lens for noticing what feels easy between you. Ask what helps each person feel understood, and make room for the answer to change."
                      : event.kind === "focus"
                        ? "This pairing brings two perspectives into the same conversation. Rather than assuming you mean the same thing, compare the details of what matters to each of you."
                        : "Use this pairing as a prompt to talk about different needs or tempos. A clear request and a little flexibility can be more helpful than deciding who is right."}
                  </p>
                  <p className="calculation-note">
                    {event.orb.toFixed(2)}° from exact · {Content.planets[event.left].short} meets {Content.planets[event.right].short.toLowerCase()}.
                  </p>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <p>No close major aspects in this window. A chart cannot replace getting to know someone.</p>
              </div>
            )}
            <div className="modal-actions">
              <button className="button secondary" type="button" onClick={() => void shareComparison()}>
                <Icon name="share" /> Share a reflection
              </button>
              {!person.sample && (
                <button className="text-button" type="button" onClick={() => setModal({ type: "profile", kind: "person", id: person.id })}>
                  <Icon name="edit" /> Edit chart
                </button>
              )}
            </div>
          </section>
        </div>
      </>
    );
  }

  async function shareComparison() {
    const event = Astro.aspects(natal.bodies, Astro.chart(person, state.prefs.house).bodies, 4)[0];
    const text = `${owner.name} & ${person.name} — a little perspective from AEON.\n\n${event ? `Your ${event.left} ${event.verb} ${person.name}’s ${event.right}. ` : ""}What helps each of us feel understood? A chart opens a conversation; we get to write the rest.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "A little perspective · AEON", text });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          toast("Sharing cancelled.");
          return;
        }
      }
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        toast("Reflection copied. Share it when you are ready.");
        return;
      } catch {
        /* fall through */
      }
    }
    download(text, "text/plain", "AEON-shared-reflection.txt");
    toast("Your reflection is ready as a text file.");
  }

  function almanacPage() {
    const [year, mon] = month.split("-").map(Number);
    const start = `${month}-01`;
    const days = new Date(Date.UTC(year, mon, 0)).getUTCDate();
    const offset = (new Date(start + "T12:00:00Z").getUTCDay() + 6) % 7;
    const nextMonth = new Date(Date.UTC(year, mon, 1)).toISOString().slice(0, 10);
    let events: any[] = [];
    try {
      events = Astro.moonEvents(Astro.firstLocal(start, state.prefs.zone), Astro.firstLocal(nextMonth, state.prefs.zone));
    } catch {
      events = [];
    }
    const selected = Astro.resolveLocal(day, "12:00", state.prefs.zone)[0];
    const selectedDate = new Date(selected?.iso || day + "T12:00:00Z");
    const phase = Astro.moon(selectedDate);
    const moonSign = Astro.positions(selectedDate)[1];
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">A WIDER VIEW OF YOUR DAYS</div>
            <h1>Life has its rhythms.</h1>
            <p className="intro">Follow the Moon. Leave some room in the calendar for yourself.</p>
          </div>
        </div>
        <div className="calendar-layout">
          <section className="panel">
            <div className="controls-row">
              <h2>{UI.dateLabel(start, { month: "long", year: "numeric" })}</h2>
              <div className="date-nav">
                <button className="circle-button" type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
                  <Icon name="left" />
                </button>
                <button
                  className="today-link"
                  type="button"
                  onClick={() => {
                    const today = Astro.dateKey(new Date(), state.prefs.zone);
                    setDay(today);
                    setMonth(today.slice(0, 7));
                  }}
                >
                  This month
                </button>
                <button className="circle-button" type="button" aria-label="Next month" onClick={() => shiftMonth(1)}>
                  <Icon name="chevron" />
                </button>
              </div>
            </div>
            <div className="calendar-grid">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                <span className="weekday" key={label}>
                  {label}
                </span>
              ))}
              {Array.from({ length: offset }, (_, index) => (
                <span key={`pad-${index}`} />
              ))}
              {Array.from({ length: days }, (_, index) => {
                const key = `${month}-${String(index + 1).padStart(2, "0")}`;
                let moon = { angle: 0, name: "Moon", illumination: 0 };
                try {
                  const resolved = Astro.resolveLocal(key, "12:00", state.prefs.zone)[0];
                  moon = Astro.moon(new Date(resolved?.iso || key + "T12:00:00Z"));
                } catch {
                  /* keep a quiet fallback if this local noon cannot be resolved */
                }
                const special = events.some((event) => Astro.dateKey(new Date(event.date), state.prefs.zone) === key);
                return (
                  <button
                    key={key}
                    className={`calendar-day${key === todayKey ? " today" : ""}${key === day ? " selected" : ""}`}
                    type="button"
                    aria-label={`${UI.dateLabel(key)}: ${moon.name}, ${Math.round(moon.illumination * 100)} percent illuminated`}
                    aria-pressed={key === day}
                    onClick={() => {
                      Astro.validateDate(key);
                      setDay(key);
                    }}
                  >
                    <span className="day-number">{index + 1}</span>
                    <Svg html={UI.moon(moon.angle, 25)} />
                    {special && <span className="phase-mark" />}
                  </button>
                );
              })}
            </div>
            <p className="calculation-note">Lunar images show local-noon illumination. The small dot marks a major lunar phase. Times use {state.prefs.zone}.</p>
          </section>
          <aside className="calendar-aside">
            <section className="calendar-selection">
              <Svg html={UI.moon(phase.angle, 60)} />
              <div className="eyebrow">{UI.dateLabel(day, { day: "numeric", month: "long" })}</div>
              <h3>{phase.name}</h3>
              <p>
                {Math.round(phase.illumination * 100)}% illuminated
                <br />
                Moon in {Astro.SIGNS[moonSign.sign]} at local noon.
              </p>
              <button className="button secondary" type="button" onClick={() => navigate("today")}>
                Explore this day <Icon name="arrow" />
              </button>
            </section>
            <section>
              <div className="section-head">
                <span className="eyebrow">LUNAR TURNING POINTS</span>
                <button className="icon-button" type="button" aria-label="Export lunar dates to your calendar" onClick={exportCalendar}>
                  <Icon name="download" />
                </button>
              </div>
              {events.map((event) => (
                <div className="phase-event" key={event.date + event.name}>
                  <Svg html={UI.moon(event.angle, 30)} />
                  <div>
                    <strong>{event.name}</strong>
                    <span>
                      {new Intl.DateTimeFormat("en-AU", {
                        timeZone: state.prefs.zone,
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hourCycle: "h23",
                      }).format(new Date(event.date))}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`View ${event.name}`}
                    onClick={() => setDay(Astro.dateKey(new Date(event.date), state.prefs.zone))}
                  >
                    ↗
                  </button>
                </div>
              ))}
            </section>
          </aside>
        </div>
        <div className="guide-invite">
          <div>
            <h3 className="serif">There is no perfect day to begin.</h3>
            <p>Use these rhythms as a reflection prompt, and let your own circumstances lead your decisions.</p>
          </div>
          <button className="button secondary" type="button" onClick={() => reflect()}>
            A moment to reflect <Icon name="arrow" />
          </button>
        </div>
      </>
    );
  }

  function exportCalendar() {
    try {
      const [year, mon] = month.split("-").map(Number);
      const start = Astro.firstLocal(month + "-01", state.prefs.zone);
      const next = new Date(Date.UTC(year, mon, 1)).toISOString().slice(0, 10);
      const end = Astro.firstLocal(next, state.prefs.zone);
      const events = Astro.moonEvents(start, end);
      const stamp = (value: Date | string | number) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z/, "Z");
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//AEON//Lunar Almanac//EN",
        "CALSCALE:GREGORIAN",
        ...events.flatMap((event: any) => [
          "BEGIN:VEVENT",
          `UID:${hash(event.date + event.name)}@aeon.local`,
          `DTSTAMP:${stamp(new Date())}`,
          `DTSTART:${stamp(event.date)}`,
          `DTEND:${stamp(+new Date(event.date) + 1800000)}`,
          `SUMMARY:AEON - ${event.name}`,
          "DESCRIPTION:A calculated lunar phase. A moment for reflection.",
          "END:VEVENT",
        ]),
        "END:VCALENDAR",
      ];
      download(lines.join("\r\n") + "\r\n", "text/calendar", `AEON-lunar-dates-${month}.ics`);
      toast("Lunar dates exported for your calendar.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Those lunar dates could not be exported.");
    }
  }

  function journalPage() {
    const entry = state.entries.find((item: any) => item.id === editEntry);
    const editing = entry ? edits[entry.id] || { text: entry.text, date: entry.date, mood: entry.mood || "Open" } : null;
    const active = editing || note || { text: "", date: day, mood: "Open" };
    const list = [...state.entries]
      .filter((item: any) => `${item.text} ${item.prompt} ${item.mood}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a: any, b: any) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">A SPACE WITHOUT AN AUDIENCE</div>
            <h1>Make a little room.</h1>
            <p className="intro">Save a thought, notice a pattern, or simply put the day down for a moment.</p>
          </div>
        </div>
        <div className="tab-row" role="tablist" aria-label="Journal sections">
          <button type="button" role="tab" aria-selected={journalTab === "entries"} className={journalTab === "entries" ? "active" : ""} onClick={() => setJournalTab("entries")}>
            Your reflections <span className="muted">({state.entries.length})</span>
          </button>
          <button type="button" role="tab" aria-selected={journalTab === "saved"} className={journalTab === "saved" ? "active" : ""} onClick={() => setJournalTab("saved")}>
            Saved readings <span className="muted">({state.bookmarks.length})</span>
          </button>
        </div>
        {journalTab === "saved" ? (
          <section className="grid-three">
            {state.bookmarks.length ? (
              [...state.bookmarks].reverse().map((bookmark: any) => (
                <article className="saved-card" key={bookmark.id}>
                  <div className="entry-meta">
                    <span>
                      {UI.dateLabel(bookmark.date, { day: "numeric", month: "short" })} · {bookmark.name}
                    </span>
                    <button
                      className="icon-button saved"
                      type="button"
                      aria-label={`Unsave ${bookmark.topic}`}
                      onClick={() => {
                        commit({ ...state, bookmarks: state.bookmarks.filter((item: any) => item.id !== bookmark.id) });
                        toast("Reading removed from Saved.");
                      }}
                    >
                      <Icon name="bookmark" />
                    </button>
                  </div>
                  <KindPill kind={bookmark.kind} />
                  <h3>{bookmark.title}</h3>
                  <p>{bookmark.text}</p>
                  <p className="calculation-note">
                    {bookmark.context}
                    <br />
                    Saved as read · {bookmark.zone}
                  </p>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-symbol">♧</div>
                <div className="serif">Keep what stays with you.</div>
                <p>Bookmark a daily insight to keep its original words and chart context here.</p>
                <button className="button secondary" type="button" onClick={() => navigate("today")}>
                  Explore your day
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <div className="journal-layout">
              <section className="panel">
                <div className="eyebrow">{entry ? "RETURN TO A REFLECTION" : "A QUESTION TO SIT WITH"}</div>
                <p className="journal-prompt">{entry?.prompt || prompt || leadReading.prompt}</p>
                <form
                  id="journal-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    setJournalError("");
                    if (!form.reportValidity()) return;
                    try {
                      const data = new FormData(form);
                      const text = String(data.get("text") || "").trim();
                      const date = String(data.get("date"));
                      Astro.validateDate(date);
                      if (!text) throw Error("A word, a sentence, a little honesty. Add something to keep.");
                      if (text.length > 10000) throw Error("Keep this reflection within 10,000 characters.");
                      const old = state.entries.find((item: any) => item.id === editEntry);
                      const nextEntry = {
                        id: old?.id || uid(),
                        date,
                        text,
                        mood: active.mood,
                        prompt: old?.prompt || prompt || leadReading.prompt,
                        updatedAt: new Date().toISOString(),
                      };
                      let entries;
                      if (old) entries = state.entries.map((item: any) => (item.id === old.id ? nextEntry : item));
                      else {
                        if (state.entries.length >= 2000) throw Error("Export a backup and make room before adding more reflections.");
                        entries = [...state.entries, nextEntry];
                      }
                      const ok = commit({ ...state, entries });
                      if (old) {
                        setEditEntry(null);
                        setEdits((prev) => {
                          if (!prev[old.id]) return prev;
                          const next = { ...prev };
                          delete next[old.id];
                          return next;
                        });
                      } else setNote(null);
                      toast(ok ? "A moment, kept." : "Your reflection is here for this session. Export a backup to keep it.");
                    } catch (error) {
                      setJournalError(error instanceof Error ? error.message : "That reflection could not be saved.");
                    }
                  }}
                >
                  <div className="field">
                    <label htmlFor="journal-date">Date</label>
                    <input
                      id="journal-date"
                      name="date"
                      type="date"
                      required
                      min="1900-01-01"
                      max="2100-12-31"
                      value={active.date}
                      onChange={(event) => writeComposer({ date: event.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="journal-text">Whatever is on your mind</label>
                    <textarea
                      id="journal-text"
                      name="text"
                      required
                      maxLength={10000}
                      placeholder="Today, I noticed…"
                      value={active.text}
                      onChange={(event) => writeComposer({ text: event.target.value })}
                    />
                  </div>
                  <span className="field-label">How does this moment feel?</span>
                  <div className="moods" style={{ margin: "10px 0 22px" }}>
                    {MOODS.map((item) => (
                      <button key={item} type="button" className={`mood${active.mood === item ? " selected" : ""}`} aria-pressed={active.mood === item} onClick={() => writeComposer({ mood: item })}>
                        {item}
                      </button>
                    ))}
                  </div>
                  <div id="journal-error" className="form-error" role="alert">
                    {journalError}
                  </div>
                  <div className="modal-actions">
                    <button className="button" type="submit">
                      {entry ? "Update reflection" : "Keep this reflection"} <Icon name="arrow" />
                    </button>
                    {entry && (
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          const id = editEntry;
                          setEditEntry(null);
                          setJournalError("");
                          if (!id) return;
                          setEdits((prev) => {
                            if (!prev[id]) return prev;
                            const next = { ...prev };
                            delete next[id];
                            return next;
                          });
                        }}
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                </form>
                <div className="privacy-line">
                  <Icon name="lock" />
                  Saved on this device. Export a backup to keep a copy.
                </div>
              </section>
              <section>
                <div className="controls-row">
                  <h2 style={{ fontSize: 24 }}>Your moments, kept.</h2>
                  <span className="caps muted">
                    {state.entries.length} REFLECTION{state.entries.length === 1 ? "" : "S"}
                  </span>
                </div>
                <label className="sr-only" htmlFor="entry-search">
                  Search your reflections
                </label>
                <input id="entry-search" className="search-field" type="search" placeholder="Find a word, a feeling, a moment…" maxLength={100} value={query} onChange={(event) => setQuery(event.target.value)} />
                <div id="entries-list">
                  {list.length ? (
                    list.map((item: any) => (
                      <article className="journal-entry" key={item.id}>
                        <div className="entry-meta">
                          <span>{UI.dateLabel(item.date)}</span>
                          <span>{item.mood}</span>
                        </div>
                        {item.prompt ? <p className="entry-prompt">{item.prompt}</p> : null}
                        <p className="entry-text">{item.text}</p>
                        <div className="entry-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setEditEntry(item.id);
                              setJournalError("");
                              window.setTimeout(() => document.getElementById("journal-text")?.focus(), 40);
                            }}
                          >
                            Edit reflection
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              confirm("Let this reflection go?", "This removes the reflection from this browser. Export a backup first if you want a copy.", () => {
                                commit({ ...state, entries: state.entries.filter((entry: any) => entry.id !== item.id) });
                                if (editEntry === item.id) setEditEntry(null);
                                setEdits((prev) => {
                                  if (!prev[item.id]) return prev;
                                  const next = { ...prev };
                                  delete next[item.id];
                                  return next;
                                });
                                toast("Reflection removed.");
                              })
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-symbol">✳</div>
                      <div className="serif">{query ? "A little too specific?" : "Your words belong here."}</div>
                      <p>{query ? "No reflections match that search. Try another word." : "A sentence is enough. Start with whatever is taking up room in your mind."}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
            <div className="guide-invite">
              <div>
                <h3 className="serif">Sometimes a better question helps.</h3>
                <p>Explore a guided reflection using a theme from your chart.</p>
              </div>
              <button className="button secondary" type="button" onClick={() => setModal({ type: "guide" })}>
                Open your chart guide <Icon name="arrow" />
              </button>
            </div>
          </>
        )}
      </>
    );
  }

  function settingsBody() {
    return (
      <>
        <div className="settings-row">
          <div>
            <strong>{owner.name}</strong>
            <small>{owner.sample ? "Fictional sample chart" : `${UI.dateLabel(owner.birthDate)} · ${owner.place.name}`}</small>
          </div>
          <button className="button secondary" type="button" onClick={() => setModal({ type: "profile", kind: "owner", id: null })}>
            {owner.sample ? "Make it yours" : "Edit chart"}
          </button>
        </div>
        <div className="settings-section">
          <h3>Your experience</h3>
          <label className="settings-row">
            <span>
              Reading tone
              <small>Same sky. A different voice.</small>
            </span>
            <select className="select-quiet" value={state.prefs.tone} onChange={(event) => updatePrefs({ tone: event.target.value })}>
              <option value="gentle">Gentle</option>
              <option value="direct">Direct</option>
              <option value="playful">Playful</option>
            </select>
          </label>
          <label className="settings-row">
            <span>Appearance</span>
            <select className="select-quiet" value={state.prefs.theme} onChange={(event) => updatePrefs({ theme: event.target.value })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">Follow device</option>
            </select>
          </label>
          <label className="settings-row">
            <span>
              House system
              <small>Shown with every chart.</small>
            </span>
            <select className="select-quiet" value={state.prefs.house} onChange={(event) => updatePrefs({ house: event.target.value })}>
              <option value="porphyry">Porphyry</option>
              <option value="whole">Whole Sign</option>
              <option value="equal">Equal</option>
            </select>
          </label>
          <ZoneField
            zone={state.prefs.zone}
            onSave={(zone) => {
              if (!Astro.validZone(zone)) return "Choose a valid IANA timezone, such as Australia/Perth.";
              const today = Astro.dateKey(new Date(), zone);
              commit({ ...state, prefs: { ...state.prefs, zone } });
              setDay(today);
              setMonth(today.slice(0, 7));
              toast("Reading timezone updated. Birth timezone unchanged.");
              return null;
            }}
          />
        </div>
        <div className="settings-section">
          <h3>Keep a copy. Keep control.</h3>
          <p className="modal-copy">
            Your birth details, {state.people.length} saved chart{state.people.length === 1 ? "" : "s"}, {state.entries.length} reflection
            {state.entries.length === 1 ? "" : "s"} and {state.bookmarks.length} reading{state.bookmarks.length === 1 ? "" : "s"} are saved in this browser. Export before clearing browser data or moving devices.
          </p>
          <div className="settings-actions" style={{ marginTop: 18 }}>
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                download(Store.backup(state), "application/json", `AEON-backup-${Astro.dateKey(new Date())}.json`);
                toast("Your private backup is ready.");
              }}
            >
              <Icon name="download" /> Export your data
            </button>
            <label className="button secondary import-label" htmlFor="import-data">
              Import a backup
              <input
                type="file"
                id="import-data"
                accept="application/json,.json"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  try {
                    if (file.size > 25 * 1024 * 1024) throw Error("Choose an AEON JSON backup smaller than 25 MB.");
                    const data = Store.normalize(JSON.parse(await file.text()));
                    confirm(
                      "Bring your moments back?",
                      `This backup will replace the AEON data in this browser with ${data.people.length} saved charts, ${data.entries.length} reflections and ${data.bookmarks.length} readings. Export your current data first if you want to keep it.`,
                      () => {
                        const today = Astro.dateKey(new Date(), data.prefs.zone);
                        const ok = commit(data);
                        setEditEntry(null);
                        setPersonId(null);
                        setPrompt(null);
                        setWarning(null);
                        setNote(null);
                        setEdits({});
                        setDay(today);
                        setMonth(today.slice(0, 7));
                        navigate("today");
                        toast(ok ? "Your moments are back." : "Backup opened for this session. Browser storage is unavailable.");
                      },
                      { type: "settings" },
                    );
                  } catch (error) {
                    toast(error instanceof SyntaxError ? "That file is not valid JSON. Choose an AEON backup." : error instanceof Error ? error.message : "That backup could not be read.");
                  }
                }}
              />
            </label>
          </div>
          <p className="calculation-note">Backups contain your private birth details and words. Store them somewhere you trust.</p>
        </div>
        <div className="settings-section">
          <h3>A fresh beginning</h3>
          <p className="modal-copy">Remove all AEON data from this browser. Export a backup first if you want to keep anything.</p>
          <div className="settings-actions" style={{ marginTop: 18 }}>
            <button
              className="button secondary"
              type="button"
              onClick={() =>
                confirm(
                  "A fresh beginning?",
                  "This removes your profile, saved charts, readings, preferences and reflections from this browser. Export first if you want a copy.",
                  () => {
                    try {
                      localStorage.removeItem(Store.KEY);
                    } catch {
                      toast("Browser storage could not be cleared. Remove AEON site data in your browser settings.");
                      return;
                    }
                    const fresh = Store.defaults();
                    setState(fresh);
                    setStorageOk(true);
                    setWarning(null);
                    setEditEntry(null);
                    setPersonId(null);
                    setJournalTab("entries");
                    setPrompt(null);
                    setNote(null);
                    setEdits({});
                    const today = Astro.dateKey(new Date(), fresh.prefs.zone);
                    setDay(today);
                    setMonth(today.slice(0, 7));
                    navigate("today");
                    toast("Your local data has been removed.");
                  },
                  { type: "settings" },
                )
              }
            >
              Delete local data
            </button>
            <button className="text-button" type="button" onClick={() => setModal({ type: "about" })}>
              How AEON works ↗
            </button>
          </div>
        </div>
      </>
    );
  }

  function readingModal(id: string) {
    const event = id === "main" ? lead : sky.events?.find((item: any) => item.id === id);
    const reading = Content.reading(event, state.prefs.tone);
    const snap = snapshotOf(event, state, owner, day);
    const natalBody = event ? natal.bodies.find((body: any) => body.body === event.right) : null;
    const kept = savedId(snap.id);
    return (
      <Modal sheet title={UI.dateLabel(day, { day: "numeric", month: "long" })} eyebrow="YOUR DAILY PERSPECTIVE" onClose={closeModal}>
        <KindPill kind={reading.kind} />
        <h3 className="modal-reading">{reading.headline}</h3>
        <div className="modal-copy">
          <p>{reading.text}</p>
          <p>{reading.prompt}</p>
        </div>
        <div className="context-box">
          <span className="caps">THE SKY BEHIND THE WORDS</span>
          <p>
            <strong>{reading.context}</strong>
            {event && natalBody && (
              <>
                <br />
                {event.orb.toFixed(2)}° from the exact aspect · natal {event.right} in {Astro.SIGNS[natalBody.sign]}.
              </>
            )}
            <br />
            Calculated for 12:00 on {UI.dateLabel(day)} in {state.prefs.zone}.
          </p>
          <p style={{ marginTop: 12 }}>This is a theme for reflection, not a prediction. Flow, Focus and Friction are tones, not events.</p>
          {event && (
            <p style={{ marginTop: 12 }}>
              {Content.planets[event.left].text}
              {natalBody?.house
                ? ` Your natal ${event.right} sits in house ${natalBody.house}, ${Content.houses[natalBody.house - 1].name.toLowerCase()}: ${Content.houses[natalBody.house - 1].plain}`
                : ` Your natal ${event.right}: ${Content.planets[event.right].text}`}
            </p>
          )}
          {owner.precision !== "exact" && <p style={{ marginTop: 12 }}>Your birth time is uncertain. Some positions and aspect selections are estimates; highly time-dependent placements are excluded.</p>}
        </div>
        <div className="modal-actions">
          <button className="button" type="button" onClick={() => toggleSave(event?.id || "main")}>
            <Icon name="bookmark" /> {kept ? "Saved · remove" : "Keep this reading"}
          </button>
          <button className="button secondary" type="button" onClick={() => reflect(reading.prompt)}>
            <Icon name="journal" /> Reflect on it
          </button>
        </div>
        <p className="calculation-note">
          {owner.name}’s chart · {houseName(state.prefs.house)} · {Astro.VERSION}
        </p>
      </Modal>
    );
  }

  function planetModal(body: string) {
    if (body === "Ascendant") {
      const position = natal.asc == null ? null : Astro.positionLabel(natal.asc);
      return (
        <Modal sheet title="How you meet the world." eyebrow="YOUR RISING SIGN" onClose={closeModal}>
          <div className="modal-copy">
            {position ? (
              <>
                <h3>
                  ↗ {Astro.SIGNS[position.sign]} rising
                </h3>
                <p>{Content.signs[position.sign].text}</p>
                <p>The rising sign is the sign on the eastern horizon at your birth. It is a style for how you meet a new situation. It is not a verdict on your face, or on how everyone sees you.</p>
                <div className="context-box">
                  <span className="caps">YOUR CALCULATED ASCENDANT</span>
                  <p>
                    {position.degree} {position.name} · {natal.precision === "approximate" ? "approximate time; this angle is indicative" : "your entered birth time and place"}.
                  </p>
                </div>
              </>
            ) : (
              <p>A rising sign depends on the local birth time and horizon. It is the style of how you meet a new situation. Add a known birth time to calculate it. An unknown time leaves it open.</p>
            )}
          </div>
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={() => setModal({ type: "profile", kind: "owner", id: null })}>
              Review birth details
            </button>
          </div>
        </Modal>
      );
    }
    const placement = natal.bodies.find((item: any) => item.body === body);
    if (!placement) return null;
    const position = Astro.positionLabel(placement.lon);
    const meaning = Content.planets[body];
    return (
      <Modal sheet title={`${Astro.SYMBOLS[body]} ${body} in ${placement.signs.map((index: number) => Astro.SIGNS[index]).join(" / ")}`} eyebrow="YOUR CHART, A LITTLE DEEPER" onClose={closeModal}>
        <div className="modal-copy">
          <p>{meaning.text}</p>
          {placement.signs.map((sign: number) => (
            <div key={sign}>
              <h3>
                {Astro.SIGNS[sign]} · {Content.signs[sign].word}
              </h3>
              <p>{Content.signs[sign].text}</p>
            </div>
          ))}
          {placement.house ? (
            <>
              <h3>
                House {placement.house} · {Content.houses[placement.house - 1].name}
              </h3>
              <p>{Content.houses[placement.house - 1].plain}</p>
              <p>{Content.houses[placement.house - 1].ask}</p>
            </>
          ) : (
            <p>A house is the area of life a planet lands in. This one needs a reliable birth time, so it is left open.</p>
          )}
          <div className="context-box">
            <span className="caps">CALCULATED PLACEMENT</span>
            <p>
              {natal.precision !== "exact" ? "Approximate reference: " : ""}
              {position.degree} {position.name}
              {placement.house ? ` · house ${placement.house}` : ""}
              {placement.retrograde ? " · retrograde" : ""}
              <br />
              {natal.precision === "unknown"
                ? "Local noon reference; rising and houses withheld."
                : natal.precision === "approximate"
                  ? "Based on the entered time with a ±1 hour uncertainty range."
                  : "Based on your entered birth time and location."}
              {placement.signs.length > 1 ? <><br />The sign changes within the birth-time uncertainty interval.</> : null}
            </p>
          </div>
          <p>Keep what is useful. Leave the rest. None of this is a prediction.</p>
        </div>
      </Modal>
    );
  }

  const profileExisting = modal?.type === "profile" ? (modal.kind === "owner" ? state.profile : state.people.find((item: any) => item.id === modal.id) || null) : null;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <a className="brand" href="#today" aria-label="AEON home" onClick={(event) => { event.preventDefault(); navigate("today"); }}>
          <span className="wordmark">
            aeon<span>✳</span>
          </span>
          <span className="tagline">A LITTLE PERSPECTIVE.</span>
        </a>
        <nav className="nav-list" aria-label="Main navigation">
          {NAV.map(([id, icon, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-item${page === id ? " active" : ""}`}
              aria-current={page === id ? "page" : undefined}
              aria-label={label}
              onClick={(event) => {
                event.preventDefault();
                navigate(id);
              }}
            >
              <Icon name={icon} />
              <span className="nav-label">{label}</span>
              {page === id && <span className="nav-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-moon">
            <Svg html={UI.moon(nowMoon.angle, 34)} />
            <div>
              <strong>{nowMoon.name}</strong>
              <span>{Math.round(nowMoon.illumination * 100)}% illuminated · now</span>
            </div>
          </div>
          <button className="side-settings" type="button" aria-label="Settings" onClick={() => setModal({ type: "settings" })}>
            <Icon name="settings" />
            <span>Settings & your data</span>
          </button>
          <div className="sidebar-foot">
            YOUR SKY. YOUR PERSPECTIVE.
            <span className="credit">Developed by fourtee2apps</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <a className="mobile-brand" href="#today" aria-label="AEON home" onClick={(event) => { event.preventDefault(); navigate("today"); }}>
            <span className="wordmark">
              aeon<span>✳</span>
            </span>
          </a>
          <div className="topbar-date">
            <strong>{UI.dateLabel(todayKey, { weekday: "long", day: "numeric", month: "long" })}</strong>
            <span>A moment for you, in the middle of it all.</span>
          </div>
          <div className="topbar-right">
            {!state.profile ? (
              <button className="sample-chip" type="button" onClick={() => setModal({ type: "profile", kind: "owner", id: null })}>
                Sample chart · Make it yours
              </button>
            ) : (
              <span className="sample-chip">On your device</span>
            )}
            <button
              className="theme-toggle"
              type="button"
              aria-pressed={appearance === "dark"}
              aria-label={appearance === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggleTheme}
            >
              <Icon name={appearance === "dark" ? "today" : "night"} />
            </button>
            <button className="profile-button" type="button" aria-label="Profile and settings" onClick={() => setModal({ type: "settings" })}>
              <span className="avatar">{owner.name[0].toUpperCase()}</span>
              <span>{owner.name}</span>
              <span className="profile-chevron">⌄</span>
            </button>
          </div>
        </header>
        <main id="main" className="main-content" tabIndex={-1}>
          {warning && (
            <div className="notice" role="status">
              {warning}
            </div>
          )}
          {!storageOk && <div className="notice">Changes are in memory only. Open Settings and export a backup before leaving.</div>}
          {(page === "today" || page === "chart") && (
            <div id="today" className={`route-page${page === "today" ? " active" : ""}`}>
              {todayPage()}
            </div>
          )}
          {(page === "today" || page === "chart") && (
            <div id="chart" className={`route-page${page === "chart" ? " active" : ""}`}>
              {chartPage()}
            </div>
          )}
          {page === "connections" && connectionsPage()}
          {page === "almanac" && almanacPage()}
          {page === "readings" && (
            <ReportStudio
              owner={owner}
              people={state.people}
              houseSystem={state.prefs.house}
              zone={state.prefs.zone}
              onEditProfile={() => setModal({ type: "profile", kind: "owner", id: null })}
              onOpenChart={() => navigate("chart")}
            />
          )}
          {page === "journal" && journalPage()}
        </main>
        <footer className="site-footer">
          <span>Developed by fourtee2apps. Astrology as reflection. Your choices remain yours.</span>
          <button type="button" onClick={() => setModal({ type: "about" })}>
            The thinking behind AEON ↗
          </button>
        </footer>
      </div>
      <div id="toast" className={`toast${toastMsg ? " show" : ""}`} role="status" aria-live="polite">
        {toastMsg}
      </div>
      {modal?.type === "reading" && readingModal(modal.id)}
      {modal?.type === "planet" && planetModal(modal.body)}
      {modal?.type === "about" && (
        <Modal sheet title="Your sky. Your perspective." eyebrow="THE THINKING BEHIND AEON" onClose={closeModal}>
          <div className="modal-copy">
            <p>AEON is developed by fourtee2apps. It is an astrology and reflection app: calculated planetary positions, plain-language explanations, and a private place for your own thoughts.</p>
            <h3>Positions are calculated. Meaning is explored.</h3>
            <p>The Sun, Moon and planets use Astronomy Engine 2.1.19, with tropical, geocentric coordinates. House options are Porphyry, Whole Sign and Equal. Daily readings use major transits within 2.5° at local noon; your chart uses wider 6° natal aspects.</p>
            <p>Interpretations come from an original editorial library selected by those chart facts. The chart guide uses the same library. This version processes your question on this device.</p>
            <h3>A little honesty about uncertainty.</h3>
            <p>A missing birth time leaves houses and rising unassigned. An approximate time uses a ±1 hour range. Historical timezone rules come from your browser and may be less reliable before 1970. City coordinates are city-centre estimates; you can enter custom coordinates and a timezone.</p>
            <h3>A space that stays yours.</h3>
            <p>Birth details, saved comparisons and journal content are processed and stored in your browser. Export a backup before clearing browser data or moving devices. Sharing a reflection happens only when you choose it.</p>
            <p>This release includes local profiles, a guided chart reflection tool and locally generated illustrated PDF dossiers. Cloud accounts, connected friends, cloud report storage and payments are not connected.</p>
            <h3>Made with open tools.</h3>
            <p>
              Astronomy Engine by Don Cross (MIT). City search uses a local GeoNames cities15000 data snapshot (Creative Commons Attribution 4.0).{" "}
              <a href="https://www.geonames.org/" target="_blank" rel="noopener">
                GeoNames
              </a>{" "}
              data is provided as-is; city coordinates are estimates. See the{" "}
              <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener">
                Astronomy Engine licence
              </a>
              .
            </p>
            <p>AEON is for adults 18+. Astrology is presented for reflection and entertainment. Your decisions remain yours.</p>
          </div>
        </Modal>
      )}
      {modal?.type === "settings" && (
        <Modal sheet title="A space that feels like you." eyebrow="SETTINGS & YOUR DATA" onClose={closeModal}>
          {settingsBody()}
        </Modal>
      )}
      {modal?.type === "profile" && (
        <Modal
          sheet
          title={modal.kind === "owner" ? "Begin with your beginnings." : profileExisting ? "A little more detail." : "Another sky to understand."}
          eyebrow={modal.kind === "owner" ? "YOUR BIRTH CHART" : "A PRIVATE SAVED CHART"}
          onClose={closeModal}
        >
          <ProfileForm
            key={`${modal.kind}-${profileExisting?.id || "new"}`}
            kind={modal.kind}
            existing={profileExisting}
            cities={cities}
            cityStatus={cityStatus}
            onClose={closeModal}
            onSave={(profile) => saveProfile(profile, modal.kind)}
          />
        </Modal>
      )}
      {modal?.type === "confirm" && (
        <Modal title={modal.title} eyebrow="YOUR CHOICE" onClose={dismissConfirm}>
          <p className="modal-copy">{modal.message}</p>
          <div className="modal-actions">
            <button
              className="button danger"
              type="button"
              onClick={() => {
                const action = pending.current;
                pending.current = null;
                setModal(null);
                action?.();
              }}
            >
              Confirm
            </button>
            <button className="button secondary" type="button" onClick={dismissConfirm}>
              Keep things as they are
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "guide" && (
        <Modal sheet title="Bring a little curiosity." eyebrow="YOUR CHART GUIDE" onClose={closeModal}>
          <p className="modal-copy">Choose a lens for something on your mind. Your chart supplies the context; an original editorial library offers a reflection.</p>
          <form
            id="guide-form"
            style={{ marginTop: 24 }}
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              if (!form.reportValidity()) return;
              const data = new FormData(form);
              const question = String(data.get("question") || "").trim();
              if (!question) {
                toast("Give your question a few words.");
                return;
              }
              const result = Content.guide(String(data.get("topic")), question, natal, sky.error ? { events: [], chosen: [] } : sky);
              setModal({ type: "guide-result", question, result });
            }}
          >
            <div className="field">
              <label htmlFor="guide-topic">Where would you like to look?</label>
              <select id="guide-topic" name="topic">
                <option value="self">Self & feelings</option>
                <option value="connection">Love & connection</option>
                <option value="work">Work & direction</option>
                <option value="change">Change & beginnings</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="guide-question">What is on your mind?</label>
              <textarea id="guide-question" name="question" maxLength={500} required placeholder="How can I make more room for what matters?" style={{ minHeight: 110 }} />
            </div>
            <p className="calculation-note">This guide runs on your device and uses fixed editorial prompts selected by topic and chart facts.</p>
            <div className="modal-actions">
              <button className="button" type="submit">
                Find a little perspective <Icon name="arrow" />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal?.type === "guide-result" && (
        <Modal sheet title="A lens, not a verdict." eyebrow="YOUR GUIDED REFLECTION" onClose={closeModal}>
          <p className="eyebrow">YOU ASKED</p>
          <p className="guide-question">{modal.question}</p>
          <div className="modal-copy">
            <p>{modal.result.text}</p>
          </div>
          <div className="context-box">
            <span className="caps">FROM YOUR CHART</span>
            <p>
              {modal.result.placement.body} in {Astro.SIGNS[modal.result.placement.sign]} · {Astro.positionLabel(modal.result.placement.lon).degree}
              {modal.result.event ? (
                <>
                  <br />
                  {modal.result.event.left} {modal.result.event.verb} your {modal.result.event.right} at the selected daily snapshot.
                </>
              ) : null}
            </p>
          </div>
          <p className="journal-prompt">{modal.result.prompt}</p>
          <div className="modal-actions">
            <button className="button" type="button" onClick={() => reflect(modal.result.prompt)}>
              Put it into words <Icon name="arrow" />
            </button>
            <button className="text-button" type="button" onClick={() => setModal({ type: "guide" })}>
              Explore another lens
            </button>
          </div>
          <p className="calculation-note">Selected from AEON’s original editorial library. Your question stays in this session unless you choose to write a reflection.</p>
        </Modal>
      )}
    </>
  );
}
