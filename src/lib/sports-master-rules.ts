import { sportsCycles, sportsRoot } from "./sports-cycles";
import { cueMatchPercent } from "./path28";
import { healingood } from "./healingood";
import { learnedColorNumbers, sumTeamLogoColors } from "./sports-color-code";
import { annualSportsCode } from "./sports-prediction-rules";
import { candidateSportsLifePath } from "./sports-method-candidate";

type Side = "home" | "away";
type DateParts = readonly [number, number, number];
interface Person { name: string; role: string; dob?: string; jersey?: string }
interface Team { name: string; founded?: DateParts; people: Person[]; colors?: string[]; record?: string }
interface Context {
  year: number; month: number; day: number; league?: string; eventName?: string; individual?: boolean; candidateMethod?: boolean;
  home: Team; away: Team; city?: string; cityFounded?: DateParts; stadiumOpened?: DateParts;
}
const digits = (n: number) => [...String(Math.abs(n))].reduce((s, x) => s + +x, 0);
const lp = ([y, m, d]: DateParts, candidateMethod = false) =>
  candidateMethod
    ? candidateSportsLifePath(y, m, d, animal(y) === "Snake").reduced
    : sportsRoot(digits(y) + digits(m) + digits(d));
const signs = ["Rat", "Ox", "Tiger", "Cat", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const animal = (y: number) => signs[((y - 4) % 12 + 12) % 12];
const ordinal = (name: string) => [...name.toUpperCase().replace(/[^A-Z]/g, "")].reduce((s, c) => s + c.charCodeAt(0) - 64, 0);
const born = (dob?: string): DateParts | undefined => {
  const m = dob?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? [+m[1], +m[2], +m[3]] : undefined;
};
function annualTeamCodeMatches(team: Team, year: number, month: number, day: number, code: number, energy: number, candidateMethod = false): string[] {
  const signals: { label: string; values: number[] }[] = [];
  const add = (label: string, ...values: number[]) => signals.push({ label, values: values.filter(Number.isFinite) });
  if (team.founded) {
    const [y, m, d] = team.founded;
    const rawLifePath = candidateMethod
      ? candidateSportsLifePath(y, m, d, animal(y) === "Snake").compound
      : digits(y) + digits(m) + digits(d);
    const cycles = sportsCycles(m, d, year, month, day);
    add("founding Life Path", rawLifePath, sportsRoot(rawLifePath));
    add("founding day", d, sportsRoot(d));
    add("Personal Year", cycles.py.compound, cycles.py.fullCode, cycles.py.root);
    add("Personal Month", cycles.pm.compound, cycles.pm.reduced);
    add("Personal Day", cycles.pd.compound, cycles.pd.reduced);
  }
  const teamNameCode = ordinal(team.name);
  add("team name code", teamNameCode, sportsRoot(teamNameCode));
  for (const color of team.colors ?? []) add(`${color} color`, ...learnedColorNumbers(color));
  const combinedColors = sumTeamLogoColors(team.colors);
  if (combinedColors) add("combined logo color code", combinedColors.compound, combinedColors.reduced);
  const colors = (team.colors ?? []).map(color => color.toLowerCase());
  const hasBlue = colors.some(color => /\bblue\b/.test(color));
  const hasYellow = colors.some(color => /\byellow\b/.test(color));
  if (hasBlue && hasYellow) add("Blue + Yellow color stack", 6);
  const matches = (value: number) => value === code || sportsRoot(value) === energy;
  return [...new Set(signals.filter(signal => signal.values.some(matches)).map(signal => signal.label))];
}
/** Interpretive rules, not empirically established probabilities. Never reads final scores. */
export function masterRuleVotes(inp: Context) {
  const votes: { side: Side; weight: number; layer: "Game-day energy" | "Team core" | "Stars & venue" | "Chinese zodiac" | "Colors" | "Records"; reason: string }[] = [];
  const add = (side: Side, weight: number, layer: (typeof votes)[number]["layer"], reason: string) => votes.push({ side, weight, layer, reason });
  const ud = sportsRoot(digits(inp.year) + digits(inp.month) + digits(inp.day));
  const uy = sportsRoot(digits(inp.year));
  const cy = animal(inp.year);
  const championship = /\b(super bowl|finals?|championship|title game|world series|stanley cup)\b/i.test(inp.eventName || "");
  const opposing = (s: Side): Side => s === "home" ? "away" : "home";
  if (championship) {
    const yearly = annualSportsCode(inp.year);
    const homeMatches = annualTeamCodeMatches(inp.home, inp.year, inp.month, inp.day, yearly.code, yearly.energy, inp.candidateMethod);
    const awayMatches = annualTeamCodeMatches(inp.away, inp.year, inp.month, inp.day, yearly.code, yearly.energy, inp.candidateMethod);
    const homeCoreMatches = homeMatches.filter(label => !/color/i.test(label));
    const awayCoreMatches = awayMatches.filter(label => !/color/i.test(label));
    const difference = homeCoreMatches.length - awayCoreMatches.length;
    if (difference !== 0) {
      const side: Side = difference > 0 ? "home" : "away";
      const matches = side === "home" ? homeMatches : awayMatches;
      const colorCount = (side === "home" ? homeMatches : awayMatches).filter(label => /color/i.test(label)).length;
      const opposingColorCount = (side === "home" ? awayMatches : homeMatches).filter(label => /color/i.test(label)).length;
      const weight = Math.min(0.6, 0.2 * Math.abs(difference) + 0.05 * Math.max(0, colorCount - opposingColorCount));
      const matchedTeam = side === "home" ? inp.home.name : inp.away.name;
      add(side, weight, "Team core", `Championship annual code ${yearly.label}: ${matchedTeam} has the stronger team-code match (${matches.join(", ")}); color matches add support only`);
    }
  }
  const compatibilityVote = (side: Side, name: string, b?: DateParts) => {
    if (!b) return;
    const fit = cueMatchPercent(b, inp.year, inp.month, inp.day);
    if (fit) {
      const weight = Math.abs(fit.pct - 50) / 100;
      add(fit.pct >= 50 ? side : opposing(side), weight, "Game-day energy", `${name}: ${fit.pct}% full-birthdate daily compatibility (same calendar model)`);
    }
    const h = healingood(b[1], b[2]);
    const on = (k: keyof typeof h) => h[k].some(([m, d]) => m === inp.month && d === inp.day);
    if (on("fatal")) add(opposing(side), 1.5, "Game-day energy", `${name}: Fatal Attraction date — fade`);
    else if (on("soulmate")) add(side, 0.75, "Game-day energy", `${name}: Soulmate date — boost even with neutral compatibility`);
    else if (on("beneficial")) add(side, 0.35, "Game-day energy", `${name}: Beneficial date`);
    else if (on("challenging") && fit && fit.pct < 50) add(opposing(side), 0.2, "Game-day energy", `${name}: Challenging date with below-neutral compatibility; high compatibility remains playable`);
  };
  for (const side of ["home", "away"] as const) {
    const team = inp[side];
    compatibilityVote(side, team.name, team.founded);
    for (const p of team.people) {
      const b = born(p.dob);
      if (!b) continue;
      compatibilityVote(side, p.name, b);
      const c = sportsCycles(b[1], b[2], inp.year, inp.month, inp.day);
      const a = animal(b[0]);
      const scoringRole = /^(player|quarterback|pitcher|goalie|fighter)$/i.test(p.role);
      if (scoringRole && c.pd.reduced === 9 && ud === 9)
        add(opposing(side), 1.25, "Game-day energy", `${p.name}: Personal Day 9 + Universal Day 9 — high-usage scoring fade`);
      if (scoringRole && c.pd.reduced === sportsRoot(b[2]))
        add(side, 0.65, "Game-day energy", `${p.name}: Personal Day matches Birthday Number — prioritized over Life Path matching`);
      if (scoringRole && b[2] === inp.day)
        add(side, 0.25, "Stars & venue", `${p.name}: birthday number matches the calendar day`);
      const birthday = Date.UTC(inp.year, b[1] - 1, b[2]);
      const distance = Math.abs(Date.UTC(inp.year, inp.month - 1, inp.day) - birthday) / 86400000;
      if (scoringRole && (distance <= 3 || distance >= 362))
        add(side, 0.25, "Stars & venue", `${p.name}: birthday-week statement-performance window`);
      if (scoringRole && ud === 7 && c.pd.reduced === 7 && team.colors?.some(x => /purple|violet|magenta|cyan/i.test(x)))
        add(opposing(side), 0.75, "Colors", `${p.name}: stacked Personal Day 7, Universal Day 7 and 7-color — avoid high-volume scoring props`);
      if (championship && cy === "Horse" && ["Horse", "Dog", "Tiger"].includes(a))
        add(side, 0.35, "Chinese zodiac", `${p.name}: Horse/Dog/Tiger environmental boost in a Horse-year championship`);
      if (a === "Snake" && cy === "Pig")
        add(side, 0.2, "Chinese zodiac", `${p.name}: supplied Snake/Pig skill-player observation (soft, not a zodiac-day rule)`);
      if (a === "Ox" && ["Snake", "Rooster"].includes(cy) && /player|goalkeeper|defen/i.test(p.role))
        add(side, 0.2, "Chinese zodiac", `${p.name}: Ox-year defensive-anchor support in ${cy} year`);
      if (p.role === "owner" && lp(b, inp.candidateMethod) === uy)
        add(side, 0.3, "Stars & venue", `${p.name}: owner's Life Path matches Universal Year — franchise legacy signal`);
      const jersey = Number(p.jersey);
      if (scoringRole && [10, 21, 32].includes(jersey))
        add(opposing(side), 0.1, "Stars & venue", `${p.name} #${jersey}: one-below-master incomplete-energy caution`);
      if (scoringRole && [13, 24, 35].includes(jersey))
        add(opposing(side), 0.1, "Stars & venue", `${p.name} #${jersey}: two-above-master volatility observation`);
    }
    // Calendar chart matching remains the app's existing common personal-calendar model.
    if (inp.city && sportsRoot(ordinal(inp.city)) === ud && side === "home")
      add(side, 0.3, "Stars & venue", `City letterology matches Universal Day ${ud} — soft home-energy multiplier`);
    if (team.name.toLowerCase().includes("michigan")) {
      const campus = team.founded;
      if (campus?.[0] === 1817 && campus[1] === 8 && campus[2] === 26 && inp.year === 2026)
        add(side, 0.3, "Game-day energy", "Michigan: 8/26/1817 = 33; founding day 26 matches 2026; Michigan Wolverines ordinal 64 + 142 = 206. Appearance counts require an event-specific source.");
    }
  }
  compatibilityVote("home", "Stadium", inp.stadiumOpened);
  compatibilityVote("home", inp.city || "City", inp.cityFounded);
  if (!inp.individual && inp.stadiumOpened && ["Dog", "Horse", "Tiger"].includes(animal(inp.stadiumOpened[0])) && [1, 8].includes(ud))
    add("home", 0.3, "Stars & venue", "Dog/Horse/Tiger-founded stadium amplifies home energy on a 1/8 Universal Day");
  if (!inp.individual && [4, 8].includes(ud)) {
    const pct = (r?: string) => { const m = r?.match(/(\d+)-(\d+)/); return m && +m[1] + +m[2] ? +m[1] / (+m[1] + +m[2]) : null; };
    const h = pct(inp.home.record), a = pct(inp.away.record);
    if (h !== null && a !== null && h < a)
      add("home", 0.25, "Stars & venue", "Home underdog on a 4/8 day — soft spread-cover signal, not a moneyline guarantee");
  }
  return { votes };
}
