import { normalizeSportsName } from "./sports-catalog";
import type { VoteInput, VotePerson } from "./vote-decode";

export interface NflTeamPeople {
  qb: string;
  qbDob: string;
  qbJersey: string;
  coach: string;
  coachDob?: string;
  owner: string;
  ownerDob?: string;
}

const bioUrl = (name: string) =>
  `https://en.wikipedia.org/wiki/${encodeURIComponent(name.trim().replace(/\s+/g, "_"))}`;

/** 2026 NFL starting QB, head coach, and owner birthdays for all 32 teams. */
export const NFL_TEAM_PEOPLE: Record<string, NflTeamPeople> = {
  "arizona cardinals": { qb: "Carson Beck", qbDob: "2001-11-19", qbJersey: "19", coach: "Mike LaFleur", coachDob: "1987-03-03", owner: "Michael Bidwill", ownerDob: "1964-12-06" },
  "atlanta falcons": { qb: "Michael Penix Jr.", qbDob: "2000-05-08", qbJersey: "9", coach: "Kevin Stefanski", coachDob: "1982-05-08", owner: "Arthur Blank", ownerDob: "1942-09-27" },
  "baltimore ravens": { qb: "Jacoby Brissett", qbDob: "1992-12-11", qbJersey: "11", coach: "Jesse Minter", coachDob: "1983-05-09", owner: "Steve Bisciotti", ownerDob: "1960-04-10" },
  "buffalo bills": { qb: "Josh Allen", qbDob: "1996-05-21", qbJersey: "17", coach: "Joe Brady", coachDob: "1989-09-23", owner: "Terry Pegula", ownerDob: "1951-03-27" },
  "carolina panthers": { qb: "Bryce Young", qbDob: "2001-07-25", qbJersey: "9", coach: "Dave Canales", coachDob: "1981-05-07", owner: "David Tepper", ownerDob: "1957-09-11" },
  "chicago bears": { qb: "Caleb Williams", qbDob: "2001-11-18", qbJersey: "18", coach: "Ben Johnson", coachDob: "1986-05-11", owner: "George McCaskey", ownerDob: "1956-03-29" },
  "cincinnati bengals": { qb: "Joe Burrow", qbDob: "1996-12-10", qbJersey: "9", coach: "Zac Taylor", coachDob: "1983-05-10", owner: "Mike Brown", ownerDob: "1935-08-10" },
  "cleveland browns": { qb: "Deshaun Watson", qbDob: "1995-09-14", qbJersey: "4", coach: "Todd Monken", coachDob: "1966-02-05", owner: "Jimmy Haslam", ownerDob: "1954-03-09" },
  "dallas cowboys": { qb: "Dak Prescott", qbDob: "1993-07-29", qbJersey: "4", coach: "Brian Schottenheimer", coachDob: "1973-10-16", owner: "Jerry Jones", ownerDob: "1942-10-13" },
  "denver broncos": { qb: "Bo Nix", qbDob: "2000-02-25", qbJersey: "10", coach: "Sean Payton", coachDob: "1963-12-29", owner: "Rob Walton", ownerDob: "1944-10-27" },
  "detroit lions": { qb: "Jared Goff", qbDob: "1994-10-14", qbJersey: "16", coach: "Dan Campbell", coachDob: "1976-04-13", owner: "Sheila Ford Hamp", ownerDob: "1951-10-31" },
  "green bay packers": { qb: "Jordan Love", qbDob: "1998-11-02", qbJersey: "10", coach: "Matt LaFleur", coachDob: "1979-11-03", owner: "Ed Policy", ownerDob: "1970-10-06" },
  "houston texans": { qb: "C.J. Stroud", qbDob: "2001-10-03", qbJersey: "7", coach: "DeMeco Ryans", coachDob: "1984-07-28", owner: "Cal McNair", ownerDob: "1961-10-24" },
  "indianapolis colts": { qb: "Daniel Jones", qbDob: "1997-05-27", qbJersey: "17", coach: "Shane Steichen", coachDob: "1985-05-11", owner: "Carlie Irsay-Gordon", ownerDob: "1980-09-29" },
  "jacksonville jaguars": { qb: "Trevor Lawrence", qbDob: "1999-10-06", qbJersey: "16", coach: "Liam Coen", coachDob: "1985-11-08", owner: "Shahid Khan", ownerDob: "1950-07-18" },
  "kansas city chiefs": { qb: "Patrick Mahomes", qbDob: "1995-09-17", qbJersey: "15", coach: "Andy Reid", coachDob: "1958-03-19", owner: "Clark Hunt", ownerDob: "1965-02-19" },
  "las vegas raiders": { qb: "Fernando Mendoza", qbDob: "2003-10-01", qbJersey: "15", coach: "Klint Kubiak", coachDob: "1987-02-17", owner: "Mark Davis", ownerDob: "1955-05-18" },
  "los angeles chargers": { qb: "Justin Herbert", qbDob: "1998-03-10", qbJersey: "10", coach: "Jim Harbaugh", coachDob: "1963-12-23", owner: "Dean Spanos", ownerDob: "1950-05-26" },
  "los angeles rams": { qb: "Matthew Stafford", qbDob: "1988-02-07", qbJersey: "9", coach: "Sean McVay", coachDob: "1986-01-24", owner: "Stan Kroenke", ownerDob: "1947-07-29" },
  "miami dolphins": { qb: "Kyle McCord", qbDob: "2002-09-19", qbJersey: "14", coach: "Jeff Hafley", coachDob: "1979-04-04", owner: "Stephen Ross", ownerDob: "1940-05-10" },
  "minnesota vikings": { qb: "Kirk Cousins", qbDob: "1988-08-19", qbJersey: "8", coach: "Kevin O'Connell", coachDob: "1985-05-25", owner: "Zygi Wilf", ownerDob: "1950-04-22" },
  "new england patriots": { qb: "Drake Maye", qbDob: "2002-08-30", qbJersey: "10", coach: "Mike Vrabel", coachDob: "1975-08-14", owner: "Robert Kraft", ownerDob: "1941-06-05" },
  "new orleans saints": { qb: "Tyler Shough", qbDob: "1999-09-28", qbJersey: "6", coach: "Kellen Moore", coachDob: "1988-07-05", owner: "Gayle Benson", ownerDob: "1947-01-26" },
  "new york giants": { qb: "J.J. McCarthy", qbDob: "2003-01-20", qbJersey: "18", coach: "John Harbaugh", coachDob: "1962-09-23", owner: "John Mara", ownerDob: "1954-12-01" },
  "new york jets": { qb: "Geno Smith", qbDob: "1990-10-10", qbJersey: "7", coach: "Aaron Glenn", coachDob: "1972-07-16", owner: "Woody Johnson", ownerDob: "1947-04-12" },
  "philadelphia eagles": { qb: "Joe Milton", qbDob: "2000-03-06", qbJersey: "14", coach: "Nick Sirianni", coachDob: "1981-06-15", owner: "Jeffrey Lurie", ownerDob: "1951-09-08" },
  "pittsburgh steelers": { qb: "Aaron Rodgers", qbDob: "1983-12-02", qbJersey: "8", coach: "Mike McCarthy", coachDob: "1963-11-10", owner: "Art Rooney II", ownerDob: "1952-09-14" },
  "san francisco 49ers": { qb: "Brock Purdy", qbDob: "1999-12-27", qbJersey: "13", coach: "Kyle Shanahan", coachDob: "1979-12-14", owner: "Jed York", ownerDob: "1980-03-09" },
  "seattle seahawks": { qb: "Sam Darnold", qbDob: "1997-06-05", qbJersey: "14", coach: "Mike Macdonald", coachDob: "1987-06-26", owner: "Neeru Khosla" },
  "tampa bay buccaneers": { qb: "Baker Mayfield", qbDob: "1995-04-14", qbJersey: "6", coach: "Todd Bowles", coachDob: "1963-11-18", owner: "Bryan Glazer", ownerDob: "1964-10-27" },
  "tennessee titans": { qb: "Cam Ward", qbDob: "2002-05-25", qbJersey: "1", coach: "Robert Saleh", coachDob: "1979-01-31", owner: "Amy Adams Strunk", ownerDob: "1955-09-29" },
  "washington commanders": { qb: "Jayden Daniels", qbDob: "2000-12-18", qbJersey: "5", coach: "Dan Quinn", coachDob: "1970-09-11", owner: "Josh Harris", ownerDob: "1964-12-29" },
};

export function getNflTeamPeople(teamName: string): NflTeamPeople | undefined {
  return NFL_TEAM_PEOPLE[normalizeSportsName(teamName)];
}

/** Fill in any missing starting QB, head coach, or owner on an NFL VoteInput. */
export function withNflTeamPeople(input: VoteInput): VoteInput {
  if (input.league !== "NFL") return input;
  let changed = false;
  const next = { ...input };
  for (const side of ["home", "away"] as const) {
    const team = input[side];
    const defaults = getNflTeamPeople(team.name);
    if (!defaults) continue;
    const people = [...team.people];
    const hasRole = (role: VotePerson["role"]) => people.some((p) => p.role === role);
    if (!hasRole("quarterback")) {
      people.push({ name: defaults.qb, role: "quarterback", dob: defaults.qbDob, jersey: defaults.qbJersey, dateSourceUrl: bioUrl(defaults.qb) });
    }
    if (!hasRole("coach")) {
      people.push({ name: defaults.coach, role: "coach", dob: defaults.coachDob, dateSourceUrl: defaults.coachDob ? bioUrl(defaults.coach) : undefined });
    }
    if (!hasRole("owner")) {
      people.push({ name: defaults.owner, role: "owner", dob: defaults.ownerDob, dateSourceUrl: defaults.ownerDob ? bioUrl(defaults.owner) : undefined });
    }
    for (let i = 0; i < people.length; i++) {
      const p = people[i];
      if (p.role === "coach" && !p.dob && defaults.coachDob) {
        people[i] = { ...p, dob: defaults.coachDob };
        changed = true;
      } else if (p.role === "owner" && !p.dob && defaults.ownerDob) {
        people[i] = { ...p, dob: defaults.ownerDob };
        changed = true;
      }
    }
    if (people.length !== team.people.length || changed) {
      next[side] = { ...team, people };
      changed = true;
    }
  }
  return changed ? next : input;
}