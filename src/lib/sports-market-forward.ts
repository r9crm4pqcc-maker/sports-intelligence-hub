import type { ESPNGame } from "./espn";
import type { BestSystemPlay, BestSystemPlayTerms } from "./sports-market";

export const BEST_SYSTEM_PLAY_UPDATED_EVENT = "shem-best-system-play-updated";
const STORAGE_KEY = "shem-best-system-play-forward-v1";

export type MarketPlayResult = "win" | "loss" | "push";

export interface SavedBestSystemPlay {
  id: string;
  gameId: string;
  league: string;
  date: string;
  kickoff: string;
  capturedAt: string;
  home: string;
  away: string;
  market: BestSystemPlay["market"];
  selection: string;
  detail: string;
  terms: BestSystemPlayTerms;
}

export interface SavedBestSystemPlayOutcome {
  id: string;
  result: MarketPlayResult;
  homeScore: number;
  awayScore: number;
  settledAt: string;
  observedKickoff: string;
}

export interface BestSystemPlayArchive {
  schema: 1;
  plays: SavedBestSystemPlay[];
  outcomes: SavedBestSystemPlayOutcome[];
}

const emptyArchive = (): BestSystemPlayArchive => ({ schema: 1, plays: [], outcomes: [] });

export function bestSystemPlayId(league: string, gameId: string) {
  return `${league}|${gameId}|learned-best-system-play`;
}

export function readBestSystemPlayArchive(): BestSystemPlayArchive {
  if (typeof window === "undefined") return emptyArchive();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyArchive();
  const archive = JSON.parse(raw) as BestSystemPlayArchive;
  if (
    archive.schema !== 1
    || !Array.isArray(archive.plays)
    || !Array.isArray(archive.outcomes)
  ) {
    throw new Error("Unsupported Best System Play archive");
  }
  return archive;
}

function writeArchive(archive: BestSystemPlayArchive) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));
  window.dispatchEvent(new Event(BEST_SYSTEM_PLAY_UPDATED_EVENT));
}

export function findSavedBestSystemPlay(league: string, gameId: string) {
  const archive = readBestSystemPlayArchive();
  const play = archive.plays.find((row) => row.id === bestSystemPlayId(league, gameId));
  if (!play) return null;
  return {
    play,
    outcome: archive.outcomes.find((row) => row.id === play.id) ?? null,
  };
}

/** Capture only an actual, supported play—not the fallback moneyline lean. */
export function captureBestSystemPlay(
  game: ESPNGame,
  date: string,
  recommendation: BestSystemPlay,
) {
  if (
    typeof window === "undefined"
    || game.status !== "pre"
    || !recommendation.isPlay
    || !Number.isFinite(Date.parse(game.startTime))
    || Date.now() >= Date.parse(game.startTime)
  ) return false;

  const archive = readBestSystemPlayArchive();
  const id = bestSystemPlayId(game.league, game.id);
  if (archive.plays.some((row) => row.id === id)) return false;

  const play: SavedBestSystemPlay = JSON.parse(JSON.stringify({
    id,
    gameId: game.id,
    league: game.league,
    date,
    kickoff: game.startTime,
    capturedAt: new Date().toISOString(),
    home: game.homeTeam,
    away: game.awayTeam,
    market: recommendation.market,
    selection: recommendation.selection,
    detail: recommendation.detail,
    terms: recommendation.terms,
  }));
  archive.plays.push(play);
  writeArchive(archive);
  return true;
}

export function settleBestSystemPlay(
  terms: BestSystemPlayTerms,
  homeScore: number,
  awayScore: number,
): MarketPlayResult {
  if (terms.market === "moneyline") {
    const selected = terms.team === "home" ? homeScore : awayScore;
    const other = terms.team === "home" ? awayScore : homeScore;
    return selected > other ? "win" : selected < other ? "loss" : "push";
  }
  if (terms.market === "spread") {
    const selected = terms.team === "home" ? homeScore : awayScore;
    const other = terms.team === "home" ? awayScore : homeScore;
    const adjusted = selected + terms.line;
    return adjusted > other ? "win" : adjusted < other ? "loss" : "push";
  }
  const total = homeScore + awayScore;
  if (total === terms.line) return "push";
  return (total > terms.line) === (terms.side === "over") ? "win" : "loss";
}

/** Append a result once the feed supplies a final score; the saved pick is immutable. */
export function settleBestSystemPlayGames(games: ESPNGame[]) {
  const archive = readBestSystemPlayArchive();
  let changed = false;
  for (const game of games) {
    const homeScore = Number(game.homeScore);
    const awayScore = Number(game.awayScore);
    if (
      game.status !== "post"
      || !game.homeScore.trim()
      || !game.awayScore.trim()
      || !Number.isFinite(homeScore)
      || !Number.isFinite(awayScore)
      || homeScore < 0
      || awayScore < 0
    ) continue;

    const id = bestSystemPlayId(game.league, game.id);
    const play = archive.plays.find((row) =>
      row.id === id && row.home === game.homeTeam && row.away === game.awayTeam,
    );
    if (
      !play
      || Date.now() < Date.parse(play.kickoff)
      || archive.outcomes.some((row) => row.id === id)
    ) continue;

    archive.outcomes.push({
      id,
      result: settleBestSystemPlay(play.terms, homeScore, awayScore),
      homeScore,
      awayScore,
      settledAt: new Date().toISOString(),
      observedKickoff: game.startTime,
    });
    changed = true;
  }
  if (changed) writeArchive(archive);
}
