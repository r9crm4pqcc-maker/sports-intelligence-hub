// ShemUniverse SportsCode — matchup analyzer that produces the
// "World Cup Analysis" style decode: stat panels per team / city / stadium,
// a grid of insight cards (FRIENDLY / NEUTRAL / ENEMY with reasoning), an
// overall read paragraph, and a final color-coded code verdict.

import {
  secondaryEnergy, nameNumber, dayNumberLabel,
  chineseYear, chineseMonth,
  westernSign, moonSign, moonPhase, reduceMaster,
  universalYear, COMPAT, compatTier, compatStrength,
  chinesePillarsAt, cityTz,
} from "./sports-decode";
import { getTeamMeta, type TeamMeta, type DateTuple } from "./sports-data";
import { dominantColor, colorTier, type ColorEntry } from "./colorology";
import { getBias } from "./sports-learning";
import { candidateSportsLifePath } from "./sports-method-candidate";

// ─── Chinese stem element (Wood/Fire/Earth/Metal/Water) ────────────────────
const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
export function stemElement(year: number): string {
  const i = (((year - 4) % 10) + 10) % 10;
  return STEM_ELEMENTS[i];
}
export function czYearFull(year: number, month: number, day: number): string {
  return `${stemElement(year)} ${chineseYear(year, month, day)}`;
}

// ─── Chinese zodiac relations ──────────────────────────────────────────────
// Trines (San He): Rat/Dragon/Monkey (Water), Ox/Snake/Rooster (Metal),
// Tiger/Horse/Dog (Fire), Rabbit/Goat/Pig (Wood)
const TRINE_GROUPS: { name: string; element: string; signs: string[] }[] = [
  { name: "Water Trine", element: "Water", signs: ["Rat","Dragon","Monkey"] },
  { name: "Metal Trine", element: "Metal", signs: ["Ox","Snake","Rooster"] },
  { name: "Fire Trine",  element: "Fire",  signs: ["Tiger","Horse","Dog"] },
  { name: "Wood Trine",  element: "Wood",  signs: ["Rabbit","Goat","Pig"] },
];
// Six clashes (Liu Chong)
const CLASHES: Record<string, string> = {
  Rat: "Horse", Horse: "Rat",
  Ox: "Goat", Goat: "Ox",
  Tiger: "Monkey", Monkey: "Tiger",
  Rabbit: "Rooster", Rooster: "Rabbit",
  Dragon: "Dog", Dog: "Dragon",
  Snake: "Pig", Pig: "Snake",
};
// Six secret friends (Liu He)
const SECRET_FRIENDS: Record<string, string> = {
  Rat: "Ox", Ox: "Rat",
  Tiger: "Pig", Pig: "Tiger",
  Rabbit: "Dog", Dog: "Rabbit",
  Dragon: "Rooster", Rooster: "Dragon",
  Snake: "Monkey", Monkey: "Snake",
  Horse: "Goat", Goat: "Horse",
};

export type CzRel =
  | { type: "same"; trine?: string }
  | { type: "trine"; name: string; element: string }
  | { type: "secret-friend" }
  | { type: "clash" }
  | { type: "neutral" };

export function czRelation(a: string, b: string): CzRel {
  if (!a || !b) return { type: "neutral" };
  if (a === b) {
    const t = TRINE_GROUPS.find(g => g.signs.includes(a));
    return { type: "same", trine: t?.name };
  }
  if (CLASHES[a] === b) return { type: "clash" };
  if (SECRET_FRIENDS[a] === b) return { type: "secret-friend" };
  for (const g of TRINE_GROUPS) {
    if (g.signs.includes(a) && g.signs.includes(b)) {
      return { type: "trine", name: g.name, element: g.element };
    }
  }
  return { type: "neutral" };
}

// ─── Decode shapes ──────────────────────────────────────────────────────────
export interface TeamPanel {
  name: string;
  founded?: { y: number; m: number; d: number; label: string };
  teamLifepath?: { value: number; expr: string };
  secondaryEnergy?: number;
  lifepathDay?: { value: number; expr: string };
  nameNumber?: { value: number; expr: string };
  czYearLabel?: string;
  czMonth?: string;
  westernZodiac?: string;
  sunSign?: string;
  moonSign?: string;
}

export interface CityPanel {
  name: string;
  founded?: { y: number; m: number; d: number; label: string };
  lifepath?: { value: number; expr: string };
  czYearLabel?: string;
  westernZodiac?: string;
}

export interface StadiumPanel {
  name: string;
  opened?: { y: number; m: number; d: number; label: string };
  lifepath?: { value: number; expr: string };
  lifepathDay?: { value: number; expr: string };
  nameNumber?: { value: number; expr: string };
  czYearLabel?: string;
  czMonth?: string;
  westernZodiac?: string;
}

export type Tier = "FRIENDLY" | "NEUTRAL" | "ENEMY" | "HIGHLIGHT";

export interface InsightCard {
  badge: string;          // e.g. "DAY # 9 vs MEXICO LP 5"
  title: string;          // e.g. "FRIENDLY ✓"
  tier: Tier;
  body: string;
}

export interface MatchupContext {
  year: number; month: number; day: number;
  dateLabel: string;
  weekday: string;
  universalDay: number;
  secondaryEnergy: number;
  lunarPhase: string;
  lunarBias: string;
  lunarNote: string;
  yearZodiac: string;
  monthZodiac: string;
  hourZodiac?: string;
  minuteZodiac?: string;
  venueTz?: string;
  venueLocalLabel?: string;
  westernSunSign: string;
}

export interface Verdict {
  side: "home" | "away" | "draw";
  label: string;          // e.g. "MEXICO WIN", "DRAW / LEAN BOSNIA"
  color: "GREEN" | "BLUE" | "YELLOW";
  oneLiner: string;
}

export interface WeightedBreakdown {
  day: number;      // 0-100
  color: number;    // 0-100
  opponent: number; // 0-100
  total: number;    // 0-10 (40/20/20 plus a neutral 20% baseline)
  bias: number;     // learning bias applied (-1..1)
}

export interface MatchupAnalysis {
  context: MatchupContext;
  home: TeamPanel;
  away: TeamPanel;
  city: CityPanel | null;
  stadium: StadiumPanel | null;
  insights: InsightCard[];
  overallRead: string;
  verdict: Verdict;
  homeScore: number;
  awayScore: number;
  homeColor: ColorEntry | null;
  awayColor: ColorEntry | null;
  weighted: { home: WeightedBreakdown; away: WeightedBreakdown; confidencePct: number };
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function dateLabel(y: number, m: number, d: number): string {
  return `${MONTHS[m-1]} ${d}, ${y}`;
}
function lifepathOf(meta: TeamMeta | DateTuple) {
  const t: DateTuple = Array.isArray(meta) ? meta : meta.founded;
  const lp = candidateSportsLifePath(t[0], t[1], t[2], chineseYear(t[0], t[1], t[2]) === "Snake");
  const all = `${t[0]}${t[1]}${t[2]}`.split("").join("+");
  return { value: lp.reduced, expr: `${all}=${lp.compound}${lp.compound !== lp.reduced ? `→${lp.reduced}` : ""}` };
}
function nameNumOf(name: string) {
  const n = nameNumber(name);
  // build "M+E+X+I+C+O=33→6" style display
  const upper = name.toUpperCase().replace(/[^A-Z]/g, "");
  const PYTH: Record<string, number> = {
    A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
    J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
    S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,
  };
  const parts = upper.split("").map(c => PYTH[c] ?? 0);
  const expr = parts.length <= 12
    ? `${parts.join("+")}=${n.compound}${n.compound !== n.reduced ? `→${n.reduced}` : ""}`
    : `${n.compound}${n.compound !== n.reduced ? `→${n.reduced}` : ""}`;
  return { value: n.reduced, expr };
}
function dayLPOf(d: number) {
  const r = reduceMaster(d);
  return { value: r, expr: d === r ? `${d}` : `${d}→${r}` };
}

// ─── Team / City / Stadium panel builders ──────────────────────────────────
function buildTeam(name: string, meta?: TeamMeta): TeamPanel {
  if (!meta) {
    const nn = nameNumOf(name);
    return { name, nameNumber: nn };
  }
  const [y, m, d] = meta.founded;
  return {
    name,
    founded: { y, m, d, label: dateLabel(y, m, d) },
    teamLifepath: lifepathOf(meta.founded),
    secondaryEnergy: secondaryEnergy(y, m, d),
    lifepathDay: dayLPOf(d),
    nameNumber: nameNumOf(name),
    czYearLabel: czYearFull(y, m, d),
    czMonth: chineseMonth(m, d),
    westernZodiac: westernSign(m, d).sign,
    sunSign: westernSign(m, d).sign,
    moonSign: moonSign(y, m, d),
  };
}

function buildCity(meta?: TeamMeta): CityPanel | null {
  if (!meta) return null;
  const [y, m, d] = meta.cityFounded;
  return {
    name: meta.city,
    founded: { y, m, d, label: dateLabel(y, m, d) },
    lifepath: lifepathOf(meta.cityFounded),
    czYearLabel: czYearFull(y, m, d),
    westernZodiac: westernSign(m, d).sign,
  };
}

function buildStadium(meta?: TeamMeta): StadiumPanel | null {
  if (!meta) return null;
  const [y, m, d] = meta.stadiumOpened;
  return {
    name: meta.stadium,
    opened: { y, m, d, label: dateLabel(y, m, d) },
    lifepath: lifepathOf(meta.stadiumOpened),
    lifepathDay: dayLPOf(d),
    nameNumber: nameNumOf(meta.stadium),
    czYearLabel: czYearFull(y, m, d),
    czMonth: chineseMonth(m, d),
    westernZodiac: westernSign(m, d).sign,
  };
}

// ─── Insight builders ──────────────────────────────────────────────────────
function lpTierBetween(a: number, b: number): { tier: Tier; word: string } {
  const t = compatTier(a, b);
  if (t === "friendly") return { tier: "FRIENDLY", word: "friendly" };
  if (t === "enemy")    return { tier: "ENEMY",    word: "enemy" };
  if (t === "self")     return { tier: "FRIENDLY", word: "same / self" };
  return { tier: "NEUTRAL", word: "neutral" };
}

function tierScore(t: Tier): number {
  if (t === "FRIENDLY") return 1;
  if (t === "ENEMY") return -1;
  if (t === "HIGHLIGHT") return 0.5;
  return 0;
}

interface MatchupInput {
  homeTeam: string;
  awayTeam: string;
  year: number; month: number; day: number;
  homeIsFavorite?: boolean;
  startTimeISO?: string;
  venueCity?: string;
  homeColors?: string[];
  awayColors?: string[];
}

export function analyzeMatchup(input: MatchupInput): MatchupAnalysis {
  const { homeTeam, awayTeam, year, month, day } = input;
  const homeMeta = getTeamMeta(homeTeam);
  const awayMeta = getTeamMeta(awayTeam);

  const home = buildTeam(homeTeam, homeMeta);
  const away = buildTeam(awayTeam, awayMeta);
  // Venue = home team's city/stadium
  const city = buildCity(homeMeta);
  const stadium = buildStadium(homeMeta);

  // Venue timezone (falls back to ET)
  const tz = cityTz(input.venueCity ?? homeMeta?.city);
  // Chinese pillars anchored at venue local time — if we have a kickoff ISO,
  // use that instant; else compute at noon local for the requested date.
  const iso = input.startTimeISO ??
    new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).toISOString();
  const pillars = chinesePillarsAt(iso, tz);
  const venueLocalLabel = (() => {
    const p = pillars.parts;
    const hh = String(p.h).padStart(2, "0");
    const mm = String(p.min).padStart(2, "0");
    return `${MONTHS[p.m - 1]} ${p.d}, ${p.y} · ${hh}:${mm} local`;
  })();

  // Day-level context (universal number computed from the calendar date the
  // user is viewing, which is timezone-neutral)
  const uniDay = reduceMaster(`${year}${month}${day}`.split("").reduce((a,c)=>a+Number(c),0));
  const dayLP = uniDay; // "Day #" in the screenshots = universal day reduced
  const secEnergy = `${year}${month}${day}`.split("").reduce((a,c)=>a+Number(c),0);
  const mp = moonPhase(year, month, day);
  const ctx: MatchupContext = {
    year, month, day,
    dateLabel: dateLabel(year, month, day),
    weekday: DAYS[new Date(year, month-1, day).getDay()],
    universalDay: uniDay,
    secondaryEnergy: secEnergy,
    lunarPhase: mp.phase,
    lunarBias: mp.bias,
    lunarNote: mp.biasNote,
    yearZodiac: pillars.year,
    monthZodiac: pillars.month,
    hourZodiac: pillars.hour,
    minuteZodiac: pillars.minute,
    venueTz: tz,
    venueLocalLabel,
    westernSunSign: westernSign(month, day).sign,
  };

  const insights: InsightCard[] = [];
  let homeScore = 0;
  let awayScore = 0;

  // Helper to build COMPAT body text
  function compatBody(lp: number, dayN: number, tier: Tier): string {
    const row = COMPAT[lp];
    if (!row) return `${dayN} lifepath compatibility unknown for LP ${lp}.`;
    if (tier === "FRIENDLY") return `${dayN} lifepath friendly to ${lp}: ${row.friendly.join(", ")} family. Day energy supports.`;
    if (tier === "ENEMY")    return `${dayN} lifepath enemies of ${lp}: ${row.enemy.join(", ")}. Day energy opposes.`;
    return `${dayN} lifepath neutral to ${lp}: ${row.neutral.join(", ")}. No head-to-head clash.`;
  }

  // 1) Day # vs HOME team LP
  if (home.teamLifepath) {
    const t = lpTierBetween(dayLP, home.teamLifepath.value);
    insights.push({
      badge: `DAY # ${dayLP} vs ${homeTeam.toUpperCase()} LP ${home.teamLifepath.value}`,
      title: t.tier === "FRIENDLY" ? "FRIENDLY ✓" : t.tier === "ENEMY" ? "ENEMY ✗" : "NEUTRAL",
      tier: t.tier,
      body: compatBody(home.teamLifepath.value, dayLP, t.tier),
    });
    homeScore += tierScore(t.tier);
  }
  // 2) Day # vs AWAY team LP
  if (away.teamLifepath) {
    const t = lpTierBetween(dayLP, away.teamLifepath.value);
    insights.push({
      badge: `DAY # ${dayLP} vs ${awayTeam.toUpperCase()} LP ${away.teamLifepath.value}`,
      title: t.tier === "FRIENDLY" ? "FRIENDLY ✓" : t.tier === "ENEMY" ? "ENEMY ✗" : "NEUTRAL",
      tier: t.tier,
      body: compatBody(away.teamLifepath.value, dayLP, t.tier),
    });
    awayScore += tierScore(t.tier);
  }

  // 5) Stadium LP × City LP — master resonance
  if (stadium?.lifepath && city?.lifepath) {
    const sLP = stadium.lifepath.value;
    const cLP = city.lifepath.value;
    if (sLP === cLP && (sLP === 11 || sLP === 22 || sLP === 33)) {
      insights.push({
        badge: `STADIUM LP ${sLP} × CITY LP ${cLP}`,
        title: "MASTER NUMBER RESONANCE",
        tier: "HIGHLIGHT",
        body: `Both stadium & city carry ${sLP}. Amplifies host team advantage.`,
      });
      homeScore += 1;
    } else if (sLP === cLP) {
      insights.push({
        badge: `STADIUM LP ${sLP} × CITY LP ${cLP}`,
        title: "VENUE ALIGNED ✓",
        tier: "FRIENDLY",
        body: `Stadium and city both reduce to ${sLP}. Coherent home energy.`,
      });
      homeScore += 0.5;
    }
  }

  // 7) Lunar phase
  const lunarSide = mp.bias === "FAVORITES" ? "favorites" : mp.bias === "UNDERDOGS" ? "underdogs" : "slight underdogs";
  const isHomeFav = input.homeIsFavorite ?? true;
  insights.push({
    badge: "LUNAR PHASE",
    title: `${mp.phase.toUpperCase()} → ${mp.bias}`,
    tier: mp.bias === "FAVORITES" ? "FRIENDLY" : "ENEMY",
    body: `${mp.biasNote}. Underdog energy: ${isHomeFav ? awayTeam : homeTeam}.`,
  });
  if (mp.bias === "FAVORITES") {
    if (isHomeFav) homeScore += 0.75; else awayScore += 0.75;
  } else {
    if (isHomeFav) awayScore += 0.75; else homeScore += 0.75;
  }

  // 8) Head-to-head LP
  if (home.teamLifepath && away.teamLifepath) {
    const t = lpTierBetween(home.teamLifepath.value, away.teamLifepath.value);
    insights.push({
      badge: `${homeTeam.toUpperCase()} LP ${home.teamLifepath.value} × ${awayTeam.toUpperCase()} LP ${away.teamLifepath.value}`,
      title: t.tier === "FRIENDLY" ? "FRIENDLY MATCH" : t.tier === "ENEMY" ? "DIRECT CLASH" : "NEUTRAL",
      tier: t.tier,
      body: t.tier === "FRIENDLY"
        ? `LP ${home.teamLifepath.value} & LP ${away.teamLifepath.value} are friendly — symmetric energy, no numerology loser.`
        : t.tier === "ENEMY"
        ? `LP ${home.teamLifepath.value} & LP ${away.teamLifepath.value} are enemies — friction baked in.`
        : `LP ${home.teamLifepath.value} & LP ${away.teamLifepath.value}: neutral pair. Tight contest expected.`,
    });
  }

  // 9) City LP × DAY # context
  if (city?.lifepath) {
    const t = lpTierBetween(city.lifepath.value, dayLP);
    if (t.tier === "FRIENDLY") {
      insights.push({
        badge: `CITY ${city.name.toUpperCase()} LP ${city.lifepath.value}`,
        title: `DAY ${dayLP} FRIENDLY TO LP ${city.lifepath.value}`,
        tier: "FRIENDLY",
        body: `City energy (${city.lifepath.value}) harmonizes with day ${dayLP}.`,
      });
      homeScore += 0.5;
    } else if (t.tier === "ENEMY") {
      insights.push({
        badge: `CITY ${city.name.toUpperCase()} LP ${city.lifepath.value}`,
        title: `DAY ${dayLP} ENEMY TO LP ${city.lifepath.value}`,
        tier: "ENEMY",
        body: `City energy (${city.lifepath.value}) fights day ${dayLP}.`,
      });
      homeScore -= 0.5;
    }
  }

  // ─── Verdict ──────────────────────────────────────────────────────────────
  const diff = homeScore - awayScore;
  let verdict: Verdict;
  if (Math.abs(diff) < 0.6) {
    verdict = {
      side: "draw",
      label: diff >= 0 ? `DRAW / LEAN ${homeTeam.toUpperCase()}` : `DRAW / LEAN ${awayTeam.toUpperCase()}`,
      color: "BLUE",
      oneLiner: `Code shows tension, not a clear win — energies cancel.`,
    };
  } else if (diff > 0) {
    verdict = {
      side: "home",
      label: `${homeTeam.toUpperCase()} WIN`,
      color: "GREEN",
      oneLiner: `Day ${dayLP} + remaining layers favor ${homeTeam} on home turf.`,
    };
  } else {
    verdict = {
      side: "away",
      label: `${awayTeam.toUpperCase()} WIN`,
      color: "GREEN",
      oneLiner: `Day ${dayLP} + remaining layers favor ${awayTeam} despite the venue.`,
    };
  }

  // ─── Overall Read ─────────────────────────────────────────────────────────
  const friendlyH = insights.filter(i => i.tier === "FRIENDLY" && i.badge.includes(homeTeam.toUpperCase())).length;
  const enemyA = insights.filter(i => i.tier === "ENEMY" && i.badge.includes(awayTeam.toUpperCase())).length;
  const overallRead = [
    verdict.side === "draw"
      ? `This game shows genuine split energies. `
      : `${verdict.side === "home" ? homeTeam : awayTeam} has multiple layers of the code working in their favor on ${ctx.dateLabel}. `,
    home.teamLifepath && away.teamLifepath
      ? `Day ${dayLP} ${compatTier(dayLP, home.teamLifepath.value)} to ${homeTeam} (LP ${home.teamLifepath.value}) and ${compatTier(dayLP, away.teamLifepath.value)} to ${awayTeam} (LP ${away.teamLifepath.value}). `
      : "",
    `The ${mp.phase} (${mp.bias.toLowerCase()}) ${mp.bias === "FAVORITES" ? "backs the chalk" : "pushes underdogs"}. `,
    stadium?.lifepath && city?.lifepath
      ? `Stadium LP ${stadium.lifepath.value} × City LP ${city.lifepath.value} sets the venue tone. `
      : "",
    verdict.side === "draw"
      ? `Read: TIGHT CONTEST.`
      : `Read: ${verdict.label}.`,
  ].join("");

  // ─── Weighted scoring; the removed day-animal slice remains neutral ──────
  const homeColor = dominantColor(input.homeColors);
  const awayColor = dominantColor(input.awayColors);

  const homeLP = home.teamLifepath?.value ?? dayLP;
  const awayLP = away.teamLifepath?.value ?? dayLP;

  // 1) Day compat (0-100)
  const dayH = compatStrength(dayLP, homeLP);
  const dayA = compatStrength(dayLP, awayLP);

  // 2) Colorology (0-100). Friendly stack / non-Red side wins.
  let colorH = 50, colorA = 50;
  if (homeColor || awayColor) {
    const t = colorTier(homeColor, awayColor);
    if (t === "A") { colorH = 85; colorA = 35; }
    else if (t === "B") { colorH = 35; colorA = 85; }
    else if (t === "even") { colorH = 55; colorA = 55; }
    if (homeColor?.friendly) colorH = Math.max(colorH, 75);
    if (awayColor?.friendly) colorA = Math.max(colorA, 75);
    if (homeColor?.enemy) colorH = Math.min(colorH, 25);
    if (awayColor?.enemy) colorA = Math.min(colorA, 25);
  }

  // 3) Opponent H2H (0-100) — LP tier between the two teams
  const oppH = compatStrength(homeLP, awayLP);
  const oppA = compatStrength(awayLP, homeLP);

  // Learning bias (-1..1) → up to ±0.5 pts on 0-10 scale
  const biasH = getBias(homeTeam);
  const biasA = getBias(awayTeam);

  function tenOf(day: number, color: number, opp: number, bias: number) {
    // Preserve the old scale; the removed day-animal share contributes no edge.
    const pct = day * 0.40 + color * 0.20 + opp * 0.20 + 10;
    return Math.max(0, Math.min(10, pct / 10 + bias * 0.5));
  }

  const weightedHome: WeightedBreakdown = {
    day: dayH, color: colorH, opponent: oppH,
    total: tenOf(dayH, colorH, oppH, biasH), bias: biasH,
  };
  const weightedAway: WeightedBreakdown = {
    day: dayA, color: colorA, opponent: oppA,
    total: tenOf(dayA, colorA, oppA, biasA), bias: biasA,
  };
  const confidencePct = Math.round(
    100 * Math.abs(weightedHome.total - weightedAway.total) /
    Math.max(1, weightedHome.total + weightedAway.total)
  );

  // Colorology insight card (only if we have any color info)
  if (homeColor || awayColor) {
    const t = colorTier(homeColor, awayColor);
    const tierUi: Tier = t === "A" ? "FRIENDLY" : t === "B" ? "ENEMY" : "NEUTRAL";
    insights.push({
      badge: `COLORS: ${homeColor?.name ?? "?"} (${homeColor?.number ?? "-"}) × ${awayColor?.name ?? "?"} (${awayColor?.number ?? "-"})`,
      title: t === "A" ? `${homeTeam.toUpperCase()} COLOR EDGE` : t === "B" ? `${awayTeam.toUpperCase()} COLOR EDGE` : "COLOR EVEN",
      tier: tierUi,
      body: [
        homeColor ? `${homeTeam} dominant ${homeColor.name} = ${homeColor.number}${homeColor.friendly ? " (friendly stack)" : ""}${homeColor.enemy ? " (Red=9 enemy flag)" : ""}.` : "",
        awayColor ? `${awayTeam} dominant ${awayColor.name} = ${awayColor.number}${awayColor.friendly ? " (friendly stack)" : ""}${awayColor.enemy ? " (Red=9 enemy flag)" : ""}.` : "",
      ].filter(Boolean).join(" "),
    });
  }

  // Override verdict when weighted layer disagrees decisively
  if (Math.abs(weightedHome.total - weightedAway.total) >= 0.8) {
    if (weightedHome.total > weightedAway.total) {
      verdict = {
        side: "home",
        label: `${homeTeam.toUpperCase()} WIN`,
        color: "GREEN",
        oneLiner: `Weighted decode ${weightedHome.total.toFixed(1)}/10 vs ${weightedAway.total.toFixed(1)}/10 — numerology-first stack backs ${homeTeam}.`,
      };
    } else {
      verdict = {
        side: "away",
        label: `${awayTeam.toUpperCase()} WIN`,
        color: "GREEN",
        oneLiner: `Weighted decode ${weightedAway.total.toFixed(1)}/10 vs ${weightedHome.total.toFixed(1)}/10 — numerology-first stack backs ${awayTeam}.`,
      };
    }
  }

  return {
    context: ctx,
    home, away, city, stadium,
    insights, overallRead, verdict,
    homeScore, awayScore,
    homeColor, awayColor,
    weighted: { home: weightedHome, away: weightedAway, confidencePct },
  };
}

// Re-export day LP helper
export { dayNumberLabel, reduceMaster };
// Re-export universalYear for external callers
export { universalYear };
