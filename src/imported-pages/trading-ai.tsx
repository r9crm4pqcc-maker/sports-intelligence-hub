// @ts-nocheck
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useMarketLearning } from "@/lib/use-market-learning";
import { evaluateMarketForecasts } from "@/lib/market-learning";
import { TrendingUp, ChevronDown, Moon, Sparkles, AlertTriangle, Check, X, Clock } from "lucide-react";
import {
  TRADING_ENTITIES,
  calcMarketCode,
  calcWeek,
  bestDaysForYou,
  SECTOR_MAP,
  type TradingEntity,
  type MarketCodeReading,
} from "@/lib/trading-ai";

const BLUE   = "hsl(var(--primary))";
const YELLOW = "hsl(var(--primary))";
const GREEN  = "hsl(var(--primary))";
const RED    = "#f87171";
const PURPLE = "hsl(var(--primary))";

const cats = ["All", "index", "etf", "stock", "crypto"] as const;

const DIR_COLOR: Record<string, string> = { LONG: GREEN, SHORT: RED, "STAND ASIDE": YELLOW };
const ACTION_COLOR: Record<string, string> = { "FULL SIZE": GREEN, "HALF SIZE": YELLOW, "NO TRADE": RED };
const ACTION_BG: Record<string, string> = {
  "FULL SIZE": "rgba(74,222,128,0.15)",
  "HALF SIZE": "rgba(250,204,21,0.15)",
  "NO TRADE":  "rgba(248,113,113,0.15)",
};
const ACTION_BORDER: Record<string, string> = {
  "FULL SIZE": "rgba(74,222,128,0.35)",
  "HALF SIZE": "rgba(250,204,21,0.30)",
  "NO TRADE":  "rgba(248,113,113,0.35)",
};

const ZODIAC_ICON: Record<string, string> = {
  Rat: "🐀", Ox: "🐂", Tiger: "🐅", Rabbit: "🐇",
  Dragon: "🐉", Snake: "🐍", Horse: "🐎", Goat: "🐐",
  Monkey: "🐒", Rooster: "🐓", Dog: "🐕", Pig: "🐖",
};

function Chip({ label, value, color = "white" }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-[8px] uppercase tracking-widest font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
      <p className="text-[12px] font-black" style={{ color, fontFamily: "ui-monospace, monospace" }}>{value}</p>
    </div>
  );
}

function tinyBadge(r: MarketCodeReading) {
  return `${r.candidateDirection} · ${r.action}`;
}

export default function TradingAIPage() {
  const today = new Date();
  const [selSymbol, setSelSymbol] = useState("SPX");
  const [cat, setCat] = useState<typeof cats[number]>("All");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [view, setView] = useState<"day" | "week" | "month" | "method">("day");

  const filtered = useMemo(
    () => TRADING_ENTITIES.filter(e => cat === "All" || e.category === cat),
    [cat],
  );

  const entity = TRADING_ENTITIES.find(e => e.symbol === selSymbol) ?? TRADING_ENTITIES[0];
  const learning = useMarketLearning(entity);

  const day = useMemo(
    () => calcMarketCode(entity, today.getMonth() + 1, today.getDate(), today.getFullYear(), learning.weights),
    [entity, selSymbol, learning.weights],
  );

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Sunday
  const weekResults = useMemo(() => calcWeek(entity, weekStart, learning.weights), [entity, selSymbol, learning.weights]);

  const dir = day.candidateDirection;
  const dirColor = DIR_COLOR[dir];
  const actionColor = ACTION_COLOR[day.action];
  const actionBg = ACTION_BG[day.action];
  const actionBorder = ACTION_BORDER[day.action];

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={13} style={{ color: YELLOW }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Trading AI · MarketCode Engine</span>
        </div>
        <h1 className="page-title">Trading AI</h1>
        <p className="page-subtitle">MarketCode — numerology · lunar · Chinese pillars · confluence scoring</p>
      </div>

      <section className="border-y border-border py-3 space-y-2"><div className="flex justify-between gap-3 items-center"><h2 className="text-sm font-bold">Market learning</h2><Button variant="outline" size="sm" onClick={learning.refresh}>Check market</Button></div><p role="status" className="text-xs text-muted-foreground">{learning.status}</p><p className="text-xs text-muted-foreground">Completed daily open-to-close prices · replay fit, not guaranteed future accuracy.</p>{learning.saved && <><p className="text-xs text-primary">Weights · CUE number {learning.weights.day.toFixed(2)} · Chinese month {learning.weights.month.toFixed(2)} · Western {learning.weights.sky.toFixed(2)}</p><p className="text-xs text-muted-foreground">Before-open forecasts: {evaluateMarketForecasts(learning.saved.forecasts, learning.saved.bars).hits}/{evaluateMarketForecasts(learning.saved.forecasts, learning.saved.bars).total} settled</p></>}</section>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={cat === c
              ? { background: "rgba(250,204,21,0.12)", color: YELLOW, border: "1px solid rgba(250,204,21,0.25)" }
              : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }}>
            {c}
          </button>
        ))}
      </div>

      <div className="glass-card p-4" style={{ background: "hsl(0 0% 0%)" }}>
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: YELLOW }}>Your best trading days</p>
        <p className="text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>This is your Reports day percent. It is the same no matter which ticker you open.</p>
        <div className="flex flex-wrap gap-2">
          {bestDaysForYou(today).map((d) => (
            <span key={`${d.y}-${d.m}-${d.d}`} className="text-[11px] rounded-lg px-2 py-1" style={{ background: "rgba(250,204,21,0.08)", color: "rgba(255,255,255,0.8)" }}>
              {d.m}/{d.d} · {d.pct}%
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Entity picker */}
        <div className="glass-card p-3 overflow-y-auto" style={{ background: "hsl(0 0% 0%)", maxHeight: "480px" }}>
          <p className="text-[10px] uppercase tracking-widest mb-3 sticky top-0" style={{ color: "rgba(255,255,255,0.3)", background: "hsl(0 0% 0%)" }}>
            Select Entity ({filtered.length})
          </p>
          <div className="space-y-0.5">
            {filtered.map(e => {
              const r = calcMarketCode(e, today.getMonth() + 1, today.getDate(), today.getFullYear(), e.symbol === entity.symbol ? learning.weights : undefined);
              return (
                <button key={e.symbol} onClick={() => setSelSymbol(e.symbol)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left"
                  style={selSymbol === e.symbol
                    ? { background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }
                    : { border: "1px solid transparent" }}>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>{e.symbol}</p>
                    <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{e.name}</p>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: ACTION_BG[r.action], color: ACTION_COLOR[r.action], border: `1px solid ${ACTION_BORDER[r.action]}` }}>
                    {r.callPct}% {r.call}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main decode */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header + verdict button */}
          <div className="glass-card p-5" style={{ background: "hsl(0 0% 0%)", border: `1px solid ${actionBorder}` }}>
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {entity.symbol} · {entity.name} · {entity.anchorDate}
                </p>
                <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 rounded-xl px-4 py-2"
                  style={{ background: actionBg, border: `1px solid ${actionBorder}` }}>
                  <span className="text-2xl font-black" style={{ color: day.call === "UP" ? GREEN : day.call === "DOWN" ? RED : YELLOW }}>{day.call}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: actionColor, background: "rgba(0,0,0,0.3)" }}>{day.callPct}%</span>
                </div>
                <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Today <span style={{ color: actionColor }} className="font-black text-sm">{day.callPct}% {day.call}</span>
                  <span className="ml-1 opacity-60">· your day {day.cuePercent}% is not the stock</span>
                </p>
                <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{day.callNote}</p>
              </div>
            </div>

            {/* Universal numerology strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <Chip label="Universal Day #" value={<>{day.universalDay}{day.masterDay ? <span style={{ color: YELLOW }} className="ml-1 text-[9px]">M{day.masterDay}</span> : null}</>} color={BLUE} />
              <Chip label="Universal Month" value={String(day.universalMonth)} color={PURPLE} />
              <Chip label="Universal Year" value={String(day.universalYear)} color={PURPLE} />
              <Chip label="Raw Total" value={<>{day.universalDayRaw}{day.karmicDay ? <span style={{ color: RED }} className="ml-1 text-[9px]">KARMIC</span> : null}</>} color="white" />
            </div>

            {/* Day mood */}
            <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.15)" }}>
              <p className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: BLUE }}>Day Mood</p>
              <p className="text-sm font-black text-white">#{day.universalDay} · {day.dayMood}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{day.dayCharacter}</p>
            </div>

            {/* Chinese pillars */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Chip label="CZ Year"  value={<>{ZODIAC_ICON[day.chinesePillars.year] ?? "🌀"} {day.chinesePillars.year}</>} />
              <Chip label="CZ Month" value={<>{ZODIAC_ICON[day.chinesePillars.month] ?? "🌀"} {day.chinesePillars.month}</>} />
              <Chip label="CZ Hour"  value={<>{ZODIAC_ICON[day.chinesePillars.hour] ?? "🌀"} {day.chinesePillars.hour}</>} />
            </div>

            {/* Lunar + sector + entity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg p-3" style={{ background: "rgba(250,204,21,0.05)", border: "1px solid rgba(250,204,21,0.15)" }}>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1" style={{ color: YELLOW }}>
                  <Moon size={10} /> Lunar
                </p>
                <p className="text-xs font-black text-white">{day.lunarPhase} <span style={{ color: DIR_COLOR[day.lunarBias] }}>→ {day.lunarBias}</span></p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Moon in <b>{day.moonSign}</b> · Sun in <b>{day.sunSign}</b></p>
              </div>
              <div className="rounded-lg p-3" style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)" }}>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1" style={{ color: PURPLE }}>
                  <Sparkles size={10} /> Sector Spotlight
                </p>
                <p className="text-xs font-black text-white">{day.sectorSpotlight}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Entity sector: <b>{entity.sector ?? "—"}</b>
                  {day.sectorMatch && <span className="ml-1" style={{ color: GREEN }}>MATCH ✓</span>}
                </p>
              </div>
            </div>

            {/* Entity signature */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Chip label="Entity Lifepath" value={String(day.entityLifepath)} color={BLUE} />
              <Chip label="Name Number"     value={String(day.entityNameNumber)} color={BLUE} />
              <Chip label="Element"         value={<>{day.entityElement} <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>({day.elementSupport})</span></>} color={PURPLE} />
            </div>
            {day.resonance && (
              <div className="rounded-lg p-2 mb-3 text-center" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)" }}>
                <p className="text-[10px] font-bold" style={{ color: GREEN }}>⚡ RESONANCE — Day # matches entity Lifepath or Name #</p>
              </div>
            )}

            {/* Confluence checklist */}
            <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                Confluence Checklist — {day.score}/7
              </p>
              {day.checks.map((c, i) => (
                <div key={i} className="flex items-start gap-2 py-1 border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {c.passed
                    ? <Check size={12} className="mt-0.5" style={{ color: GREEN }} />
                    : <X size={12} className="mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold" style={{ color: c.passed ? "white" : "rgba(255,255,255,0.5)" }}>{c.label}</p>
                    <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>{c.note}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vetoes */}
            {day.vetoes.length > 0 && (
              <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.30)" }}>
                <p className="text-[10px] uppercase tracking-widest font-black mb-1 flex items-center gap-1" style={{ color: RED }}>
                  <AlertTriangle size={11} /> ACTIVE VETOES — NO TRADE
                </p>
                {day.vetoes.map((v, i) => (
                  <p key={i} className="text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>· {v}</p>
                ))}
              </div>
            )}
            {(day.mercuryRetro || day.eclipseWindow) && day.vetoes.length === 0 && (
              <div className="rounded-lg p-2 mb-3 text-center" style={{ background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.25)" }}>
                <p className="text-[10px]" style={{ color: YELLOW }}>
                  ⚠ {day.mercuryRetro && "Mercury Retrograde active — reduce conviction. "}{day.eclipseWindow && "Eclipse window."}
                </p>
              </div>
            )}

            {/* Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg p-3" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5 flex items-center gap-1" style={{ color: GREEN }}>
                  <Clock size={10} /> Entry Window
                </p>
                <p className="text-sm font-black text-white">{day.entryWindow}</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: "rgba(250,204,21,0.04)", border: "1px solid rgba(250,204,21,0.15)" }}>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5 flex items-center gap-1" style={{ color: YELLOW }}>
                  <Clock size={10} /> Exit Window
                </p>
                <p className="text-sm font-black text-white">{day.exitWindow}</p>
              </div>
            </div>
            {day.cautionZones.length > 0 && (
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                <b style={{ color: RED }}>Caution:</b> {day.cautionZones.join(" · ")}
              </p>
            )}

            {/* Breakdown */}
            <div className="mt-3 flex justify-end">
              <button onClick={() => setShowBreakdown(b => !b)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ color: BLUE, background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}>
                Full breakdown <ChevronDown size={12} style={{ transform: showBreakdown ? "rotate(180deg)" : "none" }} />
              </button>
            </div>
            {showBreakdown && (
              <div className="mt-2 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed"
                style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.55)" }}>
                {day.breakdown}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex gap-1.5 flex-wrap">
            {([["day", "Day"], ["week", "Week"], ["month", "Month"], ["method", "Style"]] as const).map(([v, label]) => (
              <button key={v} onClick={() => setView(v as any)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={view === v
                  ? { background: "rgba(96,165,250,0.12)", color: BLUE, border: "1px solid rgba(96,165,250,0.2)" }
                  : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Week view */}
          {view === "week" && (
            <div className="glass-card p-4" style={{ background: "hsl(0 0% 0%)" }}>
              <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                Weekly MarketCode — {entity.symbol}
              </p>
              <div className="space-y-2">
                {weekResults.map((r, i) => {
                  const dName = new Date(weekStart.getTime() + i * 86400000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                  return (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{dName}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>#{r.universalDay} · {r.lunarPhase}</span>
                        <span className="text-[10px] font-bold" style={{ color: DIR_COLOR[r.candidateDirection] }}>{r.candidateDirection}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{ background: ACTION_BG[r.action], color: ACTION_COLOR[r.action] }}>
                          {r.callPct}% {r.call} · {r.action}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month view */}
          {view === "month" && (() => {
            const m = today.getMonth() + 1;
            const y = today.getFullYear();
            const daysInMonth = new Date(y, m, 0).getDate();
            const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
              const dd = i + 1;
              const r = calcMarketCode(entity, m, dd, y, learning.weights);
              return { day: dd, ...r };
            });
            const rank = (a: MarketCodeReading) => a.callPct - (a.call === "DOWN" ? 20 : 0);
            const best = [...monthDays].sort((a, b) => rank(b) - rank(a)).slice(0, 5);
            const worst = [...monthDays].filter(d => d.action === "NO TRADE").slice(0, 5);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="glass-card p-4" style={{ background: "hsl(0 0% 0%)" }}>
                    <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: GREEN }}>Best days for {entity.symbol}</p>
                    {best.map((d, i) => (
                      <div key={d.day} className="flex items-center justify-between p-2 rounded-lg mb-1" style={{ background: "rgba(74,222,128,0.04)" }}>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: "rgba(74,222,128,0.15)", color: GREEN }}>{i + 1}</span>
                          <p className="text-xs font-semibold text-white">{new Date(y, m - 1, d.day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                        </div>
                        <span className="text-[9px] font-bold" style={{ color: d.call === "UP" ? GREEN : d.call === "DOWN" ? RED : YELLOW }}>{d.call} · {d.callPct}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="glass-card p-4" style={{ background: "hsl(0 0% 0%)" }}>
                    <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: RED }}>Veto / No-Trade Days</p>
                    {worst.length === 0 && <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>No hard vetoes this month.</p>}
                    {worst.map(d => (
                      <div key={d.day} className="flex items-center justify-between p-2 rounded-lg mb-1" style={{ background: "rgba(248,113,113,0.04)" }}>
                        <p className="text-xs font-semibold text-white">{new Date(y, m - 1, d.day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                        <span className="text-[9px]" style={{ color: RED }}>{d.vetoes[0] ?? "no signal"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-4" style={{ background: "hsl(0 0% 0%)" }}>
                  <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Full Month Calendar</p>
                  <div className="grid grid-cols-7 gap-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(dd => (
                      <div key={dd} className="text-center text-[8px] font-semibold py-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{dd}</div>
                    ))}
                    {Array.from({ length: new Date(y, m - 1, 1).getDay() }, (_, i) => <div key={`p${i}`} />)}
                    {monthDays.map(d => (
                      <div key={d.day} className="p-1 rounded text-center"
                        style={{ background: `${ACTION_COLOR[d.action]}12` }}>
                        <p className="text-[10px] font-bold" style={{ color: d.day === today.getDate() ? "white" : "rgba(255,255,255,0.6)" }}>{d.day}</p>
                        <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ background: DIR_COLOR[d.candidateDirection] }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Method view */}
          {view === "method" && (
            <div className="glass-card p-5" style={{ background: "hsl(0 0% 0%)", border: "1px solid rgba(250,204,21,0.15)" }}>
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: YELLOW }}>Sector Map (Part 5)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(SECTOR_MAP).map(([sign, s]) => (
                  <div key={sign} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-xs font-black text-white">{sign}</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{s}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                Sun sign (month) + Moon sign (~2.5 days) light up their sectors. When the entity's founding sun sign or listed
                sector matches either, the confluence check "Sector match" fires.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[8px] text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
        ShemUniverse MarketCode · deterministic numerology + approx lunar/pillars ·
        Mercury retro & eclipse windows hard-coded 2024-2027 · Not financial advice.
      </p>
    </div>
  );
}
