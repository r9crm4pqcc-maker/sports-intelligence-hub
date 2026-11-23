import { describe, expect, it } from "vitest";
import { buildStoryReading, dateQuality, hourStory, type StoryEntityInput, type StoryGameInput } from "@/lib/sports-story-reading";
import { lahiriAyanamsa } from "@/lib/transits";

const n = (x: number) => ({ compound: x, reduced: x });
const read = (o: Partial<NonNullable<StoryEntityInput["read"]>> = {}) => ({
  lp: n(5), py: n(5), pm: n(5), pd: n(5), pw: n(5), ph: [5, 5, 5] as const, hourKnown: true, lucky: 50, today: [] as string[], ...o,
});
const game = (entities: StoryEntityInput[], extra: Partial<StoryGameInput> = {}): StoryGameInput => ({
  away: "Away FC", home: "Home FC", dateLabel: "11/23/2026", league: "NFL", year: 2026, month: 11, day: 23,
  dayLp: n(7), secondary: n(5), doyRoot: 3, woyRoot: 3, moonPhase: "Full Moon", yearSign: "Horse", monthSign: "Pig",
  relation: () => "neutral", entities, ...extra,
});

describe("Story Reading method", () => {
  it("Fatal Attraction is a stronger caution than a Challenging date", () => {
    expect(dateQuality("Fatal Attraction")).toBeLessThan(dateQuality("Challenging"));
  });
  it("closing hours 1, 8, 9 and 11 are finishing hours", () => {
    for (const c of [1, 8, 9, 11]) expect(hourStory([3, 4, c], 7, () => "neutral").closing).toBe("strong");
    expect(hourStory([3, 4, 6], 7, () => "neutral").closing).toBe("weak");
  });
  it("reads a strong start with a weak close as fading", () => {
    expect(hourStory([8, 8, 4], 7, () => "neutral").arc).toBe("starts strong and fades");
  });
  it("trusts the cleaner stack over the better record", () => {
    const r = buildStoryReading(game([
      { side: "away", kind: "team", name: "Away FC", record: "2-6", read: read({ today: ["Game date is a Soulmate date"], ph: [4, 4, 8] }) },
      { side: "home", kind: "team", name: "Home FC", record: "8-0", read: read({ ph: [4, 4, 6] }) },
    ]));
    expect(r.selected).toBe("away");
    expect(r.conflict).toMatch(/trust the stack/);
  });
  it("flags a 9-game win streak as ending energy", () => {
    const r = buildStoryReading(game([
      { side: "away", kind: "team", name: "Away FC", record: "9-0", streak: "W9", read: read() },
      { side: "home", kind: "team", name: "Home FC", record: "4-5", read: read() },
    ]));
    expect(r.layers.find((l) => l.title.startsWith("Away FC"))?.lines.join(" ")).toMatch(/9 is endings/);
  });
  it("applies the Super Bowl rule to a 9 Life Path quarterback", () => {
    const r = buildStoryReading(game([
      { side: "away", kind: "team", name: "Away FC", record: "12-5", read: read() },
      { side: "away", kind: "player", name: "QB Nine", role: "quarterback", date: [1990, 1, 1], read: read({ lp: n(9) }) },
      { side: "home", kind: "team", name: "Home FC", record: "12-5", read: read() },
    ], { eventName: "Super Bowl LXI" }));
    expect(r.selected).toBe("home");
  });
  it("never hides behind a percentage", () => {
    const r = buildStoryReading(game([
      { side: "away", kind: "team", name: "Away FC", record: "3-3", read: read() },
      { side: "home", kind: "team", name: "Home FC", record: "3-3", read: read() },
    ]));
    expect(r.text).not.toMatch(/%/);
    expect(r.text).toMatch(/^GAME: Away FC @ Home FC — 11\/23\/2026/);
    expect(["High", "Medium-High", "Medium"]).toContain(r.confidence);
  });
});

describe("Tropical vs sidereal", () => {
  it("Lahiri ayanamsa is about 24.2 degrees in the 2020s", () => {
    expect(lahiriAyanamsa(new Date("2026-01-01T00:00Z"))).toBeCloseTo(24.2, 1);
  });
});
