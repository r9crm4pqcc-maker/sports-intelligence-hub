// ShemUniverse MarketCode — full trading decode engine.
// Implements the user's MarketCode framework: numerology (universal day/month/year,
// master + karmic-debt days, entity lifepath + name number), lunar phase bias,
// moon-sign sector spotlight, Chinese four pillars, Mercury retrograde + eclipse
// vetoes, and a 0-7 confluence score → LONG / SHORT / STAND ASIDE + sizing.

import {
  reduceMaster, digitSum, nameNumber, lifePath as lifePathOf,
  chineseYear, chineseMonth, chineseHour,
  moonPhase, moonSign, westernSign,
} from "./sports-decode";
import { cueDayBand, cueDayPercent, dayCompatibility, fitFace } from "@/lib/path28";
import { chineseMonthSign, chineseSign, lifePath as chartLifePath } from "@/lib/vote-decode";
import { sunSign } from "@/lib/life-studio";

// ─── Entity database ─────────────────────────────────────────────────────────
export type EntityCategory = "index" | "stock" | "etf" | "crypto" | "custom";
export interface TradingEntity {
  symbol: string;
  name: string;
  category: EntityCategory;
  anchorDate: string; // MM/DD/YYYY
  description: string;
  /** Zodiac sector this asset trades under (Part 5 sector map). */
  sector?: string; // matches Sun/Moon sign name
}

export const TRADING_ENTITIES: TradingEntity[] = [
  { symbol: "SPX",  name: "S&P 500",       category: "index",  anchorDate: "03/04/1957", description: "S&P 500 composite index", sector: "Capricorn" },
  { symbol: "NDX",  name: "Nasdaq 100",    category: "index",  anchorDate: "02/08/1971", description: "Nasdaq composite index",  sector: "Aquarius" },
  { symbol: "DJI",  name: "Dow Jones",     category: "index",  anchorDate: "05/26/1896", description: "Dow Jones Industrial",    sector: "Capricorn" },
  { symbol: "RUT",  name: "Russell 2000",  category: "index",  anchorDate: "01/01/1984", description: "Small-cap index",         sector: "Aries" },
  { symbol: "SPY",  name: "SPY ETF",       category: "etf",    anchorDate: "01/22/1993", description: "SPDR S&P 500 ETF",        sector: "Capricorn" },
  { symbol: "QQQ",  name: "QQQ ETF",       category: "etf",    anchorDate: "03/10/1999", description: "Invesco Nasdaq ETF",      sector: "Aquarius" },
  { symbol: "NVDA", name: "NVIDIA",        category: "stock",  anchorDate: "01/22/1999", description: "AI / GPU leader",         sector: "Aquarius" },
  { symbol: "TSLA", name: "Tesla",         category: "stock",  anchorDate: "06/29/2010", description: "EV & energy",             sector: "Cancer" },
  { symbol: "AAPL", name: "Apple",         category: "stock",  anchorDate: "12/12/1980", description: "Consumer electronics",    sector: "Sagittarius" },
  { symbol: "AMD",  name: "AMD",           category: "stock",  anchorDate: "09/27/1972", description: "Semiconductors",          sector: "Libra" },
  { symbol: "META", name: "Meta",          category: "stock",  anchorDate: "02/01/2012", description: "Social media",            sector: "Aquarius" },
  { symbol: "AMZN", name: "Amazon",        category: "stock",  anchorDate: "05/15/1997", description: "E-commerce & cloud",      sector: "Taurus" },
  { symbol: "GOOGL",name: "Alphabet",      category: "stock",  anchorDate: "08/19/2004", description: "Search & cloud",          sector: "Leo" },
  { symbol: "MSFT", name: "Microsoft",     category: "stock",  anchorDate: "03/13/1986", description: "Software & cloud",        sector: "Pisces" },
  { symbol: "COIN", name: "Coinbase",      category: "stock",  anchorDate: "04/14/2021", description: "Crypto exchange",         sector: "Aries" },
  { symbol: "MSTR", name: "MicroStrategy", category: "stock",  anchorDate: "06/11/1998", description: "BTC treasury",            sector: "Gemini" },
  { symbol: "PLTR", name: "Palantir",      category: "stock",  anchorDate: "09/30/2020", description: "AI / data",               sector: "Libra" },
  { symbol: "SMCI", name: "Super Micro",   category: "stock",  anchorDate: "03/29/2007", description: "AI server hardware",      sector: "Aries" },
  { symbol: "BTC",  name: "Bitcoin",       category: "crypto", anchorDate: "01/03/2009", description: "Bitcoin genesis",         sector: "Capricorn" },
  { symbol: "ETH",  name: "Ethereum",      category: "crypto", anchorDate: "07/30/2015", description: "Ethereum mainnet",        sector: "Leo" },
];

// ─── Ephemeris tables (hard-coded 2024-2027) ─────────────────────────────────
// Mercury retrograde windows (UTC) — from NASA / published astronomy tables.
const MERCURY_RETRO: [string, string][] = [
  ["2024-04-01","2024-04-25"],
  ["2024-08-05","2024-08-28"],
  ["2024-11-25","2024-12-15"],
  ["2025-03-15","2025-04-07"],
  ["2025-07-18","2025-08-11"],
  ["2025-11-09","2025-11-29"],
  ["2026-02-26","2026-03-20"],
  ["2026-06-29","2026-07-23"],
  ["2026-10-24","2026-11-13"],
  ["2027-02-09","2027-03-03"],
  ["2027-06-10","2027-07-04"],
  ["2027-10-07","2027-10-28"],
];
// Solar + lunar eclipses (approx dates, UTC) 2024-2027
const ECLIPSES: string[] = [
  "2024-03-25","2024-04-08","2024-09-18","2024-10-02",
  "2025-03-14","2025-03-29","2025-09-07","2025-09-21",
  "2026-02-17","2026-03-03","2026-08-12","2026-08-28",
  "2027-02-06","2027-02-20","2027-07-18","2027-08-02","2027-08-17",
];

function inWindow(dateISO: string, windows: [string,string][]): boolean {
  const d = dateISO.slice(0,10);
  return windows.some(([a,b]) => a <= d && d <= b);
}
function inList(dateISO: string, list: string[]): boolean {
  return list.includes(dateISO.slice(0,10));
}

// ─── Sector map (Part 5) ────────────────────────────────────────────────────
export const SECTOR_MAP: Record<string,string> = {
  Aquarius:"Tech / AI / software / semis",
  Pisces:"Biotech / pharma / speculative growth",
  Aries:"Momentum / startups / high beta",
  Taurus:"Banking / assets / commodities / real estate",
  Gemini:"Communications / media / telecom",
  Cancer:"Consumer / housing / food",
  Leo:"Entertainment / luxury / branding",
  Virgo:"Healthcare / precision / analytics",
  Libra:"Retail / fashion / consumer balance",
  Scorpio:"Energy / oil / hidden value",
  Sagittarius:"Travel / expansion / global",
  Capricorn:"Institutions / industrials / legacy",
};

// ─── Lunar phase → direction bias (Part 2.1) ────────────────────────────────
const LUNAR_DIR: Record<string,"LONG"|"SHORT"|"NEUTRAL"> = {
  "New Moon":"LONG","Waxing Crescent":"LONG","First Quarter":"LONG",
  "Waxing Gibbous":"LONG",
  "Full Moon":"SHORT","Waning Gibbous":"SHORT","Last Quarter":"SHORT",
  "Waning Crescent":"NEUTRAL",
};

// ─── Chinese element cycle ──────────────────────────────────────────────────
const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
function stemElement(year: number): string {
  const i = (((year - 4) % 10) + 10) % 10;
  return STEM_ELEMENTS[i];
}
// Generating: Wood→Fire→Earth→Metal→Water→Wood
const GENERATES: Record<string,string> = { Wood:"Fire", Fire:"Earth", Earth:"Metal", Metal:"Water", Water:"Wood" };
// Controlling: Wood→Earth→Water→Fire→Metal→Wood
const CONTROLS: Record<string,string> = { Wood:"Earth", Earth:"Water", Water:"Fire", Fire:"Metal", Metal:"Wood" };

// ─── Universal Day / Month / Year ───────────────────────────────────────────
function uniYear(year: number): number { return reduceMaster(digitSum(year)); }
function uniMonth(year: number, month: number): number { return reduceMaster(uniYear(year) + reduceMaster(month)); }
function uniDayRaw(y: number, m: number, d: number): number {
  return `${String(m).padStart(2,"0")}${String(d).padStart(2,"0")}${y}`
    .split("").reduce((a,c)=>a+Number(c),0);
}
export function universalDay(y: number, m: number, d: number): { raw: number; reduced: number; master: 11|22|33|null; karmic: boolean } {
  const raw = uniDayRaw(y,m,d);
  const reduced = reduceMaster(raw);
  const master = reduced === 11 || reduced === 22 || reduced === 33 ? reduced as 11|22|33 : null;
  const karmic = raw === 13 || raw === 14 || raw === 16 || raw === 19;
  return { raw, reduced, master, karmic };
}

// ─── Universal Day mood table ───────────────────────────────────────────────
const DAY_MOOD: Record<number, { name: string; character: string; bias: "LONG"|"SHORT"|"NEUTRAL" }> = {
  1:  { name:"Initiation", character:"Breakouts / buyers lead",              bias:"LONG" },
  2:  { name:"Balance",    character:"Range-bound / quiet reversals",         bias:"NEUTRAL" },
  3:  { name:"Expansion",  character:"Loud hype pops / scattered",            bias:"LONG" },
  4:  { name:"Structure",  character:"Slow grind / support holds",            bias:"LONG" },
  5:  { name:"Change",     character:"Whipsaw / news-driven",                 bias:"NEUTRAL" },
  6:  { name:"Harmony",    character:"Recovery / dip-buying",                 bias:"LONG" },
  7:  { name:"Analysis",   character:"Pullbacks / traps / low volume",        bias:"SHORT" },
  8:  { name:"Power",      character:"Institutional flow / directional",      bias:"LONG" },
  9:  { name:"Completion", character:"Tops/bottoms / exhaustion",             bias:"SHORT" },
  11: { name:"Live Wire",  character:"Sudden swings / emotional spikes",      bias:"NEUTRAL" },
  22: { name:"Master Builder", character:"Major level breaks on size",        bias:"LONG" },
  33: { name:"Master Teacher", character:"Crowd blow-offs / big reversals",   bias:"SHORT" },
};

// ─── Confluence checks ──────────────────────────────────────────────────────
export interface ConfluenceCheck {
  label: string;
  passed: boolean;
  note: string;
}

// ─── Trade timing windows (from your original table) ────────────────────────
const WINDOWS: Record<number, { entry: string; exit: string; cautions: string[] }> = {
  1: { entry:"9:30–10:15 AM ET",    exit:"2:00–3:00 PM ET", cautions:["Avoid last hour"] },
  2: { entry:"10:00–10:45 AM ET",   exit:"1:00–2:00 PM ET", cautions:["Chop mid-session"] },
  3: { entry:"9:45–10:30 AM ET",    exit:"3:00–4:00 PM ET", cautions:["Fade the pop"] },
  4: { entry:"10:30–11:30 AM ET",   exit:"2:30–3:30 PM ET", cautions:["Lunch drift"] },
  5: { entry:"9:30–10:00 AM ET",    exit:"11:30 AM–12:30 PM", cautions:["Wide stops mandatory"] },
  6: { entry:"11:00 AM–12:00 PM",   exit:"2:00–3:00 PM ET", cautions:["Slow tape"] },
  7: { entry:"9:30–10:15 AM ET",    exit:"1:30–2:30 PM ET", cautions:["Fade extremes, don't chase"] },
  8: { entry:"9:30–10:00 AM ET",    exit:"3:30–4:00 PM ET", cautions:["High volume = real moves"] },
  9: { entry:"10:00–11:00 AM ET",   exit:"3:00–4:00 PM ET", cautions:["Reversal risk near close"] },
  11:{ entry:"9:30–9:45 AM ET",     exit:"Trail — volatile", cautions:["Emotional whipsaw"] },
  22:{ entry:"10:00–11:00 AM ET",   exit:"Hold trend",       cautions:["Size up on confirmation"] },
  33:{ entry:"Stand aside AM",      exit:"Fade the blow-off PM", cautions:["Crowd euphoria — reverse"] },
};

// ─── Main reading ───────────────────────────────────────────────────────────
export interface MarketCodeReading {
  date: string;                 // YYYY-MM-DD
  entity: TradingEntity;

  // 1. Numerology
  universalYear: number;
  universalMonth: number;
  universalDay: number;
  universalDayRaw: number;
  masterDay: 11|22|33|null;
  karmicDay: boolean;
  dayMood: string;
  dayCharacter: string;

  // Entity signature
  entityLifepath: number;
  entityNameNumber: number;
  resonance: boolean;           // day # = lifepath or name #

  // 2. Lunar
  lunarPhase: string;
  lunarBias: "LONG"|"SHORT"|"NEUTRAL";
  moonSign: string;
  sunSign: string;
  sectorSpotlight: string;
  sectorMatch: boolean;

  // 3. Chinese pillars
  chinesePillars: { year: string; month: string; hour: string };
  entityElement: string;         // element of entity founding year
  dayElement: string;            // element of day (Universal Day mapped to year-stem element)
  elementSupport: "generates"|"controls"|"same"|"neutral";

  // Vetoes
  mercuryRetro: boolean;
  eclipseWindow: boolean;

  // Direction + confluence
  candidateDirection: "LONG"|"SHORT"|"STAND ASIDE";
  checks: ConfluenceCheck[];
  score: number;                 // 0..7
  cuePercent: number;
  cueBand: string;
  callPct: number;
  call: "UP" | "DOWN" | "FLAT";
  callNote: string;
  vetoes: string[];
  action: "NO TRADE"|"HALF SIZE"|"FULL SIZE";

  // Timing
  entryWindow: string;
  exitWindow: string;
  cautionZones: string[];

  breakdown: string;
}

export function calcMarketCode(
  entity: TradingEntity,
  month: number, day: number, year: number,
): MarketCodeReading {
  const dateISO = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const dateStr = dateISO;

  // Numerology
  const uy = uniYear(year);
  const um = uniMonth(year, month);
  const ud = universalDay(year, month, day);
  const mood = DAY_MOOD[ud.reduced] ?? DAY_MOOD[9];

  // Entity signature
  const [am, ad, ay] = entity.anchorDate.split("/").map(Number);
  const lp = lifePathOf(ay, am, ad).reduced;
  const nn = nameNumber(entity.name).reduced;
  const resonance = ud.reduced === lp || ud.reduced === nn;

  // Lunar
  const mp = moonPhase(year, month, day);
  const lunarDir = LUNAR_DIR[mp.phase];
  const ms = moonSign(year, month, day);
  const ss = westernSign(month, day).sign;
  const spotlight = SECTOR_MAP[ms] ?? "—";
  const sectorMatch = !!entity.sector && (ms === entity.sector || ss === entity.sector);

  // Chinese pillars — use noon UTC as scoring anchor
  const noonISO = new Date(Date.UTC(year, month-1, day, 12)).toISOString();
  const pillars = {
    year: chineseYear(year, month, day),
    month: chineseMonth(month, day),
    hour: chineseHour(new Date(noonISO).getUTCHours()),
  };
  const entityElement = stemElement(ay);
  const dayElement = stemElement(year);
  let elementSupport: MarketCodeReading["elementSupport"] = "neutral";
  if (entityElement === dayElement) elementSupport = "same";
  else if (GENERATES[dayElement] === entityElement) elementSupport = "generates";
  else if (CONTROLS[dayElement] === entityElement) elementSupport = "controls";

  // Vetoes
  const mercuryRetro = inWindow(dateISO, MERCURY_RETRO);
  const eclipseWindow = inList(dateISO, ECLIPSES);

  // Direction — must agree lunar + universal day
  let candidateDirection: MarketCodeReading["candidateDirection"] = "STAND ASIDE";
  if (lunarDir !== "NEUTRAL" && mood.bias !== "NEUTRAL" && lunarDir === mood.bias) {
    candidateDirection = lunarDir;
  } else if (lunarDir === mood.bias && lunarDir !== "NEUTRAL") {
    candidateDirection = lunarDir;
  }

  // Confluence checks (7 total)
  const checks: ConfluenceCheck[] = [];
  checks.push({
    label: "Lunar phase agrees",
    passed: candidateDirection !== "STAND ASIDE" && lunarDir === candidateDirection,
    note: `${mp.phase} → ${lunarDir}`,
  });
  checks.push({
    label: "Universal Day # agrees",
    passed: candidateDirection !== "STAND ASIDE" && mood.bias === candidateDirection,
    note: `#${ud.reduced} ${mood.name} → ${mood.bias}`,
  });
  checks.push({
    label: "Sector match (Sun/Moon ↔ entity)",
    passed: sectorMatch,
    note: entity.sector ? `entity=${entity.sector} · moon=${ms} · sun=${ss}` : "no sector on entity",
  });
  checks.push({
    label: "Resonance (Day # = LP or Name #)",
    passed: resonance,
    note: `LP ${lp} · Name # ${nn} · Day ${ud.reduced}`,
  });
  checks.push({
    label: "Planetary aspect agrees",
    passed: false,
    note: "manual ephemeris check — v1 defaults to false",
  });
  const seasonalTurns = ["03-20","06-21","09-22","12-21"];
  const md = dateISO.slice(5);
  const gann = seasonalTurns.some(t => Math.abs(new Date(`${year}-${t}`).getTime() - new Date(dateISO).getTime()) <= 86400000);
  checks.push({
    label: "Gann anniversary / cardinal ±1d",
    passed: gann,
    note: gann ? `near seasonal cardinal ${md}` : "no seasonal turn nearby",
  });
  checks.push({
    label: "Chinese pillar supports entity",
    passed: elementSupport === "generates" || elementSupport === "same",
    note: `day ${dayElement} ${elementSupport} entity ${entityElement}`,
  });

  let score = checks.filter(c => c.passed).length;
  const cuePercent = cueDayPercent(year, month, day);
  const cueBand = cueDayBand(cuePercent);
  const born = chartLifePath(ay, am, ad);
  const face = fitFace(born.compound, born.reduced);
  const fit = dayCompatibility({
    lifeCompound: born.compound,
    lifeReduced: born.reduced,
    universalReduced: ud.reduced,
    universalCompound: ud.raw,
    dayReduced: ((day - 1) % 9) + 1,
    dayCompound: day,
    combinedReduced: ((day - 1) % 9) + 1,
    combinedCompound: ud.reduced,
    yearAnimal: chineseSign(ay),
    monthAnimal: chineseMonthSign(month, day),
    sun: sunSign(am, ad),
    daySun: sunSign(month, day),
  });
  const dayLayer = fit.numbers.find((n) => n.name === "Day");
  const layer = (pct: number | null, rel?: string) => pct ?? (rel === "enemy" ? 10 : rel === "friend" ? 80 : 60);
  const callPct = Math.round((layer(dayLayer?.pct ?? null, dayLayer?.rel) + fit.month + fit.sky) / 3);
  const weak = dayLayer?.rel === "enemy" || fit.month <= 10 || fit.sky <= 10;
  const call: MarketCodeReading["call"] = weak || callPct <= 40 ? "DOWN" : callPct >= 63 ? "UP" : "FLAT";
  const callNote = `${entity.symbol} ${face} vs day ${dayLayer?.other ?? "—"} ${dayLayer?.rel ?? "neutral"}. ${chineseSign(ay)} with ${chineseMonthSign(month, day)} month ${fit.month}%, sun ${fit.sky}%.`;

  // Vetoes
  const vetoes: string[] = [];
  if (eclipseWindow) vetoes.push("Eclipse day — stand aside");
  if (ud.karmic) vetoes.push(`Karmic-debt raw total ${ud.raw}`);
  if (mercuryRetro && score < 5) vetoes.push("Mercury retrograde + score < 5");

  // Trade rule
  let action: MarketCodeReading["action"] = "NO TRADE";
  if (vetoes.length === 0 && candidateDirection !== "STAND ASIDE") {
    if (score >= 5) action = "FULL SIZE";
    else if (score >= 3) action = "HALF SIZE";
  }

  const win = WINDOWS[ud.reduced] ?? WINDOWS[9];

  const breakdown =
    `Date ${dateStr}\n` +
    `Universal: Y${uy}·M${um}·D${ud.reduced} (raw ${ud.raw}${ud.master?` · MASTER ${ud.master}`:""}${ud.karmic?` · KARMIC`:""})\n` +
    `Day mood: ${mood.name} — ${mood.character} → ${mood.bias}\n` +
    `Entity ${entity.symbol}: LP ${lp} · Name # ${nn} · ${entityElement} year${resonance?" · RESONANCE":""}\n` +
    `Lunar: ${mp.phase} → ${lunarDir} · moon ${ms} · sun ${ss}\n` +
    `Sector spotlight: ${spotlight}${sectorMatch?" · MATCH ✓":""}\n` +
    `Chinese pillars: Y-${pillars.year} · M-${pillars.month} · H-${pillars.hour}\n` +
    `Element: day ${dayElement} ${elementSupport} entity ${entityElement}\n` +
    `Mercury retro: ${mercuryRetro} · Eclipse: ${eclipseWindow}\n` +
    `Direction: ${candidateDirection} · ${entity.symbol} today ${callPct}% ${call} · Your day ${cuePercent}% (${cueBand}) · Score: ${score}/7 · Vetoes: ${vetoes.length?vetoes.join("; "):"none"} → ${action}`;

  return {
    date: dateStr, entity,
    universalYear: uy, universalMonth: um, universalDay: ud.reduced, universalDayRaw: ud.raw,
    masterDay: ud.master, karmicDay: ud.karmic,
    dayMood: mood.name, dayCharacter: mood.character,
    entityLifepath: lp, entityNameNumber: nn, resonance,
    lunarPhase: mp.phase, lunarBias: lunarDir,
    moonSign: ms, sunSign: ss, sectorSpotlight: spotlight, sectorMatch,
    chinesePillars: pillars,
    entityElement, dayElement, elementSupport,
    mercuryRetro, eclipseWindow,
    candidateDirection, checks, score, cuePercent, cueBand, callPct, call, callNote, vetoes, action,
    entryWindow: win.entry, exitWindow: win.exit, cautionZones: win.cautions,
    breakdown,
  };
}

// ─── Weekly ─────────────────────────────────────────────────────────────────
export function calcWeek(entity: TradingEntity, startDate: Date): MarketCodeReading[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return calcMarketCode(entity, d.getMonth()+1, d.getDate(), d.getFullYear());
  });
}

/** Your Reports day percent, highest first. This is you, not the ticker. */
export function bestDaysForYou(from = new Date(), span = 40, take = 8) {
  const hits: { y: number; m: number; d: number; pct: number; band: string }[] = [];
  for (let i = 0; i < span; i++) {
    const dt = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const d = dt.getDate();
    const pct = cueDayPercent(y, m, d);
    hits.push({ y, m, d, pct, band: cueDayBand(pct) });
  }
  return hits.sort((a, b) => b.pct - a.pct || a.m - b.m || a.d - b.d).slice(0, take);
}

// ─── Back-compat aliases (old UI names) ─────────────────────────────────────
export const calcBattlefield = calcMarketCode;
export const calcWeekBattlefield = calcWeek;
export type BattlefieldResult = MarketCodeReading;
