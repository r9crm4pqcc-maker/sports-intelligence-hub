import { calcMarketCode, type TradingEntity } from "./trading-ai";
import { acceptImprovedFit } from "./sports-feedback";
export type MarketWeights = { day: number; month: number; sky: number };
export type MarketBar = { date: string; open: number; close: number };
export type MarketState = { symbols: Record<string, { weights: MarketWeights; bars: MarketBar[]; checkedAt: string; report: string; forecasts: { date: string; call: string; observedAt: string }[] }> };
export const EMPTY_MARKET: MarketState = { symbols: {} };
export const DEFAULT_MARKET_WEIGHTS: MarketWeights = { day: 1, month: 1, sky: 1 };
export function marketOutcome(bar: MarketBar): "UP" | "DOWN" | "FLAT" { return bar.close > bar.open ? "UP" : bar.close < bar.open ? "DOWN" : "FLAT"; }
export function evaluateMarketForecasts(forecasts: { date: string; call: string; observedAt: string }[], bars: MarketBar[]) {
  const scored = forecasts.flatMap(f => { const bar = bars.find(b => b.date === f.date); if (!bar || !Number.isFinite(Date.parse(f.observedAt)) || Date.parse(f.observedAt) >= Date.parse(`${f.date}T13:30:00Z`)) return []; return [f.call === marketOutcome(bar)]; });
  return { hits: scored.filter(Boolean).length, total: scored.length };
}
export function fitMarket(entity: TradingEntity, bars: MarketBar[], initial: MarketWeights) {
  const evaluate = (weights: MarketWeights) => bars.map(bar => { const [y,m,d] = bar.date.split("-").map(Number); return calcMarketCode(entity, m ?? 1, d ?? 1, y ?? 2026, weights).call === marketOutcome(bar); });
  let weights = { ...initial }, hits = evaluate(weights); const before = hits.filter(Boolean).length;
  for (const key of ["day", "month", "sky"] as const) for (const multiplier of [0.5, 1.5, 2, 3]) {
    const candidate = { ...weights, [key]: Math.min(8, Math.max(0.1, weights[key] * multiplier)) }; const after = evaluate(candidate);
    if (acceptImprovedFit(hits, after)) { weights = candidate; hits = after; }
  }
  return { weights, hits: hits.filter(Boolean).length, before, total: bars.length };
}