import type { RotoWireNhlLineups } from "./rotowire-types";
import type { AutoPerson } from "./espn-auto";

export type RotoWireDateMode = "today" | "tomorrow";

const abbreviationAliases: Record<string, string> = {
  LA: "LAK",
  LAK: "LAK",
  NJ: "NJD",
  NJD: "NJD",
  SJ: "SJS",
  SJS: "SJS",
  TB: "TBL",
  TBL: "TBL",
};

const rotowireResponseCache = new Map<
  RotoWireDateMode,
  { expiresAt: number; promise: Promise<RotoWireNhlLineups | null> }
>();

function etDate(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function nextDate(date: string): string | null {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + 1))
    .toISOString()
    .slice(0, 10);
}

export function rotowireDateModeForEvent(
  gameDate: string,
  statusState: string | undefined,
  now = new Date(),
): RotoWireDateMode | null {
  if (statusState && statusState !== "pre") return null;
  const kickoff = new Date(gameDate);
  if (!Number.isFinite(kickoff.getTime()) || kickoff.getTime() <= now.getTime()) return null;

  const gameDay = etDate(kickoff);
  const today = etDate(now);
  if (gameDay === today) return "today";
  if (gameDay === nextDate(today)) return "tomorrow";
  return null;
}

function canonicalAbbreviation(value: string | undefined): string {
  const abbr = (value ?? "").trim().toUpperCase();
  return abbreviationAliases[abbr] ?? abbr;
}

function asGoaliePerson(
  goalie: RotoWireNhlLineups["games"][number]["homeGoalie"],
  sourceUrl: string,
  retrievedAt: string,
): AutoPerson | undefined {
  if (!goalie) return undefined;
  return {
    common: goalie.name,
    full: goalie.name,
    position: "G",
    confirmedStarter: goalie.status === "confirmed",
    lineupSourceUrl: sourceUrl,
    lineupSourceUpdated: retrievedAt,
  };
}

export function mapRotoWireGoaliesToTeams(
  data: RotoWireNhlLineups,
  awayAbbr: string | undefined,
  homeAbbr: string | undefined,
): { away?: AutoPerson; home?: AutoPerson } | null {
  const away = canonicalAbbreviation(awayAbbr);
  const home = canonicalAbbreviation(homeAbbr);
  if (!away || !home) return null;

  const matchup = data.games.find(
    (game) =>
      canonicalAbbreviation(game.awayAbbr) === away &&
      canonicalAbbreviation(game.homeAbbr) === home,
  );
  if (!matchup) return null;

  const result = {
    away: asGoaliePerson(matchup.awayGoalie, data.sourceUrl, data.retrievedAt),
    home: asGoaliePerson(matchup.homeGoalie, data.sourceUrl, data.retrievedAt),
  };
  return result.away || result.home ? result : null;
}

async function getLineups(dateMode: RotoWireDateMode): Promise<RotoWireNhlLineups | null> {
  const now = Date.now();
  const cached = rotowireResponseCache.get(dateMode);
  if (cached && cached.expiresAt > now) return cached.promise;

  const promise = fetch(`/api/sports-data/rotowire-nhl-lineups?date=${dateMode}`)
    .then((res) => (res.ok ? (res.json() as Promise<RotoWireNhlLineups>) : null))
    .catch(() => null);
  rotowireResponseCache.set(dateMode, { expiresAt: now + 30000, promise });
  return promise;
}

export async function fetchRotoWireGoaliesForEvent(input: {
  gameDate: string;
  statusState?: string;
  awayAbbr?: string;
  homeAbbr?: string;
  now?: Date;
}): Promise<{ away?: AutoPerson; home?: AutoPerson } | null> {
  const dateMode = rotowireDateModeForEvent(input.gameDate, input.statusState, input.now);
  if (!dateMode) return null;

  const lineups = await getLineups(dateMode);
  if (!lineups) return null;
  return mapRotoWireGoaliesToTeams(lineups, input.awayAbbr, input.homeAbbr);
}
