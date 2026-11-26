import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSportsDocument } from "./use-sports-document";
import { readMarketHistory } from "./market-data.functions";
import { calcMarketCode, type TradingEntity } from "./trading-ai";
import { DEFAULT_MARKET_WEIGHTS, EMPTY_MARKET, fitMarket, type MarketState } from "./market-learning";
export function useMarketLearning(entity: TradingEntity) {
  const document = useSportsDocument<MarketState>("training", "markets", EMPTY_MARKET);
  const fetchHistory = useServerFn(readMarketHistory);
  const [notice, setNotice] = useState(""), [revision, setRevision] = useState(0);
  const saved = document.value.symbols[entity.symbol];
  useEffect(() => {
    if (!document.ready || !document.userId) return;
    let alive = true;
    const timer = setTimeout(() => { void (async () => {
      if (saved && Date.now() - Date.parse(saved.checkedAt) < 900000 && !revision) return;
      setNotice("Checking completed market sessions…");
      try {
        const result = await fetchHistory({ data: { symbol: entity.symbol } });
        if (!alive) return;
        if (result.error || !result.bars.length) { setNotice(result.error || "No completed sessions yet."); return; }
        const fitted = fitMarket(entity, result.bars, saved?.weights || DEFAULT_MARKET_WEIGHTS);
        const now = new Date(), date = now.toISOString().slice(0,10);
        const reading = calcMarketCode(entity, now.getUTCMonth()+1, now.getUTCDate(), now.getUTCFullYear(), fitted.weights);
        const forecasts = saved?.forecasts || [];
        const nextForecasts = forecasts.some(f => f.date === date) ? forecasts : [...forecasts, { date, call: reading.call, observedAt: now.toISOString() }];
        const report = `${fitted.hits}/${fitted.total} saved-session replay${fitted.hits > fitted.before ? " · improved fit" : " · best weights kept"}${"proxy" in result && result.proxy ? ` · ${result.proxy}` : ""}`;
        document.change({ symbols: { ...document.value.symbols, [entity.symbol]: { weights: fitted.weights, bars: result.bars, checkedAt: now.toISOString(), report, forecasts: nextForecasts } } }); setNotice("");
      } catch { if (alive) setNotice("Market learning unavailable. Previous weights kept."); }
    })(); }, 250);
    return () => { alive = false; clearTimeout(timer); };
  }, [entity.symbol, document.ready, document.userId, revision]);
  useEffect(() => { const timer = setInterval(() => setRevision(v => v+1), 900000); return () => clearInterval(timer); }, []);
  return { weights: saved?.weights || DEFAULT_MARKET_WEIGHTS, status: !document.userId ? "Sign in in Settings to save automatic market learning." : notice || saved?.report || document.status, saved, refresh: () => setRevision(v => v+1) };
}