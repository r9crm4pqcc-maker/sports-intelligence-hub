import { espnFetch, getLeagueInfo, type ESPNGame } from "./espn";
import { getTeamMeta } from "./sports-data";
import {
  chartTone,
  chineseMonthSign,
  chineseSign,
  dayEnergy,
  fmt,
  learnedNumberRelation,
  lifePath,
  luckyNumber,
  ord,
  personalDayFor,
  reduceNum,
  secretRelation,
  signRelation,
  type Sign,
} from "./vote-decode";

const SITE = "https://site.api.espn.com/apis/site/v2/sports";
const rosterCache = new Map<string, RosterAthlete[]>();

export type RosterAthlete = {
  id: string;
  name: string;
  position: string;
  jersey?: string;
  dob?: string; // YYYY-MM-DD
  teamId: string;
  teamName: string;
  teamAbbr: string;
  opponentName: string;
  opponentAbbr: string;
  gameId: string;
  league: string;
  isHome: boolean;
};

export type PlayerPropSignal = {
  label: string;
  delta: number;
  tone: "positive" | "negative" | "neutral";
};

export type ScoredPlayerProp = RosterAthlete & {
  score: number;
  alignmentPct: number;
  lifePathLabel: string;
  personalDayLabel: string;
  zodiacSign: Sign;
  chartToneLabel: string;
  propCalls: string[];
  signals: PlayerPropSignal[];
};

function parseIsoDob(raw?: string): [number, number, number] | null {
  if (!raw) return null;
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function touches(num: { compound: number; reduced: number }, dayNums: number[]): boolean {
  return dayNums.includes(num.compound) || dayNums.includes(num.reduced);
}

export function propCalloutsForPlayer(league: string, position: string): string[] {
  const pos = (position || "").toUpperCase();
  const lg = league.toUpperCase();
  if (lg === "NFL" || lg === "COLLEGE FOOTBALL") {
    if (pos === "QB") return ["250+ Passing Yards", "2+ Passing TDs"];
    if (pos === "RB" || pos === "FB") return ["Anytime Touchdown", "75+ Rushing Yards"];
    if (pos === "WR" || pos === "TE") return ["Anytime Touchdown", "65+ Receiving Yards"];
    if (pos === "K" || pos === "PK") return ["2+ Field Goals"];
    return ["Big Defensive Play / Turnover"];
  }
  if (lg === "NBA" || lg === "WNBA" || lg === "COLLEGE BASKETBALL") {
    if (pos === "PG" || pos === "G") return ["30+ Point Game", "7+ Assists"];
    if (pos === "SG" || pos === "SF" || pos === "F") return ["30+ Point Game", "3+ Threes"];
    if (pos === "PF" || pos === "C") return ["Double-Double", "10+ Rebounds"];
    return ["30+ Point Game", "Double-Double"];
  }
  if (lg === "MLB") {
    if (pos === "P" || pos === "SP" || pos === "RP") return ["6+ Strikeouts", "Pitcher Win"];
    return ["Home Run", "2+ Total Bases"];
  }
  if (lg === "NHL") {
    if (pos === "G") return ["28+ Saves", "Shutout Watch"];
    if (pos === "D") return ["1+ Assist", "3+ Shots on Goal"];
    return ["Anytime Goal", "1+ Assist"];
  }
  if (lg === "UFC") return ["KO / Submission Finish", "Fight Winner"];
  // Soccer leagues
  if (pos === "GK" || pos === "G") return ["4+ Saves", "Clean Sheet"];
  if (pos === "D" || pos === "DF" || pos === "CB" || pos === "LB" || pos === "RB") return ["1+ Assist", "Clean Sheet"];
  if (pos === "M" || pos === "MF" || pos === "CM" || pos === "CAM" || pos === "CDM") return ["1+ Assist", "Anytime Goal"];
  return ["Anytime Goal", "1+ Assist"];
}

export function scorePlayerForGameDay(
  athlete: RosterAthlete,
  gameDateIso: string,
  opponentFoundedYear?: number,
): ScoredPlayerProp | null {
  const dob = parseIsoDob(athlete.dob);
  const gameDate = parseIsoDob(gameDateIso);
  if (!dob || !gameDate) return null;

  const [gy, gm, gd] = gameDate;
  const ud = lifePath(gy, gm, gd);
  const dayNums = [gd, reduceNum(gd), ud.compound, ud.reduced];
  const yearSign = chineseSign(gy);
  const monthSign = chineseMonthSign(gm, gd);

  const lp = lifePath(dob[0], dob[1], dob[2]);
  const pd = personalDayFor(dob, gy, gm, gd);
  const ps = chineseSign(dob[0]);
  const tone = chartTone(dob, gameDate);

  const signals: PlayerPropSignal[] = [];
  let score = 0;
  const push = (delta: number, label: string) => {
    score += delta;
    signals.push({ label, delta, tone: delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral" });
  };

  // 1. Life Path vs Universal Day (exact QB/player rule from vote-decode.ts)
  const relNum = lp.compound === 28 ? 28 : lp.reduced;
  const lpRel = learnedNumberRelation(relNum, ud.reduced);
  const lpLabel = lp.compound === 28 ? fmt(lp) : String(lp.reduced);
  if (lpRel === "soulmate") push(2.0, `Life Path ${lpLabel} is soulmates with ${ud.reduced} Universal Day`);
  else if (lpRel === "friend") push(1.4, `Life Path ${lpLabel} is best friends with ${ud.reduced} Universal Day`);
  else if (lpRel === "same") push(1.0, `Life Path ${lpLabel} matches ${ud.reduced} Universal Day`);
  else if (lpRel === "enemy") push(-1.4, `Life Path ${lpLabel} clashes with ${ud.reduced} Universal Day`);
  else if (lpRel === "worst") push(-2.0, `Life Path ${lpLabel} vs ${ud.reduced} Universal Day — worst-enemy pair`);

  // 2. Personal Day alignment & master/28 highlights
  const pdRel = learnedNumberRelation(pd.compound === 28 ? 28 : pd.reduced, ud.reduced);
  if (pdRel === "soulmate" || pdRel === "friend" || pdRel === "same") {
    push(1.0, `Personal Day ${fmt(pd)} harmonizes with today's ${ud.reduced} energy`);
  } else if (pdRel === "enemy" || pdRel === "worst") {
    push(-0.9, `Personal Day ${fmt(pd)} faces friction against ${ud.reduced} Universal Day`);
  }
  if (pd.compound === 28 || pd.reduced === 11 || pd.reduced === 22 || pd.reduced === 33) {
    push(0.8, `Power Personal Day ${fmt(pd)} — peak charisma window`);
  }

  // 3. Chart tone for the game date
  if (tone === "Soulmate") push(1.5, "Soulmate day on personal chart");
  else if (tone === "Beneficial" || tone === "Lovers") push(0.9, `${tone} day on personal chart`);
  else if (tone === "Fatal") push(-1.5, "Fatal day caution on personal chart");
  else if (tone === "Challenging") push(-0.8, "Challenging day on personal chart");

  // 4. Life Path or Birthday number touches today
  if (touches(lp, dayNums) || touches(dayEnergy(dob[2]), dayNums)) {
    push(0.9, `LP ${fmt(lp)} / born the ${ord(dob[2])} directly touches today`);
  }

  // 5. Life Path 9 fade on pure 9 Universal Day
  if (lp.reduced === 9 && ud.reduced === 9) {
    push(-0.5, "Life Path 9 on a 9 Universal Day — scoring-fade caution");
  }

  // 6. Chinese Zodiac vs Year, Month, and Opponent
  const yrRel = signRelation(ps, yearSign);
  const moRel = signRelation(ps, monthSign);
  if (yrRel === "friend") push(0.9, `${ps} trines the ${yearSign} year`);
  else if (yrRel === "enemy") push(-1.0, `${ps} is in its enemy ${yearSign} year`);
  else {
    const secYr = secretRelation(ps, yearSign);
    if (secYr === "secret-friend") push(0.6, `${ps} is secret friends with ${yearSign} year`);
    if (secYr === "secret-enemy") push(-0.6, `${ps} is secret enemies with ${yearSign} year`);
  }
  if (moRel === "friend") push(0.7, `${ps} trines the ${monthSign} month`);
  else if (moRel === "enemy") push(-0.7, `${ps} clashes with the ${monthSign} month`);

  if (opponentFoundedYear) {
    const oppSign = chineseSign(opponentFoundedYear);
    const oppRel = signRelation(ps, oppSign);
    if (oppRel === "friend") push(0.7, `${ps} is friendly with ${oppSign} opponent`);
    else if (oppRel === "enemy") push(-0.7, `${ps} clashes with ${oppSign} opponent`);
    else {
      const secOpp = secretRelation(ps, oppSign);
      if (secOpp === "secret-friend") push(0.45, `${ps} is secret friends with ${oppSign} opponent`);
      if (secOpp === "secret-enemy") push(-0.45, `${ps} is secret enemies with ${oppSign} opponent`);
    }
  }

  // 7. Jersey number resonance (exact vote-decode.ts rule)
  const j = Number(athlete.jersey);
  if (j) {
    const lucky = luckyNumber(dob[0], dob[1]);
    const hits: string[] = [];
    if (dayNums.includes(j) || dayNums.includes(reduceNum(j))) hits.push("today");
    if (j === lucky || reduceNum(j) === reduceNum(lucky)) hits.push(`Lucky ${lucky}`);
    if (j === lp.compound || j === lp.reduced || reduceNum(j) === lp.reduced) hits.push(`LP ${fmt(lp)}`);
    if (j === dob[2]) hits.push(`Birthday ${dob[2]} breakout`);
    if (hits.length) push(0.75 + (j === dob[2] ? 0.35 : 0), `Jersey #${j} resonates with ${hits.join(", ")}`);
  }

  const alignmentPct = Math.max(15, Math.min(99, Math.round(52 + score * 8.5)));
  return {
    ...athlete,
    score: Math.round(score * 100) / 100,
    alignmentPct,
    lifePathLabel: fmt(lp),
    personalDayLabel: fmt(pd),
    zodiacSign: ps,
    chartToneLabel: tone,
    propCalls: propCalloutsForPlayer(athlete.league, athlete.position),
    signals,
  };
}

export async function fetchRosterForTeam(
  league: string,
  teamId: string,
  teamName: string,
  teamAbbr: string,
  opponentName: string,
  opponentAbbr: string,
  gameId: string,
  isHome: boolean,
): Promise<RosterAthlete[]> {
  const info = getLeagueInfo(league);
  if (!info?.path || !teamId) return [];
  const cacheKey = `${info.path}:${teamId}`;
  const cached = rosterCache.get(cacheKey);
  if (cached) {
    return cached.map((item) => ({ ...item, opponentName, opponentAbbr, gameId, league, isHome }));
  }
  try {
    const res = await espnFetch(`${SITE}/${info.path}/teams/${teamId}/roster`);
    if (!res.ok) return [];
    const data = await res.json();
    const rawAthletes: any[] = (data?.athletes ?? []).flatMap((group: any) =>
      Array.isArray(group?.items) ? group.items : [group],
    );
    const parsed: RosterAthlete[] = rawAthletes
      .filter((ath) => ath?.displayName || ath?.fullName)
      .map((ath) => ({
        id: String(ath.id ?? ath.displayName),
        name: String(ath.displayName ?? ath.fullName),
        position: String(ath.position?.abbreviation ?? ath.position?.name ?? ""),
        jersey: ath.jersey ? String(ath.jersey) : undefined,
        dob: typeof ath.dateOfBirth === "string" ? ath.dateOfBirth.slice(0, 10) : undefined,
        teamId,
        teamName,
        teamAbbr,
        opponentName,
        opponentAbbr,
        gameId,
        league,
        isHome,
      }));
    rosterCache.set(cacheKey, parsed);
    return parsed;
  } catch {
    return [];
  }
}

export async function loadAlignedPropsForGames(
  league: string,
  games: ESPNGame[],
  gameDateIso: string,
): Promise<{ players: ScoredPlayerProp[]; totalScanned: number; withDob: number }> {
  const tasks: Promise<RosterAthlete[]>[] = [];
  for (const game of games) {
    if (game.awayTeamId) {
      tasks.push(fetchRosterForTeam(league, game.awayTeamId, game.awayTeam, game.awayAbbr, game.homeTeam, game.homeAbbr, game.id, false));
    }
    if (game.homeTeamId) {
      tasks.push(fetchRosterForTeam(league, game.homeTeamId, game.homeTeam, game.homeAbbr, game.awayTeam, game.awayAbbr, game.id, true));
    }
  }
  const rosters = (await Promise.all(tasks)).flat();
  const scored: ScoredPlayerProp[] = [];
  let withDob = 0;
  for (const athlete of rosters) {
    if (athlete.dob) withDob += 1;
    const oppMeta = getTeamMeta(athlete.opponentName);
    const oppYear = oppMeta?.founded ? Number(String(oppMeta.founded).slice(0, 4)) || undefined : undefined;
    const result = scorePlayerForGameDay(athlete, gameDateIso, oppYear);
    if (result) scored.push(result);
  }
  scored.sort((a, b) => b.score - a.score || b.alignmentPct - a.alignmentPct);
  return { players: scored, totalScanned: rosters.length, withDob };
}