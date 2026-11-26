import type { ESPNGame } from "./espn";
import type { VoteInput, VoteResult } from "./vote-decode";
import { sportsWeightSnapshot } from "./sports-weights";

export type ForwardOutcome = "home" | "away" | "draw";
export type ForwardMode = "learned" | "original";
export const FORWARD_UPDATED_EVENT = "shem-sports-forward-updated";
const KEY = "shem-sports-forward-v1";
export interface ForwardPrediction {
  id: string;
  gameId: string;
  league: string;
  mode: ForwardMode;
  capturedAt: string;
  kickoff: string;
  home: string;
  away: string;
  model: ReturnType<typeof sportsWeightSnapshot>;
  input: VoteInput;
  output: VoteResult;
  // Original Code adds Full Decode to runVotes; retain that contribution too.
  fullDecode: { home: number; away: number; snapshot?: unknown };
  pick: "home" | "away";
}
export interface ForwardResult {
  id: string;
  actual: ForwardOutcome;
  homeScore: number;
  awayScore: number;
  observedAt: string;
  observedKickoff: string;
}
export interface ForwardArchive {
  schema: 1;
  predictions: ForwardPrediction[];
  outcomes: ForwardResult[];
}
const empty = (): ForwardArchive => ({ schema: 1, predictions: [], outcomes: [] });

/** Pure evaluation: never regenerate a pick with today's weights or inputs. */
export function evaluateForward(archive: ForwardArchive, mode?: ForwardMode) {
  if (archive.schema !== 1 || !Array.isArray(archive.predictions) || !Array.isArray(archive.outcomes)) {
    throw new Error("Unsupported forward archive");
  }
  const seen = new Set<string>();
  const rows = archive.predictions.filter(p => !mode || p.mode === mode).map(p => {
    let excluded: string | null = null;
    const kickoff = Date.parse(p.kickoff), captured = Date.parse(p.capturedAt);
    const through = Date.parse(p.model?.trainingThrough);
    if (seen.has(p.id)) excluded = "duplicate prediction";
    seen.add(p.id);
    if (!Number.isFinite(kickoff) || !Number.isFinite(captured) || captured >= kickoff) excluded = "not saved before kickoff";
    if (!p.model?.version || !p.model.engine || !p.model.weights || !Array.isArray(p.model.trainingGameIds)
      || !Number.isFinite(through) || captured <= through || kickoff <= through
      || p.model.trainingGameIds.includes(`${p.league}|${p.gameId}`)) excluded = "missing provenance or included in fitting";
    if (!["learned", "original"].includes(p.mode) || !["home", "away"].includes(p.pick)
      || !p.input || !p.output || !p.fullDecode
      || p.input.home?.name !== p.home || p.input.away?.name !== p.away) excluded = "invalid prediction snapshot";
    const results = archive.outcomes.filter(r => r.id === p.id);
    const result = results[0];
    if (results.length > 1) excluded = "duplicate outcome";
    if (result && (!Number.isFinite(result.homeScore) || !Number.isFinite(result.awayScore)
      || result.homeScore < 0 || result.awayScore < 0
      || !Number.isFinite(Date.parse(result.observedAt)) || Date.parse(result.observedAt) < kickoff
      || !Number.isFinite(Date.parse(result.observedKickoff)) || captured >= Date.parse(result.observedKickoff)
      || Date.parse(result.observedAt) < Date.parse(result.observedKickoff)
      || result.actual !== (result.homeScore === result.awayScore ? "draw" : result.homeScore > result.awayScore ? "home" : "away"))) {
      excluded = "invalid final outcome";
    }
    return { id: p.id, mode: p.mode, weightVersion: p.model?.version, pick: p.pick, actual: result?.actual, excluded };
  });
  const eligible = rows.filter(r => !r.excluded);
  const scored = eligible.filter(r => r.actual);
  const hits = scored.filter(r => r.actual === r.pick).length;
  return {
    saved: eligible.length, pending: eligible.length - scored.length,
    scored: scored.length, hits, draws: scored.filter(r => r.actual === "draw").length,
    // A two-way pick on a draw is a miss, not a silently removed game.
    pct: scored.length ? Math.round(1000 * hits / scored.length) / 10 : null,
    excluded: rows.length - eligible.length, rows,
  };
}

export function readForwardArchive(): ForwardArchive {
  if (typeof window === "undefined") return empty();
  const raw = localStorage.getItem(KEY);
  if (!raw) return empty();
  const archive = JSON.parse(raw) as ForwardArchive;
  evaluateForward(archive); // Fail explicitly on incompatible storage; never erase it.
  return archive;
}
function write(archive: ForwardArchive) {
  localStorage.setItem(KEY, JSON.stringify(archive));
  window.dispatchEvent(new Event(FORWARD_UPDATED_EVENT));
}
export function forwardId(league: string, gameId: string, mode: ForwardMode) {
  return `${league}|${gameId}|${mode}`;
}

/** Returns the first frozen pregame prediction; it is never regenerated from current inputs. */
export function findSavedForwardPrediction(league: string, gameId: string, mode: ForwardMode) {
  const id = forwardId(league, gameId, mode);
  return readForwardArchive().predictions.find(
    prediction => prediction.id === id && prediction.league === league && prediction.gameId === gameId,
  );
}

export function captureForwardPick(game: ESPNGame, mode: ForwardMode, input: VoteInput,
  output: VoteResult, fullDecode: ForwardPrediction["fullDecode"], pick: ForwardPrediction["pick"]) {
  const now = new Date();
  if (game.status !== "pre" || !Number.isFinite(Date.parse(game.startTime)) || now.getTime() >= Date.parse(game.startTime)) return false;
  const archive = readForwardArchive();
  const id = forwardId(game.league, game.id, mode);
  // First saved prediction wins, even after a catalog edit, mode switch or weight update.
  if (archive.predictions.some(p => p.id === id)) return false;
  const prediction: ForwardPrediction = JSON.parse(JSON.stringify({
    id, gameId: game.id, league: game.league, mode, capturedAt: now.toISOString(),
    kickoff: game.startTime, home: game.homeTeam, away: game.awayTeam,
    model: input.weightProfileOverride ? { ...sportsWeightSnapshot(), version: `${sportsWeightSnapshot().version}-personal-${input.personalTrainingThrough || now.toISOString()}`, weights: input.weightProfileOverride, trainingThrough: input.personalTrainingThrough || now.toISOString(), trainingGameIds: [...sportsWeightSnapshot().trainingGameIds, ...(input.personalTrainingGameIds || [])] } : sportsWeightSnapshot(), input, output, fullDecode, pick,
  }));
  if (evaluateForward({ schema: 1, predictions: [prediction], outcomes: [] }).excluded) return false;
  archive.predictions.push(prediction);
  write(archive);
  return true;
}

/** Final results only append a separate outcome. No training, no replacement of a snapshot. */
export function settleForwardGames(games: ESPNGame[]) {
  const archive = readForwardArchive();
  let changed = false;
  for (const game of games) {
    const homeScore = Number(game.homeScore), awayScore = Number(game.awayScore);
    if (game.status !== "post" || !game.homeScore.trim() || !game.awayScore.trim()
      || !Number.isFinite(homeScore) || !Number.isFinite(awayScore) || homeScore < 0 || awayScore < 0) continue;
    for (const mode of ["learned", "original"] as const) {
      const id = forwardId(game.league, game.id, mode);
      const p = archive.predictions.find(p => p.id === id);
      if (!p || p.home !== game.homeTeam || p.away !== game.awayTeam || Date.now() < Date.parse(p.kickoff)
        || archive.outcomes.some(r => r.id === id)) continue;
      archive.outcomes.push({ id, homeScore, awayScore, actual: homeScore === awayScore ? "draw" : homeScore > awayScore ? "home" : "away", observedAt: new Date().toISOString(), observedKickoff: game.startTime });
      changed = true;
    }
  }
  if (changed) write(archive);
}

export function downloadForwardArchive() {
  const archive = readForwardArchive();
  const url = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "sports-forward-evaluation.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
