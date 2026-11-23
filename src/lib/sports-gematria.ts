// Five-cipher gematria for a game.
// Ordinal, Full Reduction, Reverse Ordinal, Reverse Reduction, Single Reduction.
// Learned uses it as the lowest-priority, capped separator for lean reads.
import { gematriaDateCalculations, type DateCalculation } from "./sports-record-vibrations";
import { ciphers as allFiveCiphers } from "./gematria-code";

export interface FiveCiphers {
  ordinal: number;
  reduction: number;
  singleReduction: number;
  reverse: number;
  reverseReduction: number;
}

/** Kept as an alias for existing callers; values now include all five codes. */
export type FourCiphers = FiveCiphers;
export type CipherKind = keyof FiveCiphers;

export const CIPHER_KINDS: CipherKind[] = ["ordinal", "reduction", "reverse", "reverseReduction", "singleReduction"];

export const CIPHER_LABEL: Record<CipherKind, string> = {
  ordinal: "Ordinal",
  reduction: "Reduction",
  singleReduction: "Single Reduction",
  reverse: "Reverse",
  reverseReduction: "Reverse Reduction",
};

const lettersOf = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "");

export function digitalRoot(n: number): number {
  let x = Math.abs(Math.trunc(n));
  if (x === 0) return 0;
  while (x > 9) x = String(x).split("").reduce((a, c) => a + Number(c), 0);
  return x;
}

export function daysSinceAndUntilBirthday(
  eventDate: readonly [number, number, number],
  birthDate: readonly [number, number, number],
): { daysSince: number; daysUntil: number } {
  const [year, month, day] = eventDate;
  const [, birthMonth, birthDay] = birthDate;
  const event = Date.UTC(year, month - 1, day);
  const anniversary = (candidateYear: number) => {
    const value = new Date(Date.UTC(candidateYear, birthMonth - 1, birthDay));
    if (value.getUTCMonth() !== birthMonth - 1 || value.getUTCDate() !== birthDay) return undefined;
    return value.getTime();
  };
  let previous: number | undefined;
  let next: number | undefined;
  for (let offset = 0; offset <= 4 && (previous == null || next == null); offset++) {
    const priorCandidate = anniversary(year - offset);
    if (priorCandidate != null && priorCandidate <= event && previous == null) previous = priorCandidate;
    const nextCandidate = anniversary(year + offset);
    if (nextCandidate != null && nextCandidate >= event && next == null) next = nextCandidate;
  }
  if (previous == null || next == null) return { daysSince: 0, daysUntil: 0 };
  return {
    daysSince: Math.floor((event - previous) / 86_400_000),
    daysUntil: Math.floor((next - event) / 86_400_000),
  };
}

/** A=1…Z=26 full sum, that sum reduced, Z=1…A=26 full sum, that sum reduced. */
export function fourCiphers(text: string): FourCiphers {
  const ciphers = allFiveCiphers(text);
  return {
    ordinal: ciphers.ordinal,
    reduction: ciphers.fullReduction,
    singleReduction: ciphers.singleReduction,
    reverse: ciphers.reverseOrdinal,
    reverseReduction: ciphers.reverseReduction,
  };
}

export function cipherLine(c: FourCiphers): string {
  return CIPHER_KINDS.map((k) => `${CIPHER_LABEL[k]} ${c[k]}`).join(" / ");
}

export interface NamedCipher {
  role: string;
  name: string;
  ciphers: FourCiphers;
}

type TargetKind = "streak" | "series" | "date" | "jersey" | "score" | "season" | "split" | "prospect";

interface Target {
  direction?: 1 | -1;
  n: number;
  kind: TargetKind;
  label: string;
  derived?: boolean;
  relationLabel?: string;
}

const RANK: Record<TargetKind, number> = { prospect:5, streak: 4, series: 3, date: 2, split: 2, jersey: 1, score: 1, season: 1 };
const POINTS: Record<TargetKind, number> = { prospect:1, streak: 2, series: 2, date: 1, split: 1, jersey: 1, score: 1, season: 1 };

export interface GematriaPerson {
  role: string;
  name: string;
  dob?: string;
}

export interface GematriaSideInput {
  team: string;
  shortName?: string;
  founded?: readonly [number, number, number];
  people?: GematriaPerson[];
  /** Host city and stadium. Scored on this side only. */
  venue?: GematriaPerson[];
  winStreak?: number;
  loseStreak?: number;
  seriesWins?: number;
  h2hWins?: number;
  seasonWins?: number;
  seasonLosses?: number;
  homeRecord?: string;
  roadRecord?: string;
  jerseys?: number[];
}

export interface GematriaInput {
  /** When true, describe this as a Learned supporting signal rather than a read-only decode. */
  integrated?: boolean;
  year?: number;
  awayName: string;
  homeName: string;
  away: GematriaSideInput;
  home: GematriaSideInput;
  month: number;
  day: number;
  /** Previous meeting scores and margins. Both sides can hit these. */
  priorNumbers?: number[];
  /** Series digits we could not assign to a side. Both sides can hit these. */
  sharedSeries?: number[];
  /** Additional shared named entities; weekday and lunar-cycle names are intentionally excluded. */
  contextNames?: GematriaPerson[];
}

interface Hit {
  text: string;
  kind: CipherKind;
  n: number;
  points: number;
  targetKind: TargetKind;
}

export interface GematriaSideRead {
  team: string;
  names: NamedCipher[];
  hits: string[];
  score: number;
  streakOrH2h: boolean;
  parts: string;
}

export interface GematriaDecode {
  dateCalculations: DateCalculation[];
  title: string;
  dateLabel: string;
  away: GematriaSideRead;
  home: GematriaSideRead;
  clash: boolean;
  clashNote: string;
  edge: string;
  decision: string;
  ignored: boolean;
}

function pos(n: number | undefined): number | undefined {
  if (n == null || !Number.isFinite(n) || n <= 0) return undefined;
  return Math.trunc(n);
}

function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
    if (n % divisor === 0) return false;
  }
  return true;
}

const primeIndexCache = new Map<number, number>();
function primeIndex(n: number): number | undefined {
  if (!isPrime(n)) return undefined;
  const cached = primeIndexCache.get(n);
  if (cached) return cached;
  let count = 0;
  for (let value = 2; value <= n; value++) {
    if (isPrime(value)) count++;
  }
  primeIndexCache.set(n, count);
  return count;
}

const nthPrimeCache = new Map<number, number>();
function nthPrime(index: number): number | undefined {
  if (!Number.isInteger(index) || index < 1 || index > 366) return undefined;
  const cached = nthPrimeCache.get(index);
  if (cached) return cached;
  let count = 0;
  for (let value = 2; ; value++) {
    if (!isPrime(value)) continue;
    if (++count === index) {
      nthPrimeCache.set(index, value);
      return value;
    }
  }
}

function addTarget(list: Target[], n: number | undefined, kind: TargetKind, label: string) {
  const v = pos(n);
  if (v == null) return;
  if (list.some((t) => t.n === v && t.kind === kind && t.label === label)) return;
  list.push({ n: v, kind, label });
}

function addSplitTargets(list: Target[], label: string, value?: string) {
  const match = value?.match(/^\s*(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?/);
  if (!match) return;
  const wins = +match[1];
  const losses = +match[2];
  const extra = match[3] ? +match[3] : 0;
  addTarget(list, wins, "split", `${label} wins ${wins}`);
  addTarget(list, losses, "split", `${label} losses ${losses}`);
  addTarget(list, wins + losses + extra, "split", `${label} games ${wins + losses + extra}`);
  addTarget(list, Number(`${wins}${losses}`), "split", `${label} record ${wins}-${losses}`);
  for (const [nextWins, nextLosses, direction] of [
    [wins + 1, losses, 1],
    [wins, losses + 1, -1],
  ] as const) {
    list.push({
      n: Number(`${nextWins}${nextLosses}`),
      kind: "prospect",
      direction,
      label: `possible ${label.toLowerCase()} ${nextWins}-${nextLosses} record; ${direction > 0 ? "next win" : "next loss"} path`,
    });
  }
}

function addPrimeAliases(targets: Target[]): Target[] {
  const original = [...targets];
  const aliases: Target[] = [];
  for (const target of original) {
    if (target.derived || target.kind === "score" || target.kind === "jersey") continue;
    const rank = primeIndex(target.n);
    if (rank != null) {
      aliases.push({
        ...target,
        n: rank,
        label: `${target.n} is prime #${rank}; ${target.label}`,
        derived: true,
      });
    }
    const prime = nthPrime(target.n);
    if (prime != null) {
      aliases.push({
        ...target,
        n: prime,
        label: `${prime} is the ${target.n}th prime; ${target.label}`,
        derived: true,
      });
    }
  }
  return [...targets, ...aliases];
}

function targetsFor(
  side: GematriaSideInput,
  year: number,
  month: number,
  day: number,
  prior: number[],
  sharedSeries: number[],
  calendar: DateCalculation[],
): Target[] {
  const list: Target[] = [];
  const addBirthDateTargets = (label: string, date?: readonly [number, number, number]) => {
    if (!date) return;
    const [birthYear, birthMonth, birthDay] = date;
    addTarget(list, birthDay, "date", `${label} day ${birthDay}`);
    addTarget(list, birthMonth, "date", `${label} month ${birthMonth}`);
    addTarget(list, birthYear, "date", `${label} year ${birthYear}`);
    addTarget(list, digitalRoot(birthYear), "date", `${label} year root ${digitalRoot(birthYear)}`);
    addTarget(list, birthMonth + birthDay, "date", `${label} month + day ${birthMonth + birthDay}`);
    const birthPath = [...String(birthYear), ...String(birthMonth), ...String(birthDay)]
      .reduce((total, digit) => total + Number(digit), 0);
    addTarget(list, birthPath, "date", `${label} full-date digit sum ${birthPath}`);
    const elapsed = daysSinceAndUntilBirthday([year, month, day], date);
    const cycle = label.includes("founding") ? "anniversary" : "birthday";
    addTarget(list, elapsed.daysSince, "date", `${label} days since ${cycle} ${elapsed.daysSince}`);
    addTarget(list, elapsed.daysUntil, "date", `${label} days until ${cycle} ${elapsed.daysUntil}`);
  };
  addBirthDateTargets(`${side.team} founding`, side.founded);
  for (const person of side.people ?? []) {
    const match = person.dob?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) addBirthDateTargets(`${person.role} ${person.name}`, [+match[1], +match[2], +match[3]]);
  }
  addTarget(list, side.winStreak, "streak", `win streak ${side.winStreak}`);
  addTarget(list, side.loseStreak, "streak", `losing streak ${side.loseStreak}`);
  addTarget(list, side.seriesWins, "series", `series wins ${side.seriesWins}`);
  addTarget(list, side.h2hWins, "series", `H2H wins ${side.h2hWins}`);
  for (const n of sharedSeries) addTarget(list, n, "series", `series record ${n}`);
  const sum = month + day;
  const reduced = digitalRoot(sum);
  addTarget(list, sum, "date", `month + day ${sum}`);
  if (reduced !== sum) addTarget(list, reduced, "date", `reduced date ${reduced}`);
  for (const j of side.jerseys ?? []) addTarget(list, j, "jersey", `jersey ${j}`);
  for (const n of prior) addTarget(list, n, "score", `previous score or margin ${n}`);
  addTarget(list, side.seasonWins, "season", `season wins ${side.seasonWins}`);
  addTarget(list, side.seasonLosses, "season", `season losses ${side.seasonLosses}`);
  addSplitTargets(list, "Home", side.homeRecord);
  addSplitTargets(list, "Road", side.roadRecord);
  for(const row of calendar)addTarget(list,row.value,"date",`${row.label} ${row.value}`);
  if(side.seasonWins!=null && side.seasonLosses!=null) {
    for(const [wins,losses,direction] of [[side.seasonWins+1,side.seasonLosses,1],[side.seasonWins,side.seasonLosses+1,-1]] as const) {
      const next=direction===1 ? `${wins}th win` : `${losses}th loss`;
      for(const n of [Number(`${wins}${losses}`),direction===1 ? wins : losses])
        list.push({n,kind:"prospect",direction,label:`possible ${wins}-${losses} record (${next}); ${direction===1 ? "win" : "loss"} path, not a guaranteed result`});
    }
  }
  return addPrimeAliases(list);
}

function usableName(name: string): boolean {
  const t = name.trim();
  if (lettersOf(t).length < 2) return false;
  if (/not posted|not in feed|tbd|starter$|coach$/i.test(t)) return false;
  return true;
}

function namesOf(side: GematriaSideInput, contextNames: GematriaPerson[] = []): NamedCipher[] {
  const rows: NamedCipher[] = [];
  const excludedContextRoles = new Set(["weekday", "lunar", "lunar cycle", "lunar phase", "moon phase", "region", "state"]);
  const push = (role: string, name?: string) => {
    if (excludedContextRoles.has(role.trim().toLowerCase())) return;
    if (!name || !usableName(name)) return;
    const displayRole = role.trim().toLowerCase() === "city + region" ? "City + State" : role;
    if (rows.some((r) => r.role === displayRole && r.name === name)) return;
    rows.push({ role: displayRole, name, ciphers: fourCiphers(name) });
  };
  push("Team", side.team);
  push("Team short", side.shortName);
  const people = [...(side.people ?? [])].sort((a, b) => {
    const priority = (role: string) => {
      const value = role.toLowerCase();
      if (value === "coach" || value === "manager") return 0;
      if (/player|quarterback|pitcher|goalie|fighter|goalkeeper/.test(value)) return 1;
      if (value === "owner") return 2;
      return 3;
    };
    return priority(a.role) - priority(b.role);
  });
  for (const p of people) {
    const role = /^(quarterback|pitcher|goalie|fighter|goalkeeper|player)$/i.test(p.role)
      ? "Player"
      : /^(manager)$/i.test(p.role) ? "Coach" : p.role;
    push(role, p.name);
  }
  for (const p of side.venue ?? []) push(p.role, p.name);
  for (const p of contextNames) push(p.role, p.name);
  return rows;
}

function readSide(side: GematriaSideInput, targets: Target[], contextNames: GematriaPerson[] = []): GematriaSideRead {
  const names = namesOf(side, contextNames);
  const hits: Hit[] = [];
  for (const row of names) {
    for (const kind of CIPHER_KINDS) {
      const n = row.ciphers[kind];
      if (n <= 0) continue;
      const rank = primeIndex(n);
      const candidates = [
        { n, derived: false, label: undefined },
        ...(rank == null ? [] : [{ n: rank, derived: true, label: `${n} is prime #${rank}` }]),
      ];
      const matched = candidates.flatMap((candidate) => targets
        .filter((target) => target.n === candidate.n)
        .map((target) => ({
          ...target,
          derived: !!target.derived || candidate.derived,
          relationLabel: candidate.label,
        })));
      if (!matched.length) continue;
      const best = matched.reduce((a, b) => {
        const scoreA = RANK[a.kind] * 2 + (a.derived ? 0 : 1);
        const scoreB = RANK[b.kind] * 2 + (b.derived ? 0 : 1);
        return scoreB > scoreA ? b : a;
      });
      const prospects=matched.filter(t=>t.kind==="prospect");
      const direction=prospects.length ? prospects.reduce((sum,t)=>sum+(t.direction || 0),0) : 1;
      const why = [...new Set(matched.flatMap((target) => [target.relationLabel, target.label].filter((label): label is string => !!label)))].join(" and ");
      hits.push({
        text: `${row.role} ${CIPHER_LABEL[kind]} ${n} = ${why}`,
        kind,
        n,
        points: POINTS[best.kind] * Math.sign(direction) * (best.derived ? 0.5 : 1),
        targetKind: best.kind,
      });
    }
  }
  const nameStacks = new Map<string, string>();
  for (let first = 0; first < names.length; first++) {
    for (let second = first + 1; second < names.length; second++) {
      const a = names[first];
      const b = names[second];
      if (a.name.toLowerCase() === b.name.toLowerCase()) continue;
      for (const kindA of CIPHER_KINDS) {
        for (const kindB of CIPHER_KINDS) {
          const n = a.ciphers[kindA];
          if (n <= 0 || n !== b.ciphers[kindB]) continue;
          const key = `${a.role}:${a.name}|${b.role}:${b.name}|${n}`;
          nameStacks.set(key, `${a.role} ${CIPHER_LABEL[kindA]} ${n} matches ${b.role} ${CIPHER_LABEL[kindB]} ${n}`);
        }
      }
    }
  }
  const nameStackPoints = nameStacks.size * 0.5;
  let score = hits.reduce((a, h) => a + h.points, 0) + nameStackPoints;
  const parts: string[] = [];
  if (hits.length) parts.push(`hits +${hits.reduce((a, h) => a + h.points, 0)}`);
  if (nameStackPoints) parts.push(`cross-name/context matches +${nameStackPoints}`);
  const byNumber = new Map<number, number>();
  for (const h of hits) byNumber.set(h.n, (byNumber.get(h.n) ?? 0) + 1);
  const stacked = [...byNumber.entries()].filter(([, c]) => c > 1).map(([n]) => n);
  if (stacked.length) {
    score += 1;
    parts.push(`same-number bonus +1 (${stacked.join(", ")})`);
  }
  const reverseHits = hits.filter((h) => h.kind === "reverse" || h.kind === "reverseReduction").length;
  const forwardHits = hits.filter((h) => h.kind === "ordinal" || h.kind === "reduction").length;
  if (reverseHits > forwardHits) {
    score += 1;
    parts.push("reverse side has more hits +1");
  }
  return {
    team: side.team,
    names,
    hits: [...hits.map((h) => h.text), ...nameStacks.values()],
    score,
    streakOrH2h: hits.some((h) => h.targetKind === "streak" || h.targetKind === "series"),
    parts: parts.join(" · ") || "no hits",
  };
}

function fullSums(side: GematriaSideRead): number[] {
  const nums: number[] = [];
  for (const row of side.names) {
    if (row.ciphers.ordinal > 9) nums.push(row.ciphers.ordinal);
    if (row.ciphers.reverse > 9) nums.push(row.ciphers.reverse);
  }
  return nums;
}

export function gematriaDecode(input: GematriaInput): GematriaDecode {
  const prior = (input.priorNumbers ?? []).filter((n) => n > 0);
  const shared = (input.sharedSeries ?? []).filter((n) => n > 0);
  const currentYear = input.year;
  const calendar=currentYear != null
    ? [
        ...gematriaDateCalculations(currentYear - 1, input.month, input.day).map(row => ({ ...row, label: `${currentYear - 1} · ${row.label}` })),
        ...gematriaDateCalculations(currentYear, input.month, input.day).map(row => ({ ...row, label: `${currentYear} · ${row.label}` })),
      ]
    : [{label:"Month + day",value:input.month+input.day}];
  const contextNames = (input.contextNames ?? []).filter(
    (name) => !["weekday", "lunar", "lunar cycle", "lunar phase", "moon phase", "region", "state"].includes(name.role.trim().toLowerCase()),
  );
  const eventYear = input.year ?? 2000;
  const away = readSide(input.away, targetsFor(input.away, eventYear, input.month, input.day, prior, shared, calendar), contextNames);
  const home = readSide(input.home, targetsFor(input.home, eventYear, input.month, input.day, prior, shared, calendar), contextNames);

  const awaySums = new Set(fullSums(away));
  const clashes = fullSums(home).filter((n) => awaySums.has(n));
  const clash = clashes.length > 0;
  if (clash) {
    away.score -= 1;
    home.score -= 1;
    away.parts += " · clash -1";
    home.parts += " · clash -1";
  }

  const sum = input.month + input.day;
  const dateLabel = `Date reduced (month + day) ${input.month}+${input.day} = ${sum}${digitalRoot(sum) === sum ? "" : ` → ${digitalRoot(sum)}`}`;
  const diff = away.score - home.score;
  const ignored = clash || diff === 0;
  let edge = "Even";
  let decision = clash ? "Layer ignored — direct cipher clash." : "Layer ignored — even.";
  if (!ignored) {
    const leader = diff > 0 ? away : home;
    const name = diff > 0 ? input.awayName : input.homeName;
    edge = `${name} +${Math.abs(diff)}`;
    decision = leader.streakOrH2h
      ? `Stronger lean ${name}. A streak or series / H2H number hit.`
      : `Lean ${name}.`;
  }
  return {
    dateCalculations:calendar,
    title: `Gematria Decode – ${input.awayName} vs ${input.homeName}`,
    dateLabel,
    away,
    home,
    clash,
    clashNote: clash
      ? `Yes — full total ${[...new Set(clashes)].join(", ")} sits on both sides`
      : "No",
    edge,
    decision: `${decision} ${input.integrated
      ? "Learned Code includes this as a capped supporting vote; it cannot force a pick."
      : "Read-only in Backup SportsCode; it does not change that pick."}`,
    ignored,
  };
}
