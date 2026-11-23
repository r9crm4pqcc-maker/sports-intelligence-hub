import { fetchESPNMonth, type ESPNGame } from "@/lib/espn";
import { getTeamMeta } from "@/lib/sports-data";
import { runVotes, TEAM_COLORS } from "@/lib/vote-decode";
import { noteStudyGame, savedHistory, setStudyCursor } from "@/lib/sports-learning";

const LEAGUES: { name: string; months: number[]; from: string }[] = [
  { name: "MLB", months: [3, 4, 5, 6, 7, 8, 9, 10, 11], from: "1920-04-01" },
  { name: "NFL", months: [1, 2, 9, 10, 11, 12], from: "1920-09-01" },
  { name: "NHL", months: [1, 2, 3, 4, 5, 6, 10, 11, 12], from: "1920-01-01" },
  { name: "NBA", months: [1, 2, 3, 4, 5, 6, 10, 11, 12], from: "1946-11-01" },
];

function ymd(y: number, m: number) {
  return `${y}-${String(m).padStart(2, "0")}`;
}
function addMonth(y: number, m: number) {
  return m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
}
function thisMonth() {
  const dt = new Date();
  return { y: dt.getFullYear(), m: dt.getMonth() + 1 };
}

function grade(game: ESPNGame) {
  const home = Number(game.homeScore);
  const away = Number(game.awayScore);
  if (game.status !== "post" || Number.isNaN(home) || Number.isNaN(away) || home === away) return;
  const dt = new Date(game.startTime);
  const y = Number.isNaN(dt.getTime()) ? thisMonth().y : dt.getFullYear();
  const m = Number.isNaN(dt.getTime()) ? thisMonth().m : dt.getMonth() + 1;
  const d = Number.isNaN(dt.getTime()) ? 1 : dt.getDate();
  const actual = home > away ? "home" : "away";
  const kick = Number.isNaN(dt.getTime()) ? 19 : dt.getHours();
  const side = (name: string, rec?: string | null) => {
    const meta = getTeamMeta(name);
    return {
      name,
      founded: meta?.founded ? [meta.founded[0], meta.founded[1], meta.founded[2]] as [number, number, number] : undefined,
      colors: TEAM_COLORS[name],
      record: rec ?? undefined,
      people: [],
    };
  };
  const vote = runVotes({
    year: y, month: m, day: d, league: game.league, hour: kick,
    home: side(game.homeTeam, game.homeRecord),
    away: side(game.awayTeam, game.awayRecord),
    stadium: getTeamMeta(game.homeTeam)?.stadium,
    city: getTeamMeta(game.homeTeam)?.city,
    stadiumOpened: getTeamMeta(game.homeTeam)?.stadiumOpened,
    cityFounded: getTeamMeta(game.homeTeam)?.cityFounded,
  });
  noteStudyGame(`${game.league}-${game.id}`, vote.votes, actual, vote.pick);
}

let running = false;
export function studyRunning() { return running; }
export function stopStudy() { running = false; }

export async function studyOneMonth(): Promise<{ y: number; m: number; done: boolean; label: string }> {
  const cur = savedHistory().cursor;
  const end = thisMonth();
  const here = ymd(cur.y, cur.m);
  const stop = ymd(end.y, end.m);
  if (here > stop) return { ...end, done: true, label: "Saved through this month" };
  const stamp = `${ymd(cur.y, cur.m)}-01`;
  const due = LEAGUES.filter((lg) => stamp >= lg.from && lg.months.includes(cur.m));
  for (const lg of due) {
    let games: ESPNGame[] = [];
    try { games = await fetchESPNMonth(lg.name, cur.y, cur.m); } catch { games = []; }
    for (const game of games) grade(game);
  }
  const next = addMonth(cur.y, cur.m);
  setStudyCursor(next.y, next.m, 1);
  const done = ymd(next.y, next.m) > stop;
  return { ...next, done, label: `${cur.m}/${cur.y}` };
}

export async function runStudy(onTick: (label: string) => void) {
  if (running) return;
  running = true;
  try {
    while (running) {
      const step = await studyOneMonth();
      onTick(step.label);
      if (step.done) break;
    }
  } finally {
    running = false;
  }
}
