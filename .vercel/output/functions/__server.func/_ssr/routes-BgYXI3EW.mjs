import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route } from "./router-CzLnzeRe.mjs";
import { a as SearchMoonPhase, i as MoonPhase, n as GeoVector, o as SiderealTime, r as MakeTime, s as e_tilt, t as Ecliptic } from "../_libs/astronomy-engine.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BgYXI3EW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function create$2(A) {
	"use strict";
	const VERSION = "aeon-1.0.0 / astronomy-engine-2.1.19";
	const SIGNS = [
		"Aries",
		"Taurus",
		"Gemini",
		"Cancer",
		"Leo",
		"Virgo",
		"Libra",
		"Scorpio",
		"Sagittarius",
		"Capricorn",
		"Aquarius",
		"Pisces"
	];
	const GLYPHS = [
		"♈",
		"♉",
		"♊",
		"♋",
		"♌",
		"♍",
		"♎",
		"♏",
		"♐",
		"♑",
		"♒",
		"♓"
	];
	const BODIES = [
		"Sun",
		"Moon",
		"Mercury",
		"Venus",
		"Mars",
		"Jupiter",
		"Saturn",
		"Uranus",
		"Neptune",
		"Pluto"
	];
	const SYMBOLS = {
		Sun: "☉",
		Moon: "☽",
		Mercury: "☿",
		Venus: "♀",
		Mars: "♂",
		Jupiter: "♃",
		Saturn: "♄",
		Uranus: "♅",
		Neptune: "♆",
		Pluto: "♇"
	};
	const ASPECTS = [
		{
			name: "conjunction",
			angle: 0,
			kind: "focus",
			verb: "conjunct"
		},
		{
			name: "sextile",
			angle: 60,
			kind: "flow",
			verb: "sextile"
		},
		{
			name: "square",
			angle: 90,
			kind: "friction",
			verb: "square"
		},
		{
			name: "trine",
			angle: 120,
			kind: "flow",
			verb: "trine"
		},
		{
			name: "opposition",
			angle: 180,
			kind: "focus",
			verb: "opposite"
		}
	];
	const mod = (n) => (n % 360 + 360) % 360;
	const delta = (a, b) => mod(a - b + 180) - 180;
	const distance = (a, b) => Math.abs(delta(a, b));
	const radians = (n) => n * Math.PI / 180;
	const degrees = (n) => n * 180 / Math.PI;
	const pad = (n) => String(n).padStart(2, "0");
	const formatters = /* @__PURE__ */ new Map();
	const positionCache = /* @__PURE__ */ new Map();
	const chartCache = /* @__PURE__ */ new Map();
	function validZone(zone) {
		try {
			new Intl.DateTimeFormat("en", { timeZone: zone }).format();
			return true;
		} catch {
			return false;
		}
	}
	function parts(date, zone) {
		if (!formatters.has(zone)) formatters.set(zone, new Intl.DateTimeFormat("en-GB", {
			timeZone: zone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hourCycle: "h23"
		}));
		return Object.fromEntries(formatters.get(zone).formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)]));
	}
	function dateKey(date = /* @__PURE__ */ new Date(), zone = "UTC") {
		const p = parts(date, zone);
		return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
	}
	function addDays(key, n) {
		const d = /* @__PURE__ */ new Date(key + "T12:00:00Z");
		d.setUTCDate(d.getUTCDate() + n);
		return d.toISOString().slice(0, 10);
	}
	function validateDate(key) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw Error("Enter a complete birth date.");
		const d = /* @__PURE__ */ new Date(key + "T12:00:00Z");
		if (!Number.isFinite(+d) || d.toISOString().slice(0, 10) !== key || d.getUTCFullYear() < 1900 || d.getUTCFullYear() > 2100) throw Error("Choose a valid date between 1900 and 2100.");
		return d;
	}
	function resolveLocal(key, time, zone) {
		validateDate(key);
		if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw Error("Enter a valid local time.");
		if (!validZone(zone)) throw Error("Choose a valid IANA timezone, such as Australia/Perth.");
		const [y, m, d] = key.split("-").map(Number), [h, min] = time.split(":").map(Number);
		const nominal = Date.UTC(y, m - 1, d, h, min), offsets = /* @__PURE__ */ new Set();
		for (let i = -36; i <= 36; i += 3) {
			const probe = nominal + i * 36e5, p = parts(new Date(probe), zone);
			offsets.add(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - probe);
		}
		const matches = [];
		for (const offset of offsets) {
			const value = nominal - offset, p = parts(new Date(value), zone);
			if (p.year === y && p.month === m && p.day === d && p.hour === h && p.minute === min) matches.push({
				iso: new Date(value).toISOString(),
				offsetMinutes: offset / 6e4
			});
		}
		return matches.sort((a, b) => a.iso.localeCompare(b.iso));
	}
	function firstLocal(key, zone) {
		for (let m = 0; m <= 180; m++) {
			const matches = resolveLocal(key, `${pad(Math.floor(m / 60))}:${pad(m % 60)}`, zone);
			if (matches.length) return new Date(matches[0].iso);
		}
		throw Error("This local date is not supported. Check the date and timezone.");
	}
	function positions(date) {
		const key = new Date(date).toISOString();
		if (positionCache.has(key)) return positionCache.get(key);
		const result = BODIES.map((body) => {
			const e = A.Ecliptic(A.GeoVector(body, new Date(date), true));
			return {
				body,
				lon: mod(e.elon),
				lat: e.elat,
				sign: Math.floor(mod(e.elon) / 30)
			};
		});
		if (positionCache.size > 300) positionCache.clear();
		positionCache.set(key, result);
		return result;
	}
	function angles(date, lat, lng) {
		const theta = radians(mod(A.SiderealTime(date) * 15 + lng));
		const eps = radians(A.e_tilt(A.MakeTime(date)).tobl), phi = radians(lat);
		let asc = mod(degrees(Math.atan2(-Math.cos(phi) * Math.cos(theta), Math.cos(phi) * Math.sin(theta) * Math.cos(eps) + Math.sin(phi) * Math.sin(eps))));
		const east = (lon) => -Math.sin(theta) * Math.cos(radians(lon)) + Math.cos(theta) * Math.sin(radians(lon)) * Math.cos(eps);
		if (east(asc) < 0) asc = mod(asc + 180);
		const mc = mod(degrees(Math.atan2(Math.sin(theta), Math.cos(theta) * Math.cos(eps))));
		return {
			asc,
			mc
		};
	}
	function houseCusps(asc, mc, system, lat) {
		if (system === "whole") return Array.from({ length: 12 }, (_, i) => mod(Math.floor(asc / 30) * 30 + i * 30));
		if (system === "equal") return Array.from({ length: 12 }, (_, i) => mod(asc + i * 30));
		if (system !== "porphyry") throw Error("Unsupported house system.");
		if (Math.abs(lat) > 66) return null;
		const starts = [
			asc,
			mod(mc + 180),
			mod(asc + 180),
			mc
		], cusps = [];
		for (let q = 0; q < 4; q++) {
			const span = mod(starts[(q + 1) % 4] - starts[q]);
			if (span > 180 || span < 1e-4) return null;
			for (let k = 0; k < 3; k++) cusps.push(mod(starts[q] + span * k / 3));
		}
		return cusps;
	}
	function houseFor(lon, cusps) {
		if (!cusps) return null;
		for (let i = 0; i < 12; i++) if (mod(lon - cusps[i]) < mod(cusps[(i + 1) % 12] - cusps[i]) - 1e-9) return i + 1;
		return null;
	}
	function validateProfile(p, adult = false) {
		if (!p || typeof p !== "object" || typeof p.name !== "string" || !p.name.trim() || p.name.length > 60) throw Error("Add a name of up to 60 characters.");
		validateDate(p.birthDate);
		if (![
			"exact",
			"approximate",
			"unknown"
		].includes(p.precision)) throw Error("Choose the accuracy of the birth time.");
		if (!p.place || !Number.isFinite(p.place.lat) || Math.abs(p.place.lat) > 89.8 || !Number.isFinite(p.place.lng) || Math.abs(p.place.lng) > 180 || typeof p.place.name !== "string" || p.place.name.length > 150 || !validZone(p.place.zone)) throw Error("Check the location, coordinates and timezone.");
		if (adult) {
			const now = /* @__PURE__ */ new Date(), cutoff = new Date(Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()));
			if (+/* @__PURE__ */ new Date(p.birthDate + "T00:00:00Z") > +cutoff) throw Error("AEON is for adults aged 18 and over.");
		}
		const matches = resolveLocal(p.birthDate, p.precision === "unknown" ? "12:00" : p.birthTime, p.place.zone);
		if (!matches.length) throw Error("That time did not exist locally because the clocks changed. Please check it.");
		if (matches.length > 1 && !Number.isInteger(p.fold)) throw Error("The clocks repeated this time. Choose the correct UTC offset.");
		if (p.fold != null && (p.fold < 0 || p.fold >= matches.length)) throw Error("Choose a valid UTC offset for this time.");
		return matches[p.fold || 0];
	}
	function chart(profile, system = "porphyry") {
		const resolved = validateProfile(profile);
		const cacheKey = [
			resolved.iso,
			system,
			profile.precision,
			profile.place.lat,
			profile.place.lng,
			profile.fold || 0
		].join("|");
		const cached = chartCache.get(cacheKey);
		if (cached) return cached;
		const date = new Date(resolved.iso), base = positions(date);
		let interval = null, samples = [];
		if (profile.precision === "unknown") {
			const start = firstLocal(profile.birthDate, profile.place.zone), end = firstLocal(addDays(profile.birthDate, 1), profile.place.zone);
			interval = {
				start: start.toISOString(),
				end: end.toISOString()
			};
			for (let i = 0; i <= 24; i++) samples.push(positions(/* @__PURE__ */ new Date(+start + (+end - +start - 1e3) * i / 24)));
		} else if (profile.precision === "approximate") {
			interval = {
				start: (/* @__PURE__ */ new Date(+date - 36e5)).toISOString(),
				end: (/* @__PURE__ */ new Date(+date + 36e5)).toISOString()
			};
			samples = [positions(new Date(interval.start)), positions(new Date(interval.end))];
		}
		const a = profile.precision === "unknown" ? null : angles(date, profile.place.lat, profile.place.lng);
		const cusps = a ? houseCusps(a.asc, a.mc, system, profile.place.lat) : null;
		const before = positions(/* @__PURE__ */ new Date(+date - 216e5)), after = positions(/* @__PURE__ */ new Date(+date + 216e5));
		const bodies = base.map((b, i) => {
			const variants = /* @__PURE__ */ new Set([b.sign, ...samples.map((s) => s[i].sign)]);
			const uncertainty = samples.length ? Math.max(...samples.map((s) => Math.abs(delta(s[i].lon, b.lon)))) : 0;
			const speed = delta(after[i].lon, before[i].lon) * 2;
			return {
				...b,
				signs: [...variants].sort((x, y) => x - y),
				uncertainty,
				speed,
				retrograde: speed < 0,
				house: houseFor(b.lon, cusps)
			};
		});
		const result = {
			profileId: profile.id,
			date: date.toISOString(),
			offset: resolved.offsetMinutes,
			system,
			asc: a?.asc ?? null,
			mc: a?.mc ?? null,
			cusps,
			bodies,
			interval,
			precision: profile.precision,
			engine: VERSION
		};
		chartCache.set(cacheKey, result);
		return result;
	}
	function aspects(left, right, orb = 4, same = false) {
		const out = [];
		for (let i = 0; i < left.length; i++) for (let j = 0; j < right.length; j++) {
			if (same && j <= i) continue;
			const l = left[i], r = right[j];
			if ((l.uncertainty || 0) > 1.5 || (r.uncertainty || 0) > 1.5) continue;
			const separation = distance(l.lon, r.lon);
			for (const a of ASPECTS) {
				const gap = Math.abs(separation - a.angle);
				if (gap <= orb) out.push({
					left: l.body,
					right: r.body,
					...a,
					orb: gap,
					score: orb - gap + (i < 5 ? 1 : 0) + (j < 5 ? .8 : 0),
					id: `${l.body}-${a.name}-${r.body}`
				});
			}
		}
		return out.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
	}
	function daily(chartData, key, zone) {
		const candidates = resolveLocal(key, "12:00", zone);
		if (!candidates.length) throw Error("Cannot calculate midday for this date. Try a different date.");
		const date = new Date(candidates[0].iso), current = positions(date);
		const events = aspects(current, chartData.bodies, 2.5).map((e) => ({
			...e,
			score: e.score + (e.left === "Moon" ? 1.5 : 0) + (e.left === "Sun" ? .5 : 0)
		})).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
		const chosen = [], topics = /* @__PURE__ */ new Set();
		for (const e of events) {
			if (!topics.has(e.left)) {
				chosen.push(e);
				topics.add(e.left);
			}
			if (chosen.length === 3) break;
		}
		return {
			key,
			zone,
			date: date.toISOString(),
			events,
			chosen,
			positions: current,
			moon: moon(date)
		};
	}
	function moon(date) {
		const angle = A.MoonPhase(date);
		return {
			angle,
			illumination: (1 - Math.cos(radians(angle))) / 2,
			name: [
				"New moon",
				"Waxing crescent",
				"First quarter",
				"Waxing gibbous",
				"Full moon",
				"Waning gibbous",
				"Last quarter",
				"Waning crescent"
			][Math.floor(mod(angle + 22.5) / 45)]
		};
	}
	function moonEvents(start, end) {
		const out = [];
		for (const angle of [
			0,
			90,
			180,
			270
		]) {
			let cursor = new Date(start);
			for (let i = 0; i < 3; i++) {
				const found = A.SearchMoonPhase(angle, cursor, 40);
				if (!found || +found.date > +end) break;
				if (+found.date >= +start) out.push({
					angle,
					date: found.date.toISOString(),
					name: {
						0: "New moon",
						90: "First quarter",
						180: "Full moon",
						270: "Last quarter"
					}[angle]
				});
				cursor = /* @__PURE__ */ new Date(+found.date + 864e5);
			}
		}
		return out.sort((a, b) => a.date.localeCompare(b.date));
	}
	function positionLabel(lon) {
		const normalized = mod(lon), sign = Math.floor(normalized / 30), total = Math.floor((normalized - sign * 30) * 60);
		return {
			sign,
			name: SIGNS[sign],
			glyph: GLYPHS[sign],
			degree: `${Math.floor(total / 60)}° ${pad(total % 60)}′`
		};
	}
	return {
		VERSION,
		SIGNS,
		GLYPHS,
		BODIES,
		SYMBOLS,
		ASPECTS,
		mod,
		delta,
		distance,
		parts,
		dateKey,
		addDays,
		validateDate,
		validZone,
		resolveLocal,
		firstLocal,
		positions,
		angles,
		houseCusps,
		houseFor,
		validateProfile,
		chart,
		aspects,
		daily,
		moon,
		moonEvents,
		positionLabel
	};
}
var Astro = create$2({
	Ecliptic,
	GeoVector,
	SiderealTime,
	e_tilt,
	MakeTime,
	MoonPhase,
	SearchMoonPhase
});
function create$1() {
	"use strict";
	const signs = [
		{
			element: "Fire",
			word: "Start",
			text: "Aries starts things. It is direct, impatient, and useful when you need a first step. Pause before you promise the whole journey."
		},
		{
			element: "Earth",
			word: "Steady",
			text: "Taurus keeps what is real and pleasant. It is good at protecting a rhythm that works. Notice when comfort has turned into a rut."
		},
		{
			element: "Air",
			word: "Ask",
			text: "Gemini learns by talking, reading, and comparing. Gather the options, then choose one idea to finish."
		},
		{
			element: "Water",
			word: "Care",
			text: "Cancer watches who belongs and who needs looking after. Make the space feel safe, and include a clear boundary."
		},
		{
			element: "Fire",
			word: "Shine",
			text: "Leo wants warmth, pride, and something to create. Be seen as yourself, not as a performance you resent."
		},
		{
			element: "Earth",
			word: "Mend",
			text: "Virgo notices the small fix that makes life work. Use that eye as care. It is not a reason to pick yourself apart."
		},
		{
			element: "Air",
			word: "Balance",
			text: "Libra looks for fairness between people. There can be more than one fair answer. Include what you actually want."
		},
		{
			element: "Water",
			word: "Trust",
			text: "Scorpio goes under the surface: trust, privacy, and what is usually unsaid. Be honest without forcing everything into the open."
		},
		{
			element: "Fire",
			word: "Widen",
			text: "Sagittarius wants a bigger picture: meaning, study, travel, a bet on possibility. Explore, then come back to the facts."
		},
		{
			element: "Earth",
			word: "Build",
			text: "Capricorn builds what lasts: time, duty, and a public standard. Take one solid step, and put rest in the plan."
		},
		{
			element: "Air",
			word: "Rethink",
			text: "Aquarius questions the usual arrangement and cares about the group. Change one default. You do not have to reinvent your whole life."
		},
		{
			element: "Water",
			word: "Imagine",
			text: "Pisces feels what is hard to define: imagination, empathy, and a soft edge. Let it inform you, then check what is actually true."
		}
	];
	const planets = {
		Sun: {
			topic: "Self & expression",
			short: "Your sense of self",
			text: "The Sun is the part of you that wants to feel alive and be known for something. Read it as what you are practising becoming, not a job title you were assigned."
		},
		Moon: {
			topic: "Your inner weather",
			short: "Your moods and comfort",
			text: "The Moon is mood, memory, and what helps you feel safe. It changes fast, so an uncertain birth time can move this placement. It describes needs, not a mood you must stay in."
		},
		Mercury: {
			topic: "Mind & conversation",
			short: "How you think and talk",
			text: "Mercury is how you learn, write, and make sense of a conversation. It is the style of your questions. It is not a score for how clever you are."
		},
		Venus: {
			topic: "Love & connection",
			short: "What you enjoy and how you love",
			text: "Venus is taste, affection, pleasure, and what you find worth keeping close. It is a way to look at how you give and receive care, not a rule about who you should love."
		},
		Mars: {
			topic: "Energy & intention",
			short: "How you go after things",
			text: "Mars is energy, anger, courage, and how you start. It shows a style of action. It does not decide whether you are kind."
		},
		Jupiter: {
			topic: "Growth & possibility",
			short: "Where you want more",
			text: "Jupiter is growth, belief, learning, and generosity. It marks where you look for more room. More is not always better; check it against your real time and money."
		},
		Saturn: {
			topic: "Work & foundations",
			short: "Where life asks you to be serious",
			text: "Saturn is time, duty, limits, and skill you build slowly. A limit here is information about the plan. It is not a verdict that you have failed."
		},
		Uranus: {
			topic: "Change & freedom",
			short: "Where you need room to differ",
			text: "Uranus is the urge to do a familiar thing differently. It moves slowly, so its sign is shared by a whole generation. Your life is more specific than that sign."
		},
		Neptune: {
			topic: "Imagination & meaning",
			short: "Where imagination gets loud",
			text: "Neptune is imagination, longing, and the places a story can outrun the facts. Its sign is generational. Use it for art and empathy, then check what you can check."
		},
		Pluto: {
			topic: "Depth & renewal",
			short: "Where change goes deep",
			text: "Pluto is power, privacy, and change you cannot ignore. Its sign is shared by a generation. Read it as a question about what you are ready to outgrow, not a fate."
		}
	};
	const houses = [
		{
			name: "Self & presence",
			plain: "You, as you enter the room: body, manner, and the way you start.",
			ask: "How do I show up before I explain myself?"
		},
		{
			name: "Resources & values",
			plain: "What you have and what you think is worth keeping: money, skills, and possessions.",
			ask: "What do I actually value, and what am I only used to?"
		},
		{
			name: "Learning & communication",
			plain: "Everyday talk: messages, siblings, neighbours, short trips, and how you learn.",
			ask: "What do I need to say plainly, and to whom?"
		},
		{
			name: "Home & belonging",
			plain: "Home and private life: family, roots, and the place you go to feel you belong.",
			ask: "What would make home feel more like mine?"
		},
		{
			name: "Creativity & pleasure",
			plain: "Play: romance, children, hobbies, and making something because you want to.",
			ask: "Where am I allowed to enjoy this, not just finish it?"
		},
		{
			name: "Routines & care",
			plain: "The weekday: tasks, health habits, and the work of looking after details.",
			ask: "Which small habit actually takes care of me?"
		},
		{
			name: "Partnership & agreements",
			plain: "One other person: a partner, a close collaborator, or the agreements you make.",
			ask: "What do I want this agreement to be, in one clear sentence?"
		},
		{
			name: "Trust & shared resources",
			plain: "What you merge: shared money, debt, sex, inheritance, and other people’s secrets.",
			ask: "What am I willing to share, and what needs to stay trusted?"
		},
		{
			name: "Perspective & exploration",
			plain: "The far view: study, travel, belief, and the story you tell about what life is for.",
			ask: "Which bigger idea am I willing to test in ordinary life?"
		},
		{
			name: "Work & public life",
			plain: "Your public name: career, reputation, and the role people can see.",
			ask: "What do I want my name to stand for?"
		},
		{
			name: "Friendship & community",
			plain: "Your people: friends, groups, and a future that needs more than one person.",
			ask: "Who is actually on my side, and what are we making?"
		},
		{
			name: "Solitude & reflection",
			plain: "What is quiet or unfinished: rest, privacy, endings, and the inner life.",
			ask: "What needs quiet, or a real ending, instead of more effort?"
		}
	];
	const interpretations = {
		Sun: {
			flow: "Let a small act of self-expression be enough. There may be room to say what you mean without making it a performance.",
			focus: "Choose where your attention belongs before the day chooses for you. One honest priority can be more useful than a convincing appearance of having everything together.",
			friction: "When expectations pull in different directions, return to what you can choose. You do not have to prove your entire identity in one conversation."
		},
		Moon: {
			flow: "Notice the ordinary things that help you settle: a familiar meal, an unhurried conversation, a little space. Comfort can be something you practise rather than wait for.",
			focus: "Make room to name what you are feeling without turning it into a final conclusion. A pause can give a passing mood somewhere to move.",
			friction: "A feeling may be asking for attention, not immediate action. Slow the next step enough to check what you need before trying to solve everything."
		},
		Mercury: {
			flow: "A thoughtful exchange can make an idea feel less tangled. Ask the next useful question, and leave room to be surprised by the answer.",
			focus: "Give one idea your full attention. Writing a few clear sentences may help you separate what you know from what you are assuming.",
			friction: "If a conversation feels difficult, try a simpler sentence or a better question. Checking what someone meant can save you from replying to a story they did not tell."
		},
		Venus: {
			flow: "Let connection be specific: remember a detail, offer a small kindness, make a little time. Care does not need a grand occasion to become visible.",
			focus: "Consider what you actually enjoy and what you have simply become used to. A clear preference gives someone else a fair chance to meet you.",
			friction: "A difference in preferences does not have to become a judgement about either person. Name what matters to you and stay curious about what matters to them."
		},
		Mars: {
			flow: "Use your energy on a step you can finish. A modest piece of progress can feel more satisfying than a dramatic plan with nowhere to begin.",
			focus: "Choose an intention before adding speed. You can be direct about what you want while remaining considerate about how you ask.",
			friction: "If effort is turning into frustration, change the size of the task. A smaller next step can protect your energy without abandoning your intention."
		},
		Jupiter: {
			flow: "Try a wider perspective without losing sight of the ground beneath it. One useful conversation or unfamiliar idea may be enough exploration for today.",
			focus: "Consider what growth would mean in practical terms. Choose a question you can investigate rather than a promise you have to live up to.",
			friction: "More is not always the same as better. Check whether an opportunity fits your actual capacity before giving it your time."
		},
		Saturn: {
			flow: "A little structure can make room for something you care about. Pick a boundary or routine that supports your day instead of filling every part of it.",
			focus: "Return to the foundations: time, agreements and a realistic next step. Consistency can be quiet and still count.",
			friction: "A limit may be information about your plan rather than your worth. Adjust the workload, ask for clarity or give a commitment more realistic edges."
		},
		Uranus: {
			flow: "There may be room to do a familiar thing differently. Keep the experiment small enough that curiosity does not need to become a complete reinvention.",
			focus: "Notice which defaults still serve you. You can question a habit without needing to overturn your whole life today.",
			friction: "When change feels noisy, keep one dependable point of reference. Freedom can include choosing a slower pace."
		},
		Neptune: {
			flow: "Make a little room for something without an immediate purpose: music, a sketch, a walk. Imagination is allowed to exist before it becomes a project.",
			focus: "Let an idea develop, then check the details you can check. Inspiration and discernment can work in the same room.",
			friction: "If a situation feels unclear, you can wait for more information. An unanswered question does not need to be filled with the most dramatic explanation."
		},
		Pluto: {
			flow: "A quieter kind of change may begin with an honest observation. Consider one pattern you would like to meet with more choice.",
			focus: "Notice where you have influence and where you do not. Put your next step in the part of the situation that belongs to you.",
			friction: "You can loosen your grip without giving up your boundaries. Choose one response that leaves more room for your own agency."
		}
	};
	const headlines = {
		gentle: {
			flow: "Let a little ease\nfind its way in.",
			focus: "Come back to\nwhat matters.",
			friction: "You can move slowly\nand still move."
		},
		direct: {
			flow: "Make room.\nThen make a move.",
			focus: "Less noise.\nMore intention.",
			friction: "Take a breath.\nChoose your next step."
		},
		playful: {
			flow: "Leave a little room\nfor the good bits.",
			focus: "Your attention called.\nIt wants a say.",
			friction: "The plot can wait.\nHave some water."
		}
	};
	const rituals = {
		flow: {
			lean: [
				"A generous question",
				"A small creative act",
				"An unhurried hello"
			],
			release: [
				"Performing certainty",
				"Filling every silence",
				"Saving joy for later"
			],
			prompt: "Where did you feel a little more like yourself today?"
		},
		focus: {
			lean: [
				"One clear priority",
				"A moment of stillness",
				"A kind boundary"
			],
			release: [
				"An unnecessary yes",
				"Someone else’s timetable",
				"The perfect first draft"
			],
			prompt: "What deserves your attention, and what can wait?"
		},
		friction: {
			lean: [
				"A slower response",
				"A smaller next step",
				"Asking for clarity"
			],
			release: [
				"Mind-reading",
				"Winning every point",
				"Doing everything at once"
			],
			prompt: "What would make your next step a little kinder to you?"
		}
	};
	function reading(event, tone = "gentle") {
		const kind = event?.kind || "focus", left = event?.left || "Sun", right = event?.right || "Sun";
		return {
			kind,
			topic: planets[left].topic,
			headline: (headlines[tone] || headlines.gentle)[kind],
			text: interpretations[left][kind],
			context: event ? `${left} ${event.verb} your natal ${right}` : "A moment for deliberate reflection",
			ritual: rituals[kind],
			prompt: rituals[kind].prompt
		};
	}
	function guide(topic, question, chart, daily) {
		const map = {
			self: ["Sun", "Moon"],
			connection: ["Venus", "Moon"],
			work: ["Saturn", "Mercury"],
			change: ["Uranus", "Mars"]
		};
		const choices = map[topic] || map.self;
		const event = daily.events.find((e) => choices.includes(e.left)) || daily.chosen[0];
		const r = reading(event), body = chart.bodies.find((b) => b.body === choices[0]);
		const prompts = {
			self: "What feels true for you, before you consider how it will look to anyone else?",
			connection: "What would a clear, kind request sound like in this situation?",
			work: "What is the smallest useful step you can actually finish?",
			change: "Which part of this change is yours to choose, and which part needs time?"
		};
		return {
			event,
			text: r.text,
			prompt: prompts[topic] || prompts.self,
			placement: body,
			question: question.slice(0, 500)
		};
	}
	return {
		signs,
		planets,
		houses,
		reading,
		guide
	};
}
var Content = create$1();
function create(C) {
	"use strict";
	const KEY = "aeon.private.v1";
	const sample = {
		id: "sample-maya",
		name: "Maya",
		birthDate: "1993-11-14",
		birthTime: "08:30",
		precision: "exact",
		place: {
			name: "Perth, Australia",
			lat: -31.9523,
			lng: 115.8613,
			zone: "Australia/Perth"
		},
		sample: true
	};
	const samplePerson = {
		id: "sample-alex",
		name: "Alex",
		birthDate: "1991-06-08",
		birthTime: "15:45",
		precision: "exact",
		place: {
			name: "Melbourne, Australia",
			lat: -37.8136,
			lng: 144.9631,
			zone: "Australia/Melbourne"
		},
		sample: true
	};
	function defaults() {
		let zone = "Australia/Perth";
		try {
			zone = Intl.DateTimeFormat().resolvedOptions().timeZone || zone;
		} catch {}
		return {
			schema: 1,
			profile: null,
			people: [],
			entries: [],
			bookmarks: [],
			prefs: {
				tone: "gentle",
				house: "porphyry",
				theme: "light",
				zone
			}
		};
	}
	function text(v, max, label, empty = false) {
		if (typeof v !== "string" || v.length > max || !empty && !v.trim()) throw Error(`Invalid ${label}.`);
		return v;
	}
	function id(v) {
		const s = text(v, 100, "record ID");
		if (!/^[a-zA-Z0-9_-]+$/.test(s)) throw Error("Invalid record ID.");
		return s;
	}
	function profile(p) {
		C.validateProfile(p, true);
		return {
			id: id(p.id),
			name: p.name.trim(),
			birthDate: p.birthDate,
			birthTime: p.precision === "unknown" ? "12:00" : p.birthTime,
			precision: p.precision,
			fold: p.fold ?? 0,
			place: {
				name: p.place.name,
				lat: p.place.lat,
				lng: p.place.lng,
				zone: p.place.zone
			},
			updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : null
		};
	}
	function normalize(raw) {
		if (!raw || raw.schema !== 1 || !Array.isArray(raw.people) || !Array.isArray(raw.entries) || !Array.isArray(raw.bookmarks) || !raw.prefs) throw Error("This is not an AEON v1 backup.");
		if (raw.people.length > 100 || raw.entries.length > 2e3 || raw.bookmarks.length > 2e3) throw Error("This backup contains too many records.");
		const p = raw.prefs;
		if (![
			"gentle",
			"direct",
			"playful"
		].includes(p.tone) || ![
			"porphyry",
			"whole",
			"equal"
		].includes(p.house) || ![
			"light",
			"dark",
			"system"
		].includes(p.theme) || !C.validZone(p.zone)) throw Error("Invalid reading preferences.");
		const entries = raw.entries.map((e) => {
			C.validateDate(e.date);
			return {
				id: id(e.id),
				date: e.date,
				text: text(e.text, 1e4, "reflection"),
				mood: text(e.mood || "Open", 30, "mood"),
				prompt: text(e.prompt || "", 500, "prompt", true),
				updatedAt: text(e.updatedAt || (/* @__PURE__ */ new Date()).toISOString(), 50, "timestamp")
			};
		});
		const bookmarks = raw.bookmarks.map((b) => {
			C.validateDate(b.date);
			return {
				id: id(b.id),
				date: b.date,
				name: text(b.name, 60, "chart name"),
				topic: text(b.topic, 100, "reading topic"),
				title: text(b.title, 300, "reading title"),
				text: text(b.text, 5e3, "reading"),
				context: text(b.context, 300, "reading context"),
				zone: text(b.zone, 100, "reading timezone"),
				engine: text(b.engine || C.VERSION, 150, "engine"),
				precision: text(b.precision || "exact", 30, "precision"),
				kind: [
					"flow",
					"focus",
					"friction"
				].includes(b.kind) ? b.kind : "focus",
				chartRevision: text(b.chartRevision || "", 1e3, "chart revision", true)
			};
		});
		const people = raw.people.map(profile);
		if (new Set(people.map((x) => x.id)).size !== people.length || new Set(entries.map((x) => x.id)).size !== entries.length || new Set(bookmarks.map((x) => x.id)).size !== bookmarks.length) throw Error("Duplicate record IDs in backup.");
		return {
			schema: 1,
			profile: raw.profile ? profile(raw.profile) : null,
			people,
			entries,
			bookmarks,
			prefs: {
				tone: p.tone,
				house: p.house,
				theme: p.theme,
				zone: p.zone
			}
		};
	}
	function load(storage) {
		try {
			const s = storage.getItem(KEY);
			return {
				state: s ? normalize(JSON.parse(s)) : defaults(),
				warning: null
			};
		} catch {
			return {
				state: defaults(),
				warning: "Saved data could not be loaded. Import a backup if you have one; export before clearing this browser."
			};
		}
	}
	function save(storage, state) {
		try {
			storage.setItem(KEY, JSON.stringify(normalize(state)));
			return true;
		} catch {
			return false;
		}
	}
	function backup(state) {
		return JSON.stringify({
			...normalize(state),
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			application: "AEON"
		}, null, 2);
	}
	return {
		KEY,
		sample,
		samplePerson,
		defaults,
		normalize,
		profile,
		load,
		save,
		backup
	};
}
var Store = create(Astro);
function createVisuals() {
	const root = { AeonAstro: Astro };
	const factory = function(root) {
		"use strict";
		const C = root.AeonAstro;
		const paths = {
			today: "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4\"/>",
			chart: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"4.5\"/><path d=\"M12 3v4.5m0 9V21M3 12h4.5m9 0H21M5.6 5.6l3.2 3.2m6.4 6.4 3.2 3.2M5.6 18.4l3.2-3.2m6.4-6.4 3.2-3.2\"/>",
			people: "<circle cx=\"9\" cy=\"8\" r=\"3\"/><path d=\"M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2\"/>",
			calendar: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 2v6m10-6v6M3 11h18m-13 4h1m6 0h1m-8 3h1\"/>",
			journal: "<path d=\"M5 3h14a1 1 0 0 1 1 1v17H6a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Zm1 0v15m-3 0h17M10 8h6m-6 4h6\"/>",
			arrow: "<path d=\"M4 12h16m-6-6 6 6-6 6\"/>",
			chevron: "<path d=\"m9 5 7 7-7 7\"/>",
			left: "<path d=\"m15 5-7 7 7 7\"/>",
			close: "<path d=\"m6 6 12 12M6 18 18 6\"/>",
			bookmark: "<path d=\"M6 3h12v18l-6-4-6 4Z\"/>",
			plus: "<path d=\"M12 4v16M4 12h16\"/>",
			lock: "<rect x=\"5\" y=\"10\" width=\"14\" height=\"11\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3m-4 5v2\"/>",
			settings: "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"m10 3-.5 3-3 1L4 5.5 2 9l2.5 2v3L2 16l2 3.5L6.5 18l3 1 .5 3h4l.5-3 3-1 2.5 1.5 2-3.5-2.5-2v-3L22 9l-2-3.5L17.5 7l-3-1L14 3Z\"/>",
			info: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v6m0-10v.2\"/>",
			download: "<path d=\"M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4\"/>",
			share: "<path d=\"M12 16V3M7 8l5-5 5 5M5 12v9h14v-9\"/>",
			check: "<path d=\"m5 12 4 4L19 6\"/>",
			trash: "<path d=\"M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7\"/>",
			edit: "<path d=\"m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z\"/>",
			spark: "<path d=\"m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z\"/>",
			night: "<path d=\"M20 15.5A8.5 8.5 0 1 1 8.5 4 6.8 6.8 0 0 0 20 15.5Z\"/>"
		};
		function esc(v) {
			return String(v ?? "").replace(/[&<>"']/g, (c) => ({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				"\"": "&quot;",
				"'": "&#39;"
			})[c]);
		}
		function icon(name) {
			return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
		}
		function moon(angle, size = 40) {
			const phase = C.mod(angle), a = phase > 180 ? 360 - phase : phase, rx = Math.max(.001, Math.abs(Math.cos(a * Math.PI / 180) * 18)), sweep = a < 90 ? 0 : 1;
			return `<svg class="moon" width="${size}" height="${size}" viewBox="-21 -21 42 42" aria-hidden="true"><circle r="18" fill="var(--sage-ink)" opacity=".19"/><g${phase > 180 ? " transform=\"scale(-1 1)\"" : ""}><path d="M0 -18 A18 18 0 0 1 0 18 A${rx.toFixed(4)} 18 0 0 ${sweep} 0 -18Z" fill="var(--sage-ink)" opacity=".8"/></g><circle r="18" fill="none" stroke="var(--sage-ink)" stroke-width=".5" opacity=".3"/></svg>`;
		}
		function celestial(angle) {
			return `<svg class="celestial" viewBox="0 0 400 400" fill="none" aria-hidden="true"><defs><radialGradient id="orb-glow"><stop stop-color="#e3c79f"/><stop offset=".65" stop-color="#d5b78c"/><stop offset="1" stop-color="#b89a74"/></radialGradient></defs><g stroke="#7f8b72" opacity=".35" stroke-width=".7"><circle cx="200" cy="200" r="152"/><circle cx="200" cy="200" r="170" stroke-dasharray="1 7"/><ellipse cx="200" cy="200" rx="185" ry="82" transform="rotate(-40 200 200)"/><ellipse cx="200" cy="200" rx="176" ry="114" transform="rotate(40 200 200)"/><path d="M200 16v368M16 200h368"/></g><circle cx="200" cy="200" r="92" fill="url(#orb-glow)"/><g stroke="#8d775c" opacity=".2" stroke-width=".5">${Array.from({ length: 17 }, (_, i) => `<path d="M${120 + i * 10} ${155 - Math.sin(i) * 10}q-30 55 0 90"/>`).join("")}</g><circle cx="200" cy="200" r="93" stroke="#9a8565" opacity=".4"/><g fill="#6a785b"><circle cx="78" cy="109" r="3.5"/><circle cx="338" cy="268" r="3"/><circle cx="246" cy="47" r="2"/></g><g stroke="#66765b" stroke-width="1"><path d="M310 94v14m-7-7h14M90 287v12m-6-6h12M283 337v8m-4-4h8"/></g><text x="200" y="206" text-anchor="middle" fill="#625641" font-family="Georgia,serif" font-size="22" opacity=".65">${C.GLYPHS[Math.floor(C.mod(angle) / 30)]}</text></svg>`;
		}
		function point(lon, r, asc) {
			const a = (180 - (lon - asc)) * Math.PI / 180;
			return {
				x: 260 + r * Math.cos(a),
				y: 260 + r * Math.sin(a)
			};
		}
		function wheel(chart) {
			const asc = chart.asc ?? 0, cusps = chart.cusps, lines = [], labels = [], ticks = [];
			for (let i = 0; i < 72; i++) {
				const a = point(i * 5, 225, asc), b = point(i * 5, i % 6 === 0 ? 211 : 219, asc);
				ticks.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="wheel-detail" opacity=".45" stroke-width=".6"/>`);
			}
			for (let i = 0; i < 12; i++) {
				const p = point(i * 30 + 15, 242, asc);
				labels.push(`<text x="${p.x}" y="${p.y + 5}" font-family="Georgia,serif" font-size="17" text-anchor="middle" class="wheel-sign">${C.GLYPHS[i]}</text>`);
			}
			if (cusps) for (let i = 0; i < 12; i++) {
				const a = point(cusps[i], 107, asc), b = point(cusps[i], 210, asc), p = point(cusps[i] + C.mod(cusps[(i + 1) % 12] - cusps[i]) / 2, 119, asc);
				lines.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="wheel-line" stroke-width="${i % 3 === 0 ? 1.5 : .7}"/><text x="${p.x}" y="${p.y + 3}" font-size="9" font-family="Arial,sans-serif" text-anchor="middle" class="wheel-sign">${i + 1}</text>`);
			}
			const asp = C.aspects(chart.bodies, chart.bodies, 3, true).slice(0, 13).map((e) => {
				const a = point(chart.bodies.find((b) => b.body === e.left).lon, 105, asc), b = point(chart.bodies.find((b) => b.body === e.right).lon, 105, asc);
				return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${e.kind === "flow" ? "#83937c" : e.kind === "focus" ? "#b68e60" : "#9e8bac"}" opacity=".42" stroke-width=".8"${e.kind === "focus" ? " stroke-dasharray=\"3 4\"" : ""}/>`;
			}).join("");
			const sorted = [...chart.bodies].sort((a, b) => a.lon - b.lon);
			const planets = sorted.map((b, i) => {
				const prev = sorted[(i + sorted.length - 1) % sorted.length], next = sorted[(i + 1) % sorted.length], r = C.distance(prev.lon, b.lon) < 12 || C.distance(next.lon, b.lon) < 12 ? 150 + i % 3 * 20 : 173, p = point(b.lon, r, asc), a = point(b.lon, 200, asc), z = point(b.lon, 208, asc);
				return `<line x1="${a.x}" y1="${a.y}" x2="${z.x}" y2="${z.y}" class="wheel-accent" stroke-width="1.3"/><text x="${p.x}" y="${p.y + 7}" font-family="Georgia,serif" font-size="23" text-anchor="middle">${C.SYMBOLS[b.body]}</text>`;
			}).join("");
			return `<svg class="chart-wheel" viewBox="0 0 520 520" role="img" aria-label="Tropical birth chart. All placements are also available in the adjacent table."><circle cx="260" cy="260" r="257" fill="none" class="wheel-line"/><circle cx="260" cy="260" r="225" fill="none" class="wheel-line"/><circle cx="260" cy="260" r="210" fill="none" class="wheel-line"/><circle cx="260" cy="260" r="107" fill="none" class="wheel-line"/>${ticks.join("")}${labels.join("")}${lines.join("")}${asp}${planets}${chart.asc != null ? "<text x=\"28\" y=\"264\" font-size=\"8\" class=\"wheel-sign\" font-family=\"Arial,sans-serif\">ASC</text>" : ""}<circle cx="260" cy="260" r="22" fill="var(--surface)"/><text x="260" y="267" font-size="23" text-anchor="middle" fill="var(--gold)">✳</text></svg>`;
		}
		function dateLabel(key, options = {
			day: "numeric",
			month: "long",
			year: "numeric"
		}) {
			return new Intl.DateTimeFormat("en-AU", {
				...options,
				timeZone: "UTC"
			}).format(/* @__PURE__ */ new Date(key + "T12:00:00Z"));
		}
		function offset(n) {
			const s = n < 0 ? "−" : "+";
			n = Math.abs(n);
			return `UTC${s}${String(Math.floor(n / 60)).padStart(2, "0")}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
		}
		root.AeonUI = {
			esc,
			icon,
			moon,
			celestial,
			wheel,
			dateLabel,
			offset
		};
	};
	factory(root);
	return root.AeonUI;
}
var UI = createVisuals();
function Icon({ name }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		style: { display: "contents" },
		dangerouslySetInnerHTML: { __html: UI.icon(name) }
	});
}
function Svg({ html }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		style: { display: "contents" },
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: html }
	});
}
function KindPill({ kind }) {
	const label = kind === "flow" ? "Flow" : kind === "friction" ? "Friction" : "Focus";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `kind ${kind}`,
		children: label
	});
}
function uid() {
	return crypto.randomUUID?.() || "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}
function hash(s) {
	let n = 2166136261;
	for (let i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
	return (n >>> 0).toString(36);
}
function download(content, type, filename) {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.append(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function Modal({ title, eyebrow = "A LITTLE PERSPECTIVE", sheet = false, onClose, children }) {
	const ref = (0, import_react.useRef)(null);
	const closeRef = (0, import_react.useRef)(onClose);
	closeRef.current = onClose;
	(0, import_react.useEffect)(() => {
		const prev = document.activeElement;
		document.body.style.overflow = "hidden";
		ref.current?.focus();
		const onKey = (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				closeRef.current();
				return;
			}
			if (event.key !== "Tab") return;
			const modal = ref.current;
			if (!modal) return;
			const nodes = [...modal.querySelectorAll("a[href],button,input,textarea,select,[tabindex='0']")].filter((el) => !el.hasAttribute("disabled") && !el.hidden && !el.closest("[hidden],.hidden"));
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "modal-backdrop",
		onClick: (event) => {
			if (event.target === event.currentTarget) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			ref,
			className: `modal${sheet ? " sheet" : ""}`,
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "modal-title",
			tabIndex: -1,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "modal-top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow",
					children: eyebrow
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "modal-title",
					children: title
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "modal-close",
					type: "button",
					"aria-label": "Close dialog",
					onClick: onClose,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "close" })
				})]
			}), children]
		})
	});
}
var ZONES = [
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
	"UTC"
];
function norm(s) {
	return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function ProfileForm({ kind, existing, cities, cityStatus, onSave, onClose }) {
	const precision0 = existing?.precision || "unknown";
	const [precision, setPrecision] = (0, import_react.useState)(precision0);
	const [custom, setCustom] = (0, import_react.useState)(false);
	const [city, setCity] = (0, import_react.useState)(existing?.place?.name || "");
	const [matches, setMatches] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)(existing?.place ? { ...existing.place } : null);
	const [placeNote, setPlaceNote] = (0, import_react.useState)(existing?.place ? `${existing.place.zone} · ${existing.place.lat.toFixed(3)}°, ${existing.place.lng.toFixed(3)}°` : "");
	const [ambiguous, setAmbiguous] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const listRef = (0, import_react.useRef)(null);
	function search(value) {
		const query = norm(value);
		const tokens = query.split(/[\s,]+/).filter(Boolean);
		if (query.length < 2) {
			setMatches([]);
			return;
		}
		const found = cities.filter((c) => tokens.every((t) => (c.searchKey || norm(`${c.name} ${c.ascii || ""} ${c.region || ""} ${c.country}`)).includes(t))).sort((a, b) => Number(norm(b.name).startsWith(query)) - Number(norm(a.name).startsWith(query)) || (b.pop || 0) - (a.pop || 0)).slice(0, 24).filter((c) => Astro.validZone(c.zone)).slice(0, 8);
		setMatches(found);
	}
	function choose(c) {
		const place = {
			name: [
				c.name,
				c.region,
				c.country
			].filter(Boolean).join(", "),
			lat: c.lat,
			lng: c.lng,
			zone: c.zone
		};
		setSelected(place);
		setCity(place.name);
		setPlaceNote(`${c.zone} · ${c.lat.toFixed(3)}°, ${c.lng.toFixed(3)}°`);
		setMatches([]);
		setAmbiguous(null);
		const zone = document.getElementById("birth-zone");
		const lat = document.getElementById("birth-lat");
		const lng = document.getElementById("birth-lng");
		if (zone) zone.value = c.zone;
		if (lat) lat.value = String(c.lat);
		if (lng) lng.value = String(c.lng);
	}
	function submit(event) {
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
					zone: String(data.get("zone") || "").trim()
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
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
	const help = cityStatus === "ready" ? "Search covers cities of 15,000 people or more. For a smaller place, enter coordinates and a timezone below." : cityStatus === "error" ? "City search is unavailable. Enter custom coordinates and timezone below." : "Loading city search. You can also enter coordinates below.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "modal-copy",
		style: { marginBottom: 22 },
		children: kind === "owner" ? "A date, a place, a moment. Your chart is calculated here on your device." : "Save an adult’s chart with their permission. It stays private in this browser."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		id: "profile-form",
		onSubmit: submit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "profile-name",
					children: kind === "owner" ? "What should we call you?" : "Their name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "profile-name",
					name: "name",
					required: true,
					maxLength: 60,
					autoComplete: "off",
					placeholder: "A name that feels like you",
					defaultValue: existing?.name || ""
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "birth-date",
						children: "Birth date"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "birth-date",
						name: "birthDate",
						type: "date",
						min: "1900-01-01",
						max: Astro.dateKey(/* @__PURE__ */ new Date()),
						required: true,
						defaultValue: existing?.birthDate || "",
						onChange: () => setAmbiguous(null)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "time-precision",
						children: "How well do you know the time?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						name: "precision",
						id: "time-precision",
						value: precision,
						onChange: (event) => {
							setPrecision(event.target.value);
							setAmbiguous(null);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "exact",
								children: "I know the time"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "approximate",
								children: "Within about an hour"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "unknown",
								children: "I don’t know"
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "field",
				id: "birth-time-field",
				hidden: precision === "unknown",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "birth-time",
						children: "Local birth time"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "birth-time",
						name: "birthTime",
						type: "time",
						defaultValue: existing?.birthTime && existing?.precision !== "unknown" ? existing.birthTime : "",
						disabled: precision === "unknown",
						required: precision !== "unknown",
						onChange: () => setAmbiguous(null)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Approximate times use a ±1 hour range. Unknown times leave rising and houses unassigned." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "field",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "birth-city",
						children: "Birthplace"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "birth-city",
						name: "city",
						autoComplete: "off",
						maxLength: 150,
						placeholder: "Search a city, region or country…",
						value: city,
						role: "combobox",
						"aria-autocomplete": "list",
						"aria-controls": "city-results",
						"aria-expanded": matches.length > 0,
						onChange: (event) => {
							setCity(event.target.value);
							setSelected(null);
							setPlaceNote("Choose a matching city below.");
							search(event.target.value);
							setAmbiguous(null);
						},
						onKeyDown: (event) => {
							if (event.key === "ArrowDown") {
								event.preventDefault();
								listRef.current?.querySelector("[data-city-index]")?.focus();
							}
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: "city-results",
						className: "city-results",
						role: "listbox",
						"aria-label": "Matching cities",
						ref: listRef,
						children: matches.length ? matches.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "city-option",
							"data-city-index": i,
							role: "option",
							"aria-selected": "false",
							onClick: () => choose(c),
							onKeyDown: (event) => {
								if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
								event.preventDefault();
								const options = [...listRef.current?.querySelectorAll("[data-city-index]") || []];
								options[(options.indexOf(event.currentTarget) + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length]?.focus();
							},
							children: [c.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								[c.region, c.country].filter(Boolean).join(", "),
								" · ",
								c.zone
							] })]
						}, `${c.name}-${c.lat}-${c.lng}-${i}`)) : city.trim().length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "city-option muted",
							children: "No city of 15,000 people or more matches. Smaller places are not in this list. Tick custom coordinates and add the latitude, longitude, and timezone."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
						id: "city-help",
						children: help
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "selected-place",
						children: placeNote
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "check-label",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						id: "custom-location",
						name: "custom",
						checked: custom,
						onChange: (event) => {
							setCustom(event.target.checked);
							setAmbiguous(null);
						}
					}),
					" ",
					"Enter custom coordinates and timezone"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id: "custom-fields",
				className: custom ? "" : "hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "form-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "birth-lat",
							children: "Latitude"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "birth-lat",
							name: "lat",
							type: "number",
							step: "any",
							min: -89.8,
							max: 89.8,
							defaultValue: existing?.place?.lat ?? "",
							placeholder: "−31.9523",
							required: custom
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "birth-lng",
							children: "Longitude"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "birth-lng",
							name: "lng",
							type: "number",
							step: "any",
							min: -180,
							max: 180,
							defaultValue: existing?.place?.lng ?? "",
							placeholder: "115.8613",
							required: custom
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "birth-zone",
							children: "Birthplace IANA timezone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "birth-zone",
							name: "zone",
							defaultValue: existing?.place?.zone || "",
							maxLength: 100,
							placeholder: "Australia/Perth",
							required: custom,
							list: "birth-zone-options",
							onChange: () => setAmbiguous(null)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
							id: "birth-zone-options",
							children: ZONES.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: zone }, zone))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Use the timezone of the birthplace, not your current location. East/north coordinates are positive." })
					]
				})]
			}),
			ambiguous && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id: "ambiguous-time",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "notice",
					children: "The clocks repeated this local time. Choose the recorded offset."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "fold-offset",
						children: "Which occurrence?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "fold-offset",
						name: "fold",
						required: true,
						defaultValue: "",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Choose an offset"
						}), ambiguous.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: i,
							children: [
								UI.offset(item.offsetMinutes),
								" · ",
								i === 0 ? "first" : "second",
								" occurrence"
							]
						}, item.iso))]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "check-label",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						required: true,
						name: "adult"
					}),
					" ",
					kind === "owner" ? "I am aged 18 or over." : "This person is aged 18 or over, and I have permission to save these details."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "profile-error",
				className: "form-error",
				role: "alert",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "modal-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "button",
					type: "submit",
					children: [
						existing ? "Update chart" : "Create the chart",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "text-button",
					type: "button",
					onClick: onClose,
					children: "Keep exploring"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "calculation-note",
				children: "City-centre coordinates are estimates. Timezone history before 1970 may be uncertain; custom coordinates do not resolve every historical clock ambiguity."
			})
		]
	})] });
}
function ZoneField({ zone, onSave }) {
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		id: "timezone-form",
		onSubmit: (event) => {
			event.preventDefault();
			const form = event.currentTarget;
			if (!form.reportValidity()) return;
			const message = onSave(String(new FormData(form).get("zone") || "").trim());
			setError(message || "");
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "field",
				style: { marginTop: 22 },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "reading-zone",
						children: "Reading timezone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "reading-zone",
						name: "zone",
						defaultValue: zone,
						maxLength: 100,
						required: true,
						list: "timezone-options"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
						id: "timezone-options",
						children: ZONES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: item }, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Daily snapshots use noon here. Your birth timezone stays separate." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "timezone-error",
				className: "form-error",
				role: "alert",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button secondary",
				type: "submit",
				children: "Update timezone"
			})
		]
	});
}
var PAGES = [
	"today",
	"chart",
	"connections",
	"almanac",
	"journal"
];
var MOODS = [
	"Open",
	"Grounded",
	"Restless",
	"Hopeful",
	"Reflective"
];
var NAV = [
	[
		"today",
		"today",
		"Today"
	],
	[
		"chart",
		"chart",
		"Your chart"
	],
	[
		"connections",
		"people",
		"Connections"
	],
	[
		"almanac",
		"calendar",
		"Almanac"
	],
	[
		"journal",
		"journal",
		"Journal"
	]
];
function houseName(house) {
	return {
		porphyry: "Porphyry",
		whole: "Whole Sign",
		equal: "Equal"
	}[house] || house;
}
function applyTheme(theme) {
	const mode = theme === "system" ? window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light" : theme === "dark" ? "dark" : "light";
	document.documentElement.dataset.theme = mode;
	document.body.dataset.theme = mode;
	document.querySelector("meta[name=\"theme-color\"]")?.setAttribute("content", mode === "dark" ? "#202722" : "#f5f2eb");
}
function snapshotOf(event, state, owner, day) {
	const reading = Content.reading(event, state.prefs.tone);
	const revision = JSON.stringify({
		birthDate: owner.birthDate,
		birthTime: owner.birthTime,
		place: owner.place,
		precision: owner.precision,
		fold: owner.fold || 0,
		house: state.prefs.house
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
		chartRevision: revision
	};
}
function AeonApp({ initialIso, initialZone }) {
	const boot = (0, import_react.useState)(() => {
		const state = Store.defaults();
		const zone = Astro.validZone(initialZone) ? initialZone : "Australia/Perth";
		state.prefs = {
			...state.prefs,
			zone,
			theme: "light"
		};
		return {
			state,
			warning: null,
			day: Astro.dateKey(new Date(initialIso), zone),
			page: "today"
		};
	})[0];
	const [booted, setBooted] = (0, import_react.useState)(false);
	const [state, setState] = (0, import_react.useState)(boot.state);
	const [warning, setWarning] = (0, import_react.useState)(boot.warning);
	const [storageOk, setStorageOk] = (0, import_react.useState)(true);
	const [page, setPage] = (0, import_react.useState)(boot.page);
	const [day, setDay] = (0, import_react.useState)(boot.day);
	const [month, setMonth] = (0, import_react.useState)(boot.day.slice(0, 7));
	const [personId, setPersonId] = (0, import_react.useState)(null);
	const [journalTab, setJournalTab] = (0, import_react.useState)("entries");
	const [editEntry, setEditEntry] = (0, import_react.useState)(null);
	const [prompt, setPrompt] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)(null);
	const [edits, setEdits] = (0, import_react.useState)({});
	const [journalError, setJournalError] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [cities, setCities] = (0, import_react.useState)([]);
	const [cityStatus, setCityStatus] = (0, import_react.useState)("loading");
	const [modal, setModal] = (0, import_react.useState)(null);
	const [toastMsg, setToastMsg] = (0, import_react.useState)(null);
	const [systemDark, setSystemDark] = (0, import_react.useState)(false);
	const pending = (0, import_react.useRef)(null);
	const toastTimer = (0, import_react.useRef)(void 0);
	const owner = state.profile || Store.sample;
	const natal = (0, import_react.useMemo)(() => Astro.chart(owner, state.prefs.house), [owner, state.prefs.house]);
	const wheelHtml = (0, import_react.useMemo)(() => UI.wheel(natal), [natal]);
	const sky = (0, import_react.useMemo)(() => {
		try {
			return Astro.daily(natal, day, state.prefs.zone);
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "This day could not be calculated.",
				chosen: [],
				events: [],
				positions: natal.bodies
			};
		}
	}, [
		natal,
		day,
		state.prefs.zone
	]);
	function toast(message) {
		setToastMsg(message);
		window.clearTimeout(toastTimer.current);
		toastTimer.current = window.setTimeout(() => setToastMsg(null), 4e3);
	}
	function commit(next, message) {
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
	function navigate(next) {
		closeModal();
		setPage(next);
		if (location.hash.slice(1) !== next) location.hash = next;
		window.scrollTo({ top: 0 });
		document.getElementById("main")?.focus({ preventScroll: true });
	}
	function confirm(title, message, action, back = null) {
		pending.current = action;
		setModal({
			type: "confirm",
			title,
			message,
			back
		});
	}
	function dismissConfirm() {
		const back = modal?.back ?? null;
		pending.current = null;
		setModal(back);
	}
	(0, import_react.useLayoutEffect)(() => {
		const loaded = Store.load(localStorage);
		const hashPage = location.hash.slice(1);
		const today = Astro.dateKey(/* @__PURE__ */ new Date(), loaded.state.prefs.zone);
		applyTheme(loaded.state.prefs.theme);
		setState(loaded.state);
		setWarning(loaded.warning);
		setPage(PAGES.includes(hashPage) ? hashPage : "today");
		setDay(today);
		setMonth(today.slice(0, 7));
		setSystemDark(!!window.matchMedia?.("(prefers-color-scheme: dark)").matches);
		setBooted(true);
	}, []);
	(0, import_react.useLayoutEffect)(() => {
		if (!booted) return;
		applyTheme(state.prefs.theme);
	}, [
		state.prefs.theme,
		systemDark,
		booted
	]);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia?.("(prefers-color-scheme: dark)");
		if (!media) return;
		const onChange = () => setSystemDark(media.matches);
		media.addEventListener?.("change", onChange);
		return () => media.removeEventListener?.("change", onChange);
	}, []);
	(0, import_react.useEffect)(() => {
		document.title = `${{
			today: "Today",
			chart: "Your chart",
			connections: "Connections",
			almanac: "Almanac",
			journal: "Journal"
		}[page]} · AEON`;
	}, [page]);
	(0, import_react.useEffect)(() => {
		const onHash = () => {
			const next = location.hash.slice(1);
			if (PAGES.includes(next) && next !== page) {
				pending.current = null;
				setModal(null);
				setPage(next);
			}
		};
		window.addEventListener("hashchange", onHash);
		return () => window.removeEventListener("hashchange", onHash);
	}, [page]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		fetch("/data/cities.json").then((response) => {
			if (!response.ok) throw Error("City list unavailable");
			return response.json();
		}).then((rows) => {
			if (cancelled) return;
			setCities(rows.map((city) => ({
				...city,
				searchKey: [
					city.name,
					city.ascii || "",
					city.region || "",
					city.country
				].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
			})));
			setCityStatus("ready");
		}).catch(() => {
			if (!cancelled) setCityStatus("error");
		});
		return () => {
			cancelled = true;
		};
	}, []);
	function shiftDay(amount) {
		try {
			const key = Astro.addDays(day, amount);
			Astro.validateDate(key);
			setDay(key);
		} catch (error) {
			toast(error instanceof Error ? error.message : "That date is outside the almanac.");
		}
	}
	function shiftMonth(amount) {
		const [year, mon] = month.split("-").map(Number);
		const date = new Date(Date.UTC(year, mon - 1 + amount, 1));
		if (date.getUTCFullYear() < 1900 || date.getUTCFullYear() > 2100) {
			toast("The almanac covers 1900–2100.");
			return;
		}
		setMonth(date.toISOString().slice(0, 7));
	}
	function goToday() {
		const today = Astro.dateKey(/* @__PURE__ */ new Date(), state.prefs.zone);
		setDay(today);
	}
	function updatePrefs(partial) {
		commit({
			...state,
			prefs: {
				...state.prefs,
				...partial
			}
		});
	}
	const appearance = state.prefs.theme === "dark" || state.prefs.theme === "system" && systemDark ? "dark" : "light";
	function toggleTheme() {
		updatePrefs({ theme: appearance === "dark" ? "light" : "dark" });
	}
	function savedId(id) {
		return state.bookmarks.some((bookmark) => bookmark.id === id);
	}
	function toggleSave(key) {
		const snap = snapshotOf(key === "main" ? sky.chosen[0] : sky.events.find((item) => item.id === key), state, owner, day);
		const exists = state.bookmarks.some((bookmark) => bookmark.id === snap.id);
		if (!exists && state.bookmarks.length >= 2e3) {
			toast("Export a backup and make room before saving more readings.");
			return;
		}
		const bookmarks = exists ? state.bookmarks.filter((bookmark) => bookmark.id !== snap.id) : [...state.bookmarks, snap];
		const ok = commit({
			...state,
			bookmarks
		});
		toast(exists ? "Reading removed from Saved." : ok ? "Reading saved exactly as you read it." : "Reading saved for this session. Export a backup to keep it.");
	}
	function reflect(nextPrompt) {
		const reading = Content.reading(sky.chosen?.[0], state.prefs.tone);
		setEditEntry(null);
		setPrompt(nextPrompt || reading.prompt);
		setJournalTab("entries");
		navigate("journal");
		window.setTimeout(() => document.getElementById("journal-text")?.focus(), 40);
	}
	function writeComposer(partial) {
		if (editEntry) {
			const currentEntry = state.entries.find((item) => item.id === editEntry);
			if (!currentEntry) return;
			setEdits((prev) => {
				const current = prev[editEntry] || {
					text: currentEntry.text,
					date: currentEntry.date,
					mood: currentEntry.mood || "Open"
				};
				return {
					...prev,
					[editEntry]: {
						...current,
						...partial
					}
				};
			});
			return;
		}
		setNote((prev) => ({
			...prev || {
				text: "",
				date: day,
				mood: "Open"
			},
			...partial
		}));
	}
	function saveProfile(profile, kind) {
		if (kind === "owner") {
			const ok = commit({
				...state,
				profile
			});
			closeModal();
			toast(ok ? "Your chart is ready." : "Your chart is ready for this session. Export a backup to keep it.");
			return;
		}
		const people = [...state.people];
		const index = people.findIndex((person) => person.id === profile.id);
		if (index >= 0) people[index] = profile;
		else people.push(profile);
		const ok = commit({
			...state,
			people
		});
		setPersonId(profile.id);
		navigate("connections");
		toast(ok ? "Your chart is ready." : "Your chart is ready for this session. Export a backup to keep it.");
	}
	const people = state.people.length ? state.people : [Store.samplePerson];
	const person = people.find((item) => item.id === personId) || people[0];
	const now = booted ? /* @__PURE__ */ new Date() : new Date(initialIso);
	const todayKey = Astro.dateKey(now, state.prefs.zone);
	const nowMoon = Astro.moon(now);
	const lead = sky.chosen?.[0];
	const leadReading = Content.reading(lead, state.prefs.tone);
	const sunNow = sky.positions?.find((body) => body.body === "Sun");
	function dateNav() {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "date-nav",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "circle-button",
					type: "button",
					"aria-label": "Previous day",
					onClick: () => shiftDay(-1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "left" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "date-text",
					children: UI.dateLabel(day, {
						day: "numeric",
						month: "short"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "circle-button",
					type: "button",
					"aria-label": "Next day",
					onClick: () => shiftDay(1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "chevron" })
				}),
				day !== todayKey && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "today-link",
					type: "button",
					onClick: goToday,
					children: "Today"
				})
			]
		});
	}
	function todayPage() {
		const ritual = leadReading.ritual;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "page-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow",
					children: "YOUR DAILY PERSPECTIVE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "A little closer to yourself." })] }), dateNav()]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "greeting",
				children: [
					"Your day, ",
					owner.name,
					". ",
					UI.dateLabel(day, {
						day: "numeric",
						month: "long"
					}),
					"."
				]
			}),
			sky.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "notice",
				children: sky.error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "hero",
				"aria-label": "Your daily reading",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-copy",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "eyebrow",
								children: ["A MOMENT OF ", leadReading.kind === "flow" ? "POSSIBILITY" : leadReading.kind === "friction" ? "PERSPECTIVE" : "INTENTION"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: leadReading.headline }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "hero-description",
								children: [leadReading.text.split(". ")[0], "."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hero-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "button",
									type: "button",
									onClick: () => setModal({
										type: "reading",
										id: "main"
									}),
									children: ["Your daily reading ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "text-button",
									type: "button",
									onClick: () => setModal({
										type: "reading",
										id: "main"
									}),
									children: ["Why this reading? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "info" })]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-art",
						children: [sunNow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Svg, { html: UI.celestial(sunNow.lon) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "orb-caption",
							children: ["SUN IN ", sunNow ? Astro.SIGNS[sunNow.sign].toUpperCase() : ""]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hero-index",
						children: [
							day.slice(-2),
							" / ",
							day.slice(5, 7)
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "section-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Where energy meets intention." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "caps",
					children: "YOUR SKY, IN CONTEXT"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid-three",
				"aria-label": "Your transit insights",
				children: sky.chosen?.length ? sky.chosen.map((event) => {
					const reading = Content.reading(event, state.prefs.tone);
					const kept = savedId(snapshotOf(event, state, owner, day).id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "insight-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-top",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "topic-glyph",
									"aria-hidden": "true",
									children: Astro.SYMBOLS[event.left]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindPill, { kind: reading.kind })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: reading.topic }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: reading.text }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "card-open",
								type: "button",
								"aria-label": `Read ${reading.topic}`,
								onClick: () => setModal({
									type: "reading",
									id: event.id
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-footer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									event.left,
									" ",
									event.verb,
									" ",
									event.right,
									" · ",
									event.orb.toFixed(1),
									"° orb"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: `icon-button${kept ? " saved" : ""}`,
									type: "button",
									"aria-label": `${kept ? "Unsave" : "Save"} ${reading.topic}`,
									"aria-pressed": kept,
									onClick: () => toggleSave(event.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "bookmark" })
								})]
							})
						]
					}, event.id);
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "notice neutral",
					children: "No close major transits at this snapshot. Your reflection above is a general prompt."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "lower-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rituals",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mini-heading",
						children: "Small things. A little more space."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ritual-cols",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "eyebrow",
							children: "LEAN INTO"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: ritual.lean.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+" }), item] }, item)) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "release",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "eyebrow",
								children: "LET GO OF"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: ritual.release.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "−" }), item] }, item)) })]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "reflection-invite",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "eyebrow",
							children: "A QUESTION TO SIT WITH"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: leadReading.prompt }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "text-button",
							type: "button",
							onClick: () => reflect(),
							children: ["Make a little room to reflect ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "privacy-line",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "lock" }), "Your chart and reflections stay in this browser. Export a backup in Settings."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "calculation-note",
				children: [
					owner.sample ? "Exploring a fictional sample chart. Make it yours above. · " : "",
					"Reading snapshot: ",
					UI.dateLabel(day, {
						day: "numeric",
						month: "short",
						year: "numeric"
					}),
					", 12:00 in ",
					state.prefs.zone,
					". Original interpretations selected from calculated transits.",
					owner.precision !== "exact" ? " Birth-time uncertainty affects these estimates." : ""
				]
			})
		] });
	}
	function chartPage() {
		const balance = {
			Fire: 0,
			Earth: 0,
			Air: 0,
			Water: 0
		};
		natal.bodies.forEach((body) => {
			if (body.signs.length === 1) balance[Content.signs[body.sign].element] += 1;
		});
		const signText = (body) => body.signs.map((index) => Astro.SIGNS[index]).join(" / ");
		const aspects = Astro.aspects(natal.bodies, natal.bodies, 6, true).slice(0, 8);
		const cards = [
			[
				"Sun",
				"YOUR SUN",
				signText(natal.bodies[0]),
				Astro.SYMBOLS.Sun,
				"Your sense of self"
			],
			[
				"Moon",
				"YOUR MOON",
				signText(natal.bodies[1]),
				Astro.SYMBOLS.Moon,
				"Your inner weather"
			],
			[
				"Ascendant",
				"YOUR RISING",
				natal.asc == null ? "Time unknown" : Astro.SIGNS[Math.floor(natal.asc / 30)],
				"↗",
				"How you meet the world"
			]
		];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "page-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow",
						children: "THE SKY THAT STARTED YOUR STORY"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "A map of your beginnings." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "intro",
						children: "A planet is the topic. A sign is the style it uses. A house is the area of life it lands in. You decide what fits."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "text-button",
					type: "button",
					onClick: () => setModal({
						type: "profile",
						kind: "owner",
						id: null
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "edit" }), " Edit details"]
				})]
			}),
			natal.precision !== "exact" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "notice",
				children: natal.precision === "unknown" ? "Birth time unknown: placements use local noon as a reference. Possible sign changes are shown. Rising sign and houses are withheld." : "Approximate time: the chart uses your entered time with a ±1 hour uncertainty range. Rising and house positions are indicative; sign changes are shown."
			}),
			natal.precision !== "unknown" && !natal.cusps && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "notice",
				children: "Porphyry houses are unavailable at this latitude. Select Whole Sign or Equal houses, or explore planetary placements alone."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "big-three",
				"aria-label": "Your sun, moon and rising signs",
				children: cards.map(([body, label, value, glyph, sub]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setModal({
						type: "planet",
						body
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "big-symbol",
						children: glyph
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "serif",
							children: value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: sub })
					] })]
				}, body))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "chart-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "chart-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "controls-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eyebrow",
								children: "YOUR NATAL CHART"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "House system"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select-quiet",
								value: state.prefs.house,
								onChange: (event) => updatePrefs({ house: event.target.value }),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "porphyry",
										children: "Porphyry"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "whole",
										children: "Whole Sign"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "equal",
										children: "Equal"
									})
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Svg, { html: wheelHtml }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "chart-meta",
							children: [
								UI.dateLabel(owner.birthDate),
								" · ",
								owner.precision === "unknown" ? "Time unknown" : owner.birthTime,
								owner.precision === "approximate" ? " (approximate)" : "",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								owner.place.name,
								" · ",
								UI.offset(natal.offset)
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "placements",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", { children: "Your placements" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									children: "PLANET"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									children: "SIGN"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									children: "POSITION"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									children: "HOUSE"
								})
							] }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: natal.bodies.map((body) => {
								const position = Astro.positionLabel(body.lon);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "planet-name",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setModal({
												type: "planet",
												body: body.body
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"aria-hidden": "true",
													children: Astro.SYMBOLS[body.body]
												}),
												body.body,
												body.retrograde && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sup", {
													className: "retro",
													title: "Retrograde",
													children: "R"
												})
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: signText(body) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [natal.precision !== "exact" ? "≈ " : "", position.degree] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: body.house || "—" })
								] }, body.body);
							}) })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "calculation-note",
						children: [
							"Tropical · geocentric · ",
							houseName(state.prefs.house),
							" houses.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Positions calculated with Astronomy Engine 2.1.19. ",
							natal.precision !== "exact" ? "Approximate positions are marked ≈. " : "",
							"Open a planet for the plain-language reading."
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "section-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "In plain words." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "caps",
					children: "HOW TO READ A PLACEMENT"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "plain-reading",
				"aria-label": "Your placements in plain words",
				children: natal.bodies.map((body) => {
					const planet = Content.planets[body.body];
					const house = body.house ? Content.houses[body.house - 1] : null;
					const signNames = body.signs.map((index) => Astro.SIGNS[index]).join(" / ");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setModal({
								type: "planet",
								body: body.body
							}),
							children: [
								Astro.SYMBOLS[body.body],
								" ",
								body.body,
								" · ",
								signNames,
								house ? ` · house ${body.house}` : ""
							]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: planet.text }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: body.signs.map((index) => `${Astro.SIGNS[index]} is the style. ${Content.signs[index].text}`).join(" ") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: house ? `House ${body.house} is ${house.name.toLowerCase()}. ${house.plain} ${house.ask}` : "The house, the area of life, needs a reliable birth time. Until then this is a topic and a style, not a department of your life." })
					] }, body.body);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "section-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "The twelve houses." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "caps",
					children: "AREAS OF LIFE, NOT A SCORE"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "house-key",
				children: Content.houses.map((house, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
						index + 1,
						". ",
						house.name,
						"."
					] }),
					" ",
					house.plain
				] }, house.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "element-row",
				"aria-label": "Element counts",
				children: Object.entries(balance).map(([element, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "element",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label",
							children: element
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "serif",
							children: [count, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
								className: "small muted",
								children: " / 10"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "element-bar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${count * 10}%` } })
						})
					]
				}, element))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "calculation-note",
				children: "Fire starts, earth steadies, air thinks, water feels. This is a count of the ten planets, not a personality score. Uncertain signs are left out."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "section-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "The conversation within." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "caps",
					children: "CLOSE NATAL ASPECTS"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "panel aspect-list",
				children: aspects.length ? aspects.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "aspect-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						Astro.SYMBOLS[event.left],
						" ",
						event.left,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: event.verb }),
						" ",
						Astro.SYMBOLS[event.right],
						" ",
						event.right
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [event.orb.toFixed(2), "° orb"] })]
				}, event.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "small muted",
					children: "No close major aspects available with these settings."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "calculation-note",
				children: "Aspect windows here use a 6° maximum orb. Your daily readings use a narrower 2.5° window. Exact positions and narratives can differ from other astrology apps."
			})
		] });
	}
	function connectionsPage() {
		const theirs = Astro.chart(person, state.prefs.house);
		const compare = Astro.aspects(natal.bodies, theirs.bodies, 4);
		const counts = {
			flow: 0,
			focus: 0,
			friction: 0
		};
		compare.forEach((event) => {
			counts[event.kind] += 1;
		});
		const chosen = [];
		for (const kind of [
			"flow",
			"focus",
			"friction"
		]) {
			const event = compare.find((item) => item.kind === kind);
			if (event) chosen.push(event);
		}
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "page-heading",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow",
						children: "TWO SKIES. A LITTLE UNDERSTANDING."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Make room for each other." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "intro",
						children: "Explore the meeting points between two charts, with curiosity instead of a verdict."
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "notice neutral",
				children: ["These are private saved charts, not connected accounts. No one is notified. ", person.sample ? "Alex is a fictional sample you can explore." : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "connections-layout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "connections-sidebar",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "button",
							type: "button",
							onClick: () => setModal({
								type: "profile",
								kind: "person",
								id: null
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "plus" }), " Add a chart"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "section-head",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eyebrow",
								children: "CHARTS YOU KEEP"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "people-list",
							children: people.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `person-card${person.id === item.id ? " active" : ""}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "avatar",
										children: item.name[0]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "serif",
										children: item.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "small",
										children: item.sample ? "FICTIONAL SAMPLE" : UI.dateLabel(item.birthDate, {
											day: "numeric",
											month: "short"
										})
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": `Compare with ${item.name}`,
										onClick: () => setPersonId(item.id)
									}),
									!item.sample && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "icon-button",
										type: "button",
										"aria-label": `Delete ${item.name}’s chart`,
										onClick: () => confirm("Remove this saved chart?", `${item.name}’s birth details will be removed from this browser.`, () => {
											commit({
												...state,
												people: state.people.filter((person) => person.id !== item.id)
											});
											setPersonId(null);
											toast("Saved chart removed.");
										}),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "close" })
									})
								]
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "calculation-note",
							children: "Save another adult’s details with their permission. Comparisons stay on this device."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "comparison-header",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "avatar",
									children: owner.name[0]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pair-plus",
									children: "✳"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "avatar",
									children: person.name[0]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "comparison-title",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
								owner.name,
								" & ",
								person.name
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "small muted",
								children: "Different stories. Space for a conversation."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "comparison-metrics",
							children: [
								["flow", "Shared ease"],
								["focus", "Points of focus"],
								["friction", "Different tempos"]
							].map(([kind, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "serif",
								children: counts[kind]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "caps",
								children: label
							})] }, kind))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "small muted",
							children: "Counts of major cross-chart aspects within 4°. These are reflective themes, not a relationship success score."
						}),
						chosen.length ? chosen.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "pair-detail",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindPill, { kind: event.kind }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
									"Your ",
									event.left,
									" ",
									event.verb,
									" ",
									person.name,
									"’s ",
									event.right
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: event.kind === "flow" ? "This pairing can be a useful lens for noticing what feels easy between you. Ask what helps each person feel understood, and make room for the answer to change." : event.kind === "focus" ? "This pairing brings two perspectives into the same conversation. Rather than assuming you mean the same thing, compare the details of what matters to each of you." : "Use this pairing as a prompt to talk about different needs or tempos. A clear request and a little flexibility can be more helpful than deciding who is right." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "calculation-note",
									children: [
										event.orb.toFixed(2),
										"° from exact · ",
										Content.planets[event.left].short,
										" meets ",
										Content.planets[event.right].short.toLowerCase(),
										"."
									]
								})
							]
						}, event.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "empty-state",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No close major aspects in this window. A chart cannot replace getting to know someone." })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-actions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "button secondary",
								type: "button",
								onClick: () => void shareComparison(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "share" }), " Share a reflection"]
							}), !person.sample && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "text-button",
								type: "button",
								onClick: () => setModal({
									type: "profile",
									kind: "person",
									id: person.id
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "edit" }), " Edit chart"]
							})]
						})
					]
				})]
			})
		] });
	}
	async function shareComparison() {
		const event = Astro.aspects(natal.bodies, Astro.chart(person, state.prefs.house).bodies, 4)[0];
		const text = `${owner.name} & ${person.name} — a little perspective from AEON.\n\n${event ? `Your ${event.left} ${event.verb} ${person.name}’s ${event.right}. ` : ""}What helps each of us feel understood? A chart opens a conversation; we get to write the rest.`;
		if (navigator.share) try {
			await navigator.share({
				title: "A little perspective · AEON",
				text
			});
			return;
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				toast("Sharing cancelled.");
				return;
			}
		}
		if (navigator.clipboard?.writeText) try {
			await navigator.clipboard.writeText(text);
			toast("Reflection copied. Share it when you are ready.");
			return;
		} catch {}
		download(text, "text/plain", "AEON-shared-reflection.txt");
		toast("Your reflection is ready as a text file.");
	}
	function almanacPage() {
		const [year, mon] = month.split("-").map(Number);
		const start = `${month}-01`;
		const days = new Date(Date.UTC(year, mon, 0)).getUTCDate();
		const offset = ((/* @__PURE__ */ new Date(start + "T12:00:00Z")).getUTCDay() + 6) % 7;
		const nextMonth = new Date(Date.UTC(year, mon, 1)).toISOString().slice(0, 10);
		let events = [];
		try {
			events = Astro.moonEvents(Astro.firstLocal(start, state.prefs.zone), Astro.firstLocal(nextMonth, state.prefs.zone));
		} catch {
			events = [];
		}
		const selected = Astro.resolveLocal(day, "12:00", state.prefs.zone)[0];
		const selectedDate = new Date(selected?.iso || day + "T12:00:00Z");
		const phase = Astro.moon(selectedDate);
		const moonSign = Astro.positions(selectedDate)[1];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "page-heading",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow",
						children: "A WIDER VIEW OF YOUR DAYS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Life has its rhythms." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "intro",
						children: "Follow the Moon. Leave some room in the calendar for yourself."
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "calendar-layout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "controls-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: UI.dateLabel(start, {
								month: "long",
								year: "numeric"
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "date-nav",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "circle-button",
										type: "button",
										"aria-label": "Previous month",
										onClick: () => shiftMonth(-1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "left" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "today-link",
										type: "button",
										onClick: () => {
											const today = Astro.dateKey(/* @__PURE__ */ new Date(), state.prefs.zone);
											setDay(today);
											setMonth(today.slice(0, 7));
										},
										children: "This month"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "circle-button",
										type: "button",
										"aria-label": "Next month",
										onClick: () => shiftMonth(1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "chevron" })
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "calendar-grid",
							children: [
								[
									"Mon",
									"Tue",
									"Wed",
									"Thu",
									"Fri",
									"Sat",
									"Sun"
								].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "weekday",
									children: label
								}, label)),
								Array.from({ length: offset }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}, `pad-${index}`)),
								Array.from({ length: days }, (_, index) => {
									const key = `${month}-${String(index + 1).padStart(2, "0")}`;
									let moon = {
										angle: 0,
										name: "Moon",
										illumination: 0
									};
									try {
										const resolved = Astro.resolveLocal(key, "12:00", state.prefs.zone)[0];
										moon = Astro.moon(new Date(resolved?.iso || key + "T12:00:00Z"));
									} catch {}
									const special = events.some((event) => Astro.dateKey(new Date(event.date), state.prefs.zone) === key);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: `calendar-day${key === todayKey ? " today" : ""}${key === day ? " selected" : ""}`,
										type: "button",
										"aria-label": `${UI.dateLabel(key)}: ${moon.name}, ${Math.round(moon.illumination * 100)} percent illuminated`,
										"aria-pressed": key === day,
										onClick: () => {
											Astro.validateDate(key);
											setDay(key);
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "day-number",
												children: index + 1
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Svg, { html: UI.moon(moon.angle, 25) }),
											special && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "phase-mark" })
										]
									}, key);
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "calculation-note",
							children: [
								"Lunar images show local-noon illumination. The small dot marks a major lunar phase. Times use ",
								state.prefs.zone,
								"."
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "calendar-aside",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "calendar-selection",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Svg, { html: UI.moon(phase.angle, 60) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "eyebrow",
								children: UI.dateLabel(day, {
									day: "numeric",
									month: "long"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: phase.name }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								Math.round(phase.illumination * 100),
								"% illuminated",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"Moon in ",
								Astro.SIGNS[moonSign.sign],
								" at local noon."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "button secondary",
								type: "button",
								onClick: () => navigate("today"),
								children: ["Explore this day ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "LUNAR TURNING POINTS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "icon-button",
							type: "button",
							"aria-label": "Export lunar dates to your calendar",
							onClick: exportCalendar,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "download" })
						})]
					}), events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "phase-event",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Svg, { html: UI.moon(event.angle, 30) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: event.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Intl.DateTimeFormat("en-AU", {
								timeZone: state.prefs.zone,
								day: "numeric",
								month: "short",
								hour: "2-digit",
								minute: "2-digit",
								hourCycle: "h23"
							}).format(new Date(event.date)) })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `View ${event.name}`,
								onClick: () => setDay(Astro.dateKey(new Date(event.date), state.prefs.zone)),
								children: "↗"
							})
						]
					}, event.date + event.name))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "guide-invite",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "serif",
					children: "There is no perfect day to begin."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Use these rhythms as a reflection prompt, and let your own circumstances lead your decisions." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "button secondary",
					type: "button",
					onClick: () => reflect(),
					children: ["A moment to reflect ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
				})]
			})
		] });
	}
	function exportCalendar() {
		try {
			const [year, mon] = month.split("-").map(Number);
			const start = Astro.firstLocal(month + "-01", state.prefs.zone);
			const next = new Date(Date.UTC(year, mon, 1)).toISOString().slice(0, 10);
			const end = Astro.firstLocal(next, state.prefs.zone);
			const events = Astro.moonEvents(start, end);
			const stamp = (value) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z/, "Z");
			download([
				"BEGIN:VCALENDAR",
				"VERSION:2.0",
				"PRODID:-//AEON//Lunar Almanac//EN",
				"CALSCALE:GREGORIAN",
				...events.flatMap((event) => [
					"BEGIN:VEVENT",
					`UID:${hash(event.date + event.name)}@aeon.local`,
					`DTSTAMP:${stamp(/* @__PURE__ */ new Date())}`,
					`DTSTART:${stamp(event.date)}`,
					`DTEND:${stamp(+new Date(event.date) + 18e5)}`,
					`SUMMARY:AEON - ${event.name}`,
					"DESCRIPTION:A calculated lunar phase. A moment for reflection.",
					"END:VEVENT"
				]),
				"END:VCALENDAR"
			].join("\r\n") + "\r\n", "text/calendar", `AEON-lunar-dates-${month}.ics`);
			toast("Lunar dates exported for your calendar.");
		} catch (error) {
			toast(error instanceof Error ? error.message : "Those lunar dates could not be exported.");
		}
	}
	function journalPage() {
		const entry = state.entries.find((item) => item.id === editEntry);
		const active = (entry ? edits[entry.id] || {
			text: entry.text,
			date: entry.date,
			mood: entry.mood || "Open"
		} : null) || note || {
			text: "",
			date: day,
			mood: "Open"
		};
		const list = [...state.entries].filter((item) => `${item.text} ${item.prompt} ${item.mood}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "page-heading",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow",
						children: "A SPACE WITHOUT AN AUDIENCE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Make a little room." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "intro",
						children: "Save a thought, notice a pattern, or simply put the day down for a moment."
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "tab-row",
				role: "tablist",
				"aria-label": "Journal sections",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "tab",
					"aria-selected": journalTab === "entries",
					className: journalTab === "entries" ? "active" : "",
					onClick: () => setJournalTab("entries"),
					children: ["Your reflections ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "muted",
						children: [
							"(",
							state.entries.length,
							")"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "tab",
					"aria-selected": journalTab === "saved",
					className: journalTab === "saved" ? "active" : "",
					onClick: () => setJournalTab("saved"),
					children: ["Saved readings ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "muted",
						children: [
							"(",
							state.bookmarks.length,
							")"
						]
					})]
				})]
			}),
			journalTab === "saved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid-three",
				children: state.bookmarks.length ? [...state.bookmarks].reverse().map((bookmark) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "saved-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "entry-meta",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								UI.dateLabel(bookmark.date, {
									day: "numeric",
									month: "short"
								}),
								" · ",
								bookmark.name
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "icon-button saved",
								type: "button",
								"aria-label": `Unsave ${bookmark.topic}`,
								onClick: () => {
									commit({
										...state,
										bookmarks: state.bookmarks.filter((item) => item.id !== bookmark.id)
									});
									toast("Reading removed from Saved.");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "bookmark" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindPill, { kind: bookmark.kind }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: bookmark.title }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: bookmark.text }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "calculation-note",
							children: [
								bookmark.context,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"Saved as read · ",
								bookmark.zone
							]
						})
					]
				}, bookmark.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "empty-symbol",
							children: "♧"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "serif",
							children: "Keep what stays with you."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Bookmark a daily insight to keep its original words and chart context here." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button secondary",
							type: "button",
							onClick: () => navigate("today"),
							children: "Explore your day"
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "journal-layout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "eyebrow",
							children: entry ? "RETURN TO A REFLECTION" : "A QUESTION TO SIT WITH"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "journal-prompt",
							children: entry?.prompt || prompt || leadReading.prompt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							id: "journal-form",
							onSubmit: (event) => {
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
									if (text.length > 1e4) throw Error("Keep this reflection within 10,000 characters.");
									const old = state.entries.find((item) => item.id === editEntry);
									const nextEntry = {
										id: old?.id || uid(),
										date,
										text,
										mood: active.mood,
										prompt: old?.prompt || prompt || leadReading.prompt,
										updatedAt: (/* @__PURE__ */ new Date()).toISOString()
									};
									let entries;
									if (old) entries = state.entries.map((item) => item.id === old.id ? nextEntry : item);
									else {
										if (state.entries.length >= 2e3) throw Error("Export a backup and make room before adding more reflections.");
										entries = [...state.entries, nextEntry];
									}
									const ok = commit({
										...state,
										entries
									});
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
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "journal-date",
										children: "Date"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "journal-date",
										name: "date",
										type: "date",
										required: true,
										min: "1900-01-01",
										max: "2100-12-31",
										value: active.date,
										onChange: (event) => writeComposer({ date: event.target.value })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "journal-text",
										children: "Whatever is on your mind"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id: "journal-text",
										name: "text",
										required: true,
										maxLength: 1e4,
										placeholder: "Today, I noticed…",
										value: active.text,
										onChange: (event) => writeComposer({ text: event.target.value })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "field-label",
									children: "How does this moment feel?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "moods",
									style: { margin: "10px 0 22px" },
									children: MOODS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: `mood${active.mood === item ? " selected" : ""}`,
										"aria-pressed": active.mood === item,
										onClick: () => writeComposer({ mood: item }),
										children: item
									}, item))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									id: "journal-error",
									className: "form-error",
									role: "alert",
									children: journalError
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "modal-actions",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "button",
										type: "submit",
										children: [
											entry ? "Update reflection" : "Keep this reflection",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })
										]
									}), entry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "text-button",
										type: "button",
										onClick: () => {
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
										},
										children: "Cancel edit"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "privacy-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "lock" }), "Saved on this device. Export a backup to keep a copy."]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "controls-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: { fontSize: 24 },
							children: "Your moments, kept."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "caps muted",
							children: [
								state.entries.length,
								" REFLECTION",
								state.entries.length === 1 ? "" : "S"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "sr-only",
						htmlFor: "entry-search",
						children: "Search your reflections"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "entry-search",
						className: "search-field",
						type: "search",
						placeholder: "Find a word, a feeling, a moment…",
						maxLength: 100,
						value: query,
						onChange: (event) => setQuery(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: "entries-list",
						children: list.length ? list.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "journal-entry",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "entry-meta",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: UI.dateLabel(item.date) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.mood })]
								}),
								item.prompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "entry-prompt",
									children: item.prompt
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "entry-text",
									children: item.text
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "entry-actions",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setEditEntry(item.id);
											setJournalError("");
											window.setTimeout(() => document.getElementById("journal-text")?.focus(), 40);
										},
										children: "Edit reflection"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => confirm("Let this reflection go?", "This removes the reflection from this browser. Export a backup first if you want a copy.", () => {
											commit({
												...state,
												entries: state.entries.filter((entry) => entry.id !== item.id)
											});
											if (editEntry === item.id) setEditEntry(null);
											setEdits((prev) => {
												if (!prev[item.id]) return prev;
												const next = { ...prev };
												delete next[item.id];
												return next;
											});
											toast("Reflection removed.");
										}),
										children: "Delete"
									})]
								})
							]
						}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "empty-state",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "empty-symbol",
									children: "✳"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "serif",
									children: query ? "A little too specific?" : "Your words belong here."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: query ? "No reflections match that search. Try another word." : "A sentence is enough. Start with whatever is taking up room in your mind." })
							]
						})
					})
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "guide-invite",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "serif",
					children: "Sometimes a better question helps."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Explore a guided reflection using a theme from your chart." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "button secondary",
					type: "button",
					onClick: () => setModal({ type: "guide" }),
					children: ["Open your chart guide ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
				})]
			})] })
		] });
	}
	function settingsBody() {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "settings-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: owner.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: owner.sample ? "Fictional sample chart" : `${UI.dateLabel(owner.birthDate)} · ${owner.place.name}` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button secondary",
					type: "button",
					onClick: () => setModal({
						type: "profile",
						kind: "owner",
						id: null
					}),
					children: owner.sample ? "Make it yours" : "Edit chart"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "settings-section",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Your experience" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "settings-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Reading tone", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Same sky. A different voice." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "select-quiet",
							value: state.prefs.tone,
							onChange: (event) => updatePrefs({ tone: event.target.value }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "gentle",
									children: "Gentle"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "direct",
									children: "Direct"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "playful",
									children: "Playful"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "settings-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Appearance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "select-quiet",
							value: state.prefs.theme,
							onChange: (event) => updatePrefs({ theme: event.target.value }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "light",
									children: "Light"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "dark",
									children: "Dark"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "system",
									children: "Follow device"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "settings-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["House system", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Shown with every chart." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "select-quiet",
							value: state.prefs.house,
							onChange: (event) => updatePrefs({ house: event.target.value }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "porphyry",
									children: "Porphyry"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "whole",
									children: "Whole Sign"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "equal",
									children: "Equal"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneField, {
						zone: state.prefs.zone,
						onSave: (zone) => {
							if (!Astro.validZone(zone)) return "Choose a valid IANA timezone, such as Australia/Perth.";
							const today = Astro.dateKey(/* @__PURE__ */ new Date(), zone);
							commit({
								...state,
								prefs: {
									...state.prefs,
									zone
								}
							});
							setDay(today);
							setMonth(today.slice(0, 7));
							toast("Reading timezone updated. Birth timezone unchanged.");
							return null;
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "settings-section",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Keep a copy. Keep control." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "modal-copy",
						children: [
							"Your birth details, ",
							state.people.length,
							" saved chart",
							state.people.length === 1 ? "" : "s",
							", ",
							state.entries.length,
							" reflection",
							state.entries.length === 1 ? "" : "s",
							" and ",
							state.bookmarks.length,
							" reading",
							state.bookmarks.length === 1 ? "" : "s",
							" are saved in this browser. Export before clearing browser data or moving devices."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "settings-actions",
						style: { marginTop: 18 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "button secondary",
							type: "button",
							onClick: () => {
								download(Store.backup(state), "application/json", `AEON-backup-${Astro.dateKey(/* @__PURE__ */ new Date())}.json`);
								toast("Your private backup is ready.");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "download" }), " Export your data"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "button secondary import-label",
							htmlFor: "import-data",
							children: ["Import a backup", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								id: "import-data",
								accept: "application/json,.json",
								className: "sr-only",
								onChange: async (event) => {
									const file = event.target.files?.[0];
									event.target.value = "";
									if (!file) return;
									try {
										if (file.size > 26214400) throw Error("Choose an AEON JSON backup smaller than 25 MB.");
										const data = Store.normalize(JSON.parse(await file.text()));
										confirm("Bring your moments back?", `This backup will replace the AEON data in this browser with ${data.people.length} saved charts, ${data.entries.length} reflections and ${data.bookmarks.length} readings. Export your current data first if you want to keep it.`, () => {
											const today = Astro.dateKey(/* @__PURE__ */ new Date(), data.prefs.zone);
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
										}, { type: "settings" });
									} catch (error) {
										toast(error instanceof SyntaxError ? "That file is not valid JSON. Choose an AEON backup." : error instanceof Error ? error.message : "That backup could not be read.");
									}
								}
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "calculation-note",
						children: "Backups contain your private birth details and words. Store them somewhere you trust."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "settings-section",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "A fresh beginning" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "modal-copy",
						children: "Remove all AEON data from this browser. Export a backup first if you want to keep anything."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "settings-actions",
						style: { marginTop: 18 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button secondary",
							type: "button",
							onClick: () => confirm("A fresh beginning?", "This removes your profile, saved charts, readings, preferences and reflections from this browser. Export first if you want a copy.", () => {
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
								const today = Astro.dateKey(/* @__PURE__ */ new Date(), fresh.prefs.zone);
								setDay(today);
								setMonth(today.slice(0, 7));
								navigate("today");
								toast("Your local data has been removed.");
							}, { type: "settings" }),
							children: "Delete local data"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-button",
							type: "button",
							onClick: () => setModal({ type: "about" }),
							children: "How AEON works ↗"
						})]
					})
				]
			})
		] });
	}
	function readingModal(id) {
		const event = id === "main" ? lead : sky.events?.find((item) => item.id === id);
		const reading = Content.reading(event, state.prefs.tone);
		const snap = snapshotOf(event, state, owner, day);
		const natalBody = event ? natal.bodies.find((body) => body.body === event.right) : null;
		const kept = savedId(snap.id);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			sheet: true,
			title: UI.dateLabel(day, {
				day: "numeric",
				month: "long"
			}),
			eyebrow: "YOUR DAILY PERSPECTIVE",
			onClose: closeModal,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindPill, { kind: reading.kind }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "modal-reading",
					children: reading.headline
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-copy",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: reading.text }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: reading.prompt })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "context-box",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "caps",
							children: "THE SKY BEHIND THE WORDS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: reading.context }),
							event && natalBody && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								event.orb.toFixed(2),
								"° from the exact aspect · natal ",
								event.right,
								" in ",
								Astro.SIGNS[natalBody.sign],
								"."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Calculated for 12:00 on ",
							UI.dateLabel(day),
							" in ",
							state.prefs.zone,
							"."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: { marginTop: 12 },
							children: "This is a theme for reflection, not a prediction. Flow, Focus and Friction are tones, not events."
						}),
						event && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: { marginTop: 12 },
							children: [Content.planets[event.left].text, natalBody?.house ? ` Your natal ${event.right} sits in house ${natalBody.house}, ${Content.houses[natalBody.house - 1].name.toLowerCase()}: ${Content.houses[natalBody.house - 1].plain}` : ` Your natal ${event.right}: ${Content.planets[event.right].text}`]
						}),
						owner.precision !== "exact" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: { marginTop: 12 },
							children: "Your birth time is uncertain. Some positions and aspect selections are estimates; highly time-dependent placements are excluded."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "button",
						type: "button",
						onClick: () => toggleSave(event?.id || "main"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "bookmark" }),
							" ",
							kept ? "Saved · remove" : "Keep this reading"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "button secondary",
						type: "button",
						onClick: () => reflect(reading.prompt),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "journal" }), " Reflect on it"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "calculation-note",
					children: [
						owner.name,
						"’s chart · ",
						houseName(state.prefs.house),
						" · ",
						Astro.VERSION
					]
				})
			]
		});
	}
	function planetModal(body) {
		if (body === "Ascendant") {
			const position = natal.asc == null ? null : Astro.positionLabel(natal.asc);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
				sheet: true,
				title: "How you meet the world.",
				eyebrow: "YOUR RISING SIGN",
				onClose: closeModal,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "modal-copy",
					children: position ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
							"↗ ",
							Astro.SIGNS[position.sign],
							" rising"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: Content.signs[position.sign].text }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The rising sign is the sign on the eastern horizon at your birth. It is a style for how you meet a new situation. It is not a verdict on your face, or on how everyone sees you." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "context-box",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "caps",
								children: "YOUR CALCULATED ASCENDANT"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								position.degree,
								" ",
								position.name,
								" · ",
								natal.precision === "approximate" ? "approximate time; this angle is indicative" : "your entered birth time and place",
								"."
							] })]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A rising sign depends on the local birth time and horizon. It is the style of how you meet a new situation. Add a known birth time to calculate it. An unknown time leaves it open." })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "modal-actions",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "button secondary",
						type: "button",
						onClick: () => setModal({
							type: "profile",
							kind: "owner",
							id: null
						}),
						children: "Review birth details"
					})
				})]
			});
		}
		const placement = natal.bodies.find((item) => item.body === body);
		if (!placement) return null;
		const position = Astro.positionLabel(placement.lon);
		const meaning = Content.planets[body];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			sheet: true,
			title: `${Astro.SYMBOLS[body]} ${body} in ${placement.signs.map((index) => Astro.SIGNS[index]).join(" / ")}`,
			eyebrow: "YOUR CHART, A LITTLE DEEPER",
			onClose: closeModal,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "modal-copy",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: meaning.text }),
					placement.signs.map((sign) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
						Astro.SIGNS[sign],
						" · ",
						Content.signs[sign].word
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: Content.signs[sign].text })] }, sign)),
					placement.house ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
							"House ",
							placement.house,
							" · ",
							Content.houses[placement.house - 1].name
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: Content.houses[placement.house - 1].plain }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: Content.houses[placement.house - 1].ask })
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A house is the area of life a planet lands in. This one needs a reliable birth time, so it is left open." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "context-box",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "caps",
							children: "CALCULATED PLACEMENT"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							natal.precision !== "exact" ? "Approximate reference: " : "",
							position.degree,
							" ",
							position.name,
							placement.house ? ` · house ${placement.house}` : "",
							placement.retrograde ? " · retrograde" : "",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							natal.precision === "unknown" ? "Local noon reference; rising and houses withheld." : natal.precision === "approximate" ? "Based on the entered time with a ±1 hour uncertainty range." : "Based on your entered birth time and location.",
							placement.signs.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}), "The sign changes within the birth-time uncertainty interval."] }) : null
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Keep what is useful. Leave the rest. None of this is a prediction." })
				]
			})
		});
	}
	const profileExisting = modal?.type === "profile" ? modal.kind === "owner" ? state.profile : state.people.find((item) => item.id === modal.id) || null : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			className: "skip-link",
			href: "#main",
			children: "Skip to content"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "sidebar",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					className: "brand",
					href: "#today",
					"aria-label": "AEON home",
					onClick: (event) => {
						event.preventDefault();
						navigate("today");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "wordmark",
						children: ["aeon", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✳" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tagline",
						children: "A LITTLE PERSPECTIVE."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "nav-list",
					"aria-label": "Main navigation",
					children: NAV.map(([id, icon, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `#${id}`,
						className: `nav-item${page === id ? " active" : ""}`,
						"aria-current": page === id ? "page" : void 0,
						"aria-label": label,
						onClick: (event) => {
							event.preventDefault();
							navigate(id);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: icon }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "nav-label",
								children: label
							}),
							page === id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "nav-dot" })
						]
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sidebar-bottom",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "side-moon",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Svg, { html: UI.moon(nowMoon.angle, 34) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: nowMoon.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Math.round(nowMoon.illumination * 100), "% illuminated · now"] })] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "side-settings",
							type: "button",
							"aria-label": "Settings",
							onClick: () => setModal({ type: "settings" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Settings & your data" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sidebar-foot",
							children: ["YOUR SKY. YOUR PERSPECTIVE.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "credit",
								children: "Developed by fourtee2apps"
							})]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "workspace",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "topbar",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "mobile-brand",
							href: "#today",
							"aria-label": "AEON home",
							onClick: (event) => {
								event.preventDefault();
								navigate("today");
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "wordmark",
								children: ["aeon", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✳" })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "topbar-date",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: UI.dateLabel(todayKey, {
								weekday: "long",
								day: "numeric",
								month: "long"
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "A moment for you, in the middle of it all." })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "topbar-right",
							children: [
								!state.profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "sample-chip",
									type: "button",
									onClick: () => setModal({
										type: "profile",
										kind: "owner",
										id: null
									}),
									children: "Sample chart · Make it yours"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sample-chip",
									children: "On your device"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "theme-toggle",
									type: "button",
									"aria-pressed": appearance === "dark",
									"aria-label": appearance === "dark" ? "Switch to light mode" : "Switch to dark mode",
									onClick: toggleTheme,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: appearance === "dark" ? "today" : "night" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "profile-button",
									type: "button",
									"aria-label": "Profile and settings",
									onClick: () => setModal({ type: "settings" }),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "avatar",
											children: owner.name[0].toUpperCase()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: owner.name }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "profile-chevron",
											children: "⌄"
										})
									]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					id: "main",
					className: "main-content",
					tabIndex: -1,
					children: [
						warning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "notice",
							role: "status",
							children: warning
						}),
						!storageOk && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "notice",
							children: "Changes are in memory only. Open Settings and export a backup before leaving."
						}),
						(page === "today" || page === "chart") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							id: "today",
							className: `route-page${page === "today" ? " active" : ""}`,
							children: todayPage()
						}),
						(page === "today" || page === "chart") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							id: "chart",
							className: `route-page${page === "chart" ? " active" : ""}`,
							children: chartPage()
						}),
						page === "connections" && connectionsPage(),
						page === "almanac" && almanacPage(),
						page === "journal" && journalPage()
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "site-footer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Developed by fourtee2apps. Astrology as reflection. Your choices remain yours." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setModal({ type: "about" }),
						children: "The thinking behind AEON ↗"
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			id: "toast",
			className: `toast${toastMsg ? " show" : ""}`,
			role: "status",
			"aria-live": "polite",
			children: toastMsg
		}),
		modal?.type === "reading" && readingModal(modal.id),
		modal?.type === "planet" && planetModal(modal.body),
		modal?.type === "about" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			sheet: true,
			title: "Your sky. Your perspective.",
			eyebrow: "THE THINKING BEHIND AEON",
			onClose: closeModal,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "modal-copy",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "AEON is developed by fourtee2apps. It is an astrology and reflection app: calculated planetary positions, plain-language explanations, and a private place for your own thoughts." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Positions are calculated. Meaning is explored." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The Sun, Moon and planets use Astronomy Engine 2.1.19, with tropical, geocentric coordinates. House options are Porphyry, Whole Sign and Equal. Daily readings use major transits within 2.5° at local noon; your chart uses wider 6° natal aspects." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Interpretations come from an original editorial library selected by those chart facts. The chart guide uses the same library. This version processes your question on this device." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "A little honesty about uncertainty." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A missing birth time leaves houses and rising unassigned. An approximate time uses a ±1 hour range. Historical timezone rules come from your browser and may be less reliable before 1970. City coordinates are city-centre estimates; you can enter custom coordinates and a timezone." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "A space that stays yours." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Birth details, saved comparisons and journal content are processed and stored in your browser. Export a backup before clearing browser data or moving devices. Sharing a reflection happens only when you choose it." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This release includes local profiles and a guided chart reflection tool. Cloud accounts, connected friends and payments are not connected." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Made with open tools." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Astronomy Engine by Don Cross (MIT). City search uses a local GeoNames cities15000 data snapshot (Creative Commons Attribution 4.0).",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.geonames.org/",
							target: "_blank",
							rel: "noopener",
							children: "GeoNames"
						}),
						" ",
						"data is provided as-is; city coordinates are estimates. See the",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://github.com/cosinekitty/astronomy",
							target: "_blank",
							rel: "noopener",
							children: "Astronomy Engine licence"
						}),
						"."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "AEON is for adults 18+. Astrology is presented for reflection and entertainment. Your decisions remain yours." })
				]
			})
		}),
		modal?.type === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			sheet: true,
			title: "A space that feels like you.",
			eyebrow: "SETTINGS & YOUR DATA",
			onClose: closeModal,
			children: settingsBody()
		}),
		modal?.type === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			sheet: true,
			title: modal.kind === "owner" ? "Begin with your beginnings." : profileExisting ? "A little more detail." : "Another sky to understand.",
			eyebrow: modal.kind === "owner" ? "YOUR BIRTH CHART" : "A PRIVATE SAVED CHART",
			onClose: closeModal,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileForm, {
				kind: modal.kind,
				existing: profileExisting,
				cities,
				cityStatus,
				onClose: closeModal,
				onSave: (profile) => saveProfile(profile, modal.kind)
			}, `${modal.kind}-${profileExisting?.id || "new"}`)
		}),
		modal?.type === "confirm" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			title: modal.title,
			eyebrow: "YOUR CHOICE",
			onClose: dismissConfirm,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "modal-copy",
				children: modal.message
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "modal-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button danger",
					type: "button",
					onClick: () => {
						const action = pending.current;
						pending.current = null;
						setModal(null);
						action?.();
					},
					children: "Confirm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button secondary",
					type: "button",
					onClick: dismissConfirm,
					children: "Keep things as they are"
				})]
			})]
		}),
		modal?.type === "guide" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			sheet: true,
			title: "Bring a little curiosity.",
			eyebrow: "YOUR CHART GUIDE",
			onClose: closeModal,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "modal-copy",
				children: "Choose a lens for something on your mind. Your chart supplies the context; an original editorial library offers a reflection."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				id: "guide-form",
				style: { marginTop: 24 },
				onSubmit: (event) => {
					event.preventDefault();
					const form = event.currentTarget;
					if (!form.reportValidity()) return;
					const data = new FormData(form);
					const question = String(data.get("question") || "").trim();
					if (!question) {
						toast("Give your question a few words.");
						return;
					}
					const result = Content.guide(String(data.get("topic")), question, natal, sky.error ? {
						events: [],
						chosen: []
					} : sky);
					setModal({
						type: "guide-result",
						question,
						result
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "guide-topic",
							children: "Where would you like to look?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "guide-topic",
							name: "topic",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "self",
									children: "Self & feelings"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "connection",
									children: "Love & connection"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "work",
									children: "Work & direction"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "change",
									children: "Change & beginnings"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "guide-question",
							children: "What is on your mind?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "guide-question",
							name: "question",
							maxLength: 500,
							required: true,
							placeholder: "How can I make more room for what matters?",
							style: { minHeight: 110 }
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "calculation-note",
						children: "This guide runs on your device and uses fixed editorial prompts selected by topic and chart facts."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "modal-actions",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "button",
							type: "submit",
							children: ["Find a little perspective ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
						})
					})
				]
			})]
		}),
		modal?.type === "guide-result" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			sheet: true,
			title: "A lens, not a verdict.",
			eyebrow: "YOUR GUIDED REFLECTION",
			onClose: closeModal,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "YOU ASKED"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "guide-question",
					children: modal.question
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "modal-copy",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: modal.result.text })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "context-box",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "caps",
						children: "FROM YOUR CHART"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						modal.result.placement.body,
						" in ",
						Astro.SIGNS[modal.result.placement.sign],
						" · ",
						Astro.positionLabel(modal.result.placement.lon).degree,
						modal.result.event ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							modal.result.event.left,
							" ",
							modal.result.event.verb,
							" your ",
							modal.result.event.right,
							" at the selected daily snapshot."
						] }) : null
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "journal-prompt",
					children: modal.result.prompt
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "button",
						type: "button",
						onClick: () => reflect(modal.result.prompt),
						children: ["Put it into words ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-button",
						type: "button",
						onClick: () => setModal({ type: "guide" }),
						children: "Explore another lens"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "calculation-note",
					children: "Selected from AEON’s original editorial library. Your question stays in this session unless you choose to write a reflection."
				})
			]
		})
	] });
}
function Home() {
	const { iso, zone } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AeonApp, {
		initialIso: iso,
		initialZone: zone
	});
}
//#endregion
export { Home as component };
