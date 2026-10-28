// @ts-nocheck
// AEON local-first illustrated dossier renderer. No third-party PDF service and no network calls.
// Interpretation is an educational tradition, not an astronomical claim about a person's future.
import { Content } from "./content.js";

export const REPORT_TYPES = [
  { id: "blueprint", label: "Cosmic Blueprint", intro: "A complete, plain-English tour of your natal chart.", focus: "identity" },
  { id: "love", label: "Love & Relationships", intro: "Connection, boundaries, affection and mutual understanding.", focus: "relationships" },
  { id: "wellbeing", label: "Wellbeing", intro: "Gentle reflection on routines, emotions and self-care. Never medical advice.", focus: "wellbeing" },
  { id: "life", label: "Life Path", intro: "Work, learning, creativity and personally chosen direction.", focus: "direction" },
  { id: "year", label: "Year Ahead", intro: "A dated transit diary with possibilities, not predictions.", focus: "timing" },
  { id: "synastry", label: "Synastry", intro: "Two charts in dialogue, with consent and without compatibility verdicts.", focus: "connection" },
];

export const REPORT_STYLES = [
  { id: "luxe", label: "Celestial Luxe", colors: ["#121a30", "#e4c78a", "#f7f0e2"], symbol: "✦" },
  { id: "insight", label: "Modern Insight", colors: ["#f2eee9", "#bb715f", "#342b32"], symbol: "◌" },
  { id: "sacred", label: "Sacred Geometry", colors: ["#112e2c", "#d5bd82", "#f1eee0"], symbol: "◇" },
  { id: "codex", label: "Ancient Codex", colors: ["#ede0c1", "#9a593b", "#432f25"], symbol: "✳" },
  { id: "data", label: "Data Cosmos", colors: ["#101a31", "#78d6e5", "#f0f5fb"], symbol: "◉" },
  { id: "mono", label: "Minimal Monochrome", colors: ["#f8f7f4", "#343434", "#1e1e1e"], symbol: "○" },
];

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const ELEMENTS = ["Fire", "Earth", "Air", "Water"];
const MODES = ["Cardinal", "Fixed", "Mutable"];
const PLANET_SCENES = {
  Sun: ["Taking the lead in a project without needing to be the whole project", "How could you express yourself while making space for others?"],
  Moon: ["Noticing what helps you unwind after a hard conversation", "Which ordinary comfort can you offer yourself this week?"],
  Mercury: ["Choosing your words before a sensitive conversation", "What do you know, and what would you like to ask?"],
  Venus: ["Talking openly about appreciation, pleasure and boundaries", "What kind of care feels mutual to you?"],
  Mars: ["Starting a difficult task with a smaller, deliberate action", "Where is decisive energy helpful, and where is patience kinder?"],
  Jupiter: ["Trying a class or perspective that stretches your current thinking", "What is worth learning without promising immediate success?"],
  Saturn: ["Building a routine that your real schedule can sustain", "What limit could protect something that matters?"],
  Uranus: ["Questioning a default while keeping what already works", "Which experiment could you try without overturning everything?"],
  Neptune: ["Making art from a feeling without assuming the feeling is a fact", "Where might imagination help, and where do you need evidence?"],
  Pluto: ["Naming a pattern you would like to approach differently", "What part of a difficult change is within your own control?"],
};
const DOMAIN_GUIDES = {
  blueprint: [
    ["Identity & belonging", "The Sun and Moon describe two different traditional themes: expression and emotional needs. Neither is a verdict about who you are.", "Where can being visible and feeling safe coexist?"],
    ["Relationships & agreements", "Venus offers a language for affection; Mars for initiative; the seventh house traditionally relates to one-to-one agreements.", "Which relationship expectations deserve a clear conversation?"],
    ["Work & creativity", "Saturn can frame questions about effort and structure; the tenth house points symbolically toward public roles and the fifth toward playful creation.", "What would useful progress look like by your own standards?"],
    ["Growth & reflection", "Jupiter is a traditional growth symbol and the twelfth house invites quiet perspective. Reflection can involve both ambition and rest.", "What are you practising, rather than trying to prove?"],
  ],
  love: [
    ["Affection & attraction", "Venus names the symbolic style of attraction and appreciation; the Moon names emotional comfort. Neither determines who you will love.", "What small gesture actually makes you feel understood?"],
    ["Boundaries & reciprocity", "Mars can offer a lens on directness; the seventh house on mutual agreements. Clear consent and honest communication always matter more than any chart.", "Which boundary could be expressed with kindness?"],
    ["Conflict & repair", "An aspect represents a measured angle between bodies, not a guarantee of harmony or conflict. You can choose to ask instead of assuming.", "How do you prefer to revisit a difficult conversation?"],
    ["Connection in everyday life", "Relationships unfold through behaviour, context, effort and care. Astrology can supply metaphors for a conversation, not a decision about another person.", "Where could curiosity replace a fixed label?"],
  ],
  wellbeing: [
    ["Rest & emotional weather", "The Moon has traditionally symbolised comfort, rhythms and fluctuating moods. It does not diagnose mental or physical health.", "Which simple action usually helps you feel more settled?"],
    ["Routines that fit", "The sixth house describes routines and everyday care in traditional astrology. Your habits should be shaped by your real health needs and professional guidance.", "What is one sustainable, pleasant routine to try?"],
    ["Support & boundaries", "Saturn invites reflection on limits; Venus on receiving care. You are allowed to ask for support without giving an astrological reason.", "Where would a realistic boundary make daily life easier?"],
    ["Grounding & meaning", "Use astrological symbolism as a journaling prompt, not as treatment, diagnosis or health forecasting. Seek qualified care for medical questions.", "What information or support would be more useful than a prediction?"],
  ],
  life: [
    ["Work & contribution", "The tenth house concerns public roles; Saturn concerns durable skill. Neither specifies your career, income or life purpose.", "Which work feels useful rather than merely impressive?"],
    ["Learning & exploration", "Mercury frames everyday learning, Jupiter broader horizons and the ninth house meaning and study.", "What subject would you explore if you could start small?"],
    ["Creativity & confidence", "The fifth house points toward play and making, while the Sun frames authentic expression as a symbolic theme.", "Which creative idea deserves a low-stakes experiment?"],
    ["Values & direction", "The second house describes resources and values; the eleventh community and shared hopes. Life direction can change without becoming a failure.", "What matters enough to shape a practical next step?"],
  ],
  year: [
    ["Seasons of attention", "Transits measure the changing positions of planets relative to a natal chart. Exact positions are calculable, but outcomes are not predetermined.", "Which theme is helpful to reflect on as the year changes?"],
    ["A practical annual rhythm", "Use your transit diary to notice priorities, commitments and moods, without treating an aspect as a command.", "What would a flexible plan leave room for?"],
    ["Connection through the year", "A Venus or Mercury transit may be interpreted as a metaphor for care or conversation, not proof about another person's feelings.", "What conversation are you free to initiate?"],
    ["Progress and rest", "Let dated sky events be calendar prompts, not deadlines imposed by the universe.", "What deserves regular review, regardless of the sky?"],
  ],
  synastry: [
    ["Two distinct people", "Two birth charts can be compared mathematically. That does not measure love, compatibility or the worth of either person.", "What have you learned through conversation rather than assumption?"],
    ["Communication & attention", "Mercury and the Moon are traditional lenses for expression and emotional needs; differences need not be defects.", "How can each person ask for what they need?"],
    ["Attraction & freedom", "Venus and Mars symbolise affection and initiative. Real intimacy depends on consent, behaviour and shared choice.", "Which preferences should remain individual, and which can be shared?"],
    ["What a comparison cannot know", "Neither a composite nor a synastry chart verifies motives, predicts fidelity or overrides a person's boundaries.", "Where could a factual check be more useful than an interpretation?"],
  ],
};

function section(kicker, title, subtitle, blocks, art = "orbit", payload = null) {
  return { kicker, title, subtitle, blocks, art, payload };
}
function block(label, text) { return { label, text: String(text || "") }; }
function placement(b, precision) {
  const base = SIGNS[b.sign] + " at " + (Number(b.lon % 30 + 30) % 30).toFixed(1) + " degrees";
  return base + (b.house == null ? ", house not assigned" : ", house " + b.house) +
    (b.signs && b.signs.length > 1 ? ". The sign could change within the birth-time uncertainty window." : "") +
    (precision === "unknown" ? " (reference position at local noon)" : precision === "approximate" ? " (approximate birth time)" : "");
}
function aspectSummary(a) {
  return a.left + " " + a.name + " " + a.right + " (orb " + Number(a.orb || 0).toFixed(2) + " degrees)";
}
function signDescription(b) { return Content.signs[b.sign]?.text || "The sign adds a traditional style to the planet's symbolic topic."; }
function planetPages(body, chart) {
  const name = body.body, def = Content.planets[name] || {}, house = body.house == null ? null : Content.houses[body.house - 1];
  const loc = placement(body, chart.precision);
  const example = PLANET_SCENES[name] || PLANET_SCENES.Sun;
  return [
    section("THE PLANETS / " + name.toUpperCase(), name + " in " + SIGNS[body.sign],
      "What this planet represents, and how its sign changes the story.", [
        block("THE CALCULATED PLACEMENT", name + " was calculated at " + loc + ". The longitude is a calculation; the meaning below belongs to the tradition of astrology."),
        block("WHAT " + name.toUpperCase() + " SYMBOLISES", def.text || "This planet is one interpretive theme, not a measurement of personality."),
        block("WHAT THE SIGN ADDS", signDescription(body)),
        block("THE LIFE AREA", house ? "Traditionally, house " + body.house + " is " + house.name.toLowerCase() + ". " + house.plain : "No house can responsibly be assigned with the supplied time or house system. This does not prevent reflection on the planet and sign."),
      ], "planet", { body }),
    section("THE PLANETS / " + name.toUpperCase(), name + " in ordinary life",
      "A reflective synthesis, not a personality verdict.", [
        block("PUTTING THE PIECES TOGETHER", name + " traditionally speaks to " + (def.short || "one of life's themes").toLowerCase() + ". In " + SIGNS[body.sign] + ", that topic may invite the approach described by the sign. " + (house ? "In house " + body.house + ", the setting is " + house.name.toLowerCase() + "." : "The life-area placement is unknown, so no particular house is implied.")),
        block("A REAL-WORLD EXAMPLE", "You might explore this theme through " + example[0].charAt(0).toLowerCase() + example[0].slice(1) + ". Whether it fits depends on your actual experience, not the chart."),
        block("A POSSIBLE STRENGTH", "The useful side of this symbolism is the permission to practise " + (Content.signs[body.sign]?.word || "curiosity").toLowerCase() + " in your own way. Treat this as a possibility you can test."),
        block("A POSSIBLE BLIND SPOT", "Any familiar style can become too automatic. Notice whether the interpretation helps you see a choice or pressures you into a fixed identity."),
        block("A QUESTION TO KEEP", example[1]),
      ], "reflection", { body }),
  ];
}
function housePage(i, chart) {
  const h = Content.houses[i], placed = chart.bodies.filter((b) => b.house === i + 1);
  const known = Array.isArray(chart.cusps);
  return section("THE TWELVE HOUSES / " + String(i + 1).padStart(2, "0"), "House " + (i + 1) + ": " + h.name,
    "The houses describe areas of life, not good or bad outcomes.", [
      block("WHAT THIS HOUSE MEANS", h.plain + " A house is the life area. A planet is the topic within that area, and its sign describes the traditional style."),
      block("YOUR CALCULATED CHART", !known ? "House placement is unavailable because your birth time is uncertain or the chosen house system is not calculable. No planet is assigned here." :
        placed.length ? "Calculated planets in this house: " + placed.map((p) => p.body + " in " + SIGNS[p.sign]).join(", ") + ". This means these planetary themes are often discussed in the language of this life area." :
        "No calculated planets occupy this house. An empty house never means an absent, broken or unimportant life area."),
      block("AN EVERYDAY EXAMPLE", "In ordinary life, this theme might appear as a choice about " + h.name.toLowerCase() + ". It can be meaningful whether or not a planet occupies the house."),
      block("A QUESTION TO REFLECT ON", h.ask),
      block("TAKE WHAT WORKS", "Use the question to notice your own circumstances and values. It is not an instruction or a forecast."),
    ], "house", { index: i, placed: placed.length });
}
function countDistributions(chart) {
  const el = Object.fromEntries(ELEMENTS.map((e) => [e, 0]));
  const mo = Object.fromEntries(MODES.map((e) => [e, 0]));
  for (const b of chart.bodies) {
    el[Content.signs[b.sign]?.element || "Fire"] += 1;
    mo[MODES[b.sign % 3]] += 1;
  }
  return { elements: el, modalities: mo };
}
function monthlyPages(timeline = []) {
  return [0, 1].map((half) => {
    const six = timeline.slice(half * 6, half * 6 + 6);
    return section("DATED SKY DIARY", half ? "The next six months" : "Six months to explore",
      "A sky event is a calculated angle, not a prediction of what will happen.", six.length ? six.map((m) =>
        block(m.month, m.events?.length ? "Measured sky: " + m.events.slice(0, 2).map(aspectSummary).join("; ") + ". Reflect on the themes these planets traditionally represent, then decide what fits your real circumstances." :
          "No close major transit in the date sample. This is not an empty or less important month. Use the space for your own priorities.")
      ) : [block("No calendar samples", "A dated transit series was not provided; no events are invented.")], "timeline");
  });
}
export function buildReportPages({ profile, chart, type = "blueprint", style = "luxe", aspects = [], partner = null, partnerChart = null, crossAspects = [], consent = false, timeline = [], createdAt = new Date().toISOString() }) {
  if (!profile?.name || !chart || !Array.isArray(chart.bodies) || chart.bodies.length !== 10) throw Error("A calculated natal chart is required.");
  const reportType = REPORT_TYPES.find((x) => x.id === type);
  const reportStyle = REPORT_STYLES.find((x) => x.id === style);
  if (!reportType || !reportStyle) throw Error("Choose a supported report type and design style.");
  if (type === "synastry" && (!partner || !partnerChart || !consent)) throw Error("A second chart and permission to use its data are required.");
  const sun = chart.bodies.find((b) => b.body === "Sun");
  const moon = chart.bodies.find((b) => b.body === "Moon");
  const big = (b, name) => b ? name + ": " + placement(b, chart.precision) : name + ": unavailable";
  const asc = chart.asc == null ? "Ascendant unavailable without a reliable birth time." : "Ascendant calculated at " + SIGNS[Math.floor(chart.asc / 30)] + " (" + Number(chart.asc % 30).toFixed(1) + " degrees).";
  const dist = countDistributions(chart);
  const relevant = aspects.slice(0, 7);
  const pages = [
    section("AEON / ILLUSTRATED READING", reportType.label, "Your sky. Your perspective.", [
      block("PREPARED FOR", profile.name),
      block("BIRTH DATA", profile.birthDate + " / " + (profile.precision === "unknown" ? "birth time unknown" : profile.birthTime + " (" + profile.precision + ")") + " / " + profile.place.name),
      block("READING STYLE", reportStyle.label + " / " + chart.system + " houses"),
    ], "cover"),
    section("WELCOME", "How to read your sky", "A gentle translation guide for the whole dossier.", [
      block("THE SCIENCE LAYER", "Astronomical software calculates positions, angles and timestamps. These are geometrical data, not proof of human traits or future events."),
      block("THE SYMBOLIC LAYER", "Astrological traditions then attach meanings to planets, signs, houses and aspects. Different traditions may interpret the same facts differently."),
      block("THE SIMPLE RECIPE", "A planet describes a topic; a sign describes a style; a house describes a part of life; an aspect describes an angular relationship between planets."),
      block("YOUR RIGHT TO DISAGREE", "The interpretations are invitations to reflect. They do not diagnose health, judge compatibility, prove motives or remove your freedom to choose."),
    ], "geometry"),
    section("YOUR CALCULATED SKY", "The placement ledger", "The facts behind every story in this report.", [
      block("ZODIAC & METHOD", "Modern tropical, geocentric coordinates from " + chart.engine + ". House system: " + chart.system + ". Reference birth instant: " + chart.date + "."),
      block("BIRTH-TIME CERTAINTY", chart.precision === "unknown" ? "Time unknown. Local noon is used as a calculation reference. Rising sign and houses are withheld; Moon and some sign positions may vary." : chart.precision === "approximate" ? "Approximate time. A one-hour window on each side is considered. House and angle claims may shift." : "Exact time as entered. Historical timezone rules are supplied by the device and may be uncertain for older dates."),
    ], "ledger", { chart }),
    section("THE BIG THREE", "Three ways to begin", "Not three labels to live up to, but three traditional conversations.", [
      block("SUN / EXPRESSION", big(sun, "Sun") + ". The Sun is a symbol for what helps you feel alive and visible."),
      block("MOON / INNER WEATHER", big(moon, "Moon") + ". The Moon is a traditional lens for emotional rhythms and comfort."),
      block("RISING / FIRST IMPRESSION", asc + " The rising sign is traditionally the style in which you meet new situations; it is not knowable without a reliable time."),
      block("BRING THEM TOGETHER", "Which pieces of your public self, emotional needs and first impressions feel recognisable? Which feel less useful?"),
    ], "trio", { chart }),
    section("PATTERNS / ELEMENTS", "The element balance", "How signs are traditionally grouped, not a personality test.", [
      block("COUNTED PLACEMENTS", ELEMENTS.map((e) => e + ": " + dist.elements[e]).join(" / ") + ". Each of the ten calculated planets contributes one count using its reference sign."),
      block("WHAT ELEMENTS REPRESENT", "Fire is initiative and energy. Earth is grounded practicality. Air is thought and exchange. Water is feelings and receptivity."),
      block("A BETTER QUESTION", "Which quality would be useful to practise this week, whether it appears often or rarely in the chart?"),
    ], "bars", { counts: dist.elements }),
    section("PATTERNS / MODALITIES", "How the signs move", "Cardinal, fixed and mutable describe styles of change in tradition.", [
      block("COUNTED PLACEMENTS", MODES.map((m) => m + ": " + dist.modalities[m]).join(" / ") + ". These groups describe signs, not what you must be."),
      block("WHAT THE MODES REPRESENT", "Cardinal signs start. Fixed signs sustain. Mutable signs adapt. None is inherently superior."),
      block("IN THE WORLD", "Think of an initiative you started, a responsibility you sustained, and a moment you adapted. Which deserves more attention?"),
    ], "bars", { counts: dist.modalities }),
    section("ASPECTS / GEOMETRY", "Where the lines cross", "Aspects are actual angular separations, with a declared orb.", [
      block("YOUR STRONGEST NATAL ASPECTS", relevant.length ? relevant.slice(0, 5).map(aspectSummary).join(". ") + "." : "No major aspects within the selected orb were supplied. No aspect interpretation is invented."),
      block("READING THE GEOMETRY", "A conjunction is near 0 degrees, sextile 60, square 90, trine 120 and opposition 180. An orb measures the deviation from the exact angle."),
      block("READING THE SYMBOLISM", "A trine is traditionally interpreted as ease; a square as tension; others as focus or dialogue. The geometry is measured, but the personal meaning remains an interpretation."),
    ], "aspects", { chart, aspects: relevant }),
    section("A SHORT FIELD GUIDE", "What is a planet?", "The ten moving themes used throughout the reading.", [
      block("THE INNER LANGUAGE", "Sun: expression. Moon: feeling. Mercury: thought. Venus: values and affection. Mars: action. Jupiter: horizons. Saturn: structure."),
      block("THE LONGER CYCLES", "Uranus: change. Neptune: imagination. Pluto: deep transformation. The outer planets stay in signs for many years and cannot define an individual."),
      block("PLANET + SIGN + HOUSE", "The next twenty pages give each planet two chapters: a plain-language explanation and examples you can test against everyday life."),
    ], "geometry"),
  ];
  for (const body of chart.bodies) pages.push(...planetPages(body, chart));
  pages.push(section("A SHORT FIELD GUIDE", "What is a house?", "Twelve life areas. None can be missing from your life.", [
    block("THE IDEA", "A house is one of twelve divisions of the local sky used in astrology. House cusps depend on the exact time and place of birth and on the chosen house system."),
    block("AN EMPTY HOUSE", "No planets in a house does not mean you lack relationships, health, money or any other experience. It simply means no calculated planet occupies that chart sector."),
    block("WHEN TIME IS UNKNOWN", "It is better to say 'unassigned' than to invent houses or a rising sign. The following pages explain all twelve areas, even if yours cannot be calculated."),
    block("WHY SYSTEMS DIFFER", "Whole Sign, Equal and Porphyry are different house conventions. Change the house system and some placements may move without the sky itself changing."),
  ], "geometry"));
  for (let i = 0; i < 12; i++) pages.push(housePage(i, chart));
  pages.push(section("BRINGING IT TOGETHER", "Patterns, not verdicts", "Look for useful connections without turning them into fate.", [
    block("A STRONG THREAD", "Your Sun in " + SIGNS[sun.sign] + " frames a traditional theme of expression, while your Moon in " + SIGNS[moon.sign] + " frames a different theme of feeling. Both can coexist."),
    block("THE ROLE OF ASPECTS", relevant.length ? "One measured connection is " + aspectSummary(relevant[0]) + ". The angle is calculated, but you decide whether its metaphor is useful." : "There are no selected major aspects to interpret. The chart still offers planetary and sign themes."),
    block("YOUR OWN EXPERIENCE FIRST", "When an explanation resonates, identify a real example. When it does not, leave it behind. A chart should open questions, not close choices."),
    block("REVISIT LATER", "Reflect on how circumstances, culture, relationships and decisions shape your actual life far more directly than any celestial metaphor."),
  ], "aspects", { chart, aspects: relevant }));
  if (type === "synastry") {
    pages.push(section("CONNECTIONS / CONSENT", "Two skies, two people", "Comparison only with permission. Nobody receives a compatibility score.", [
      block("FIRST CHART", profile.name + ": " + big(sun, "Sun")),
      block("SECOND CHART", partner.name + ": Sun in " + SIGNS[partnerChart.bodies[0].sign] + ". Chart calculated independently from the saved birth data."),
      block("ACTUAL CROSS-CHART ASPECTS", crossAspects.length ? crossAspects.slice(0, 5).map(aspectSummary).join(". ") + "." : "No selected close cross-chart aspects; none are invented."),
      block("PERSONAL AUTONOMY", "A person's feelings, consent and boundaries must come from that person, not the chart. Remove the saved second profile when permission ends."),
    ], "aspects", { chart, aspects: crossAspects }));
  }
  if (type === "year") pages.push(...monthlyPages(timeline));
  for (const [name, explanation, question] of DOMAIN_GUIDES[type]) {
    pages.push(section("LIFE THEMES / " + type.toUpperCase(), name, "A themed reflection based on astrological tradition.", [
      block("WHAT THE SYMBOLS SAY", explanation),
      block("ONE LINK TO THE CHART", "In this calculation, Venus is in " + SIGNS[chart.bodies.find((b) => b.body === "Venus").sign] + " and Saturn is in " + SIGNS[chart.bodies.find((b) => b.body === "Saturn").sign] + ". These are placements, not evidence about private behaviour or future events."),
      block("WHAT YOU CAN DO WITH IT", "Notice a real circumstance, talk with people involved where appropriate, and choose a practical next action. You never need to obey a reading."),
      block("A QUESTION FOR YOUR JOURNAL", question),
    ], "reflection"));
  }
  pages.push(
    section("YOUR SPACE / REFLECTION", "A page to make your own", "Keep your decisions with you.", [
      block("NOTICE", "Which chart description felt specific and useful? What happened in your real life that supports that reflection?"),
      block("QUESTION", "Which interpretation did not fit? What additional context would a person need to understand your experience?"),
      block("TRY", "Choose one small action you can take without requiring the future to be predictable."),
      block("RETURN", "Come back another day. You are allowed to change your mind about any part of the story."),
    ], "journal"),
    section("REFERENCE / GLOSSARY", "The language of the sky", "A concise translation of the technical terms.", [
      block("PLANET / SIGN / HOUSE", "Planet: symbolic topic. Sign: symbolic style. House: symbolic area of life, requiring a reliable birth time."),
      block("ASPECT / ORB / RETROGRADE", "Aspect: angle between bodies. Orb: distance from an exact aspect angle. Retrograde: apparent backward motion from Earth's viewpoint."),
      block("ASCENDANT / MIDHEAVEN", "Ascendant: ecliptic point rising on the eastern horizon. Midheaven: ecliptic point associated with the local meridian."),
      block("TROPICAL / GEOCENTRIC", "Tropical: zodiac anchored to the equinoxes. Geocentric: coordinates referenced to an observer at Earth's centre."),
      block("NATAL / TRANSIT / SYNASTRY", "Natal: chart for birth. Transit: a moving planetary position compared to a natal chart. Synastry: comparison of two calculated charts."),
    ], "geometry"),
    section("METHOD / PRIVACY", "How this report was made", "A provenance note and the limits of interpretation.", [
      block("CHART SOURCE", "The live AEON calculation used " + chart.engine + " with " + chart.system + " houses. The birth instant recorded by the engine is " + chart.date + "."),
      block("REPORT SOURCE", "Document composed locally from chart data and the original AEON explanatory library. Style: " + reportStyle.label + ". Edition: " + reportType.label + ". Created " + createdAt + "."),
      block("UNCERTAINTY", chart.precision === "unknown" ? "Birth time is unknown; rising sign and natal houses are not asserted. Other positions may change across the day." : chart.precision === "approximate" ? "Birth time is approximate. Angle and house assignments should be treated as provisional." : "Results depend on supplied birth data, city-centre coordinates, time zone and calculation-engine assumptions."),
      block("PRIVACY", "This PDF is generated in your browser. It is not uploaded to a report service. The file contains private birth details: keep it in a trusted place."),
      block("IMPORTANT BOUNDARY", "Astrology is a cultural/interpretive tradition, not scientifically validated evidence of health, personality, relationships, legal outcomes or future events."),
    ], "geometry"),
  );
  return { pages, type: reportType, style: reportStyle, profile, chart, createdAt };
}

function rgb(hex) { const v = String(hex).replace("#", ""); return [0, 2, 4].map((i) => (parseInt(v.slice(i, i + 2), 16) / 255).toFixed(3)).join(" "); }
function ascii(s) {
  return String(s ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[—–]/g, "-").replace(/°/g, " deg").replace(/[^ -~]/g, "?");
}
function pdfStr(s) { return ascii(s).replace(/[\\()]/g, "\\$&"); }
function setFill(c) { return rgb(c) + " rg\n"; }
function setStroke(c) { return rgb(c) + " RG\n"; }
function rect(x, y, w, h, c) { return setFill(c) + [x, y, w, h].map((n) => Number(n).toFixed(2)).join(" ") + " re f\n"; }
function line(x1, y1, x2, y2, c, width = 1) {
  return setStroke(c) + Number(width).toFixed(2) + " w\n" + [x1, y1].map((n) => n.toFixed(2)).join(" ") + " m " + [x2, y2].map((n) => n.toFixed(2)).join(" ") + " l S\n";
}
function circle(cx, cy, r, c, filled = false, width = 1) {
  const k = 0.55228475 * r; const f = (v) => Number(v).toFixed(2);
  const path = f(cx+r) + " " + f(cy) + " m " + f(cx+r) + " " + f(cy+k) + " " + f(cx+k) + " " + f(cy+r) + " " + f(cx) + " " + f(cy+r) + " c " +
    f(cx-k) + " " + f(cy+r) + " " + f(cx-r) + " " + f(cy+k) + " " + f(cx-r) + " " + f(cy) + " c " +
    f(cx-r) + " " + f(cy-k) + " " + f(cx-k) + " " + f(cy-r) + " " + f(cx) + " " + f(cy-r) + " c " +
    f(cx+k) + " " + f(cy-r) + " " + f(cx+r) + " " + f(cy-k) + " " + f(cx+r) + " " + f(cy) + " c " + (filled ? "f\n" : "S\n");
  return (filled ? setFill(c) : setStroke(c) + width + " w\n") + path;
}
function txt(s, x, y, size, c, font = "F1") {
  return setFill(c) + "BT /" + font + " " + size + " Tf 1 0 0 1 " + x.toFixed(2) + " " + y.toFixed(2) + " Tm (" + pdfStr(s) + ") Tj ET\n";
}
function wrap(s, maxChars) {
  const lines = [], words = ascii(s).replace(/\s+/g, " ").trim().split(" ");
  let current = "";
  for (let word of words) {
    while (word.length > maxChars) {
      if (current) { lines.push(current); current = ""; }
      lines.push(word.slice(0, maxChars)); word = word.slice(maxChars);
    }
    if (!word) continue;
    if ((current + (current ? " " : "") + word).length > maxChars) { lines.push(current); current = word; }
    else current += (current ? " " : "") + word;
  }
  if (current) lines.push(current);
  return lines;
}
function para(s, x, y, max, color, size = 10.2, leading = 15.8) {
  let out = ""; const chars = Math.floor(max / (size * .515));
  const lines = wrap(s, chars);
  for (const text of lines) { out += txt(text, x, y, size, color); y -= leading; }
  return { output: out, y, lines: lines.length };
}
function contrastFor(style) {
  return ["insight", "codex", "mono"].includes(style.id) ? style.colors[2] : style.colors[2];
}
function art(style, page, chart) {
  const accent = style.colors[1], fg = style.colors[2], bg = style.colors[0];
  let out = "";
  if (page.art === "cover") {
    out += circle(298, 475, 165, accent, false, 1.2);
    out += circle(298, 475, 135, accent, false, .8);
    out += circle(298, 475, 95, accent, false, .65);
    out += circle(298, 475, 35, accent, false, 1.5);
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180;
      out += line(298 + 140*Math.cos(a),475+140*Math.sin(a),298+166*Math.cos(a),475+166*Math.sin(a),accent,.8);
    }
    for (let i = 0; i < chart.bodies.length; i++) {
      const a = (chart.bodies[i].lon - 90)*Math.PI/180;
      out += circle(298+135*Math.cos(a),475+135*Math.sin(a),i<2?5:3.5,accent,true);
    }
    out += txt("A E O N",238,475,19,accent,"F3");
  } else if (page.art === "bars") {
    out += rect(54, 563, 486, 142, bg);
    const entries = Object.entries(page.payload?.counts || {});
    entries.forEach(([label, count], i) => {
      const x=66+i*(452/entries.length), maxW=452/entries.length-18;
      out += txt(label,x,685,10,fg,"F3");
      out += rect(x,635,maxW,8,accent);
      out += rect(x,635,maxW*Math.max(0, Math.min(1,Number(count)/10)),8,fg);
      out += txt(String(count)+" / 10",x,610,12,fg,"F3");
    });
  } else if (page.art === "ledger") {
    const rows=page.payload?.chart?.bodies || [];
    out+=rect(54, 542, 486, 198, accent);
    rows.forEach((b,i)=>{
      const col=i<5?0:1, index=i%5, x=72+col*244, y=712-index*34;
      out+=txt(b.body,x,y,10,bg,"F3");
      out+=txt(SIGNS[b.sign]+" / "+(b.house == null ? "house ?" : "H"+b.house),x,y-12,9,bg);
    });
  } else if (page.art === "aspects") {
    out += circle(298,639,90,accent,false,1.1);
    const bodies=page.payload?.chart?.bodies || chart.bodies;
    const list=page.payload?.aspects || [];
    for(const b of bodies) {
      const a=(b.lon-90)*Math.PI/180;
      out+=circle(298+90*Math.cos(a),639+90*Math.sin(a),3,accent,true);
    }
    for(const a of list.slice(0,12)) {
      const p=bodies.find(b=>b.body===a.left),q=bodies.find(b=>b.body===a.right);
      if(!p||!q)continue;
      out+=line(298+90*Math.cos((p.lon-90)*Math.PI/180),639+90*Math.sin((p.lon-90)*Math.PI/180),
        298+90*Math.cos((q.lon-90)*Math.PI/180),639+90*Math.sin((q.lon-90)*Math.PI/180),accent,.8);
    }
  } else {
    const r=page.art==="planet"?94:page.art==="house"?80:68;
    out+=circle(298,636,r,accent,false,1.2);
    out+=circle(298,636,r*.68,accent,false,.75);
    if(page.art==="geometry" || style.id==="sacred") for(let i=0;i<6;i++) {
      const a=i*Math.PI/3;
      out+=line(298+r*Math.cos(a),636+r*Math.sin(a),298+r*Math.cos(a+2*Math.PI/3),636+r*Math.sin(a+2*Math.PI/3),accent,.65);
    }
    if(page.art==="trio") {
      for(let i=0;i<3;i++) out+=circle(298+Math.cos(i*2*Math.PI/3)*r*.8,636+Math.sin(i*2*Math.PI/3)*r*.8,12,accent,true);
    }
    if(page.art==="house")out+=txt(String((page.payload?.index||0)+1).padStart(2,"0"),280,630,28,accent,"F2");
    if(page.art==="planet") out+=txt(page.payload?.body?.body?.toUpperCase()||"PLANET",257,633,13,accent,"F3");
    if(page.art==="journal") {
      for(let i=0;i<5;i++)out+=line(120,705-i*31,476,705-i*31,accent,.6);
    }
  }
  return out;
}
function drawPage(doc, page, index, total) {
  const style=doc.style, [bg,accent,ink]=style.colors;
  let out=rect(0,0,595,842,bg);
  if(["insight","codex","mono"].includes(style.id)) out+=rect(0,765,595,77,accent);
  out+=txt("AEON",54,805,14,["insight","codex","mono"].includes(style.id)?bg:accent,"F3");
  out+=txt("YOUR SKY. YOUR PERSPECTIVE.",365,807,8,["insight","codex","mono"].includes(style.id)?bg:ink);
  out+=line(54,770,541,770,accent,.85);
  if(page.art==="cover") {
    out+=art(style,page,doc.chart);
    out+=txt("ILLUSTRATED PERSONAL DOSSIER",54,709,9,accent,"F3");
    out+=txt(doc.type.label,54,269,29,ink,"F2");
    let y=237;
    for(const b of page.blocks){out+=txt(b.label,54,y,8,accent,"F3");y-=15;const p=para(b.text,54,y,485,ink,10.5,15);out+=p.output;y=p.y-10;}
  } else {
    out+=txt(page.kicker,54,742,9,accent,"F3");
    out+=txt(page.title,54,713,Math.min(25, page.title.length>42?18:25),ink,"F2");
    const subtitle=para(page.subtitle,54,689,485,ink,10,13);
    out+=subtitle.output;
    out+=art(style,page,doc.chart);
    out+=line(54,527,541,527,accent,.7);
    let y=506;
    for(const b of page.blocks) {
      if(y<94)break;
      out+=txt(b.label,54,y,9,accent,"F3");y-=20;
      const t=para(b.text,54,y,483,ink,10,15.2);out+=t.output;y=t.y-12;
    }
  }
  out+=line(54,64,541,64,accent,.65);
  out+=txt(doc.profile.name+" / "+doc.type.label,54,44,9,ink);
  out+=txt(String(index+1).padStart(2,"0")+" / "+String(total).padStart(2,"0"),487,44,9,ink,"F3");
  return out;
}
function pdfObjects(doc) {
  const streams=doc.pages.map((page,i)=>drawPage(doc,page,i,doc.pages.length));
  const objects=[
    "", "<< /Type /Catalog /Pages 2 0 R >>", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  const kids=[];
  for(const stream of streams) {
    const contents=objects.length, pageId=contents+1;
    const length=new TextEncoder().encode(stream).length;
    objects.push("<< /Length "+length+" >>\nstream\n"+stream+"endstream");
    objects.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents "+contents+" 0 R >>");
    kids.push(pageId+" 0 R");
  }
  objects[2]="<< /Type /Pages /Kids ["+kids.join(" ")+"] /Count "+doc.pages.length+" >>";
  return objects;
}
export function createReportPdf(options) {
  const doc=buildReportPages(options);
  const objects=pdfObjects(doc);
  const encoder=new TextEncoder();
  let data="%PDF-1.4\n%AEON\n";
  const offsets=[0];
  for(let i=1;i<objects.length;i++) {
    offsets[i]=encoder.encode(data).length;
    data+=i+" 0 obj\n"+objects[i]+"\nendobj\n";
  }
  const xref=encoder.encode(data).length;
  data+="xref\n0 "+objects.length+"\n0000000000 65535 f \n";
  for(let i=1;i<objects.length;i++)data+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
  data+="trailer\n<< /Size "+objects.length+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n";
  const base=String(options.profile.name).normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,50)||"profile";
  return { bytes:encoder.encode(data), pageCount:doc.pages.length, filename:"AEON-"+base+"-"+doc.type.id+"-"+doc.style.id+".pdf", document:doc };
}
