// Auto-learning: records past picks + outcomes and biases future scores.
// The history file is the saved study. This device adds games after that file.

import history from "@/lib/sports-history.json";
import { readForwardArchive } from "./sports-forward";

/** Bump this when the learned code changes. The old study is dropped. Past and future both use the new code. */
export const LEARNED_CODE = "2026-11-14-calibrated-complete-decode";

const KEY = "shem-sports-learning-v1";

interface PickRecord {
  date: string;
  home: string;
  away: string;
  pick: "home" | "away" | "draw";
  actual?: "home" | "away" | "draw";
  homeScore: number;
  awayScore: number;
}

interface Store {
  records: PickRecord[];
  bias: Record<string, number>;
}

function read(): Store {
  if (typeof window === "undefined") return { records: [], bias: {} };
  try { return JSON.parse(localStorage.getItem(KEY) || "") as Store; } catch { return { records: [], bias: {} }; }
}
function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}
function clamp(n: number) { return Math.max(-1, Math.min(1, n)); }

export function recordPick(p: Omit<PickRecord, "actual">) {
  const s = read();
  if (s.records.some(r => r.date === p.date && r.home === p.home && r.away === p.away)) return;
  s.records.push(p);
  write(s);
}

export function recordOutcome(date: string, home: string, away: string, actual: "home" | "away" | "draw") {
  const s = read();
  const r = s.records.find(r => r.date === date && r.home === home && r.away === away);
  if (!r || r.actual) return;
  if (r) r.actual = actual;
  if (r && r.pick !== actual) {
    const wrong = r.pick === "home" ? home : r.pick === "away" ? away : null;
    const right = actual === "home" ? home : actual === "away" ? away : null;
    if (right) s.bias[right] = clamp((s.bias[right] ?? 0) + 0.15);
    if (wrong) s.bias[wrong] = clamp((s.bias[wrong] ?? 0) - 0.10);
  } else if (r && r.pick === actual) {
    const t = actual === "home" ? home : actual === "away" ? away : null;
    if (t) s.bias[t] = clamp((s.bias[t] ?? 0) + 0.03);
  }
  write(s);
}

export function getBias(team: string): number { return read().bias[team] ?? 0; }

export function accuracy(): { picks: number; hits: number; pct: number } {
  const s = read();
  const scored = s.records.filter(r => r.actual);
  const hits = scored.filter(r => r.pick === r.actual).length;
  return { picks: scored.length, hits, pct: scored.length ? Math.round(100 * hits / scored.length) : 0 };
}

export function resetLearning() { write({ records: [], bias: {} }); }

const LOG_KEY = "shem-sports-steplog-v1";
export const LEARNING_UPDATED_EVENT = "shem-sports-learning-updated";
export interface StepVote { side: "home" | "away"; layer: string; weight: number }
export interface StepLogEntry { id: string; date: string; home: string; away: string; pick: "home" | "away"; confidence?: number; margin?: number; noBet?: boolean; votes: StepVote[]; actual?: "home" | "away" | "draw" }
export type GameOutcome = "home" | "away" | "draw";

export function outcomeFromScore(homeScore: number, awayScore: number): GameOutcome | null {
  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return null;
  if (homeScore === awayScore) return "draw";
  return homeScore > awayScore ? "home" : "away";
}

function readLog(): StepLogEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); } catch { return []; }
}
function writeLog(l: StepLogEntry[]) { if (typeof window !== "undefined") localStorage.setItem(LOG_KEY, JSON.stringify(l)); }
export function stepLogCount() { return readLog().length; }
export function downloadStepLog() {
  if (typeof window === "undefined") return;
  const payload = {
    kind: "Legacy entries lack pre-kickoff provenance; excluded from forward accuracy",
    learnedCode: LEARNED_CODE,
    exportedAt: new Date().toISOString(),
    entries: readLog(),
    forward: readForwardArchive(),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "sports-pick-log.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function logStepPick(e: Omit<StepLogEntry, "actual">) {
  const l = readLog(); const ex = l.find(x => x.id === e.id);
  if (ex) return;
  l.push(e);
  writeLog(l);
}
export function scoreStepPick(id: string, actual: "home" | "away" | "draw") {
  const l = readLog(); const ex = l.find(x => x.id === id);
  if (ex && !ex.actual) {
    ex.actual = actual;
    writeLog(l);
    if (actual !== "draw") {
      learnLayers(ex.votes, actual);
      noteStudyGame(id, ex.votes, actual, ex.pick);
      window.dispatchEvent(new Event(LEARNING_UPDATED_EVENT));
    }
  }
}

const WEIGHT_KEY = "shem-sports-layer-weight-v1";
const WEIGHT_SEED = "shem-sports-layer-weight-seed-v1";
function readWeights(): Record<string, number> {
  if (typeof window === "undefined") return {};
  seedWeights();
  try { return JSON.parse(localStorage.getItem(WEIGHT_KEY) || "{}") as Record<string, number>; } catch { return {}; }
}
function writeWeights(w: Record<string, number>) {
  if (typeof window !== "undefined") localStorage.setItem(WEIGHT_KEY, JSON.stringify(w));
}
function seedWeights() {
  if (typeof window === "undefined" || localStorage.getItem(WEIGHT_SEED)) return;
  const w: Record<string, number> = {};
  for (const e of readLog()) {
    if (!e.actual || e.actual === "draw") continue;
    applyLayerMove(w, e.votes, e.actual);
  }
  writeWeights(w);
  localStorage.setItem(WEIGHT_SEED, "1");
}
function applyLayerMove(w: Record<string, number>, votes: StepVote[], actual: "home" | "away") {
  for (const layer of new Set(votes.map(v => v.layer))) {
    const side = { home: 0, away: 0 };
    votes.filter(v => v.layer === layer).forEach(v => { side[v.side] += v.weight; });
    if (side.home === side.away) continue;
    const leaned = side.home > side.away ? "home" : "away";
    const cur = w[layer] ?? 1;
    const next = leaned === actual ? cur + 0.06 : cur - 0.08;
    w[layer] = Math.max(0.35, Math.min(2.2, Math.round(next * 100) / 100));
  }
}

const MODE_KEY = "shem-sports-code-mode";
export type SportsMode = "learned" | "backup";
let forceOriginal = 0;
export function sportsMode(): SportsMode {
  if (typeof window === "undefined") return "learned";
  const saved = localStorage.getItem(MODE_KEY);
  if (saved === "original") {
    localStorage.setItem(MODE_KEY, "backup");
    return "backup";
  }
  return saved === "backup" ? "backup" : "learned";
}
export function setSportsMode(mode: SportsMode) {
  if (typeof window !== "undefined") localStorage.setItem(MODE_KEY, mode);
}
export function learningActive() {
  return forceOriginal === 0;
}
export function runOriginal<T>(fn: () => T): T {
  forceOriginal++;
  try { return fn(); } finally { forceOriginal--; }
}

const STUDY_KEY = `shem-sports-study-${LEARNED_CODE}-v1`;
export interface StudyLayer { hits: number; total: number }
export interface StudyState {
  y: number; m: number; d: number;
  games: number; hits: number;
  layers: Record<string, StudyLayer>;
  ids: string[];
  moved?: boolean;
  code?: string;
}
function emptyStudy(): StudyState {
  return { y: 1920, m: 1, d: 1, games: 0, hits: 0, layers: {}, ids: [], code: LEARNED_CODE };
}
export function readStudy(): StudyState {
  if (typeof window === "undefined") return emptyStudy();
  try {
    const raw = JSON.parse(localStorage.getItem(STUDY_KEY) || "") as StudyState;
    if (raw.code !== LEARNED_CODE) return emptyStudy();
    return { ...emptyStudy(), ...raw, layers: raw.layers ?? {}, ids: raw.ids ?? [], code: LEARNED_CODE };
  } catch { return emptyStudy(); }
}
function writeStudy(s: StudyState) {
  if (typeof window === "undefined") return;
  s.code = LEARNED_CODE;
  s.ids = s.ids.slice(-4000);
  localStorage.setItem(STUDY_KEY, JSON.stringify(s));
}
function addMonth(y: number, m: number) {
  return m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
}
export function savedHistory() {
  const live = readStudy();
  const file = history as typeof history & { code?: string };
  const fileCurrent = file.code === LEARNED_CODE;
  const layers: Record<string, StudyLayer> = {};
  const add = (name: string, row: StudyLayer) => {
    const cur = layers[name] ?? { hits: 0, total: 0 };
    cur.hits += row.hits;
    cur.total += row.total;
    layers[name] = cur;
  };
  if (fileCurrent) {
    for (const [k, v] of Object.entries(file.layers ?? {}) as [string, StudyLayer][]) add(k, v);
  }
  for (const [k, v] of Object.entries(live.layers)) add(k, v);
  const [ty, tm] = file.through as [number, number];
  const seedNext = addMonth(ty, tm);
  const liveKey = live.moved ? live.y * 12 + live.m : 0;
  const seedKey = seedNext.y * 12 + seedNext.m;
  const cursor = !live.moved || liveKey < seedKey ? seedNext : { y: live.y, m: live.m };
  const games = (fileCurrent ? file.games || 0 : 0) + live.games;
  const hits = (fileCurrent ? file.hits || 0 : 0) + live.hits;
  return {
    games,
    hits,
    layers,
    through: file.through as [number, number],
    cursor,
    pct: games ? Math.round((1000 * hits) / games) / 10 : 0,
    current: fileCurrent,
    code: LEARNED_CODE,
  };
}
export function studyHitRate(): number { return savedHistory().pct; }
export function noteStudyGame(id: string, votes: StepVote[], actual: "home" | "away", picked?: "home" | "away"): boolean {
  const s = readStudy();
  if (s.ids.includes(id)) return false;
  s.ids.push(id);
  s.games++;
  if (picked && picked === actual) s.hits++;
  for (const layer of new Set(votes.map(v => v.layer))) {
    const side = { home: 0, away: 0 };
    votes.filter(v => v.layer === layer).forEach(v => { side[v.side] += v.weight; });
    if (side.home === side.away) continue;
    const leaned = side.home > side.away ? "home" : "away";
    const row = (s.layers[layer] ??= { hits: 0, total: 0 });
    row.total++;
    if (leaned === actual) row.hits++;
  }
  writeStudy(s);
  return true;
}
export function setStudyCursor(y: number, m: number, d: number) {
  const s = readStudy();
  s.y = y; s.m = m; s.d = d; s.moved = true;
  writeStudy(s);
}

/** Once a layer has enough current-code outcomes, weaken it below 54.5% accuracy. */
export function layerMultiplier(layer: string): number {
  if (!learningActive()) return 1;
  const row = savedHistory().layers[layer];
  let hits = row?.hits ?? 0;
  let total = row?.total ?? 0;
  if (total < 8) {
    hits = 0; total = 0;
    for (const e of readLog()) {
      if (!e.actual || e.actual === "draw") continue;
      const side = { home: 0, away: 0 };
      e.votes.filter(v => v.layer === layer).forEach(v => { side[v.side] += v.weight; });
      if (side.home === side.away) continue;
      total++;
      if ((side.home > side.away ? "home" : "away") === e.actual) hits++;
    }
  }
  // Insufficient evidence should leave a factor at baseline, not erase its votes.
  // Keeping it active also lets newly collected outcomes train the layer weight.
  if (total < 30) return 1;
  const rate = hits / total;
  if (rate < 0.545) return 0;
  return Math.max(0.5, Math.min(3, Math.round(((rate - 0.5) / 0.09) * 100) / 100));
}
export function layerWeights(): Record<string, number> { return readWeights(); }

function learnLayers(votes: StepVote[], actual: "home" | "away") {
  const first = typeof window !== "undefined" && !localStorage.getItem(WEIGHT_SEED);
  const w = readWeights();
  if (first) return;
  applyLayerMove(w, votes, actual);
  writeWeights(w);
}

export function stepHitRates() {
  const scored = readLog().filter(e => e.actual && e.actual !== "draw");
  const steps: Record<string, { hits: number; total: number }> = {};
  for (const e of scored) for (const layer of new Set(e.votes.map(v => v.layer))) {
    const w = { home: 0, away: 0 };
    e.votes.filter(v => v.layer === layer).forEach(v => (w[v.side] += v.weight));
    if (w.home === w.away) continue;
    const s = (steps[layer] ??= { hits: 0, total: 0 });
    s.total++; if ((w.home > w.away ? "home" : "away") === e.actual) s.hits++;
  }
  const hits = scored.filter(e => e.pick === e.actual).length;
  const bands: Record<string, { hits: number; total: number }> = {};
  for (const e of scored) {
    if (e.confidence == null) continue;
    const c = e.confidence, k = c >= 85 ? "Exceptional" : c >= 70 ? "Strong" : c >= 50 ? "Good" : c >= 30 ? "Mixed" : "Challenging";
    const b = (bands[k] ??= { hits: 0, total: 0 }); b.total++; if (e.pick === e.actual) b.hits++;
  }
  const stacks: Record<string, { hits: number; total: number }> = {};
  for (const e of scored) {
    if (e.margin == null) continue;
    const k = e.margin < 3 ? "Under +3" : e.margin < 6 ? "+3 to +6" : "+6 or more";
    const b = (stacks[k] ??= { hits: 0, total: 0 }); b.total++; if (e.pick === e.actual) b.hits++;
  }
  return { total: scored.length, hits, steps, bands, stacks };
}
