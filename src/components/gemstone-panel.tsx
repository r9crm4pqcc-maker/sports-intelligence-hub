import { useEffect, useMemo, useState } from "react";
import { GEMSTONE_RANKING, gemstoneTiming } from "@/lib/gemstone-timing";
import { UsDateInput } from "./us-date-input";
import { Card, CardTitle } from "@/life/kit";
export function GemstonePanel({ personalChart }: { personalChart: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  const [start, setStart] = useState("");
  const [clean, setClean] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setNow(new Date()); try { setStart(localStorage.getItem("sauce-coral-start") || ""); setClean(localStorage.getItem("sauce-coral-clean") === "yes"); } catch { setError("Saved test could not be read."); } }, []);
  const timing = useMemo(() => now ? gemstoneTiming(now, start, clean) : null, [now, start, clean]);
  const save = (date: string, passed: boolean) => { try { localStorage.setItem("sauce-coral-start", date); localStorage.setItem("sauce-coral-clean", passed ? "yes" : "no"); setStart(date); setClean(passed); setError(""); } catch { setError("Test progress could not be saved."); } };
  return <Card><CardTitle>Gemstones · fixed ranking</CardTitle>
    <p className="text-xs text-muted-foreground mb-4">Your supplied traditional guidance, not proven health or performance effects.</p>
    {GEMSTONE_RANKING.map(g => <section key={g.stone} className="border-t border-border py-4"><h3 className="font-display text-lg">{g.rank}. {g.stone} <span className="text-primary text-sm">{g.planet} · {g.base}</span></h3><p className="text-sm text-muted-foreground mt-1">{g.benefit}</p>{personalChart && timing && <p className="text-sm mt-2">{g.rank === 1 ? timing.coral : g.rank === 2 ? timing.ruby : g.rank === 3 ? timing.pearl : timing.sapphire}</p>}</section>)}
    {!personalChart && <p className="text-sm text-muted-foreground">These transit rules were supplied for your original Libra-rising chart; a changed birth chart needs its own reading.</p>}
    <p className="text-sm border-t border-border pt-4">Emerald & Yellow Sapphire: avoid. Diamond: {personalChart ? timing?.diamond : "situational only"}</p>
    {personalChart && timing && <><h3 className="font-display mt-5">Transit check · {now?.toLocaleDateString("en-US")}</h3><p className="text-xs text-muted-foreground mt-2">Whole-sign houses from your documented Libra rising. Saturn: house {timing.saturnHouse}{timing.rows.find(r => r.planet === "Saturn")?.retrograde ? " · retrograde" : ""}. Venus: house {timing.venusHouse}.</p><p className="text-xs text-muted-foreground mt-2">August–November 2027: do not start Blue Sapphire, Hessonite or Cat’s Eye. Stop or hold additions if the Coral test is not clean; no universal removal date was supplied.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs">Red Coral pocket-test start<UsDateInput value={start} onChange={v => save(v, clean)} label="Red Coral pocket-test start" className="mt-1 w-full rounded-md border border-input bg-background text-foreground p-2" /></label><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={clean} onChange={e => save(start, e.target.checked)} />Coral test has stayed clean</label></div></>}
    {error && <p role="alert" className="text-destructive text-xs mt-2">{error}</p>}
  </Card>;
}