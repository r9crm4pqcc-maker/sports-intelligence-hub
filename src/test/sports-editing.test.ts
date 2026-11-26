import { describe, expect, it, beforeEach, vi } from "vitest";
import { displayDate, storedDate } from "@/lib/display-date";
import { calendarRitualsFor } from "@/lib/calendar-rituals";
import { saveGamePeopleOverride, getGamePeopleOverride, applyPeopleOverrides } from "@/lib/sports-people-overrides";
import { applyResearchedFacts, missingSportsFacts } from "@/lib/sports-research";
import type { VoteInput } from "@/lib/vote-decode";
const input: VoteInput = { year: 2026, month: 11, day: 26, league: "NFL", away: { name: "Chicago Bears", people: [{ name: "Caleb Williams", role: "quarterback" }] }, home: { name: "Detroit Lions", people: [{ name: "Jared Goff", role: "quarterback", dob: "1994-10-14" }] } };
beforeEach(() => localStorage.clear());
describe("Sports editing", () => {
  it("converts database dates to MM/DD/YYYY", () => { expect(displayDate("2009-09-08")).toBe("09/08/2009"); expect(storedDate("09/08/2009")).toBe("2009-09-08"); });
  it("rejects impossible birthdays", () => { expect(storedDate("02/30/2009")).toBeNull(); expect(storedDate("02/29/2024")).toBe("2024-02-29"); });
  it("saves every player correction without a submit action", () => { const data = { away: [{ id: "quarterback", role: "quarterback" as const, name: "Caleb Williams", dob: "2001-11-18", jersey: "18" }], home: [] }; saveGamePeopleOverride("NFL:2026-11-26:CHI@DET", data); expect(getGamePeopleOverride("NFL:2026-11-26:CHI@DET")).toEqual(data); expect(applyPeopleOverrides(input, data).away.people?.[0]?.dob).toBe("2001-11-18"); });
  it("surfaces storage errors instead of claiming a save", () => { const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); }); expect(() => saveGamePeopleOverride("game", { away: [], home: [] })).toThrow("could not be saved"); spy.mockRestore(); });
  it("research fills only missing birthdays and never replaces a verified starter", () => { expect(missingSportsFacts(input).some(t => t.id === "home:dob:0")).toBe(false); const next = applyResearchedFacts(input, [{ id: "away:dob:0", value: "2001-11-18", sourceUrl: "https://www.chicagobears.com/team/players-roster/caleb-williams/", quote: "Born November 18, 2001" }, { id: "home:dob:0", value: "2000-01-01", sourceUrl: "https://www.espn.com", quote: "not a requested fact" }]); expect(next.away.people?.[0]?.dob).toBe("2001-11-18"); expect(next.home.people?.[0]?.dob).toBe("1994-10-14"); });
});
describe("Calendar ritual restrictions", () => {
  it("keeps the wealth shower ritual on a wealth-marked day", () => { expect(calendarRitualsFor(2026, 11, 7, true).allowed.some(r => r.title === "The Shower Ritual")).toBe(true); });
  it("skips the wealth shower ritual on a non-wealth 7th and blocks grooming", () => { const read = calendarRitualsFor(2026, 11, 7); expect(read.allowed.some(r => r.title === "The Shower Ritual")).toBe(false); expect(read.allowed.some(r => /grooming|haircut/i.test(r.title))).toBe(false); });
  it("blocks wealth grooming when a universal 7 conflicts with the 28th", () => { const read = calendarRitualsFor(2026, 5, 28); expect(read.blocked.some(r => r.title === "Wealth Haircut Maxing")).toBe(true); expect(read.allowed.some(r => r.title === "The Shower Ritual")).toBe(true); });
});
