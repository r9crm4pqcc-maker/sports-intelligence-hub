import type { Side, Vote, VoteAudit, VoteInput } from "./vote-decode";

export interface ConventionalComparison {
  label: string;
  home: string;
  away: string;
}

function display(value: string | number | undefined): string {
  return value == null || value === "" ? "Unavailable" : String(value);
}

export function conventionalComparisons(input: VoteInput): ConventionalComparison[] {
  const rest = (days: number | undefined) => days == null ? "Unavailable" : days === 0 ? "0 days" : `${days} days`;
  const wins = (value: number | undefined) => value == null ? "Unavailable" : `${value} wins`;
  return [
    { label: "Current record", home: display(input.home.record), away: display(input.away.record) },
    { label: "Recent form", home: display(input.home.form), away: display(input.away.form) },
    { label: "Home split", home: display(input.home.splitHome), away: display(input.away.splitHome) },
    { label: "Road split", home: display(input.home.splitRoad), away: display(input.away.splitRoad) },
    { label: "Current streak", home: display(input.home.streak), away: display(input.away.streak) },
    { label: "Rest", home: rest(input.home.rest), away: rest(input.away.rest) },
    { label: "Players out", home: display(input.home.outs), away: display(input.away.outs) },
    { label: "Season H2H wins", home: wins(input.home.h2hWins), away: wins(input.away.h2hWins) },
  ];
}

export interface CurrentMarketRead {
  source: string;
  homePrice?: string;
  awayPrice?: string;
  homeImpliedPct?: number;
  awayImpliedPct?: number;
  homeNoVigPct?: number;
  awayNoVigPct?: number;
  overroundPct?: number;
}

function impliedProbability(price?: string): number | undefined {
  const value = Number(String(price ?? "").trim().replace(/[^0-9.+-]/g, ""));
  if (!Number.isFinite(value) || value === 0) return undefined;
  return value < 0 ? -value / (-value + 100) : 100 / (value + 100);
}

export function readCurrentMarket(input?: { home?: string; away?: string; source?: string } | null): CurrentMarketRead | null {
  if (!input) return null;
  const homeImplied = impliedProbability(input.home);
  const awayImplied = impliedProbability(input.away);
  if (homeImplied == null && awayImplied == null) return null;
  const total = homeImplied != null && awayImplied != null ? homeImplied + awayImplied : undefined;
  return {
    source: input.source || "Unspecified feed",
    homePrice: input.home || undefined,
    awayPrice: input.away || undefined,
    homeImpliedPct: homeImplied == null ? undefined : Math.round(homeImplied * 1000) / 10,
    awayImpliedPct: awayImplied == null ? undefined : Math.round(awayImplied * 1000) / 10,
    homeNoVigPct: total ? Math.round(1000 * (homeImplied as number) / total) / 10 : undefined,
    awayNoVigPct: total ? Math.round(1000 * (awayImplied as number) / total) / 10 : undefined,
    overroundPct: total == null ? undefined : Math.round((total - 1) * 1000) / 10,
  };
}

export type BackupDecisionLabel = "PICK" | "LEAN" | "NO BET";

export function backupBetDecision(input: {
  gameStatus: string;
  meetsSystemThreshold: boolean;
  audit?: Pick<VoteAudit, "pickedVoteShare" | "activeSignalCount" | "agreeingCategories" | "opposingCategories" | "usedTiebreak" | "coreDataCoverage">;
}): { label: BackupDecisionLabel; reason: string } {
  if (input.gameStatus !== "pre") {
    return { label: "NO BET", reason: "The game has started or finished; Backup does not issue a late pick." };
  }
  if (!input.audit) {
    return { label: "NO BET", reason: "The saved signal audit is unavailable, so Backup cannot support a pick." };
  }
  if (input.audit.activeSignalCount === 0 || input.audit.coreDataCoverage.available === 0) {
    return { label: "NO BET", reason: "There are no active signals or usable core facts to support a pick." };
  }
  if (
    input.meetsSystemThreshold &&
    !input.audit.usedTiebreak &&
    input.audit.agreeingCategories > input.audit.opposingCategories
  ) {
    return { label: "PICK", reason: "Meets the existing system best-play threshold with more supporting than opposing categories." };
  }
  if (input.audit.pickedVoteShare >= 50 && !input.audit.usedTiebreak) {
    return { label: "LEAN", reason: "The system favors this side, but it does not meet the stronger PICK conditions." };
  }
  return { label: "NO BET", reason: "The system has no clear, non-tiebreak edge for a pregame pick." };
}

export interface UnderdogDecode {
  side: Side;
  voteSharePct: number;
  supportingSignals: number;
  opposingSignals: number;
  supportingCategories: number;
}

/** Compare symbolic support with the current market dog without treating it as win probability. */
export function decodeMarketUnderdog(market: CurrentMarketRead | null, votes: Vote[]): UnderdogDecode | null {
  if (market?.homeNoVigPct == null || market.awayNoVigPct == null || market.homeNoVigPct === market.awayNoVigPct) return null;
  const side: Side = market.homeNoVigPct < market.awayNoVigPct ? "home" : "away";
  const totals = { home: 0, away: 0 };
  const categories = { home: new Set<string>(), away: new Set<string>() };
  for (const vote of votes) {
    totals[vote.side] += Math.abs(vote.appliedWeight ?? vote.weight);
    categories[vote.side].add(vote.layer);
  }
  const total = totals.home + totals.away;
  if (!total) return null;
  return {
    side,
    voteSharePct: Math.round((totals[side] / total) * 1000) / 10,
    supportingSignals: votes.filter((vote) => vote.side === side).length,
    opposingSignals: votes.filter((vote) => vote.side !== side).length,
    supportingCategories: categories[side].size,
  };
}
