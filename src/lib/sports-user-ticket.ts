import type { ESPNGame } from "./espn";
import { normalizeSportsName } from "./sports-catalog";

export type UserTicketPick = {
  date: string;
  league: "NFL";
  gameId: string;
  away: string;
  home: string;
  pickedTeam: string;
  awayScore: number;
  homeScore: number;
  sourceUrl: string;
};

const NOVEMBER_15_NFL_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=20261115";

/** User-supplied 12-leg ticket, checked against ESPN's final scoreboard. */
export const NOVEMBER_15_NFL_USER_TICKET: UserTicketPick[] = [
  { date: "2026-11-15", league: "NFL", gameId: "401873053", away: "New England Patriots", home: "Detroit Lions", pickedTeam: "Detroit Lions", awayScore: 10, homeScore: 35, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873058", away: "Kansas City Chiefs", home: "Atlanta Falcons", pickedTeam: "Kansas City Chiefs", awayScore: 35, homeScore: 13, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873056", away: "Houston Texans", home: "Cleveland Browns", pickedTeam: "Cleveland Browns", awayScore: 24, homeScore: 27, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873060", away: "Minnesota Vikings", home: "Green Bay Packers", pickedTeam: "Minnesota Vikings", awayScore: 30, homeScore: 10, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873057", away: "Jacksonville Jaguars", home: "Tennessee Titans", pickedTeam: "Jacksonville Jaguars", awayScore: 40, homeScore: 23, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873059", away: "Miami Dolphins", home: "Indianapolis Colts", pickedTeam: "Indianapolis Colts", awayScore: 22, homeScore: 24, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873055", away: "Carolina Panthers", home: "New Orleans Saints", pickedTeam: "Carolina Panthers", awayScore: 20, homeScore: 17, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873054", away: "Buffalo Bills", home: "New York Jets", pickedTeam: "Buffalo Bills", awayScore: 31, homeScore: 12, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873062", away: "Seattle Seahawks", home: "Las Vegas Raiders", pickedTeam: "Seattle Seahawks", awayScore: 21, homeScore: 13, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873061", away: "Los Angeles Rams", home: "Arizona Cardinals", pickedTeam: "Los Angeles Rams", awayScore: 34, homeScore: 6, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873063", away: "San Francisco 49ers", home: "Dallas Cowboys", pickedTeam: "San Francisco 49ers", awayScore: 46, homeScore: 40, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
  { date: "2026-11-15", league: "NFL", gameId: "401873064", away: "Pittsburgh Steelers", home: "Cincinnati Bengals", pickedTeam: "Cincinnati Bengals", awayScore: 18, homeScore: 38, sourceUrl: NOVEMBER_15_NFL_SCOREBOARD },
];

export function getUserTicketPick(game: Pick<ESPNGame, "league" | "id" | "awayTeam" | "homeTeam">) {
  const record = NOVEMBER_15_NFL_USER_TICKET.find(
    (pick) =>
      pick.league === game.league &&
      pick.gameId === game.id &&
      normalizeSportsName(pick.away) === normalizeSportsName(game.awayTeam) &&
      normalizeSportsName(pick.home) === normalizeSportsName(game.homeTeam),
  );
  if (!record) return undefined;
  const actualWinner = record.homeScore > record.awayScore ? record.home : record.away;
  return { ...record, actualWinner, correct: normalizeSportsName(record.pickedTeam) === normalizeSportsName(actualWinner) };
}

export function userTicketSummary(date: string, league: string) {
  const picks = NOVEMBER_15_NFL_USER_TICKET.filter((pick) => pick.date === date && pick.league === league);
  const hits = picks.filter((pick) => {
    const actualWinner = pick.homeScore > pick.awayScore ? pick.home : pick.away;
    return normalizeSportsName(pick.pickedTeam) === normalizeSportsName(actualWinner);
  }).length;
  return picks.length ? { hits, total: picks.length, percent: Math.round((100 * hits) / picks.length) } : undefined;
}
