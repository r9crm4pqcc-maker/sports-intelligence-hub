import { runVotes, type VoteInput } from "./vote-decode";
import { sportsWeightSnapshot, weightFeature } from "./sports-weights";
import { acceptImprovedFit, type SportsFeedback } from "./sports-feedback";
import history from "./sports-backtest-history.json";
import nfl from "./nfl-season-2026.json";
type Sample = { id: string; input: VoteInput; winner: "home" | "away" };
self.onmessage = (event: MessageEvent<{ state: SportsFeedback; league: string }>) => {
  const { state, league } = event.data;
  const snapshot = sportsWeightSnapshot().weights;
  const incumbent = state.leagues[league] ?? snapshot.leagues[league] ?? {};
  const overrides = state.corrections.filter(r => r.league === league);
  const archived = history as unknown as { days: { rows: { id: string; league: string; actual: string; input: VoteInput }[] }[] };
  const historical: Sample[] = archived.days.flatMap(d => d.rows).filter(r => r.league === league && (r.actual === "home" || r.actual === "away")).map(r => ({ id: `${league}:${r.id}`, input: r.input, winner: r.actual as "home" | "away" }));
  const season = nfl as unknown as { games: { id: string; userPick: string | null; input: VoteInput }[] };
  if (league === "NFL") for (const r of season.games) if (r.userPick === "home" || r.userPick === "away") historical.push({ id: `NFL:${r.id}`, input: r.input, winner: r.userPick });
  const corrected = new Set(overrides.map(r => r.id));
  const samples = [...historical.filter(r => !corrected.has(r.id)), ...overrides.map(r => ({ id: r.id, input: r.input, winner: r.winner }))];
  const evaluate = (weights: Record<string, number>) => samples.map(s => runVotes({ ...s.input, codeMode: "learned", weightProfileOverride: { global: snapshot.global, leagues: { ...snapshot.leagues, [league]: weights } } }).pick === s.winner);
  let best = { ...incumbent }, hits = evaluate(best);
  const originalHits = hits.filter(Boolean).length;
  const features = new Map<string, number>();
  for (const r of overrides) {
    const raw = runVotes({ ...r.input, weightMode: "raw" });
    for (const vote of raw.votes) { const f = weightFeature(vote); features.set(f, (features.get(f) ?? 0) + (vote.side === r.winner ? 1 : -1) * (vote.baseWeight ?? vote.weight)); }
  }
  const prioritized = [...features].sort((a,b) => Math.abs(b[1])-Math.abs(a[1])).slice(0, 10);
  for (const [feature, signal] of prioritized) {
    const old = best[feature] ?? snapshot.global[feature] ?? 1;
    for (const factor of signal >= 0 ? [1.25, 1.75, 2.5] : [0.8, 0.4, 0]) {
      const candidate = { ...best, [feature]: Math.min(20, Math.max(0, old * factor)) };
      const next = evaluate(candidate);
      if (acceptImprovedFit(hits, next)) { best = candidate; hits = next; }
    }
  }
  const gained = hits.filter(Boolean).length - originalHits;
  self.postMessage({ league, weights: best, report: gained > 0 ? `${league}: improved saved replay by ${gained}; previous replay wins preserved.` : `${league}: correction saved; best weights kept. No safer improvement found yet.`, total: samples.length });
};