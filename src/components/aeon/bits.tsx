import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Astro } from "@/lib/aeon/astro.js";
import { Store } from "@/lib/aeon/store.js";
import { UI } from "@/lib/aeon/visuals.js";

export function Icon({ name }: { name: string }) {
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: UI.icon(name) }} />;
}

export function Svg({ html }: { html: string }) {
  return <span style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}

export function KindPill({ kind }: { kind: string }) {
  const label = kind === "flow" ? "Flow" : kind === "friction" ? "Friction" : "Focus";
  return <span className={`kind ${kind}`}>{label}</span>;
}

export function uid() {
  return crypto.randomUUID?.() || "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

export function hash(s: string) {
  let n = 2166136261;
  for (let i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
  return (n >>> 0).toString(36);
}

export function download(content: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Modal({
  title,
  eyebrow = "A LITTLE PERSPECTIVE",
  sheet = false,
  onClose,
  children,
}: {
  title: string;
  eyebrow?: string;
  sheet?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const modal = ref.current;
      if (!modal) return;
      const nodes = [...modal.querySelectorAll<HTMLElement>("a[href],button,input,textarea,select,[tabindex='0']")].filter(
        (el) => !el.hasAttribute("disabled") && !el.hidden && !el.closest("[hidden],.hidden"),
      );
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === modal)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (prev?.isConnected) prev.focus();
    };
  }, []);

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section ref={ref} className={`modal${sheet ? " sheet" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}>
        <div className="modal-top">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="modal-close" type="button" aria-label="Close dialog" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

const ZONES = [
  "Australia/Perth",
  "Australia/Eucla",
  "Australia/Darwin",
  "Australia/Adelaide",
  "Australia/Broken_Hill",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Hobart",
  "Australia/Brisbane",
  "Australia/Lord_Howe",
  "Pacific/Auckland",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "UTC",
];

function norm(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function ProfileForm({
  kind,
  existing,
  cities,
  cityStatus,
  onSave,
  onClose,
  closeLabel = "Keep exploring",
}: {
  kind: "owner" | "person";
  existing: any;
  cities: any[];
  cityStatus: "loading" | "ready" | "error";
  onSave: (profile: any) => void;
  onClose: () => void;
  closeLabel?: string;
}) {
  const precision0 = existing?.precision || "unknown";
  const [precision, setPrecision] = useState(precision0);
  const [custom, setCustom] = useState(false);
  const [city, setCity] = useState(existing?.place?.name || "");
  const [matches, setMatches] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(existing?.place ? { ...existing.place } : null);
  const [placeNote, setPlaceNote] = useState(
    existing?.place ? `${existing.place.zone} · ${existing.place.lat.toFixed(3)}°, ${existing.place.lng.toFixed(3)}°` : "",
  );
  const [ambiguous, setAmbiguous] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  function search(value: string) {
    const query = norm(value);
    const tokens = query.split(/[\s,]+/).filter(Boolean);
    if (query.length < 2) {
      setMatches([]);
      return;
    }
    const found = cities
      .filter((c) => tokens.every((t) => (c.searchKey || norm(`${c.name} ${c.ascii || ""} ${c.region || ""} ${c.country}`)).includes(t)))
      .sort((a, b) => Number(norm(b.name).startsWith(query)) - Number(norm(a.name).startsWith(query)) || (b.pop || 0) - (a.pop || 0))
      .slice(0, 24)
      .filter((c) => Astro.validZone(c.zone))
      .slice(0, 8);
    setMatches(found);
  }

  function choose(c: any) {
    const place = {
      name: [c.name, c.region, c.country].filter(Boolean).join(", "),
      lat: c.lat,
      lng: c.lng,
      zone: c.zone,
    };
    setSelected(place);
    setCity(place.name);
    setPlaceNote(`${c.zone} · ${c.lat.toFixed(3)}°, ${c.lng.toFixed(3)}°`);
    setMatches([]);
    setAmbiguous(null);
    const zone = document.getElementById("birth-zone") as HTMLInputElement | null;
    const lat = document.getElementById("birth-lat") as HTMLInputElement | null;
    const lng = document.getElementById("birth-lng") as HTMLInputElement | null;
    if (zone) zone.value = c.zone;
    if (lat) lat.value = String(c.lat);
    if (lng) lng.value = String(c.lng);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    try {
      const data = new FormData(form);
      let place = selected;
      if (custom) {
        const lat = String(data.get("lat") || "");
        const lng = String(data.get("lng") || "");
        if (!lat.trim() || !lng.trim()) throw Error("Enter both latitude and longitude.");
        place = {
          name: String(data.get("city") || "Custom location").trim() || "Custom location",
          lat: Number(lat),
          lng: Number(lng),
          zone: String(data.get("zone") || "").trim(),
        };
      }
      if (!place) throw Error("Choose a city from the results, or enter custom coordinates and timezone.");
      const birthDate = String(data.get("birthDate"));
      const birthTime = precision === "unknown" ? "12:00" : String(data.get("birthTime"));
      const options = Astro.resolveLocal(birthDate, birthTime, place.zone);
      if (options.length > 1 && !form.elements.namedItem("fold")) {
        setAmbiguous(options);
        return;
      }
      if (!form.reportValidity()) return;
      const profile = {
        id: existing?.id || uid(),
        name: String(data.get("name")).trim(),
        birthDate,
        birthTime,
        precision,
        fold: options.length > 1 ? Number(data.get("fold")) : 0,
        place,
        updatedAt: new Date().toISOString(),
      };
      Astro.validateProfile(profile, true);
      Astro.chart(profile, "porphyry");
      onSave(Store.profile(profile));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Check those details and try again.";
      setError(message);
      document.getElementById("profile-error")?.scrollIntoView?.({ block: "nearest" });
    }
  }

  const help =
    cityStatus === "ready"
      ? "Search covers cities of 15,000 people or more. For a smaller place, enter coordinates and a timezone below."
      : cityStatus === "error"
        ? "City search is unavailable. Enter custom coordinates and timezone below."
        : "Loading city search. You can also enter coordinates below.";

  return (
    <>
      <p className="modal-copy" style={{ marginBottom: 22 }}>
        {kind === "owner"
          ? "A date, a place, a moment. Your chart is calculated here on your device."
          : "Save an adult’s chart with their permission. It stays private in this browser."}
      </p>
      <form id="profile-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="profile-name">{kind === "owner" ? "What should we call you?" : "Their name"}</label>
          <input id="profile-name" name="name" required maxLength={60} autoComplete="off" placeholder="A name that feels like you" defaultValue={existing?.name || ""} />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="birth-date">Birth date</label>
            <input id="birth-date" name="birthDate" type="date" min="1900-01-01" max={Astro.dateKey(new Date())} required defaultValue={existing?.birthDate || ""} onChange={() => setAmbiguous(null)} />
          </div>
          <div className="field">
            <label htmlFor="time-precision">How well do you know the time?</label>
            <select
              name="precision"
              id="time-precision"
              value={precision}
              onChange={(event) => {
                setPrecision(event.target.value);
                setAmbiguous(null);
              }}
            >
              <option value="exact">I know the time</option>
              <option value="approximate">Within about an hour</option>
              <option value="unknown">I don’t know</option>
            </select>
          </div>
        </div>
        <div className="field" id="birth-time-field" hidden={precision === "unknown"}>
          <label htmlFor="birth-time">Local birth time</label>
          <input
            id="birth-time"
            name="birthTime"
            type="time"
            defaultValue={existing?.birthTime && existing?.precision !== "unknown" ? existing.birthTime : ""}
            disabled={precision === "unknown"}
            required={precision !== "unknown"}
            onChange={() => setAmbiguous(null)}
          />
          <small>Approximate times use a ±1 hour range. Unknown times leave rising and houses unassigned.</small>
        </div>
        <div className="field">
          <label htmlFor="birth-city">Birthplace</label>
          <input
            id="birth-city"
            name="city"
            autoComplete="off"
            maxLength={150}
            placeholder="Search a city, region or country…"
            value={city}
            role="combobox"
            aria-autocomplete="list"
            aria-controls="city-results"
            aria-expanded={matches.length > 0}
            onChange={(event) => {
              setCity(event.target.value);
              setSelected(null);
              setPlaceNote("Choose a matching city below.");
              search(event.target.value);
              setAmbiguous(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                listRef.current?.querySelector<HTMLButtonElement>("[data-city-index]")?.focus();
              }
            }}
          />
          <div id="city-results" className="city-results" role="listbox" aria-label="Matching cities" ref={listRef}>
            {matches.length
              ? matches.map((c, i) => (
                  <button
                    type="button"
                    className="city-option"
                    data-city-index={i}
                    role="option"
                    aria-selected="false"
                    key={`${c.name}-${c.lat}-${c.lng}-${i}`}
                    onClick={() => choose(c)}
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                      event.preventDefault();
                      const options = [...(listRef.current?.querySelectorAll<HTMLButtonElement>("[data-city-index]") || [])];
                      const index = options.indexOf(event.currentTarget);
                      const step = event.key === "ArrowDown" ? 1 : -1;
                      options[(index + step + options.length) % options.length]?.focus();
                    }}
                  >
                    {c.name}
                    <span>
                      {[c.region, c.country].filter(Boolean).join(", ")} · {c.zone}
                    </span>
                  </button>
                ))
              : city.trim().length >= 2 && (
                  <div className="city-option muted">No city of 15,000 people or more matches. Smaller places are not in this list. Tick custom coordinates and add the latitude, longitude, and timezone.</div>
                )}
          </div>
          <small id="city-help">{help}</small>
          <span className="selected-place">{placeNote}</span>
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            id="custom-location"
            name="custom"
            checked={custom}
            onChange={(event) => {
              setCustom(event.target.checked);
              setAmbiguous(null);
            }}
          />{" "}
          Enter custom coordinates and timezone
        </label>
        <div id="custom-fields" className={custom ? "" : "hidden"}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="birth-lat">Latitude</label>
              <input id="birth-lat" name="lat" type="number" step="any" min={-89.8} max={89.8} defaultValue={existing?.place?.lat ?? ""} placeholder="−31.9523" required={custom} />
            </div>
            <div className="field">
              <label htmlFor="birth-lng">Longitude</label>
              <input id="birth-lng" name="lng" type="number" step="any" min={-180} max={180} defaultValue={existing?.place?.lng ?? ""} placeholder="115.8613" required={custom} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="birth-zone">Birthplace IANA timezone</label>
            <input id="birth-zone" name="zone" defaultValue={existing?.place?.zone || ""} maxLength={100} placeholder="Australia/Perth" required={custom} list="birth-zone-options" onChange={() => setAmbiguous(null)} />
            <datalist id="birth-zone-options">
              {ZONES.map((zone) => (
                <option key={zone} value={zone} />
              ))}
            </datalist>
            <small>Use the timezone of the birthplace, not your current location. East/north coordinates are positive.</small>
          </div>
        </div>
        {ambiguous && (
          <div id="ambiguous-time">
            <div className="notice">The clocks repeated this local time. Choose the recorded offset.</div>
            <div className="field">
              <label htmlFor="fold-offset">Which occurrence?</label>
              <select id="fold-offset" name="fold" required defaultValue="">
                <option value="">Choose an offset</option>
                {ambiguous.map((item, i) => (
                  <option key={item.iso} value={i}>
                    {UI.offset(item.offsetMinutes)} · {i === 0 ? "first" : "second"} occurrence
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <label className="check-label">
          <input type="checkbox" required name="adult" />{" "}
          {kind === "owner"
            ? "I am aged 18 or over."
            : "This person is aged 18 or over, and I have permission to save these details."}
        </label>
        <div id="profile-error" className="form-error" role="alert">
          {error}
        </div>
        <div className="modal-actions">
          <button className="button" type="submit">
            {existing ? "Update chart" : "Create the chart"} <Icon name="arrow" />
          </button>
          <button className="text-button" type="button" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
        <p className="calculation-note">
          City-centre coordinates are estimates. Timezone history before 1970 may be uncertain; custom coordinates do not resolve every historical clock ambiguity.
        </p>
      </form>
    </>
  );
}

export function ZoneField({ zone, onSave }: { zone: string; onSave: (zone: string) => string | null }) {
  const [error, setError] = useState("");
  return (
    <form
      id="timezone-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const next = String(new FormData(form).get("zone") || "").trim();
        const message = onSave(next);
        setError(message || "");
      }}
    >
      <div className="field" style={{ marginTop: 22 }}>
        <label htmlFor="reading-zone">Reading timezone</label>
        <input id="reading-zone" name="zone" defaultValue={zone} maxLength={100} required list="timezone-options" />
        <datalist id="timezone-options">
          {ZONES.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <small>Daily snapshots use noon here. Your birth timezone stays separate.</small>
      </div>
      <div id="timezone-error" className="form-error" role="alert">
        {error}
      </div>
      <button className="button secondary" type="submit">
        Update timezone
      </button>
    </form>
  );
}
