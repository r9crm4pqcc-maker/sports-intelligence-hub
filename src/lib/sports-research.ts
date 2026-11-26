import type { VoteInput, VotePerson } from "./vote-decode";
export type ResearchRequest = { id: string; team: string; role: string; name: string; field: "dob" | "name" | "founded" };
export type ResearchFact = { id: string; value: string; sourceUrl: string; quote: string };
export function researchFactKey(fact: ResearchFact): string { return JSON.stringify([fact.id, fact.value, fact.sourceUrl, fact.quote]); }
export function approvedResearchFacts(facts: ResearchFact[], approved: string[]): ResearchFact[] { return facts.filter(f => approved.includes(researchFactKey(f))); }
export function sourceCredibility(url: string): "Official / primary" | "Established sports reference" | "Unverified source" {
  let host: string;
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { return "Unverified source"; }
  const matches = (domains: string[]) => domains.some(d => host === d || host.endsWith(`.${d}`));
  if (/\.(edu|gov)$/.test(host) || matches(["nfl.com", "nba.com", "nhl.com", "mlb.com", "ncaa.com", "chicagobears.com", "detroitlions.com", "bengals.com", "steelers.com", "jaguars.com", "chiefs.com", "philadelphiaeagles.com", "49ers.com", "packers.com", "baltimoreravens.com", "buccaneers.com", "buffalobills.com", "seahawks.com", "dallascowboys.com", "patriots.com", "houstontexans.com", "newyorkjets.com", "giants.com", "colts.com", "titansonline.com", "tennesseetitans.com", "raiders.com", "denverbroncos.com", "chargers.com", "miamidolphins.com", "panthers.com", "azcardinals.com", "therams.com", "clevelandbrowns.com", "neworleanssaints.com", "atlantafalcons.com", "vikings.com", "commanders.com"])) return "Official / primary";
  if (matches(["espn.com", "sports-reference.com", "pro-football-reference.com", "basketball-reference.com", "hockey-reference.com", "baseball-reference.com", "reuters.com", "apnews.com", "bbc.com", "rotowire.com"])) return "Established sports reference";
  return "Unverified source";
}
export function missingSportsFacts(input: VoteInput): ResearchRequest[] {
  if (input.individual) return [];
  const tasks: ResearchRequest[] = [];
  for (const side of ["away", "home"] as const) {
    const team = input[side];
    if (!team.founded) tasks.push({ id: `${side}:founded`, team: team.name, role: "team", name: team.name, field: "founded" });
    const people = team.people ?? [];
    for (const [i, p] of people.entries()) if (p.name && !p.dob) tasks.push({ id: `${side}:dob:${i}`, team: team.name, role: p.role || "player", name: p.name, field: "dob" });
    for (const role of ["coach", "owner", ...(input.league === "NFL" || input.league === "College Football" ? ["quarterback"] : [])]) {
      if (!people.some(p => p.role === role && p.name)) {
        tasks.push({ id: `${side}:name:${role}`, team: team.name, role, name: "", field: "name" });
        tasks.push({ id: `${side}:dob:${role}`, team: team.name, role, name: "", field: "dob" });
      }
    }
  }
  return tasks.slice(0, 12);
}
export function applyResearchedFacts(input: VoteInput, facts: ResearchFact[]): VoteInput {
  const tasks = missingSportsFacts(input);
  const next: VoteInput = { ...input, away: { ...input.away, people: [...(input.away.people ?? [])] }, home: { ...input.home, people: [...(input.home.people ?? [])] } };
  for (const fact of [...facts].sort((a, b) => Number(!a.id.includes(":name:")) - Number(!b.id.includes(":name:")))) {
    const task = tasks.find(t => t.id === fact.id);
    if (!task) continue;
    const side = task.id.startsWith("away:") ? next.away : next.home;
    if (task.field === "founded") {
      const parts = fact.value.split("-").map(Number);
      if (parts.length === 3 && parts.every(Number.isFinite)) side.founded = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
    } else if (task.field === "dob") {
      const token = task.id.split(":")[2];
      const i = /^\d+$/.test(token ?? "") ? Number(token) : (side.people ?? []).findIndex(p => p.role === token);
      const p = side.people?.[i];
      if (p && !p.dob && side.people) side.people[i] = { ...p, dob: fact.value };
    } else {
      const person: VotePerson = { name: fact.value, role: task.role as VotePerson["role"] };
      side.people?.push(person);
    }
  }
  return next;
}
