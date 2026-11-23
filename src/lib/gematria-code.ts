// ─── FULL GEMATRIA DECODING PROTOCOL ───────────────────────────────────────
// Pregame-only decode engine: date numerology, five ciphers, mandatory phrase
// set (teams, cities, stadium, managers, starters), birthday distances, record
// endpoints, series / head-to-head endpoints, classified connections, a
// declared scoring table and a hard NO PLAY standard.
// Nothing here may consume post–first-pitch information.

// ═══ 1. Ciphers ════════════════════════════════════════════════════════════
export interface CipherSet {
  ordinal: number;
  fullReduction: number;
  singleReduction: number;
  reverseOrdinal: number;
  reverseReduction: number;
}

export const CIPHER_LABELS: Array<{ key: keyof CipherSet; label: string; short: string }> = [
  { key: "ordinal",          label: "English Ordinal",   short: "ORD" },
  { key: "fullReduction",    label: "Full Reduction",    short: "FR"  },
  { key: "singleReduction",  label: "Single Reduction",  short: "SR"  },
  { key: "reverseOrdinal",   label: "Reverse Ordinal",   short: "RO"  },
  { key: "reverseReduction", label: "Reverse Reduction", short: "RR"  },
];

/** Normalization: strip accents, apostrophes, periods, hyphens; letters only. */
export const NORMALIZATION_NOTE =
  "Accents removed (NFD), apostrophes / periods / hyphens deleted, non-letters ignored, case-folded.";

const clean = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "");

const red = (n: number): number => (n < 10 ? n : red(String(n).split("").reduce((a, c) => a + +c, 0)));
/** Reduce but preserve master numbers 11 / 22 / 33. */
export const redMaster = (n: number): number =>
  n === 11 || n === 22 || n === 33 ? n : n < 10 ? n : redMaster(String(n).split("").reduce((a, c) => a + +c, 0));

export function ciphers(text: string): CipherSet {
  const letters = [...clean(text)];
  let ordinal = 0, fullReduction = 0, singleReduction = 0, reverseOrdinal = 0, reverseReduction = 0;
  for (const ch of letters) {
    const o = ch.charCodeAt(0) - 64;
    const r = 27 - o;
    ordinal += o;
    reverseOrdinal += r;
    fullReduction += red(o);
    reverseReduction += red(r);
    singleReduction += ch === "S" ? 10 : red(o);   // User's worked decode adds 9 for each S.
  }
  return { ordinal, fullReduction, singleReduction, reverseOrdinal, reverseReduction };
}

// ═══ 2. Date numerology ════════════════════════════════════════════════════
export interface DateEquation { key: string; expr: string; value: number; reduced: number }

export interface DateCode {
  y: number; m: number; d: number; yy: number;
  label: string;
  weekday: string;
  dayOfYear: number;
  daysRemainingExclusive: number;
  daysRemainingInclusive: number;
  week: number;
  yearLength: number;
  mirrorDayOfYear: number;
  mirrorDate: string;
  universalTotal: number;
  universalReduced: number;
  universalDay: string;
  equations: DateEquation[];
  numbers: NumberItem[];
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const ORDINAL_WORDS = ["","First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth","Ninth","Tenth","Eleventh","Twelfth","Thirteenth","Fourteenth","Fifteenth","Sixteenth","Seventeenth","Eighteenth","Nineteenth","Twentieth","Twenty-First","Twenty-Second","Twenty-Third","Twenty-Fourth","Twenty-Fifth","Twenty-Sixth","Twenty-Seventh","Twenty-Eighth","Twenty-Ninth","Thirtieth","Thirty-First"];

function isoWeek(y: number, m: number, d: number): number {
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - dayNum + 3);
  const firstThu = new Date(Date.UTC(dt.getUTCFullYear(), 0, 4));
  const fDayNum = (firstThu.getUTCDay() + 6) % 7;
  firstThu.setUTCDate(firstThu.getUTCDate() - fDayNum + 3);
  return 1 + Math.round((dt.getTime() - firstThu.getTime()) / (7 * 86400000));
}
const digitsSum = (n: number) => String(n).split("").reduce((a, c) => a + +c, 0);

// ═══ Number pool primitives ════════════════════════════════════════════════
export type Category = "date" | "participant" | "endpoint" | "secondary";
export type Conditional = "FIXED" | "WIN" | "LOSS" | "DECISION";
export type Side = "home" | "away" | "neutral";

export interface NumberItem {
  n: number;
  why: string;            // full explicit chain fragment
  category: Category;
  side: Side;
  conditional: Conditional;
  weight: number;
}

// ═══ Date code ═════════════════════════════════════════════════════════════
export function dateCode(y: number, m: number, d: number): DateCode {
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dayOfYear = Math.round((dt.getTime() - Date.UTC(y, 0, 1)) / 86400000) + 1;
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const yearLen = isLeap ? 366 : 365;
  const daysRemainingExclusive = yearLen - dayOfYear;
  const daysRemainingInclusive = daysRemainingExclusive + 1;
  const week = isoWeek(y, m, d);
  const mirrorDayOfYear = yearLen + 1 - dayOfYear;
  const mirror = new Date(Date.UTC(y, 0, mirrorDayOfYear));
  const mirrorDate = `${MONTHS[mirror.getUTCMonth()]} ${mirror.getUTCDate()}, ${y}`;
  const weekday = WEEKDAYS[dt.getUTCDay()];
  const cc = Math.floor(y / 100), yy = y % 100;

  const equations: DateEquation[] = [
    { key: "A", expr: `${m} + ${d} + ${cc} + ${yy}`, value: m + d + cc + yy, reduced: 0 },
    { key: "B", expr: `${m} + ${d} + ${String(y).split("").join(" + ")}`, value: m + d + digitsSum(y), reduced: 0 },
    { key: "C", expr: `${String(m).split("").join(" + ")} + ${String(d).split("").join(" + ")} + ${String(y).split("").join(" + ")}`, value: digitsSum(m) + digitsSum(d) + digitsSum(y), reduced: 0 },
    { key: "D", expr: `${m} + ${d} + ${yy}`, value: m + d + yy, reduced: 0 },
    { key: "E", expr: `${m} + ${d}`, value: m + d, reduced: 0 },
  ].map(e => ({ ...e, reduced: redMaster(e.value) }));

  const universalTotal = equations[2].value;
  const universalReduced = redMaster(universalTotal);
  const universalDay = universalTotal === universalReduced ? `${universalTotal}` : `${universalTotal} → ${universalReduced}`;

  const mk = (n: number, why: string, weight: number): NumberItem =>
    ({ n, why, category: "date", side: "neutral", conditional: "FIXED", weight });

  const numbers = [
    mk(universalTotal, `universal day total ${universalTotal}`, 3),
    mk(universalReduced, `universal day reduction ${universalReduced}`, 2),
    mk(dayOfYear, `${dayOfYear}th day of the year`, 3),
    mk(daysRemainingExclusive, `${daysRemainingExclusive} days remaining (exclusive)`, 3),
    mk(daysRemainingInclusive, `${daysRemainingInclusive} days remaining (inclusive)`, 2),
    mk(week, `ISO week ${week}`, 2),
    ...equations.map(e => mk(e.value, `date equation ${e.key}: ${e.expr} = ${e.value}`, 2)),
    ...equations.map(e => mk(e.reduced, `date equation ${e.key} reduced = ${e.reduced}`, 1)),
    mk(d, `calendar day ${d}`, 1),
    mk(m, `month ${m}`, 1),
    mk(yy, `year ${yy}`, 1),
  ].filter(x => x.n > 0);

  return {
    y, m, d, yy,
    label: `${MONTHS[m - 1]} ${d}, ${y}`,
    weekday, dayOfYear, daysRemainingExclusive, daysRemainingInclusive, week,
    yearLength: yearLen, mirrorDayOfYear, mirrorDate,
    universalTotal, universalReduced, universalDay,
    equations, numbers,
  };
}

export const writtenDate = (y: number, m: number, d: number) =>
  `${MONTHS[m - 1]} ${ORDINAL_WORDS[d] ?? d}`;

// ═══ 3. Participants ═══════════════════════════════════════════════════════
export interface PersonInput {
  common: string;
  full?: string;
  dob?: string;          // YYYY-MM-DD
  record?: string;       // season record e.g. "5-8" (pitcher) or "59-62" (manager)
  careerRecord?: string;
  homeRecord?: string;
  roadRecord?: string;
  vsOpponentRecord?: string;
  teamRecordInStarts?: string;
  era?: string;
  whip?: string;
  strikeouts?: string;
  jersey?: string | number;
}

/** Numerology of a single anniversary date (previous or upcoming birthday). */
export interface AnnivCode {
  label: string;
  date: string;          // YYYY-MM-DD
  written: string;       // "August Sixteenth"
  mdy: number;           // m + d + yyyy
  mdyy: number;          // m + d + yy
  digitSum: number;      // all digits of the full date
  reduced: number;
  dayOfYear: number;
}

export interface BirthdayMetrics {
  dob: string;
  age: number;
  daysAfterBirthday: number;      // exclusive span since previous birthday
  inclusiveDayOfAge: number;      // inclusive span
  daysUntilBirthday: number;      // exclusive span to upcoming birthday
  inclusiveUntil: number;         // inclusive span
  previous: AnnivCode;
  upcoming: AnnivCode;
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function annivCode(label: string, y: number, m: number, d: number): AnnivCode {
  const yy = y % 100;
  const date = `${y}-${pad2(m)}-${pad2(d)}`;
  const doy = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
  const digits = `${y}${pad2(m)}${pad2(d)}`.split("").reduce((a, c) => a + Number(c), 0);
  const mdy = m + d + y;
  return {
    label, date,
    written: writtenDate(y, m, d),
    mdy,
    mdyy: m + d + yy,
    digitSum: digits,
    reduced: redMaster(mdy),
    dayOfYear: doy,
  };
}

export function birthdayMetrics(dob: string, y: number, m: number, d: number): BirthdayMetrics | null {
  const parts = dob.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [by, bm, bd] = parts;
  const game = Date.UTC(y, m - 1, d);
  let age = y - by;
  const thisYear = Date.UTC(y, bm - 1, bd);
  const last = thisYear <= game ? thisYear : Date.UTC(y - 1, bm - 1, bd);
  if (thisYear > game) age -= 1;
  const next = thisYear > game ? thisYear : Date.UTC(y + 1, bm - 1, bd);
  const daysAfterBirthday = Math.round((game - last) / 86400000);
  const daysUntilBirthday = Math.round((next - game) / 86400000);
  const lastY = new Date(last).getUTCFullYear();
  const nextY = new Date(next).getUTCFullYear();
  return {
    dob, age,
    daysAfterBirthday,
    inclusiveDayOfAge: daysAfterBirthday + 1,
    daysUntilBirthday,
    inclusiveUntil: daysUntilBirthday + 1,
    previous: annivCode("Previous birthday", lastY, bm, bd),
    upcoming: annivCode("Upcoming birthday", nextY, bm, bd),
  };
}


// ═══ Record endpoints ══════════════════════════════════════════════════════
export interface RecordEndpoints {
  label: string;
  wins: number; losses: number;
  current: string;
  afterWin: string;
  afterLoss: string;
  winNumber: number;
  lossNumber: number;
}

export function parseRecord(r?: string): { wins: number; losses: number } | null {
  const m = r?.match(/(\d+)\s*[-–]\s*(\d+)/);
  return m ? { wins: +m[1], losses: +m[2] } : null;
}

export function endpoints(label: string, r?: string): RecordEndpoints | null {
  const p = parseRecord(r);
  if (!p) return null;
  return {
    label, wins: p.wins, losses: p.losses,
    current: `${p.wins}-${p.losses}`,
    afterWin: `${p.wins + 1}-${p.losses}`,
    afterLoss: `${p.wins}-${p.losses + 1}`,
    winNumber: p.wins + 1,
    lossNumber: p.losses + 1,
  };
}

// ═══ Input shape ═══════════════════════════════════════════════════════════
export interface TeamInput {
  team: string;           // "Baltimore Orioles"
  shortName?: string;
  longName?: string;
  nickname?: string;      // "Orioles"
  geographic?: string;    // "Baltimore" / "Minnesota"
  city?: string;          // franchise / host city
  state?: string;
  abbr?: string;
  league?: string;        // "American League"
  division?: string;      // "American League East"
  record?: string;        // PREGAME overall
  homeRecord?: string;
  roadRecord?: string;
  monthRecord?: string;
  last10?: string;
  streak?: string;
  manager?: PersonInput;
  starter?: PersonInput;
  moneyline?: string | number;
}

export interface ProtocolInput {
  year: number; month: number; day: number;
  localTime?: string;
  home: TeamInput;
  away: TeamInput;
  venue?: string;
  venueCity?: string;
  venueState?: string;
  seriesGame?: number;
  seriesRecord?: string;        // home team's record in current series
  seasonSeries?: string;        // home team's season series vs opponent
  allTimeSeries?: string;       // home team's all-time vs opponent
  retrievedAt?: string;
  pitchersConfirmed?: boolean;
  biasHome?: number; biasAway?: number;
}

// ═══ Phrase construction (balanced by category) ════════════════════════════
export interface PhraseRow { phrase: string; category: string; group: Side; values: CipherSet }

function teamPhrases(t: TeamInput, side: Side): PhraseRow[] {
  const nick = t.nickname ?? t.team.split(/\s+/).slice(-1)[0];
  const geo = t.geographic ?? t.team.split(/\s+/).slice(0, -1).join(" ");
  const city = t.city ?? geo;
  const rows: Array<[string, string | undefined]> = [
    ["Team short name", t.shortName ?? nick],
    ["Team long name", t.longName ?? t.team],
    ["Manager common name", t.manager?.common],
    ["Manager full name", t.manager?.full],
    ["Starting pitcher", t.starter?.common],
    ["Starting pitcher full name", t.starter?.full],
    ["League", t.league],
    ["Division", t.division],
  ];
  const seen = new Set<string>();
  return rows
    .filter(([, p]) => !!p && !seen.has(p!.toLowerCase()) && (seen.add(p!.toLowerCase()) || true))
    .map(([category, p]) => ({ phrase: p!, category, group: side, values: ciphers(p!) }));
}

function gamePhrases(i: ProtocolInput, dc: DateCode): PhraseRow[] {
  const city = i.venueCity ?? i.home.city ?? "";
  const st = i.venueState ?? i.home.state ?? "";
  const written = writtenDate(i.year, i.month, i.day);
  const rows: Array<[string, string | undefined]> = [
    ["Stadium", i.venue],
    ["Game location", city && st ? `${city} ${st}` : city || st || undefined],
  ];
  const seen = new Set<string>();
  return rows
    .filter(([, p]) => !!p && !seen.has(p!.toLowerCase()) && (seen.add(p!.toLowerCase()) || true))
    .map(([category, p]) => ({ phrase: p!, category, group: "neutral" as Side, values: ciphers(p!) }));
}

const ONES = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
function two(n: number): string {
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)], o = ONES[n % 10];
  return o ? `${t}-${o}` : t;
}
export function yearWords(y: number): string {
  const a = Math.floor(y / 100), b = y % 100;
  return b === 0 ? `${two(a)} Hundred` : `${two(a)} ${two(b)}`;
}

// ═══ Participant / endpoint number pools ═══════════════════════════════════
export interface PersonRead {
  role: "Manager" | "Starting pitcher";
  common: string;
  full?: string;
  birthday?: BirthdayMetrics;
  record?: RecordEndpoints;
  careerRecord?: RecordEndpoints;
  splits?: RecordEndpoints[];
  era?: string;
  whip?: string;
  strikeouts?: string;
}


export interface SideRead {
  team: string;
  abbr: string;
  city?: string;
  phrases: PhraseRow[];
  people: PersonRead[];
  records: RecordEndpoints[];
  connections: Connection[];
  fixedScore: number;
  winScore: number;
  lossScore: number;
  decisionScore: number;
  net: number;
  score: number;          // 0-10 display
}

export interface Connection {
  n: number;
  chain: string[];         // explicit chain lines
  classification: "FIXED" | "WIN-CONDITIONAL" | "LOSS-CONDITIONAL" | "PITCHER-DECISION-CONDITIONAL" | "NEUTRALIZED" | "SECONDARY";
  points: number;
  reason: string;          // scoring reason
  side: Side;
  parts: number;
}

export interface ProtocolResult {
  retrievedAt: string;
  date: DateCode;
  config: {
    matchup: string;
    venue: string;
    cityState: string;
    seriesGame: string;
    localTime: string;
    pitcherStatus: string;
    moneyline: string;
  };
  home: SideRead;
  away: SideRead;
  gamePhrases: PhraseRow[];
  table: PhraseRow[];
  series: Array<{ label: string; current: string; afterHomeWin: string; afterAwayWin: string }>;
  neutralized: Connection[];
  decision: "HOME" | "AWAY" | "NO PLAY";
  pickTeam: string | null;
  bettingExpression: string;
  confidence: number;
  rationale: string[];
  missing: string[];
}

const isPrime = (n: number) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
export function primeIndex(n: number): number | null {
  if (!isPrime(n)) return null;
  let c = 0;
  for (let i = 2; i <= n; i++) if (isPrime(i)) c++;
  return c;
}

function personItems(p: PersonInput | undefined, role: PersonRead["role"], side: Side, dc: DateCode): { read: PersonRead | null; items: NumberItem[] } {
  if (!p?.common) return { read: null, items: [] };
  const bd = p.dob ? birthdayMetrics(p.dob, dc.y, dc.m, dc.d) : null;
  const rec = endpoints(`${role} season record`, p.record);
  const car = endpoints(`${role} career record`, p.careerRecord);
  const items: NumberItem[] = [];
  const add = (n: number, why: string, category: Category, conditional: Conditional, weight: number) => {
    if (n > 0) items.push({ n, why, category, side, conditional, weight });
  };
  for (const { key, label } of CIPHER_LABELS) {
    add(ciphers(p.common)[key], `${p.common} = ${ciphers(p.common)[key]} ${label}`, "participant", "FIXED", 2);
    if (p.full) add(ciphers(p.full)[key], `${p.full} = ${ciphers(p.full)[key]} ${label}`, "participant", "FIXED", 2);
  }
  if (bd) {
    add(bd.age, `${p.common} is ${bd.age} years old on game day`, "participant", "FIXED", 2);
    add(bd.daysAfterBirthday, `${p.common} is ${bd.daysAfterBirthday} days after his birthday`, "participant", "FIXED", 2);
    add(bd.inclusiveDayOfAge, `${p.common} is on day ${bd.inclusiveDayOfAge} of his age (inclusive)`, "participant", "FIXED", 1);
    add(bd.daysUntilBirthday, `${p.common} is ${bd.daysUntilBirthday} days before his birthday`, "participant", "FIXED", 2);
    add(bd.inclusiveUntil, `${p.common} birthday is ${bd.inclusiveUntil} days away (inclusive)`, "participant", "FIXED", 1);
    for (const a of [bd.previous, bd.upcoming]) {
      add(a.mdy, `${p.common} ${a.label.toLowerCase()} ${a.written}, ${a.date.slice(0, 4)} = ${a.mdy} (m+d+yyyy)`, "participant", "FIXED", 1);
      add(a.mdyy, `${p.common} ${a.label.toLowerCase()} = ${a.mdyy} (m+d+yy)`, "participant", "FIXED", 1);
      add(a.digitSum, `${p.common} ${a.label.toLowerCase()} digit sum = ${a.digitSum}`, "participant", "FIXED", 1);
      add(a.dayOfYear, `${p.common} ${a.label.toLowerCase()} falls on day ${a.dayOfYear} of the year`, "participant", "FIXED", 1);
    }
  }

  if (p.jersey) add(Number(p.jersey), `${p.common} wears number ${p.jersey}`, "secondary", "FIXED", 1);
  const dec: Conditional = role === "Starting pitcher" ? "DECISION" : "WIN";
  if (rec) {
    add(rec.winNumber, `${p.common} reaches ${rec.afterWin} with a credited win`, "endpoint", dec, 2);
    add(rec.lossNumber, `${p.common} falls to ${rec.afterLoss} with a credited loss`, "endpoint", role === "Starting pitcher" ? "DECISION" : "LOSS", 2);
  }
  if (car) {
    add(car.winNumber, `${p.common} career reaches ${car.afterWin} with a win`, "endpoint", dec, 1);
    add(car.lossNumber, `${p.common} career falls to ${car.afterLoss} with a loss`, "endpoint", role === "Starting pitcher" ? "DECISION" : "LOSS", 1);
  }
  const splits: RecordEndpoints[] = [];
  const pushSplit = (label: string, r?: string) => { const e = endpoints(label, r); if (e) splits.push(e); };
  pushSplit(`${role} home record`, p.homeRecord);
  pushSplit(`${role} road record`, p.roadRecord);
  pushSplit(`${role} record vs opponent`, p.vsOpponentRecord);
  pushSplit(`Team record in his starts`, p.teamRecordInStarts);
  for (const sp of splits) {
    add(sp.winNumber, `${p.common} — ${sp.label.toLowerCase()} becomes ${sp.afterWin} with a win`, "endpoint", dec, 1);
    add(sp.lossNumber, `${p.common} — ${sp.label.toLowerCase()} becomes ${sp.afterLoss} with a loss`, "endpoint", role === "Starting pitcher" ? "DECISION" : "LOSS", 1);
  }

  return {
    read: {
      role, common: p.common, full: p.full,
      birthday: bd ?? undefined,
      record: rec ?? undefined,
      careerRecord: car ?? undefined,
      splits,
      era: p.era, whip: p.whip, strikeouts: p.strikeouts,
    },
    items,
  };
}


function teamItems(t: TeamInput, side: Side, phrases: PhraseRow[]): { items: NumberItem[]; records: RecordEndpoints[] } {
  const items: NumberItem[] = [];
  for (const row of phrases) {
    for (const { key, label } of CIPHER_LABELS) {
      const v = row.values[key];
      if (v > 3) items.push({ n: v, why: `${row.phrase} = ${v} ${label}`, category: "participant", side, conditional: "FIXED", weight: 2 });
    }
  }
  const recs: RecordEndpoints[] = [];
  const push = (label: string, r?: string) => { const e = endpoints(label, r); if (e) recs.push(e); };
  push("Overall record", t.record);
  push("Home record", t.homeRecord);
  push("Road record", t.roadRecord);
  push("Month record", t.monthRecord);
  push("Last 10", t.last10);
  for (const r of recs) {
    items.push({ n: r.winNumber, why: `${t.team} ${r.label.toLowerCase()} becomes ${r.afterWin} with a win`, category: "endpoint", side, conditional: "WIN", weight: 2 });
    items.push({ n: r.lossNumber, why: `${t.team} ${r.label.toLowerCase()} becomes ${r.afterLoss} with a loss`, category: "endpoint", side, conditional: "LOSS", weight: 2 });
  }
  return { items, records: recs };
}

// ═══ Connection builder + declared scoring ═════════════════════════════════
function buildConnections(dateItems: NumberItem[], sideItems: NumberItem[], otherItems: NumberItem[], side: Side): { conns: Connection[]; neutral: Connection[] } {
  const conns: Connection[] = [];
  const neutral: Connection[] = [];
  const byN = new Map<number, NumberItem[]>();
  for (const it of [...dateItems, ...sideItems]) {
    if (it.n < 4) continue;
    const arr = byN.get(it.n) ?? [];
    arr.push(it); byN.set(it.n, arr);
  }
  const otherN = new Set(otherItems.filter(i => i.category !== "date").map(i => i.n));

  for (const [n, items] of byN) {
    const dates = items.filter(i => i.category === "date");
    const parts = items.filter(i => i.category === "participant");
    const ends  = items.filter(i => i.category === "endpoint");
    const secs  = items.filter(i => i.category === "secondary");
    if (!dates.length) continue;
    const distinct = (dates.length ? 1 : 0) + (parts.length ? 1 : 0) + (ends.length ? 1 : 0);
    if (distinct < 2 && !secs.length) continue;

    const chain = [
      `${n} — ${dates[0].why}`,
      ...(parts.length ? [`= ${parts[0].why}`] : []),
      ...(ends.length ? [`= ${ends[0].why}`] : []),
      ...(secs.length && distinct < 3 ? [`= ${secs[0].why}`] : []),
    ];

    if (otherN.has(n)) {
      neutral.push({ n, chain: [...chain, `= same number also supports the opponent`], classification: "NEUTRALIZED", points: -1, reason: "-1 same number supports both teams", side, parts: distinct });
      continue;
    }

    let classification: Connection["classification"] = "FIXED";
    let points = 0, reason = "";
    const cond = ends[0]?.conditional;
    if (distinct >= 3) { points = 3; reason = "+3 three-part convergence (date + participant + outcome endpoint)"; }
    else if (parts.length && dates.length) { points = 2; reason = "+2 direct exact match between independent categories"; }
    else if (ends.length && dates.length) { points = 2; reason = "+2 direct exact match between independent categories"; }
    else { points = 1; reason = "+1 supporting secondary match"; classification = "SECONDARY"; }

    if (cond === "WIN") classification = "WIN-CONDITIONAL";
    else if (cond === "LOSS") classification = "LOSS-CONDITIONAL";
    else if (cond === "DECISION") { classification = "PITCHER-DECISION-CONDITIONAL"; points -= 2; reason += " · -2 requires an unguaranteed pitcher decision"; }
    else if (classification !== "SECONDARY") classification = "FIXED";

    conns.push({ n, chain, classification, points, reason, side, parts: distinct });
  }
  conns.sort((a, b) => b.points - a.points || b.parts - a.parts || b.n - a.n);
  return { conns, neutral };
}

// ═══ Main protocol ═════════════════════════════════════════════════════════
export function runProtocol(i: ProtocolInput): ProtocolResult {
  const date = dateCode(i.year, i.month, i.day);
  const gp = gamePhrases(i, date);

  const homePhrases = teamPhrases(i.home, "home");
  const awayPhrases = teamPhrases(i.away, "away");

  const homeTeamPool = teamItems(i.home, "home", homePhrases);
  const awayTeamPool = teamItems(i.away, "away", awayPhrases);

  const hMgr = personItems(i.home.manager, "Manager", "home", date);
  const hPit = personItems(i.home.starter, "Starting pitcher", "home", date);
  const aMgr = personItems(i.away.manager, "Manager", "away", date);
  const aPit = personItems(i.away.starter, "Starting pitcher", "away", date);

  // Series / head-to-head endpoints (home-team perspective).
  const series: ProtocolResult["series"] = [];
  const seriesItems: NumberItem[] = [];
  const addSeries = (label: string, rec?: string) => {
    const e = endpoints(label, rec);
    if (!e) return;
    series.push({ label, current: e.current, afterHomeWin: e.afterWin, afterAwayWin: e.afterLoss });
    seriesItems.push({ n: e.winNumber, why: `${label} becomes ${e.afterWin} with a ${i.home.team} win`, category: "endpoint", side: "home", conditional: "WIN", weight: 2 });
    seriesItems.push({ n: e.lossNumber, why: `${label} becomes ${e.afterLoss} with an ${i.away.team} win`, category: "endpoint", side: "away", conditional: "WIN", weight: 2 });
  };
  addSeries("Current series (home)", i.seriesRecord);
  addSeries("Season series (home)", i.seasonSeries);
  addSeries("All-time series (home)", i.allTimeSeries);

  const homeItems = [...homeTeamPool.items, ...hMgr.items, ...hPit.items, ...seriesItems.filter(s => s.side === "home")];
  const awayItems = [...awayTeamPool.items, ...aMgr.items, ...aPit.items, ...seriesItems.filter(s => s.side === "away")];

  const H = buildConnections(date.numbers, homeItems, awayItems, "home");
  const A = buildConnections(date.numbers, awayItems, homeItems, "away");

  const bucket = (list: Connection[]) => ({
    fixed:    list.filter(c => c.classification === "FIXED" || c.classification === "SECONDARY").reduce((s, c) => s + c.points, 0),
    win:      list.filter(c => c.classification === "WIN-CONDITIONAL").reduce((s, c) => s + c.points, 0),
    loss:     list.filter(c => c.classification === "LOSS-CONDITIONAL").reduce((s, c) => s + c.points, 0),
    decision: list.filter(c => c.classification === "PITCHER-DECISION-CONDITIONAL").reduce((s, c) => s + c.points, 0),
  });
  const hb = bucket(H.conns), ab = bucket(A.conns);
  const neutralPtsH = H.neutral.length * -1, neutralPtsA = A.neutral.length * -1;
  const hNet = hb.fixed + hb.win + hb.decision + neutralPtsH + (i.biasHome ?? 0);
  const aNet = ab.fixed + ab.win + ab.decision + neutralPtsA + (i.biasAway ?? 0);

  const mkSide = (t: TeamInput, phrases: PhraseRow[], people: PersonRead[], recs: RecordEndpoints[], b: ReturnType<typeof bucket>, conns: Connection[], net: number, neutralPts: number): SideRead => ({
    team: t.team, abbr: t.abbr ?? "", city: t.city,
    phrases, people, records: recs, connections: conns,
    fixedScore: b.fixed + neutralPts, winScore: b.win, lossScore: b.loss, decisionScore: b.decision,
    net,
    score: Math.max(0, Math.min(10, net)),
  });

  const home = mkSide(i.home, homePhrases, [hMgr.read, hPit.read].filter(Boolean) as PersonRead[], homeTeamPool.records, hb, H.conns, hNet, neutralPtsH);
  const away = mkSide(i.away, awayPhrases, [aMgr.read, aPit.read].filter(Boolean) as PersonRead[], awayTeamPool.records, ab, A.conns, aNet, neutralPtsA);

  // ── Decision standard ────────────────────────────────────────────────────
  const strong = (l: Connection[]) => l.some(c => c.parts >= 3 && c.classification !== "NEUTRALIZED" && c.points >= 3);
  const nonDecision = (l: Connection[], net: number) => net - l.filter(c => c.classification === "PITCHER-DECISION-CONDITIONAL").reduce((s, c) => s + c.points, 0) > 0;

  let decision: ProtocolResult["decision"] = "NO PLAY";
  const rationale: string[] = [];
  if (strong(H.conns) && hNet - aNet >= 3 && nonDecision(H.conns, hNet)) decision = "HOME";
  else if (strong(A.conns) && aNet - hNet >= 3 && nonDecision(A.conns, aNet)) decision = "AWAY";

  const fullStandard = decision !== "NO PLAY";

  if (!fullStandard) {
    // There is always a play: fall back to the strongest available lean.
    const rank = (l: Connection[], net: number, b: ReturnType<typeof bucket>) => [
      net,
      l.filter(c => c.parts >= 3 && c.classification !== "NEUTRALIZED").length,
      b.fixed,
      l.reduce((s, c) => s + c.points, 0),
    ];
    const rH = rank(H.conns, hNet, hb), rA = rank(A.conns, aNet, ab);
    let cmp = 0;
    for (let k = 0; k < rH.length && cmp === 0; k++) cmp = rH[k] - rA[k];
    // Final deterministic tiebreak: higher gematria weight of the team name.
    if (cmp === 0) cmp = ciphers(i.home.team).ordinal - ciphers(i.away.team).ordinal;
    decision = cmp >= 0 ? "HOME" : "AWAY";

    if (!strong(H.conns) && !strong(A.conns)) rationale.push("No three-part convergence on either side — this is a lean, not a full-standard play.");
    else if (Math.abs(hNet - aNet) < 3) rationale.push(`Net separation is only ${Math.abs(hNet - aNet)} points; below the 3-point full-standard threshold, so this is a lean.`);
    else rationale.push("Leading side leans on a pitcher-decision conditional — graded as a lean.");
    const lean = decision === "HOME" ? H.conns : A.conns;
    for (const c of lean.slice(0, 3)) rationale.push(c.chain.join(" "));
    if (lean.length === 0) rationale.push("Strongest side determined by net score, three-part chain count, then fixed-evidence weight.");
  } else {
    const win = decision === "HOME" ? H.conns : A.conns;
    for (const c of win.slice(0, 4)) rationale.push(c.chain.join(" "));
  }

  const pickTeam = decision === "HOME" ? i.home.team : i.away.team;
  const ml = decision === "HOME" ? i.home.moneyline : i.away.moneyline;
  const bettingExpression = `${pickTeam} moneyline${ml != null && String(ml).trim() !== "" ? ` at ${ml} or better` : ""} · ${fullStandard ? "1 unit" : "0.5 unit (lean)"}`;
  const confidence = Math.max(1, Math.min(10, Math.round(Math.abs(hNet - aNet)) + (fullStandard ? 2 : 0)));


  // ── Missing-data audit (protocol requires disclosure) ────────────────────
  const missing: string[] = [];
  const need = (cond: boolean, msg: string) => { if (cond) missing.push(msg); };
  need(!i.home.starter?.common || !i.away.starter?.common, "Confirmed starting pitchers");
  need(!i.home.starter?.dob || !i.away.starter?.dob, "Starting pitcher birthdays");
  need(!i.home.manager?.common || !i.away.manager?.common, "Managers");
  need(!i.home.manager?.dob || !i.away.manager?.dob, "Manager birthdays");
  need(!i.home.record || !i.away.record, "Pregame team records");
  need(!i.seriesGame, "Series game number");
  need(!i.seasonSeries, "Season head-to-head record");
  need(!i.allTimeSeries, "All-time head-to-head record");
  need(!i.home.homeRecord || !i.away.roadRecord, "Home / road splits");

  return {
    retrievedAt: i.retrievedAt ?? new Date().toISOString(),
    date,
    config: {
      matchup: `${i.away.team} at ${i.home.team}`,
      venue: i.venue ?? "TBD",
      cityState: [i.venueCity ?? i.home.city, i.venueState ?? i.home.state].filter(Boolean).join(", ") || "—",
      seriesGame: i.seriesGame ? `Game ${i.seriesGame} of the series` : "Series game number not supplied",
      localTime: i.localTime ?? "—",
      pitcherStatus: i.pitchersConfirmed ? "CONFIRMED" : "PROBABLE / UNCONFIRMED",
      moneyline: `${i.away.abbr || i.away.team} ${i.away.moneyline ?? "—"} · ${i.home.abbr || i.home.team} ${i.home.moneyline ?? "—"}`,
    },
    home, away,
    gamePhrases: gp,
    table: [...awayPhrases, ...homePhrases, ...gp],
    series,
    neutralized: [...H.neutral, ...A.neutral],
    decision, pickTeam, bettingExpression, confidence, rationale, missing,
  };
}
