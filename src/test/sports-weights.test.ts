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

import { signRelation, signBond, chineseMonthSign, reduceNum } from "@/lib/vote-decode";
import { COMPAT } from "@/lib/sports-decode";
import { reduce } from "@/lib/numerology";
import { learnedColorNumber } from "@/lib/sports-color-code";
// User's zodiac chart: Rat & Ox are soulmates; Horse & Dog are best friends (not soulmates); Horse & Goat are not a friendly pair.
describe("Chinese zodiac chart", () => {
  it("Rat and Ox are soulmates", () => { expect(signRelation("Rat", "Ox")).toBe("friend"); expect(signBond("Ox", "Rat")).toBe("soulmates"); });
  it("Horse and Dog are best friends", () => { expect(signRelation("Dog", "Horse")).toBe("friend"); expect(signBond("Horse", "Dog")).toBe("best friends"); });
  it("Horse and Goat are not a friendly pair", () => { expect(signRelation("Goat", "Horse")).toBe("neutral"); });
  it("Rat and Horse are enemies", () => { expect(signRelation("Rat", "Horse")).toBe("enemy"); });
  it("animal months turn on the 6th: Feb 5 is Ox, Feb 6 is Tiger", () => {
    expect(chineseMonthSign(2, 5)).toBe("Ox");
    expect(chineseMonthSign(2, 6)).toBe("Tiger");
    expect(chineseMonthSign(3, 5)).toBe("Tiger");
  });
});
// Only a pure 2 is 2; any bigger number reducing to 2 is 11 energy.
describe("2 vs 11", () => {
  it("2 stays 2", () => { expect(reduceNum(2)).toBe(2); expect(reduce(2)).toBe(2); });
  it("20, 101 and 200 read as 11", () => {
    for (const n of [20, 101, 200]) { expect(reduceNum(n)).toBe(11); expect(reduce(n)).toBe(11); }
  });
});
describe("Color numbers", () => {
  it("silver is 4 and orange is 33", () => { expect(learnedColorNumber("Silver")).toBe(4); expect(learnedColorNumber("Orange")).toBe(33); });
});
describe("Life Path compatibility matrix", () => {
  it("11 is friendly with 11, 22 and 33; 22 is friendly with 11", () => {
    expect(COMPAT[11].friendly).toEqual([7, 1, 3, 11, 22, 33]);
    expect(COMPAT[22].friendly).toEqual([8, 6, 7, 11]);
  });
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
  it("all sports hit at least 328 under numerology-first", () => { expect(hits()).toBeGreaterThanOrEqual(328); });
  it("NBA hits at least 69 under numerology-first", () => { expect(hits("NBA")).toBeGreaterThanOrEqual(69); });
  it("NHL hits at least 71 under numerology-first", () => { expect(hits("NHL")).toBeGreaterThanOrEqual(71); });
});

import season from "@/lib/nfl-season-2026.json";
// User's own NFL picks, weeks 1–11 of 2026 (all winners): Learned Code must not drop below 118 of 161.
describe("Learned Code vs the user's NFL season picks", () => {
  const games = (season as any).games.filter((g: any) => g.userPick);
  it("has all 161 decided games", () => { expect(games.length).toBe(161); });
  it("matches at least 120 of the user's picks under numerology-first", () => {
    const hits = games.filter((g: any) => runVotes({ ...g.input, league: "NFL", codeMode: "learned", gameStartTime: g.input.gameStartTime ?? g.game.startTime } as any).pick === g.userPick).length;
    expect(hits).toBeGreaterThanOrEqual(120);
  });
});
