import { it } from "vitest";
import history from "@/lib/sports-backtest-history.json";
import replay from "@/lib/sports-replay-games.json";
import { runVotes, learnedNumberRelation, chineseSign } from "@/lib/vote-decode";
import { computeFullDecode, parseDob } from "@/components/FullDecode";
import { buildStoryReading } from "@/lib/sports-story-reading";
import { writeFileSync } from "fs";

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
it("backtest", () => {
  const sets: Record<string, any[]> = {
    history: (history as any).days.flatMap((d: any) => d.rows).filter((r: any) => r.actual && r.actual !== "draw").map((r: any) => ({ league: r.league, input: { ...r.input, league: r.league, codeMode: "learned", gameStartTime: r.game.startTime }, actual: r.actual })),
    replay: Object.values(replay as any).map((r: any) => { const hs = +r.game.homeScore, as = +r.game.awayScore; return { league: r.league, input: { ...r.input, league: r.league, codeMode: "learned", gameStartTime: r.input.gameStartTime ?? r.game.startTime }, actual: hs === as || isNaN(hs) ? null : hs > as ? "home" : "away" }; }).filter((g: any) => g.actual),
  };
  const out: any = {};
  for (const [k, games] of Object.entries(sets)) {
    out[k] = games.map((g) => {
      const v = runVotes(g.input);
      let s: any = null;
      try { s = story(g.input, v); } catch (e) { s = null; }
      return { league: g.league, actual: g.actual, lc: v.pick, lcConf: v.confidence, lcHome: v.home, lcAway: v.away, st: s?.selected ?? null, stConf: s?.confidence ?? null, stScore: s?.score ?? null };
    });
  }
  writeFileSync(process.env.BT_OUT ?? "/tmp/bt.json", JSON.stringify(out));
}, 600000);
