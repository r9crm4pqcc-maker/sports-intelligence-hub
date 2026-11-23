import { calcPersonalDay, calcPersonalYear } from "./numerology";
import { compat } from "./gg33";
// Learned follows the user-specified hierarchy: numerology leads; zodiac and
// planetary layers modify it; colors and full gematria remain supporting.
import { pythagoreanValue } from "./numerology";
import { chineseYear, moonPhase, moonPhaseAt } from "./sports-decode";
import { healingood } from "./healingood";
import { colorsForDay } from "./colorology";
import { learningActive } from "./sports-learning";
import { ruleId } from "./sports-rules";
import ratings from "./team-ratings.json";
import { TEAM_COLORS } from "./sports-colors";
import { sportsCycles, venueLocalTimeLabel } from "./sports-cycles";
import { masterRuleVotes } from "./sports-master-rules";
import { COLOR_PRIMARY, learnedColorLabel, learnedColorNumber, learnedColorNumbers, sumTeamLogoColors, teamLogoColorCodeLabel } from "./sports-color-code";
import { calibratedWeightDetails } from "./sports-weights";
import { COMPAT as LEARNED_COMPAT } from "./sports-decode";
import { recordVibrations } from "./sports-record-vibrations";
import { learnedScreenshotVotes } from "./learned-screenshot-signals";
import { candidateSportsLifePath, type SportsPersonRole } from "./sports-method-candidate";
export { TEAM_COLORS } from "./sports-colors";
import {
  adjacentMasterForJersey,
  isChampionshipEvent,
  shouldFadeNineLifePathStar,
  sevenEnergyInjuryCaution,
} from "./sports-prediction-rules";

export let NUMEROLOGY_FIRST = false;
export function setNumerologyFirst(v: boolean) { NUMEROLOGY_FIRST = v; }
export type Side = "home" | "away";
export type Step = "Game-day energy" | "Team core" | "Number pairs" | "Chinese zodiac" | "Stars & venue" | "Colors" | "Records";
export interface Vote {
  side: Side;
  weight: number;
  layer: Step;
  reason: string;
  baseWeight?: number;
  weightMultiplier?: number;
  appliedWeight?: number;
  weightSource?: "league" | "global" | "default" | "raw" | "unscaled";
  signalId?: string;
  eventKey?: string;
}

const MASTERS = new Set([11, 22, 33]);
const sumDigits = (n: number) => String(Math.abs(n)).split("").reduce((a, d) => a + Number(d), 0);
/** Only a pure 2 is 2; any bigger number that reduces to 2 (20, 101, 200…) reads as 11. */
export function reduceNum(n: number): number {
  let x = n;
  while (x > 9 && !MASTERS.has(x)) x = sumDigits(x);
  return x === 2 && Math.abs(n) !== 2 ? 11 : x;
}
export interface Num { compound: number; reduced: number }
export function lifePath(y: number, m: number, d: number): Num {
  const compound = sumDigits(y) + sumDigits(m) + sumDigits(d);
  return { compound, reduced: reduceNum(compound) };
}
/** Cue franchise date: the month stays whole, so November 1, 1947 is 11+1+21 = 33, not 24/6. */
export function foundingPath(y: number, m: number, d: number): Num {
  const compound = sumDigits(y) + m + sumDigits(d);
  return { compound, reduced: reduceNum(compound) };
}
/** Day-of-month energy: the 8th = 8, the 19th = 19/1, the 28th = 28/1. */
export const dayEnergy = (d: number): Num => ({ compound: d, reduced: reduceNum(d) });
export const ord = (n: number) => `${n}${[11,12,13].includes(n % 100) ? "th" : ["th","st","nd","rd"][n % 10] ?? "th"}`;
export const fmt = (n: Num) => (n.compound === n.reduced ? `${n.reduced}` : `${n.compound}/${n.reduced}`);

/** Does a number touch any of the day's energies? 28 carries both 8 (wealth) and 1. */
function touches(n: Num, day: number[]): boolean {
  const vals = new Set([n.reduced, n.compound]);
  if (n.compound === 28) { vals.add(8); vals.add(1); }
  return day.some(d => vals.has(d));
}

// ── Number pairs ────────────────────────────────────────────────────────────
export function numberRelation(a: number, b: number): "worst" | "enemy" | "soulmate" | "friend" | "same" | "neutral" {
  const p = (x: number, y: number) => (a === x && b === y) || (a === y && b === x);
  if (p(1, 9)) return "worst";
  if (p(3, 4)) return "enemy";
  if (p(7, 11)) return "soulmate";
  if (p(3, 5) || p(3, 7)) return "friend";
  if (a === b) return "same";
  // GG33 compatibility chart
  const x = compat(a, b).rel, y = compat(b, a).rel;
  if (x === "enemy" || y === "enemy") return "enemy";
  if (x === "friendly") return "friend";
  return "neutral";
}

/** Learned-only compatibility rules from the user's sports matrix. */
export function learnedNumberRelation(a: number, b: number): "worst" | "enemy" | "soulmate" | "friend" | "same" | "neutral" {
  const pair = (x: number, y: number) => (a === x && b === y) || (a === y && b === x);
  if (pair(1, 9) || pair(28, 9)) return "worst";
  if (pair(7, 11)) return "soulmate";
  if (pair(6, 2)) return "friend";

  const relation = (left: number, right: number) => {
    const row = LEARNED_COMPAT[left];
    if (!row) return "neutral";
    if (row.enemy.includes(right)) return "enemy";
    if (row.friendly.includes(right)) return "friend";
    if (row.neutral.includes(right)) return "neutral";
    return "neutral";
  };
  const forward = relation(a, b);
  const reverse = relation(b, a);
  if (forward === "enemy" || reverse === "enemy") return "enemy";
  if (forward === "friend" || reverse === "friend") return "friend";
  if (forward === "neutral" || reverse === "neutral") return "neutral";
  return a === b ? "same" : "neutral";
}

// ── Chinese zodiac ──────────────────────────────────────────────────────────
export const SIGNS = ["Rat", "Ox", "Tiger", "Cat", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"] as const;
export type Sign = typeof SIGNS[number];
export const chineseSign = (year: number): Sign => SIGNS[(((year - 4) % 12) + 12) % 12];
/** Fixed solar-month spans; every animal month turns on the 6th (Tiger Feb 6 – Mar 5). Rat can open Dec 6 or Dec 7; Pig closes Dec 5, so Rat starts Dec 6. Cat is Mao. Goat is the Wei month. */
export const MONTH_SPAN: Record<Sign, string> = {
  Rat: "Dec 6 / Dec 7 – Jan 5",
  Ox: "Jan 6 – Feb 5",
  Tiger: "Feb 6 – Mar 5",
  Cat: "Mar 6 – Apr 5",
  Dragon: "Apr 6 – May 5",
  Snake: "May 6 – Jun 5",
  Horse: "Jun 6 – Jul 5",
  Goat: "Jul 6 – Aug 5",
  Monkey: "Aug 6 – Sep 5",
  Rooster: "Sep 6 – Oct 5",
  Dog: "Oct 6 – Nov 5",
  Pig: "Nov 6 – Dec 5",
};
export function chineseMonthSign(month: number, day: number): Sign {
  const m = day >= 6 ? month : month - 1;
  return SIGNS[((m % 12) + 12) % 12];
}
export const TRINES: Sign[][] = [["Rat", "Monkey", "Dragon"], ["Ox", "Rooster", "Snake"], ["Horse", "Dog", "Tiger"], ["Cat", "Pig", "Goat"]];
export const CLASHES: [Sign, Sign][] = [["Rat", "Horse"], ["Ox", "Goat"], ["Tiger", "Monkey"], ["Cat", "Rooster"], ["Dragon", "Dog"], ["Snake", "Pig"]];
export function signRelation(a: Sign, b: Sign): "friend" | "enemy" | "neutral" {
  if (CLASHES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return "enemy";
  if (TRINES.some(t => t.includes(a) && t.includes(b))) return "friend";
  // Rat & Ox are soulmates — the only friendly pair outside the four groups.
  if ((a === "Rat" && b === "Ox") || (a === "Ox" && b === "Rat")) return "friend";
  return "neutral";
}
/** Named bonds: Rat & Ox are soulmates; Horse (7th sign) & Dog (11th sign) are the greatest friends, not soulmates. */
export function signBond(a: Sign, b: Sign): "soulmates" | "best friends" | null {
  if ((a === "Rat" && b === "Ox") || (a === "Ox" && b === "Rat")) return "soulmates";
  if ((a === "Horse" && b === "Dog") || (a === "Dog" && b === "Horse")) return "best friends";
  return null;
}
/** Liu He secret friends. Cat stands in for Rabbit, matching this chart. */
const SECRET_FRIEND: Record<Sign, Sign> = { Rat: "Ox", Ox: "Rat", Tiger: "Pig", Pig: "Tiger", Cat: "Dog", Dog: "Cat", Dragon: "Rooster", Rooster: "Dragon", Snake: "Monkey", Monkey: "Snake", Horse: "Goat", Goat: "Horse" };
/** Liu Hai secret enemies (harms), distinct from the six clashes. */
const SECRET_ENEMY: Record<Sign, Sign> = { Rat: "Goat", Goat: "Rat", Ox: "Horse", Horse: "Ox", Tiger: "Snake", Snake: "Tiger", Cat: "Dragon", Dragon: "Cat", Monkey: "Pig", Pig: "Monkey", Rooster: "Dog", Dog: "Rooster" };
export function secretRelation(a: Sign, b: Sign): "secret-friend" | "secret-enemy" | null {
  if (a === b) return null;
  if (SECRET_FRIEND[a] === b) return "secret-friend";
  if (SECRET_ENEMY[a] === b) return "secret-enemy";
  return null;
}

// ── User-supplied sports color code ──────────────────────────────────────────
export const COLOR_NUMBERS: Record<string, number[]> = Object.fromEntries(
  Object.entries(COLOR_PRIMARY).map(([name, value]) => [name, Array.isArray(value) ? [...value] : [value as number]]),
);
/** Primary user-supplied number of a color (first listed), or null. */
export function colorNum(name: string): number | null {
  return learnedColorNumber(name);
}
export const colorNumsLabel = (name: string) => learnedColorLabel(name);
export const isWorstPair = (a: number, b: number) => numberRelation(reduceNum(a), reduceNum(b)) === "worst";

export type ColorFamily = "red" | "black" | "blue" | "white" | "gold" | "green" | "other";
export type ColorRel = "friend" | "neutral" | "enemy";

/** Shem color families. Red = 9. Black pairs with red as dangerous. Blue and white are preferred. Gold/yellow = 8-17-26-28. Green = 3 or 8. */
export function colorFamily(name: string): ColorFamily {
  const n = name.trim().toLowerCase();
  if (/red|crimson|scarlet|burgundy|maroon|ruby|cardinal/.test(n)) return "red";
  if (/black|licorice|asphalt/.test(n)) return "black";
  if (/gold|yellow|amber|brass|bronze/.test(n)) return "gold";
  if (/green|emerald/.test(n)) return "green";
  if (/white|ivory|cream|silver|pewter|eggshell/.test(n)) return "white";
  if (/blue|navy|azure|teal|turquoise|aqua|indigo|royal/.test(n)) return "blue";
  return "other";
}

/** One number for jersey resonance. Red and black are 9. Gold is 8. Green is 3. Blue/white fall back to GG33. */
export function sportColorNumber(name: string): number | null {
  return learnedColorNumber(name);
}

export function colorVsEnergy(name: string, n: number): ColorRel {
  const codes = learnedColorNumbers(name);
  if (!codes.length) return "neutral";
  const roots = codes.map(reduceNum);
  const energy = reduceNum(n);
  if (roots.includes(energy)) return "friend";
  if ((energy === 1 && roots.includes(11)) || (energy === 11 && roots.includes(1))) return "friend";
  if (energy === 7 && (
    roots.includes(7) ||
    roots.includes(11) ||
    (/^(grey|gray)$/i.test(name.trim()) && roots.includes(1))
  )) return "friend";
  if (/gold/i.test(name.trim())) return "friend";
  // Colors that do not match a documented positive rule stay neutral; they
  // never create a negative vote just for being a mismatch.
  return "neutral";
}

export function colorVsColor(a: string, b: string): ColorRel {
  const fa = colorFamily(a), fb = colorFamily(b);
  const danger = (f: ColorFamily) => f === "red" || f === "black";
  const calm = (f: ColorFamily) => f === "blue" || f === "white";
  if (fa !== "other" && fb !== "other") {
    if (fa === fb) return "friend";
    if (danger(fa) && danger(fb)) return "enemy";
    if ((danger(fa) && calm(fb)) || (calm(fa) && danger(fb))) return "enemy";
    if ((fa === "gold" && fb === "green") || (fa === "green" && fb === "gold")) return "friend";
    if ((fa === "gold" || fa === "green") && (calm(fb) || fa === fb)) return "friend";
    if ((fb === "gold" || fb === "green") && calm(fa)) return "friend";
    return "neutral";
  }
  const na = sportColorNumber(a), nb = sportColorNumber(b);
  if (na == null || nb == null) return "neutral";
  const rel = numberRelation(reduceNum(na), reduceNum(nb));
  if (rel === "enemy" || rel === "worst") return "enemy";
  if (rel === "friend" || rel === "same" || rel === "soulmate") return "friend";
  return "neutral";
}

export interface ColorPoint { side: Side; weight: number; reason: string }
export function colorStack(o: {
  homeColor?: string; awayColor?: string; homeColors?: string[]; awayColors?: string[];
  dayEnergies: number[];
  homeCycle: number[]; awayCycle: number[];
  homeJersey?: { name: string; numbers: number[] };
  awayJersey?: { name: string; numbers: number[] };
  nineDay: boolean;
  relation?: (a: number, b: number) => ReturnType<typeof numberRelation>;
}): { points: ColorPoint[]; volatility: string | null } {
  const relationForColor = o.relation ?? numberRelation;
  const bag: Record<Side, number> = { home: 0, away: 0 };
  const points: ColorPoint[] = [];
  const give = (side: Side, weight: number, reason: string) => {
    const room = 0.5 - bag[side];
    const w = Math.round(Math.min(weight, room) * 100) / 100;
    if (w <= 0) return;
    bag[side] = Math.round((bag[side] + w) * 100) / 100;
    points.push({ side, weight: w, reason });
  };
  const colorsFor = (values: (string | undefined)[]) =>
    [...new Set(values.filter((value): value is string => !!value).map(value => value.trim()).filter(Boolean))];
  const homeColors = colorsFor([...(o.homeColors ?? []), o.homeColor]);
  const awayColors = colorsFor([...(o.awayColors ?? []), o.awayColor]);
  const dayHas = (energy: number) => o.dayEnergies.some(value => reduceNum(value) === energy);
  const isBlue = (color: string) => /\bblue\b|\bnavy\b/i.test(color);
  const isYellow = (color: string) => /\byellow\b/i.test(color);
  const isGold = (color: string) => /\bgold\b/i.test(color);
  const dayLine = (side: Side, colors: string[]) => {
    const match = colors.find(color => o.dayEnergies.some(energy => colorVsEnergy(color, energy) === "friend"));
    if (match) give(side, 0.2, `${match} color supports a matching Universal or calendar-day energy`);
    if (dayHas(7)) {
      const supported = colors.filter(color => {
        const codes = learnedColorNumbers(color).map(reduceNum);
        return codes.includes(7) || codes.includes(11) || (/^(grey|gray)$/i.test(color) && codes.includes(1));
      });
      if (supported.length) give(side, 0.15, `7-day color support from ${supported.join(", ")} (7/11 partnership; Grey 28/1 included)`);
    }
    if (dayHas(6) && colors.some(isBlue) && colors.some(isYellow))
      give(side, 0.2, "Blue + Yellow color stack reduces to 6 on a 6-energy day");
    if (colors.some(isGold)) give(side, 0.1, "Gold (11) adds a small supporting color signal");
  };
  const cycleLine = (side: Side, colors: string[], cycle: number[]) => {
    if (!cycle.length) return;
    const match = colors.find(color => cycle.some(energy => colorVsEnergy(color, energy) === "friend"));
    if (match) give(side, 0.1, `${match} supports the team's or key player's personal cycle`);
  };
  const combinedCodeLine = (side: Side, colors: string[]) => {
    const code = sumTeamLogoColors(colors);
    if (!code) return;
    const supportiveMatch = o.dayEnergies.find(energy =>
      [code.compound, code.reduced].some(value => {
        const relation = relationForColor(reduceNum(value), reduceNum(energy));
        return relation === "same" || relation === "friend" || relation === "soulmate";
      }),
    );
    if (supportiveMatch != null)
      give(side, 0.08, `Combined logo-color code ${teamLogoColorCodeLabel(colors)} supports day energy ${supportiveMatch}`);
    if (code.partial33 && o.dayEnergies.some(energy => [6, 33].includes(reduceNum(energy))))
      give(side, 0.05, "Color sum 13/4 carries a partial 33 frequency on a 6/33 day");
  };
  dayLine("home", homeColors);
  dayLine("away", awayColors);
  cycleLine("home", homeColors, o.homeCycle);
  cycleLine("away", awayColors, o.awayCycle);
  combinedCodeLine("home", homeColors);
  combinedCodeLine("away", awayColors);
  const jerseyLine = (side: Side, colors: string[], jersey?: { name: string; numbers: number[] }) => {
    if (!jersey) return;
    const match = colors.find(color => {
      const codes = learnedColorNumbers(color);
      return jersey.numbers.some(n => codes.some(c => n === c || reduceNum(n) === reduceNum(c)));
    });
    if (match) give(side, 0.1, `${jersey.name} jersey code aligns with ${match}`);
  };
  jerseyLine("home", homeColors, o.homeJersey);
  jerseyLine("away", awayColors, o.awayJersey);
  return { points, volatility: null };
}

export type ChartTone = "Beneficial" | "Soulmate" | "Lovers" | "Fatal" | "Challenging" | "Neutral";
/** Healingood tone of a target month/day on a birth or founding chart. */
export function chartTone(birth: readonly [number, number, number], target: readonly [number, number, number]): ChartTone {
  const [, bm, bd] = birth;
  const [, tm, td] = target;
  if (bm === tm && bd === td) return "Beneficial";
  const h = healingood(bm, bd);
  const hit = (k: keyof typeof h) => h[k].some(([m, d]) => m === tm && d === td);
  if (hit("fatal")) return "Fatal";
  if (hit("soulmate")) return "Soulmate";
  if (hit("beneficial")) return "Beneficial";
  if (hit("lovers")) return "Lovers";
  if (hit("challenging")) return "Challenging";
  return "Neutral";
}

/** Wins + losses reduced. A 9 root is the 9-vibration record. */
export function recordVibration(rec?: string): number | null {
  const m = rec?.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return null;
  return reduceNum(Number(m[1]) + Number(m[2]));
}
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["♥", "♣", "♦", "♠"];
export function birthCardOf(month: number, day: number): string {
  const v = 55 - (2 * month + day);
  if (v <= 0) return "Joker";
  return `${RANKS[(v - 1) % 13]}${SUITS[Math.floor((v - 1) / 13)]}`;
}
function isoWeekNum(y: number, m: number, d: number): number {
  const t = new Date(Date.UTC(y, m - 1, d));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = Date.UTC(t.getUTCFullYear(), 0, 1);
  return Math.ceil(((t.getTime() - y0) / 86400000 + 1) / 7);
}
const ECLIPSES: Record<string, string> = {
  "2025-03-14": "Total lunar eclipse",
  "2025-03-29": "Partial solar eclipse",
  "2025-09-07": "Total lunar eclipse",
  "2025-09-21": "Partial solar eclipse",
  "2026-02-17": "Annular solar eclipse",
  "2026-03-03": "Total lunar eclipse",
  "2026-08-12": "Total solar eclipse",
  "2026-08-28": "Partial lunar eclipse",
  "2027-02-06": "Annular solar eclipse",
  "2027-02-20": "Penumbral lunar eclipse",
  "2027-07-18": "Penumbral lunar eclipse",
  "2027-08-02": "Total solar eclipse",
  "2027-08-17": "Penumbral lunar eclipse",
  "2028-01-12": "Partial lunar eclipse",
  "2028-01-26": "Annular solar eclipse",
  "2028-07-06": "Partial lunar eclipse",
  "2028-07-22": "Total solar eclipse",
  "2028-12-31": "Total lunar eclipse",
};

// ── Special numbers ─────────────────────────────────────────────────────────
export const SPECIAL_NUMBERS: Record<number, string> = {
  27: "27 is an important number in sports (baseball)",
  18: "18 is a very important number in gambling",
  3: "3 is luck",
  12: "12 is beginner's luck that can't be repeated",
  55: "55 is retained as the supplied lucky-number observation",
  7: "7 is the supplied injury, isolation and mental-energy caution — not a physical-power boost",
};

// ── Inputs ──────────────────────────────────────────────────────────────────
export interface VotePerson {
  name: string;
  role: SportsPersonRole;
  dob?: string;
  jersey?: string;
  dateSourceUrl?: string;
  lineupSourceUrl?: string;
  lineupSourceUpdated?: string;
}
export interface VoteTeam {
  name: string;
  shortName?: string;
  founded?: [number, number, number];
  colors?: string[];
  record?: string;
  split?: string;
  form?: string;
  streak?: string;
  splitHome?: string;
  splitRoad?: string;
  rest?: number;
  outs?: number;
  h2hWins?: number;
  seriesWins?: number;
  people: VotePerson[];
  /** Additional confirmed game-day starters used only by the Gematria name list. */
  gematriaPeople?: VotePerson[];
}
export interface VoteInput {
  /** Offline fitting may request raw rule contributions. No results enter this input. */
  weightMode?: "raw";
  /** Isolated evaluator override; production uses the active Learned/Backup profile. */
  weightProfileOverride?: {
    global: Record<string, number>;
    leagues?: Record<string, Record<string, number>>;
  };
  /** Learned is the frozen main profile; Backup has an independent cloned weight profile. */
  codeMode?: "learned" | "backup";
  /** Learned only: numerology is never capped by stats/environment signals. */
  numerologyFirst?: boolean;
  spiritualSweep?: boolean;
  year: number; month: number; day: number; league?: string;
  eventName?: string;
  home: VoteTeam; away: VoteTeam;
  /** Prior matchup scores and shared series values used by the Learned five-cipher read. */
  priorNumbers?: number[]; sharedSeries?: number[];
  stadiumOpened?: [number, number, number]; cityFounded?: [number, number, number];
  stadium?: string; city?: string; region?: string;
  neutralSite?: boolean;
  /** Kickoff hour in local 0–23. Closing hour is kickoff + 3. */
  hour?: number;
  /** Exact kickoff instant and venue timezone for the Learned game-day moon phase. */
  gameStartTime?: string;
  venueTimeZone?: string;
  /** Individual sport (UFC): `founded` is the fighter's birth date. */
  individual?: boolean;
  /** Isolated validation path; active Learned picks remain unchanged until approved. */
  candidateMethod?: boolean;
}
export interface TeamRead { lp?: Num; foundedDay?: Num; sign?: Sign; name: Num; enemyYear: boolean; hits: string[] }
export interface EntityProfile {
  side: Side | "venue"; role: string; name: string; date?: string;
  lp?: Num; dayOfYear?: number; dayEnergy?: Num; yearSign?: Sign; monthSign?: Sign;
  pd?: Num; pdRel?: string; lucky?: number;
}
/** CUE Lucky Number: first digit of birth month + last non-zero digit of birth year, kept whole. */
export function luckyNumber(year: number, month: number): number {
  const m = String(month)[0];
  const y = [...String(year)].reverse().find(c => c !== "0") ?? "0";
  return Number(m + y);
}
export function dayOfYear(y: number, m: number, d: number): number {
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
}
export function personalDayFor(b: readonly [number, number, number], y: number, m: number, d: number): Num {
  if (learningActive()) return sportsCycles(b[1], b[2], y, m, d).pd;
  const p = calcPersonalDay(b[1], b[2], m, d, y); return { compound: p.compound, reduced: p.reduced };
}
export interface VoteFlags {
  colorHome: number;
  colorAway: number;
  wealth: string | null;
  userChart: string;
  volatility: string | null;
  masters: string[];
  record9: string[];
  stadium: string[];
  hour: string;
  equalMasters: boolean;
}
export interface VoteDecision {
  /** Absolute vote gap. The card applies +3 to the vote plus the full decode. */
  margin: number;
  threshold: number;
  hard: string[];
  cautions: string[];
  volatility: string[];
  bettor: string[];
  powerColor: string;
  manifestation: string | null;
  eclipse: string | null;
  lunar: string;
}
export interface VoteResult {
  entities: EntityProfile[]; gameDayOfYear: number;
  votes: Vote[]; home: number; away: number; pick: Side; tiebreak: boolean;
  universalDay: Num; dayOfMonth: Num; yearSign: Sign; monthSign: Sign;
  noPlay: boolean; alerts: string[]; notes: string[]; missing: string[];
  reads: Record<Side, TeamRead>;
  steps: StepRow[]; confidence: number; band: Band;
  audit: VoteAudit;
  flags: VoteFlags;
  decision: VoteDecision;
}
export interface VoteAudit {
  pickedVoteShare: number;
  margin: number;
  signalCount: number;
  activeSignalCount: number;
  agreeingCategories: number;
  opposingCategories: number;
  neutralCategories: number;
  usedTiebreak: boolean;
  coreDataCoverage: { available: number; expected: number };
  missingInputs: string[];
  duplicateEventGroups: { eventKey: string; signals: string[] }[];
}
export const SPIRITUAL_SWEEP = false; // tested on Nov. 7–20 replay: 1 gained, 7 lost — kept off
export const STEP_ORDER: Step[] = ["Game-day energy", "Team core", "Number pairs", "Chinese zodiac", "Stars & venue", "Colors", "Records"];
export const STEP_LABELS: Record<Step, string> = {
  "Game-day energy": "1 · Game-day energy", "Team core": "2 · Team identity", "Number pairs": "3 · Number pairs",
  "Chinese zodiac": "4 · Chinese zodiac", "Stars & venue": "5 · Location Decode", "Colors": "6 · Colorology (0–2)", "Records": "7 · Records",
};
export interface StepRow { step: Step; label: string; edge: Side | null; reason: string }
export type Band = "Challenging" | "Mixed" | "Good" | "Strong" | "Exceptional";
export function confidenceBand(c: number): Band {
  if (c >= 85) return "Exceptional";
  if (c >= 70) return "Strong";
  if (c >= 50) return "Good";
  if (c >= 30) return "Mixed";
  return "Challenging";
}
/** Picked side's share of votes, minus penalties, clamped 0–100. */
export function computeConfidence(o: { winner: number; loser: number; noPlay: boolean; alerts: number; missing: number; tiebreakOnly: boolean }): number {
  const tot = o.winner + o.loser;
  let c = tot ? (100 * o.winner) / tot : 50;
  if (o.noPlay) c -= 30;
  c -= 10 * o.alerts;
  c -= 5 * o.missing;
  if (o.tiebreakOnly) c -= 10;
  return Math.max(0, Math.min(100, Math.round(c)));
}

const RATING_HOME: Record<string, number> = { MLB: 28, NFL: 48, NHL: 35, NBA: 50 };
const RATING_B2B: Record<string, number> = { MLB: 0, NFL: 0, NHL: 50, NBA: 40 };
function teamRatingVote(inp: VoteInput, add: (side: Side, weight: number, layer: Step, reason: string) => void) {
  if (inp.individual) return false;
  const league = inp.league ?? "";
  const table = (ratings as Record<string, Record<string, { elo: number; last: string }>>)[league];
  const home = table?.[inp.home.name];
  const away = table?.[inp.away.name];
  if (!home || !away) return false;
  const game = Date.UTC(inp.year, inp.month - 1, inp.day);
  if (Date.parse(home.last) >= game || Date.parse(away.last) >= game) return false;
  const rest = (last: string) => (game - Date.parse(last + "T00:00:00Z")) / 86400000;
  const neutral = home.elo - away.elo;
  let adj = neutral + (RATING_HOME[league] ?? 0);
  const b2b = RATING_B2B[league] ?? 0;
  const tired = (last: string) => { const d = rest(last); return d >= 0 && d < 1.4; };
  const homeTired = tired(home.last), awayTired = tired(away.last);
  if (homeTired) adj -= b2b;
  if (awayTired) adj += b2b;
  // Same rest: home court does not flip a visitor that is better on rating and record.
  if (league === "NBA" && homeTired === awayTired && neutral < 0 && adj >= 0 && winPct(inp.away.record) != null && winPct(inp.home.record) != null && (winPct(inp.away.record) as number) > (winPct(inp.home.record) as number)) {
    adj = neutral;
  }
  const hp0 = winPct(inp.home.record), ap0 = winPct(inp.away.record);
  // A one-win record gap is a toss-up. Home keeps it unless the visitor is 150 points better.
  if (league === "NBA" && hp0 != null && ap0 != null && Math.abs(hp0 - ap0) < 0.05 && Math.abs(neutral) < 150) adj = RATING_HOME.NBA;
  if (league === "NHL") {
    const pts = (r?: string) => {
      const m = r?.match(/(\d+)-(\d+)(?:-(\d+))?/);
      if (!m) return null;
      const w = +m[1], l = +m[2], o = m[3] ? +m[3] : 0;
      const g = w + l + o;
      return g ? (2 * w + o) / (2 * g) : null;
    };
    const hpts = pts(inp.home.record), apts = pts(inp.away.record);
    if (Math.abs(neutral) < 15) adj = neutral;
    if (hpts != null && apts != null && apts > hpts && Math.abs(neutral) < 25) adj = -Math.abs(neutral) - 1;
  }
  const side: Side = adj >= 0 ? "home" : "away";
  const better = side === "home" ? inp.home.name : inp.away.name;
  add(side, Math.round(Math.abs(adj) / 40 * 100) / 100, "Records", `Team rating — ${better} ${Math.abs(Math.round(adj))} points clear`);
  return true;
}
const winPct = (r?: string) => {
  const m = r?.match(/(\d+)-(\d+)/); if (!m) return null;
  const w = +m[1], l = +m[2]; return w + l ? w / (w + l) : null;
};
const parseDob = (s?: string) => { const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? [+m[1], +m[2], +m[3]] as const : null; };

const ENVIRONMENT_REASON = /team rating|better record gap|record margin|recent form gap|home and road gap|back to back|injury count|head to head gap|home field/i;
export function isEnvironmentVote(vote: Vote): boolean {
  return vote.layer === "Records" && ENVIRONMENT_REASON.test(vote.reason);
}

/** A strong live sports-context edge cannot be overturned by correlated esoteric votes. */
export function capEsotericAgainstEnvironment(votes: Vote[], mode: "learned" | "backup" = "learned"): { side: Side; scaled: number } | null {
  if (mode === "backup") return null;
  const environmentHome = votes.filter(vote => vote.side === "home" && isEnvironmentVote(vote)).reduce((sum, vote) => sum + Math.max(0, vote.weight), 0);
  const environmentAway = votes.filter(vote => vote.side === "away" && isEnvironmentVote(vote)).reduce((sum, vote) => sum + Math.max(0, vote.weight), 0);
  if (environmentHome === environmentAway) return null;
  const side: Side = environmentHome > environmentAway ? "home" : "away";
  const opposingSide = side === "home" ? "away" : "home";
  const environmentEdge = Math.abs(environmentHome - environmentAway);
  if (environmentEdge < 3) return null;
  const supportingEsoteric = votes
    .filter(vote => vote.side === side && !isEnvironmentVote(vote))
    .reduce((sum, vote) => sum + Math.max(0, vote.weight), 0);
  const opposingEsotericVotes = votes.filter(vote => vote.side === opposingSide && !isEnvironmentVote(vote) && vote.weight > 0);
  const opposingEsoteric = opposingEsotericVotes.reduce((sum, vote) => sum + vote.weight, 0);
  const maximumOpposition = environmentEdge + supportingEsoteric;
  if (opposingEsoteric <= maximumOpposition || opposingEsoteric === 0) return null;

  const factor = maximumOpposition / opposingEsoteric;
  for (const vote of opposingEsotericVotes) {
    vote.weight *= factor;
    vote.appliedWeight = vote.weight;
    vote.weightMultiplier = (vote.weightMultiplier ?? 1) * factor;
    vote.reason += ` — reduced because game-context signals favor ${side}`;
  }
  return { side, scaled: opposingEsotericVotes.length };
}

function isAstrologySignal(vote: Vote): boolean {
  return vote.layer === "Chinese zodiac" ||
    /\b(western astrology|western sign|astrology|zodiac|moon|planet|aspect|ascendant|sun sign)\b/i.test(vote.reason);
}

function isNumerologySignal(vote: Vote): boolean {
  // Colorology is a lower-priority supporting layer; it must not enlarge the
  // numerology edge used to suppress opposing astrology votes.
  if (vote.layer === "Colors") return false;
  // The user's hierarchy places full gematria last; it cannot count as core
  // numerology when limiting Chinese/planetary signals.
  if (vote.signalId === "Number pairs/learned-screenshot-gematria" ||
    /\b(gematria|(?:four|five)-cipher|letterology)\b/i.test(vote.reason)) return false;
  if (isAstrologySignal(vote)) return false;
  return vote.layer === "Game-day energy" ||
    vote.layer === "Team core" ||
    vote.layer === "Number pairs" ||
    /\b(life path|personal (year|month|day|week|hour)|universal (year|month|day)|birthday|birth date|lucky number|master number|all-record vibration|numerology)\b/i.test(vote.reason);
}

/** Learned numerology keeps its lead when opposing astrology signals conflict. */
export function capAstrologyAgainstNumerology(
  votes: Vote[],
  mode: "learned" | "backup" = "learned",
): { side: Side; scaled: number } | null {
  if (mode === "backup") return null;

  const numeric = { home: 0, away: 0 };
  for (const vote of votes) {
    if (isNumerologySignal(vote)) numeric[vote.side] += Math.max(0, vote.weight);
  }
  if (numeric.home === numeric.away) return null;

  const side: Side = numeric.home > numeric.away ? "home" : "away";
  const opposition: Side = side === "home" ? "away" : "home";
  const numericEdge = Math.abs(numeric.home - numeric.away);
  const opposingAstrology = votes.filter(
    vote => vote.side === opposition && isAstrologySignal(vote) && vote.weight > 0,
  );
  const astrologyTotal = opposingAstrology.reduce((sum, vote) => sum + vote.weight, 0);
  const allowedOpposition = Math.max(0, numericEdge - 0.01);
  if (!astrologyTotal || astrologyTotal <= allowedOpposition) return null;

  const factor = allowedOpposition / astrologyTotal;
  for (const vote of opposingAstrology) {
    vote.weight *= factor;
    vote.appliedWeight = vote.weight;
    vote.weightMultiplier = (vote.weightMultiplier ?? 1) * factor;
    vote.reason += ` — limited because numerology favors ${side}`;
  }
  return { side, scaled: opposingAstrology.length };
}

/** Colors can support a stronger side but cannot create or reverse the primary edge. */
export function capColorSupportBelowPrimarySignals(votes: Vote[]): { side: Side | null; changed: number } | null {
  const total = (side: Side, colors: boolean) => votes
    .filter(vote => vote.side === side && (vote.layer === "Colors") === colors)
    .reduce((sum, vote) => sum + Math.max(0, vote.weight), 0);
  const homePrimary = total("home", false), awayPrimary = total("away", false);
  const gap = Math.abs(homePrimary - awayPrimary);
  if (gap < 1e-9) {
    let changed = 0;
    for (const vote of votes) {
      if (vote.layer !== "Colors" || vote.weight <= 0) continue;
      vote.weight = 0;
      vote.appliedWeight = 0;
      vote.weightMultiplier = 0;
      changed++;
    }
    return changed ? { side: null, changed } : null;
  }
  const side: Side = homePrimary > awayPrimary ? "home" : "away";
  const opposingSide: Side = side === "home" ? "away" : "home";
  const support = total(side, true);
  const opposition = total(opposingSide, true);
  const allowedOpposition = support + Math.max(0, gap - 0.0001);
  if (opposition <= allowedOpposition || opposition <= 0) return null;
  const factor = allowedOpposition / opposition;
  let changed = 0;
  for (const vote of votes) {
    if (vote.layer !== "Colors" || vote.side !== opposingSide || vote.weight <= 0) continue;
    vote.weight *= factor;
    vote.appliedWeight = vote.weight;
    vote.weightMultiplier = (vote.weightMultiplier ?? 1) * factor;
    changed++;
  }
  return changed ? { side, changed } : null;
}

function coreStrength(r: TeamRead): number {
  if (!r.lp) return 0;
  if (r.lp.compound === 28 || r.foundedDay?.compound === 28) return 3;
  if ([8, 1, 11, 22, 33].includes(r.lp.reduced)) return 2;
  return 1;
}

/** Championship rules are displayed as user-requested alerts; they do not change the pick. */
export function championshipAlerts(p: VotePerson, league?: string, universalDay?: number, candidateMethod = false): string[] {
  const out: string[] = [];
  if (league === "NFL" && p.role === "quarterback" && universalDay === 9)
    out.push(`Championship alert: ${p.name} is a quarterback on a pure 9 Universal Day`);
  const d = parseDob(p.dob); if (!d) return out;
  const lp = candidateMethod
    ? candidateSportsLifePath(d[0], d[1], d[2], chineseYear(d[0], d[1], d[2]) === "Snake")
    : lifePath(d[0], d[1], d[2]);
  const sg = chineseSign(d[0]);
  if (league === "NFL" && p.role === "quarterback") {
    if (lp.reduced === 9) out.push(`Championship alert: Never bet on ${p.name} (9 Life Path QB) to win the Super Bowl`);
    if (["Cat", "Goat", "Tiger"].includes(sg)) out.push(`Championship alert: Never bet on ${p.name} (${sg}-year QB) to win the Super Bowl`);
  }
  if (league === "NBA" && lp.reduced === 9) out.push(`Championship alert: Never bet on ${p.name} (9 Life Path) to win the title`);
  return out;
}

export function runVotes(inp: VoteInput): VoteResult {
  const candidateMethod = inp.candidateMethod ?? (inp.codeMode !== "backup");
  const compareNumbers = (a: number, b: number) =>
    inp.codeMode === "backup" ? numberRelation(a, b) : learnedNumberRelation(a, b);
  const ud = lifePath(inp.year, inp.month, inp.day);
  const dom = dayEnergy(inp.day);
  const dayNums = [...new Set([ud.reduced, dom.reduced, ...(dom.compound === 28 ? [8, 1] : [])])];
  const championshipGame = !inp.individual && isChampionshipEvent(inp.eventName);
  const yearSign = chineseSign(inp.year);
  const monthSign = chineseMonthSign(inp.month, inp.day);
  const votes: Vote[] = []; const alerts: string[] = []; const notes: string[] = []; const missing: string[] = [];
  const add = (side: Side, weight: number, layer: Step, reason: string, signalId?: string) => votes.push({
    side, weight, layer, reason, baseWeight: weight, weightMultiplier: 1, appliedWeight: weight,
    weightSource: "unscaled", signalId: signalId ?? `${layer}/${ruleId(reason)}`,
    eventKey: `${side}:${reason.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim()}`,
  });
  const other = (s: Side): Side => (s === "home" ? "away" : "home");
  const teams: [Side, VoteTeam][] = [["home", inp.home], ["away", inp.away]];
  const datePath = (date: readonly [number, number, number], founding = false): Num => {
    if (candidateMethod) {
      return candidateSportsLifePath(date[0], date[1], date[2], chineseYear(date[0], date[1], date[2]) === "Snake");
    }
    return (founding ? foundingPath : lifePath)(date[0], date[1], date[2]);
  };

  const reads = {} as Record<Side, TeamRead>;
  for (const [s, t] of teams) {
    const name = pythagoreanValue(t.name);
    const r: TeamRead = { name: { compound: name.compound, reduced: name.reduced }, enemyYear: false, hits: [] };
    if (t.founded) {
      const [y, m, d] = t.founded;
      r.lp = datePath([y, m, d], !inp.individual); r.foundedDay = dayEnergy(d); r.sign = chineseSign(y);
      r.enemyYear = signRelation(r.sign, yearSign) === "enemy";
      if (touches(r.lp, dayNums)) r.hits.push(`Life Path ${fmt(r.lp)}`);
      if (touches(r.foundedDay, dayNums)) r.hits.push(`${inp.individual ? "born" : "founded"} on the ${ord(d)} (${fmt(r.foundedDay)})`);
    } else missing.push(`${t.name} ${inp.individual ? "birth date" : "founding date"}`);
    if (touches(r.name, dayNums)) r.hits.push(`team-name number ${fmt(r.name)}`);
    reads[s] = r;
  }
  const dayLabel = `${fmt(ud)} & ${dom.reduced}`;
  const entities: EntityProfile[] = [];
  const pdRelTo = (pd: Num) => compareNumbers(pd.reduced, ud.reduced);
  const profile = (side: EntityProfile["side"], role: string, name: string, b?: readonly [number, number, number], founding = false) => {
    if (!b) { entities.push({ side, role, name }); return undefined; }
    const [y, m, d] = b; const pd = personalDayFor(b, inp.year, inp.month, inp.day);
     const e: EntityProfile = { side, role, name, date: `${m}/${d}/${y}`, lp: datePath([y, m, d], founding), dayOfYear: dayOfYear(y, m, d), dayEnergy: dayEnergy(d),
      yearSign: chineseSign(y), monthSign: chineseMonthSign(m, d), lucky: luckyNumber(y, m), pd, pdRel: pdRelTo(pd) };
    entities.push(e); return e;
  };
  const pdVote = (s: Side, e: EntityProfile | undefined, w: number, layer: Step) => {
    if (!e?.pd) return;
    const r = e.pdRel;
    if (r === "same" || r === "friend" || r === "soulmate") add(s, w, layer, `${e.name} is in a Personal ${fmt(e.pd)} Day — ${r === "same" ? "matches" : "friendly with"} the ${ud.reduced} Universal Day`);
    else if (r === "enemy" || r === "worst") add(other(s), w, layer, `${e.name} is in a Personal ${fmt(e.pd)} Day — enemy of the ${ud.reduced} Universal Day`);
  };
  for (const [s, t] of teams) {
    pdVote(s, profile(s, inp.individual ? "Fighter" : "Team", t.name, t.founded, !inp.individual), 1, "Game-day energy");
    for (const p of t.people) pdVote(s, profile(s, p.role === "pitcher" ? "Pitcher" : p.role === "goalie" ? "Goalie" : p.role === "quarterback" ? "QB" : p.role === "coach" || p.role === "manager" ? "Coach" : "Player", p.name, parseDob(p.dob) ?? undefined), 0.5, "Stars & venue");
  }
  if (!inp.individual) {
    if (inp.stadium || inp.stadiumOpened) pdVote("home", profile("venue", "Stadium", inp.stadium ?? "Stadium", inp.stadiumOpened), 0.5, "Stars & venue");
    if (inp.city || inp.cityFounded) pdVote("home", profile("venue", "City", inp.city ?? "City", inp.cityFounded), 0.25, "Stars & venue");
  }

  // Step 1+2: game-day energy (×2)
  const hh = reads.home.hits.length, ah = reads.away.hits.length;
  if (hh !== ah) {
    const s: Side = hh > ah ? "home" : "away";
    add(s, 2, "Game-day energy", `${(s === "home" ? inp.home : inp.away).name} touches today's ${dayLabel}: ${reads[s].hits.join(", ")}${reads[other(s)].hits.length ? "" : " — the other side touches nothing"}`);
  }
  // Team core (×2)
  const hc = coreStrength(reads.home), ac = coreStrength(reads.away);
  if (hc !== ac && hc && ac) {
    const s: Side = hc > ac ? "home" : "away";
    add(s, 2, "Team core", `${(s === "home" ? inp.home : inp.away).name} carries the stronger signature (Life Path ${fmt(reads[s].lp!)}${reads[s].foundedDay?.compound === 28 ? ", founded on the 28th" : ""})`);
  }
  // Step 3: number pairs vs the day
  for (const [s, t] of teams) {
    const lp = reads[s].lp; if (!lp) continue;
    const relationshipNumber = inp.codeMode === "backup"
      ? lp.reduced
      : lp.compound === 28 ? 28 : lp.reduced;
    const rel = compareNumbers(relationshipNumber, ud.reduced);
    if (rel === "worst" || rel === "enemy") {
      const pairLabel = lp.compound === 28 ? fmt(lp) : String(lp.reduced);
      add(other(s), 1, "Number pairs", `${t.name} Life Path ${pairLabel} vs ${ud.reduced} Universal Day — ${rel === "worst" ? "strongest worst-enemy pair" : "enemies"}`);
    }
    if (rel === "soulmate" || rel === "friend") add(s, 1, "Number pairs", `${t.name} Life Path ${lp.reduced} is ${rel === "soulmate" ? "soulmates" : "best friends"} with the ${ud.reduced} day`);
  }
  // Frequency lock (Learned only): a team whose Life Path matches the Universal Day
  // while the opponent's Life Path is an enemy of that day — numerology outranks records.
  if (inp.codeMode !== "backup") {
    for (const [s, t] of teams) {
      const lp = reads[s].lp, opp = reads[other(s)].lp;
      if (!lp || !opp || lp.reduced !== ud.reduced || opp.reduced === ud.reduced) continue;
      const oppRel = compareNumbers(opp.compound === 28 ? 28 : opp.reduced, ud.reduced);
      if (oppRel === "worst" || oppRel === "enemy") {
        add(s, 1, "Number pairs", `Frequency lock — ${t.name} Life Path ${lp.reduced} matches the ${ud.reduced} Universal Day while ${(s === "home" ? inp.away : inp.home).name} Life Path ${opp.reduced} is its ${oppRel === "worst" ? "worst" : ""} enemy`);
      }
    }
  }
  // Step 4: Chinese year / month
  const hs = reads.home.sign, as = reads.away.sign;
  if (hs && as && hs === as) notes.push(`Both teams are ${hs} — zodiac is a wash`);
  else for (const [s, t] of teams) {
    const sg = reads[s].sign; if (!sg) continue;
    if (reads[s].enemyYear) {
      add(other(s), 1, "Chinese zodiac", `${t.name} (${sg}) is in its enemy year — ${yearSign} year strains it`);
      if (championshipGame) {
        add(other(s), 0.35, "Chinese zodiac", `${t.name} is in its enemy animal year during a championship — low-weight title-stage signal`);
      }
    }
    const yr = signRelation(sg, yearSign) === "friend", mo = signRelation(sg, monthSign) === "friend";
    if (yr || mo) add(s, 1, "Chinese zodiac", `${t.name} (${sg}) shares a trine with the ${[yr && `${yearSign} year`, mo && `${monthSign} month`].filter(Boolean).join(" and ")}`);
    if (!reads[s].enemyYear && signRelation(sg, yearSign) !== "friend") {
      const sec = secretRelation(sg, yearSign);
      if (sec === "secret-friend") add(s, 0.5, "Chinese zodiac", `${t.name} (${sg}) is secret friends (Liu He) with the ${yearSign} year`);
      if (sec === "secret-enemy") add(other(s), 0.5, "Chinese zodiac", `${t.name} (${sg}) is secret enemies (Liu Hai) with the ${yearSign} year`);
    }
    if (signRelation(sg, monthSign) !== "friend" && signRelation(sg, monthSign) !== "enemy") {
      const sec = secretRelation(sg, monthSign);
      if (sec === "secret-friend") add(s, 0.5, "Chinese zodiac", `${t.name} (${sg}) is secret friends (Liu He) with the ${monthSign} month`);
      if (sec === "secret-enemy") add(other(s), 0.5, "Chinese zodiac", `${t.name} (${sg}) is secret enemies (Liu Hai) with the ${monthSign} month`);
    }
  }
  if (!inp.individual) {
    for (const [label, dt, nm] of [["City", inp.cityFounded, inp.city], ["Stadium", inp.stadiumOpened, inp.stadium]] as const) {
      if (!dt) continue;
      const sg = chineseSign(dt[0]);
      const rel = signRelation(sg, yearSign);
      const who = `${label} ${nm ?? ""} (${sg})`;
      if (rel === "friend") add("home", 0.35, "Chinese zodiac", `${who} trines the ${yearSign} year — home building`);
      if (rel === "enemy") add("away", 0.35, "Chinese zodiac", `${who} clashes with the ${yearSign} year`);
      const sec = rel === "neutral" ? secretRelation(sg, yearSign) : null;
      if (sec === "secret-friend") add("home", 0.25, "Chinese zodiac", `${who} is secret friends with the ${yearSign} year`);
      if (sec === "secret-enemy") add("away", 0.25, "Chinese zodiac", `${who} is secret enemies with the ${yearSign} year`);
    }
  }
  // Step 5: stars, coaches, venue (small)
  for (const [s, t] of teams) {
    const oppSign = reads[other(s)].sign;
    if (!t.people.length && !inp.individual) missing.push(`${t.name} starters/coach birthdays`);
    for (const p of t.people) {
      if (championshipGame) alerts.push(...championshipAlerts(p, inp.league, ud.reduced, candidateMethod));
      const d = parseDob(p.dob); if (!d) { missing.push(`${p.name} birth date`); continue; }
      const lp = datePath(d); const ps = chineseSign(d[0]);
      if (inp.codeMode !== "backup") {
        const relationshipNumber = lp.compound === 28 ? 28 : lp.reduced;
        const lpDayRelation = compareNumbers(relationshipNumber, ud.reduced);
        const roleWeight = /coach|manager|owner/i.test(p.role) ? 0.5 : 1;
        const personLifePath = lp.compound === 28 ? fmt(lp) : String(lp.reduced);
        if (lpDayRelation === "worst" || lpDayRelation === "enemy") {
          add(other(s), roleWeight, "Number pairs", `${p.name} Life Path ${personLifePath} vs ${ud.reduced} Universal Day — ${lpDayRelation === "worst" ? "strongest worst-enemy pair" : "enemies"}`);
        } else if (lpDayRelation === "soulmate" || lpDayRelation === "friend") {
          add(s, roleWeight, "Number pairs", `${p.name} Life Path ${personLifePath} is ${lpDayRelation === "soulmate" ? "soulmates" : "best friends"} with the ${ud.reduced} Universal Day`);
        }
      }
      if (shouldFadeNineLifePathStar(lp.reduced, ud.reduced, p.role)) {
        add(other(s), 0.25, "Stars & venue", `${p.name} Life Path 9 on a pure 9 Universal Day — low-weight scoring-fade observation`);
      }
      if (championshipGame && signRelation(ps, yearSign) === "enemy") {
        add(other(s), 0.35, "Chinese zodiac", `${p.name} (${ps}-year) is in its enemy animal year during a championship — low-weight title-stage signal`);
      }
      if (oppSign) {
        const rel = signRelation(ps, oppSign);
        if (rel === "enemy") add(other(s), 0.5, "Stars & venue", `${p.name} (${ps}) clashes with ${oppSign} opponent`);
        if (rel === "friend") add(s, 0.5, "Stars & venue", `${p.name} (${ps}) is friendly with ${oppSign} opponent`);
        if (rel === "neutral") {
          const sec = secretRelation(ps, oppSign);
          if (sec === "secret-friend") add(s, 0.35, "Chinese zodiac", `${p.name} (${ps}) is secret friends with the ${oppSign} opponent`);
          if (sec === "secret-enemy") add(other(s), 0.35, "Chinese zodiac", `${p.name} (${ps}) is secret enemies with the ${oppSign} opponent`);
        }
      }
      const oppLp = reads[other(s)].lp;
      if ((p.role === "coach" || p.role === "manager") && oppLp) {
        const pd = personalDayFor(d, inp.year, inp.month, inp.day);
        const rel = compareNumbers(pd.reduced, oppLp.reduced);
        if (rel === "same" || rel === "friend" || rel === "soulmate") add(s, 0.5, "Stars & venue", `${p.name} Personal Day ${fmt(pd)} is ${rel} with the opposing Life Path ${oppLp.reduced}`);
        if (rel === "enemy" || rel === "worst") add(other(s), 0.5, "Stars & venue", `${p.name} Personal Day ${fmt(pd)} is ${rel} against the opposing Life Path ${oppLp.reduced}`);
      }
      if (touches(lp, dayNums) || touches(dayEnergy(d[2]), dayNums)) add(s, 0.5, "Stars & venue", `${p.name} (LP ${fmt(lp)}, born the ${ord(d[2])}) matches today`);
      const j = Number(p.jersey);
      if (j) {
        const lucky = luckyNumber(d[0], d[1]);
        const hits: string[] = [];
      const isPlayer = candidateMethod
        ? !["coach", "manager", "owner", "staff"].includes(p.role)
        : p.role !== "coach" && p.role !== "manager";
        const birthdayJersey = j === d[2];
        if (dayNums.includes(j) || dayNums.includes(reduceNum(j))) hits.push("the day");
        if (j === lucky || reduceNum(j) === reduceNum(lucky)) hits.push(`Lucky Number ${lucky}`);
        if (j === lp.compound || j === lp.reduced || reduceNum(j) === lp.reduced) hits.push(`Life Path ${fmt(lp)}`);
        if (birthdayJersey) hits.push(`Birthday Number ${d[2]}`);
        if (hits.length) add(s, 0.5, "Stars & venue", `${p.name} #${j} scores with ${hits.join(", ")}`);
        if (birthdayJersey && isPlayer) {
          add(s, 0.2, "Stars & venue", `${p.name} jersey matches their Birthday Number — low-weight breakout-window hypothesis`);
        }
        const adjacentMaster = adjacentMasterForJersey(j);
        if (adjacentMaster != null && isPlayer) {
          add(s, 0.1, "Stars & venue", `${p.name} #${j} sits next to master number ${adjacentMaster} — low-weight jersey pattern`);
        }
      }
    }
  }
  for (const [label, dt, nm] of [["Stadium", inp.stadiumOpened, inp.stadium], ["City", inp.cityFounded, inp.city]] as const) {
    if (!dt || inp.individual) continue;
    const lp = datePath(dt, true);
    if (touches(lp, dayNums)) add("home", 0.5, "Stars & venue", `${label} ${nm ?? ""} (${dt[1]}/${dt[2]}/${dt[0]} → ${fmt(lp)}) matches today`);
  }

  // Lunar phase (secondary): new moon backs the starter (road attacker), full moon the finisher (home)
  const exactMoon = inp.codeMode === "backup" || !inp.gameStartTime ? null : moonPhaseAt(inp.gameStartTime, inp.venueTimeZone);
  const moonInfo = exactMoon ?? moonPhase(inp.year, inp.month, inp.day);
  const moon = moonInfo.phase;
  const moonRef = Date.UTC(2000, 0, 6) / 86400000;
  const moonDay = Date.UTC(inp.year, inp.month - 1, inp.day) / 86400000;
  const moonCycle = (((moonDay - moonRef) % 29.53059) + 29.53059) % 29.53059;
  const moonIllum = exactMoon?.illumination ?? Math.round((1 - Math.cos((2 * Math.PI * moonCycle) / 29.53059)) / 2 * 100);
  if (!inp.individual && moon === "New Moon") add("away", 0.25, "Game-day energy", "New moon (secondary) — starting energy backs the road attacker");
  if (!inp.individual && moon === "Full Moon") add("home", 0.25, "Game-day energy", "Full moon (secondary) — finishing energy backs the home side");
  if (hc && ac && hc !== ac) {
    const favorite: Side = hc > ac ? "home" : "away";
    const dog: Side = favorite === "home" ? "away" : "home";
    if (moonInfo.bias === "FAVORITES") add(favorite, 0.15, "Game-day energy", `Moon ${moonIllum}% — light favorite modifier`);
    if (moonInfo.bias === "UNDERDOGS" || moonInfo.bias === "SLIGHT UNDERDOGS") add(dog, 0.15, "Game-day energy", `Moon ${moonIllum}% — light underdog modifier`);
  }
  const localKickoff = exactMoon && inp.venueTimeZone
    ? venueLocalTimeLabel(inp.gameStartTime!, inp.venueTimeZone)
    : null;
  const moonTimeContext = exactMoon
    ? localKickoff ? ` at venue-local kickoff ${localKickoff}` : " at the exact kickoff instant (venue timezone not verified)"
    : " using a date-level estimate because exact kickoff time is unavailable";
  notes.push(`Moon: ${moon}, ${moonIllum}% lit${moonTimeContext}. ${moonInfo.biasNote}`);

  if (!inp.individual && inp.stadiumOpened) {
    for (const [s, t] of teams) {
      if (!t.founded) continue;
      const tone = chartTone(t.founded, inp.stadiumOpened);
      const label = `${inp.stadium ?? "Stadium"} opened ${inp.stadiumOpened[1]}/${inp.stadiumOpened[2]}/${inp.stadiumOpened[0]} — ${tone} on ${t.name}'s chart`;
      notes.push(label);
      if (tone === "Beneficial" || tone === "Soulmate" || tone === "Lovers") add(s, 0.5, "Stars & venue", label);
      if (tone === "Challenging" || tone === "Fatal") add(other(s), 0.5, "Stars & venue", label);
      if (inp.cityFounded) {
        const cityTone = chartTone(t.founded, inp.cityFounded);
        const bad = (x: ChartTone) => x === "Challenging" || x === "Fatal";
        if (bad(tone) && bad(cityTone)) add(other(s), 1, "Stars & venue", `City (${cityTone}) and stadium (${tone}) are both against ${t.name} — full point penalty`);
      }
    }
  }

  const weekRoot = reduceNum(isoWeekNum(inp.year, inp.month, inp.day));
  const doyRoot = reduceNum(dayOfYear(inp.year, inp.month, inp.day));
  for (const [s, t] of teams) {
    const lp = reads[s].lp; if (!lp) continue;
    if (lp.reduced === weekRoot) add(s, 0.15, "Game-day energy", `${t.name} Life Path ${lp.reduced} matches week-of-year root ${weekRoot}`);
    if (lp.reduced === doyRoot && !reads[s].hits.length) add(s, 0.25, "Game-day energy", `${t.name} Life Path matches day-of-year root ${doyRoot}`);
  }
  const pole = (n: number): "friend" | "enemy" | "neutral" => {
    const r = compareNumbers(n, ud.reduced);
    if (r === "same" || r === "friend" || r === "soulmate") return "friend";
    if (r === "enemy" || r === "worst") return "enemy";
    return "neutral";
  };
  const hourLines: string[] = [];
  if (inp.hour != null) {
    const hourNum = (pd: number, h: number) => reduceNum(pd + sumDigits(h % 24));
    const watch = (side: Side, who: string, b?: readonly [number, number, number]) => {
      if (!b) return;
      const pd = personalDayFor(b, inp.year, inp.month, inp.day).reduced;
      const start = pole(hourNum(pd, inp.hour!));
      const close = pole(hourNum(pd, inp.hour! + 3));
      if ((start === "friend" && close === "enemy") || (start === "enemy" && close === "friend")) {
        hourLines.push(`${who} flips ${start} → ${close} by the closing hour`);
        if (close === "friend") add(side, 0.75, "Stars & venue", `${who} hour flips to friend at the close — closing hour is the heavy weight`);
        else add(side === "home" ? "away" : "home", 0.75, "Stars & venue", `${who} hour flips to enemy at the close — fade this side late`);
      }
    };
    for (const [s, t] of teams) {
      watch(s, t.name, t.founded);
      const key = t.people.find(p => p.role === "pitcher" || p.role === "quarterback" || p.role === "player");
      watch(s, key?.name ?? "", parseDob(key?.dob) ?? undefined);
    }
    // Personal Hour Cycle (start → mid → close, closing weighted highest) for each team and its key person.
    if (inp.codeMode !== "backup") {
      const val = (p: "friend" | "enemy" | "neutral") => p === "friend" ? 1 : p === "enemy" ? -1 : 0;
      const hourScore = (b?: readonly [number, number, number]) => {
        if (!b) return 0;
        const pd = personalDayFor(b, inp.year, inp.month, inp.day).reduced;
        return 0.15 * val(pole(hourNum(pd, inp.hour!))) + 0.15 * val(pole(hourNum(pd, inp.hour! + 1))) + 0.4 * val(pole(hourNum(pd, inp.hour! + 3)));
      };
      const sideHour = (s: Side) => {
        const t = s === "home" ? inp.home : inp.away;
        const key = t.people.find(p => p.role === "pitcher" || p.role === "quarterback" || p.role === "player");
        return hourScore(t.founded) + 0.5 * hourScore(parseDob(key?.dob) ?? undefined);
      };
      const diff = sideHour("home") - sideHour("away");
      if (Math.abs(diff) >= 0.15) {
        const s: Side = diff > 0 ? "home" : "away";
        add(s, Math.min(1, Math.abs(diff)), "Game-day energy", `Personal hour cycle — ${(s === "home" ? inp.home : inp.away).name} holds the friendlier start → mid → closing hours (closing weighted highest)`);
      }
    }
  } else hourLines.push("Kickoff hour not on the card yet, so the friend→enemy hour flip is not scored.");
  if (!inp.individual) hourLines.push("No reliever or closer is in the feed. The closing-hour check uses the team and the posted starter.");

  // Sports entities only. Personal calendar profiles never affect a sports pick.
  const userChart = "";
  const bettor: string[] = [];
  const userHourEnemy = false;
  const power = colorsForDay(ud.reduced, 3);
  const powerColor = `Power colors: ${power.best.slice(0, 3).map(c => c.name).join(", ") || "none"}. Avoid ${power.avoid.slice(0, 2).map(c => c.name).join(", ") || "none"}.`;
  const eclipseKey = `${inp.year}-${String(inp.month).padStart(2, "0")}-${String(inp.day).padStart(2, "0")}`;
  const eclipse = ECLIPSES[eclipseKey] ? `${ECLIPSES[eclipseKey]} — eclipse day. Volatility is higher.` : null;
  if (eclipse) alerts.push(eclipse);
  const manifestation = inp.day === 28 || inp.day === 33 || ud.compound === 28 || ud.compound === 33 || ud.reduced === 33
    ? `Manifestation day — ${inp.day === 28 || ud.compound === 28 ? "28" : "33"} energy is on the card.`
    : null;
  if (manifestation) notes.push(manifestation);
  const nineCycle = entities.filter(e => e.pd && (e.pd.reduced === 9 || e.pd.compound === 9)).map(e => e.name);
  const volatility: string[] = [...hourLines];
  if (nineCycle.length) volatility.push(`9-cycle on ${nineCycle.join(", ")} — volatility, lean the under.`);

  const wealth = null;

  // Special-day notes + hard rule
  for (const n of [ud.compound, inp.day]) if (SPECIAL_NUMBERS[n] && !notes.includes(SPECIAL_NUMBERS[n])) notes.push(SPECIAL_NUMBERS[n]);
  let noPlay = ud.reduced === 9;
  if (noPlay) notes.unshift("9 Universal Day — volatility is high. The pick still stands.");

  const total = (s: Side) => +votes.filter(v => v.side === s).reduce((a, v) => a + v.weight, 0).toFixed(2);
  const name = (sd: Side) => (sd === "home" ? inp.home : inp.away).name;

  const masterWhy = (s: Side): string | null => {
    const bits: string[] = [];
    const lp = reads[s].lp;
    const ent = entities.find(e => e.side === s && (e.role === "Team" || e.role === "Fighter"));
    if (lp && (MASTERS.has(lp.reduced) || MASTERS.has(lp.compound))) bits.push(`Life Path ${fmt(lp)}`);
    if (ent?.pd && (MASTERS.has(ent.pd.reduced) || MASTERS.has(ent.pd.compound))) bits.push(`Personal Day ${fmt(ent.pd)}`);
    return bits.length ? bits.join(" + ") : null;
  };
  const venueMaster = entities
    .filter(e => e.side === "venue" && ((e.lp && (MASTERS.has(e.lp.reduced) || MASTERS.has(e.lp.compound))) || (e.pd && (MASTERS.has(e.pd.reduced) || MASTERS.has(e.pd.compound)))))
    .map(e => `${e.role} ${e.name} on a master`);
  const homeMaster = masterWhy("home");
  const awayMaster = masterWhy("away");
  const masters: string[] = [];
  const boostMaster = (s: Side, why: string) => {
    const base = total(s);
    const extra = Math.max(0.5, Math.round(base * 0.25 * 100) / 100);
    add(s, extra, "Team core", `Master multiplier ×1.25 — ${why} adds ${extra}`);
    masters.push(`${name(s)}: ${why}`);
  };
  if (homeMaster && !awayMaster) boostMaster("home", homeMaster);
  if (awayMaster && !homeMaster) boostMaster("away", awayMaster);
  if (venueMaster.length) boostMaster("home", venueMaster.join("; "));

  let home = total("home"), away = total("away");
  const tiedBeforeColor = home === away;
  const cycleOf = (founded?: [number, number, number]) => {
    if (!founded) return [] as number[];
    const pd = personalDayFor(founded, inp.year, inp.month, inp.day);
    const py = calcPersonalYear(founded[1], founded[2], inp.month, inp.day, inp.year);
    return [pd.reduced, pd.compound, py.reduced];
  };
  const colorCycleOf = (team: VoteTeam) => {
    const values = cycleOf(team.founded);
    const keyPlayer = team.people.find(person => /^(player|quarterback|pitcher|goalie|fighter|goalkeeper)$/i.test(person.role));
    const birth = keyPlayer ? parseDob(keyPlayer.dob) : null;
    if (birth) {
      const cycles = sportsCycles(birth[1], birth[2], inp.year, inp.month, inp.day);
      values.push(cycles.pd.reduced, cycles.pd.compound, cycles.py.reduced);
    }
    return values;
  };
  const jerseyOf = (t: VoteTeam) => {
    const p = t.people.find(x => x.role === "pitcher" || x.role === "quarterback" || (candidateMethod && (x.role === "player" || x.role === "goalie")));
    const d = p ? parseDob(p.dob) : null;
    if (!p || !d) return undefined;
    const pd = personalDayFor(d, inp.year, inp.month, inp.day);
    const lucky = luckyNumber(d[0], d[1]);
    return { name: p.name, numbers: [pd.reduced, pd.compound, lucky, reduceNum(lucky)] };
  };
  const stacked = colorStack({
    homeColors: inp.home.colors, awayColors: inp.away.colors,
    dayEnergies: [...new Set([ud.reduced, ud.compound, dom.reduced, dom.compound, inp.day])],
    homeCycle: colorCycleOf(inp.home), awayCycle: colorCycleOf(inp.away),
    homeJersey: jerseyOf(inp.home), awayJersey: jerseyOf(inp.away),
    nineDay: noPlay || inp.day === 9,
    relation: compareNumbers,
  });
  const scoreBeforeColors = { home: total("home"), away: total("away") };
  const colorCanSupport: Side | null = scoreBeforeColors.home === scoreBeforeColors.away
    ? null
    : scoreBeforeColors.home > scoreBeforeColors.away ? "home" : "away";
  for (const p of stacked.points) {
    const weight = colorCanSupport === p.side ? p.weight : 0;
    add(p.side, weight, "Colors", weight > 0 ? p.reason : `${p.reason} — shown as support only; colors cannot decide the pick`);
  }
  if (stacked.volatility) { alerts.push(stacked.volatility); volatility.push(stacked.volatility); }
  const nineDay = noPlay || inp.day === 9;
  const record9: string[] = [];
  if (nineDay) {
    for (const [s, t] of teams) {
      const roots: string[] = [];
      if (recordVibration(t.record) === 9) roots.push(`record ${t.record}`);
      const splitLabel = s === "home" ? "home split" : "road split";
      if (t.split && recordVibration(t.split) === 9) roots.push(`${splitLabel} ${t.split}`);
      const pct = winPct(t.record);
      const pctRoot = pct == null ? null : reduceNum(Math.round(pct * 100));
      if (pctRoot === 9) roots.push(`win% root 9`);
      if (!roots.length) continue;
      const line = `${t.name} ${roots.join(", ")} vibrates at 9 on a 9-day — penalty`;
      record9.push(line);
      add(other(s), 0.35, "Records", line);
    }
  }
  const injuryCaution = sevenEnergyInjuryCaution({
    universalDay: ud.reduced,
    calendarDay: dom.reduced,
    homeOuts: inp.home.outs,
    awayOuts: inp.away.outs,
  });
  if (injuryCaution) {
    const teamWithMoreOuts = injuryCaution.side === "away" ? inp.home : inp.away;
    const fewerOuts = injuryCaution.side === "away" ? inp.away : inp.home;
    add(
      injuryCaution.side,
      injuryCaution.weight,
      "Records",
      `7-energy injury/isolation caution: ${teamWithMoreOuts.name} has more listed absences than ${fewerOuts.name}; soft signal only`,
    );
  }
  if ((ud.reduced === 1 || inp.day === 17) && hc && ac && hc !== ac) {
    const gapNow = Math.abs(total("home") - total("away"));
    if (gapNow > 0 && gapNow < 3) {
      const s: Side = hc > ac ? "home" : "away";
      add(s, 0.25, "Game-day energy", `Close stack on a ${inp.day === 17 ? "17th" : "1-day"} — slight favorite and over lean to ${name(s)}`);
      notes.push("1-day / 17th with a close stack: slight favorite moneyline and a lean to the over.");
    }
  }
  if (learningActive()) {
    const rated = teamRatingVote(inp, add);
    const hp = winPct(inp.home.record), ap = winPct(inp.away.record);
    const played = (r?: string) => { const m = r?.match(/(\d+)-(\d+)/); return m ? +m[1] + +m[2] : 0; };
    if (hp != null && ap != null && hp !== ap && played(inp.home.record) >= 8 && played(inp.away.record) >= 8) {
      const gap = Math.abs(hp - ap);
      const band = gap >= 0.5 ? 50 : gap >= 0.4 ? 40 : gap >= 0.3 ? 30 : gap >= 0.15 ? 15 : 0;
      if (band) {
        const s: Side = hp > ap ? "home" : "away";
        const better = s === "home" ? inp.home : inp.away;
        const worse = s === "home" ? inp.away : inp.home;
        add(s, 1, "Records", `Better record gap ${band} — ${better.name} ${better.record} over ${worse.name} ${worse.record}`);
      }
      const s: Side = hp > ap ? "home" : "away";
      const better = s === "home" ? inp.home : inp.away;
      const worse = s === "home" ? inp.away : inp.home;
      add(s, Math.abs(hp - ap), "Records", `Record margin — ${better.name} ${better.record} over ${worse.name} ${worse.record}`);
    } else if (!rated && hp != null && ap != null && hp !== ap && played(inp.home.record) >= 2 && played(inp.away.record) >= 2) {
      const gap = Math.abs(hp - ap);
      const band = gap >= 0.5 ? 50 : gap >= 0.4 ? 40 : gap >= 0.3 ? 30 : gap >= 0.15 ? 15 : 0;
      if (band) {
        const s: Side = hp > ap ? "home" : "away";
        const better = s === "home" ? inp.home : inp.away;
        const worse = s === "home" ? inp.away : inp.home;
        add(s, 1, "Records", `Better record gap ${band} — ${better.name} ${better.record} over ${worse.name} ${worse.record}`);
      }
    }
    if (!inp.individual) add("home", rated ? 0 : 1, "Records", "Home field");
    const bandOf = (gap: number) => gap >= 0.5 ? 50 : gap >= 0.4 ? 40 : gap >= 0.3 ? 30 : gap >= 0.15 ? 15 : 0;
    const leanLine = (homeRec: string | undefined, awayRec: string | undefined, min: number, label: string, weights: Record<number, number>) => {
      const hpct = winPct(homeRec), apct = winPct(awayRec);
      if (hpct == null || apct == null || hpct === apct || played(homeRec) < min || played(awayRec) < min) return;
      const formBand = bandOf(Math.abs(hpct - apct));
      if (!formBand) return;
      const s: Side = hpct > apct ? "home" : "away";
      const better = s === "home" ? inp.home : inp.away;
      const worse = s === "home" ? inp.away : inp.home;
      add(s, weights[formBand], "Records", `${label} ${formBand} — ${better.name} ${s === "home" ? homeRec : awayRec} over ${worse.name} ${s === "home" ? awayRec : homeRec}`);
    };
    leanLine(inp.home.form, inp.away.form, 4, "Recent form gap", { 50: 1.5, 40: 1.2, 30: 0.9, 15: 0.4 });
    leanLine(inp.home.splitHome, inp.away.splitRoad, 5, "Home and road gap", { 50: 1.2, 40: 0.9, 30: 0.6, 15: 0.3 });
    if (inp.home.rest != null && inp.away.rest != null) {
      const homeTired = inp.home.rest <= 1, awayTired = inp.away.rest <= 1;
      if (homeTired !== awayTired) {
        const tired = homeTired ? inp.home.name : inp.away.name;
        add(homeTired ? "away" : "home", 0.4, "Records", `Back to back — ${tired} played yesterday, the other side is rested`);
      }
    }
    if (inp.home.outs != null && inp.away.outs != null && inp.home.outs !== inp.away.outs) {
      const homeHurt = inp.home.outs > inp.away.outs;
      const hurt = homeHurt ? inp.home : inp.away;
      add(homeHurt ? "away" : "home", 0.35, "Records", `Injury count — ${hurt.name} has more players out (${Math.max(inp.home.outs, inp.away.outs)} to ${Math.min(inp.home.outs, inp.away.outs)})`);
    }
    if (inp.home.h2hWins != null && inp.away.h2hWins != null && inp.home.h2hWins + inp.away.h2hWins >= 2 && inp.home.h2hWins !== inp.away.h2hWins) {
      const s: Side = inp.home.h2hWins > inp.away.h2hWins ? "home" : "away";
      add(s, 0.35, "Records", `Head to head gap — ${(s === "home" ? inp.home : inp.away).name} leads the season series ${Math.max(inp.home.h2hWins, inp.away.h2hWins)}-${Math.min(inp.home.h2hWins, inp.away.h2hWins)}`);
    }
  }
  const master = learningActive() ? masterRuleVotes({ ...inp, candidateMethod }) : { votes: [] };
  if(learningActive()) for(const [side,team] of teams) {
    const vibrations=recordVibrations({record:team.record,streak:team.streak,home:team.splitHome,away:team.splitRoad});
    const polarity=(n:number)=>{const relation=compareNumbers(n,ud.reduced);return ["same","friend","soulmate"].includes(relation) ? 1 : ["enemy","worst"].includes(relation) ? -1 : 0;};
    const edge=vibrations.length ? vibrations.reduce((sum,row)=>sum+polarity(row.root),0)/vibrations.length : 0;
    if(edge) add(edge>0 ? side : other(side),Math.abs(edge)*0.15,"Records",`${team.name} all-record vibration ${edge>0 ? "alignment" : "friction"} with Universal Day ${ud.reduced}; wins, losses, totals, streak and available splits checked equally`);
  }
  votes.push(...master.votes);
  if (learningActive() && inp.codeMode !== "backup") {
    for (const signal of learnedScreenshotVotes(inp)) {
      add(signal.side, signal.weight, signal.layer, signal.reason, signal.signalId);
    }
  }
  for (const v of votes) {
    const baseWeight = v.baseWeight ?? v.weight;
    const isRaw = inp.weightMode === "raw";
    const canCalibrate = learningActive() && !isRaw;
    const calibrated = canCalibrate
      ? calibratedWeightDetails(inp.league, v, inp.codeMode ?? "learned", inp.weightProfileOverride)
      : { multiplier: 1, source: isRaw ? "raw" as const : "unscaled" as const };
    v.baseWeight = baseWeight;
    v.weightMultiplier = calibrated.multiplier;
    v.weightSource = calibrated.source;
    v.signalId ??= `${v.layer}/${ruleId(v.reason)}`;
    v.eventKey ??= `${v.side}:${v.reason.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim()}`;
    v.weight = baseWeight * calibrated.multiplier;
    v.appliedWeight = v.weight;
  }
  const ratingVote = votes.find(v => ruleId(v.reason) === "team-rating");
  const favName = ratingVote ? (ratingVote.side === "home" ? inp.home.name : inp.away.name) : "";
  const dogName = ratingVote ? (ratingVote.side === "home" ? inp.away.name : inp.home.name) : "";
  const dogSide: Side = ratingVote?.side === "home" ? "away" : "home";
  const dropRating = !!(ratingVote && inp.league === "NBA"
    && votes.some(v => v.reason.startsWith(favName) && /enemy of the/.test(v.reason))
    && votes.some(v => v.reason.startsWith(dogName) && /friendly with the|matches the/.test(v.reason))
    && winPct(inp.home.record) != null && winPct(inp.away.record) != null
    && (dogSide === "away" ? (winPct(inp.away.record) as number) > (winPct(inp.home.record) as number) : (winPct(inp.home.record) as number) > (winPct(inp.away.record) as number))
    && Math.abs((winPct(inp.home.record) as number) - (winPct(inp.away.record) as number)) >= 0.05);
  if (dropRating && ratingVote) {
    ratingVote.weight = 0;
    ratingVote.appliedWeight = 0;
  }
  const numerologyGuard = inp.weightMode === "raw"
    ? null
    : capAstrologyAgainstNumerology(votes, inp.codeMode ?? "learned");
  if (numerologyGuard) {
    notes.push(`Numerology-first balance: opposing astrology signals were limited because numerology favors ${name(numerologyGuard.side)}.`);
  }
  // A frequency lock is numerology-first: stats/environment cannot cap it.
  const frequencyLock = votes.some(vote => vote.reason.startsWith("Frequency lock") && vote.weight > 0);
  const numerologyFirst = inp.numerologyFirst ?? NUMEROLOGY_FIRST;
  const environmentGuard = inp.weightMode === "raw" || frequencyLock || (numerologyFirst && (inp.codeMode ?? "learned") === "learned")
    ? null
    : capEsotericAgainstEnvironment(votes, inp.codeMode ?? "learned");
  if (environmentGuard) {
    notes.push(`Environment-first balance: conflicting astrology/numerology signals were limited because game-context signals favor ${name(environmentGuard.side)}.`);
  }
  const colorGuard = inp.weightMode === "raw" || (inp.codeMode ?? "learned") === "backup"
    ? null
    : capColorSupportBelowPrimarySignals(votes);
  if (colorGuard?.side === null) {
    notes.push("Color support was withheld on a non-color tie so color alone cannot decide the side.");
  } else if (colorGuard) {
    notes.push(`Color support was capped below the stronger non-color signals favoring ${name(colorGuard.side)}.`);
  }
  const gematriaVotes = votes.filter(vote => vote.signalId === "Number pairs/learned-screenshot-gematria");
  if (gematriaVotes.length && inp.weightMode !== "raw" && (inp.codeMode ?? "learned") === "learned") {
    const nonGematriaHome = votes.filter(vote => vote.side === "home" && vote.signalId !== "Number pairs/learned-screenshot-gematria")
      .reduce((sum, vote) => sum + vote.weight, 0);
    const nonGematriaAway = votes.filter(vote => vote.side === "away" && vote.signalId !== "Number pairs/learned-screenshot-gematria")
      .reduce((sum, vote) => sum + vote.weight, 0);
    const mainMargin = Math.abs(nonGematriaHome - nonGematriaAway);
    if (mainMargin >= 3) {
      for (const vote of gematriaVotes) {
        vote.weight = 0;
        vote.appliedWeight = 0;
        vote.reason += ` — held as lowest-priority support because the primary margin is ${mainMargin.toFixed(2)}`;
      }
      notes.push(`Gematria was held as the lowest-priority signal because the non-gematria margin (${mainMargin.toFixed(2)}) reached the 3-point decision threshold.`);
    }
  }
  // Numerology/astrology sweep: when every leaning non-stat layer agrees on one
  // side (and at least two lean), records alone may not flip the pick.
  if (inp.weightMode !== "raw" && (inp.codeMode ?? "learned") === "learned" && (inp.spiritualSweep ?? SPIRITUAL_SWEEP)) {
    const lean = (step: Step) => votes.filter(v => v.layer === step).reduce((n, v) => n + (v.side === "home" ? v.weight : -v.weight), 0);
    const leans = STEP_ORDER.filter(st => st !== "Records" && st !== "Colors").map(lean).filter(n => Math.abs(n) > 1e-9);
    const side: Side | null = leans.length >= 2 && leans.every(n => n > 0) ? "home" : leans.length >= 2 && leans.every(n => n < 0) ? "away" : null;
    if (side && total(side) <= total(other(side))) {
      for (const v of votes) if (v.layer === "Records" && v.side !== side) { v.weight = 0; v.appliedWeight = 0; }
      notes.push(`Numerology & astrology sweep: every leaning code layer favors ${name(side)}, so records alone cannot flip it.`);
    }
  }
  home = total("home"); away = total("away");
  let tiebreak = false;
  let tiePick: Side | null = null;
  if (home === away) {
    tiebreak = true;
    const h = winPct(inp.home.record), a = winPct(inp.away.record);
    const hasRecordEdge = h != null && a != null && h !== a;
    const s: Side = hasRecordEdge
      ? (h > a ? "home" : "away")
      : inp.individual
        ? (inp.home.name.localeCompare(inp.away.name, undefined, { sensitivity: "base" }) <= 0 ? "home" : "away")
        : "home";
    tiePick = s;
    const reason = hasRecordEdge
      ? `Tiebreaker: better record (${s === "home" ? inp.home.record : inp.away.record})`
      : inp.individual
        ? "Tiebreaker: neutral fighter ordering"
        : "Tiebreaker: home field";
    add(s, inp.individual && !hasRecordEdge ? 0 : 0.1, "Records", reason);
    home = total("home"); away = total("away");
  } else if (tiedBeforeColor) tiebreak = true;
  const pick: Side = home > away ? "home" : away > home ? "away" : inp.individual && tiePick ? tiePick : "home";
  const noEdge: Record<Step, string> = {
    "Team core": !reads.home.lp || !reads.away.lp ? `${inp.individual ? "Birth" : "Founding"} date missing for one side` : `Equal core signatures (${fmt(reads.home.lp)} vs ${fmt(reads.away.lp)})`,
    "Game-day energy": hh || ah ? `Both sides touch today's ${dayLabel} equally` : `Neither side touches today's ${dayLabel}`,
    "Number pairs": `No enemy or friend pair with the ${ud.reduced} day`,
    "Chinese zodiac": hs && as && hs === as ? `Both are ${hs} — a wash` : `No enemy year or trine with the ${yearSign} year / ${monthSign} month`,
    "Stars & venue": missing.some(m => /birth|starters/.test(m)) ? "No matches — some birth dates not available yet" : "No player or venue matches today",
    "Colors": "No color edge — primaries missing, neutral, or capped even",
    "Records": nineDay ? "Neither record vibrates at 9" : "Not a 9-day — record vibration stays quiet. Win percentage only breaks a tie.",
  };
  const steps: StepRow[] = STEP_ORDER.map(st => {
    const vs = votes.filter(x => x.layer === st);
    const w = { home: 0, away: 0 }; vs.forEach(x => (w[x.side] += x.weight));
    const edge: Side | null = w.home === w.away ? null : w.home > w.away ? "home" : "away";
    return { step: st, label: STEP_LABELS[st], edge, reason: vs.length ? vs.map(x => `${name(x.side)}: ${x.reason}`).join(" · ") : noEdge[st] };
  });
  const coreMissing = new Set(missing.filter(m => /date/.test(m))).size;
  const confidence = computeConfidence({
    winner: pick === "home" ? home : away, loser: pick === "home" ? away : home,
    noPlay, alerts: alerts.filter(a => !a.startsWith("9 Universal") && !a.startsWith("Championship alert:")).length, missing: coreMissing,
    tiebreakOnly: tiebreak,
  });
  const colorHome = +stacked.points.filter(p => p.side === "home").reduce((a, p) => a + p.weight, 0).toFixed(2);
  const colorAway = +stacked.points.filter(p => p.side === "away").reduce((a, p) => a + p.weight, 0).toFixed(2);
  const stadium = notes.filter(n => /opened /.test(n) && /chart/.test(n));
  const equalMasters = !!(homeMaster && awayMaster);
  const margin = +Math.abs(home - away).toFixed(2);
  const hard: string[] = [];
  if (noPlay) hard.push("9 Universal Day — high volatility.");
  if (equalMasters) hard.push("Both sides hold a master number — boost is a wash.");
  if (userHourEnemy) hard.push("Your personal hour clashes with the game window.");
  const cautions = [
    "Opening line, closing line, and public % are not in this feed, so they are not scored.",
    "Whale/top-trader positions, jersey-change history and player-versus-opponent handedness are not supplied; those data-dependent observations are not inferred.",
    ...bettor.filter(b => /enemy/.test(b)),
  ];
  const flags: VoteFlags = {
    colorHome, colorAway, wealth, userChart, volatility: stacked.volatility ?? volatility.find(v => /9-cycle|flips/.test(v)) ?? null, masters, record9, stadium,
    hour: hourLines.filter(h => !/not on the card|reliever/.test(h)).join(" · ") || "Closing hour weight is 0.40, against 0.15 at the start and 0.15 mid-game.",
    equalMasters,
  };
  const decision: VoteDecision = {
    margin, threshold: 3, hard, cautions, volatility, bettor, powerColor, manifestation, eclipse,
    lunar: `Moon ${moon}, ${moonIllum}% lit. ${moonInfo.bias} — ${moonInfo.biasNote}`,
  };
  const categoryEdges = steps.filter(step => step.edge != null);
  const agreeingCategories = categoryEdges.filter(step => step.edge === pick).length;
  const opposingCategories = categoryEdges.filter(step => step.edge !== pick).length;
  const eventGroups = new Map<string, Set<string>>();
  for (const vote of votes) {
    const eventKey = vote.eventKey;
    const signalId = vote.signalId;
    if (!eventKey || !signalId) continue;
    const signals = eventGroups.get(eventKey) ?? new Set<string>();
    signals.add(signalId);
    eventGroups.set(eventKey, signals);
  }
  const duplicateEventGroups = [...eventGroups.entries()]
    .filter(([, signals]) => signals.size > 1)
    .map(([eventKey, signals]) => ({ eventKey, signals: [...signals].sort() }));
  const positiveTotal = Math.max(0, home) + Math.max(0, away);
  const pickedTotal = pick === "home" ? Math.max(0, home) : Math.max(0, away);
  const coreData = [
    !!inp.home.founded, !!inp.away.founded,
    !!inp.home.record, !!inp.away.record,
    !!inp.home.colors?.length, !!inp.away.colors?.length,
    !!inp.stadiumOpened, !!inp.cityFounded,
  ];
  const audit: VoteAudit = {
    pickedVoteShare: positiveTotal ? Math.round(100 * pickedTotal / positiveTotal) : 50,
    margin: +Math.abs(home - away).toFixed(2),
    signalCount: votes.length,
    activeSignalCount: votes.filter(vote => Math.abs(vote.weight) > 0).length,
    agreeingCategories,
    opposingCategories,
    neutralCategories: STEP_ORDER.length - categoryEdges.length,
    usedTiebreak: tiebreak,
    coreDataCoverage: { available: coreData.filter(Boolean).length, expected: coreData.length },
    missingInputs: [...new Set(missing)],
    duplicateEventGroups,
  };
  return { entities, gameDayOfYear: dayOfYear(inp.year, inp.month, inp.day), votes, home, away, pick, tiebreak, universalDay: ud, dayOfMonth: dom, yearSign, monthSign, noPlay, alerts, notes, missing, reads, steps, confidence, band: confidenceBand(confidence), audit, flags, decision };
}

