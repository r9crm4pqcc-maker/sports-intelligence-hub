import { describe, expect, it } from "vitest";
import { missingSportsFacts, researchQueries, hasFullDateEvidence, applyResearchedFacts, approvedResearchFacts, researchFactKey, resolvedResearchTasks } from "@/lib/sports-research";
import { applyPeopleOverrides } from "@/lib/sports-people-overrides";
import type { VoteInput } from "@/lib/vote-decode";
const input: VoteInput = { year: 2026, month: 11, day: 26, league: "NFL", away: { name: "Chicago Bears", people: [{ role: "quarterback", name: "Caleb Williams" }] }, home: { name: "Detroit Lions", people: [] } };
describe("Missing sports facts", () => {
  it("carries the sourced owner's identity into birthday research without approving it", () => {
    const facts = [{ id: "home:name:owner", value: "Sheila Ford Hamp", sourceUrl: "https://www.detroitlions.com/", quote: "Principal Owner Sheila Ford Hamp" }];
    const tasks = resolvedResearchTasks(missingSportsFacts(input), facts);
    expect(tasks.find(t => t.id === "home:dob:owner")?.name).toBe("Sheila Ford Hamp");
    expect(tasks.find(t => t.id === "home:dob:coach")?.name).toBe("");
    expect(approvedResearchFacts(facts, [])).toEqual([]);
    expect(applyResearchedFacts(input, approvedResearchFacts(facts, [])).home.people).toEqual([]);
  });
  it("requires an exact full date in source evidence", () => {
    expect(hasFullDateEvidence("2001-11-18", "Caleb Williams was born November 18, 2001.")).toBe(true);
    expect(hasFullDateEvidence("2001-11-18", "Caleb Williams was born in 2001.")).toBe(false);
    expect(hasFullDateEvidence("2001-11-18", "Born November 19, 2001.")).toBe(false);
    expect(hasFullDateEvidence("2001-02-30", "Born February 30, 2001.")).toBe(false);
  });
  it("researches named players separately from coach and owner", () => {
    const queries = researchQueries(missingSportsFacts(input), "NFL", "2026-11-26");
    expect(queries.some(q => q.includes('"Caleb Williams"') && q.includes("birthday"))).toBe(true);
    expect(queries.some(q => q.includes("head coach"))).toBe(true);
    expect(queries.some(q => q.includes("principal owner"))).toBe(true);
    expect(queries.some(q => q.includes("confirmed starting quarterback") && q.includes("2026-11-26"))).toBe(true);
  });
  it("finds missing NHL goalies and NBA players as well as football quarterbacks", () => {
    expect(missingSportsFacts({ ...input, league: "NHL" }).some(t => t.id === "home:name:goalie")).toBe(true);
    expect(missingSportsFacts({ ...input, league: "NBA" }).some(t => t.id === "home:name:player")).toBe(true);
  });
  it("keeps approved researched birthdays when an unchanged manual name has no birthday", () => {
    const fact = { id: "away:dob:0", value: "2001-11-18", sourceUrl: "https://www.chicagobears.com/", quote: "Born November 18, 2001" };
    const researched = applyResearchedFacts(input, approvedResearchFacts([fact], [researchFactKey(fact)]));
    const result = applyPeopleOverrides(researched, { away: [{ id: "quarterback", role: "quarterback", name: "Caleb Williams", dob: "" }], home: [] });
    expect(result.away.people?.find(p => p.role === "quarterback")?.dob).toBe("2001-11-18");
    const corrected = applyPeopleOverrides(researched, { away: [{ id: "quarterback", role: "quarterback", name: "Caleb Williams", dob: "2001-11-19" }], home: [] });
    expect(corrected.away.people?.[0]?.dob).toBe("2001-11-19");
  });
});