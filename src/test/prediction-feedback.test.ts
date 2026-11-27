import { describe, it, expect } from "vitest";
import { cueDayPercent } from "@/lib/path28";
import { replaceCorrection, acceptImprovedFit, tuneLeagueWeights, type WinnerCorrection } from "@/lib/sports-feedback";
import { runVotes } from "@/lib/vote-decode";
import { sportsWeightSnapshot } from "@/lib/sports-weights";
import nfl from "@/lib/nfl-season-2026.json";
import { marketOutcome, evaluateMarketForecasts, fitMarket, DEFAULT_MARKET_WEIGHTS } from "@/lib/market-learning";
import { calcMarketCode, TRADING_ENTITIES } from "@/lib/trading-ai";
describe("CUE and feedback", () => {
  it("uses the original CUE November 26 score of 67, not the averaged 73", () => { expect(cueDayPercent(2026,11,26)).toBe(67); });
  it("replaces the label for the same game instead of counting twice", () => { const row: WinnerCorrection = { id:"NFL:1", league:"NFL", winner:"away", input:{year:2026,month:11,day:26,away:{name:"A",people:[]},home:{name:"H",people:[]}}, settled:true, correctedAt:"2026-11-26" }; expect(replaceCorrection([row], {...row,winner:"home"})).toEqual([{...row,winner:"home"}]); });
  it("promotes only more wins with no lost replay wins", () => { expect(acceptImprovedFit([true,false],[true,true])).toBe(true); expect(acceptImprovedFit([true,false,false],[false,true,true])).toBe(false); expect(acceptImprovedFit([true,false],[true,false])).toBe(false); });
  it("tunes weights so a corrected winner becomes the predicted winner", () => {
    const snapshot = sportsWeightSnapshot().weights;
    const game = (nfl as unknown as { games: { id: string; input: WinnerCorrection["input"] }[] }).games[0];
    if (!game) throw new Error("NFL sample missing");
    const initial = runVotes({ ...game.input, codeMode: "learned" });
    const desired: "home" | "away" = initial.pick === "home" ? "away" : "home";
    const correction: WinnerCorrection = { id: `NFL:${game.id}`, league: "NFL", winner: desired, input: game.input, settled: true, correctedAt: "2026-11-27" };
    const tuned = tuneLeagueWeights({ league: "NFL", incumbent: snapshot.leagues["NFL"] ?? {}, globalWeights: snapshot.global, allLeagues: snapshot.leagues, samples: [{ id: correction.id, input: game.input, winner: desired }], overrides: [correction], targetId: correction.id });
    const after = runVotes({ ...game.input, codeMode: "learned", weightProfileOverride: { global: snapshot.global, leagues: { ...snapshot.leagues, NFL: tuned.weights } } });
    expect(after.pick).toBe(desired);
    expect(tuned.primaryNowHit).toBe(true);
  });
  it("uses observed open-to-close movement, not the model as the outcome", () => { expect(marketOutcome({ date:"2026-11-25", open:703.20, close:716.70 })).toBe("UP"); expect(marketOutcome({ date:"2026-11-24",open:720,close:718.78 })).toBe("DOWN"); });
  it("excludes forecasts recorded after the opening benchmark", () => { const bars=[{date:"2026-11-25",open:703.20,close:716.70}]; expect(evaluateMarketForecasts([{date:"2026-11-25",call:"UP",observedAt:"2026-11-25T18:00:00Z"}],bars).total).toBe(0); expect(evaluateMarketForecasts([{date:"2026-11-25",call:"UP",observedAt:"2026-11-25T10:00:00Z"}],bars)).toEqual({hits:1,total:1}); });
  it("market fitting cannot drop below incumbent replay hits", () => { const entity=TRADING_ENTITIES.find(e=>e.symbol==="SPY"); if(!entity) throw new Error("SPY missing"); const bars=[{date:"2026-11-25",open:703.20,close:716.70},{date:"2026-11-24",open:720,close:718.78}]; const fit=fitMarket(entity,bars,DEFAULT_MARKET_WEIGHTS); expect(fit.hits).toBeGreaterThanOrEqual(fit.before); expect(calcMarketCode(entity,11,26,2026,fit.weights).cuePercent).toBe(67); });
});