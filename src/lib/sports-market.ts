import backtest from "./sports-backtest-history.json";
import masterHistory from "./master-history.json";
import { runVotes, type VoteInput } from "./vote-decode";
import type { ESPNGame, OddsBlock } from "./espn";

type Side = "home" | "away";
export type BestSystemPlayTerms =
  | { market: "moneyline"; team: Side }
  | { market: "spread"; team: Side; line: number }
  | { market: "total"; side: "over" | "under"; line: number };
type ScoreRow = {
  date: string;
  league: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  voteMargin?: number;
};
type Candidate = {
  market: "Moneyline" | "Spread" | "Total";
  selection: string;
  edge: number;
  detail: string;
  terms: BestSystemPlayTerms;
};

export type BestSystemPlay = {
  market: "Moneyline" | "Spread" | "Total";
  selection: string;
  detail: string;
  terms: BestSystemPlayTerms;
  isPlay: boolean;
  projectedMargin?: number;
  projectedTotal?: number;
  note: string;
};

function normalizedName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function numberFromLine(value?: string) {
  if (!value) return null;
  const matches = String(value).replace(/[−–]/g, "-").match(/[+-]?\d+(?:\.\d+)?/g);
  if (!matches?.length) return null;
  const parsed = Number(matches[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function impliedProbability(value?: string) {
  if (!value) return null;
  const parsed = Number(String(value).replace(/[−–]/g, "-").replace(/[^\d+.-]/g, ""));
  if (!Number.isFinite(parsed) || parsed === 0) return null;
  return parsed < 0 ? -parsed / (-parsed + 100) : 100 / (parsed + 100);
}

export function parsePointLine(value?: string) {
  return numberFromLine(value);
}

export function parseAmericanOdds(value?: string) {
  return impliedProbability(value);
}

function parseScoreHistory(): ScoreRow[] {
  const rows: ScoreRow[] = [];
  const seen = new Set<string>();
  const add = (row: ScoreRow, id: string) => {
    const key = `${row.date}|${row.league}|${id || `${row.away}@${row.home}`}`;
    if (seen.has(key) || !Number.isFinite(row.homeScore) || !Number.isFinite(row.awayScore)) return;
    seen.add(key);
    rows.push(row);
  };

  for (const day of (backtest as any).days ?? []) {
    for (const row of day.rows ?? []) {
      const game = row.game;
      const vote = runVotes({ ...(row.input as VoteInput), codeMode: "learned" });
      add({
        date: row.date,
        league: row.league,
        home: game.homeTeam,
        away: game.awayTeam,
        homeScore: Number(game.homeScore),
        awayScore: Number(game.awayScore),
        voteMargin: vote.home - vote.away,
      }, String(row.id));
    }
  }

  for (const day of (masterHistory as any).days ?? []) {
    for (const game of day.games ?? []) {
      const scores = String(game.final ?? "").match(/(\d+)\s*[–—-]\s*(\d+)/);
      if (!scores) continue;
      // The saved final string is written away-score first, home-score second.
      add({
        date: day.date,
        league: game.league,
        home: game.home,
        away: game.away,
        homeScore: Number(scores[2]),
        awayScore: Number(scores[1]),
      }, String(game.id));
    }
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

const SCORE_HISTORY = parseScoreHistory();
const TOTAL_SCALE_CACHE = new Map<string, { sigma: number; n: number } | null>();

function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return null;
  const average = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1));
}

function normalCdf(value: number) {
  const x = Math.abs(value);
  const t = 1 / (1 + 0.2316419 * x);
  const density = 0.3989423 * Math.exp(-0.5 * x * x);
  const tail = density * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return value >= 0 ? 1 - tail : tail;
}

function averageTeamRates(rows: ScoreRow[], name: string) {
  const key = normalizedName(name);
  const matches = rows
    .filter((row) => normalizedName(row.home) === key || normalizedName(row.away) === key)
    .slice(-5);
  if (!matches.length) return null;
  const scored: number[] = [];
  const allowed: number[] = [];
  for (const row of matches) {
    const isHome = normalizedName(row.home) === key;
    scored.push(isHome ? row.homeScore : row.awayScore);
    allowed.push(isHome ? row.awayScore : row.homeScore);
  }
  return { scored: mean(scored), allowed: mean(allowed), games: matches.length };
}

function projectTotal(prior: ScoreRow[], league: string, home: string, away: string) {
  const leagueRows = prior.filter((row) => row.league === league);
  const homeRates = averageTeamRates(leagueRows, home);
  const awayRates = averageTeamRates(leagueRows, away);
  if (!homeRates || !awayRates || homeRates.games < 2 || awayRates.games < 2) return null;
  const leagueMean = mean(leagueRows.map((row) => (row.homeScore + row.awayScore) / 2));
  if (!leagueRows.length || !leagueMean) return null;
  const shrink = (value: number, games: number) => (games * value + 3 * leagueMean) / (games + 3);
  const homeScoring = shrink(homeRates.scored, homeRates.games);
  const homeAllowed = shrink(homeRates.allowed, homeRates.games);
  const awayScoring = shrink(awayRates.scored, awayRates.games);
  const awayAllowed = shrink(awayRates.allowed, awayRates.games);
  const homePoints = (homeScoring + awayAllowed) / 2;
  const awayPoints = (awayScoring + homeAllowed) / 2;
  return {
    homePoints,
    awayPoints,
    total: homePoints + awayPoints,
    margin: homePoints - awayPoints,
    games: Math.min(homeRates.games, awayRates.games),
  };
}

function fitMargin(rows: ScoreRow[]) {
  const samples = rows.filter((row) => Number.isFinite(row.voteMargin));
  if (samples.length < 12) return null;
  const xs = samples.map((row) => row.voteMargin as number);
  const ys = samples.map((row) => row.homeScore - row.awayScore);
  const xMean = mean(xs);
  const yMean = mean(ys);
  const variance = xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
  if (!variance) return null;
  const covariance = samples.reduce((sum, row) =>
    sum + ((row.voteMargin as number) - xMean) * ((row.homeScore - row.awayScore) - yMean), 0);
  const slope = covariance / variance;
  const intercept = yMean - slope * xMean;
  const residuals = samples.map((row) => row.homeScore - row.awayScore - (intercept + slope * (row.voteMargin as number)));
  const r2 = 1 - residuals.reduce((sum, residual) => sum + residual ** 2, 0)
    / Math.max(1, ys.reduce((sum, y) => sum + (y - yMean) ** 2, 0));
  if (slope <= 0 || r2 < 0.03) return null;
  return { slope, intercept, sigma: Math.max(standardDeviation(residuals) ?? 0, 1), r2, n: samples.length };
}

function totalResidualScale(league: string, beforeDate: string) {
  const key = `${league}|${beforeDate}`;
  if (TOTAL_SCALE_CACHE.has(key)) return TOTAL_SCALE_CACHE.get(key) ?? null;
  const dated = SCORE_HISTORY.filter((row) => row.league === league && row.date < beforeDate);
  const errors: number[] = [];
  const earlier: ScoreRow[] = [];
  const dates = [...new Set(dated.map((row) => row.date))].sort();
  for (const date of dates) {
    const sameDay = dated.filter((row) => row.date === date);
    for (const row of sameDay) {
      const forecast = projectTotal(earlier, league, row.home, row.away);
      if (forecast) errors.push(row.homeScore + row.awayScore - forecast.total);
    }
    earlier.push(...sameDay);
  }
  const result = errors.length < 10 ? null : { sigma: standardDeviation(errors) ?? 0, n: errors.length };
  TOTAL_SCALE_CACHE.set(key, result);
  return result;
}

function formatPoints(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function bestSystemPlay(options: {
  game: ESPNGame;
  odds: OddsBlock | null;
  date: string;
  learnedPick: Side;
  voteHome: number;
  voteAway: number;
}): BestSystemPlay {
  const { game, odds, date, learnedPick, voteHome, voteAway } = options;
  const prior = SCORE_HISTORY.filter((row) => row.date < date && row.league === game.league);
  const learnedMarginFit = fitMargin(prior);
  const scoreProjection = projectTotal(prior, game.league, game.homeTeam, game.awayTeam);
  const rawVoteMargin = voteHome - voteAway;
  const codeMargin = learnedMarginFit ? learnedMarginFit.intercept + learnedMarginFit.slope * rawVoteMargin : null;
  const selectedSign = learnedPick === "home" ? 1 : -1;
  const formSupportsPick = scoreProjection && Math.sign(scoreProjection.margin) === selectedSign
    ? Math.abs(scoreProjection.margin)
    : 0;
  const calibratedMagnitude = codeMargin == null || Math.sign(codeMargin) !== selectedSign
    ? 0
    : Math.abs(codeMargin);
  const projectedMargin = learnedMarginFit
    ? selectedSign * (0.75 * calibratedMagnitude + 0.25 * formSupportsPick)
    : scoreProjection && formSupportsPick > 0
      ? selectedSign * formSupportsPick
      : null;
  const marginSigma = learnedMarginFit?.sigma ?? null;
  const totalScale = totalResidualScale(game.league, date);
  const candidates: Candidate[] = [];
  const pickedTeam = learnedPick === "home" ? game.homeTeam : game.awayTeam;
  const pickedOdds = learnedPick === "home" ? odds?.moneylineHome : odds?.moneylineAway;
  const pickedMarketPrice = impliedProbability(pickedOdds);

  if (projectedMargin != null && marginSigma != null) {
    const selectedMargin = selectedSign * projectedMargin;
    const modelWinChance = normalCdf(selectedMargin / marginSigma);
    const baseline = pickedMarketPrice ?? 0.5;
    candidates.push({
      market: "Moneyline",
      selection: `${pickedTeam} moneyline`,
      edge: modelWinChance - baseline,
      detail: `Learned Code side · estimated win chance ${Math.round(modelWinChance * 100)}%${pickedMarketPrice == null ? " · price unavailable" : ` vs market ${Math.round(pickedMarketPrice * 100)}%`}`,
      terms: { market: "moneyline", team: learnedPick },
    });
  }

  const pickedSpread = learnedPick === "home" ? odds?.spreadHome : odds?.spreadAway;
  const oppositeSpread = learnedPick === "home" ? odds?.spreadAway : odds?.spreadHome;
  const spread = numberFromLine(pickedSpread) ?? (numberFromLine(oppositeSpread) == null ? null : -numberFromLine(oppositeSpread)!);
  if (projectedMargin != null && marginSigma != null && spread != null) {
    const selectedMargin = selectedSign * projectedMargin;
    const coverChance = normalCdf((selectedMargin + spread) / marginSigma);
    const lineLabel = spread > 0 ? `+${spread}` : String(spread);
    candidates.push({
      market: "Spread",
      selection: `${pickedTeam} ${lineLabel}`,
      edge: coverChance - 0.524,
      detail: `Projected margin ${selectedMargin >= 0 ? "in favor by " : "against by "}${formatPoints(Math.abs(selectedMargin))} · estimated cover ${Math.round(coverChance * 100)}% (spread price assumed −110)`,
      terms: { market: "spread", team: learnedPick, line: spread },
    });
  }

  const totalLine = numberFromLine(odds?.overUnder);
  const totalRead = scoreProjection && totalLine != null
    ? `Total lean ${scoreProjection.total >= totalLine ? "Over" : "Under"} ${totalLine} from recent-score projection ${formatPoints(scoreProjection.total)}; not promoted without enough validated total history.`
    : totalLine != null
      ? "Total withheld: there are not enough repeat pregame score samples to support an Over/Under call."
      : "No total line is posted, so Over/Under cannot be ranked.";
  if (scoreProjection && totalScale && totalLine != null) {
    const adjustedGap = (scoreProjection.total - totalLine) * 0.5;
    const overChance = normalCdf(adjustedGap / totalScale.sigma);
    const direction = overChance >= 0.5 ? "Over" : "Under";
    const chance = Math.max(overChance, 1 - overChance);
    // Avoid forcing a total pick unless the pregame scoring history has both
    // repeat team samples and a material line edge.
    if (scoreProjection.games >= 2 && totalScale.n >= 10 && chance >= 0.6) {
      candidates.push({
        market: "Total",
        selection: `${direction} ${totalLine}`,
        edge: chance - 0.524,
        detail: `Recent-score projection ${formatPoints(scoreProjection.total)} vs ${totalLine} · estimated ${direction.toLowerCase()} chance ${Math.round(chance * 100)}% (spread price assumed −110)`,
        terms: { market: "total", side: direction.toLowerCase() as "over" | "under", line: totalLine },
      });
    }
  }

  const positiveEdges = candidates.filter((candidate) => candidate.edge > 0)
    .sort((a, b) => b.edge - a.edge);
  const best = positiveEdges[0];
  if (best) {
    return {
      market: best.market,
      selection: best.selection,
      detail: best.market === "Total" ? best.detail : `${best.detail} · ${totalRead}`,
      terms: best.terms,
      isPlay: true,
      projectedMargin: projectedMargin ?? undefined,
      projectedTotal: scoreProjection?.total,
      note: "Best available market by the current Learned Code projection; this is a model estimate, not a guarantee.",
    };
  }

  return {
    market: "Moneyline",
    selection: `${pickedTeam} moneyline lean`,
    detail: scoreProjection
      ? `No spread or total showed a supported edge. Recent-score projection ${formatPoints(scoreProjection.awayPoints)}–${formatPoints(scoreProjection.homePoints)}. ${totalRead}`
      : `No verified scoring-history projection or priced market edge; this keeps the Learned Code side without inventing a spread or total. ${totalRead}`,
    terms: { market: "moneyline", team: learnedPick },
    isPlay: false,
    projectedMargin: projectedMargin ?? undefined,
    projectedTotal: scoreProjection?.total,
    note: "A lean only when the available lines do not show a supported advantage.",
  };
}
