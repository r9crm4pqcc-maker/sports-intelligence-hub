// ShemUniverse SportsCode — comprehensive decode for teams, players, dates,
// cities, and stadiums. Combines Pythagorean numerology, Western zodiac,
// Chinese BaZi pillars (year/month/day/hour/"minute"), moon phase + sign,
// and the 1-4-7 / 2-5-8 / 3-6-9 number trines.

import { getTeamMeta, type DateTuple } from "./sports-data";
import { digitSum as sharedDigitSum, pythagoreanValue, reduce } from "./numerology";

// ─── Number reductions ──────────────────────────────────────────────────────
const MASTERS = new Set([11, 22, 33]);
export function reduceMaster(n: number): number {
  return reduce(Math.abs(n));
}
export const digitSum = sharedDigitSum;

// "26/8" style label
export function dayNumberLabel(day: number): string {
  const r = reduceMaster(day);
  return day === r ? `${day}` : `${day}/${r}`;
}

// Pythagorean name value
export function nameNumber(name: string): { compound: number; reduced: number } {
  return pythagoreanValue(name);
}

// Life Path from a date — sum of all digits, reduced (with master numbers)
export function foundingPath(year: number, month: number, day: number): { compound: number; reduced: number } {
  const all = digitSum(year) + month + digitSum(day);
  return { compound: all, reduced: reduceMaster(all) };
}
export function lifePath(year: number, month: number, day: number): { compound: number; reduced: number } {
  const all = `${year}${month}${day}`.split("").reduce((a, c) => a + Number(c), 0);
  return { compound: all, reduced: reduceMaster(all) };
}

// Secondary energy = full compound number before final reduction
export function secondaryEnergy(year: number, month: number, day: number): number {
  return lifePath(year, month, day).compound;
}

// ─── Universal Energy ───────────────────────────────────────────────────────
// Universal Year = sum of year digits, reduced (with masters preserved).
// Universal Month = reduce(universalYear + month).
// Universal Day   = reduce(universalMonth + day) — the "global vibration" for
// the calendar day, distinct from the personal Life Path of a chart.
export function universalYear(year: number): number {
  return reduceMaster(digitSum(year));
}
export function universalMonth(year: number, month: number): number {
  return reduceMaster(universalYear(year) + reduceMaster(month));
}
export function universalDay(year: number, month: number, day: number): number {
  return reduceMaster(universalMonth(year, month) + reduceMaster(day));
}

// ─── Western zodiac ─────────────────────────────────────────────────────────
const WESTERN: { sign: string; element: string; start: [number, number] }[] = [
  { sign: "Capricorn",   element: "Earth", start: [12, 22] },
  { sign: "Aquarius",    element: "Air",   start: [1, 20] },
  { sign: "Pisces",      element: "Water", start: [2, 19] },
  { sign: "Aries",       element: "Fire",  start: [3, 21] },
  { sign: "Taurus",      element: "Earth", start: [4, 20] },
  { sign: "Gemini",      element: "Air",   start: [5, 21] },
  { sign: "Cancer",      element: "Water", start: [6, 21] },
  { sign: "Leo",         element: "Fire",  start: [7, 23] },
  { sign: "Virgo",       element: "Earth", start: [8, 23] },
  { sign: "Libra",       element: "Air",   start: [9, 23] },
  { sign: "Scorpio",     element: "Water", start: [10, 23] },
  { sign: "Sagittarius", element: "Fire",  start: [11, 22] },
];
export function westernSign(month: number, day: number): { sign: string; element: string } {
  for (let i = WESTERN.length - 1; i >= 0; i--) {
    const w = WESTERN[i];
    if (month > w.start[0] || (month === w.start[0] && day >= w.start[1])) {
      return { sign: w.sign, element: w.element };
    }
  }
  return WESTERN[0];
}

// ─── Moon sign (approximate sidereal-cycle estimate) ────────────────────────
const SIGNS_LIST = WESTERN.slice().sort((a, b) =>
  a.start[0] * 100 + a.start[1] - (b.start[0] * 100 + b.start[1])
).map(s => s.sign);
const MOON_REF = Date.UTC(2000, 0, 6) / 86400000;
const SIDEREAL = 27.3216615;
export function moonSign(year: number, month: number, day: number): string {
  const d = Date.UTC(year, month - 1, day) / 86400000;
  const elapsed = ((d - MOON_REF) % SIDEREAL + SIDEREAL) % SIDEREAL;
  const idx = Math.floor((elapsed / SIDEREAL) * 12) % 12;
  return SIGNS_LIST[idx];
}

// ─── Chinese year / month / day / hour / minute animals ────────────────────
const ANIMAL_YEAR = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];

export function chineseYear(year: number, month: number, day: number): string {
  const adj = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
  const idx = ((adj - 2020) % 12 + 12) % 12;
  return ANIMAL_YEAR[idx];
}

const MONTH_TABLE: { startM: number; startD: number; animal: string }[] = [
  { startM: 2,  startD: 4,  animal: "Tiger"   },
  { startM: 3,  startD: 6,  animal: "Rabbit"  },
  { startM: 4,  startD: 5,  animal: "Dragon"  },
  { startM: 5,  startD: 6,  animal: "Snake"   },
  { startM: 6,  startD: 6,  animal: "Horse"   },
  { startM: 7,  startD: 7,  animal: "Goat"    },
  { startM: 8,  startD: 8,  animal: "Monkey"  },
  { startM: 9,  startD: 8,  animal: "Rooster" },
  { startM: 10, startD: 8,  animal: "Dog"     },
  { startM: 11, startD: 7,  animal: "Pig"     },
  { startM: 12, startD: 7,  animal: "Rat"     },
  { startM: 1,  startD: 6,  animal: "Ox"      },
];
export function chineseMonth(month: number, day: number): string {
  let current = "Ox";
  for (const row of MONTH_TABLE) {
    const m = row.startM, d = row.startD;
    if (month > m || (month === m && day >= d)) current = row.animal;
  }
  if (month === 1 && day < 6) current = "Rat";
  if (month === 1 && day >= 6) current = "Ox";
  if (month === 2 && day < 4)  current = "Ox";
  return current;
}

// Chinese hour: 12 two-hour periods starting 23:00 = Rat
export function chineseHour(hour24: number): string {
  const shifted = (hour24 + 1) % 24; // 23→0 → Rat index 0
  return ANIMAL_YEAR[Math.floor(shifted / 2)];
}

// Chinese "minute" — mystical extension: 12 animals across 60 minutes (5 min each)
export function chineseMinute(minute: number): string {
  return ANIMAL_YEAR[Math.floor((minute % 60) / 5)];
}

// ─── Timezone-aware Chinese pillars ─────────────────────────────────────────
// Map common venue cities → IANA tz. Extend as needed.
export const CITY_TZ: Record<string, string> = {
  "New York":"America/New_York","Boston":"America/New_York","Philadelphia":"America/New_York",
  "Washington":"America/New_York","Miami":"America/New_York","Atlanta":"America/New_York",
  "Baltimore":"America/New_York","Charlotte":"America/New_York","Cleveland":"America/New_York",
  "Cincinnati":"America/New_York","Detroit":"America/New_York","Toronto":"America/Toronto",
  "Montreal":"America/Toronto","Tampa":"America/New_York","St. Petersburg":"America/New_York",
  "Orlando":"America/New_York","Pittsburgh":"America/New_York","Indianapolis":"America/Indiana/Indianapolis",
  "Chicago":"America/Chicago","Milwaukee":"America/Chicago","Minneapolis":"America/Chicago",
  "Kansas City":"America/Chicago","St. Louis":"America/Chicago","Houston":"America/Chicago",
  "Dallas":"America/Chicago","Arlington":"America/Chicago","San Antonio":"America/Chicago",
  "New Orleans":"America/Chicago","Nashville":"America/Chicago","Memphis":"America/Chicago",
  "Denver":"America/Denver","Salt Lake City":"America/Denver","Phoenix":"America/Phoenix",
  "Las Vegas":"America/Los_Angeles","Los Angeles":"America/Los_Angeles","Anaheim":"America/Los_Angeles",
  "San Diego":"America/Los_Angeles","San Francisco":"America/Los_Angeles","Oakland":"America/Los_Angeles",
  "Sacramento":"America/Los_Angeles","San Jose":"America/Los_Angeles","Portland":"America/Los_Angeles",
  "Seattle":"America/Los_Angeles","Vancouver":"America/Vancouver","Edmonton":"America/Edmonton",
  "Calgary":"America/Edmonton","Winnipeg":"America/Winnipeg","Ottawa":"America/Toronto",
  "Mexico City":"America/Mexico_City","Guadalajara":"America/Mexico_City","Monterrey":"America/Monterrey",
  "Buffalo":"America/New_York","Orchard Park":"America/New_York","Foxborough":"America/New_York",
  "East Rutherford":"America/New_York","Landover":"America/New_York","Miami Gardens":"America/New_York",
  "Jacksonville":"America/New_York","Glendale":"America/Phoenix","Inglewood":"America/Los_Angeles",
  "Santa Clara":"America/Los_Angeles","Green Bay":"America/Chicago","Oklahoma City":"America/Chicago",
  "Paradise":"America/Los_Angeles",
  "London":"Europe/London","Manchester":"Europe/London","Liverpool":"Europe/London",
  "Madrid":"Europe/Madrid","Barcelona":"Europe/Madrid","Paris":"Europe/Paris","Berlin":"Europe/Berlin",
  "Munich":"Europe/Berlin","Rome":"Europe/Rome","Milan":"Europe/Rome","Turin":"Europe/Rome",
  "Amsterdam":"Europe/Amsterdam","Lisbon":"Europe/Lisbon","Athens":"Europe/Athens",
  "Doha":"Asia/Qatar","Tokyo":"Asia/Tokyo","Beijing":"Asia/Shanghai","Sydney":"Australia/Sydney",
};

export function cityTz(city?: string): string {
  if (!city) return "America/New_York";
  return CITY_TZ[city] ?? CITY_TZ[city.replace(/,.*$/, "").trim()] ?? "America/New_York";
}

/** Break an ISO instant into {y,m,d,h,min} using the venue's IANA tz. */
export function partsInTz(iso: string, tz: string): { y:number; m:number; d:number; h:number; min:number } {
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) {
    const n = new Date();
    return { y:n.getFullYear(), m:n.getMonth()+1, d:n.getDate(), h:n.getHours(), min:n.getMinutes() };
  }
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year:"numeric", month:"2-digit", day:"2-digit",
    hour:"2-digit", minute:"2-digit", hour12:false,
  });
  const parts: Record<string,string> = {};
  for (const p of fmt.formatToParts(dt)) if (p.type !== "literal") parts[p.type] = p.value;
  return {
    y:+parts.year, m:+parts.month, d:+parts.day,
    h:+parts.hour % 24, min:+parts.minute,
  };
}

export function chinesePillarsAt(iso: string, tz: string) {
  const p = partsInTz(iso, tz);
  return {
    year: chineseYear(p.y, p.m, p.d),
    month: chineseMonth(p.m, p.d),
    hour: chineseHour(p.h),
    minute: chineseMinute(p.min),
    parts: p,
  };
}

// ─── Moon phase + lunar-cycle pick ─────────────────────────────────────────
export const LUNAR_BIAS: Record<string, { bias: "FAVORITES" | "UNDERDOGS" | "SLIGHT UNDERDOGS"; note: string }> = {
  "New Moon":         { bias: "FAVORITES",        note: "Fresh starts favor the chalk" },
  "Waxing Crescent":  { bias: "FAVORITES",        note: "Building momentum stays with favorites" },
  "First Quarter":    { bias: "FAVORITES",        note: "Decisive energy backs favorites" },
  "Waxing Gibbous":   { bias: "SLIGHT UNDERDOGS", note: "Subtle shift — underdog line value" },
  "Full Moon":        { bias: "UNDERDOGS",        note: "Maximum chaos — underdogs strike" },
  "Waning Gibbous":   { bias: "UNDERDOGS",        note: "Release phase keeps underdogs alive" },
  "Last Quarter":     { bias: "UNDERDOGS",        note: "Surrender energy — dogs hit" },
  "Waning Crescent":  { bias: "FAVORITES",        note: "Reset to order — favorites again" },
};

export function moonPhase(year: number, month: number, day: number): { phase: keyof typeof LUNAR_BIAS; waxing: boolean; bias: string; biasNote: string } {
  const ref = Date.UTC(2000, 0, 6) / 86400000;
  const d = Date.UTC(year, month - 1, day) / 86400000;
  const cycle = (((d - ref) % 29.53059) + 29.53059) % 29.53059;
  let phase: keyof typeof LUNAR_BIAS;
  if      (cycle < 1.85)  phase = "New Moon";
  else if (cycle < 7.38)  phase = "Waxing Crescent";
  else if (cycle < 9.22)  phase = "First Quarter";
  else if (cycle < 14.77) phase = "Waxing Gibbous";
  else if (cycle < 16.61) phase = "Full Moon";
  else if (cycle < 22.15) phase = "Waning Gibbous";
  else if (cycle < 23.99) phase = "Last Quarter";
  else                    phase = "Waning Crescent";
  const meta = LUNAR_BIAS[phase];
  return { phase, waxing: cycle < 14.765, bias: meta.bias, biasNote: meta.note };
}

/** Estimate the moon phase at the exact kickoff instant using a synodic-cycle model. */
/** Convert an ISO instant or venue-local timestamp into an absolute timestamp. */
export function instantAtVenue(instant: string, timeZone?: string): number | null {
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(instant)) {
    const timestamp = Date.parse(instant);
    return Number.isFinite(timestamp) ? timestamp : null;
  }
  const match = instant.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?$/);
  if (!match || !timeZone) return null;
  const [, ys, ms, ds, hs, mins, secs = "0"] = match;
  const parts = [Number(ys), Number(ms), Number(ds), Number(hs), Number(mins), Number(secs)];
  const nominalUtc = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const local = Object.fromEntries(formatter.formatToParts(new Date(nominalUtc))
    .filter(part => part.type !== "literal")
    .map(part => [part.type, Number(part.value)]));
  const displayedAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
  const timestamp = nominalUtc - (displayedAsUtc - nominalUtc);
  const roundTrip = Object.fromEntries(formatter.formatToParts(new Date(timestamp))
    .filter(part => part.type !== "literal")
    .map(part => [part.type, Number(part.value)]));
  return parts[0] === roundTrip.year && parts[1] === roundTrip.month && parts[2] === roundTrip.day &&
    parts[3] === roundTrip.hour && parts[4] === roundTrip.minute && parts[5] === roundTrip.second
    ? timestamp
    : null;
}

export function moonPhaseAt(instant: string, timeZone?: string): {
  phase: keyof typeof LUNAR_BIAS;
  waxing: boolean;
  bias: string;
  biasNote: string;
  illumination: number;
  ageDays: number;
} | null {
  const timestamp = instantAtVenue(instant, timeZone);
  if (timestamp === null) return null;
  const synodicDays = 29.530588853;
  const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const elapsedDays = (timestamp - referenceNewMoon) / 86_400_000;
  const ageDays = ((elapsedDays % synodicDays) + synodicDays) % synodicDays;
  let phase: keyof typeof LUNAR_BIAS;
  if      (ageDays < 1.85)  phase = "New Moon";
  else if (ageDays < 7.38)  phase = "Waxing Crescent";
  else if (ageDays < 9.22)  phase = "First Quarter";
  else if (ageDays < 14.77) phase = "Waxing Gibbous";
  else if (ageDays < 16.61) phase = "Full Moon";
  else if (ageDays < 22.15) phase = "Waning Gibbous";
  else if (ageDays < 23.99) phase = "Last Quarter";
  else                      phase = "Waning Crescent";
  const meta = LUNAR_BIAS[phase];
  const illumination = Math.round((1 - Math.cos((2 * Math.PI * ageDays) / synodicDays)) * 50);
  return { phase, waxing: ageDays < synodicDays / 2, bias: meta.bias, biasNote: meta.note, illumination, ageDays };
}

// ─── Number trines ──────────────────────────────────────────────────────────
export const TRINES = [
  { name: "1-4-7", numbers: [1, 4, 7], theme: "Foundation · Order · Mind" },
  { name: "2-5-8", numbers: [2, 5, 8], theme: "Flow · Change · Power" },
  { name: "3-6-9", numbers: [3, 6, 9], theme: "Creation · Harmony · Completion" },
];
export function trineOf(n: number): { name: string; theme: string } | null {
  for (const t of TRINES) if (t.numbers.includes(n)) return { name: t.name, theme: t.theme };
  return null;
}
export function sameTrine(a: number, b: number): boolean {
  const ta = trineOf(a), tb = trineOf(b);
  return !!ta && !!tb && ta.name === tb.name;
}

// ─── Lifepath Compatibility Matrix (ShemUniverse spec) ────────────────────
type CompatRow = { friendly: number[]; neutral: number[]; enemy: number[] };
export const COMPAT: Record<number, CompatRow> = {
  1:  { friendly: [11, 7, 28, 8, 2, 1],              neutral: [3, 4, 5, 6, 22, 33],              enemy: [9] },
  2:  { friendly: [8, 28, 1, 3],                     neutral: [6, 4, 22, 7, 5, 11, 33, 2],       enemy: [9] },
  3:  { friendly: [5, 8, 6, 28, 11, 33, 3, 2],       neutral: [1, 9, 22, 7],                     enemy: [4] },
  4:  { friendly: [6, 9, 8, 7, 4, 2],                neutral: [33, 28, 1, 11, 22],               enemy: [5, 3] },
  5:  { friendly: [3, 33, 5, 7, 9, 8],               neutral: [11, 28, 2, 1],                    enemy: [22, 4, 6] },
  6:  { friendly: [4, 9, 8, 22, 3],                  neutral: [22, 33, 28, 11, 6, 1],            enemy: [7, 5] },
  7:  { friendly: [11, 28, 1, 5, 4, 22],             neutral: [7, 33, 2],                        enemy: [9, 6, 8] },
  8:  { friendly: [1, 28, 2, 6, 5, 22, 4, 3, 33, 8], neutral: [11, 9],                           enemy: [7] },
  9:  { friendly: [4, 5, 6],                         neutral: [3, 8],                            enemy: [9, 7, 22, 11, 28, 33, 1, 2] },
  11: { friendly: [7, 1, 3],                         neutral: [33, 5, 11, 22, 28, 2, 4, 6, 8],   enemy: [9] },
  22: { friendly: [8, 6, 7],                         neutral: [22, 28, 11, 33, 1, 2, 3, 4],      enemy: [5, 9] },
  28: { friendly: [1, 8, 7, 28, 2, 3],               neutral: [4, 6, 22, 33, 5, 11],             enemy: [9] },
  33: { friendly: [8, 5, 3],                         neutral: [4, 6, 11, 33, 28, 22, 1, 2, 7],   enemy: [9] },
};

// Per-pair friendly strength % (fallback 80 when friendly but not listed).
export const COMPAT_STRENGTH: Record<string, number> = {
  "1-11":93,"1-7":90,"1-28":80,"1-8":80,"1-2":80,"1-1":80,
  "2-8":85,"2-28":80,"2-1":80,"2-3":80,
  "3-5":91,"3-8":88,"3-6":80,"3-28":80,"3-11":80,"3-33":80,"3-3":80,"3-2":80,
  "4-6":96,"4-9":80,"4-8":80,"4-7":80,"4-4":80,"4-2":80,
  "5-3":91,"5-33":85,"5-5":85,"5-7":80,"5-9":80,"5-8":80,
  "6-4":96,"6-9":80,"6-8":80,"6-22":80,"6-3":80,
  "7-11":99,"7-28":93,"7-1":90,"7-5":80,"7-4":80,"7-22":80,
  "9-4":80,"9-5":80,"9-6":80,
  "11-7":99,"11-1":93,"11-3":80,
  "22-8":85,"22-6":80,"22-7":80,
  "28-1":93,"28-8":86,"28-7":80,"28-28":80,"28-2":80,"28-3":80,
  "33-8":90,"33-5":85,"33-3":80,
};

export type CompatTier = "self" | "friendly" | "neutral" | "enemy" | "unknown";

export function compatTier(a: number, b: number): CompatTier {
  if (a === b && COMPAT[a]?.friendly.includes(a)) return "friendly";
  if (a === b) return "self";
  const row = COMPAT[a];
  if (!row) return "unknown";
  if (row.friendly.includes(b)) return "friendly";
  if (row.enemy.includes(b))    return "enemy";
  if (row.neutral.includes(b))  return "neutral";
  return "unknown";
}

// Weighted 0-100. Neutral=50, enemy=15, unknown=40, self=80.
export function compatStrength(a: number, b: number): number {
  const t = compatTier(a, b);
  if (t === "friendly") {
    return COMPAT_STRENGTH[`${a}-${b}`] ?? COMPAT_STRENGTH[`${b}-${a}`] ?? 80;
  }
  if (t === "self")    return 80;
  if (t === "neutral") return 50;
  if (t === "enemy")   return 15;
  return 40;
}

export function compatPoints(a: number, b: number): number {
  switch (compatTier(a, b)) {
    case "self":     return 40;
    case "friendly": return 30;
    case "neutral":  return 12;
    case "enemy":    return -20;
    default:         return 0;
  }
}

// ─── Decode shapes ──────────────────────────────────────────────────────────
export interface PersonDecode {
  name: string;
  dob?: { year: number; month: number; day: number };
  secondaryEnergy?: number;
  lifePath?: number;
  nameNumber: number;
  chineseYear?: string;
  chineseMonth?: string;
  westernSign?: string;
  sunSign?: string;
  moonSign?: string;
}

export function decodePerson(name: string, dob?: DateTuple | string | null): PersonDecode {
  let tuple: DateTuple | null = null;
  if (Array.isArray(dob)) tuple = dob;
  else if (typeof dob === "string" && dob) {
    const d = new Date(dob);
    if (!isNaN(d.getTime())) tuple = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
  }
  const nn = nameNumber(name).reduced;
  if (!tuple) return { name, nameNumber: nn };
  const [y, m, d] = tuple;
  const sign = westernSign(m, d).sign;
  return {
    name,
    dob: { year: y, month: m, day: d },
    secondaryEnergy: secondaryEnergy(y, m, d),
    lifePath: lifePath(y, m, d).reduced,
    nameNumber: nn,
    chineseYear: chineseYear(y, m, d),
    chineseMonth: chineseMonth(m, d),
    westernSign: sign,
    sunSign: sign,
    moonSign: moonSign(y, m, d),
  };
}

export interface TeamDecode extends PersonDecode {
  founded?: { year: number; month: number; day: number };
  dayNumber?: string;
}

export function decodeTeam(teamName: string): TeamDecode {
  const meta = getTeamMeta(teamName);
  const nn = nameNumber(teamName).reduced;
  if (!meta) return { name: teamName, nameNumber: nn };
  const [y, m, d] = meta.founded;
  const sign = westernSign(m, d).sign;
  return {
    name: teamName,
    founded: { year: y, month: m, day: d },
    dob: { year: y, month: m, day: d },
    dayNumber: dayNumberLabel(d),
    secondaryEnergy: secondaryEnergy(y, m, d),
    lifePath: lifePath(y, m, d).reduced,
    nameNumber: nn,
    chineseYear: chineseYear(y, m, d),
    chineseMonth: chineseMonth(m, d),
    westernSign: sign,
    sunSign: sign,
    moonSign: moonSign(y, m, d),
  };
}

export interface CityDecode {
  name: string;
  founded?: { year: number; month: number; day: number };
  secondaryEnergy?: number;
  lifePath?: number;
  chineseYear?: string;
  chineseMonth?: string;
  westernSign?: string;
}
export function decodeCity(name: string, founded?: DateTuple): CityDecode {
  if (!founded) return { name };
  const [y, m, d] = founded;
  return {
    name,
    founded: { year: y, month: m, day: d },
    secondaryEnergy: secondaryEnergy(y, m, d),
    lifePath: lifePath(y, m, d).reduced,
    chineseYear: chineseYear(y, m, d),
    chineseMonth: chineseMonth(m, d),
    westernSign: westernSign(m, d).sign,
  };
}

export interface StadiumDecode extends CityDecode {
  nameNumber: number;
  dayNumber?: string;
}
export function decodeStadium(name: string, opened?: DateTuple): StadiumDecode {
  const nn = nameNumber(name).reduced;
  if (!opened) return { name, nameNumber: nn };
  const [y, m, d] = opened;
  return {
    name,
    nameNumber: nn,
    founded: { year: y, month: m, day: d },
    dayNumber: dayNumberLabel(d),
    secondaryEnergy: secondaryEnergy(y, m, d),
    lifePath: lifePath(y, m, d).reduced,
    chineseYear: chineseYear(y, m, d),
    chineseMonth: chineseMonth(m, d),
    westernSign: westernSign(m, d).sign,
  };
}

export interface DailyDecode {
  lifePath: number;
  secondaryEnergy: number;
  dayEnergy: number;
  dayEnergyLabel: string;
  universalYear: number;
  universalMonth: number;
  universalDay: number;
  chineseYear: string;
  chineseMonth: string;
  chineseHour?: string;
  chineseMinute?: string;
  westernSign: string;
  moonSign: string;
  moonPhase: string;
  lunarBias: string;
  lunarNote: string;
  trine: string | null;
}

export function decodeDate(
  year: number, month: number, day: number,
  hour?: number, minute?: number,
): DailyDecode {
  const lp = lifePath(year, month, day).reduced;
  const se = secondaryEnergy(year, month, day);
  const dayE = reduceMaster(day);
  const mp = moonPhase(year, month, day);
  const trine = trineOf(dayE);
  return {
    lifePath: lp,
    secondaryEnergy: se,
    dayEnergy: dayE,
    dayEnergyLabel: dayNumberLabel(day),
    universalYear: universalYear(year),
    universalMonth: universalMonth(year, month),
    universalDay: universalDay(year, month, day),
    chineseYear: chineseYear(year, month, day),
    chineseMonth: chineseMonth(month, day),
    chineseHour: hour != null ? chineseHour(hour) : undefined,
    chineseMinute: minute != null ? chineseMinute(minute) : undefined,
    westernSign: westernSign(month, day).sign,
    moonSign: moonSign(year, month, day),
    moonPhase: mp.phase,
    lunarBias: mp.bias,
    lunarNote: mp.biasNote,
    trine: trine ? `${trine.name} — ${trine.theme}` : null,
  };
}

// ─── Game-level pick combining lunar bias + numerology harmony ─────────────
export function decodeGame(args: {
  homeTeam: string;
  awayTeam: string;
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  homeIsFavorite: boolean;
}) {
  const date = decodeDate(args.year, args.month, args.day, args.hour, args.minute);
  const home = decodeTeam(args.homeTeam);
  const away = decodeTeam(args.awayTeam);

  const lunarFavors: "favorites" | "underdogs" =
    date.lunarBias === "FAVORITES" ? "favorites" : "underdogs";
  const lunarSide = lunarFavors === "favorites"
    ? (args.homeIsFavorite ? "home" : "away")
    : (args.homeIsFavorite ? "away" : "home");

  const homeEdge = home.lifePath != null ? Math.abs(home.lifePath - date.lifePath) : 99;
  const awayEdge = away.lifePath != null ? Math.abs(away.lifePath - date.lifePath) : 99;
  const numSide: "home" | "away" = homeEdge <= awayEdge ? "home" : "away";

  const agree = lunarSide === numSide;
  const finalSide = lunarSide;
  const confidence = agree ? 88 : 62;

  return { date, home, away, lunarSide, numSide, finalSide, agree, confidence };
}
