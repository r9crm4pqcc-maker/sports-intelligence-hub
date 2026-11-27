import type { VoteInput } from "./vote-decode";
import { sportsWeightSnapshot } from "./sports-weights";
import { tuneLeagueWeights, type SportsFeedback, type TuningSample } from "./sports-feedback";
import history from "./sports-backtest-history.json";
import nfl from "./nfl-season-2026.json";
self.onmessage = (event: MessageEvent<{ state: SportsFeedback; league: string; targetId?: string }>) => {
  const { state, league, targetId } = event.data;
  const snapshot = sportsWeightSnapshot().weights;
  const incumbent = state.leagues[league] ?? snapshot.leagues[league] ?? {};
  const overrides = state.corrections.filter(r => r.league === league);
  const archived = history as unknown as { days: { rows: { id: string; league: string; actual: string; input: VoteInput }[] }[] };
  const historical: TuningSample[] = archived.days.flatMap(d => d.rows).filter(r => r.league === league && (r.actual === "home" || r.actual === "away")).map(r => ({ id: `${league}:${r.id}`, input: r.input, winner: r.actual as "home" | "away" }));
  const season = nfl as unknown as { games: { id: string; userPick: string | null; input: VoteInput }[] };
  if (league === "NFL") for (const r of season.games) if (r.userPick === "home" || r.userPick === "away") historical.push({ id: `NFL:${r.id}`, input: r.input, winner: r.userPick });
  const corrected = new Set(overrides.map(r => r.id));
  const samples = [...historical.filter(r => !corrected.has(r.id)), ...overrides.map(r => ({ id: r.id, input: r.input, winner: r.winner }))];
  const result = tuneLeagueWeights({ league, incumbent, globalWeights: snapshot.global, allLeagues: snapshot.leagues, samples, overrides, targetId });
  self.postMessage({ league, weights: result.weights, report: result.report, total: result.total });
};