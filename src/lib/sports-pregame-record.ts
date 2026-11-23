type FinalNflRecordGame = {
  league: string;
  status: string;
  homeScore?: string | number;
  awayScore?: string | number;
  homeRecord?: string | null;
  awayRecord?: string | null;
};

type FinalReplayRecordGame = FinalNflRecordGame & {
  statusDetail?: string;
  recordTiming?: "pregame" | "postgame";
};

const TEAM_RECORD_REPLAY_LEAGUES = new Set([
  "NFL",
  "NBA",
  "WNBA",
  "NHL",
  "MLB",
  "College Football",
  "College Basketball",
]);

export function selectedDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function centralDateParts(now = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
  };
}

export function centralDateKey(now = new Date()): string {
  const { year, month, day } = centralDateParts(now);
  return selectedDateKey(year, month, day);
}

function reverseNflResult(record: string | null | undefined, result: "win" | "loss" | "tie"): string | null | undefined {
  const match = record?.match(/^\s*(\d+)-(\d+)(?:-(\d+))?\s*$/);
  if (!match) return record;
  let wins = Number(match[1]);
  let losses = Number(match[2]);
  let ties = match[3] == null ? undefined : Number(match[3]);

  if (result === "win") {
    if (wins === 0) return record;
    wins--;
  } else if (result === "loss") {
    if (losses === 0) return record;
    losses--;
  } else {
    if (ties == null || ties === 0) return record;
    ties--;
  }

  return `${wins}-${losses}${ties == null ? "" : `-${ties}`}`;
}

/**
 * ESPN's completed scoreboard includes the result in each team's record.
 * Reverse that one game for Learned retrospectives on any selected date;
 * a saved pregame input takes precedence in the caller. Other sports,
 * Backup scoring, and the displayed final score remain untouched.
 */
export function pregameNflGameForReplay<T extends FinalNflRecordGame>(
  game: T,
  enabled = true,
): T {
  if (
    !enabled ||
    game.league !== "NFL" ||
    game.status !== "post"
  ) return game;

  const homeScore = Number(game.homeScore);
  const awayScore = Number(game.awayScore);
  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return game;

  const homeResult = homeScore === awayScore ? "tie" : homeScore > awayScore ? "win" : "loss";
  const awayResult = homeScore === awayScore ? "tie" : awayScore > homeScore ? "win" : "loss";
  return {
    ...game,
    homeRecord: reverseNflResult(game.homeRecord, homeResult),
    awayRecord: reverseNflResult(game.awayRecord, awayResult),
  };
}

function reverseCompletedRecord(
  record: string | null | undefined,
  result: "win" | "loss" | "tie",
  overtimeLoss = false,
): string | null | undefined {
  const match = record?.match(/^\s*(\d+)-(\d+)(?:-(\d+))?\s*$/);
  if (!match) return record;
  let wins = Number(match[1]);
  let losses = Number(match[2]);
  let third = match[3] == null ? undefined : Number(match[3]);

  if (result === "win") {
    if (wins === 0) return record;
    wins--;
  } else if (result === "tie") {
    if (third == null || third === 0) return record;
    third--;
  } else if (overtimeLoss && third != null) {
    if (third === 0) return record;
    third--;
  } else {
    if (losses === 0) return record;
    losses--;
  }

  return `${wins}-${losses}${third == null ? "" : `-${third}`}`;
}

/**
 * Reconstruct the record immediately before a completed game for Learned
 * retrospective cards. Prefer a saved pregame input whenever one exists.
 */
export function pregameGameForReplay<T extends FinalReplayRecordGame>(
  game: T,
  enabled = true,
): T {
  if (
    !enabled ||
    game.status !== "post" ||
    game.recordTiming !== "postgame" ||
    !TEAM_RECORD_REPLAY_LEAGUES.has(game.league)
  ) return game;
  const homeScore = Number(game.homeScore);
  const awayScore = Number(game.awayScore);
  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return game;

  const tied = homeScore === awayScore;
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;
  const isNhlOvertimeLoss = game.league === "NHL" && /\b(?:OT|SO|overtime|shootout)\b/i.test(game.statusDetail ?? "");
  return {
    ...game,
    homeRecord: reverseCompletedRecord(
      game.homeRecord,
      tied ? "tie" : homeWon ? "win" : "loss",
      isNhlOvertimeLoss && !homeWon && !tied,
    ),
    awayRecord: reverseCompletedRecord(
      game.awayRecord,
      tied ? "tie" : awayWon ? "win" : "loss",
      isNhlOvertimeLoss && !awayWon && !tied,
    ),
  };
}
