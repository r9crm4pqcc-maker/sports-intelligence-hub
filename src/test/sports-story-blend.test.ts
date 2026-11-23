import { describe, expect, it } from "vitest";
import { blendStoryPick } from "@/lib/sports-story-blend";
import history from "@/lib/sports-backtest-history.json";
import replay from "@/lib/sports-replay-games.json";
import { runVotes, learnedNumberRelation, chineseSign } from "@/lib/vote-decode";
import { computeFullDecode, parseDob } from "@/components/FullDecode";
import { buildStoryReading } from "@/lib/sports-story-reading";

const tri = (d?: readonly number[]) => (d ? [d[0], d[1], d[2]] as [number, number, number] : undefined);
function story(input: any, v: any) {
  const ents: any[] = [];
  for (const side of ["away", "home"] as const) {
    const t = input[side];
    ents.push({ kind: "team", side, name: t.name, date: tri(t.founded), colors: t.colors, record: t.record, streak: t.streak });
    for (const p of t.people ?? []) ents.push({ kind: "player", side, name: p.name, role: p.role, date: parseDob(p.dob), jersey: p.jersey });
  }
  ents.push({ kind: "city", side: "venue", name: input.city ?? "Host city", date: tri(input.cityFounded) });
  ents.push({ kind: "stadium", side: "venue", name: input.stadium ?? "Stadium", date: tri(input.stadiumOpened) });
  const full = computeFullDecode(ents, [input.year, input.month, input.day], input.hour ?? 19, {}, input.gameStartTime, input.venueTimeZone, true);
  return buildStoryReading({
    away: input.away.name, home: input.home.name, dateLabel: "", league: input.league, eventName: input.eventName,
    year: input.year, month: input.month, day: input.day, dayLp: full.ge.lp, secondary: full.ge.secondary, doyRoot: full.ge.doyRoot, woyRoot: full.ge.woyRoot,
    moonPhase: full.ge.moon.phase, yearSign: v.yearSign, monthSign: v.monthSign, relation: learnedNumberRelation,
    entities: full.reads.map((x: any) => ({ side: x.e.side, kind: x.e.kind, name: x.e.name, role: x.e.role, date: x.e.date, record: x.e.record, streak: x.e.streak, colors: x.e.colors, jersey: x.e.jersey,
      read: x.r ? { lp: x.r.lp, py: x.r.py, pm: x.r.pm, pd: x.r.pd, pw: x.r.pw, ph: x.r.ph, hourKnown: x.r.hourKnown, lucky: x.r.lucky, today: x.r.matrix.today } : null })),
  });
}
// Story Reading pushes Learned Code picks per sport; these saved-game totals must not drop.
describe("Story Reading feeding Learned Code picks", () => {
  const games = [
    ...(history as any).days.flatMap((d: any) => d.rows).filter((r: any) => r.actual && r.actual !== "draw").map((r: any) => ({ ds: "history", league: r.league, input: { ...r.input, league: r.league, codeMode: "learned", gameStartTime: r.game.startTime }, actual: r.actual })),
    ...Object.values(replay as any).map((r: any) => { const hs = +r.game.homeScore, as = +r.game.awayScore; return { ds: "replay", league: r.league, input: { ...r.input, league: r.league, codeMode: "learned", gameStartTime: r.input.gameStartTime ?? r.game.startTime }, actual: hs === as || isNaN(hs) ? null : hs > as ? "home" : "away" }; }).filter((g: any) => g.actual),
  ].map((g: any) => {
    const v = runVotes(g.input);
    const lc = v.home === v.away ? v.pick : v.home > v.away ? "home" : "away";
    const blended = blendStoryPick(g.league, { home: v.home, away: v.away, pick: lc }, story(g.input, v)).pick;
    return { ...g, lc, blended };
  });
  const hits = (key: "lc" | "blended", ds: string, lg?: string) => games.filter((g) => g.ds === ds && (!lg || g.league === lg) && g[key] === g.actual).length;
  it("College Basketball reaches 20 of 21 on history", () => { expect(hits("blended", "history", "College Basketball")).toBeGreaterThanOrEqual(20); });
  it("UEFA Nations League reaches 30 of 35 on the replay", () => { expect(hits("blended", "replay", "UEFA Nations League")).toBeGreaterThanOrEqual(30); });
  it("blended picks never do worse than Learned Code alone", () => {
    expect(hits("blended", "history")).toBeGreaterThanOrEqual(hits("lc", "history"));
    expect(hits("blended", "replay")).toBeGreaterThanOrEqual(hits("lc", "replay"));
  });
  it("NFL Learned Code reaches 28 of 29 on the replay", () => { expect(hits("blended", "replay", "NFL")).toBeGreaterThanOrEqual(28); });
});
