// @ts-nocheck
import { PROFILE } from "./profile";
import {
  calcCompatibility, calcCoreNumbers, calcPersonalDay, calcPersonalMonth, calcPersonalYear,
  calcUniversalDay, calcUniversalMonth, calcUniversalYear, NUMBER_MEANINGS_FULL,
  pythagoreanValue, reduce, digitSum,
} from "./numerology";
import { healingood, fmtMD } from "./healingood";
import { colorsForDay } from "./colorology";
import {
  SIGNS, chineseMonthSign, chineseSign, numberRelation, secretRelation, signRelation, MONTH_SPAN, type Sign,
} from "./vote-decode";

export { chineseMonthSign, signRelation, NUMBER_MEANINGS_FULL, fmtMD, SIGNS, MONTH_SPAN };
export type { Sign };

export interface BirthProfile {
  firstName: string; middleName: string; lastName: string;
  year: number; month: number; day: number; time: string; place: string;
}
export type Rel = "friend" | "neutral" | "enemy";
export type ListKind = "soulmate" | "fatal" | "challenging" | "love" | "beneficial" | "wealth" | "twenty-eight" | "master";
export type Goal = "money" | "launching" | "purchases" | "meetings" | "travel" | "love" | "tattoos" | "surgery" | "shoes" | "llc" | "contracts";

export interface Num {
  compound: number;
  reduced: number;
  cycleYear?: number;
}
export interface ListedDate {
  iso: string; y: number; m: number; d: number;
  label: string; tones: ListKind[]; headline: string;
}
export interface DayRead {
  y: number; m: number; d: number; iso: string; weekday: string;
  universal: Num; labelU: string;
  calendar: Num; labelDay: string;
  combined: Num; labelCombined: string;
  universalLine: string; dayLine: string; combinedLine: string;
  personal: Num; labelP: string;
  personalYear: Num; personalMonth: Num;
  universalMonth: Num; universalYear: Num;
  tones: ListKind[]; flags: string[];
  moon: string; moonSign: string; sun: string; monthAnimal: string;
  earth: Rel; number: Rel; west: Rel;
  dos: string[]; avoids: string[];
  headline: string; reading: string; notes: string[];
}

export const DEFAULT_PROFILE = {
	firstName: PROFILE.firstName,
	middleName: PROFILE.middleName,
	lastName: PROFILE.lastName,
	year: PROFILE.birthYear,
	month: PROFILE.birthMonth,
	day: PROFILE.birthDay,
	time: PROFILE.birthTime,
	place: `${PROFILE.birthCity}, ${PROFILE.birthState}`
};
export const LIST_LABEL = {
	soulmate: "Soulmate dates",
	fatal: "Fatal attraction dates",
	challenging: "Challenging dates",
	love: "Love & friendship dates",
	beneficial: "Beneficial dates",
	wealth: "Wealth days",
	"twenty-eight": "28 days",
	master: "Master days"
};
export const GOALS = [
	{
		id: "money",
		label: "Money"
	},
	{
		id: "launching",
		label: "Launching"
	},
	{
		id: "purchases",
		label: "Big purchases"
	},
	{
		id: "meetings",
		label: "Meetings"
	},
	{
		id: "travel",
		label: "Travel"
	},
	{
		id: "love",
		label: "Love"
	},
	{
		id: "tattoos",
		label: "Tattoos"
	},
	{
		id: "surgery",
		label: "Surgery"
	},
	{
		id: "shoes",
		label: "Shoes / cleats"
	},
	{
		id: "llc",
		label: "LLC"
	},
	{
		id: "contracts",
		label: "Contracts"
	}
] as const;
var WEST_ORDER = [
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
var WEST_ELEMENT = {
	Aries: "Fire",
	Leo: "Fire",
	Sagittarius: "Fire",
	Taurus: "Earth",
	Virgo: "Earth",
	Capricorn: "Earth",
	Gemini: "Air",
	Libra: "Air",
	Aquarius: "Air",
	Cancer: "Water",
	Scorpio: "Water",
	Pisces: "Water"
};
var NAKSHATRA = [
	"Ashwini",
	"Bharani",
	"Krittika",
	"Rohini",
	"Mrigashira",
	"Ardra",
	"Punarvasu",
	"Pushya",
	"Ashlesha",
	"Magha",
	"Purva Phalguni",
	"Uttara Phalguni",
	"Hasta",
	"Chitra",
	"Swati",
	"Vishakha",
	"Anuradha",
	"Jyeshtha",
	"Mula",
	"Purva Ashadha",
	"Uttara Ashadha",
	"Shravana",
	"Dhanishta",
	"Shatabhisha",
	"Purva Bhadrapada",
	"Uttara Bhadrapada",
	"Revati"
];
var HOUSE_NAME = [
	"Self",
	"Money",
	"Voice",
	"Home",
	"Creativity",
	"Work & health",
	"Partners",
	"Shared resources",
	"Travel & belief",
	"Career",
	"Friends",
	"Rest & hidden"
];
var MEANING = {
	1: "New beginnings.",
	2: "Pair up, listen, and do not rush the yes.",
	3: "Speak, write, and show the work.",
	4: "Build the system. Paperwork favors you.",
	5: "Travel and change.",
	6: "People, home, and repair.",
	7: "Study and be quiet before you decide.",
	8: "Price it, sign it, collect it.",
	9: "Finish and release. Do not start a new purchase.",
	11: "Trust the hit. Keep the day focused.",
	22: "Build something that outlasts the day.",
	33: "Teach, heal, and raise the room."
};
var ECLIPSES = /* @__PURE__ */ new Set([
	"2024-03-25",
	"2024-04-08",
	"2024-09-18",
	"2024-10-02",
	"2025-03-14",
	"2025-03-29",
	"2025-09-07",
	"2025-09-21",
	"2026-02-17",
	"2026-03-03",
	"2026-08-12",
	"2026-08-28",
	"2027-02-06",
	"2027-02-20",
	"2027-07-18",
	"2027-08-02",
	"2027-08-17",
	"2028-01-12",
	"2028-01-26",
	"2028-07-06",
	"2028-07-22",
	"2028-12-31"
]);
var HEAL_MAP = {
	soulmate: "soulmate",
	fatal: "fatal",
	challenging: "challenging",
	lovers: "love",
	beneficial: "beneficial"
};
export const fullName = (p) => [
	p.firstName,
	p.middleName,
	p.lastName
].filter(Boolean).join(" ");
export const isoOf = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
export const padDate = (m, d) => `${[
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
][m - 1]} ${d}`;
export function parseIso(iso) {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!m) return null;
	const y = +m[1], mo = +m[2], d = +m[3];
	if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
	return {
		y,
		m: mo,
		d
	};
}
export function daysInMonth(y, m) {
	return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
export function weekday(y, m, d) {
	return [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
function numLabel(n) {
	return n.compound === n.reduced ? `${n.reduced}` : `${n.compound}/${n.reduced}`;
}
export function sunSign(month, day) {
	const cuts = [
		[
			1,
			20,
			"Aquarius"
		],
		[
			2,
			19,
			"Pisces"
		],
		[
			3,
			21,
			"Aries"
		],
		[
			4,
			20,
			"Taurus"
		],
		[
			5,
			21,
			"Gemini"
		],
		[
			6,
			21,
			"Cancer"
		],
		[
			7,
			23,
			"Leo"
		],
		[
			8,
			23,
			"Virgo"
		],
		[
			9,
			23,
			"Libra"
		],
		[
			10,
			23,
			"Scorpio"
		],
		[
			11,
			22,
			"Sagittarius"
		],
		[
			12,
			22,
			"Capricorn"
		]
	];
	let sign = "Capricorn";
	for (const [m, d, s] of cuts) if (month > m || month === m && day >= d) sign = s;
	return sign;
}
export function sunLongitude(y, m, d) {
	let days = (Date.UTC(y, m - 1, d) - Date.UTC(y, 2, 20)) / 864e5;
	if (days < 0) days += 365.2422;
	return (days * 360 / 365.2422 + 360) % 360;
}
export function signFromLon(lon) {
	return WEST_ORDER[Math.floor((lon % 360 + 360) % 360 / 30) % 12];
}
function moonLongitude(y, m, d) {
	const days = (Date.UTC(y, m - 1, d) - Date.UTC(2e3, 0, 6)) / 864e5;
	return (sunLongitude(2e3, 1, 6) + days * 13.176396 + 3600) % 360;
}
export function moonPhaseName(y, m, d) {
	const ref = Date.UTC(2e3, 0, 6) / 864e5;
	const cycle = ((Date.UTC(y, m - 1, d) / 864e5 - ref) % 29.53059 + 29.53059) % 29.53059;
	if (cycle < 1.85) return "New Moon";
	if (cycle < 7.38) return "Waxing Crescent";
	if (cycle < 9.22) return "First Quarter";
	if (cycle < 14.77) return "Waxing Gibbous";
	if (cycle < 16.61) return "Full Moon";
	if (cycle < 22.15) return "Waning Gibbous";
	if (cycle < 23.99) return "Last Quarter";
	return "Waning Crescent";
}
export function hourSign(time) {
	const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
	if (!m) return null;
	const hh = +m[1], mm = +m[2];
	if (hh > 23 || mm > 59) return null;
	return hourFromMinutes(hh * 60 + mm);
}
function hourFromMinutes(mins) {
	const idx = Math.floor((((mins % 1440) + 1440) % 1440 + 60) % 1440 / 120) % 12;
	return SIGNS[idx];
}
function nthSunday(y, m, n) {
	const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
	return 1 + ((7 - first) % 7) + (n - 1) * 7;
}
function lastSunday(y, m) {
	const dim = daysInMonth(y, m);
	return dim - new Date(Date.UTC(y, m - 1, dim)).getUTCDay();
}
function zoneFromPlace(place) {
	const p = place.toLowerCase();
	if (/arizona|phoenix/.test(p)) return "arizona";
	if (/hawaii|honolulu/.test(p)) return "hawaii";
	if (/alaska|anchorage/.test(p)) return "alaska";
	if (/chicago|illinois|dallas|houston|austin|texas|minnesota|wisconsin|\biowa\b|missouri|louisiana|alabama|mississippi|oklahoma|kansas|nebraska|arkansas|memphis|nashville|tennessee/.test(p)) return "central";
	if (/new york|boston|miami|florida|atlanta|georgia|philadelphia|pennsylvania|detroit|michigan|\bohio\b|indiana|carolina|virginia|maryland|new jersey|connecticut|massachusetts|washington/.test(p)) return "eastern";
	if (/denver|colorado|utah|montana|wyoming|new mexico|\bidaho\b/.test(p)) return "mountain";
	if (/los angeles|california|seattle|oregon|nevada|san francisco|las vegas/.test(p)) return "pacific";
	return null;
}
function inDaylight(y, m, d, hour, zone) {
	if (!zone || zone === "arizona" || zone === "hawaii" || y < 1967) return false;
	const startM = y >= 2007 ? 3 : 4;
	const startN = y >= 2007 ? 2 : y >= 1987 ? 1 : -1;
	const endM = y >= 2007 ? 11 : 10;
	const endN = y >= 2007 ? 1 : -1;
	const startDay = startN < 0 ? lastSunday(y, startM) : nthSunday(y, startM, startN);
	const endDay = endN < 0 ? lastSunday(y, endM) : nthSunday(y, endM, endN);
	const key = m * 10000 + d * 100 + hour;
	return key >= startM * 10000 + startDay * 100 + 2 && key < endM * 10000 + endDay * 100 + 2;
}
export function birthHour(profile) {
	const m = /^(\d{1,2}):(\d{2})$/.exec(profile.time.trim());
	if (!m) return { sign: null, daylight: false, standard: null, hour: null };
	const hh = +m[1], mm = +m[2];
	if (hh > 23 || mm > 59) return { sign: null, daylight: false, standard: null, hour: null };
	const zone = zoneFromPlace(profile.place);
	const daylight = inDaylight(profile.year, profile.month, profile.day, hh, zone);
	let mins = hh * 60 + mm - (daylight ? 60 : 0);
	if (mins < 0) mins += 1440;
	const sh = Math.floor(mins / 60), sm = mins % 60;
	return {
		sign: hourFromMinutes(mins),
		hour: sh,
		daylight,
		standard: daylight ? `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}` : null,
	};
}
export const animalLabel = (s) => (s === "Rabbit" ? "Cat" : s);
const OPEN_MARKS = ["love", "soulmate", "wealth", "beneficial"];
export function nameReading(profile) {
	const name = fullName(profile);
	const letters = [...name.toUpperCase()].filter((c) => /[A-Z]/.test(c));
	let full = 0;
	let reducedSum = 0;
	let vowels = 0;
	let first = null;
	let firstVowel = null;
	for (const c of letters) {
		const place = c.charCodeAt(0) - 64;
		const digit = ((place - 1) % 9) + 1;
		full += place;
		reducedSum += digit;
		if ("AEIOU".includes(c)) vowels += digit;
		if (!first) first = { letter: c, n: digit };
		if (!firstVowel && "AEIOU".includes(c)) firstVowel = { letter: c, n: digit };
	}
	return {
		name,
		root: reduce(reducedSum),
		reducedCompound: reducedSum,
		fullCompound: full,
		vowels,
		first,
		firstVowel,
	};
}
export function hourWindows() {
	return SIGNS.map((sign, i) => {
		const start = (23 + i * 2) % 24;
		const end = (start + 2) % 24;
		const f = (h) => `${String(h).padStart(2, "0")}:00`;
		return {
			sign,
			label: `${f(start)}–${f(end)}`
		};
	});
}
export function westRelation(a, b) {
	const ia = WEST_ORDER.indexOf(a);
	const ib = WEST_ORDER.indexOf(b);
	if (ia < 0 || ib < 0) return "neutral";
	if ((ia + 6) % 12 === ib) return "enemy";
	if (WEST_ELEMENT[a] === WEST_ELEMENT[b]) return "friend";
	return "neutral";
}
function toRel(r) {
	if (r === "enemy" || r === "worst") return "enemy";
	if (r === "friend" || r === "soulmate" || r === "same") return "friend";
	return "neutral";
}
function risingChart(y, m, d, time) {
	const h = hourSign(time);
	if (!h || !time.trim()) return null;
	const [hh, mm] = time.split(":").map(Number);
	const sign = signFromLon((sunLongitude(y, m, d) + (hh * 60 + mm - 360) / 4 + 3600) % 360);
	const i0 = WEST_ORDER.indexOf(sign);
	return {
		sign,
		houses: HOUSE_NAME.map((name, i) => ({
			house: i + 1,
			name,
			sign: WEST_ORDER[(i0 + i) % 12]
		})),
		hourAnimal: h
	};
}
function healSet(profile) {
	const h = healingood(profile.month, profile.day);
	const sets = {};
	Object.keys(HEAL_MAP).forEach((k) => {
		sets[HEAL_MAP[k]] = new Set(h[k].map(([m, d]) => `${m}-${d}`));
	});
	return {
		h,
		sets
	};
}
export function readDay(profile: BirthProfile, y: number, m: number, d: number, birth?: DayRead | null): DayRead {
	const chart = birth ?? buildChart(profile, {
		y,
		m,
		d
	});
	const universal = calcUniversalDay(y, m, d);
	const personalYear = calcPersonalYear(profile.month, profile.day, m, d, y);
	const personalMonth = calcPersonalMonth(personalYear.reduced, m);
	const personal = calcPersonalDay(profile.month, profile.day, m, d, y);
	const { sets } = healSet(profile);
	const key = `${m}-${d}`;
	const tones = [];
	[
		"soulmate",
		"fatal",
		"challenging",
		"love",
		"beneficial"
	].forEach((k) => {
		if (sets[k]?.has(key)) tones.push(k);
	});
	const wealth = [8, 17, 26].includes(d) || universal.reduced === 8 || [8, 17, 26].includes(universal.compound);
	const calendar = { compound: d, reduced: reduce(d) };
	const labelDay = numLabel(calendar);
	const labelCombined = `${universal.reduced}/${calendar.reduced}`;
	const togetherMean = universal.reduced === calendar.reduced
		? (MEANING[universal.reduced] ?? "")
		: `${MEANING[universal.reduced] ?? ""} ${MEANING[calendar.reduced] ?? ""}`.trim();
	const combined = { compound: universal.reduced, reduced: calendar.reduced };
	const twenty = d === 28 || universal.compound === 28 || calendar.compound === 28;
	const masters = [11, 22, 33];
	const master = [universal.reduced, universal.compound, calendar.reduced, calendar.compound].some((n) => masters.includes(n));
	if (wealth) tones.push("wealth");
	if (twenty) tones.push("twenty-eight");
	if (master) tones.push("master");
	const iso = isoOf(y, m, d);
	const flags = [];
	const moon = moonPhaseName(y, m, d);
	flags.push(moon);
	if (ECLIPSES.has(iso)) flags.push("Eclipse");
	if (m === 3 && d === 20 || m === 9 && d === 22) flags.push("Equinox");
	if (m === 6 && d === 21 || m === 12 && d === 21) flags.push("Solstice");
	if (m === 8 && d === 8) flags.push("Lion's Gate");
	if (d === 6 && m !== 2) flags.push("Chinese month start");
	if (m === 2 && d === 4) flags.push("Lichun, Tiger month starts");
	if (m === profile.month && d === profile.day) flags.push("Personal year starts");
	const monthAnimal = chineseMonthSign(m, d);
	const sun = sunSign(m, d);
	const earth = toRel(signRelation(chart.yearAnimal, monthAnimal));
	const number = toRel(numberRelation(chart.lifePath.reduced, calendar.reduced === 11 || calendar.reduced === 22 || calendar.reduced === 33 ? calendar.reduced : reduce(calendar.reduced)));
	const west = westRelation(chart.sun, sun);
	const secret = secretRelation(chart.yearAnimal, monthAnimal);
	const dos = [];
	const avoids = [];
	if (tones.includes("fatal")) {
		avoids.push("New contracts, surgery, and large purchases.");
		dos.push("Finish what is already open. Do not force a new deal.");
	}
	if (tones.includes("soulmate")) dos.push("Show up. Introductions and honest talks are the point of a soulmate date.");
	if (tones.includes("love")) dos.push("Friendship, a date, or a repair conversation.");
	if (tones.includes("beneficial")) dos.push("Ask, launch, travel, and sign.");
	if (tones.includes("challenging")) {
		avoids.push("Forcing the result. Keep the plan smaller.");
		dos.push("Review, maintain, and take one careful step.");
	}
	if (tones.includes("wealth") || universal.reduced === 8 || calendar.reduced === 8) dos.push("Money moves: price, invoice, negotiate, collect.");
	if (tones.includes("master")) dos.push("Give the day one important piece of work, not a pile of errands.");
	const say = (n, who) => {
		const line = MEANING[n];
		if (line) dos.push(`${who} ${n}: ${line}`);
		if (n === 9) avoids.push(`${who} is 9. Finish and release. Do not open a new purchase.`);
		if (n === 7) avoids.push(`${who} is 7. Do not make a loud public decision you have not sat with.`);
	};
	say(universal.reduced, "Universal");
	if (calendar.reduced !== universal.reduced) say(calendar.reduced, "Day");
	if (flags.includes("Eclipse") && !avoids.some((a) => a.includes("surgery"))) avoids.push("Surgery and irreversible launches. An eclipse day is for watching, not cutting.");
	if (earth === "enemy") avoids.push("Pushing the month. This Chinese month clashes with your year animal.");
	if (secret === "secret-enemy") avoids.push("Quiet friction with the month animal. Do not pick the fight.");
	if (!dos.length) dos.push(togetherMean || "Match the action to the universal number and the day.");
	if (!avoids.length) avoids.push("Nothing is hard-blocked. Still skip what fights the universal number or the calendar day.");
	const uMean = MEANING[universal.reduced] ?? "";
	const dMean = MEANING[calendar.reduced] ?? "";
	const universalLine = `Universal ${numLabel(universal)}. ${uMean}`.trim();
	const dayLine = `The day itself is ${labelDay}. ${dMean}`.trim();
	const combinedLine = `Together ${labelCombined}. ${togetherMean}`.trim();
	let tail = togetherMean || "move with both numbers";
	if ([universal.reduced, calendar.reduced].includes(9)) tail = "a 9 is in the reading — finish, and do not open a new purchase";
	else if (tones.includes("fatal")) tail = "a fatal-attraction date — do not force new deals";
	else if (tones.includes("soulmate")) tail = "a soulmate window — show up for people";
	else if (tones.includes("wealth") || universal.reduced === 8 || calendar.reduced === 8) tail = "a money day — price, sign, collect";
	else if (tones.includes("beneficial")) tail = "a beneficial day — ask, launch, travel";
	else if (tones.includes("master")) tail = "a master day — one important act";
	const reading = `${universalLine} ${dayLine} ${combinedLine}`;
	const notes = [
		"The personal day is not part of this reading.",
		`Personal year ${numLabel(personalYear)} and personal month ${numLabel(personalMonth)} only say how the cycle is moving.`,
		secret ? `Month animal is a ${secret.replace("-", " ")} of your ${chart.yearAnimal}.` : `${animalLabel(monthAnimal)} month, ${MONTH_SPAN[monthAnimal]}. It is ${earth} to your ${chart.yearAnimal}.`,
		tones.length ? `Date marks: ${tones.map((t) => LIST_LABEL[t]).join(", ")}.` : "No special date mark beyond the universal number and the calendar day."
	];
	return {
		y,
		m,
		d,
		iso,
		weekday: weekday(y, m, d),
		universal,
		labelU: numLabel(universal),
		calendar,
		labelDay,
		combined,
		labelCombined,
		universalLine,
		dayLine,
		combinedLine,
		personal,
		labelP: numLabel(personal),
		personalYear,
		personalMonth,
		universalMonth: calcUniversalMonth(y, m),
		universalYear: calcUniversalYear(y),
		tones,
		flags,
		moon,
		moonSign: signFromLon(moonLongitude(y, m, d)),
		sun,
		monthAnimal,
		earth,
		number,
		west,
		dos,
		avoids,
		headline: `Universal ${numLabel(universal)}. Day ${labelDay}. Together ${labelCombined} — ${tail}`,
		reading,
		notes
	};
}
export function buildChart(profile, on) {
	const now = on ?? (() => {
		const t = /* @__PURE__ */ new Date();
		return {
			y: t.getFullYear(),
			m: t.getMonth() + 1,
			d: t.getDate()
		};
	})();
	const core = calcCoreNumbers(profile.firstName, profile.middleName, profile.lastName, profile.month, profile.day, profile.year, now.y);
	const py = calcPersonalYear(profile.month, profile.day, now.m, now.d, now.y);
	const end = new Date(Date.UTC(py.cycleYear + 1, profile.month - 1, profile.day));
	end.setUTCDate(end.getUTCDate() - 1);
	const yearAnimal = chineseSign(profile.year);
	const birthMonthAnimal = chineseMonthSign(profile.month, profile.day);
	const born = birthHour(profile);
	const hour = born.sign;
	const birthPersonalMonth = calcPersonalMonth(py.reduced, profile.month);
	const sun = sunSign(profile.month, profile.day);
	const sid = (sunLongitude(profile.year, profile.month, profile.day) - 23.85 + 360) % 360;
	const moonLon = moonLongitude(profile.year, profile.month, profile.day);
	const sidMoon = (moonLon - 23.85 + 360) % 360;
	const nak = NAKSHATRA[Math.floor(sidMoon / (360 / 27)) % 27];
	const rise = risingChart(profile.year, profile.month, profile.day, profile.time);
	const primary = unique([
		core.lifePath,
		core.birthdayReduced,
		core.expression
	].map((n) => reduce(n)));
	const secondary = unique([
		core.soulUrge,
		core.personality,
		py.reduced,
		...core.pinnacles
	].map((n) => reduce(n))).filter((n) => !primary.includes(n));
	const months = Array.from({ length: 12 }, (_, i) => {
		const month = i + 1;
		const animal = chineseMonthSign(month, 15);
		const pm = calcPersonalMonth(py.reduced, month);
		const earth = toRel(signRelation(birthMonthAnimal, animal));
		const sunMonth = sunSign(month, 15);
		const west = westRelation(sun, sunMonth);
		return {
			month,
			animal,
			sun: sunMonth,
			personalMonth: pm,
			earth,
			west,
			enemy: earth === "enemy"
		};
	});
	const hours = hourWindows().map((w) => {
		const rel = hour ? toRel(signRelation(hour, w.sign)) : "neutral";
		return {
			...w,
			rel,
			enemy: rel === "enemy"
		};
	});
	const colors = {
		primary: "Black and white",
		secondary: "Black & orange",
		accent: "Green"
	};
	const dayColors = colorsForDay(py.reduced, 4);
	return {
		name: fullName(profile),
		core,
		lifePath: {
			compound: core.lifePathCompound,
			reduced: core.lifePath
		},
		birthday: {
			compound: profile.day,
			reduced: core.birthdayReduced
		},
		py,
		cycleStart: isoOf(py.cycleYear, profile.month, profile.day),
		cycleEnd: isoOf(end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate()),
		yearAnimal,
		birthMonthAnimal,
		hour,
		hourStandard: born.standard,
		hourDaylight: born.daylight,
		birthPersonalMonth,
		sun,
		sunElement: WEST_ELEMENT[sun] ?? "",
		vedicSun: signFromLon(sid),
		vedicMoon: signFromLon(sidMoon),
		nakshatra: nak,
		tropicalMoon: signFromLon(moonLon),
		rise,
		primary,
		secondary,
		months,
		enemyMonths: months.filter((x) => x.enemy),
		hours,
		enemyHours: hours.filter((x) => x.enemy),
		colors,
		dayColors,
		lucky: [99, 98, 28, 8],
		meaning: NUMBER_MEANINGS_FULL[core.lifePath] ?? NUMBER_MEANINGS_FULL[reduce(core.lifePath)]
	};
}
function unique(ns) {
	return [...new Set(ns.filter((n) => n > 0))];
}
export function listDates(profile: BirthProfile, kind: ListKind, year: number): ListedDate[] {
	const out = [];
	if (kind === "soulmate" || kind === "fatal" || kind === "challenging" || kind === "love" || kind === "beneficial") {
		healingood(profile.month, profile.day)[Object.keys(HEAL_MAP).find((k) => HEAL_MAP[k] === kind)].forEach(([m, d]) => {
			if (d > daysInMonth(year, m)) return;
			const y = year;
			const read = readDay(profile, y, m, d);
			out.push({
				iso: read.iso,
				y,
				m,
				d,
				label: fmtMD([m, d]),
				tones: read.tones,
				headline: read.headline.replace(/^Today is /, "")
			});
		});
		return out.sort((a, b) => a.m - b.m || a.d - b.d);
	}
	for (let y = year; y <= year + 1; y++) for (let m = 1; m <= 12; m++) for (let d = 1; d <= daysInMonth(y, m); d++) {
		const read = readDay(profile, y, m, d);
		if (read.tones.includes(kind)) out.push({
			iso: read.iso,
			y,
			m,
			d,
			label: `${padDate(m, d)}, ${y}`,
			tones: read.tones,
			headline: read.headline.replace(/^Today is /, "")
		});
	}
	return out;
}
export function upcoming(profile: BirthProfile, from: { y: number; m: number; d: number }, limit = 6): ListedDate[] {
	const start = Date.UTC(from.y, from.m - 1, from.d);
	const hits = [];
	for (let i = 0; i < 370 && hits.length < limit; i++) {
		const dt = new Date(start + i * 864e5);
		const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
		const read = readDay(profile, y, m, d);
		if (read.tones.length) hits.push({
			iso: read.iso,
			y,
			m,
			d,
			label: `${padDate(m, d)}, ${y}`,
			tones: read.tones,
			headline: read.headline.replace(/^Today is /, "")
		});
	}
	return hits;
}
var GOAL_GOOD = {
	money: [
		8,
		1,
		6
	],
	launching: [
		1,
		8,
		3
	],
	purchases: [
		8,
		4,
		6
	],
	meetings: [
		2,
		3,
		6
	],
	travel: [
		5,
		3,
		1
	],
	love: [
		6,
		2,
		3
	],
	tattoos: [
		1,
		5,
		3
	],
	surgery: [
		4,
		6,
		2
	],
	shoes: [
		1,
		8,
		5
	],
	llc: [
		8,
		1,
		4
	],
	contracts: [
		4,
		8,
		6
	]
};
var GOAL_BAD = {
	money: [9, 7],
	launching: [9, 4],
	purchases: [9, 7],
	meetings: [9, 5],
	travel: [4, 8],
	love: [4, 7],
	tattoos: [
		9,
		4,
		7
	],
	surgery: [
		9,
		5,
		8
	],
	shoes: [9, 7],
	llc: [9, 5],
	contracts: [5, 9]
};
export function scoreGoal(profile, y, m, d, goal) {
	const read = readDay(profile, y, m, d);
	if (goal === "shoes") {
		let score = 1;
		const reasons = [];
		const add = (n, why) => { score += n; reasons.push(why); };
		if (read.tones.includes("love")) add(3, "Love & friendship");
		if (read.tones.includes("soulmate")) add(3, "Soulmate");
		if (read.tones.includes("wealth")) add(3, "Wealth day");
		if (read.tones.includes("beneficial")) add(3, "Beneficial");
		if (read.tones.includes("fatal")) add(-4, "Fatal date");
		if (read.tones.includes("challenging")) add(-2, "Challenging");
		score = Math.max(0, Math.min(10, score));
		return { score, reasons, read };
	}
	let score = 4;
	const reasons = [];
	const bump = (n, why) => {
		score += n;
		reasons.push(why);
	};
	if (read.tones.includes("fatal")) bump(-4, "Fatal date");
	if (read.tones.includes("beneficial")) bump(2, "Beneficial");
	if (read.tones.includes("challenging")) bump(-2, "Challenging");
	if (read.tones.includes("soulmate") && (goal === "love" || goal === "meetings")) bump(3, "Soulmate date");
	if (read.tones.includes("love") && goal === "love") bump(2, "Love & friendship date");
	if (read.tones.includes("wealth") && (goal === "money" || goal === "llc" || goal === "contracts" || goal === "purchases")) bump(3, "Wealth day");
	if (read.tones.includes("master")) bump(1, "Master day");
	if (GOAL_GOOD[goal].includes(read.personal.reduced) || GOAL_GOOD[goal].includes(read.universal.reduced)) bump(2, "Number fits the goal");
	if (GOAL_BAD[goal].includes(read.universal.reduced) || GOAL_BAD[goal].includes(read.personal.reduced)) bump(-2, "Number works against the goal");
	if (read.flags.includes("Eclipse") && (goal === "surgery" || goal === "launching" || goal === "contracts")) bump(-3, "Eclipse");
	if (read.earth === "enemy") bump(-1, "Enemy month");
	if (goal === "purchases" && (read.universal.reduced === 9 || read.personal.reduced === 9)) bump(-2, "9-day — skip the big buy");
	score = Math.max(0, Math.min(10, score));
	return {
		score,
		reasons,
		read
	};
}
export function scanMonth(profile, y, m, goal) {
	const days = [];
	for (let d = 1; d <= daysInMonth(y, m); d++) days.push({
		d,
		...scoreGoal(profile, y, m, d, goal)
	});
	return days;
}
export function yearWindows(profile, y, goal, limit = 8) {
	const rows = [];
	for (let m = 1; m <= 12; m++) for (let d = 1; d <= daysInMonth(y, m); d++) {
		const s = scoreGoal(profile, y, m, d, goal);
		if (s.score >= 7) rows.push({
			iso: isoOf(y, m, d),
			label: `${padDate(m, d)}`,
			score: s.score,
			reasons: s.reasons
		});
	}
	return rows.sort((a, b) => b.score - a.score || a.iso.localeCompare(b.iso)).slice(0, limit);
}
export function openOn(profile, item, from) {
	const start = Date.UTC(from.y, from.m - 1, from.d);
	const hits = [];
	for (let i = 0; i < 370 && hits.length < 8; i++) {
		const dt = new Date(start + i * 864e5);
		const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
		const read = readDay(profile, y, m, d);
		const marks = OPEN_MARKS.filter((k) => read.tones.includes(k));
		if (!marks.length) continue;
		hits.push({
			iso: read.iso,
			label: `${padDate(m, d)}, ${y}`,
			why: marks.map((k) => LIST_LABEL[k].replace(/ dates| days/, "")).join(", "),
			score: marks.length
		});
	}
	hits.sort((a, b) => b.score - a.score || a.iso.localeCompare(b.iso));
	return { item: item || "This", hits };
}
export function pairRead(a, b) {
	const ca = buildChart({
		firstName: a.name,
		middleName: "",
		lastName: "",
		year: a.year,
		month: a.month,
		day: a.day,
		time: "",
		place: ""
	}, {
		y: a.year,
		m: a.month,
		d: a.day
	});
	const cb = buildChart({
		firstName: b.name,
		middleName: "",
		lastName: "",
		year: b.year,
		month: b.month,
		day: b.day,
		time: "",
		place: ""
	}, {
		y: b.year,
		m: b.month,
		d: b.day
	});
	const num = numberRelation(ca.lifePath.reduced, cb.lifePath.reduced);
	const earth = signRelation(ca.yearAnimal, cb.yearAnimal);
	const secret = secretRelation(ca.yearAnimal, cb.yearAnimal);
	const west = westRelation(ca.sun, cb.sun);
	const name = calcCompatibility(ca.lifePath.reduced, ca.core.expression || ca.lifePath.reduced, cb.lifePath.reduced, cb.core.expression || cb.lifePath.reduced);
	const { sets } = healSet({
		firstName: "",
		middleName: "",
		lastName: "",
		...a,
		time: "",
		place: ""
	});
	const md = `${b.month}-${b.day}`;
	const marks = [];
	if (sets.soulmate?.has(md)) marks.push("Their birthday is your soulmate date");
	if (sets.fatal?.has(md)) marks.push("Their birthday is your fatal-attraction date");
	if (sets.beneficial?.has(md)) marks.push("Their birthday is your beneficial date");
	if (sets.love?.has(md)) marks.push("Their birthday is your love & friendship date");
	if (sets.challenging?.has(md)) marks.push("Their birthday is your challenging date");
	let score = name.score;
	if (num === "friend" || num === "soulmate") score += 8;
	if (num === "enemy" || num === "worst") score -= 14;
	if (earth === "friend") score += 8;
	if (earth === "enemy") score -= 12;
	if (secret === "secret-friend") score += 4;
	if (secret === "secret-enemy") score -= 6;
	if (west === "friend") score += 4;
	if (west === "enemy") score -= 6;
	score = Math.max(1, Math.min(99, score));
	const lines = [
		`Life Path ${ca.lifePath.compound}/${ca.lifePath.reduced} vs ${cb.lifePath.compound}/${cb.lifePath.reduced} — ${num}.`,
		`Chinese ${ca.yearAnimal} vs ${cb.yearAnimal} — ${earth}${secret ? `, ${secret.replace("-", " ")}` : ""}.`,
		`Western ${ca.sun} vs ${cb.sun} — ${west}. Month animals ${ca.birthMonthAnimal} vs ${cb.birthMonthAnimal}.`,
		...marks
	];
	return {
		score,
		num,
		earth,
		secret,
		west,
		lines,
		a: ca,
		b: cb
	};
}
export const CATALOG = [
	{
		kind: "Country",
		name: "United States",
		year: 1776,
		month: 7,
		day: 4,
		note: "Independence"
	},
	{
		kind: "Country",
		name: "Mexico",
		year: 1810,
		month: 9,
		day: 16,
		note: "Independence"
	},
	{
		kind: "Country",
		name: "Canada",
		year: 1867,
		month: 7,
		day: 1,
		note: "Confederation"
	},
	{
		kind: "Country",
		name: "India",
		year: 1947,
		month: 8,
		day: 15,
		note: "Independence"
	},
	{
		kind: "Country",
		name: "Japan",
		year: 1947,
		month: 5,
		day: 3,
		note: "Constitution"
	},
	{
		kind: "Country",
		name: "China",
		year: 1949,
		month: 10,
		day: 1,
		note: "Founding"
	},
	{
		kind: "Country",
		name: "France",
		year: 1789,
		month: 7,
		day: 14,
		note: "Bastille"
	},
	{
		kind: "Country",
		name: "Brazil",
		year: 1822,
		month: 9,
		day: 7,
		note: "Independence"
	},
	{
		kind: "Country",
		name: "Germany",
		year: 1990,
		month: 10,
		day: 3,
		note: "Reunification"
	},
	{
		kind: "Country",
		name: "Italy",
		year: 1861,
		month: 3,
		day: 17,
		note: "Unification"
	},
	{
		kind: "Country",
		name: "Australia",
		year: 1901,
		month: 1,
		day: 1,
		note: "Federation"
	},
	{
		kind: "Country",
		name: "United Kingdom",
		year: 1707,
		month: 5,
		day: 1,
		note: "Acts of Union"
	},
	{
		kind: "City",
		name: "Chicago",
		year: 1837,
		month: 3,
		day: 4,
		note: "Incorporation"
	},
	{
		kind: "City",
		name: "New York",
		year: 1625,
		month: 1,
		day: 1,
		note: "Dutch settlement era, dated Jan 1"
	},
	{
		kind: "City",
		name: "Los Angeles",
		year: 1781,
		month: 9,
		day: 4,
		note: "Founding"
	},
	{
		kind: "City",
		name: "Houston",
		year: 1836,
		month: 8,
		day: 30,
		note: "Founding"
	},
	{
		kind: "City",
		name: "Miami",
		year: 1896,
		month: 7,
		day: 28,
		note: "Incorporation"
	},
	{
		kind: "City",
		name: "Austin",
		year: 1839,
		month: 12,
		day: 27,
		note: "Founding"
	},
	{
		kind: "City",
		name: "Seattle",
		year: 1869,
		month: 12,
		day: 2,
		note: "Incorporation"
	},
	{
		kind: "City",
		name: "Denver",
		year: 1858,
		month: 11,
		day: 22,
		note: "Founding"
	},
	{
		kind: "City",
		name: "Toronto",
		year: 1834,
		month: 3,
		day: 6,
		note: "Incorporation"
	},
	{
		kind: "City",
		name: "London",
		year: 1066,
		month: 12,
		day: 25,
		note: "Norman era marker"
	},
	{
		kind: "City",
		name: "Paris",
		year: 508,
		month: 1,
		day: 1,
		note: "Clovis-era marker"
	},
	{
		kind: "City",
		name: "Tokyo",
		year: 1457,
		month: 4,
		day: 8,
		note: "Edo castle era"
	},
	{
		kind: "City",
		name: "Singapore",
		year: 1819,
		month: 2,
		day: 6,
		note: "Modern founding"
	},
	{
		kind: "City",
		name: "Dubai",
		year: 1833,
		month: 6,
		day: 9,
		note: "Al Maktoum settlement"
	},
	{
		kind: "Brand",
		name: "Nike",
		year: 1964,
		month: 1,
		day: 25,
		note: "Blue Ribbon Sports"
	},
	{
		kind: "Brand",
		name: "Apple",
		year: 1976,
		month: 4,
		day: 1,
		note: "Founding"
	},
	{
		kind: "Brand",
		name: "Google",
		year: 1998,
		month: 9,
		day: 4,
		note: "Incorporation"
	},
	{
		kind: "Brand",
		name: "Amazon",
		year: 1994,
		month: 7,
		day: 5,
		note: "Founding"
	},
	{
		kind: "Brand",
		name: "Adidas",
		year: 1949,
		month: 8,
		day: 18,
		note: "Registration"
	},
	{
		kind: "Brand",
		name: "Coca-Cola",
		year: 1886,
		month: 5,
		day: 8,
		note: "First sale"
	},
	{
		kind: "Car",
		name: "Ford",
		year: 1903,
		month: 6,
		day: 16,
		note: "Incorporation"
	},
	{
		kind: "Car",
		name: "Toyota",
		year: 1937,
		month: 8,
		day: 28,
		note: "Founding"
	},
	{
		kind: "Car",
		name: "Ferrari",
		year: 1947,
		month: 3,
		day: 12,
		note: "Founding"
	},
	{
		kind: "Car",
		name: "Porsche",
		year: 1931,
		month: 4,
		day: 25,
		note: "Founding"
	},
	{
		kind: "Car",
		name: "BMW",
		year: 1916,
		month: 3,
		day: 7,
		note: "Founding"
	},
	{
		kind: "Car",
		name: "Mercedes-Benz",
		year: 1926,
		month: 6,
		day: 28,
		note: "Merger"
	},
	{
		kind: "School",
		name: "Harvard",
		year: 1636,
		month: 9,
		day: 8,
		note: "Founding"
	},
	{
		kind: "School",
		name: "Stanford",
		year: 1885,
		month: 11,
		day: 11,
		note: "Founding"
	},
	{
		kind: "School",
		name: "UCLA",
		year: 1919,
		month: 5,
		day: 23,
		note: "Founding"
	}
];
export function rankCatalog(profile, kind) {
	const you = {
		name: fullName(profile),
		year: profile.year,
		month: profile.month,
		day: profile.day
	};
	return CATALOG.filter((c) => !kind || c.kind === kind).map((c) => {
		const pair = pairRead(you, c);
		return {
			...c,
			score: pair.score,
			lines: pair.lines
		};
	}).sort((a, b) => b.score - a.score);
}
export function dreamRead(text) {
	const n = pythagoreanValue(text);
	const mean = NUMBER_MEANINGS_FULL[n.reduced];
	return {
		letters: (text.toUpperCase().match(/[A-Z]/g) ?? []).length,
		number: n,
		title: mean?.title ?? "Unnumbered",
		reading: mean ? `The dream reduces to ${n.compound}/${n.reduced}, ${mean.title}. ${mean.meaning} Treat it as a symbol for the day, not a prediction.` : "Not enough letters to read."
	};
}
export function pricesToEight(base) {
	const start = Math.max(1, Math.round(base));
	const hits = [];
	for (let n = Math.max(1, start - 40); n <= start + 40 && hits.length < 8; n++) if (reduce(digitSum(n)) === 8) hits.push(n);
	return hits;
}
export function saturnNote(profile, y, m, d) {
	const age = y - profile.year - (m < profile.month || m === profile.month && d < profile.day ? 1 : 0);
	const lines = [];
	const sun = sunSign(m, d);
	if (sun === "Capricorn" || sun === "Aquarius") lines.push(`Sun is in ${sun}. This is Saturn's season — slow builds beat sudden bets.`);
	if (age >= 27 && age <= 30 || age >= 56 && age <= 60) lines.push(`You are ${age}. That sits in a Saturn-return window (around 29 and again near 58). Finish structures. Do not abandon the work because it feels heavy.`);
	const monthEclipse = [...ECLIPSES].filter((iso) => iso.startsWith(`${y}-${String(m).padStart(2, "0")}`));
	if (monthEclipse.length) lines.push(`Eclipse dates this month: ${monthEclipse.join(", ")}. Watch the house of your sun. Do not schedule surgery on those days.`);
	if (!lines.length) lines.push(`You are ${age}. No Saturn-return window and the sun is not in Capricorn or Aquarius. Saturn is background, not the headline.`);
	const natal = buildChart(profile, {
		y,
		m,
		d
	});
	return {
		age,
		lines,
		eclipseHouse: natal.rise ? (WEST_ORDER.indexOf(sun) - WEST_ORDER.indexOf(natal.rise.sign) + 12) % 12 + 1 : null,
		saturnNumbers: "4 and 8 are the Saturn-leaning numbers in this system. Life Path 8 and birthday 8 feel this season more."
	};
}
export function careerFor(lp) {
	const map = {
		1: {
			paths: "Founder, captain, solo practice, anything where you go first.",
			challenge: "Patience with partners. Do not burn the bridge just to lead."
		},
		2: {
			paths: "Counsel, design pairs, diplomacy, support that makes the lead look good.",
			challenge: "Saying the no. Your yes is too cheap if you never refuse."
		},
		3: {
			paths: "Voice, media, teaching, brand, performance.",
			challenge: "Finishing. The idea is not the work."
		},
		4: {
			paths: "Operations, building, finance controls, craft with a standard.",
			challenge: "Rigidity. A perfect system that nobody uses is a failure."
		},
		5: {
			paths: "Sales, travel, markets, roles that change every quarter.",
			challenge: "Scattering. Pick a lane for one cycle."
		},
		6: {
			paths: "Care, hospitality, home, community brands, coaching.",
			challenge: "Carrying everyone. Service is not self-erasure."
		},
		7: {
			paths: "Research, strategy, spiritual work, specialist crafts.",
			challenge: "Isolation. Publish the finding or it stays a private hobby."
		},
		8: {
			paths: "Executive, owner, law, deal-making, management of money.",
			challenge: "Control. Authority without a ledger becomes a fight."
		},
		9: {
			paths: "Completion roles, healing, editorial, humanitarian, endings done well.",
			challenge: "Not knowing when the cycle is actually over."
		},
		11: {
			paths: "Vision, broadcast, inspiration, a public idea.",
			challenge: "Nerves. The signal is useless if you will not ship it."
		},
		22: {
			paths: "Large builds: institutions, platforms, civic work.",
			challenge: "Scale without a crew. 22 needs other people."
		},
		33: {
			paths: "Teaching at scale, care systems, raising other leaders.",
			challenge: "Martyrdom. The teacher still has to eat."
		}
	};
	return map[lp] ?? map[reduce(lp)] ?? map[1];
}
export function healthFor(lp, sign) {
	const bySign = {
		Aries: "Aries rules the head and face.",
		Taurus: "Taurus rules the throat and neck.",
		Gemini: "Gemini rules the lungs, arms, and hands.",
		Cancer: "Cancer rules the stomach and the chest.",
		Leo: "Leo rules the heart and the upper back.",
		Virgo: "Virgo rules the digestive system: the stomach, the intestines, and how the body breaks food down.",
		Libra: "Libra rules the kidneys, the lower back, and balance.",
		Scorpio: "Scorpio rules the reproductive system and elimination.",
		Sagittarius: "Sagittarius rules the hips and the thighs.",
		Capricorn: "Capricorn rules the knees, the bones, and the skin.",
		Aquarius: "Aquarius rules the ankles and circulation.",
		Pisces: "Pisces rules the feet and the lymph."
	};
	return {
		number: bySign[sign] ?? "The sun sign sets the body system this chart watches.",
		element: "This follows the sun sign, not the life path number. Traditional correspondence only. Not a diagnosis."
	};
}
export const DIRECTION = {
	Rat: "North",
	Ox: "North",
	Tiger: "East",
	Cat: "East",
	Dragon: "East",
	Snake: "South",
	Horse: "South",
	Goat: "South",
	Monkey: "West",
	Rooster: "West",
	Dog: "West",
	Pig: "North"
};
export function matrixChinese() {
	return SIGNS.map((a) => SIGNS.map((b) => ({
		a,
		b,
		rel: a === b ? "same" : signRelation(a, b),
		secret: secretRelation(a, b)
	})));
}
export function matrixNumbers() {
	const nums = [
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9
	];
	return nums.map((a) => nums.map((b) => ({
		a,
		b,
		rel: numberRelation(a, b)
	})));
}
export function seasonOf(m, d) {
	const s = sunSign(m, d);
	if ([
		"Aries",
		"Taurus",
		"Gemini"
	].includes(s)) return "Spring";
	if ([
		"Cancer",
		"Leo",
		"Virgo"
	].includes(s)) return "Summer";
	if ([
		"Libra",
		"Scorpio",
		"Sagittarius"
	].includes(s)) return "Autumn";
	return "Winter";
}
//#endregion
