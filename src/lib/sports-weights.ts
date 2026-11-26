import profile from "./sports-weight-profile.json";
import backupProfile from "./sports-weight-profile-backup.json";
import history from "./master-history.json";
import { ruleId } from "./sports-rules";
import type { Vote } from "./vote-decode";

// Include rule-engine changes in this revision, not only numeric weight changes.
export const SPORTS_ENGINE_VERSION = "sports-engine-2026-11-26-numerology-first-qb1-v8";
export type SportsCodeProfile = "learned" | "backup";
function profileFor(mode: SportsCodeProfile) {
  const selected = (mode === "backup" ? backupProfile : profile) as {
    global: Record<string, number>;
    leagues: Record<string, Record<string, number>>;
  };
  // Learned Code uses the best-scoring weight set for each sport, falling back
  // to the shared global weights for any rule a sport has no fit for.
  return selected;
}
export function sportsWeightSnapshot(mode: SportsCodeProfile = "learned") {
  const engine = mode === "learned"
    ? `${SPORTS_ENGINE_VERSION}-learned-matrix-template-pregame-record-v3`
    : SPORTS_ENGINE_VERSION;
  const trainingDates = history.days.map(day => day.date).sort();
  const selected = profileFor(mode);
  const weights = { global: selected.global, leagues: selected.leagues };
  const serialized = JSON.stringify({ engine, weights, trainingDates });
  let hash = 2166136261;
  for (let i = 0; i < serialized.length; i++) hash = Math.imul(hash ^ serialized.charCodeAt(i), 16777619) >>> 0;
  return {
    version: `${engine}-${hash.toString(16)}`,
    engine,
    // Conservative embargo: no game on or before any fitting day is forward evidence.
    trainingThrough: `${trainingDates.at(-1)}T23:59:59.999Z`,
    trainingGameIds: history.days.flatMap(day => day.games.map(game => `${game.league}|${game.id}`)),
    weights,
  };
}

/** Feature names describe a reusable rule only: never a team, date, score or game ID. */
export function weightFeature(vote: Pick<Vote, "reason" | "layer">): string {
  const reason = vote.reason.toLowerCase();
  // Lunar evidence now appears under Game-day energy, but keep its established
  // Learned multiplier unchanged during this presentation/hierarchy correction.
  if (/moon \d+% — light (favorite|underdog) modifier/.test(reason)) {
    return "Stars & venue/moon-favorite";
  }
  let rule = ruleId(vote.reason);
  if (reason.startsWith("frequency lock")) rule = "frequency-lock";
  else if (reason.startsWith("personal hour cycle")) rule = "personal-hour";
  else if (reason.includes("full-birthdate")) rule = "full-birthdate-fit";
  else if (reason.includes("fatal")) rule = "fatal-date";
  else if (reason.includes("soulmate")) rule = "soulmate-date";
  else if (reason.includes("challenging")) rule = "challenging-date";
  else if (reason.includes("beneficial")) rule = "beneficial-date";
  else if (reason.includes("injury count")) rule = "injury-count";
  else if (reason.includes("recent form")) rule = "recent-form";
  else if (reason.includes("home/road")) rule = "home-road";
  else if (reason.includes("rest advantage")) rule = "rest";
  else if (reason.includes("all-record vibration")) rule = "all-record-vibration";
  return `${vote.layer}/${rule}`;
}
export type WeightSource = "league" | "global" | "default";
export function calibratedWeightDetails(
  league: string | undefined,
  vote: Vote,
  mode: SportsCodeProfile = "learned",
  override?: { global: Record<string, number>; leagues?: Record<string, Record<string, number>> },
) {
  const data = override ?? profileFor(mode);
  const feature = weightFeature(vote);
  const leagueValue = data.leagues?.[league || ""]?.[feature];
  if (leagueValue != null) return { multiplier: leagueValue, source: "league" as const };
  const globalValue = data.global[feature];
  if (globalValue != null) return { multiplier: globalValue, source: "global" as const };
  return { multiplier: 1, source: "default" as const };
}
export function calibratedWeight(league: string | undefined, vote: Vote, mode: SportsCodeProfile = "learned"): number {
  return calibratedWeightDetails(league, vote, mode).multiplier;
}
