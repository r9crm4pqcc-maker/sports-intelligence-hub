// @ts-nocheck
import { Button } from "@/components/ui/button";
import { ResearchReview } from "@/components/research-review";
import { useSportsResearch } from "@/lib/use-sports-research";
import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, RefreshCw, Loader2, AlertCircle, Calendar } from "lucide-react";
import { useLocation, useSearch } from "@/lib/wouter";
import { clearESPNGamesCache, fetchESPNGames, fetchFanDuelBoard, fetchOuts, getLeagueInfo, fetchFighterDob, type ESPNGame, type OddsBlock } from "@/lib/espn";
import { getTeamMeta } from "@/lib/sports-data";
import { getVerifiedSportsCatalogSnapshot, getLearnedLocationMeta, getLearnedPeopleForTeam, getLearnedTeamMeta, useSportsCatalog, normalizeSportsName, type SportsCatalogRecord } from "@/lib/sports-catalog";
import { fetchAutoMatchup, fetchInternationalLastFiveRecords, type AutoMatchup, type AutoPerson, type InternationalRecentRecords } from "@/lib/espn-auto";
import { layerWeights, setSportsMode, sportsMode, stepHitRates, outcomeFromScore, LEARNING_UPDATED_EVENT, type SportsMode } from "@/lib/sports-learning";
import { calcAthletePersonalDay } from "@/lib/numerology";
import { runVotes, TEAM_COLORS, fmt, colorNumsLabel, confidenceBand, chineseSign, learnedNumberRelation, numberRelation, type VoteResult } from "@/lib/vote-decode";
import { FullDecode, computeFullDecode, parseDob, type DecodeEntity } from "@/components/FullDecode";
import type { Tri } from "@/lib/full-decode";
import { useOverrides } from "@/lib/date-overrides";
import { buildMatchBrief, type MatchBrief, type Tone, type BriefEntity } from "@/lib/sports-brief";
import { buildStoryReading, type StoryReading } from "@/lib/sports-story-reading";
import { blendStoryPick, storyPushOn } from "@/lib/sports-story-blend";
import { cipherLine, type GematriaDecode, type GematriaSideRead } from "@/lib/sports-gematria";
import { decodeLearnedGematria } from "@/lib/learned-screenshot-signals";
import { venueLocalHour, venueTimeZone } from "@/lib/sports-cycles";
import { archivedOuts, buildSportsInput, withHistoricalNflStarters } from "@/lib/sports-matchup";
import type { VoteInput } from "@/lib/vote-decode";
import { GamePeopleEditor } from "@/components/game-people-editor";
import {
  applyPeopleOverrides,
  getGamePeopleOverride,
  saveGamePeopleOverride,
  seedOverridesFromInput,
  type GamePeopleOverride,
} from "@/lib/sports-people-overrides";
import { captureForwardPick, downloadForwardArchive, evaluateForward, findSavedForwardPrediction, FORWARD_UPDATED_EVENT, readForwardArchive, settleForwardGames } from "@/lib/sports-forward";
import { sportsWeightSnapshot } from "@/lib/sports-weights";
import { backupBetDecision, conventionalComparisons, decodeMarketUnderdog, readCurrentMarket } from "@/lib/backup-analysis";
import { INTERNATIONAL_SOCCER_LEAGUES } from "@/lib/sports-international";
import { SportsPageHeader } from "@/components/sports-page-header";
import { SportPicker, type SportPickerEntry } from "@/components/sport-picker";
import { bestSystemPlay } from "@/lib/sports-market";
import { BEST_SYSTEM_PLAY_UPDATED_EVENT, captureBestSystemPlay, findSavedBestSystemPlay, readBestSystemPlayArchive, settleBestSystemPlayGames } from "@/lib/sports-market-forward";
import { keyPersonRoleForLeague, preferredKeyPlayerForTeam } from "@/lib/sports-method-candidate";
import { centralDateParts, pregameGameForReplay } from "@/lib/sports-pregame-record";

const cap = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const autoMatchupCache = new Map<string, AutoMatchup>();
const internationalRecentRecordsCache = new Map<string, InternationalRecentRecords>();
let forwardArchiveErrorShown = false;
function savedLearnedReplay(league: string, gameId: string, status: string, mode: SportsMode) {
  if (status !== "post" || mode !== "learned") return null;
  try {
    const saved = findSavedForwardPrediction(league, gameId, "learned") ?? null;
    forwardArchiveErrorShown = false;
    return saved;
  } catch (error) {
    console.error("Saved pregame pick could not be read", error);
    if (!forwardArchiveErrorShown && typeof window !== "undefined") {
      forwardArchiveErrorShown = true;
      window.dispatchEvent(new CustomEvent(FORWARD_UPDATED_EVENT, {
        detail: "Saved pregame pick could not be read. Browser storage has not been replaced.",
      }));
    }
    return null;
  }
}
/** How often the better record won. Used only to allow a best pick, not to change the card percent or the pick. */
const RECORD_GAP_HIT: Record<number, number> = { 50: 97.2, 40: 87.8, 30: 82.3, 15: 68.5 };
function gapHit(votes: { side: string; reason: string }[], pick: "home" | "away") {
  const gap = votes.find((x) => /Better record gap (50|40|30|15)/.test(x.reason));
  const band = Number(gap?.reason.match(/Better record gap (\d+)/)?.[1]);
  const rate = RECORD_GAP_HIT[band];
  if (!gap || !rate || gap.side !== pick) return null;
  return rate;
}
function splitPct(home: number, away: number) {
  const h = Math.max(0, home), a = Math.max(0, away);
  const homePct = cap((100 * h) / (h + a || 1));
  return { homePct, awayPct: 100 - homePct };
}
const YELLOW = "hsl(var(--primary))";
const BLUE = "hsl(var(--foreground))";
const GREEN = "hsl(var(--primary))";
const ROSE = "hsl(var(--destructive))";
const PURPLE = "hsl(var(--muted-foreground))";

const US_LEAGUES = ["NBA", "NFL", "MLB", "NHL", "UFC", "WNBA", "College Football", "College Basketball"];
const SOCCER_LEAGUES = [
  "MLS", "Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Liga MX",
  "UCL", "UEL", "UECL", "World Cup", ...INTERNATIONAL_SOCCER_LEAGUES.map(({ key }) => key),
];
const LEAGUE_GROUPS = [
  { label: "US Sports", leagues: US_LEAGUES },
  { label: "Soccer", leagues: SOCCER_LEAGUES },
];
const ALL_LEAGUES = [...new Set(LEAGUE_GROUPS.flatMap((group) => group.leagues))];
const SPORT_PICKER_GROUPS = [
  { id: "MLB", label: "MLB", description: "Baseball slate, pitchers and lineup analysis", leagues: ["MLB"] },
  { id: "Soccer", label: "Soccer", description: "Senior club and international fixtures", leagues: SOCCER_LEAGUES },
  { id: "NBA", label: "NBA", description: "Basketball slate and key-player analysis", leagues: ["NBA"] },
  { id: "NFL", label: "NFL", description: "Football slate, coaches and quarterbacks", leagues: ["NFL"] },
  { id: "NHL", label: "NHL", description: "Hockey slate and goalie analysis", leagues: ["NHL"] },
  { id: "College Sports", label: "College Sports", description: "College football and college basketball", leagues: ["College Football", "College Basketball"] },
  { id: "More Sports", label: "More Sports", description: "Women’s basketball and UFC", leagues: ["WNBA", "UFC"] },
];

function sportForLeague(league: string | null) {
  if (!league) return null;
  return SPORT_PICKER_GROUPS.find((group) => group.leagues.includes(league))?.id ?? null;
}

const TONE_COLOR: Record<Tone, string> = {
  friend: "hsl(var(--primary))",
  enemy: "hsl(var(--destructive))",
  master: "hsl(var(--primary))",
  neutral: "hsl(var(--muted-foreground))",
  info: "hsl(var(--foreground))",
};

function kickLabel(iso?: string) {
  const t = new Date(iso || "");
  if (Number.isNaN(t.getTime())) return "";
  return t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " EST";
}

function Fold({ title, children, startOpen = false }: { title: string; children: React.ReactNode; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-3 py-2.5 text-left" style={{ background: "hsl(var(--muted))" }}>
        <span className="text-[11px] font-bold tracking-[0.14em] text-foreground">{title}</span>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>
      {open && <div className="p-3 border-t border-border">{children}</div>}
    </div>
  );
}

function BriefChunk({ brief, titles }: { brief: MatchBrief; titles: string[] }) {
  const want = new Set(titles.map((t) => t.toLowerCase()));
  const sections = [...brief.sections, ...brief.upgrades].filter((s) => want.has(s.title.toLowerCase()));
  if (!sections.length) return <p className="text-[11px] text-muted-foreground">Nothing on this layer for this game.</p>;
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-[10px] font-bold tracking-[0.12em] mb-1" style={{ color: YELLOW }}>{section.title.toUpperCase()}</p>
          <ul className="space-y-0.5">
            {section.lines.map((line, i) => (
              <li key={i} className="text-[11px]" style={{ color: TONE_COLOR[line.tone] }}>• {line.text}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

type BoardRow = { id: string; matchup: string; pick: string; pct: number; allow: number | null; open: boolean; venue: string; time: string; record: string; result: "hit" | "miss" | "push" | "open" };

/** One Story Reading per game, built from the same decode the card shows. */
function storyFor(full: ReturnType<typeof computeFullDecode>, v: VoteResult, game: ESPNGame, league: string, year: number, month: number, day: number, learnedRelation: boolean): StoryReading {
  return buildStoryReading({
    away: game.awayTeam, home: game.homeTeam, dateLabel: `${month}/${day}/${year}`, league, eventName: game.eventName,
    year, month, day, dayLp: full.ge.lp, secondary: full.ge.secondary, doyRoot: full.ge.doyRoot, woyRoot: full.ge.woyRoot,
    moonPhase: full.ge.moon.phase, yearSign: v.yearSign, monthSign: v.monthSign,
    relation: learnedRelation ? learnedNumberRelation : numberRelation,
    entities: full.reads.map((x) => ({
      side: x.e.side, kind: x.e.kind, name: x.e.name, role: x.e.role, date: x.e.date, record: x.e.record, streak: x.e.streak,
      colors: x.e.colors, jersey: x.e.jersey,
      read: x.r ? { lp: x.r.lp, py: x.r.py, pm: x.r.pm, pd: x.r.pd, pw: x.r.pw, ph: x.r.ph, hourKnown: x.r.hourKnown, lucky: x.r.lucky, today: x.r.matrix.today } : null,
    })),
  });
}

function StatusBadge({ status, detail }: { status: string; detail: string }) {
  if (status === "in") return <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))" }}>LIVE</span>;
  if (status === "post") return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--primary) / 0.12)", color: GREEN }}>FINAL</span>;
  return <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>{detail || "Scheduled"}</span>;
}

function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "primary" | "danger" }) {
  const cls = tone === "primary" ? "bg-primary/15 text-primary border-primary/30" : tone === "danger" ? "bg-destructive/15 text-destructive border-destructive/40" : "bg-muted text-muted-foreground border-border";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{children}</span>;
}

function GematriaSideBlock({ read }: { read: GematriaSideRead }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-sm font-black text-foreground mb-1">{read.team}</p>
      <ul className="space-y-1 mb-2">
        {read.names.map((row) => (
          <li key={`${row.role}-${row.name}`} className="text-[11px] text-foreground">
            <span className="text-muted-foreground">{row.role} · {row.name}</span>
            <br />
            <span className="font-semibold">{cipherLine(row.ciphers)}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-foreground"><span className="font-bold">Hits:</span> {read.hits.length ? read.hits.join("; ") : "none"}</p>
      <p className="text-[11px] text-foreground"><span className="font-bold">Score:</span> {read.score >= 0 ? `+${read.score}` : read.score}</p>
      <p className="text-[10px] text-muted-foreground">{read.parts}</p>
    </div>
  );
}

function GematriaBlock({ data }: { data: GematriaDecode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold tracking-[0.16em]" style={{ color: PURPLE }}>{data.title.toUpperCase()}</p>
      <p className="text-[10px] text-muted-foreground">{data.dateLabel}. Five ciphers in the requested order; Learned uses this only as low-priority supporting evidence.</p>
      <ul className="text-[10px] text-muted-foreground grid sm:grid-cols-2 gap-x-3">{data.dateCalculations.map(row=><li key={row.label}>{row.label}: <b>{row.value}</b></li>)}</ul>
      <div className="grid md:grid-cols-2 gap-2">
        <GematriaSideBlock read={data.away} />
        <GematriaSideBlock read={data.home} />
      </div>
      <p className="text-[12px] font-bold text-foreground">Clash: {data.clash ? "Yes" : "No"}{data.clash ? ` — ${data.clashNote.replace(/^Yes — /, "")}` : ""}</p>
      <p className="text-[10px] text-muted-foreground">Clash compares full Ordinal and Reverse totals. A shared single-digit reduction is not a clash.</p>
      <p className="text-[12px] font-bold" style={{ color: data.ignored ? "hsl(var(--muted-foreground))" : PURPLE }}>Net Gematria Edge: {data.edge}</p>
      <p className="text-[11px] text-foreground">{data.decision}</p>
    </div>
  );
}

function predictionTeamMeta(name: string, learned: boolean, catalog: SportsCatalogRecord[], league: string) {
  return learned ? getLearnedTeamMeta(name, catalog, league) : getTeamMeta(name);
}
function predictionVenue(game: ESPNGame, homeMeta: any, catalog: SportsCatalogRecord[], learned: boolean) {
  if (!learned) {
    return {
      city: homeMeta?.city,
      cityFounded: homeMeta?.cityFounded,
      stadium: homeMeta?.stadium,
      stadiumOpened: homeMeta?.stadiumOpened,
    };
  }
  const neutralSite = game.neutralSite === true;
  const stadiumName = game.venue ?? (neutralSite ? "" : homeMeta?.stadium) ?? "";
  const stadium = stadiumName ? getLearnedLocationMeta("stadium", stadiumName, catalog) : undefined;
  const city = stadium?.cityId
    ? catalog.find((record) => record.id === stadium.cityId && record.kind === "city")
    : undefined;
  const feedCity = game.venueCity
    ? catalog.find((record) => record.kind === "city" && normalizeSportsName(record.name) === normalizeSportsName(game.venueCity!))
    : undefined;
  const useHomeVenueDate = !neutralSite && (!game.venue || normalizeSportsName(game.venue) === normalizeSportsName(homeMeta?.stadium ?? ""));
  return {
    city: city?.name ?? feedCity?.name ?? game.venueCity ?? (neutralSite ? undefined : homeMeta?.city),
    cityFounded: city?.date ? parseTuple(city.date) : feedCity?.date ? parseTuple(feedCity.date) : (neutralSite ? undefined : homeMeta?.cityFounded),
    stadium: stadium?.name ?? game.venue ?? (neutralSite ? undefined : homeMeta?.stadium),
    stadiumOpened: stadium?.date ?? (useHomeVenueDate ? homeMeta?.stadiumOpened : undefined),
  };
}
function parseTuple(value?: string | null) {
  if (!value) return undefined;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  return [+match[1], +match[2], +match[3]] as [number, number, number];
}
function catalogVotePeople(name: string, feed: any[], catalog: SportsCatalogRecord[], learned: boolean) {
  if (!learned) return feed;
  const byName = new Map<string, any>();
  for (const person of feed) byName.set(normalizeSportsName(person.name), person);
  const roleMap: Record<string, string> = { pitcher: "pitcher", quarterback: "quarterback", goalie: "goalie", manager: "manager", coach: "coach", player: "player", owner: "owner", staff: "staff" };
  for (const person of getLearnedPeopleForTeam(name, catalog)) {
    const role = person.roles.map((item) => roleMap[item]).find(Boolean);
    if (!role) continue;
    const key = normalizeSportsName(person.name);
    const current = byName.get(key);
    byName.set(key, {
      name: current?.name ?? person.name,
      role: current?.role ?? role,
      dob: parseTuple(person.date) ? person.date : current?.dob,
      jersey: person.jersey || current?.jersey,
    });
  }
  return [...byName.values()];
}
function catalogDecodePeople(
  teamName: string,
  side: "home" | "away",
  autoSide: any,
  catalog: SportsCatalogRecord[],
  leaders: string[] = [],
  outNames: string[] = [],
  starterRole = "player",
  candidateMethod = false,
  pregame = false,
  league = "",
) {
  const catalogPeople = getLearnedPeopleForTeam(teamName, catalog);
  const samePerson = (a: string, b: string) => {
    const left = normalizeSportsName(a), right = normalizeSportsName(b);
    return !!left && !!right && (left === right || (Math.min(left.length, right.length) >= 5 && (left.includes(right) || right.includes(left))));
  };
  const isOut = (candidate: string) => outNames.some(out => samePerson(candidate, out));
  const catalogMatch = (candidate: string, role: RegExp) =>
    catalogPeople.find(person => role.test(person.roles.join(" ")) && samePerson(person.name, candidate));
  const asEntity = (person: any, role: string, fallbackName: string) => {
    const name = person?.common ?? person?.name ?? fallbackName;
    const stored = person?.name ? person : catalogMatch(name, /player|pitcher|quarterback|coach|manager|owner|staff/i);
    return {
      kind: "player" as const,
      side,
      name,
      role,
      date: parseDob(person?.dob ?? stored?.date ?? undefined),
      dateSourceUrl: person?.sourceUrl ?? stored?.sourceUrl,
      jersey: person?.jersey || stored?.jersey || undefined,
      unavailable: !person && !stored,
    };
  };
  const knownListedKeyPlayer = candidateMethod
    ? preferredKeyPlayerForTeam(teamName, league)
    : undefined;
  const providerLeader = candidateMethod && pregame && starterRole === "player" ? leaders[0] : undefined;
  const preferredName = knownListedKeyPlayer || providerLeader;
  const preferredRosterEntry = preferredName
    ? autoSide?.keyPlayers?.find(person => samePerson(person.common, preferredName))
    : undefined;
  const positionMatch = (person: any) => {
    if (starterRole === "quarterback") return /^(QB|quarterback)$/i.test(person.position || "");
    if (starterRole === "pitcher") return /^(P|SP|starting pitcher|pitcher)$/i.test(person.position || "") || person === autoSide?.starter && person.confirmedStarter === true;
    if (starterRole === "goalie") return /^(G|GK|goalie|goaltender)$/i.test(person.position || "") || person === autoSide?.starter && person.confirmedStarter === true;
    return false;
  };
  const playerCandidates = candidateMethod
    ? [
        ...(preferredName ? [{ ...(preferredRosterEntry || {}), common: preferredName, role: starterRole }] : []),
        ...(autoSide?.starter && positionMatch(autoSide.starter) ? [{ ...autoSide.starter, role: starterRole }] : []),
        ...(autoSide?.keyPlayers ?? []).filter(positionMatch),
      ]
    : [
        ...(autoSide?.starter ? [{ ...autoSide.starter, role: starterRole }] : []),
        ...(autoSide?.keyPlayers ?? []),
        ...leaders.map(common => ({ common })),
        ...catalogPeople
          .filter(person => person.roles.some(role => /player|pitcher|quarterback|goalie/i.test(role)))
          .map(person => ({ name: person.name, dob: person.date, jersey: person.jersey })),
      ];
  const seen = new Set<string>();
  const keyPlayer = playerCandidates.find(person => {
    const candidate = person.common ?? person.name ?? "";
    const key = normalizeSportsName(candidate);
    if (!key || seen.has(key) || isOut(candidate)) return false;
    seen.add(key);
    return true;
  });
  const keyName = keyPlayer?.common ?? keyPlayer?.name ?? "Key player not in verified source";
  const keyData = keyPlayer
    ? { ...keyPlayer, ...catalogMatch(keyName, /player|pitcher|quarterback|goalie/i) }
    : null;
  const keyRoleLabel = starterRole === "quarterback"
    ? "starting quarterback"
    : starterRole === "pitcher"
      ? "starting pitcher"
      : starterRole === "goalie"
        ? "starting goalie"
        : "key player";
  const coach = autoSide?.manager ?? catalogPeople
    .filter(person => person.roles.some(role => /coach|manager/i.test(role)))
    .map(person => ({ name: person.name, dob: person.date, jersey: person.jersey }))[0];
  const owner = autoSide?.owner ?? catalogPeople
    .filter(person => person.roles.some(role => /owner/i.test(role)))
    .map(person => ({ name: person.name, dob: person.date, jersey: person.jersey }))[0];
  return [
    asEntity(keyData, `${keyRoleLabel} · assumed starting unless listed out`, keyName),
    asEntity(coach, "coach/manager", "Coach not in verified source"),
    asEntity(owner, "owner", "Owner not in verified source"),
  ];
}
function slateLeg(game: ESPNGame, year: number, month: number, day: number, league: string, ov: ReturnType<typeof useOverrides>, learned = false, catalog: SportsCatalogRecord[] = [], codeMode: SportsMode = "learned") {
  const analysisGame = pregameGameForReplay(game, learned && codeMode === "learned");
  const scoringCatalog = learned && game.status === "post" ? getVerifiedSportsCatalogSnapshot(catalog) : catalog;
  const saved = learned ? savedLearnedReplay(league, game.id, game.status, codeMode) : null;
  const homeMeta = predictionTeamMeta(game.homeTeam, learned, scoringCatalog, league);
  const awayMeta = predictionTeamMeta(game.awayTeam, learned, scoringCatalog, league);
  const venue = predictionVenue(game, homeMeta, scoringCatalog, learned);
  const t = new Date(game.startTime);
  const kickoff = venueLocalHour(game.startTime, venue.city, venue.stadium);
  const side = (name: string, meta: ReturnType<typeof getTeamMeta>, rec?: string | null) => ({
    name,
    founded: meta?.founded ? [meta.founded[0], meta.founded[1], meta.founded[2]] as [number, number, number] : undefined,
    colors: learned ? meta?.colors : TEAM_COLORS[name],
    record: rec ?? undefined,
    people: catalogVotePeople(name, [], scoringCatalog, learned),
  });
  const currentInput = withHistoricalNflStarters(
    buildSportsInput(analysisGame, year, month, day, league, scoringCatalog, null, {}, {}, codeMode),
    game,
  );
  const replayInput = saved?.input ? withHistoricalNflStarters(saved.input, game) : currentInput;
  const v = runVotes(learned ? replayInput : {
    year, month, day, league, eventName: game.eventName, hour: kickoff,
    home: side(game.homeTeam, homeMeta, game.homeRecord),
    away: side(game.awayTeam, awayMeta, game.awayRecord),
    stadiumOpened: venue.stadiumOpened, cityFounded: venue.cityFounded,
    stadium: venue.stadium, city: venue.city,
  });
  const tri = (d?: readonly number[]) => (d ? [d[0], d[1], d[2]] as Tri : undefined);
  const full = computeFullDecode([
    { kind: "team", side: "away", name: game.awayTeam, date: tri(awayMeta?.founded), record: analysisGame.awayRecord },
    ...(replayInput.away.people ?? []).map((person) => ({
      kind: "player" as const, side: "away" as const, name: person.name, role: person.role,
      date: parseDob(person.dob), jersey: person.jersey, dateSourceUrl: person.dateSourceUrl,
      lineupSourceUrl: person.lineupSourceUrl, lineupSourceUpdated: person.lineupSourceUpdated,
    })),
    { kind: "team", side: "home", name: game.homeTeam, date: tri(homeMeta?.founded), record: analysisGame.homeRecord },
    ...(replayInput.home.people ?? []).map((person) => ({
      kind: "player" as const, side: "home" as const, name: person.name, role: person.role,
      date: parseDob(person.dob), jersey: person.jersey, dateSourceUrl: person.dateSourceUrl,
      lineupSourceUrl: person.lineupSourceUrl, lineupSourceUpdated: person.lineupSourceUpdated,
    })),
    { kind: "city", side: "venue", name: (learned ? venue.city : homeMeta?.city) ?? "Host city", date: tri(learned ? venue.cityFounded : homeMeta?.cityFounded) },
    { kind: "stadium", side: "venue", name: (learned ? venue.stadium : game.venue ?? homeMeta?.stadium) ?? "Stadium", date: tri(learned ? venue.stadiumOpened : homeMeta?.stadiumOpened) },
  ], [year, month, day], kickoff, learned ? {} : ov, game.startTime, venueTimeZone(venue.city, venue.stadium), learned && codeMode === "learned");
  const rawHome = v.home + full.home, rawAway = v.away + full.away;
  const totalHome = learned ? v.home : rawHome, totalAway = learned ? v.away : rawAway;
  const basePick: "home" | "away" = totalHome === totalAway ? v.pick : totalHome > totalAway ? "home" : "away";
  const learnedStory = learned && codeMode === "learned" && storyPushOn(league);
  const finalPick: "home" | "away" = learnedStory
    ? blendStoryPick(league, { home: totalHome, away: totalAway, pick: basePick }, storyFor(full, v, game, league, year, month, day, true)).pick
    : basePick;
  const pile = totalHome + totalAway || 1;
  const split = splitPct(totalHome, totalAway);
  const pct = learned ? v.confidence : (finalPick === "home" ? split.homePct : split.awayPct);
  const allow = gapHit(v.votes, finalPick);
  const hs = Number(game.homeScore), as = Number(game.awayScore);
  const scored = game.status === "post" && Number.isFinite(hs) && Number.isFinite(as);
  const result: "hit" | "miss" | "push" | "open" = !scored ? "open" : hs === as ? "push" : (hs > as ? "home" : "away") === finalPick ? "hit" : "miss";
  const backupReplayDecision = backupBetDecision({
    // Completed games are evaluated as if the prediction were made pregame.
    // Live games are not retroactively treated as actionable picks.
    gameStatus: game.status === "post" ? "pre" : game.status,
    meetsSystemThreshold: isBest(pct, allow),
    audit: v.audit,
  });
  return {
    id: `${league}-${game.id}`,
    league,
    pick: finalPick === "home" ? game.homeTeam : game.awayTeam,
    pct,
    allow,
    result,
    open: game.status !== "post",
    backupDecision: backupReplayDecision,
    matchup: `${game.awayTeam} vs ${game.homeTeam}`,
  };
}

function fanDuelFor(board: Record<string, OddsBlock>, away: string, home: string): OddsBlock | null {
  const a = board[away];
  const h = board[home];
  if (!a && !h) return null;
  return {
    book: "FanDuel",
    moneylineAway: a?.moneylineHome || "",
    moneylineHome: h?.moneylineHome || "",
    spreadAway: a?.spreadHome || "",
    spreadHome: h?.spreadHome || "",
    overUnder: a?.overUnder || h?.overUnder || "",
  };
}
function isBest(pct: number, allow: number | null) {
  return pct >= 75 || (allow != null && allow >= 75);
}
function bestLegs(legs: { pct: number; allow: number | null; open: boolean }[]) {
  // Once a slate has started or finished, still show the day's best parlay (graded).
  const live = legs.filter((l) => l.open);
  const open = (live.length ? live : legs).slice().sort((a, b) => (b.allow ?? b.pct) - (a.allow ?? a.pct));
  const hot = open.filter((l) => isBest(l.pct, l.allow));
  return (hot.length >= 2 ? hot : open).slice(0, 4);
}

const GameCard = memo(function GameCard({ game, year, month, day, idx, league, learned, codeMode, learningRevision, refreshRevision, onReady, prices, outs, catalog }: { game: ESPNGame; year: number; month: number; day: number; idx: number; league: string; learned: boolean; codeMode: SportsMode; learningRevision: number; refreshRevision: number; onReady?: (row: BoardRow) => void; prices: Record<string, OddsBlock>; outs: Record<string, string[]>; catalog: SportsCatalogRecord[] }) {
  const autoKey = `${league}:${game.id}:${codeMode}`;
  const isFight = league === "UFC";
  const isInternationalSoccer = INTERNATIONAL_SOCCER_LEAGUES.some((item) => item.key === league);
  const scoringCatalog = learned && game.status === "post" ? getVerifiedSportsCatalogSnapshot(catalog) : catalog;
  const analysisGame = useMemo(
    () => pregameGameForReplay(game, learned && codeMode === "learned"),
    [game, year, month, day, learned, codeMode],
  );
  const savedLearnedPrediction = useMemo(
    () => savedLearnedReplay(league, game.id, game.status, codeMode),
    [codeMode, game.id, game.status, league],
  );
  // Finished games must be scored from their saved pregame inputs; fetching
  // current matchup data would rewrite the historical pick after the result.
  const useMatchupFeed = !isFight && game.status !== "post";
  const [auto, setAuto] = useState<AutoMatchup | null>(() => useMatchupFeed ? autoMatchupCache.get(autoKey) ?? null : null);
  const [autoLoading, setAutoLoading] = useState(() => useMatchupFeed && !autoMatchupCache.has(autoKey));
  const overrideKey = `${league}:${year}-${month}-${day}:${game.awayTeam}@${game.homeTeam}`;
  const [peopleOverride, setPeopleOverride] = useState<GamePeopleOverride | null>(() => getGamePeopleOverride(overrideKey));
  const [openPeopleEditor, setOpenPeopleEditor] = useState(false);
  const [historicalRecent, setHistoricalRecent] = useState<InternationalRecentRecords | null>(
    () => isInternationalSoccer && game.status === "post"
      ? internationalRecentRecordsCache.get(autoKey) ?? null
      : null,
  );
  const [openDecode, setOpenDecode] = useState(false);
  const [dobs, setDobs] = useState<{ home?: string; away?: string }>({});
  const [savedMarket, setSavedMarket] = useState(() => {
    try { return findSavedBestSystemPlay(league, game.id); } catch { return null; }
  });
  const [marketStorageError, setMarketStorageError] = useState("");
  useEffect(() => {
    if (!isFight) return;
    let alive = true;
    Promise.all([fetchFighterDob(game.homeTeamId), fetchFighterDob(game.awayTeamId)]).then(([h, a]) => { if (alive) { setDobs({ home: h, away: a }); setAutoLoading(false); } });
    return () => { alive = false; };
  }, [game.id, isFight]);
  useEffect(() => {
    if (!useMatchupFeed) {
      setAuto(null);
      setAutoLoading(false);
      return;
    }
    let alive = true;
    const cached = autoMatchupCache.get(autoKey);
    if (cached) {
      setAuto(cached);
      setAutoLoading(false);
      return () => { alive = false; };
    }
    setAutoLoading(true);
    fetchAutoMatchup(league, game.id, codeMode === "learned")
      .then(a => { if (alive) { autoMatchupCache.set(autoKey, a); setAuto(a); setAutoLoading(false); } })
      .catch(() => { if (alive) setAutoLoading(false); });
    return () => { alive = false; };
  }, [autoKey, game.id, league, refreshRevision, useMatchupFeed]);
  useEffect(() => {
    if (!isInternationalSoccer || game.status !== "post") {
      setHistoricalRecent(null);
      return;
    }
    let alive = true;
    const cached = internationalRecentRecordsCache.get(autoKey);
    if (cached) {
      setHistoricalRecent(cached);
      return () => { alive = false; };
    }
    fetchInternationalLastFiveRecords(league, game.id)
      .then((records) => {
        internationalRecentRecordsCache.set(autoKey, records);
        if (alive) setHistoricalRecent(records);
      })
      .catch(() => {
        if (alive) setHistoricalRecent({});
      });
    return () => { alive = false; };
  }, [autoKey, game.id, game.status, isInternationalSoccer, league]);

  const homeMeta = useMemo(() => predictionTeamMeta(game.homeTeam, learned, scoringCatalog, league), [game.homeTeam, learned, scoringCatalog, league]);
  const awayMeta = useMemo(() => predictionTeamMeta(game.awayTeam, learned, scoringCatalog, league), [game.awayTeam, learned, scoringCatalog, league]);
  const venueMeta = useMemo(() => predictionVenue(game, homeMeta, scoringCatalog, learned), [game.venue, game.venueCity, game.neutralSite, homeMeta, scoringCatalog, learned]);
  const starterRole = codeMode === "learned"
    ? keyPersonRoleForLeague(league) ?? "player"
    : league === "NFL" || league === "College Football"
      ? "quarterback"
      : league === "MLB"
        ? "pitcher"
        : "player";
  const kickoff = useMemo(() => venueLocalHour(game.startTime, venueMeta.city || auto?.venueCity, venueMeta.stadium || game.venue), [game.startTime, venueMeta.city, venueMeta.stadium, auto?.venueCity, game.venue]);
  const kickoffZone = useMemo(() => venueTimeZone(venueMeta.city || auto?.venueCity, venueMeta.stadium || game.venue), [venueMeta.city, venueMeta.stadium, auto?.venueCity, game.venue]);
  const basePredictionInput = useMemo<VoteInput>(() => {
    if (learned) return savedLearnedPrediction?.input
      ? withHistoricalNflStarters(savedLearnedPrediction.input, game)
      : withHistoricalNflStarters(
          buildSportsInput(analysisGame, year, month, day, league, scoringCatalog, auto, outs, dobs, codeMode),
          game,
        );
    const person = (p: any, role: any) => p?.common ? [{ name: p.common, role, dob: p.dob, jersey: p.jersey }] : [];
    const daysSince = (iso?: string) => {
      if (!iso) return undefined;
      const [y, m, d] = iso.split("-").map(Number);
      if (!y || !m || !d) return undefined;
      const diff = Math.round((Date.UTC(year, month - 1, day) - Date.UTC(y, m - 1, d)) / 86400000);
      return diff >= 0 && diff < 40 ? diff : undefined;
    };
    const team = (name: string, meta: any, side: any, rec?: string | null, h2h?: number) => ({
      name, founded: meta?.founded ? [meta.founded[0], meta.founded[1], meta.founded[2]] as [number, number, number] : undefined,
      shortName: side?.shortName && normalizeSportsName(side.shortName) !== normalizeSportsName(name)
        ? side.shortName
        : (name === game.homeTeam ? game.homeAbbr : game.awayAbbr) || undefined,
      colors: learned ? meta?.colors : TEAM_COLORS[name], record: side?.record ?? rec ?? undefined,
      form: side?.last10, splitHome: side?.homeRecord, splitRoad: side?.roadRecord,
      rest: daysSince(side?.lastPlayed), outs: outs[name]?.length ?? side?.outs, h2hWins: h2h,
      people: catalogVotePeople(name, [...person(side?.starter, starterRole), ...person(side?.manager, "coach")], scoringCatalog, learned),
      gematriaPeople: (side?.keyPlayers ?? []).map((player: AutoPerson) => ({
        name: player.common, role: "player" as const, dob: player.dob, jersey: player.jersey,
      })),
    });
    if (isFight) {
      const dt = (d?: string) => { const m = d?.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? [+m[1], +m[2], +m[3]] as [number, number, number] : undefined; };
      return { year, month, day, league, eventName: game.eventName, individual: true, hour: kickoff,
        home: { name: game.homeTeam, founded: dt(dobs.home), record: game.homeRecord, people: [] },
        away: { name: game.awayTeam, founded: dt(dobs.away), record: game.awayRecord, people: [] },
        region: game.venueRegion || game.venueCountry || auto?.venueState || undefined,
        city: venueMeta.city || game.venueCity || auto?.venueCity || undefined,
        stadium: venueMeta.stadium || game.venue || auto?.venue || undefined };
    }
    return {
      year, month, day, league, eventName: game.eventName, hour: kickoff,
      home: team(game.homeTeam, homeMeta, auto?.home, game.homeRecord, auto?.homeH2hWins),
      away: team(game.awayTeam, awayMeta, auto?.away, game.awayRecord, auto?.awayH2hWins),
      region: game.venueRegion || game.venueCountry || auto?.venueState || undefined,
      stadiumOpened: venueMeta.stadiumOpened, cityFounded: venueMeta.cityFounded,
      stadium: venueMeta.stadium, city: venueMeta.city,
    };
  }, [analysisGame, game, year, month, day, auto, outs, league, dobs, kickoff, learned, codeMode, scoringCatalog, learningRevision, savedLearnedPrediction]);
  const researched = useSportsResearch(basePredictionInput, !autoLoading);
  const predictionInput = useMemo<VoteInput>(
    () => applyPeopleOverrides(researched.input, peopleOverride),
    [researched.input, peopleOverride],
  );
  const editorPeopleValue = useMemo<GamePeopleOverride>(
    () => peopleOverride ?? {
      away: seedOverridesFromInput(researched.input.away.people),
      home: seedOverridesFromInput(researched.input.home.people),
    },
    [peopleOverride, researched.input],
  );
  const handlePeopleOverrideChange = (next: GamePeopleOverride) => {
    try { saveGamePeopleOverride(overrideKey, next); setPeopleOverride(next); } catch (error) { window.alert(error instanceof Error ? error.message : "Changes could not be saved."); }
  };
  const handlePeopleOverrideReset = () => {
    setPeopleOverride(null);
    saveGamePeopleOverride(overrideKey, null);
  };
  const recalculatedVotes = useMemo(() => runVotes(predictionInput), [predictionInput]);
  // Dev-only: expose replay inputs so weight tuning can use the exact app inputs.
  if (import.meta.env.DEV && typeof window !== "undefined" && game.status === "post") {
    const w = window as unknown as { __lcReplay?: Record<string, unknown> };
    (w.__lcReplay ??= {})[`${league}|${game.id}`] = { league, id: game.id, input: predictionInput, game: { startTime: game.startTime, homeScore: game.homeScore, awayScore: game.awayScore, homeTeam: game.homeTeam, awayTeam: game.awayTeam } };
  }
  const v = codeMode === "learned" ? recalculatedVotes : savedLearnedPrediction?.output ?? recalculatedVotes;
  // Older frozen picks may predate the audit shape; keep the pick immutable,
  // but use the current calculated audit wherever a presentational audit is needed.
  const effectiveAudit = v.audit ?? recalculatedVotes.audit;
  const ov = useOverrides();
  const full = useMemo(() => {
    const tri = (t?: readonly number[] | string) => typeof t === "string" ? parseDob(t) : t?.length === 3 ? [t[0], t[1], t[2]] as Tri : undefined;
    const teamEntity = (side: "home" | "away"): DecodeEntity[] => {
      const team = predictionInput[side];
      // 1v1 sports: fighter and coach only — never an owner.
      if (isFight) {
        const coach = getLearnedPeopleForTeam(team.name).find((row) => row.roles.some((role) => /coach/i.test(role)));
        return [
          { kind: "player", side, name: team.name, role: "fighter", date: tri(team.founded), record: team.record },
          { kind: "player", side, name: coach?.name ?? `${team.name} coach (not in verified source)`, role: "coach", date: parseDob(coach?.date ?? undefined) },
        ];
      }
      const other = predictionInput[side === "home" ? "away" : "home"];
      const h2h = team.h2hWins != null && other.h2hWins != null ? `${team.h2hWins}-${other.h2hWins}` : undefined;
      return [
        {
          kind: "team", side, name: team.name, date: tri(team.founded), colors: team.colors,
          record: team.record, streak: team.streak, h2h,
          homeRecord: team.splitHome, awayRecord: team.splitRoad,
        },
        ...(team.people ?? []).map((person) => ({
          kind: "player" as const, side, name: person.name, role: person.role,
          date: parseDob(person.dob), jersey: person.jersey,
          dateSourceUrl: person.dateSourceUrl,
          lineupSourceUrl: person.lineupSourceUrl,
          lineupSourceUpdated: person.lineupSourceUpdated,
        })),
      ];
    };
    const ents: DecodeEntity[] = [
      ...teamEntity("away"),
      ...teamEntity("home"),
      ...(!isFight ? [
        { kind: "city" as const, side: "venue" as const, name: predictionInput.city ?? "Host city", date: tri(predictionInput.cityFounded) },
        { kind: "stadium" as const, side: "venue" as const, name: predictionInput.stadium ?? game.venue ?? "Stadium", date: tri(predictionInput.stadiumOpened) },
      ] : []),
    ];
    return computeFullDecode(
      ents, [predictionInput.year, predictionInput.month, predictionInput.day],
      predictionInput.hour ?? kickoff, learned ? {} : ov,
      predictionInput.gameStartTime ?? game.startTime,
      predictionInput.venueTimeZone ?? kickoffZone,
      learned && codeMode === "learned",
    );
  }, [predictionInput, game, kickoff, kickoffZone, isFight, ov, learned, codeMode]);

  const rawHome = v.home + full.home, rawAway = v.away + full.away;
  const totalHome = learned ? v.home : rawHome, totalAway = learned ? v.away : rawAway;
  const recalculatedPick: "home" | "away" = totalHome === totalAway ? v.pick : totalHome > totalAway ? "home" : "away";
  // The reading method quietly pushes Learned Code only in sports where it raised saved-game hits; nothing about it is shown.
  const story = useMemo(() => learned && codeMode === "learned" && storyPushOn(league) ? storyFor(full, v, game, league, year, month, day, true) : null,
    [full, v, game, league, year, month, day, learned, codeMode]);
  const blended = blendStoryPick(league, { home: totalHome, away: totalAway, pick: recalculatedPick }, story);
  const finalPick: "home" | "away" = codeMode === "learned" ? blended.pick : savedLearnedPrediction?.pick ?? recalculatedPick;
  const pickName = finalPick === "home" ? game.homeTeam : game.awayTeam;
  const brief = useMemo(() => {
    const signOf = (name: string) => v.entities.find((e) => e.name === name)?.yearSign;
    const mapped: BriefEntity[] = full.reads.map((x) => ({
      side: x.e.side, kind: x.e.kind, name: x.e.name, role: x.e.role, jersey: x.e.jersey, date: x.e.date,
      yearSign: x.r ? chineseSign(x.r.date[0]) : signOf(x.e.name), lp: x.r?.lp, pd: x.r?.pd, py:x.r?.py,pm:x.r?.pm,pw:x.r?.pw,ph:x.r?.hourKnown ? x.r.ph : undefined,
      lucky: x.r?.lucky, matrix: x.r?.matrix,recordStats:x.e.kind==="team" ? {record:x.e.record,streak:x.e.streak,h2h:x.e.h2h,home:x.e.homeRecord,away:x.e.awayRecord}:undefined,
    }));
    return buildMatchBrief(v, mapped, { home: game.homeTeam, away: game.awayTeam, month });
  }, [v, full, game.homeTeam, game.awayTeam, month]);

  const gem = useMemo(() => decodeLearnedGematria(predictionInput), [predictionInput]);
  const stackGap = Math.abs(totalHome - totalAway);
  const split = splitPct(totalHome, totalAway);
  const homePct = split.homePct;
  const awayPct = split.awayPct;
  const pickPct = cap(learned ? v.confidence : (finalPick === "home" ? homePct : awayPct));
  const allow = gapHit(v.votes, finalPick);
  const isFinal = game.status === "post";
  const outcome = isFinal ? outcomeFromScore(Number(game.homeScore), Number(game.awayScore)) : null;
  const hit = outcome && outcome !== "draw" ? outcome === finalPick : null;
  const cardPickName = pickName;
  const verdict = codeMode === "backup"
    ? `DECODE PICK ${pickName}. Vote share only — not a win-probability estimate. ${game.awayTeam} ${awayPct}% · ${game.homeTeam} ${homePct}%.`
    : `PICK ${pickName}. ${game.awayTeam} ${awayPct}% · ${game.homeTeam} ${homePct}%.`;
  const learnedResultLabel = outcome === "draw"
    ? "PUSH"
    : hit === null
      ? "RESULT UNAVAILABLE"
      : hit ? "HIT" : "MISS";
  const venueName = learned ? venueMeta.stadium ?? game.venue ?? "Venue" : game.venue ?? homeMeta?.stadium ?? "Venue";
  const when = kickLabel(game.startTime);

  useEffect(() => {
    if (autoLoading) return;
    try {
      if (codeMode !== "learned") return;
      captureForwardPick(game, "learned", predictionInput, v,
        { home: full.home, away: full.away, snapshot: { decode: full, overrides: learned ? {} : ov } }, finalPick);
    } catch (error) {
      console.error("Pre-game prediction could not be saved", error);
      window.dispatchEvent(new CustomEvent(FORWARD_UPDATED_EVENT, { detail: "Pre-game prediction could not be saved. Export or check browser storage before relying on forward totals." }));
    }
  }, [autoLoading, game, learned, codeMode, predictionInput, v, full, ov, finalPick]);

  useEffect(() => {
    // Keep the last completed forecast for this date/league while the card
    // reloads its matchup facts. Publishing the initial empty-feed prediction
    // here made historical hit/miss totals change every time a sport tab was
    // revisited.
    if (autoLoading) return;
    onReady?.({
      id: `${league}-${game.id}`,
      matchup: `${game.awayTeam} vs ${game.homeTeam}`,
      pick: pickName,
      pct: pickPct,
      allow,
      open: game.status !== "post",
      venue: venueName,
      time: when,
      record: `${game.awayAbbr} ${game.awayRecord || "—"} · ${game.homeAbbr} ${game.homeRecord || "—"}`,
      result: !isFinal ? "open" : !outcome || outcome === "draw" ? "push" : outcome === finalPick ? "hit" : "miss",
    });
  }, [autoLoading, league, game.id, pickName, pickPct, allow, game.status, outcome, finalPick, venueName, when, onReady]);

  const result = isFinal ? learnedResultLabel : null;
  const qualified = isBest(pickPct, allow);
  const fd = fanDuelFor(prices, game.awayTeam, game.homeTeam);
  const hasLines = (value?: OddsBlock | null) => Boolean(value && (
    value.moneylineHome || value.moneylineAway || value.spreadHome || value.spreadAway || value.overUnder
  ));
  const book = hasLines(fd) ? fd : hasLines(game.odds) ? game.odds : null;
  const marketPlay = codeMode === "learned" && game.status !== "in" ? bestSystemPlay({
    game,
    // Do not mistake live/closing prices for the pregame line. The archive
    // does not contain saved historical spread/total prices.
    odds: game.status === "pre" ? book : null,
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    learnedPick: finalPick,
    voteHome: v.home,
    voteAway: v.away,
  }) : null;
  const marketPlayKey = marketPlay?.isPlay
    ? `${marketPlay.market}|${marketPlay.selection}|${JSON.stringify(marketPlay.terms)}`
    : "";
  const selectedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  useEffect(() => {
    const pullSavedMarket = (event?: Event) => {
      try {
        setSavedMarket(findSavedBestSystemPlay(league, game.id));
        if (!(event instanceof CustomEvent && event.detail)) setMarketStorageError("");
        else setMarketStorageError(String(event.detail));
      } catch {
        setMarketStorageError("Saved Best System Play records could not be read from this browser.");
      }
    };
    pullSavedMarket();
    window.addEventListener(BEST_SYSTEM_PLAY_UPDATED_EVENT, pullSavedMarket);
    window.addEventListener("storage", pullSavedMarket);
    return () => {
      window.removeEventListener(BEST_SYSTEM_PLAY_UPDATED_EVENT, pullSavedMarket);
      window.removeEventListener("storage", pullSavedMarket);
    };
  }, [game.id, league]);
  useEffect(() => {
    if (autoLoading || codeMode !== "learned" || !marketPlay?.isPlay) return;
    try {
      captureBestSystemPlay(game, selectedDate, marketPlay);
      setSavedMarket(findSavedBestSystemPlay(league, game.id));
      setMarketStorageError("");
    } catch (error) {
      console.error("Best System Play could not be saved", error);
      setMarketStorageError("Best System Play could not be saved in this browser.");
    }
  }, [autoLoading, codeMode, game, game.id, league, selectedDate, marketPlayKey]);
  const savedMarketPlay = codeMode === "learned" ? savedMarket?.play ?? null : null;
  const displayMarketPlay = savedMarketPlay ?? marketPlay;
  const savedMarketResult = savedMarketPlay ? savedMarket?.outcome ?? null : null;
  const recentRecord = (side?: AutoMatchup["home"]) =>
    side?.lastFiveRecord ? `Last ${side.lastFiveCount ?? 5}: ${side.lastFiveRecord}` : "Unavailable";
  const displayRecord = (seasonRecord: string | null | undefined, side?: AutoMatchup["home"]) =>
    seasonRecord || (isInternationalSoccer && side?.lastFiveRecord
      ? `L${side.lastFiveCount ?? 5} ${side.lastFiveRecord}`
      : "—");
  const awayRecent = auto?.away.lastFiveRecord ? auto.away : historicalRecent?.away;
  const homeRecent = auto?.home.lastFiveRecord ? auto.home : historicalRecent?.home;
  const conventionalRows = [
    ...conventionalComparisons(predictionInput),
    ...(isInternationalSoccer && (homeRecent?.lastFiveRecord || awayRecent?.lastFiveRecord)
      ? [{
          label: "Recent matches (W-D-L)",
          home: recentRecord(homeRecent),
          away: recentRecord(awayRecent),
        }]
      : []),
  ];
  const marketRead = readCurrentMarket(book ? {
    source: book.book || "Current game feed",
    home: book.moneylineHome,
    away: book.moneylineAway,
  } : null);
  const underdogRead = decodeMarketUnderdog(marketRead, v.votes);
  const backupDecision = backupBetDecision({
    gameStatus: isFinal ? "pre" : game.status,
    meetsSystemThreshold: qualified,
    audit: effectiveAudit,
  });
  const backupDecisionText = isFinal
    ? `SYSTEM ${backupDecision.label}`
    : backupDecision.label === "NO BET" ? "NO BET" : `SYSTEM ${backupDecision.label}`;
  const awayOut = outs[game.awayTeam] ?? [];
  const homeOut = outs[game.homeTeam] ?? [];
  const starter = league === "NHL" || league === "MLB"
    ? `${game.awayAbbr} ${game.awayLeaders?.[0] || "goalie not posted"} · ${game.homeAbbr} ${game.homeLeaders?.[0] || "goalie not posted"}`
    : "";
  const fullPart=(part)=> <FullDecode part={part} title={`${game.awayTeam} @ ${game.homeTeam} · ${month}/${day}/${year}`} data={full} homeName={game.homeTeam} awayName={game.awayTeam} verdict={verdict} editable={!learned} headToHead={{allTime:auto?.allTimeSeries,season:auto?.seasonSeries}} partThreeTitle={isFight ? "FIGHTERS & COACHES" : undefined} />;

  return (
    <div className={`glass-card rounded-2xl overflow-hidden ${qualified ? "border-primary/60 shadow-[var(--shadow-gold)]" : ""}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[16px] font-bold font-display tracking-tight text-foreground leading-snug">{game.awayTeam} <span className="font-normal text-muted-foreground mx-0.5">@</span> {game.homeTeam}</p>
            <p className="text-[11px] mt-1 text-muted-foreground">{venueName}{when ? ` · ${when}` : ""}</p>
          </div>
          <div className="text-right shrink-0 rounded-xl bg-primary/10 border border-primary/25 px-3 py-1.5">
            <p className="text-2xl font-black font-display leading-none tabular-nums" style={{ color: YELLOW }}>{pickPct}%</p>
            <p className="text-[8.5px] mt-1 font-semibold tracking-widest text-muted-foreground">{codeMode === "backup" ? "LEGACY SCORE · NOT ODDS" : isFinal ? "LEARNED CODE" : confidenceBand(Math.round(pickPct)).toUpperCase()}</p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border/80 flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Record</p>
            <p className="text-[12px] font-mono tabular-nums text-foreground mt-1">{game.awayAbbr} <span className="text-muted-foreground">{displayRecord(analysisGame.awayRecord, awayRecent)}</span></p>
            <p className="text-[12px] font-mono tabular-nums text-foreground">{game.homeAbbr} <span className="text-muted-foreground">{displayRecord(analysisGame.homeRecord, homeRecent)}</span></p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{codeMode === "backup" ? "Backup side" : isFinal ? "Learned Code pick" : "AI Pick"}</p>
            <p className="text-[14px] font-black font-display tracking-tight mt-0.5" style={{ color: YELLOW }} data-testid="learned-pick" data-away={game.awayTeam} data-home={game.homeTeam} data-away-score={game.awayScore ?? ""} data-home-score={game.homeScore ?? ""} data-status={game.status}>{cardPickName}</p>
            {codeMode === "learned" && isFinal && savedLearnedPrediction && (
              <p className="text-[9px] mt-1 text-muted-foreground">
                Re-decoded with the frozen pregame inputs; original pick retained for comparison: {savedLearnedPrediction.pick === "home" ? game.homeTeam : game.awayTeam}
              </p>
            )}
            {codeMode === "backup" && (
              <p className="text-[9px] mt-0.5 font-bold tracking-wide" style={{ color: backupDecision.label === "NO BET" ? "hsl(var(--muted-foreground))" : YELLOW }}>
                {backupDecisionText}
              </p>
            )}
          {result ? (
            <p className="text-[10px] mt-1 font-bold" style={{ color: hit === null ? "hsl(var(--muted-foreground))" : hit ? GREEN : ROSE }}>{result}</p>
          ) : <StatusBadge status={game.status} detail={game.statusDetail} />}
          </div>
        </div>
        {(book || game.archivedOut || awayOut.length || homeOut.length || starter) && (
          <div className="mt-3 rounded-xl bg-muted/50 border border-border/70 px-3 py-2 text-[11px] text-foreground/90 space-y-1">
            {book && <p className="font-mono text-[10.5px] tabular-nums">{book.book || "Line"} · {game.awayAbbr} {book.moneylineAway || "—"} {book.spreadAway || ""} · {game.homeAbbr} {book.moneylineHome || "—"} {book.spreadHome || ""}{book.overUnder ? ` · O/U ${book.overUnder}` : ""}</p>}
            {starter && <p>{league === "NHL" ? "Goalie" : "Pitcher"} {starter}</p>}
            {(game.archivedOut || awayOut.length || homeOut.length) && <p>Out {game.archivedOut ?? `${game.awayAbbr}: ${awayOut.join(", ") || "none"} · ${game.homeAbbr}: ${homeOut.join(", ") || "none"}`}</p>}
          </div>
        )}
        {displayMarketPlay && (
          <div className="mt-3 rounded-lg px-3 py-2.5" style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.25)" }}>
            <p className="text-[9px] font-bold tracking-[0.14em]" style={{ color: YELLOW }}>
              {isFinal && !savedMarketPlay ? "HISTORICAL LINES UNAVAILABLE" : "BEST SYSTEM PLAY"}
            </p>
            <p className="mt-1 text-[13px] font-black text-foreground">{displayMarketPlay.selection}</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{displayMarketPlay.detail}</p>
            {savedMarketPlay && (
              <p className="mt-1 text-[9px] font-bold tracking-[0.12em]" style={{ color: savedMarketResult?.result === "win" ? GREEN : savedMarketResult?.result === "loss" ? ROSE : "hsl(var(--muted-foreground))" }}>
                {savedMarketResult?.result.toUpperCase() ?? "PENDING"}
              </p>
            )}
            {!savedMarketPlay && !isFinal && marketPlay?.isPlay && <p className="mt-1 text-[9px] font-bold text-muted-foreground">PENDING · tracked from this recommendation</p>}
            {!savedMarketPlay && !isFinal && marketPlay && !marketPlay.isPlay && <p className="mt-1 text-[9px] text-muted-foreground">LEAN · NOT GRADED</p>}
            {savedMarketResult && (
              <p className="mt-1 text-[10px] font-bold" style={{ color: savedMarketResult.result === "win" ? GREEN : savedMarketResult.result === "loss" ? ROSE : "hsl(var(--muted-foreground))" }}>
                {savedMarketResult.result.toUpperCase()}
              </p>
            )}
            {marketStorageError && <p className="mt-1 text-[9px] text-destructive">{marketStorageError}</p>}
            <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
              {savedMarketPlay
                ? "Captured before kickoff; this exact market and line are graded once from the final score."
                : isFinal
                ? "Original spread and total lines were not saved, so alternate-market results cannot be checked."
                : marketPlay?.note}
            </p>
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setOpenDecode((v) => !v)} className="rounded-lg py-2 text-[11px] font-bold tracking-[0.12em] bg-muted text-foreground border border-border hover:border-primary/50 transition-colors">
            {openDecode ? "HIDE FULL DECODE" : "SHOW FULL DECODE"}
          </button>
          <Button type="button" onClick={() => setOpenPeopleEditor((v) => !v)} className={`rounded-lg py-2 text-[11px] font-bold tracking-[0.12em] border transition-colors ${openPeopleEditor || peopleOverride ? "bg-primary/15 text-primary border-primary/50" : "bg-muted text-foreground border-border hover:border-primary/50"}`}>
            {openPeopleEditor ? "Close People" : "Edit People"}
          </Button>
        </div>
        {researched.status && <p className="text-[10px] text-muted-foreground mt-2" role="status">{researched.status}</p>}
        <ResearchReview facts={researched.facts} isVerified={researched.isVerified} onVerify={researched.verify} missingCount={researched.missingCount} />
        {openPeopleEditor && (
          <GamePeopleEditor
            awayTeam={game.awayTeam}
            homeTeam={game.homeTeam}
            value={editorPeopleValue}
            hasCustomOverride={!!peopleOverride}
            onChange={handlePeopleOverrideChange}
            onReset={handlePeopleOverrideReset}
          />
        )}
        {openDecode && (
          <div className="mt-3 space-y-2">
            <Fold title="Verdict" startOpen>
              <p className="text-xs font-bold text-foreground mb-2">{verdict}</p>
              <p className="text-[11px] text-foreground">{finalPick === "away" ? "PICK" : "OTHER"} {game.awayTeam} {awayPct}%</p>
              <p className="text-[11px] text-foreground mb-2">{finalPick === "home" ? "PICK" : "OTHER"} {game.homeTeam} {homePct}%</p>
              {v.alerts.map((a, i) => <p key={i} className="text-xs font-bold text-destructive">⚠ {a}</p>)}
              <ul className="mt-2 space-y-1">
                {brief.doing.map((row) => (
                  <li key={row.label} className="text-[11px] text-foreground">
                    <span className="font-bold" style={{ color: row.edge === "Even" ? "hsl(var(--muted-foreground))" : YELLOW }}>{row.label} → {row.edge}.</span> {row.reason}
                  </li>
                ))}
              </ul>
              {isFinal && hit === false && (
                <div className="mt-2">
                  <p className="text-[11px] font-bold" style={{ color: ROSE }}>Factors on the side that lost</p>
                  {v.votes.filter((x) => x.side !== finalPick).map((f, i) => <p key={i} className="text-[11px] text-foreground">{f.layer}: {f.reason}</p>)}
                </div>
              )}
            </Fold>
            {codeMode === "backup" && (
              <Fold title="Backup Signal Audit">
                <p className="text-[11px] text-foreground">
                  Vote share {effectiveAudit.pickedVoteShare}% · margin {effectiveAudit.margin.toFixed(2)} · {effectiveAudit.activeSignalCount}/{effectiveAudit.signalCount} active signals · {effectiveAudit.agreeingCategories}/{effectiveAudit.agreeingCategories + effectiveAudit.opposingCategories} categories support the pick.
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Core data {effectiveAudit.coreDataCoverage.available}/{effectiveAudit.coreDataCoverage.expected} · {effectiveAudit.usedTiebreak ? "tiebreak used" : "no tiebreak"}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {effectiveAudit.missingInputs.length
                    ? `Missing decode inputs: ${effectiveAudit.missingInputs.join(" · ")}`
                    : "No missing decode inputs were flagged."}
                </p>
                {auto?.gaps?.length ? <p className="mt-1 text-[10px] text-muted-foreground">Source gaps: {auto.gaps.join(" · ")}</p> : null}
                {effectiveAudit.duplicateEventGroups.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground">Repeated event descriptions</p>
                    {effectiveAudit.duplicateEventGroups.map((group) => (
                      <p key={group.eventKey} className="break-words text-[10px] text-muted-foreground">
                        {group.signals.join(" · ")} — {group.eventKey}
                      </p>
                    ))}
                  </div>
                ) : <p className="mt-2 text-[10px] text-muted-foreground">No exact repeated event descriptions across different signals.</p>}
                <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
                  {v.votes.map((vote, index) => (
                    <div key={`${vote.signalId}-${vote.eventKey}-${index}`} className="rounded-md border border-border px-2 py-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <span className="text-[10px] font-bold text-foreground">{vote.side === "home" ? game.homeTeam : game.awayTeam}</span>
                        <span className="text-[9px] text-muted-foreground">{vote.signalId}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {(vote.baseWeight ?? vote.weight).toFixed(2)} × {(vote.weightMultiplier ?? 1).toFixed(2)} = {(vote.appliedWeight ?? vote.weight).toFixed(2)} · {vote.weightSource ?? "unscaled"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-foreground">{vote.reason}</p>
                      {vote.eventKey && <p title={vote.eventKey} className="mt-0.5 break-all text-[9px] text-muted-foreground">Event key: {vote.eventKey}</p>}
                    </div>
                  ))}
                </div>
              </Fold>
            )}
            {codeMode === "backup" && (
              <Fold title="Conventional Game Analysis">
                <p className="mb-2 text-[10px] text-muted-foreground">Record, form, splits, rest, injury count, and H2H are context only; missing values stay unavailable. International-team last-five records are shown as W-D-L before kickoff.</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[360px] text-left text-[10px]">
                    <thead className="text-muted-foreground"><tr><th className="py-1 pr-2">Factor</th><th className="py-1 pr-2">{game.homeTeam}</th><th className="py-1">{game.awayTeam}</th></tr></thead>
                    <tbody>{conventionalRows.map((row) => (
                      <tr key={row.label} className="border-t border-border">
                        <th className="py-1 pr-2 font-medium text-muted-foreground">{row.label}</th>
                        <td className="py-1 pr-2 text-foreground">{row.home}</td>
                        <td className="py-1 text-foreground">{row.away}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <p className="mt-2 text-[9px] text-muted-foreground">Season record: ESPN scoreboard · international last five: ESPN match history before kickoff · other unavailable fields are not inferred.</p>
              </Fold>
            )}
            {codeMode === "backup" && (
              <Fold title="Current Market Analysis">
                {marketRead ? (
                  <>
                    <p className="text-[11px] text-foreground">{marketRead.source} · current snapshot</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {game.homeTeam}: {marketRead.homePrice ?? "unavailable"}{marketRead.homeImpliedPct == null ? "" : ` · ${marketRead.homeImpliedPct}% raw implied`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {game.awayTeam}: {marketRead.awayPrice ?? "unavailable"}{marketRead.awayImpliedPct == null ? "" : ` · ${marketRead.awayImpliedPct}% raw implied`}
                    </p>
                    {marketRead.homeNoVigPct != null && marketRead.awayNoVigPct != null && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        No-vig market share: {game.homeTeam} {marketRead.homeNoVigPct}% · {game.awayTeam} {marketRead.awayNoVigPct}% · overround {marketRead.overroundPct}%
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Spread: {book?.spreadHome || "unavailable"} / {book?.spreadAway || "unavailable"} · Total: {book?.overUnder || "unavailable"}
                    </p>
                    <p className="mt-1 text-[9px] text-muted-foreground">The feed did not supply a retrieval timestamp; no line movement is inferred.</p>
                  </>
                ) : <p className="text-[11px] text-muted-foreground">No current moneyline prices are available for this game.</p>}
                <p className="mt-2 text-[9px] text-muted-foreground">Snapshot only. No line history, CLV, or market tracking is saved.</p>
              </Fold>
            )}
            {codeMode === "backup" && (
              <Fold title="Underdog Decode">
                {underdogRead ? (
                  <>
                    <p className="text-[11px] text-foreground">
                      Market underdog: {underdogRead.side === "home" ? game.homeTeam : game.awayTeam} · no-vig implied {underdogRead.side === "home" ? marketRead?.homeNoVigPct : marketRead?.awayNoVigPct}%
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Symbolic vote share: {underdogRead.voteSharePct}% · {underdogRead.supportingSignals} supporting signals · {underdogRead.supportingCategories} categories
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Opposing signals: {underdogRead.opposingSignals}. This is a decode comparison, not an upset probability or bet recommendation.
                    </p>
                  </>
                ) : <p className="text-[11px] text-muted-foreground">No two-sided market price is available to identify a clear underdog.</p>}
              </Fold>
            )}
            {codeMode === "backup" && (
              <Fold title="Backup Betting Decision">
                <p className="text-xs font-black tracking-wide text-foreground">
                  {backupDecision.label === "PICK" || backupDecision.label === "LEAN"
                    ? `SYSTEM ${backupDecision.label} · ${pickName}`
                    : "NO BET"}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">Model win probability: unavailable · no-vig market: {marketRead?.homeNoVigPct == null ? "unavailable" : `${game.homeTeam} ${marketRead.homeNoVigPct}%`} / {marketRead?.awayNoVigPct == null ? "unavailable" : `${game.awayTeam} ${marketRead.awayNoVigPct}%`} · probability advantage: unavailable</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{backupDecision.reason}</p>
                <p className="mt-1 text-[9px] text-muted-foreground">System pick/lean uses the existing decode threshold, not a calibrated win probability or proven betting edge.</p>
                {isFinal && <p className="mt-1 text-[9px] text-muted-foreground">Completed-game decode; no original pregame pick was saved.</p>}
              </Fold>
            )}
            <Fold title="Game Energies">{fullPart("game")}</Fold>
            <Fold title="Teams">
              {fullPart("team")}
              <BriefChunk brief={brief} titles={["Record vibration"]} />
            </Fold>
            <Fold title={isFight ? "Fighters & Coaches" : "Key Players, Coaches & Owners"}>
              {fullPart("player")}
              {isFinal && codeMode === "learned" && !isFight && (() => {
                const missing = (["away", "home"] as const).flatMap((side) => {
                  const team = predictionInput[side];
                  const individualOwnerApplies = normalizeSportsName(team.name) !== "green bay packers";
                  const required = [
                    { role: starterRole, label: "key player" },
                    { role: "coach", label: "coach" },
                    ...(individualOwnerApplies ? [{ role: "owner", label: "owner" }] : []),
                  ];
                  return required.filter(({ role }) =>
                    !(team.people ?? []).some((person) => person.role === role && !!person.dob),
                  ).map(({ label }) => `${team.name} ${label}`);
                });
                const communityOwnedPackers = (["away", "home"] as const).some((side) =>
                  normalizeSportsName(predictionInput[side].name) === "green bay packers",
                );
                return missing.length ? (
                  <div className="mt-2 space-y-1 text-[10px] text-primary/80">
                    <p>Missing verified Part 3 birth dates in the pregame snapshot: {missing.join(" · ")}. No postgame lineup or result was substituted.</p>
                    {communityOwnedPackers && <p>Green Bay has community ownership, not one individual owner, so no owner birth-date layer applies.</p>}
                  </div>
                ) : null;
              })()}
              {autoLoading && <p className="text-[10px] text-muted-foreground">Loading verified starters, jerseys and birth dates…</p>}
              {!autoLoading && !!auto?.gaps?.length && <p className="text-[10px] text-muted-foreground">Source limitations: {auto.gaps.join(" · ")}</p>}
            </Fold>
            <Fold title="Chinese Zodiac"><BriefChunk brief={brief} titles={["Chinese animal friend / enemy"]} /></Fold>
            <Fold title="Number Compatibility"><BriefChunk brief={brief} titles={["Number compatibility chart", "Stacking breakdown", "Jersey number resonance", "Pitcher vs pitcher (or key player)", "Master number highlights", "Extreme resonance", "Master multiplier"]} /></Fold>
            <Fold title="Location Decode">
              {fullPart("city")}
              {fullPart("stadium")}
              <BriefChunk brief={brief} titles={["Venue and city for each side", "Colorology", "Hour cycle", "Stadium founding vs each team"]} />
            </Fold>
            <Fold title="Gematria"><GematriaBlock data={gem} /></Fold>
          </div>
        )}
      </div>
    </div>
  );
});

function ForwardAccuracy({ mode, games }: { mode: SportsMode; games: ESPNGame[] }) {
  const [report, setReport] = useState<ReturnType<typeof evaluateForward> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const pull = (event?: Event) => {
      try {
        setReport(evaluateForward(readForwardArchive(), mode));
        if (event instanceof CustomEvent && event.detail) setError(String(event.detail));
      } catch {
        setError("Forward records could not be read. Browser storage has not been replaced.");
      }
    };
    pull();
    window.addEventListener(FORWARD_UPDATED_EVENT, pull);
    window.addEventListener("storage", pull);
    return () => {
      window.removeEventListener(FORWARD_UPDATED_EVENT, pull);
      window.removeEventListener("storage", pull);
    };
  }, [mode]);
  useEffect(() => {
    try {
      settleForwardGames(games);
      settleBestSystemPlayGames(games);
    }
    catch { setError("Final results could not be saved. Check browser storage and refresh."); }
  }, [games]);
  useEffect(() => {
    let alive = true, busy = false;
    // Only request dates/leagues with a real saved prediction; never backfill picks.
    const settlePending = async () => {
      if (busy) return;
      busy = true;
      try {
        const archive = readForwardArchive();
        const groups = new Map<string, { league: string; year: number; month: number; day: number }>();
        for (const p of archive.predictions) {
          if (Date.parse(p.kickoff) <= Date.now() && !archive.outcomes.some(r => r.id === p.id)) {
            groups.set(`${p.league}|${p.input.year}-${p.input.month}-${p.input.day}`, {
              league: p.league,
              year: p.input.year,
              month: p.input.month,
              day: p.input.day,
            });
          }
        }
        const marketArchive = readBestSystemPlayArchive();
        for (const play of marketArchive.plays) {
          if (Date.parse(play.kickoff) > Date.now() || marketArchive.outcomes.some((row) => row.id === play.id)) continue;
          const [year, month, day] = play.date.split("-").map(Number);
          if (!year || !month || !day) continue;
          groups.set(`${play.league}|${year}-${month}-${day}`, { league: play.league, year, month, day });
        }
        await Promise.all([...groups.values()].map(async p => {
          const list = await fetchESPNGames(p.league, p.month, p.day, p.year);
          if (alive) {
            settleForwardGames(list);
            settleBestSystemPlayGames(list);
          }
        }));
      } catch {
        if (alive) setError("Some saved picks are awaiting results. Result retrieval or storage failed; refresh to retry.");
      } finally { busy = false; }
    };
    void settlePending();
    const timer = window.setInterval(settlePending, 60000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);
  // Keep existing background pick/result capture, but the user requested that
  // this browser-only evaluation panel and its export be hidden from the UI.
  return null;
}

function HitRatePanel() {
  const [r, setR] = useState<ReturnType<typeof stepHitRates> | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  useEffect(() => {
    const pull = () => { setR(stepHitRates()); setWeights(layerWeights()); };
    pull();
    const t = setInterval(pull, 5000);
    return () => clearInterval(t);
  }, []);
  if (!r) return null;
  return (
    <div>
      <p className="text-sm text-foreground mb-3">Overall: <b>{r.hits}/{r.total}</b>{r.total ? ` (${Math.round(100 * r.hits / r.total)}%)` : ""}.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(r.steps).map(([k, s]) => (
          <div key={k} className="rounded-lg bg-muted/40 p-2"><p className="text-[10px] text-muted-foreground">{k}{weights[k] != null ? ` · ×${weights[k].toFixed(2)}` : ""}</p><p className="text-sm font-bold text-foreground">{s.hits}/{s.total} · {s.total ? Math.round(100 * s.hits / s.total) : 0}%</p></div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value, accent = "white" }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-widest font-bold mb-0.5" style={{ color: "hsl(var(--foreground) / 0.7)" }}>{label}</p>
      <p className="text-[13px] font-bold" style={{ color: accent }}>{value}</p>
    </div>
  );
}
function NumInput({ label, value, set, min, max, w = "w-14", readOnly }: { label: string; value: number; set: (n: number) => void; min: number; max: number; w?: string; readOnly?: boolean }) {
  return (
    <div>
      <p className="text-[7px] uppercase tracking-widest mb-1 text-center text-muted-foreground">{label}</p>
      <input type="number" min={min} max={max} value={value} readOnly={readOnly} onChange={e => set(+e.target.value)}
        className={`${w} text-center rounded-lg px-1.5 py-1.5 text-xs font-bold`}
        style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "white", outline: "none" }} />
    </div>
  );
}
function AthletePersonalDayCard({ month, day, year }: { month: number; day: number; year: number }) {
  const [bm, setBm] = useState(1);
  const [bd, setBd] = useState(1);
  const pd = useMemo(() => calcAthletePersonalDay(bm, bd, month, day, year), [bm, bd, month, day, year]);
  return (
    <div className="rounded-2xl p-4" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--primary) / 0.45)" }}>
      <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground mb-2">ATHLETE PERSONAL DAY</p>
      <div className="flex gap-2 mb-2">
        <NumInput label="M" value={bm} set={setBm} min={1} max={12} />
        <NumInput label="D" value={bd} set={setBd} min={1} max={31} />
      </div>
      <Mini label="Personal day" value={`${pd.compound}/${pd.reduced}`} accent={YELLOW} />
    </div>
  );
}

export default function SportsPredictionPage() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const [mounted, setMounted] = useState(false);
  const [learningRevision, setLearningRevision] = useState(0);
  const today = centralDateParts();
  // Read the address once up front so the first load already targets the
  // requested date and sport (no wasted load of today / NBA first).
  const initial = useMemo(() => {
    const q = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
    const d = q.get("date")?.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    const lg = q.get("league");
    const sport = SPORT_PICKER_GROUPS.find((g) => g.id.toLowerCase() === q.get("sport")?.toLowerCase())?.id ?? sportForLeague(lg);
    const group = SPORT_PICKER_GROUPS.find((g) => g.id === sport);
    return { year: d ? +d[1] : today.year, month: d ? +d[2] : today.month, day: d ? +d[3] : today.day, sport, league: lg ?? group?.leagues[0] ?? "NBA" };
  }, []);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [year, setYear] = useState(initial.year);
  const [league, setLeague] = useState(initial.league);
  const [activeSport, setActiveSport] = useState<string | null>(initial.sport);
  const activeSportRef = useRef<string | null>(initial.sport);
  activeSportRef.current = activeSport;
  const pendingAutoSelect = useRef<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(search);
    const d = q.get("date")?.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (d) { setYear(+d[1]); setMonth(+d[2]); setDay(+d[3]); }
    const lg = q.get("league");
    const requestedSport = q.get("sport");
    const resolvedSport = SPORT_PICKER_GROUPS.find(
      (group) => group.id.toLowerCase() === requestedSport?.toLowerCase(),
    )?.id ?? sportForLeague(lg);
    setActiveSport(resolvedSport);
    if (lg) {
      pendingAutoSelect.current = null;
      setLeague(lg);
    } else {
      pendingAutoSelect.current = resolvedSport;
      const first = SPORT_PICKER_GROUPS.find((g) => g.id === resolvedSport)?.leagues[0];
      if (first) setLeague((cur) => (SPORT_PICKER_GROUPS.find((g) => g.id === resolvedSport)?.leagues.includes(cur) ? cur : first));
    }
  }, [search]);
  const [slateLoading, setSlateLoading] = useState(false);
  const [loadedSlate, setAllGames] = useState<Record<string, ESPNGame[]>>({});
  const [slateScope, setSlateScope] = useState("");
  const slateScopeRef = useRef("");
  const setCurrentSlateScope = (scope: string) => {
    slateScopeRef.current = scope;
    setSlateScope(scope);
  };
  const [failedFeeds, setFailedFeeds] = useState<string[]>([]);
  const currentSlateScope = `${year}-${month}-${day}`;
  const currentSlateLoading = slateLoading || slateScope !== currentSlateScope;
  const allGames = slateScope === currentSlateScope ? loadedSlate : {};
  // Counts, summaries, and the selected game cards all use the same date-slate response.
  const games = allGames[league] ?? [];
  const slateVersion = useRef(0);
  const [code, setCode] = useState<SportsMode>("learned");
  const [boardState, setBoard] = useState<{ context: object | null; rows: Record<string, BoardRow> }>({ context: null, rows: {} });
  const [refreshRevision, setRefreshRevision] = useState(0);
  const [prices, setPrices] = useState<Record<string, OddsBlock>>({});
  const [outs, setOuts] = useState<Record<string, string[]>>({});
  useEffect(() => { setMounted(true); setCode(sportsMode()); }, []);
  useEffect(() => {
    const refreshLearnedPicks = () => setLearningRevision((revision) => revision + 1);
    window.addEventListener(LEARNING_UPDATED_EVENT, refreshLearnedPicks);
    return () => window.removeEventListener(LEARNING_UPDATED_EVENT, refreshLearnedPicks);
  }, []);
  useEffect(() => {
    let alive = true;
    setPrices({});
    setOuts({});
    const today = centralDateParts();
    // A current injury/odds feed is not evidence for a historical game.
    if (year !== today.year || month !== today.month || day !== today.day) return () => { alive = false; };
    Promise.all([fetchFanDuelBoard(league), fetchOuts(league)]).then(([p, o]) => {
      if (!alive) return;
      setPrices(p);
      setOuts(o);
    });
    return () => { alive = false; };
  }, [league, year, month, day]);

  const leagueInfo = getLeagueInfo(league);

  const fetchAll = useCallback(async () => {
    const v = ++slateVersion.current;
    const scope = `${year}-${month}-${day}`;
    setSlateLoading(true);
    setFailedFeeds([]);
    if (slateScopeRef.current !== scope) {
      setAllGames({});
      setCurrentSlateScope(scope);
    }
    // Load the sport being viewed first so its games show right away.
    const focus = SPORT_PICKER_GROUPS.find((g) => g.id === activeSportRef.current)?.leagues ?? [];
    const majors = [...focus, ...ALL_LEAGUES.filter((l) => !focus.includes(l))];
    const results: Record<string, ESPNGame[]> = {};
    const failures: string[] = [];
    let nextLeague = 0;
    const loadLeague = async (lg: string) => {
      try {
        return await fetchESPNGames(lg, month, day, year);
      } catch {
        // ESPN occasionally drops bursts of scoreboard requests. Retry a
        // failed league once instead of presenting a temporary outage as an
        // empty slate.
        await new Promise((resolve) => window.setTimeout(resolve, 150));
        if (slateVersion.current !== v) return [];
        try {
          return await fetchESPNGames(lg, month, day, year);
        } catch {
          failures.push(lg);
          return [];
        }
      }
    };
    const runWorkers = async () => {
      nextLeague = 0;
      const worker = async () => {
        while (slateVersion.current === v) {
          const index = nextLeague++;
          if (index >= majors.length) return;
          const lg = majors[index];
          const list = await loadLeague(lg);
          if (slateVersion.current !== v) return;
           if (list.length) results[lg] = list;
           setAllGames((current) => {
             if (slateVersion.current !== v) return current;
             const next = { ...current };
             if (list.length) next[lg] = list;
             else delete next[lg];
             return next;
           });
           setCurrentSlateScope(scope);
        }
      };
      await Promise.all(Array.from({ length: Math.min(6, majors.length) }, () => worker()));
    };
    await runWorkers();
    // If every scoreboard returned a successful but empty response, verify
    // once more after short server-side empty-response caches have expired.
    if (slateVersion.current === v && Object.keys(results).length === 0 && failures.length === 0) {
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      if (slateVersion.current === v) await runWorkers();
    }
    if (slateVersion.current === v) {
      setAllGames(results);
      setCurrentSlateScope(scope);
      setFailedFeeds(failures);
      setSlateLoading(false);
    }
  }, [month, day, year]);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const ov = useOverrides();
  const catalog = useSportsCatalog();
  const activeSportGroup = SPORT_PICKER_GROUPS.find((group) => group.id === activeSport);
  const reportLeagues = activeSportGroup?.leagues ?? ALL_LEAGUES;
  const weightVersion = sportsWeightSnapshot(code).version;
  // Off-screen cards cannot refresh themselves after shared scoring inputs
  // change. Ignore old rows immediately, and let mounted cards republish.
  const boardContext = useMemo(() => ({}), [month, day, year, code, catalog, learningRevision, refreshRevision, weightVersion]);
  const board = boardState.context === boardContext ? boardState.rows : {};
  const onReady = useCallback((row: BoardRow) => {
    setBoard((prev) => {
      const rows = prev.context === boardContext ? prev.rows : {};
      const old = rows[row.id];
      return old?.pct === row.pct && old?.pick === row.pick && old?.allow === row.allow && old?.result === row.result
        ? prev : { context: boardContext, rows: { ...rows, [row.id]: row } };
    });
  }, [boardContext]);
  const refreshSlate = useCallback(() => {
    autoMatchupCache.clear();
    clearESPNGamesCache();
    setRefreshRevision((revision) => revision + 1);
    void fetchAll();
  }, [fetchAll]);
  // Heavy decode runs once per slate and only for the open sport; card updates
  // merge in cheaply below instead of re-decoding every game in every sport.
  const baseBooks = useMemo(() => {
    const by: Record<string, ReturnType<typeof slateLeg>[]> = {};
    if (!activeSportGroup) return by;
    for (const lg of activeSportGroup.leagues) {
      const list = allGames[lg];
      if (list) by[lg] = list.map((g) => slateLeg(g, year, month, day, lg, ov, true, catalog, code));
    }
    return by;
  }, [allGames, year, month, day, code, ov, learningRevision, catalog, activeSportGroup]);
  const books = useMemo(() => {
    const by: Record<string, ReturnType<typeof slateLeg>[]> = {};
    for (const [lg, legs] of Object.entries(baseBooks)) {
      // Re-decode final games from the frozen pregame input when one exists;
      // keep the original captured pick untouched as the audit record.
      by[lg] = legs.map((base) => {
        const card = base.open ? board[base.id] : undefined;
        return card ? {...base, pick:card.pick, pct:card.pct, allow:card.allow, result:card.result, open:card.open} : base;
      });
    }
    return by;
  }, [baseBooks, board]);
  const sportParlays = reportLeagues.map((lg) => ({ lg, legs: bestLegs(books[lg] ?? []) })).filter((x) => x.legs.length > 0);
  const dayReport = (() => {
    const legs = reportLeagues.flatMap((lg) => books[lg] ?? []);
    const by = new Map<string, { hits: number; done: number }>();
    let hits = 0, done = 0, open = 0;
    for (const l of legs) {
      if (l.result === "open") { open++; continue; }
      if (l.result === "push") continue;
      done++;
      if (l.result === "hit") hits++;
      const row = by.get(l.league) ?? { hits: 0, done: 0 };
      row.done++;
      if (l.result === "hit") row.hits++;
      by.set(l.league, row);
    }
    return { hits, done, open, pct: done ? Math.round(100 * hits / done) : 0, leagues: [...by.entries()] };
  })();
  const backupDayReport = (() => {
    const legs = reportLeagues.flatMap((lg) => books[lg] ?? []);
    const outcome = {
      PICK: { hits: 0, done: 0, open: 0 },
      LEAN: { hits: 0, done: 0, open: 0 },
    };
    let noBet = 0;
    let pushes = 0;
    for (const leg of legs) {
      const label = leg.backupDecision?.label ?? "NO BET";
      if (label === "NO BET") {
        noBet++;
        continue;
      }
      if (leg.result === "open") {
        outcome[label].open++;
        continue;
      }
      if (leg.result === "push") {
        pushes++;
        continue;
      }
      outcome[label].done++;
      if (leg.result === "hit") outcome[label].hits++;
    }
    const totalHits = outcome.PICK.hits + outcome.LEAN.hits;
    const totalDone = outcome.PICK.done + outcome.LEAN.done;
    return {
      outcome,
      noBet,
      pushes,
      totalHits,
      totalDone,
      totalOpen: outcome.PICK.open + outcome.LEAN.open,
      totalPct: totalDone ? Math.round((100 * totalHits) / totalDone) : 0,
    };
  })();
  const allLegs = (() => {
    const pool: ReturnType<typeof slateLeg>[] = [];
    for (const lg of reportLeagues) {
      const lgLegs = books[lg] ?? [];
      const live = lgLegs.filter((l) => l.open);
      const open = (live.length ? live : lgLegs).slice().sort((a, b) => b.pct - a.pct);
      const hot = open.filter((l) => isBest(l.pct, l.allow));
      pool.push(...(hot.length ? hot : open).slice(0, 2));
    }
    return pool.sort((a, b) => b.pct - a.pct).slice(0, 8);
  })();
  const leagueCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const [lg, lgg] of Object.entries(allGames)) if (lgg.length) c[lg] = lgg.length;
    return c;
  }, [allGames]);
  const liveLeagues = ALL_LEAGUES.filter((l) => (leagueCounts[l] ?? 0) > 0);
  const sportLeagues = activeSportGroup?.leagues ?? [];
  const sportLiveLeagues = sportLeagues.filter((item) => liveLeagues.includes(item));
  const sportFailedFeeds = sportLeagues.filter((item) => failedFeeds.includes(item));
  useEffect(() => {
    const pending = pendingAutoSelect.current;
    if (!pending || pending !== activeSport) return;
    const group = SPORT_PICKER_GROUPS.find((item) => item.id === pending);
    // Pick as soon as this sport's own schedules are in, not the whole slate.
    if (currentSlateLoading && !group?.leagues.every((item) => item in allGames || failedFeeds.includes(item))) return;
    const firstLiveLeague = group?.leagues.find((item) => (leagueCounts[item] ?? 0) > 0);
    pendingAutoSelect.current = null;
    if (firstLiveLeague && firstLiveLeague !== league) {
      setLeague(firstLiveLeague);
    }
  }, [activeSport, currentSlateLoading, leagueCounts, league, allGames, failedFeeds]);

  if (!mounted) return <div className="max-w-3xl" />;
  const selectedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const routePath = location.split("?")[0] || window.location.pathname || "/sports-prediction";
  const navigateWithParams = (params: URLSearchParams) => {
    const query = params.toString();
    setLocation(query ? `${routePath}?${query}` : routePath);
  };
  const updateRoute = (updates: { date?: string; sport?: string | null; league?: string | null }) => {
    const params = new URLSearchParams(window.location.search);
    for (const key of ["date", "sport", "league"] as const) {
      if (!(key in updates)) continue;
      const value = updates[key];
      if (value) params.set(key, value);
      else params.delete(key);
    }
    navigateWithParams(params);
  };
  const chooseSport = (sport: string) => {
    const params = new URLSearchParams({ date: selectedDate, sport });
    navigateWithParams(params);
  };
  const chooseLeague = (nextLeague: string) => {
    const params = new URLSearchParams({ date: selectedDate, sport: activeSport ?? sportForLeague(nextLeague) ?? "", league: nextLeague });
    navigateWithParams(params);
  };
  const showSportPicker = () => navigateWithParams(new URLSearchParams({ date: selectedDate }));
  const pickerEntries: SportPickerEntry[] = SPORT_PICKER_GROUPS.map((group) => {
    const count = group.leagues.reduce((total, item) => total + (leagueCounts[item] ?? 0), 0);
    const failedCount = group.leagues.filter((item) => failedFeeds.includes(item)).length;
    const subCounts = group.id === "College Sports" || group.id === "More Sports"
      ? group.leagues.map((item) => ({ label: item, count: leagueCounts[item] ?? 0 }))
      : undefined;
    return {
      id: group.id,
      label: group.label,
      description: group.description,
      count,
      loading: currentSlateLoading,
      partial: failedCount > 0 && failedCount < group.leagues.length,
      failed: failedCount > 0 && failedCount === group.leagues.length,
      subCounts,
    };
  });
  if (!activeSportGroup) {
    return (
      <SportPicker
        selectedDate={selectedDate}
        onDateChange={(value) => updateRoute({ date: value })}
        onRefresh={refreshSlate}
        refreshing={slateLoading}
        entries={pickerEntries}
        onSelect={chooseSport}
      />
    );
  }
  const rows = Object.values(board).filter(row => games.some(game => `${league}-${game.id}` === row.id));
  const best = rows.filter((r) => r.open && isBest(r.pct, r.allow)).sort((a, b) => (b.allow ?? b.pct) - (a.allow ?? a.pct));

  return (
    <div className="max-w-7xl space-y-5">
      <SportsPageHeader
        eyebrow="Sports AI"
        title={`${activeSportGroup.label} · Game Day`}
        description="Open a matchup to see this sport’s pick and full decode."
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={showSportPicker}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-muted px-3 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
          data-testid="button-back-to-sports"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          All sports
        </button>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))" }}>
          {(["learned", "backup"] as const).map((m) => (
            <button key={m} onClick={() => { setSportsMode(m); setCode(m); }}
              className="px-3 py-2 text-[11px] tracking-wide"
              style={code === m
                ? { background: YELLOW, color: "hsl(var(--primary-foreground))", fontWeight: 800 }
                : { background: "hsl(var(--background))", color: YELLOW, fontWeight: 600 }}>
              {m === "learned" ? "Learned Code" : "Backup SportsCode"}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground" data-testid="active-league-slate-count">
          {month}/{day}/{year} · {leagueInfo.label} · {leagueCounts[league] ?? 0} games
        </p>
      </div>

      {code === "backup" && (
        <div className="rounded-xl p-3" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--primary))" }}>
          <p title="Past results are replayed using Backup SportsCode on the selected date; these are recalculated, not originally saved forecasts." className="text-[10px] font-bold tracking-[0.18em]" style={{ color: YELLOW }}>
            DAY ACCURACY · {activeSportGroup.label} · {month}/{day}/{year}
          </p>
          <p className="mt-1 text-[10px] font-bold tracking-wide text-muted-foreground">BACKUP SPORTSCODE · PICK / LEAN / NO BET TOTAL</p>
          <p className="mt-2 text-[10px] text-muted-foreground">
            SYSTEM PICK {backupDayReport.outcome.PICK.hits}/{backupDayReport.outcome.PICK.done}
            {backupDayReport.outcome.PICK.open ? ` · ${backupDayReport.outcome.PICK.open} open` : ""}
            {" · "}LEAN {backupDayReport.outcome.LEAN.hits}/{backupDayReport.outcome.LEAN.done}
            {backupDayReport.outcome.LEAN.open ? ` · ${backupDayReport.outcome.LEAN.open} open` : ""}
            {" · "}NO BET {backupDayReport.noBet}
          </p>
          <p className="mt-1 text-2xl font-black text-foreground">
            {backupDayReport.totalHits}/{backupDayReport.totalDone}
            <span className="ml-2 text-[14px]" style={{ color: YELLOW }}>
              {backupDayReport.totalDone ? `${backupDayReport.totalPct}% total` : "no settled picks yet"}
            </span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            Total includes settled PICK + LEAN results; NO BET and pushes are excluded. {backupDayReport.pushes ? `${backupDayReport.pushes} pushes excluded.` : ""}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <label htmlFor="sports-game-date" className="text-[10px] font-semibold text-muted-foreground">
          Game date
          <input id="sports-game-date" type="date" value={selectedDate} onChange={(event) => updateRoute({ date: event.target.value })}
            className="mt-1 block h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none [color-scheme:dark] focus:border-primary/60" />
        </label>
        <button aria-label="Refresh games" onClick={refreshSlate} className="mb-0.5 p-2 rounded-lg text-muted-foreground" style={{ border: "1px solid hsl(var(--border))" }}>
          <RefreshCw size={14} className={slateLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {activeSportGroup.leagues.length > 1 && (
        <section className="rounded-xl border border-border bg-background p-3" aria-label={`${activeSportGroup.label} competitions`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-foreground">{activeSportGroup.label} schedules</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Choose a competition for this date.</p>
            </div>
            <span className="text-[10px] text-muted-foreground">{sportLiveLeagues.length} available</span>
          </div>
          {sportLiveLeagues.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {sportLiveLeagues.map((item) => {
                const active = league === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => chooseLeague(item)}
                    aria-pressed={active}
                    aria-label={`${item} ${leagueCounts[item] ?? 0}`}
                    className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
                    style={active
                      ? { background: YELLOW, color: "hsl(var(--primary-foreground))" }
                      : { background: "hsl(var(--muted))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
                    data-testid={`button-select-league-${item.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                  >
                    {item}<span className="ml-1.5 text-[10px] opacity-60">{leagueCounts[item] ?? 0}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">{currentSlateLoading ? "Checking schedules…" : "No competitions have games on this date."}</p>
          )}
        </section>
      )}

      {currentSlateLoading && sportLiveLeagues.length === 0 ? (
        <p className="text-[11px]" style={{ color: YELLOW }}>Checking {activeSportGroup.label} schedules.</p>
      ) : sportLiveLeagues.length === 0 && sportFailedFeeds.length === sportLeagues.length && sportFailedFeeds.length > 0 ? (
        <p className="text-[12px] text-destructive" role="status">{activeSportGroup.label} feeds didn’t respond. Use Refresh games to retry.</p>
      ) : sportLiveLeagues.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No {activeSportGroup.label} games on {month}/{day}/{year}.</p>
      ) : (
        <div className="space-y-2">
          {currentSlateLoading && <p className="text-[11px] text-muted-foreground" role="status">More {activeSportGroup.label} schedules are loading.</p>}
          {!currentSlateLoading && sportFailedFeeds.length > 0 && (
            <p className="text-[11px] text-primary/80" role="status">
              Some schedules did not respond ({sportFailedFeeds.join(", ")}). The games shown may be incomplete; use Refresh games to retry.
            </p>
          )}
        </div>
      )}

      {code === "learned" && <div className="rounded-xl p-3" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--primary))" }}>
          {dayReport.done + dayReport.open > 0 && <>
          <p title="Completed Learned Code picks graded against their final results." className="text-[10px] font-bold tracking-[0.18em]" style={{ color: YELLOW }}>LEARNED CODE ACCURACY · {activeSportGroup.label} · {month}/{day}/{year}</p>
          <p aria-label={`Learned Code day accuracy: ${dayReport.hits} of ${dayReport.done}, ${dayReport.pct} percent`} className="text-2xl font-black text-foreground mt-1"><span className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground">LEARNED CODE</span> {dayReport.done ? `${dayReport.hits}/${dayReport.done}` : "—"} <span className="text-[14px]" style={{ color: YELLOW }}>{dayReport.done ? `${dayReport.pct}%` : "no finals yet"}</span></p>
          <p className="text-[11px] text-muted-foreground mt-1">{dayReport.leagues.map(([lg, r]) => `${lg} ${r.hits}/${r.done}`).join(" · ") || "Waiting on games."}{dayReport.open ? ` · ${dayReport.open} still open` : ""}</p>
          </>}
          <ForwardAccuracy mode={code} games={Object.entries(allGames).filter(([item]) => reportLeagues.includes(item)).flatMap(([, list]) => list)} />
      </div>}
      {code === "learned" && allLegs.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--primary))" }}>
          <p className="text-[10px] font-bold tracking-[0.18em] mb-2" style={{ color: YELLOW }}>{activeSportGroup.label.toUpperCase()} PARLAY · {month}/{day}/{year}</p>
          <ol className="space-y-1">
            {allLegs.map((r, i) => (
              <li key={r.id} className="flex justify-between gap-3 text-[12px] text-foreground">
                <span>{i + 1}. {r.league} · {r.pick}</span>
                <span className="font-bold" style={{ color: r.result === "hit" ? GREEN : r.result === "miss" ? ROSE : YELLOW }}>{r.allow != null && r.allow >= 75 ? Math.round(r.allow) : r.pct}%{r.result === "hit" ? " · HIT" : r.result === "miss" ? " · MISS" : ""}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {code === "learned" && sportParlays.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold tracking-[0.18em]" style={{ color: YELLOW }}>BEST {activeSportGroup.label.toUpperCase()} PLAYS</p>
          {sportParlays.map(({ lg, legs }) => (
            <div key={lg} className="rounded-xl p-3" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--primary) / 0.45)" }}>
              <p className="text-[11px] font-black mb-1" style={{ color: YELLOW }}>{lg}</p>
              <ol className="space-y-1">
                {legs.map((r, i) => (
                  <li key={r.id} className="flex justify-between gap-3 text-[12px] text-foreground">
                    <span>{i + 1}. {r.pick} <span className="text-muted-foreground">· {r.matchup}</span></span>
                    <span className="font-bold shrink-0" style={{ color: r.result === "hit" ? GREEN : r.result === "miss" ? ROSE : YELLOW }}>{r.allow != null && r.allow >= 75 ? Math.round(r.allow) : r.pct}%{r.result === "hit" ? " · HIT" : r.result === "miss" ? " · MISS" : ""}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {code === "learned" && best.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold tracking-[0.18em]" style={{ color: YELLOW }}>BEST PLAYS · {league}</p>
          {best.map((r) => (
            <div key={r.id} className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--primary))" }}>
              <div>
                <p className="text-[13px] font-bold text-foreground">{r.matchup}</p>
                <p className="text-[10px] text-muted-foreground">{r.venue}{r.time ? ` · ${r.time}` : ""} · {r.record}</p>
                <p className="text-[12px] font-bold mt-0.5" style={{ color: YELLOW }}>PICK: {r.pick}</p>
              </div>
              <p className="text-2xl font-black" style={{ color: YELLOW }}>{r.allow != null && r.allow >= 75 ? Math.round(r.allow) : r.pct}%</p>
            </div>
          ))}
        </div>
      )}

      {sportLiveLeagues.length > 0 && (games.length === 0 && currentSlateLoading ? (
        <div className="rounded-2xl p-10 text-center"><Loader2 size={22} className="animate-spin mx-auto mb-2" style={{ color: YELLOW }} /><p className="text-sm text-muted-foreground">Loading {leagueInfo.label}</p></div>
      ) : games.length === 0 ? (
        <div className="rounded-2xl p-8 text-center"><AlertCircle size={20} className="mx-auto mb-2" style={{ color: ROSE }} /><p className="text-sm text-foreground">{failedFeeds.includes(league) ? `Could not load ${leagueInfo.label} games. Use Refresh games to retry.` : `No games loaded for ${leagueInfo.label} on ${month}/${day}/${year}.`}</p></div>
      ) : (
        <div className="space-y-3">
          {games.map((g, i) => <GameCard key={`${code}-${currentSlateScope}-${league}-${weightVersion}-${refreshRevision}-${g.id}`} game={g} year={year} month={month} day={day} idx={i} league={league} learned={true} codeMode={code} learningRevision={learningRevision} refreshRevision={refreshRevision} onReady={code === "learned" ? onReady : undefined} prices={prices} outs={outs} catalog={catalog} />)}
        </div>
      ))}
    </div>
  );
}
