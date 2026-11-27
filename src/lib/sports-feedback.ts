import { runVotes, type VoteInput } from "./vote-decode";
import { weightFeature } from "./sports-weights";
export type WinnerCorrection = { id: string; league: string; winner: "home" | "away"; input: VoteInput; correctedAt: string; settled: boolean };
export type SportsFeedback = { corrections: WinnerCorrection[]; leagues: Record<string, Record<string, number>>; report: string; pending?: string[] };
export const EMPTY_FEEDBACK: SportsFeedback = { corrections: [], leagues: {}, report: "" };
export function replaceCorrection(rows: WinnerCorrection[], row: WinnerCorrection): WinnerCorrection[] { return [...rows.filter(r => r.id !== row.id), row]; }
export function acceptImprovedFit(before: boolean[], after: boolean[]): boolean { return before.length === after.length && after.filter(Boolean).length > before.filter(Boolean).length && before.every((hit, i) => !hit || after[i]); }

export type TuningSample = { id: string; input: VoteInput; winner: "home" | "away" };

export function tuneLeagueWeights(params: {
  league: string;
  incumbent: Record<string, number>;
  globalWeights: Record<string, number>;
  allLeagues: Record<string, Record<string, number>>;
  samples: TuningSample[];
  overrides: WinnerCorrection[];
  targetId?: string;
}) {
  const { league, incumbent, globalWeights, allLeagues, samples, overrides, targetId } = params;
  const profile = (weights: Record<string, number>) => ({ global: globalWeights, leagues: { ...allLeagues, [league]: weights } });
  const evalGame = (sample: { input: VoteInput; winner: "home" | "away" }, weights: Record<string, number>) => {
    const res = runVotes({ ...sample.input, codeMode: "learned", weightProfileOverride: profile(weights) });
    return { hit: res.pick === sample.winner, margin: sample.winner === "home" ? res.home - res.away : res.away - res.home };
  };
  const evalAll = (weights: Record<string, number>) => samples.map(s => evalGame(s, weights).hit);
  const countHits = (arr: boolean[]) => arr.filter(Boolean).length;

  let best = { ...incumbent };
  let hits = evalAll(best);
  const originalHits = countHits(hits);

  const orderedTargets = targetId
    ? [...overrides.filter(r => r.id === targetId), ...overrides.filter(r => r.id !== targetId)]
    : overrides;

  let targetFlipped = false;
  const primaryTarget = targetId ? overrides.find(r => r.id === targetId) : orderedTargets[0];

  for (const target of orderedTargets) {
    if (evalGame(target, best).hit) continue;
    const raw = runVotes({ ...target.input, weightMode: "raw" });
    const featSignal = new Map<string, number>();
    for (const vote of raw.votes) {
      const f = weightFeature(vote);
      featSignal.set(f, (featSignal.get(f) ?? 0) + (vote.side === target.winner ? 1 : -1) * (vote.baseWeight ?? vote.weight));
    }
    const ranked = [...featSignal].filter(([, s]) => Math.abs(s) > 0).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 25);

    // Pass 1: find the best single-feature adjustment that flips this target
    let bestFlip: { weights: Record<string, number>; hits: boolean[]; score: number } | null = null;
    for (const [feature, signal] of ranked) {
      const old = best[feature] ?? globalWeights[feature] ?? 1;
      const values = signal > 0
        ? [Math.max(old, 0.5) * 1.5, Math.max(old, 0.5) * 2.5, Math.max(old, 1) * 4, Math.max(old, 1) * 8, 12, 20]
        : [old * 0.6, old * 0.3, old * 0.1, 0];
      for (const rawVal of values) {
        const val = +Math.min(20, Math.max(0, rawVal)).toFixed(3);
        if (val === old) continue;
        const cand = { ...best, [feature]: val };
        if (!evalGame(target, cand).hit) continue;
        const candHits = evalAll(cand);
        const score = countHits(candHits);
        if (!bestFlip || score > bestFlip.score) bestFlip = { weights: cand, hits: candHits, score };
      }
    }
    if (bestFlip) {
      best = bestFlip.weights;
      hits = bestFlip.hits;
      if (primaryTarget && target.id === primaryTarget.id) targetFlipped = true;
      continue;
    }

    // Pass 2: multi-feature coordinate ascent until target flips
    for (let step = 0; step < 12; step++) {
      const cur = evalGame(target, best);
      if (cur.hit) break;
      let bestStep: { weights: Record<string, number>; flipped: boolean; margin: number; score: number; hits: boolean[] } | null = null;
      for (const [feature, signal] of ranked) {
        const old = best[feature] ?? globalWeights[feature] ?? 1;
        const nextVal = signal > 0 ? Math.min(20, Math.max(old * 2.5, old + 3)) : old > 0.05 ? Math.max(0, old * 0.15) : 0;
        const val = +nextVal.toFixed(3);
        if (val === old) continue;
        const cand = { ...best, [feature]: val };
        const res = evalGame(target, cand);
        if (!res.hit && res.margin <= cur.margin + 0.001) continue;
        const candHits = evalAll(cand);
        const score = countHits(candHits);
        const better = !bestStep
          || (res.hit && !bestStep.flipped)
          || (res.hit === bestStep.flipped && (res.hit ? score > bestStep.score : res.margin > bestStep.margin));
        if (better) bestStep = { weights: cand, flipped: res.hit, margin: res.margin, score, hits: candHits };
      }
      if (!bestStep) break;
      best = bestStep.weights;
      hits = bestStep.hits;
      if (bestStep.flipped) {
        if (primaryTarget && target.id === primaryTarget.id) targetFlipped = true;
        break;
      }
    }
  }

  // Pass 3: zero-regression replay polish
  const features = new Map<string, number>();
  for (const r of overrides) {
    const raw = runVotes({ ...r.input, weightMode: "raw" });
    for (const vote of raw.votes) {
      const f = weightFeature(vote);
      features.set(f, (features.get(f) ?? 0) + (vote.side === r.winner ? 1 : -1) * (vote.baseWeight ?? vote.weight));
    }
  }
  for (const [feature, signal] of [...features].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 15)) {
    const old = best[feature] ?? globalWeights[feature] ?? 1;
    for (const factor of signal >= 0 ? [1.2, 1.6, 2.5] : [0.8, 0.5, 0]) {
      const cand = { ...best, [feature]: +Math.min(20, Math.max(0, old * factor)).toFixed(3) };
      const next = evalAll(cand);
      if (acceptImprovedFit(hits, next)) { best = cand; hits = next; }
    }
  }

  const finalHits = countHits(hits);
  const gained = finalHits - originalHits;
  const targetName = primaryTarget ? primaryTarget.input[primaryTarget.winner].name : "";
  const primaryNowHit = primaryTarget ? evalGame(primaryTarget, best).hit : false;
  const report = targetFlipped
    ? `${league}: weights tuned — ${targetName} is now the pick (${finalHits}/${samples.length} replay).`
    : primaryTarget && primaryNowHit && gained > 0
      ? `${league}: ${targetName} is the pick; improved saved replay by ${gained}.`
      : primaryTarget && primaryNowHit
        ? `${league}: ${targetName} is already the pick (${finalHits}/${samples.length} replay).`
        : gained > 0
          ? `${league}: improved saved replay by ${gained}; previous replay wins preserved.`
          : `${league}: correction saved; no weight change could flip ${targetName || "this game"}.`;

  return { weights: best, targetFlipped, primaryNowHit, gained, total: samples.length, report };
}