// Full 5-part decode (Game Energies, Teams, Key Players, City, Stadium) + Healingood-style date matrix.
import { reduceNum, lifePath, foundingPath, dayOfYear, luckyNumber, chineseSign, chineseMonthSign, SIGNS, learnedNumberRelation, numberRelation, type Num } from "./vote-decode";
import { calcPersonalYear } from "./numerology";
import { compat } from "./gg33";
import { fmtMD, healingood } from "./healingood";
import { sportsCycles, venueLocalTimeLabel } from "./sports-cycles";
import { chineseYear, moonPhaseAt } from "./sports-decode";
import { learningActive } from "./sports-learning";
import { cueMatchPercent } from "./path28";
import { localHourDate } from "./sports-clock";
import { candidateSportsLifePath } from "./sports-method-candidate";
import { transitLines } from "./transits";

export type Tri = [number, number, number];
const STEMS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthName = (m: number) => MONTHS[(m - 1 + 12) % 12];
const dim = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const ordinal = (y: number, m: number, d: number) => Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 719163;
const num = (n: number): Num => ({ compound: n, reduced: reduceNum(n) });
export const show = (n: Num) => (n.compound === n.reduced ? `${n.reduced}` : `${n.compound}/${n.reduced}`);
const digits = (n: number) => [...String(Math.abs(n))].reduce((a, c) => a + +c, 0);

export function isoWeek(y: number, m: number, d: number): number {
  const t = new Date(Date.UTC(y, m - 1, d));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = Date.UTC(t.getUTCFullYear(), 0, 1);
  return Math.ceil(((t.getTime() - y0) / 86400000 + 1) / 7);
}

export function moon(y: number, m: number, d: number, gameStartTime?: string, venueTimeZone?: string | null) {
  const exact = gameStartTime ? moonPhaseAt(gameStartTime, venueTimeZone ?? undefined) : null;
  if (exact) {
    const localTime = venueTimeZone ? venueLocalTimeLabel(gameStartTime!, venueTimeZone) : null;
    const context = localTime
      ? ` · venue-local kickoff ${localTime}`
      : " · exact kickoff phase; venue timezone not verified";
    return { phase: exact.phase, illum: exact.illumination, label: `${exact.phase}, ${exact.illumination}% lit${context}` };
  }
  const syn = 29.530588853;
  const age = ((((Date.UTC(y, m - 1, d, 12) - Date.UTC(2000, 0, 6, 18, 14)) / 86400000) % syn) + syn) % syn;
  const illum = Math.round(((1 - Math.cos((2 * Math.PI * age) / syn)) / 2) * 100);
  const phase = age < 1.85 ? "New Moon" : age < 5.54 ? "Waxing Crescent" : age < 9.23 ? "First Quarter" : age < 12.92 ? "Waxing Gibbous"
    : age < 16.61 ? "Full Moon" : age < 20.3 ? "Waning Gibbous" : age < 23.99 ? "Last Quarter" : age < 27.68 ? "Waning Crescent" : "New Moon";
  const context = gameStartTime ? " · kickoff time unavailable; date-level estimate" : "";
  return { phase, illum, label: `${phase}, ${illum}%${context}` };
}

const yearStem = (y: number) => (((y - 4) % 10) + 10) % 10;
export const yearPillar = (y: number) => `${STEMS[yearStem(y)]} ${chineseSign(y)}`;
export function monthPillar(y: number, m: number, d: number) {
  const sign = chineseMonthSign(m, d);
  const fromTiger = (SIGNS.indexOf(sign) - 2 + 12) % 12;
  const stem = ((yearStem(y) % 5) * 2 + 2 + fromTiger) % 10;
  return `${STEMS[stem]} ${sign}`;
}
const dayStem = (y: number, m: number, d: number) => (ordinal(y, m, d) + 4) % 10;
export function hourPillar(y: number, m: number, d: number, hour: number) {
  const b = Math.floor((hour + 1) / 2) % 12;
  const stem = ((dayStem(y, m, d) % 5) * 2 + b) % 10;
  const start = (b * 2 + 23) % 24;
  const h12 = (h: number) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? "AM" : "PM"}`;
  return `${STEMS[stem]} ${SIGNS[b]} (${h12(start)} – ${h12((start + 2) % 24)})`;
}

/** Healingood-style date matrix built from the GG33 number chart. */
const SUITS = ["♥", "♣", "♦", "♠"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
/** Destiny Cards solar value: 55 − (2×month + day). 0 = Joker (Dec 31). */
export const solarValue = (m: number, d: number) => 55 - (2 * m + d);
export function birthCard(m: number, d: number): string {
  const v = solarValue(m, d); if (v <= 0) return "Joker";
  return `${RANKS[(v - 1) % 13]}${SUITS[Math.floor((v - 1) / 13)]}`;
}
/** Twin (Soulmate) days: every other day of the year carrying the same Birth Card. */
export function twinDays(m: number, d: number): string[] {
  const v = solarValue(m, d); const out: string[] = [];
  for (let mm = 1; mm <= 12; mm++) { const dd = 55 - v - 2 * mm; if (dd >= 1 && dd <= dim(2001, mm) && !(mm === m && dd === d)) out.push(`${monthName(mm)} ${dd}`); }
  return out;
}
export interface DateMatrix { fatal: string[]; challenging: string[]; soulmate: string[]; beneficial: string[]; lovers: string[]; today: string[] }
/** Diagonal track: every date where day + 2×month = k. */
export function track(k: number): string[] {
  const out: string[] = [];
  for (let m = 1; m <= 12; m++) { const d = k - 2 * m; if (d >= 1 && d <= dim(2001, m)) out.push(`${monthName(m)} ${d}`); }
  return out;
}
/** Date matrix straight from the Healingood 366-day chart for the birth / founding day. */
export function dateMatrix(b: Tri, game: Tri): DateMatrix {
  const [, bm, bd] = b;
  const h = healingood(bm, bd);
  const L = (k: keyof typeof h) => h[k].map(fmtMD);
  const fatal = L("fatal"), soulmate = L("soulmate"), beneficial = L("beneficial"), challenging = L("challenging"), lovers = L("lovers");
  const [, gm, gd] = game; const today: string[] = []; const g = `${monthName(gm)} ${gd}`;
  if (gm === bm && gd === bd) today.push("Game is on the birthday — Beneficial");
  if (soulmate.includes(g)) today.push("Game date is a Soulmate date");
  if (fatal.includes(g)) today.push("Game date is a Fatal Attraction date");
  if (beneficial.includes(g)) today.push("Game date is a Beneficial date");
  if (lovers.includes(g)) today.push("Game date is a Lovers & Friends date");
  if (challenging.includes(g)) today.push("Game date is a Challenging / Rival date");
  return { fatal, challenging, soulmate, beneficial, lovers, today };
}
export function dateScore(m: DateMatrix): number {
  let s = 0;
  for (const t of m.today) { if (/Soulmate|Beneficial/.test(t)) s += 1; if (/Challenging/.test(t)) s -= 1; if (/Fatal/.test(t)) s -= 0.5; }
  return s;
}

export interface CycleRead {
  date: Tri; gameDate: Tri; lp: Num; secondary: Num; doy: number; doyRoot: number; woy: number; woyRoot: number;
  moon: ReturnType<typeof moon>; yearP: string; monthP: string;
  py: Num; pyFullCode: number; pyCycleYear: number; compatibility: number | null; hourKnown: boolean; pm: Num; pd: Num; pw: Num; ph: [number, number, number]; lucky: number; luckyRoot: number; matrix: DateMatrix;
}
/** Every cycle for one dated entity (team, player, city, stadium) on the game day. */
export function readEntity(b: Tri, game: Tri, kickoffHour: number | null, founding = false, candidateMethod = false): CycleRead {
  const [y, m, d] = b; const [gy, gm, gd] = game;
  const rawLp = candidateMethod
    ? candidateSportsLifePath(y, m, d, chineseYear(y, m, d) === "Snake")
    : (founding ? foundingPath : lifePath)(y, m, d);
  const lp = rawLp.compound === 33 && chineseSign(y) !== "Snake"
    ? { ...rawLp, reduced: 6 }
    : rawLp;
  const py = calcPersonalYear(m, d, gm, gd, gy);
  const cycles = sportsCycles(m, d, gy, gm, gd);
  const pm = learningActive() ? cycles.pm : num(py.reduced + gm);
  const pd = learningActive() ? cycles.pd : num(pm.reduced + digits(gd));
  const pw = num(py.reduced + isoWeek(gy, gm, gd));
  const hr = (offset: number) => {
    const clock=localHourDate(game,(kickoffHour ?? 0)+offset);
    const clockPd=learningActive() ? sportsCycles(m,d,...clock.date).pd : pd;
    return reduceNum(clockPd.reduced+digits(clock.hour));
  };
  const doy = dayOfYear(y, m, d); const woy = isoWeek(y, m, d); const lucky = luckyNumber(y, m);
  return { date: b, gameDate: game, lp, secondary: num(d), doy, doyRoot: reduceNum(doy), woy, woyRoot: reduceNum(woy), moon: moon(y, m, d),
     yearP: yearPillar(y), monthP: monthPillar(y, m, d),
    py: { compound: py.compound, reduced: py.reduced }, pyFullCode: cycles.py.fullCode, pyCycleYear: py.cycleYear, compatibility: cueMatchPercent(b, gy, gm, gd)?.pct ?? null, hourKnown: kickoffHour !== null, pm, pd, pw, ph: [hr(0), hr(1), hr(3)],
    lucky, luckyRoot: reduceNum(lucky), matrix: dateMatrix(b, game) };
}

export interface GameEnergies { lp: Num; secondary: Num; doy: number; doyRoot: number; woy: number; woyRoot: number; moon: ReturnType<typeof moon>; yearP: string; monthP: string; hourP: string[]; universalYear: Num; universalMonth: Num; transits: string[] }
export function gameEnergies(game: Tri, kickoffHour: number | null, gameStartTime?: string, venueTimeZone?: string | null): GameEnergies {
  const [y, m, d] = game;
  const uy = reduceNum(digits(y));
  const doy = dayOfYear(y, m, d); const woy = isoWeek(y, m, d);
  const clock=(offset:number)=>{const local=localHourDate(game,(kickoffHour ?? 0)+offset);return hourPillar(...local.date,local.hour);};
  return { lp: learningActive() ? lifePath(y,m,d) : num(m + d + uy), secondary: num(d), doy, doyRoot: reduceNum(doy), woy, woyRoot: reduceNum(woy), moon: moon(y, m, d, gameStartTime, venueTimeZone),
     yearP: yearPillar(y), monthP: monthPillar(y, m, d),
    hourP: kickoffHour === null ? ["Venue timezone not verified — not scored"] : [clock(0),clock(3)],
    // Display-only game-day context requested in the CUE notes; not part of the side score.
    universalYear: num(digits(y)), universalMonth: num(uy + m), transits: transitLines(gameStartTime) };
}

export const recordRoot = (rec?: string) => {
  const m = rec?.match(/(\d+)-(\d+)/); if (!m) return null;
  return reduceNum(+m[1] + +m[2]);
};
/** Side score from the full decode. Closing hour outweighs start and mid (0.15 / 0.15 / 0.40). */
export function sideScore(r: CycleRead, gameLp: number, w = 1, learned = false): number {
  const rel = (n: number) => {
    const x = learned ? learnedNumberRelation(n, gameLp) : numberRelation(n, gameLp);
    if (x === "same" || x === "friend" || x === "soulmate") return 1;
    if (x === "enemy" || x === "worst") return -1;
    return learned ? 0 : compat(n, gameLp).rel === "friendly" ? 0.5 : compat(n, gameLp).rel === "enemy" ? -0.5 : 0;
  };
  return w * (rel(r.pd.reduced) + 0.5 * rel(r.pw.reduced) + (r.hourKnown ? 0.15 * rel(r.ph[0]) + 0.15 * rel(r.ph[1]) + 0.40 * rel(r.ph[2]) : 0) + dateScore(r.matrix));
}
