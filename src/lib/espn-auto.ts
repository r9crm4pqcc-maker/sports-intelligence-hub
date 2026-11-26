import { espnFetch } from "./espn";
// Fully automated matchup data retrieval for the gematria decode protocol.
// Pulls starters, managers, birthdays, records and splits straight from ESPN —
// there is no manual entry anywhere in the pipeline.

import { getLeagueInfo } from "./espn";
import { ingestSportsFeed } from "./sports-catalog";
import { logoColorName } from "./sports-color-code";
import masterHistory from "./master-history.json";
import { normalizeSportsName } from "./sports-catalog";
import { keyPersonRoleForLeague, preferredKeyPlayerForTeam } from "./sports-method-candidate";
import { fetchRotoWireGoaliesForEvent } from "./rotowire-nhl";

const SITE = "https://site.api.espn.com/apis/site/v2/sports";
const WEB = "https://site.web.api.espn.com/apis/common/v3/sports";
const CORE = "https://sports.core.api.espn.com/v2/sports";
/** Core API paths need a `leagues` segment: baseball/mlb → baseball/leagues/mlb. */
function corePath(path: string): string {
  const [sport, ...rest] = path.split("/");
  return rest.length ? `${sport}/leagues/${rest.join("/")}` : sport;
}

async function j<T = any>(url: string): Promise<T | null> {
  try {
    const r = await espnFetch(url);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export interface AutoPerson {
  position?: string;
  confirmedStarter?: boolean;
  common: string;
  full?: string;
  dob?: string;              // YYYY-MM-DD
  sourceUrl?: string;
  lineupSourceUrl?: string;
  lineupSourceUpdated?: string;
  jersey?: string;
  record?: string;           // season W-L
  careerRecord?: string;     // career W-L
  homeRecord?: string;
  roadRecord?: string;
  vsOpponentRecord?: string;
  era?: string;
  whip?: string;
  strikeouts?: string;
  teamRecordInStarts?: string;
}

export interface AutoSide {
  keyPlayers?: AutoPerson[];
  owner?: AutoPerson;
  colors?: string[];
  teamId?: string;
  shortName?: string;
  longName?: string;
  record?: string;
  homeRecord?: string;
  roadRecord?: string;
  last10?: string;
  /** W-D-L over the team's most recent completed matches before this fixture. */
  lastFiveRecord?: string;
  lastFiveCount?: number;
  lastPlayed?: string;
  outs?: number;
  streak?: string;
  monthRecord?: string;
  abbr?: string;
  keyJerseys?: number[];
  manager?: AutoPerson;
  starter?: AutoPerson;
}

export function findRosterAthleteByName(athletes: any[], name?: string): any | undefined {
  const target = normalizeSportsName(name || "");
  if (!target) return undefined;
  return athletes.find((athlete) =>
    [athlete?.displayName, athlete?.fullName, athlete?.common]
      .some((candidate) => normalizeSportsName(String(candidate || "")) === target),
  );
}

export function listedRosterPlayerName(
  teamName: string,
  league: string,
  includeListedPlayer: boolean,
): string | undefined {
  return includeListedPlayer && keyPersonRoleForLeague(league) === "player"
    ? preferredKeyPlayerForTeam(teamName, league)
    : undefined;
}

export interface AutoMatchup {
  retrievedAt: string;
  home: AutoSide;
  away: AutoSide;
  venue?: string;
  venueCity?: string;
  venueState?: string;
  seriesGame?: number;
  seriesRecord?: string;
  seasonSeries?: string;
  allTimeSeries?: string;
  homeSeriesWins?: number;
  awaySeriesWins?: number;
  homeH2hWins?: number;
  awayH2hWins?: number;
  /** Series digits that could not be assigned to one side. */
  sharedSeries?: number[];
  /** Previous meeting scores and margins. */
  priorNumbers?: number[];
  pitchersConfirmed: boolean;
  gaps: string[];
}

export type InternationalRecentRecord = {
  lastFiveRecord?: string;
  lastFiveCount?: number;
};
export type InternationalRecentRecords = {
  home?: InternationalRecentRecord;
  away?: InternationalRecentRecord;
};

const iso = (s?: string) => (s ? s.slice(0, 10) : undefined);

export function summarizeLastFiveResults(
  events: Array<{ gameDate?: string; date?: string; gameResult?: string }>,
  beforeKickoff: string,
): { played: number; wins: number; draws: number; losses: number; record: string } | undefined {
  const cutoff = Date.parse(beforeKickoff);
  if (!Number.isFinite(cutoff)) return undefined;
  const completed = events
    .map((event) => ({ event, timestamp: Date.parse(event.gameDate ?? event.date ?? "") }))
    .filter(({ event, timestamp }) =>
      Number.isFinite(timestamp) &&
      timestamp < cutoff &&
      ["W", "D", "L"].includes(String(event.gameResult ?? "").toUpperCase()),
    )
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-5);
  if (!completed.length) return undefined;
  const wins = completed.filter(({ event }) => String(event.gameResult).toUpperCase() === "W").length;
  const draws = completed.filter(({ event }) => String(event.gameResult).toUpperCase() === "D").length;
  const losses = completed.filter(({ event }) => String(event.gameResult).toUpperCase() === "L").length;
  return {
    played: completed.length,
    wins,
    draws,
    losses,
    record: `${wins}W-${draws}D-${losses}L`,
  };
}

/**
 * Fetch only pre-kickoff international form for completed fixtures.
 * This intentionally avoids hydrating current roster/market data for historical picks.
 */
export async function fetchInternationalLastFiveRecords(
  league: string,
  gameId: string,
): Promise<InternationalRecentRecords> {
  const path = getLeagueInfo(league).espnPath;
  if (!path.startsWith("soccer/") || !gameId) return {};
  const summary = await j<any>(`${SITE}/${path}/summary?event=${gameId}`);
  const competition = summary?.header?.competitions?.[0];
  const kickoff = competition?.date ?? summary?.gameInfo?.date ?? "";
  if (!summary || !Number.isFinite(Date.parse(kickoff))) return {};

  const sides = new Map<string, "home" | "away">(
    (competition.competitors ?? []).map((competitor: any) => [
      String(competitor.team?.id ?? ""),
      competitor.homeAway,
    ]),
  );
  const records: InternationalRecentRecords = {};

  await Promise.all((summary.lastFiveGames ?? []).map(async (block: any) => {
    const teamId = String(block.team?.id ?? "");
    const side = sides.get(teamId);
    if (!teamId || !side) return;
    let events: any[] = block.events ?? [];
    let recent = summarizeLastFiveResults(events, kickoff);

    // ESPN's completed-game summary may include that game among its five.
    // Use the oldest prior fixture's summary to recover the fifth pregame result.
    if ((recent?.played ?? 0) < 5) {
      const prior = events
        .filter((event) => Date.parse(event.gameDate ?? event.date ?? "") < Date.parse(kickoff))
        .sort((a, b) => Date.parse(a.gameDate ?? a.date ?? "") - Date.parse(b.gameDate ?? b.date ?? ""));
      const oldestPriorId = String(prior[0]?.id ?? "");
      if (oldestPriorId) {
        const priorSummary = await j<any>(`${SITE}/${path}/summary?event=${oldestPriorId}`);
        const earlierBlock = (priorSummary?.lastFiveGames ?? []).find(
          (candidate: any) => String(candidate.team?.id ?? "") === teamId,
        );
        if (earlierBlock?.events?.length) {
          const unique = new Map<string, any>();
          for (const event of [...events, ...earlierBlock.events]) {
            const key = String(event.id ?? event.gameDate ?? event.date ?? "");
            if (key) unique.set(key, event);
          }
          events = [...unique.values()];
          recent = summarizeLastFiveResults(events, kickoff);
        }
      }
    }

    if (recent) {
      records[side] = {
        lastFiveRecord: recent.record,
        lastFiveCount: recent.played,
      };
    }
  }));

  return records;
}

function findRecord(list: any[] | undefined, type: string): string | undefined {
  if(!Array.isArray(list))return undefined;
  const r = list?.find((x) => (x.type ?? x.name ?? "").toLowerCase() === type);
  return r?.summary ?? r?.displayValue ?? undefined;
}

/** Season + career pitching lines from the athlete stats endpoint. */
async function pitcherStats(path: string, athleteId: string, season: number) {
  const s = await j<any>(`${WEB}/${path}/athletes/${athleteId}/stats`);
  const cat = s?.categories?.find((c: any) => c.name === "pitching");
  if (!cat) return null;
  const labels: string[] = cat.labels ?? [];
  const idx = (l: string) => labels.indexOf(l);
  const rows: any[] = (cat.statistics ?? []).filter((r: any) => r?.stats?.length);
  const num = (row: any, l: string) => Number(row.stats[idx(l)] ?? 0) || 0;
  let cw = 0, cl = 0;
  for (const r of rows) { cw += num(r, "W"); cl += num(r, "L"); }
  const cur = rows.find((r: any) => String(r?.season?.year ?? r?.season?.displayName ?? "") === String(season)) ?? rows[rows.length - 1];
  return {
    season: cur ? `${num(cur, "W")}-${num(cur, "L")}` : undefined,
    career: rows.length ? `${cw}-${cl}` : undefined,
    era: cur ? String(cur.stats[idx("ERA")] ?? "") : undefined,
    whip: cur ? String(cur.stats[idx("WHIP")] ?? "") : undefined,
    strikeouts: cur ? String(cur.stats[idx("K")] ?? "") : undefined,
  };
}

async function buildStarter(path: string, prob: any, season: number): Promise<AutoPerson | undefined> {
  const ath = prob?.athlete;
  const id = String(prob?.playerId ?? ath?.id ?? "");
  if (!ath?.displayName && !ath?.fullName) return undefined;
  const [core, stats] = await Promise.all([
    id ? j<any>(`${CORE}/${corePath(path)}/athletes/${id}?lang=en&region=us`) : Promise.resolve(null),
    id ? pitcherStats(path, id, season) : Promise.resolve(null),
  ]);
  return {
    common: ath.displayName ?? ath.fullName,
    full: core?.fullName ?? ath.fullName,
    dob: iso(core?.dateOfBirth),
    jersey: ath.jersey,
    position: ath.position?.abbreviation ?? prob?.position?.abbreviation,
    confirmedStarter: true,
    record: stats?.season,
    careerRecord: stats?.career,
    era: stats?.era,
    whip: stats?.whip,
    strikeouts: stats?.strikeouts,
  };
}

async function buildManager(path: string, teamId: string, season: number): Promise<AutoPerson | undefined> {
  let list = await j<any>(`${CORE}/${corePath(path)}/seasons/${season}/teams/${teamId}/coaches?lang=en&region=us`);
  const ref = list?.items?.[0]?.$ref;
  if (!ref) return undefined;
  const c = await j<any>(ref.replace("http://", "https://"));
  if (!c) return undefined;
  const common = `${(c.firstName ?? "").trim()} ${(c.lastName ?? "").trim()}`.trim();
  if (!common) return undefined;
  let record: string | undefined;
  const rref = c.records?.[0]?.record?.$ref;
  if (rref) {
    const rec = await j<any>(rref.replace("http://", "https://"));
    record = rec?.summary ?? rec?.displayValue;
  }
  return {
    common,
    full: c.person?.fullName ?? common,
    dob: iso(c.dateOfBirth || c.person?.dateOfBirth),
    sourceUrl: ref.replace("http://", "https://"),
    record,
  };
}

/** One call → every participant number the protocol needs, no manual entry. */
function mentions(blob: string, name?: string, abbr?: string): boolean {
  const s = blob.toLowerCase();
  if (abbr && new RegExp(`\\b${abbr.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(s)) return true;
  if (!name) return false;
  const parts = name.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
  return parts.some((w) => s.includes(w));
}

/** "TB wins series 3-2" / "Series tied 1-1" → each side's win count. */
export function splitSeries(summary: string | undefined, homeName?: string, awayName?: string, homeAbbr?: string, awayAbbr?: string): { home?: number; away?: number; shared?: number[] } {
  if (!summary) return {};
  const tied = summary.match(/tied[^0-9]*(\d+)\s*[-–]\s*(\d+)/i);
  if (tied) return { home: +tied[1], away: +tied[2] };
  const lead = summary.match(/^(.*?)\s+(?:wins|leads|lead)\b[^0-9]*(\d+)\s*[-–]\s*(\d+)/i);
  if (lead) {
    const hi = +lead[2];
    const lo = +lead[3];
    const homeHit = mentions(lead[1], homeName, homeAbbr);
    const awayHit = mentions(lead[1], awayName, awayAbbr);
    if (homeHit && !awayHit) return { home: hi, away: lo };
    if (awayHit && !homeHit) return { home: lo, away: hi };
    return { shared: [hi, lo] };
  }
  const bare = summary.match(/(\d+)\s*[-–]\s*(\d+)/);
  return bare ? { shared: [+bare[1], +bare[2]] } : {};
}

function streakLabel(standings: any, teamId: string): string | undefined {
  for (const g of standings?.groups ?? []) {
    for (const e of g?.standings?.entries ?? g?.entries ?? []) {
      const id = String(e?.id ?? e?.team?.id ?? "");
      if (id !== teamId) continue;
      const st = (e?.stats ?? []).find((s: any) => s?.name === "streak" || s?.type === "streak");
      if (st?.displayValue) return String(st.displayValue);
    }
  }
  return undefined;
}

function starterJerseys(box: any, teamId: string, extra?: string): number[] {
  const nums = new Set<number>();
  const add = (v: unknown) => {
    const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
    if (n > 0 && n < 100) nums.add(n);
  };
  add(extra);
  for (const team of box?.players ?? []) {
    const id = String(team?.team?.id ?? "");
    if (teamId && id && id !== teamId) continue;
    for (const stat of team?.statistics ?? []) {
      for (const row of stat?.athletes ?? []) {
        if (row?.starter !== true) continue;
        add(row?.athlete?.jersey ?? row?.jersey);
      }
    }
  }
  return [...nums].slice(0, 6);
}

/** Prefer posted starters, but keep listed QBs eligible even when not marked as starters. */
export function postedKeyAthletes(summary: any, teamId: string): any[] {
  const result=new Map<string,any>();
  const add=(row:any)=>{
    const athlete=row?.athlete;
    const position = athlete?.position?.abbreviation ?? row?.position?.abbreviation ?? row?.position;
    const isQuarterback = /^(QB|quarterback)$/i.test(String(position ?? "").trim());
    if((row?.starter!==true && !isQuarterback) || !athlete?.displayName)return;
    const key = String(athlete.id || athlete.displayName);
    const previous = result.get(key);
    result.set(key, {
      ...previous,
      ...athlete,
      position: athlete.position ?? (typeof position === "string" ? { abbreviation: position } : position),
      confirmedStarter: row.starter === true || previous?.confirmedStarter === true,
    });
  };
  for(const group of summary.boxscore?.players || []) {
    if(String(group.team?.id)!==teamId)continue;
    for(const stat of group.statistics || []) for(const row of stat.athletes || [])add(row);
  }
  for(const group of summary.rosters || []) if(String(group.team?.id)===teamId)
    for(const row of group.roster || [])add(row);
  return [...result.values()]
    .sort((a,b)=>Number(/^(QB|quarterback)$/i.test(b.position?.abbreviation ?? ""))-Number(/^(QB|quarterback)$/i.test(a.position?.abbreviation ?? "")))
    .slice(0,10);
}
async function hydrateKeyPlayers(path:string,teamId:string,summary:any,league:string,includeListedPlayer:boolean):Promise<AutoPerson[]> {
  const posted=postedKeyAthletes(summary,teamId);
  const roster=await j<any>(`${SITE}/${path}/teams/${teamId}/roster`);
  const athletes=(roster?.athletes || []).flatMap((group:any)=>group.items || [group]);
  const teamName = roster?.team?.displayName || roster?.team?.shortDisplayName || "";
  const listedName = listedRosterPlayerName(teamName, league, includeListedPlayer);
  const listedPlayer = findRosterAthleteByName(athletes, listedName);
  const listedQuarterbacks=athletes
    .filter((ath:any)=>/^(QB|quarterback)$/i.test(ath?.position?.abbreviation || ""))
    .map((ath:any)=>({...ath,displayName:ath.displayName || ath.fullName,confirmedStarter:false}));
  const candidates=new Map<string,any>();
  for(const athlete of [...posted,...listedQuarterbacks,...(listedPlayer ? [listedPlayer] : [])]) {
    if(!athlete?.displayName)continue;
    const key=String(athlete.id || athlete.displayName);
    const previous=candidates.get(key);
    candidates.set(key,{
      ...previous,
      ...athlete,
      confirmedStarter:athlete.confirmedStarter===true || previous?.confirmedStarter===true,
    });
  }
  return Promise.all([...candidates.values()].map(async (ath:any)=>{
    const listed=athletes.find((p:any)=>String(p.id)===String(ath.id));
    const core=(!listed?.dateOfBirth && !ath.dateOfBirth && ath.id) ? await j<any>(`${CORE}/${corePath(path)}/athletes/${ath.id}?lang=en&region=us`) : null;
    const profileLink = (person: any) => person?.links?.find((link: any) =>
      link.rel?.includes("athlete") && (link.rel?.includes("playercard") || link.rel?.includes("overview")),
    )?.href;
    return {common:ath.displayName || ath.fullName,full:listed?.fullName || core?.fullName || ath.fullName,
      dob:iso(ath.dateOfBirth || listed?.dateOfBirth || core?.dateOfBirth),
      sourceUrl:profileLink(listed) || profileLink(core),
      jersey:ath.jersey ?? listed?.jersey ?? core?.jersey,position:ath.position?.abbreviation || listed?.position?.abbreviation,confirmedStarter:ath.confirmedStarter===true};
  }));
}

async function fetchDepthChartQb(path: string, teamId: string): Promise<{ id?: string; name?: string } | undefined> {
  const data = await j<any>(`${SITE}/${path}/teams/${teamId}/depthcharts`);
  const groups = data?.depthchart || data?.items || [];
  for (const group of groups) {
    const positions = group?.positions || {};
    for (const [key, pos] of Object.entries<any>(positions)) {
      if (!/^qb$/i.test(key)) continue;
      const qb1 = pos?.athletes?.[0];
      if (qb1?.displayName || qb1?.id) {
        return { id: qb1.id ? String(qb1.id) : undefined, name: qb1.displayName || qb1.fullName };
      }
    }
  }
  return undefined;
}
export function resolveArchiveEvent(events:any[], away:string, home:string):string | undefined {
  const matches=(competitor:any,name:string)=>[competitor?.team?.displayName,competitor?.team?.shortDisplayName,competitor?.team?.name].some(n=>n && normalizeSportsName(n)===normalizeSportsName(name));
  const matching=events.filter(event=>{
    const sides=event.competitions?.[0]?.competitors || [];
    return sides.some((c:any)=>c.homeAway==="home" && matches(c,home)) && sides.some((c:any)=>c.homeAway==="away" && matches(c,away));
  });
  // Do not attach the wrong game from a baseball doubleheader.
  return matching.length===1 ? String(matching[0].id) : undefined;
}
const archiveBoards=new Map<string,{until:number;promise:Promise<any>}>();
async function archivedProviderGame(path:string,gameId:string):Promise<string | undefined> {
  const game=masterHistory.days.flatMap(day=>day.games.map(g=>({id:g.id,date:day.date,away:g.away,home:g.home}))).find(g=>g.id===gameId);
  if(!game)return undefined;
  const key=`${path}/${game.date}`;
  let entry=archiveBoards.get(key);
  if(!entry || entry.until<Date.now()){
    if(archiveBoards.size>=100)archiveBoards.delete(archiveBoards.keys().next().value!);
    entry={until:Date.now()+60000,promise:j<any>(`${SITE}/${path}/scoreboard?dates=${game.date.replaceAll("-","")}&limit=1000`)};
    archiveBoards.set(key,entry);
  }
  const board=await entry.promise;
  return resolveArchiveEvent(board?.events || [],game.away,game.home);
}
export async function fetchAutoMatchup(
  league: string,
  gameId: string,
  includeListedPlayer = false,
  useRotoWireNhlLineups = includeListedPlayer,
): Promise<AutoMatchup> {
  const cfg = getLeagueInfo(league);
  const path = cfg.espnPath;
  const gaps: string[] = [];
  const out: AutoMatchup = {
    retrievedAt: new Date().toISOString(),
    home: {}, away: {},
    pitchersConfirmed: false,
    gaps,
  };
  if (!path || !gameId) { gaps.push("League feed unavailable."); return out; }
  if(gameId.startsWith("master-")){
    const resolved=await archivedProviderGame(path,gameId);
    if(!resolved){gaps.push("The provider has no unique matching historical event for this uploaded game. Unknown starters, jerseys, coaches, owners, streaks and splits are not invented; verified catalog entries still apply.");return out;}
    gameId=resolved;
  }

  const s = await j<any>(`${SITE}/${path}/summary?event=${gameId}`);
  if (!s) { gaps.push("ESPN summary unreachable"); return out; }

  const comp = s.header?.competitions?.[0];
  const currentMatchDate = comp?.date ?? s.gameInfo?.date ?? "";
  const season = Number(s.header?.season?.year ?? new Date().getFullYear());
  const competitors: any[] = comp?.competitors ?? [];

  out.venue = s.gameInfo?.venue?.fullName;
  out.venueCity = s.gameInfo?.venue?.address?.city;
  out.venueState = s.gameInfo?.venue?.address?.state;

  // Season series / current series / all-time
  const series: any[] = s.seasonseries ?? [];
  const current = series.find((x) => String(x.type ?? "").toLowerCase() === "current");
  if (current) {
    out.seriesRecord = current.seriesScore ?? current.summary;
    out.seriesGame = (current.events?.filter((e: any) => e.status === "post").length ?? 0) + 1;
  }
  const seasonSer = series.find((x) => x.type === "season") ?? series.find((x) => /season/i.test(x.title ?? ""));
  out.seasonSeries = seasonSer?.summary ?? current?.summary;
  const allTime = series.find((x) => /all.?time/i.test(`${x.type ?? ""} ${x.title ?? ""}`));
  out.allTimeSeries = allTime?.summary ?? allTime?.seriesScore;

  const sides = await Promise.all(
    competitors.map(async (c: any) => {
      const teamId = String(c.team?.id ?? c.id ?? "");
      const side: AutoSide = {
        teamId,
        abbr: c.team?.abbreviation,
        shortName: c.team?.shortDisplayName ?? c.team?.name ?? c.team?.abbreviation,
        longName: c.team?.displayName ?? c.team?.shortDisplayName,
        record: findRecord(c.record, "total") ?? findRecord(c.records,"total") ?? c.record?.[0]?.summary ?? c.records?.[0]?.summary,
        homeRecord: findRecord(c.record, "home") ?? findRecord(c.records,"home"),
        roadRecord: findRecord(c.record, "road") ?? findRecord(c.record, "away") ?? findRecord(c.records,"road") ?? findRecord(c.records,"away"),
        streak: findRecord(c.record, "streak") ?? findRecord(c.records, "streak"),
      };
      const details=teamId ? (await j<any>(`${SITE}/${path}/teams/${teamId}`))?.team : undefined;
      const logoColors = [c.team?.color || details?.color, c.team?.alternateColor || details?.alternateColor];
      side.colors = logoColors.filter(Boolean).map((hex: string) => logoColorName(hex)).filter((name: string | null): name is string => !!name);
      const prob = c.probables?.[0];
      const isFootball = league === "NFL" || league === "College Football";
      const [starter, manager, keyPlayers, depthQb] = await Promise.all([
        prob ? buildStarter(path, prob, season) : Promise.resolve(undefined),
        teamId ? buildManager(path, teamId, season) : Promise.resolve(undefined),
        teamId ? hydrateKeyPlayers(path,teamId,s,league,includeListedPlayer) : Promise.resolve([]),
        isFootball && teamId && !prob ? fetchDepthChartQb(path, teamId) : Promise.resolve(undefined),
      ]);
      side.keyPlayers=keyPlayers;
      const footballQb = isFootball
        ? keyPlayers.find(p => p.position === "QB" && p.confirmedStarter)
          || (depthQb?.name
            ? keyPlayers.find(p => p.position === "QB" && p.common.toLowerCase() === depthQb.name!.toLowerCase())
            : undefined)
          || keyPlayers.find(p => p.position === "QB")
        : undefined;
      side.starter = starter || (isFootball
        ? footballQb : league==="MLB" ? keyPlayers.find(p=>["P","SP"].includes(p.position || "")) : keyPlayers[0]);
      side.manager = manager;
      const owner=details?.owner || details?.owners?.[0] || details?.franchise?.owner || details?.franchise?.owners?.[0];
      if (typeof owner === "string" && owner.trim())
        side.owner = { common: owner.trim(), sourceUrl: `${SITE}/${path}/teams/${teamId}` };
      else if (owner && typeof owner === "object" && (owner.displayName || owner.fullName || owner.name))
        side.owner = {
          common: owner.displayName || owner.fullName || owner.name,
          full: owner.fullName,
          dob: iso(owner.dateOfBirth || owner.dob),
          sourceUrl: owner.links?.find?.((link: any) => link.rel?.includes("bio") || link.rel?.includes("profile"))?.href
            || `${SITE}/${path}/teams/${teamId}`,
        };
      return { homeAway: c.homeAway, side };
    }),
  );

  for (const { homeAway, side } of sides) {
    if (homeAway === "home") out.home = side; else out.away = side;
  }

  if (league === "NHL" && useRotoWireNhlLineups) {
    const goalies = await fetchRotoWireGoaliesForEvent({
      gameDate: currentMatchDate,
      statusState: comp?.status?.type?.state,
      awayAbbr: out.away.abbr,
      homeAbbr: out.home.abbr,
    });
    if (goalies?.away) out.away.starter = goalies.away;
    if (goalies?.home) out.home.starter = goalies.home;
  }

  const homeStreak = out.home.teamId ? streakLabel(s.standings, out.home.teamId) : undefined;
  const awayStreak = out.away.teamId ? streakLabel(s.standings, out.away.teamId) : undefined;
  if (homeStreak) out.home.streak = homeStreak;
  if (awayStreak) out.away.streak = awayStreak;
  out.home.keyJerseys = starterJerseys(s.boxscore, out.home.teamId ?? "", out.home.starter?.jersey);
  out.away.keyJerseys = starterJerseys(s.boxscore, out.away.teamId ?? "", out.away.starter?.jersey);

  const homeLabel = out.home.longName || out.home.shortName;
  const awayLabel = out.away.longName || out.away.shortName;
  const seasonSplit = splitSeries(seasonSer?.summary ?? seasonSer?.seriesScore, homeLabel, awayLabel, out.home.abbr, out.away.abbr);
  const currentSplit = splitSeries(current?.summary ?? current?.seriesScore, homeLabel, awayLabel, out.home.abbr, out.away.abbr);
  out.homeH2hWins = seasonSplit.home;
  out.awayH2hWins = seasonSplit.away;
  out.homeSeriesWins = currentSplit.home;
  out.awaySeriesWins = currentSplit.away;
  const shared = [...(seasonSplit.shared ?? []), ...(currentSplit.shared ?? [])].filter((n) => n > 0);
  if (shared.length) out.sharedSeries = [...new Set(shared)];

  const priors: number[] = [];
  const seen = new Set<string>();
  for (const block of series) {
    for (const ev of block?.events ?? []) {
      const id = String(ev?.id ?? "");
      if (!id || seen.has(id) || id === String(gameId)) continue;
      const post = ev?.status === "post" || ev?.statusType?.state === "post" || ev?.statusType?.completed === true;
      if (!post) continue;
      seen.add(id);
      const scores = (ev.competitors ?? []).map((c: any) => Number(c?.score)).filter((n: number) => Number.isFinite(n));
      if (scores.length < 2) continue;
      priors.push(scores[0], scores[1], Math.abs(scores[0] - scores[1]));
    }
  }
  out.priorNumbers = [...new Set(priors.filter((n) => n > 0))];

  // last five games → last-10-ish form line
  for (const block of s.lastFiveGames ?? []) {
    const id = String(block.team?.id ?? "");
    const recent = summarizeLastFiveResults(block.events ?? [], currentMatchDate);
    if (recent) {
      if (out.home.teamId === id) {
        out.home.lastFiveRecord = recent.record;
        out.home.lastFiveCount = recent.played;
      }
      if (out.away.teamId === id) {
        out.away.lastFiveRecord = recent.record;
        out.away.lastFiveCount = recent.played;
      }
    }
    const wins = (block.events ?? []).filter((e: any) => /W/.test(e.gameResult ?? "")).length;
    const games = (block.events ?? []).length;
    if (!games) continue;
    const line = `${wins}-${games - wins}`;
    if (out.home.teamId === id) out.home.last10 = line;
    if (out.away.teamId === id) out.away.last10 = line;
    const dates = (block.events ?? []).map((e: any) => String(e?.gameDate ?? e?.date ?? "").slice(0, 10)).filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    const last = dates.sort().at(-1);
    if (last && out.home.teamId === id) out.home.lastPlayed = last;
    if (last && out.away.teamId === id) out.away.lastPlayed = last;
  }
  if (Array.isArray(s.injuries)) {
    const outs = (id?: string) => {
      let n = 0;
      for (const block of s.injuries) {
        if (id && String(block?.team?.id ?? "") !== id) continue;
        for (const inj of block?.injuries ?? []) {
          const st = `${inj?.status ?? ""} ${inj?.type?.description ?? ""}`.toLowerCase();
          if (/\bout\b/.test(st)) n++;
        }
      }
      return n;
    };
    if (out.home.teamId) out.home.outs = outs(out.home.teamId);
    if (out.away.teamId) out.away.outs = outs(out.away.teamId);
  }

  out.pitchersConfirmed = !!(out.home.starter && out.away.starter);
  if (!out.home.starter || !out.away.starter) gaps.push("starters not yet posted by the league");
  if (!out.home.manager || !out.away.manager) gaps.push("head coach/manager feed unavailable for this league");
  if (!out.home.starter?.careerRecord && !out.away.starter?.careerRecord) gaps.push("career pitching lines unavailable");
  ingestSportsFeed([out.home, out.away].filter(s => s.longName).map(s => ({
    name: s.longName!, competition: league, colors: s.colors,
    // Location links describe the current home venue, not the road team's own stadium.
    stadium: s === out.home ? out.venue : undefined, city: s === out.home ? out.venueCity : undefined,
     people: [...(s.keyPlayers || []).map(p=>({name:p.full || p.common,date:p.dob,role:"player" as const,jersey:p.jersey,sourceUrl:p.sourceUrl})),
      s.owner ? {name:s.owner.full || s.owner.common,date:s.owner.dob,role:"owner" as const,sourceUrl:s.owner.sourceUrl} : null,
      s.starter ? { name: s.starter.full || s.starter.common, date: s.starter.dob, role: (league === "MLB" ? "pitcher" : league === "NFL" || league === "College Football" ? "quarterback" : "player") as "player" | "pitcher" | "quarterback", jersey: s.starter.jersey } : null,
       s.manager ? {name: s.manager.full || s.manager.common, date: s.manager.dob, role: "coach" as const, sourceUrl: s.manager.sourceUrl} : null].filter((p): p is NonNullable<typeof p> => p !== null),
  })));
  return out;
}
