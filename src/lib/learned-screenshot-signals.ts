import { gematriaDecode, type GematriaDecode, type GematriaSideInput } from "./sports-gematria";
import { moonSign, westernSign } from "./sports-decode";
import type { VoteInput } from "./vote-decode";

export interface LearnedScreenshotVote {
  side: "home" | "away";
  weight: number;
  layer: "Number pairs" | "Stars & venue";
  reason: string;
  signalId: string;
}

const dateTuple = (value?: string): [number, number, number] | undefined => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? [+match[1], +match[2], +match[3]] : undefined;
};

function recordParts(record?: string) {
  const match = record?.match(/^\s*(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?/);
  return match ? { wins: +match[1], losses: +match[2] } : {};
}

function streakParts(streak?: string) {
  const code = streak?.match(/(?:^|\b)([WL])\s*(\d+)/i);
  if (code) return code[1].toUpperCase() === "W" ? { winStreak: +code[2] } : { loseStreak: +code[2] };
  const word = streak?.match(/(\d+)\s*(wins?|loss(?:es)?)/i);
  if (!word) return {};
  return /loss/i.test(word[2]) ? { loseStreak: +word[1] } : { winStreak: +word[1] };
}

function gematriaSide(input: VoteInput, side: "home" | "away"): GematriaSideInput {
  const team = input[side];
  const record = recordParts(team.record);
  const venue = [
    ...(input.city && input.region ? [{ role: "City + State", name: `${input.city}, ${input.region}` }] : []),
    ...(input.city ? [{ role: "City", name: input.city }] : []),
    ...(input.stadium ? [{ role: "Stadium", name: input.stadium }] : []),
  ];
  const namedPeople = new Map<string, { role: string; name: string; dob?: string }>();
  for (const person of [...team.people, ...(team.gematriaPeople ?? [])]) {
    if (!/^(coach|manager|owner|player|quarterback|pitcher|goalie|fighter|goalkeeper)$/i.test(person.role)) continue;
    const key = `${person.role.toLowerCase()}|${person.name.trim().toLowerCase()}`;
    if (!namedPeople.has(key)) namedPeople.set(key, { role: person.role, name: person.name, dob: person.dob });
  }
  const jerseys = team.people
    .map((person) => Number(String(person.jersey ?? "").replace(/[^\d]/g, "")))
    .filter((number) => Number.isFinite(number) && number > 0);
  return {
    team: team.name,
    shortName: team.shortName,
    founded: team.founded,
    people: [...namedPeople.values()],
    venue,
    ...streakParts(team.streak),
    seriesWins: team.seriesWins,
    h2hWins: team.h2hWins,
    seasonWins: record.wins,
    seasonLosses: record.losses,
    homeRecord: team.splitHome,
    roadRecord: team.splitRoad,
    jerseys,
  };
}

export function decodeLearnedGematria(input: VoteInput): GematriaDecode {
  return gematriaDecode({
    year: input.year,
    month: input.month,
    day: input.day,
    homeName: input.home.name,
    awayName: input.away.name,
    home: gematriaSide(input, "home"),
    away: gematriaSide(input, "away"),
    priorNumbers: input.priorNumbers,
    sharedSeries: input.sharedSeries,
    integrated: input.codeMode !== "backup",
  });
}

function gematriaVote(input: VoteInput): LearnedScreenshotVote | null {
  const decode = decodeLearnedGematria(input);
  const difference = decode.home.score - decode.away.score;
  if (decode.ignored || difference === 0) return null;

  const side = difference > 0 ? "home" : "away";
  const leader = side === "home" ? decode.home : decode.away;
  const weight = Math.min(0.6, Math.round(Math.abs(difference) * 0.1 * 100) / 100);
  if (weight <= 0) return null;
  return {
    side,
    weight,
    layer: "Number pairs",
    signalId: "Number pairs/learned-screenshot-gematria",
    reason: `Five-cipher name/date/record match: ${leader.team} leads ${side === "home" ? decode.away.score : decode.home.score}–${leader.score}; capped supporting separator`,
  };
}

const WESTERN_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function signAspectScore(first: string, second: string) {
  const a = WESTERN_ORDER.indexOf(first);
  const b = WESTERN_ORDER.indexOf(second);
  if (a < 0 || b < 0) return 0;
  const distance = Math.min((a - b + 12) % 12, (b - a + 12) % 12);
  if (distance === 0) return 1; // conjunction
  if (distance === 2) return 0.5; // sextile
  if (distance === 3) return -0.75; // square
  if (distance === 4) return 0.8; // trine
  if (distance === 6) return -0.5; // opposition
  return 0;
}

function sideAstrologyScore(input: VoteInput, side: "home" | "away", eventSun: string, eventMoon: string) {
  const team = input[side];
  let total = 0;
  let coverage = 0;
  const matches: string[] = [];

  const addDate = (label: string, date: readonly [number, number, number] | undefined, roleWeight: number) => {
    if (!date || date.length !== 3) return;
    const sign = westernSign(date[1], date[2]).sign;
    const sunAspect = signAspectScore(sign, eventSun);
    const moonAspect = signAspectScore(sign, eventMoon);
    const value = sunAspect + moonAspect * 0.75;
    total += value * roleWeight;
    coverage += roleWeight;
    if (value !== 0) matches.push(`${label} ${sign} (${value > 0 ? "support" : "friction"})`);
  };

  addDate(input.individual ? "fighter birth Sun" : "team founding Sun", team.founded, 0.5);
  const seen = new Set<string>();
  for (const person of team.people) {
    const role = person.role.toLowerCase();
    const roleWeight = /^(quarterback|pitcher|goalie|fighter|goalkeeper)$/.test(role) ? 1.25
      : role === "player" ? 1
      : /^(coach|manager)$/.test(role) ? 0.65
      : role === "owner" ? 0.25
      : 0;
    const date = dateTuple(person.dob);
    const key = `${person.name.toLowerCase()}|${date?.join("-") ?? ""}`;
    if (!roleWeight || !date || seen.has(key)) continue;
    seen.add(key);
    addDate(person.name, date, roleWeight);
  }

  return {
    score: coverage ? total / coverage : null,
    matches,
  };
}

function westernAstrologyVote(input: VoteInput): LearnedScreenshotVote | null {
  const eventSun = westernSign(input.month, input.day).sign;
  // The existing calendar model estimates the Moon sign from the game date;
  // it does not claim time-specific houses or player birth-chart angles.
  const eventMoon = moonSign(input.year, input.month, input.day);
  const home = sideAstrologyScore(input, "home", eventSun, eventMoon);
  const away = sideAstrologyScore(input, "away", eventSun, eventMoon);
  if (home.score == null || away.score == null) return null;

  const difference = home.score - away.score;
  if (Math.abs(difference) < 0.02) return null;
  const side = difference > 0 ? "home" : "away";
  const leader = side === "home" ? home : away;
  const weight = Math.min(0.35, Math.round(Math.abs(difference) * 0.15 * 100) / 100);
  if (weight <= 0) return null;

  return {
    side,
    weight,
    layer: "Stars & venue",
    signalId: "Stars & venue/western-sign-compatibility",
    reason: `Western astrology: ${input.home.name} ${home.score.toFixed(2)} vs ${input.away.name} ${away.score.toFixed(2)}; game Sun ${eventSun}, estimated Moon ${eventMoon}; ${leader.matches.slice(0, 2).join(", ") || "birth-sign aspects"} support ${side === "home" ? input.home.name : input.away.name}. Birth-time-dependent houses are not inferred`,
  };
}

/** Screenshot-derived signals are limited to the Learned model and need real dates/records. */
export function learnedScreenshotVotes(input: VoteInput): LearnedScreenshotVote[] {
  if (input.codeMode === "backup") return [];
  return [gematriaVote(input), westernAstrologyVote(input)].filter(
    (vote): vote is LearnedScreenshotVote => vote !== null,
  );
}
