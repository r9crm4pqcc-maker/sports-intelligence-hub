import { getLearnedTeamMeta, getLearnedLocationMeta, getLearnedPeopleForTeam, normalizeSportsName, type SportsCatalogRecord } from "./sports-catalog";
import { getTeamMeta } from "./sports-data";
import { venueLocalHour, venueTimeZone } from "./sports-cycles";
import type { ESPNGame } from "./espn";
import type { AutoMatchup } from "./espn-auto";
import type { VoteInput, VotePerson, VoteTeam } from "./vote-decode";
import { keyPersonRoleForLeague, preferredKeyPlayerForTeam } from "./sports-method-candidate";

function tuple(date?: string | readonly number[] | null): [number, number, number] | undefined {
  if (!date) return undefined;
  if (typeof date !== "string") return [date[0], date[1], date[2]];
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? [+m[1], +m[2], +m[3]] : undefined;
}

/** The supplied injury text is a historical snapshot, not today's injury feed. */
export function archivedOuts(text?: string): string[] | undefined {
  if (text === undefined) return undefined;
  return text.split(/·|;/).flatMap(section => {
    const names = section.slice(section.indexOf(":") + 1).trim();
    return /^none$/i.test(names) || !names ? [] : names.split(",").map(n => n.trim()).filter(Boolean);
  });
}
export function snapshotOutCount(text: string | undefined, side: "away" | "home"): number | undefined {
  if (text === undefined) return undefined;
  const section = text.split(/·|;/)[side === "away" ? 0 : 1];
  return section === undefined ? undefined : archivedOuts(section)?.length;
}

const VENUE_REGION_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",DC:"District of Columbia",
  AB:"Alberta",BC:"British Columbia",MB:"Manitoba",NB:"New Brunswick",NL:"Newfoundland and Labrador",NS:"Nova Scotia",NT:"Northwest Territories",NU:"Nunavut",ON:"Ontario",PE:"Prince Edward Island",QC:"Quebec",SK:"Saskatchewan",YT:"Yukon",
};

type HistoricalNflStarter = {
  common: string;
  dob: string;
  jersey: string;
  lineupSourceUrl: string;
  lineupSourceUpdated: string;
  dateSourceUrl: string;
  coach: string;
  coachDob?: string;
  owner: string;
  ownerDob?: string;
  /** User-supplied game uniform colors for this historical matchup only. */
  uniformColors?: string[];
};

type HistoricalNhlGoalie = {
  common: string;
  dob: string;
  jersey: string;
  lineupSourceUrl: string;
  lineupSourceUpdated: string;
  dateSourceUrl: string;
};

const HISTORICAL_NHL_GOALIES: Record<string, HistoricalNhlGoalie> = {
  "2026-11-15|philadelphia flyers": {
    common: "Dan Vladar", dob: "1997-08-20", jersey: "80",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/3942459",
  },
  "2026-11-15|edmonton oilers": {
    common: "Tristan Jarry", dob: "1995-04-29", jersey: "35",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/3042020",
  },
  "2026-11-15|dallas stars": {
    common: "Casey DeSmith", dob: "1991-08-13", jersey: "1",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/3025540",
  },
  "2026-11-15|florida panthers": {
    common: "Akira Schmid", dob: "2000-05-12", jersey: "40",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/4587845",
  },
  "2026-11-15|anaheim ducks": {
    common: "Ville Husso", dob: "1995-02-06", jersey: "33",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/3151137",
  },
  "2026-11-15|calgary flames": {
    common: "Devin Cooley", dob: "1997-05-25", jersey: "1",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/4319911",
  },
  "2026-11-15|vegas golden knights": {
    common: "Carter Hart", dob: "1998-08-13", jersey: "79",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/4064582",
  },
  "2026-11-15|vancouver canucks": {
    common: "Leevi Meriläinen", dob: "2002-08-13", jersey: "31",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/4894703",
  },
  "2026-11-15|san jose sharks": {
    common: "Alex Nedeljkovic", dob: "1996-01-07", jersey: "33",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/3114994",
  },
  "2026-11-15|nashville predators": {
    common: "Juuse Saros", dob: "1995-04-19", jersey: "74",
    lineupSourceUrl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20261115",
    lineupSourceUpdated: "Confirmed starter · Nov. 15, 2026",
    dateSourceUrl: "https://www.espn.com/nhl/player/_/id/3042109",
  },
};

const publicBioUrl = (name: string) =>
  `https://en.wikipedia.org/wiki/${encodeURIComponent(name.trim().replace(/\s+/g, "_"))}`;

/**
 * Archived QB inputs for the Nov. 15, 2026 NFL slate, plus coach/owner names
 * supplied by the user and source-linked public birth dates where verified.
 * This map is only for Learned's reconstruction of this completed slate,
 * never Backup or future games.
 */
const HISTORICAL_NFL_STARTERS: Record<string, HistoricalNflStarter> = {
  "2026-11-15|new england patriots": {
    common: "Drake Maye",
    dob: "2002-08-30",
    jersey: "10",
    coach: "Mike Vrabel",
    coachDob: "1975-08-14",
    owner: "Robert Kraft",
    ownerDob: "1941-06-05",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:47 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/53231/",
  },
  "2026-11-15|detroit lions": {
    common: "Jared Goff",
    dob: "1994-10-14",
    jersey: "16",
    coach: "Dan Campbell",
    coachDob: "1976-04-13",
    owner: "Sheila Ford Hamp",
    ownerDob: "1951-10-31",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/15/2026 8:34 AM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/42922/",
  },
  "2026-11-15|atlanta falcons": {
    common: "Michael Penix Jr.",
    dob: "2000-05-08",
    jersey: "9",
    coach: "Kevin Stefanski",
    coachDob: "1982-05-08",
    owner: "Arthur Blank",
    ownerDob: "1942-09-27",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/15/2026 12:44 AM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/53236/",
  },
  "2026-11-15|houston texans": {
    common: "C.J. Stroud",
    dob: "2001-10-03",
    jersey: "7",
    coach: "DeMeco Ryans",
    coachDob: "1984-07-28",
    owner: "Cal McNair",
    ownerDob: "1961-10-24",
    uniformColors: ["White"],
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:42 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/50081/",
  },
  "2026-11-15|cleveland browns": {
    common: "Deshaun Watson",
    dob: "1995-09-14",
    jersey: "4",
    coach: "Todd Monken",
    coachDob: "1966-02-05",
    owner: "Jimmy Haslam",
    ownerDob: "1954-03-09",
    uniformColors: ["Brown", "Orange"],
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:40 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/46596/",
  },
  "2026-11-15|green bay packers": {
    common: "Jordan Love",
    dob: "1998-11-02",
    jersey: "10",
    coach: "Matt LaFleur",
    coachDob: "1979-11-03",
    owner: "Ed Policy",
    ownerDob: "1970-10-06",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/15/2026 12:34 AM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/40265/",
  },
  "2026-11-15|minnesota vikings": {
    common: "Kirk Cousins",
    dob: "1988-08-19",
    jersey: "8",
    coach: "Kevin O'Connell",
    owner: "Zygi Wilf",
    ownerDob: "1950-04-22",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:47 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/33415/",
  },
  "2026-11-15|kansas city chiefs": {
    common: "Patrick Mahomes",
    dob: "1995-09-17",
    jersey: "15",
    coach: "Andy Reid",
    coachDob: "1958-03-19",
    owner: "Clark Hunt",
    ownerDob: "1965-02-19",
    lineupSourceUrl: "https://www.nfl.com/sitemap/html/rosters/2026/kansas-city-chiefs",
    lineupSourceUpdated: "2026 roster listing; QB role verified on NFL player profile",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/30414/",
  },
  "2026-11-15|jacksonville jaguars": {
    common: "Trevor Lawrence",
    dob: "1999-10-06",
    jersey: "16",
    coach: "Liam Coen",
    coachDob: "1985-11-08",
    owner: "Shahid Khan",
    ownerDob: "1950-07-18",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/12/2026 1:50 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/43318/",
  },
  "2026-11-15|tennessee titans": {
    common: "Cam Ward",
    dob: "2002-05-25",
    jersey: "1",
    coach: "Robert Saleh",
    coachDob: "1979-01-31",
    owner: "Amy Adams Strunk",
    ownerDob: "1955-09-29",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:49 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/54148/",
  },
  "2026-11-15|miami dolphins": {
    common: "Kyle McCord",
    dob: "2002-09-19",
    jersey: "14",
    coach: "Jeff Hafley",
    coachDob: "1979-04-04",
    owner: "Stephen Ross",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/15/2026 11:47 AM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/54328/",
  },
  "2026-11-15|indianapolis colts": {
    common: "Daniel Jones",
    dob: "1997-05-27",
    jersey: "17",
    coach: "Shane Steichen",
    coachDob: "1985-05-11",
    owner: "Carlie Irsay-Gordon",
    ownerDob: "1980-09-29",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:44 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/36977/",
  },
  "2026-11-15|carolina panthers": {
    common: "Bryce Young",
    dob: "2001-07-25",
    jersey: "9",
    coach: "Dave Canales",
    coachDob: "1981-05-07",
    owner: "David Tepper",
    ownerDob: "1957-09-11",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:40 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/50080/",
  },
  "2026-11-15|new orleans saints": {
    common: "Tyler Shough",
    dob: "1999-09-28",
    jersey: "6",
    coach: "Kellen Moore",
    coachDob: "1988-07-05",
    owner: "Gayle Benson",
    ownerDob: "1947-01-26",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:47 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/54187/",
  },
  "2026-11-15|buffalo bills": {
    common: "Josh Allen",
    dob: "1996-05-21",
    jersey: "17",
    coach: "Joe Brady",
    coachDob: "1989-09-23",
    owner: "Terry Pegula",
    ownerDob: "1951-03-27",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:39 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/33720/",
  },
  "2026-11-15|new york jets": {
    common: "Geno Smith",
    dob: "1990-10-10",
    jersey: "7",
    coach: "Aaron Glenn",
    coachDob: "1972-07-16",
    owner: "Woody Johnson",
    ownerDob: "1947-04-12",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/15/2026 11:53 AM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/40992/",
  },
  "2026-11-15|seattle seahawks": {
    common: "Sam Darnold",
    dob: "1997-06-05",
    jersey: "14",
    coach: "Mike Macdonald",
    coachDob: "1987-06-26",
    owner: "Neeru Khosla",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:48 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/49824/",
  },
  "2026-11-15|las vegas raiders": {
    common: "Fernando Mendoza",
    dob: "2003-10-01",
    jersey: "15",
    coach: "Klint Kubiak",
    coachDob: "1987-02-17",
    owner: "Mark Davis",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:45 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/54953/",
  },
  "2026-11-15|los angeles rams": {
    common: "Matthew Stafford",
    dob: "1988-02-07",
    jersey: "9",
    coach: "Sean McVay",
    coachDob: "1986-01-24",
    owner: "Stan Kroenke",
    ownerDob: "1947-07-29",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/15/2026 1:05 AM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/42921/",
  },
  "2026-11-15|arizona cardinals": {
    common: "Carson Beck",
    dob: "2001-11-19",
    jersey: "19",
    coach: "Mike LaFleur",
    coachDob: "1987-03-03",
    owner: "Michael Bidwill",
    ownerDob: "1964-12-06",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/14/2026 10:35 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/55017/",
  },
  "2026-11-15|san francisco 49ers": {
    common: "Brock Purdy",
    dob: "1999-12-27",
    jersey: "13",
    coach: "Kyle Shanahan",
    coachDob: "1979-12-14",
    owner: "Jed York",
    ownerDob: "1980-03-09",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/15/2026 3:03 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/47091/",
  },
  "2026-11-15|dallas cowboys": {
    common: "Dak Prescott",
    dob: "1993-07-29",
    jersey: "4",
    coach: "Brian Schottenheimer",
    coachDob: "1973-10-16",
    owner: "Jerry Jones",
    ownerDob: "1942-10-13",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/15/2026 3:06 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/27386/",
  },
  "2026-11-15|pittsburgh steelers": {
    common: "Aaron Rodgers",
    dob: "1983-12-02",
    jersey: "8",
    coach: "Mike McCarthy",
    coachDob: "1963-11-10",
    owner: "Art Rooney II",
    ownerDob: "1952-09-14",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/15/2026 7:19 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/50077/",
  },
  "2026-11-15|cincinnati bengals": {
    common: "Joe Burrow",
    dob: "1996-12-10",
    jersey: "9",
    coach: "Zac Taylor",
    coachDob: "1983-05-10",
    owner: "Mike Brown",
    lineupSourceUrl: "https://www.ourlads.com/nfldepthcharts/depthcharts.aspx",
    lineupSourceUpdated: "11/12/2026 1:49 PM",
    dateSourceUrl: "https://www.ourlads.com/nfldepthcharts/player/40241/",
  },
};

function historicalNflStarter(
  game: ESPNGame,
  year: number,
  month: number,
  day: number,
  teamName: string,
): HistoricalNflStarter | undefined {
  if (game.league !== "NFL" || game.status !== "post") return undefined;
  const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return HISTORICAL_NFL_STARTERS[`${date}|${normalizeSportsName(teamName)}`];
}

function historicalNhlGoalie(
  game: ESPNGame,
  year: number,
  month: number,
  day: number,
  teamName: string,
): HistoricalNhlGoalie | undefined {
  if (game.league !== "NHL" || game.status !== "post") return undefined;
  const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return HISTORICAL_NHL_GOALIES[`${date}|${normalizeSportsName(teamName)}`];
}

/** Restore QB and supplied leadership names on a replay copy, never the archived input. */
export function withHistoricalNflStarters(input: VoteInput, game: ESPNGame): VoteInput {
  if (
    input.league !== "NFL" ||
    input.codeMode === "backup" ||
    input.candidateMethod === false ||
    game.status !== "post"
  ) return input;
  let changed = false;
  const next = { ...input };
  for (const side of ["home", "away"] as const) {
    const team = input[side];
    const starter = historicalNflStarter(game, input.year, input.month, input.day, team.name);
    if (!starter) continue;
    const people = [...team.people];
    const addIfMissing = (person: VotePerson) => {
      if (!people.some((existing) =>
        existing.role === person.role &&
        normalizeSportsName(existing.name) === normalizeSportsName(person.name),
      )) people.push(person);
    };
    if (!people.some((person) => person.role === "quarterback")) addIfMissing({
      name: starter.common,
      role: "quarterback",
      dob: starter.dob,
      jersey: starter.jersey,
      dateSourceUrl: starter.dateSourceUrl,
      lineupSourceUrl: starter.lineupSourceUrl,
      lineupSourceUpdated: starter.lineupSourceUpdated,
    });
    addIfMissing({
      name: starter.coach, role: "coach", dob: starter.coachDob,
      dateSourceUrl: starter.coachDob ? publicBioUrl(starter.coach) : undefined,
    });
    addIfMissing({
      name: starter.owner, role: "owner", dob: starter.ownerDob,
      dateSourceUrl: starter.ownerDob ? publicBioUrl(starter.owner) : undefined,
    });
    if (people.length === team.people.length) continue;
    next[side] = {
      ...team,
      people,
      ...(starter.uniformColors ? { colors: starter.uniformColors } : {}),
    };
    changed = true;
  }
  return changed ? next : input;
}

function readableVenueRegion(region?: string): string | undefined {
  if (!region) return undefined;
  const normalized = region.trim();
  return VENUE_REGION_NAMES[normalized.toUpperCase()] ?? normalized;
}

export function buildSportsInput(game: ESPNGame, year: number, month: number, day: number, league: string, catalog: SportsCatalogRecord[],
  auto?: AutoMatchup | null, outs: Record<string, string[]> = {}, dobs: {home?: string; away?: string} = {},
  codeMode: "learned" | "backup" = "learned", candidateMethod = codeMode === "learned"): VoteInput {
  const withBackupDate = (name: string) => {
    const meta = getLearnedTeamMeta(name, catalog, league);
    const baseline = codeMode === "backup" ? getTeamMeta(name) : undefined;
    return meta && baseline ? { ...meta, founded: baseline.founded } : meta;
  };
  const homeMeta = withBackupDate(game.homeTeam);
  const awayMeta = withBackupDate(game.awayTeam);
  const neutralSite = game.neutralSite === true;
  const stadiumName = game.venue || auto?.venue || (neutralSite ? "" : homeMeta?.stadium) || "";
  const stadium = getLearnedLocationMeta("stadium", stadiumName, catalog);
  const city = catalog.find(r => r.id === stadium?.cityId && r.kind === "city");
  const feedCity = game.venueCity || auto?.venueCity;
  const cityName = city?.name || feedCity || (neutralSite ? undefined : homeMeta?.city);
  const useHomeVenueDate = !neutralSite && (!game.venue || normalizeSportsName(game.venue) === normalizeSportsName(homeMeta?.stadium || ""));
  const keyRole = keyPersonRoleForLeague(league);
  const starterRole = league === "NFL" || league === "College Football"
    ? "quarterback"
    : league === "MLB"
      ? "pitcher"
      : "player";
  const teamLeaderName = (side: "home" | "away", teamName: string) => {
    if (keyRole !== "player") return undefined;
    const listedKeyPlayer = preferredKeyPlayerForTeam(teamName, league);
    if (listedKeyPlayer) return listedKeyPlayer;
    if (game.status !== "pre") return undefined;
    const leaders = side === "home" ? game.homeLeaders : game.awayLeaders;
    return leaders?.[0];
  };
  const excluded = new Set((archivedOuts(game.archivedOut) || []).map(normalizeSportsName));
  const rest = (date?: string) => {
    const elapsed = date ? (Date.UTC(year, month - 1, day) - Date.parse(`${date.slice(0,10)}T00:00:00Z`)) / 86400000 : NaN;
    return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 40 ? Math.round(elapsed) : undefined;
  };
  const team = (side: "home" | "away"): VoteTeam => {
    const name = side === "home" ? game.homeTeam : game.awayTeam;
    const meta = side === "home" ? homeMeta : awayMeta;
    const feed = auto?.[side];
    const sourcedHistoricalStarter = candidateMethod && keyRole === "quarterback"
      ? historicalNflStarter(game, year, month, day, name)
      : undefined;
    const sourcedHistoricalGoalie = candidateMethod && keyRole === "goalie"
      ? historicalNhlGoalie(game, year, month, day, name)
      : undefined;
    const people = new Map<string, VotePerson>();
    const add = (person: VotePerson) => {
      const key = normalizeSportsName(person.name);
      if (!key || excluded.has(key)) return;
      const previous = people.get(key);
      people.set(key, {...previous, ...person, dob: person.dob || previous?.dob, jersey: person.jersey || previous?.jersey});
    };
    if (candidateMethod && keyRole) {
      const keyPlayers = feed?.keyPlayers || [];
      const matchPosition = (position?: string) => {
        if (keyRole === "quarterback") return /^(QB|quarterback)$/i.test(position || "");
        if (keyRole === "pitcher") return /^(P|SP|starting pitcher|pitcher)$/i.test(position || "");
        if (keyRole === "goalie") return /^(G|GK|goalie|goaltender)$/i.test(position || "");
        return true;
      };
      let selected = keyRole === "player"
        ? keyPlayers.find((person) => normalizeSportsName(person.common) === normalizeSportsName(teamLeaderName(side, name) || ""))
        : feed?.starter && (matchPosition(feed.starter.position) ||
          ((keyRole === "pitcher" || keyRole === "goalie") && feed.starter.confirmedStarter === true))
          ? feed.starter
          : keyPlayers.find((person) => matchPosition(person.position));
      if (!selected && sourcedHistoricalStarter) selected = sourcedHistoricalStarter;
      if (!selected && sourcedHistoricalGoalie) selected = sourcedHistoricalGoalie;
      const leaderName = keyRole === "player" ? teamLeaderName(side, name) : undefined;
      if (selected || leaderName) {
        const keyName = selected?.common || leaderName!;
        const catalogPlayer = getLearnedPeopleForTeam(name, catalog).find((person) =>
          normalizeSportsName(person.name) === normalizeSportsName(keyName) &&
          person.roles.some((role) => /player|pitcher|quarterback|goalie/i.test(role)),
        );
        add({
          name: keyName,
          role: keyRole,
          dob: selected?.dob || (catalogPlayer?.date ? String(catalogPlayer.date) : undefined),
          jersey: selected?.jersey || catalogPlayer?.jersey || undefined,
          dateSourceUrl: catalogPlayer?.sourceUrl,
          lineupSourceUrl: selected?.lineupSourceUrl,
          lineupSourceUpdated: selected?.lineupSourceUpdated,
          ...(selected === sourcedHistoricalStarter && sourcedHistoricalStarter ? {
            dateSourceUrl: sourcedHistoricalStarter.dateSourceUrl,
            lineupSourceUrl: sourcedHistoricalStarter.lineupSourceUrl,
            lineupSourceUpdated: sourcedHistoricalStarter.lineupSourceUpdated,
          } : {}),
          ...(selected === sourcedHistoricalGoalie && sourcedHistoricalGoalie ? {
            dateSourceUrl: sourcedHistoricalGoalie.dateSourceUrl,
            lineupSourceUrl: sourcedHistoricalGoalie.lineupSourceUrl,
            lineupSourceUpdated: sourcedHistoricalGoalie.lineupSourceUpdated,
          } : {}),
        });
      }
    } else if (!candidateMethod && feed?.starter) {
      add({name: feed.starter.common, role: starterRole, dob: feed.starter.dob, jersey: feed.starter.jersey});
    }
    if (feed?.manager && !(candidateMethod && league === "UFC")) add({name: feed.manager.common, role: "coach", dob: feed.manager.dob, jersey: feed.manager.jersey});
    if (!candidateMethod) {
      for(const person of feed?.keyPlayers || [])add({name:person.common,role:person.common===feed?.starter?.common ? starterRole : "player",dob:person.dob,jersey:person.jersey});
    }
    if(feed?.owner && !(candidateMethod && league === "UFC"))add({name:feed.owner.common,role:"owner",dob:feed.owner.dob});
    for (const p of getLearnedPeopleForTeam(name, catalog)) {
      if (candidateMethod && league === "UFC") break;
      const role = p.roles.find(r => ["pitcher","quarterback","goalie","manager","coach","player","owner","staff"].includes(r)) as VotePerson["role"] | undefined;
      if (candidateMethod && (role === "player" || role === "pitcher" || role === "quarterback" || role === "goalie") && !people.has(normalizeSportsName(p.name))) continue;
      if (role && !p.aliases.some(alias => excluded.has(normalizeSportsName(alias)))) add({name:p.name, role, dob:p.date || undefined, jersey:p.jersey || undefined});
    }
    const gematriaPeople = new Map<string, VotePerson>();
    for (const person of candidateMethod ? [] : feed?.keyPlayers ?? []) {
      if (!person.common?.trim()) continue;
      gematriaPeople.set(normalizeSportsName(person.common), {
        name: person.common,
        role: "player",
        dob: person.dob,
        jersey: person.jersey,
      });
    }
    for (const person of people.values()) {
      if (/^(player|pitcher|quarterback|goalie|fighter|goalkeeper)$/i.test(person.role)) {
        const key = normalizeSportsName(person.name);
        if (!gematriaPeople.has(key)) gematriaPeople.set(key, { ...person });
      }
    }
    return {name, founded: league === "UFC" ? tuple(dobs[side]) : tuple(meta?.founded),
      colors: meta?.colors || feed?.colors, record: feed?.record || (side === "home" ? game.homeRecord : game.awayRecord) || undefined,
      form: feed?.last10, streak:feed?.streak, splitHome:feed?.homeRecord, splitRoad:feed?.roadRecord, rest:rest(feed?.lastPlayed),
      outs: snapshotOutCount(game.archivedOut, side) ?? outs[name]?.length ?? feed?.outs,
      h2hWins: side === "home" ? auto?.homeH2hWins : auto?.awayH2hWins,
      seriesWins: side === "home" ? auto?.homeSeriesWins : auto?.awaySeriesWins,
      shortName: feed?.shortName && normalizeSportsName(feed.shortName) !== normalizeSportsName(name)
        ? feed.shortName
        : (side === "home" ? game.homeAbbr : game.awayAbbr) || feed?.abbr,
      people:[...people.values()],
      gematriaPeople:[...gematriaPeople.values()]};
  };
  return {year, month, day, league, eventName:game.eventName, individual:league === "UFC", neutralSite, codeMode, candidateMethod,
     gameStartTime:game.startTime, venueTimeZone:venueTimeZone(cityName, stadiumName) ?? undefined,
     region: game.venueRegion || game.venueCountry || readableVenueRegion(auto?.venueState),
    priorNumbers:auto?.priorNumbers, sharedSeries:auto?.sharedSeries,
    hour:venueLocalHour(game.startTime, cityName, stadiumName) ?? undefined,
     home:team("home"), away:team("away"), stadium:stadiumName, stadiumOpened:tuple(stadium?.date || (useHomeVenueDate ? homeMeta?.stadiumOpened : undefined)),
      city:cityName, cityFounded:tuple(city?.date || (cityName === homeMeta?.city && !neutralSite ? homeMeta?.cityFounded : undefined))};
}
