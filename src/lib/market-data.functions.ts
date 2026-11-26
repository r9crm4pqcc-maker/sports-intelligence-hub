import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TRADING_ENTITIES } from "./trading-ai";
import { storedDate } from "./display-date";
import type { MarketBar } from "./market-learning";
export const readMarketHistory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(data => z.object({ symbol: z.string().max(10) }).parse(data)).handler(async ({ data }) => {
  const entity = TRADING_ENTITIES.find(e => e.symbol === data.symbol);
  if (!entity) throw new Error("Unknown market symbol.");
  const now = new Date();
  const start = new Date(now); start.setUTCDate(start.getUTCDate()-60);
  const to = now.toISOString().slice(0,10), from = start.toISOString().slice(0,10);
  const mapped: Record<string,string> = { SPX: "SPY", NDX: "QQQ", DJI: "DIA", RUT: "IWM" };
  if (entity.category === "crypto") {
    const source = `https://api.exchange.coinbase.com/products/${encodeURIComponent(data.symbol)}-USD/candles?granularity=86400`;
    try {
      const response = await fetch(source);
      if (!response.ok) { const body = await response.text(); console.error("Coinbase history", response.status, body); return { bars: [] as MarketBar[], source, error: `Coinbase history unavailable (${response.status}).` }; }
      const rows = z.array(z.tuple([z.number(),z.number(),z.number(),z.number(),z.number(),z.number()])).parse(await response.json());
      const bars = rows.map(row => ({date:new Date(row[0]*1000).toISOString().slice(0,10),open:row[3],close:row[4]})).filter(row => row.date >= from && row.date < to && row.open > 0 && row.close > 0).sort((a,b)=>a.date.localeCompare(b.date));
      return { bars, source, error: bars.length ? null : "No completed crypto sessions available.", proxy:"Coinbase USD · completed UTC daily sessions" };
    } catch(error) { console.error("Coinbase history", error); return { bars: [] as MarketBar[], source, error:"Crypto prices could not be read; saved weights unchanged." }; }
  }
  const symbol = mapped[data.symbol] || data.symbol;
  const asset = mapped[data.symbol] || entity.category === "etf" ? "etf" : "stocks";
  const source = `https://api.nasdaq.com/api/quote/${encodeURIComponent(symbol)}/historical?assetclass=${asset}&fromdate=${from}&todate=${to}&limit=70`;
  try {
    const response = await fetch(source, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } });
    if (!response.ok) { const body = await response.text(); console.error("Market history failed", response.status, body); return { bars: [] as MarketBar[], source, error: `Nasdaq history unavailable (${response.status}); saved weights unchanged.` }; }
    const body = z.object({ data: z.object({ tradesTable: z.object({ rows: z.array(z.object({ date: z.string(), open: z.string(), close: z.string() })) }) }).nullable() }).parse(await response.json());
    const bars: MarketBar[] = [];
    for (const row of body.data?.tradesTable.rows || []) {
      const date = storedDate(row.date); const open = Number(row.open.replace(/[$,]/g,"")), close = Number(row.close.replace(/[$,]/g,""));
      // Only completed sessions; today's partial close must never become a training label.
      const et = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year:"numeric",month:"2-digit",day:"2-digit" }).format(now);
      if (date && date < et && Number.isFinite(open) && open > 0 && Number.isFinite(close) && close > 0) bars.push({ date, open, close });
    }
    return { bars: bars.sort((a,b) => a.date.localeCompare(b.date)), source, error: bars.length ? null : "No completed daily price rows available yet.", proxy: mapped[data.symbol] ? `${data.symbol} uses ${symbol} ETF daily prices` : "" };
  } catch (error) { console.error("Market history", error); return { bars: [] as MarketBar[], source, error: "Market history could not be read; saved weights unchanged." }; }
});