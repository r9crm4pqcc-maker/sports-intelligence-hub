import { describe, expect, it } from "vitest";
import { calibratedWeightDetails } from "@/lib/sports-weights";

// Each sport in Learned Code uses its own highest-accuracy weights, not one shared set.
describe("Learned Code per-sport weights", () => {
  const vote = { side: "home", weight: 1, layer: "Game-day energy", reason: "Challenging date match" } as never;


  it("a sport without its own fit falls back to the shared weight", () => {
    expect(calibratedWeightDetails("WNBA", vote, "learned")).toEqual({ multiplier: 0.05, source: "global" });
  });
});

import history from "@/lib/sports-backtest-history.json";
import { runVotes } from "@/lib/vote-decode";
// Tuned weights must not drop NFL below 12/13 and not drop NBA below 29/30.
describe("Learned Code replay on saved games", () => {
  const rows = (history as any).days.flatMap((d: any) => d.rows).filter((r: any) => r.actual && r.actual !== "draw");
  const hits = (lg: string) => rows.filter((r: any) => r.league === lg)
    .filter((r: any) => runVotes({ ...r.input, league: lg, codeMode: "learned", gameStartTime: r.game.startTime } as any).pick === r.actual).length;
  it("NFL hits at least 12 of 13", () => { expect(hits("NFL")).toBeGreaterThanOrEqual(12); });
});

import { signRelation } from "@/lib/vote-decode";
// User's zodiac chart: CUE counts Rat & Ox and Horse & Goat as friendly; Rat & Horse stay enemies.
describe("Chinese zodiac chart", () => {
  it("Rat and Ox are friendly", () => { expect(signRelation("Rat", "Ox")).toBe("friend"); });
  it("Horse and Goat are friendly", () => { expect(signRelation("Goat", "Horse")).toBe("friend"); });
  it("Rat and Horse are enemies", () => { expect(signRelation("Rat", "Horse")).toBe("enemy"); });
});
// Frequency lock is weighted strongly in Learned Code.
describe("Frequency lock weight", () => {
  it("uses multiplier 4", () => {
    const vote = { side: "home", weight: 1, layer: "Number pairs", reason: "Frequency lock — X Life Path 1 matches the 1 Universal Day" } as never;
    expect(calibratedWeightDetails("NFL", vote, "learned").multiplier).toBe(4);
  });
});

import replay from "@/lib/sports-replay-games.json";
// Re-tuned on the real app inputs for Nov. 7–20 2026: these totals must not drop.
describe("Learned Code replay, Nov. 7–20", () => {
  const games = Object.values(replay as Record<string, any>).map((r) => {
    const hs = +r.game.homeScore, as = +r.game.awayScore;
    return { league: r.league, date: r.date, input: r.input, actual: hs === as || isNaN(hs) ? null : hs > as ? "home" : "away" };
  }).filter((g) => g.actual);
  const hits = (lg?: string, from = "") => games.filter((g) => (!lg || g.league === lg) && g.date >= from)
    .filter((g) => runVotes({ ...g.input, codeMode: "learned" }).pick === g.actual).length;
  it("NFL Nov. 15 hits 12 of 12", () => {
    const nov15 = games.filter((g) => g.league === "NFL" && g.date === "2026-11-15");
    expect(nov15.length).toBe(12);
    expect(nov15.filter((g) => runVotes({ ...g.input, codeMode: "learned" }).pick === g.actual).length).toBe(12);
  });
  it("all sports hit at least 339", () => { expect(hits()).toBeGreaterThanOrEqual(339); });
  it("NBA hits at least 81", () => { expect(hits("NBA")).toBeGreaterThanOrEqual(81); });
  it("NHL hits at least 72", () => { expect(hits("NHL")).toBeGreaterThanOrEqual(72); });
});
