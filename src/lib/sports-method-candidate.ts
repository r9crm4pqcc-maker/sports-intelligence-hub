import { listedKeyPlayer } from "./sports-key-players";

export type SportsPersonRole =
  | "player"
  | "pitcher"
  | "quarterback"
  | "goalie"
  | "fighter"
  | "coach"
  | "manager"
  | "owner"
  | "staff";

const MASTER_NUMBERS = new Set([11, 22, 33]);

function digitSum(value: number): number {
  return [...String(Math.abs(value))].reduce((sum, digit) => sum + Number(digit), 0);
}

function reducePreservingMasters(value: number): number {
  let result = value;
  while (result > 9 && !MASTER_NUMBERS.has(result)) result = digitSum(result);
  return result;
}

/**
 * Candidate-only birth/founding code:
 * keep 11/22/33 date components intact, sum every other component's digits,
 * then preserve a pure 33 only for a Snake birth year.
 */
export function candidateSportsLifePath(
  year: number,
  month: number,
  day: number,
  snakeBirthYear = false,
): { compound: number; reduced: number } {
  const datePart = (value: number) =>
    MASTER_NUMBERS.has(value) ? value : digitSum(value);
  const compound = digitSum(year) + datePart(month) + datePart(day);
  const reduced = compound === 33 && !snakeBirthYear
    ? 6
    : reducePreservingMasters(compound);
  return { compound, reduced };
}

export function keyPersonRoleForLeague(
  league: string,
): SportsPersonRole | null {
  if (league === "UFC") return null;
  if (league === "NFL" || league === "College Football") return "quarterback";
  if (league === "MLB") return "pitcher";
  if (league === "NHL") return "goalie";
  return "player";
}

export function isSoccerLeague(league: string): boolean {
  const value = league.trim();
  return /^(MLS|Premier League|La Liga|Bundesliga|Serie A|Ligue 1|Liga MX|UCL|UEL|UECL|Eredivisie|FA Cup|Copa del Rey|UEFA .+|CONCACAF .+|FIFA .+|International .+|Africa Cup .+|AFC Asian Cup|Asian Cup|Euro|Copa America|Copa Libertadores|World Cup|Nations League)$/i.test(value);
}

/** User-supplied key players for the leagues with a designated roster list. */
export function preferredKeyPlayerForTeam(
  teamName: string,
  league: string,
): string | undefined {
  if (/^nba$/i.test(league.trim())) return listedKeyPlayer(teamName, "nba");
  if (/college basketball/i.test(league)) {
    return listedKeyPlayer(teamName, "collegeBasketball");
  }
  if (isSoccerLeague(league)) return listedKeyPlayer(teamName, "soccer");
  return undefined;
}

export function preferredSoccerKeyPlayer(teamName: string): string | undefined {
  return listedKeyPlayer(teamName, "soccer");
}
