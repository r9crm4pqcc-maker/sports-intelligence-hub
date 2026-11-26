import { describe, it, expect } from "vitest";
import { approvedResearchFacts, researchFactKey, sourceCredibility } from "@/lib/sports-research";
import { GEMSTONE_RANKING, gemstoneTiming, MAIN_LUCKY_NUMBER } from "@/lib/gemstone-timing";
import { updateOverridePerson } from "@/lib/sports-people-overrides";
const fact = { id: "away:dob:0", value: "2001-11-18", sourceUrl: "https://www.chicagobears.com/team/players-roster/caleb-williams/", quote: "Born November 18, 2001" };
describe("Sports verification", () => {
  it("clears a person's verification when their birthday changes", () => { const p = { id: "quarterback", role: "quarterback" as const, name: "Caleb Williams", dob: "2001-11-18", verified: true }; expect(updateOverridePerson(p, { dob: "2001-11-19" }).verified).toBe(false); expect(updateOverridePerson(p, { verified: true }).verified).toBe(true); });
  it("does not use any research without user confirmation", () => { expect(approvedResearchFacts([fact], [])).toEqual([]); });
  it("applies only the exact confirmed fact and revokes changed values", () => { expect(approvedResearchFacts([fact], [researchFactKey(fact)])).toEqual([fact]); expect(approvedResearchFacts([{ ...fact, value: "2002-11-18" }], [researchFactKey(fact)])).toEqual([]); });
  it("prioritizes official sources and rejects lookalike and unknown domains", () => { expect(sourceCredibility(fact.sourceUrl)).toBe("Official / primary"); expect(sourceCredibility("https://www.espn.com/nfl")).toBe("Established sports reference"); expect(sourceCredibility("https://espn.com.fake.example/nfl")).toBe("Unverified source"); });
});
describe("Personal gemstone rules", () => {
  it("keeps the main lucky number 99", () => { expect(MAIN_LUCKY_NUMBER).toBe(99); });
  it("keeps Coral, Ruby, Pearl, Sapphire in fixed order", () => { expect(GEMSTONE_RANKING.map(g => g.stone)).toEqual(["Red Coral", "Ruby", "Pearl", "Blue Sapphire"]); });
  it("blocks Sapphire before the supplied October 24 cutoff", () => { expect(gemstoneTiming(new Date("2027-10-24T12:00:00Z")).sapphireBlocked).toBe(true); });
  it("blocks new intense stones during August–November season", () => { expect(gemstoneTiming(new Date("2027-11-25T12:00:00Z")).sapphireBlocked).toBe(true); });
  it("requires clean Coral testing before Ruby, even after four weeks", () => { expect(gemstoneTiming(new Date("2027-07-29T12:00:00Z"), "2027-07-01", false).rubyReady).toBe(false); expect(gemstoneTiming(new Date("2027-07-29T12:00:00Z"), "2027-07-01", true).rubyReady).toBe(true); expect(gemstoneTiming(new Date("2027-07-15T12:00:00Z"), "2027-07-01", true).rubyReady).toBe(false); });
});