import { useState } from "react";
import { useOverrides, setOverride, clearOverride, entityKey } from "@/lib/date-overrides";
import { readEntity, gameEnergies, show, monthName, sideScore, type CycleRead, type Tri } from "@/lib/full-decode";
import { findSportsCatalogRecord } from "@/lib/sports-catalog";
import { learningActive } from "@/lib/sports-learning";
import { recordVibrations } from "@/lib/sports-record-vibrations";
import { learnedColorLabel, teamLogoColorCodeLabel } from "@/lib/sports-color-code";
import { daysSinceAndUntilBirthday } from "@/lib/sports-gematria";

export interface DecodeEntity { kind: "team" | "player" | "city" | "stadium"; side: "home" | "away" | "venue"; name: string; unavailable?: boolean; role?: string; date?: Tri; dateSourceUrl?: string; lineupSourceUrl?: string; lineupSourceUpdated?: string; jersey?: string; record?: string; streak?: string; h2h?: string; homeRecord?: string; awayRecord?: string; colors?: string[] }

const fmtDate = (t: Tri) => `${monthName(t[1])} ${t[2]}, ${t[0]}`;
export const parseDob = (s?: string): Tri | undefined => { const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? [+m[1], +m[2], +m[3]] : undefined; };
const verifiedSourceUrl = (value?: string) => {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
};

export function decodeEntityLines(e: DecodeEntity, r: CycleRead | null): string[] {
  const unknown="not available — verified birth / founding date required";
  const value=(read:(r:CycleRead)=>string | number)=>r ? read(r) : unknown;
  const out: string[] = [];
  out.push(`${e.kind === "player" ? "Born" : "Founding Date"}: ${value(r=>fmtDate(r.date))}`);
  out.push(`Lifepath: ${value(r=>show(r.lp))}`, `Secondary Energy: ${value(r=>show(r.secondary))}`,
    `Day Of The Year: ${value(r=>`${r.doy} (root ${r.doyRoot})`)}`, `Week Of The Year: ${value(r=>`${r.woy} (root ${r.woyRoot})`)}`);
  if (e.kind === "team" || e.kind === "player") {
    out.push(`Days since last birthday: ${value(r=>daysSinceAndUntilBirthday(r.gameDate, r.date).daysSince)}`,
      `Days until next birthday: ${value(r=>daysSinceAndUntilBirthday(r.gameDate, r.date).daysUntil)}`);
  }
  out.push(`Personal Year Cycle: ${value(r=>show(r.py))}`, `Personal Month Cycle: ${value(r=>show(r.pm))}`, `Personal Day Cycle: ${value(r=>show(r.pd))}`, `Personal Week Cycle: ${value(r=>show(r.pw))}`,
    `Personal Hour Cycle: ${!r ? unknown : r.hourKnown ? `${r.ph[0]} at start → ${r.ph[1]} mid-game → ${r.ph[2]} closing (venue-local, closing weighted highest)` : "venue timezone not verified — hour signals not scored"}`,
    `Chinese Zodiac Year: ${value(r=>r.yearP)}`, `Chinese Zodiac Month: ${value(r=>r.monthP)}`,
    `Lucky Number: ${value(r=>`${r.lucky} (root ${r.luckyRoot})`)}`);
  if (e.kind === "player") out.push(`Jersey Number: ${e.jersey ?? (/owner|coach|manager|staff/.test(e.role || "") ? "not applicable to this role" : "not available from verified lineup / roster")}${r && e.jersey && +e.jersey === r.lucky ? " — matches Lucky Number" : ""}`);
  if (e.kind === "team") {
    out.push(`Team Colors: ${e.colors?.length
      ? e.colors.map(color => `${color} (${learnedColorLabel(color)})`).join(", ")
      : "not available from verified logo/brand data"}`);
    out.push(`Combined Logo Color Code: ${teamLogoColorCodeLabel(e.colors ?? [])}`);
    out.push(`Current Record: ${e.record || "not available in this game's source"}`,
      `Current Winning Or Losing Streak: ${e.streak || "not available in this game's source"}`,
      `H2H Record That Season: ${e.h2h || "not available in this game's source"}`,
      `Home Record: ${e.homeRecord || "not available in this game's source"}`,
      `Away Record: ${e.awayRecord || "not available in this game's source"}`);
    const vibrations=recordVibrations({record:e.record,streak:e.streak,h2h:e.h2h,home:e.homeRecord,away:e.awayRecord});
    out.push(...vibrations.map(v=>`Record vibration — ${v.label}: ${v.value}${v.root!==v.value ? ` → ${v.root}` : ""}`));
  }
  for(const [label,key] of [["Fatal Attraction Dates","fatal"],["Challenging Dates","challenging"],["Soulmate Dates","soulmate"],["Beneficial Dates","beneficial"]] as const)
    out.push(`${label}: ${value(r=>r.matrix[key].join(", ") || "none in this date matrix")}`);
  r?.matrix.today.forEach(t => out.push(`⚡ TONIGHT: ${t}`));
  return out;
}

export function computeFullDecode(raw: DecodeEntity[], game: Tri, kickoffHour: number | null, ov: Record<string, { date?: string; jersey?: string }> = {}, gameStartTime?: string, venueTimeZone?: string | null, candidateMethod = false) {
  const entities = raw.map(e => {
    if (learningActive()) {
      const record = findSportsCatalogRecord(e.kind === "player" ? "person" : e.kind, e.name);
      if (record) return { ...e, date: parseDob(record.date || undefined) ?? e.date, jersey: record.jersey || e.jersey, edited: !!record.edited || record.source === "user" };
    }
    const o = ov[entityKey(e.kind, e.name)];
    return o ? { ...e, date: parseDob(o.date) ?? e.date, jersey: o.jersey || e.jersey, edited: true } : e;
  });
  const ge = gameEnergies(game, kickoffHour, gameStartTime, venueTimeZone);
  const reads = entities.map(e => ({ e, r: e.date ? readEntity(e.date, game, kickoffHour, e.kind === "team", candidateMethod) : null }));
  let home = 0, away = 0;
  for (const { e, r } of reads) {
    if (!r) continue;
    const w = e.kind === "team" ? 1 : e.kind === "player" ? 0.5 : 0.25;
    const s = sideScore(r, ge.lp.reduced, w, candidateMethod);
    if (e.side === "away") away += s; else home += s;
  }
  return { ge, reads, home, away };
}

export function FullDecode({ title, data, homeName, awayName, verdict, editable = true, part = "all", headToHead, partThreeTitle }: { title: string; data: ReturnType<typeof computeFullDecode>; homeName: string; awayName: string; verdict: string; editable?: boolean; part?: "all" | "game" | DecodeEntity["kind"]; headToHead?: { allTime?: string; season?: string }; partThreeTitle?: string }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const { ge, reads } = data;
  const gameLines = [`Lifepath: ${show(ge.lp)}`, `Secondary Energy: ${show(ge.secondary)}`, `Day Of The Year: ${ge.doy} (root ${ge.doyRoot})`,
    `Week Of The Year: ${ge.woy} (root ${ge.woyRoot})`, `Lunar Cycle: ${ge.moon.label}`, `Chinese Zodiac Year: ${ge.yearP}`,
    `Chinese Zodiac Month: ${ge.monthP}`,
    `Universal Year: ${show(ge.universalYear)}`, `Universal Month: ${show(ge.universalMonth)}`,
    ...ge.transits,
    `${awayName} and ${homeName} record all time: ${headToHead?.allTime || "not available from the current game feed"}`,
    `H2H Record That Season: ${headToHead?.season || "not available from the current game feed"}`];
  const group = (k: DecodeEntity["kind"]) => reads.filter(x => x.e.kind === k);
  const sections: [string, typeof reads][] = [["PART 2 · THE TEAMS", group("team")], [`PART 3 · ${partThreeTitle || "KEY PLAYER, COACH & OWNER"}`, group("player")], ["PART 4 · THE CITY", group("city")], ["PART 5 · THE STADIUM", group("stadium")]];
  const selected=part==="all" ? sections : sections.filter((_,i)=>["team","player","city","stadium"][i]===part);
  const head = (x: (typeof reads)[number]) => `${(x.e as { edited?: boolean }).edited ? "✎ " : ""}${x.e.side === "away" ? "AWAY · " : x.e.side === "home" ? "HOME · " : ""}${x.e.name}${x.e.role ? ` (${x.e.role})` : ""}`;
  const copy = () => {
    const txt = [title, "", "PART 1 · GAME ENERGIES", ...gameLines.map(l => `• ${l}`),
      ...sections.flatMap(([t, xs]) => ["", t, ...xs.flatMap(x => ["", head(x), ...decodeEntityLines(x.e, x.r).map(l => `• ${l}`)])]),
      "", "SYSTEMIC VERDICT", verdict].join("\n");
    navigator.clipboard?.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <div className="mb-4 rounded-lg border border-border">
      {(part==="all" || part==="game") && <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/40">
        <p className="text-[10px] font-bold tracking-[0.18em] text-primary">FULL DECODE · 5 PARTS</p>
        <div className="flex gap-1">{editable && <button onClick={() => setEditing(v => !v)} className="text-[10px] font-bold px-2 py-1 rounded border border-primary text-primary">{editing ? "DONE" : "EDIT DATES"}</button>}
        <button onClick={copy} className="text-[10px] font-bold px-2 py-1 rounded bg-primary text-primary-foreground">{copied ? "COPIED" : "COPY DECODE"}</button></div>
      </div>}
      <div className="p-3 space-y-3 text-[11px]">
        {editing && editable && <DateEditor entities={reads.map(x => x.e)} />}
        {(part==="all" || part==="game") && <Block title="PART 1 · GAME ENERGIES" items={gameLines} />}
        {selected.map(([t, xs]) => (
          <div key={t}>
            <p className="text-[10px] font-bold tracking-[0.16em] text-primary mb-1">{t}</p>
            {xs.length === 0 ? <p className="text-muted-foreground">Not in the feed for this game.</p> :
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {xs.map((x, i) => {
                  const sourceUrl = x.e.date ? verifiedSourceUrl(x.e.dateSourceUrl) : undefined;
                  const lineupUrl = verifiedSourceUrl(x.e.lineupSourceUrl);
                  return <div key={i}>
                    <Block title={head(x)} items={decodeEntityLines(x.e, x.r)} />
                    <div className="flex flex-wrap gap-x-3">
                      {sourceUrl && <a className="mt-1 inline-block text-[10px] text-primary underline" href={sourceUrl} target="_blank" rel="noreferrer">Verify birth-date source</a>}
                      {lineupUrl && <a className="mt-1 inline-block text-[10px] text-primary underline" href={lineupUrl} target="_blank" rel="noreferrer">
                        Verify pregame depth chart{ x.e.lineupSourceUpdated ? ` · updated ${x.e.lineupSourceUpdated}` : "" }
                      </a>}
                    </div>
                  </div>;
                })}
              </div>}
          </div>
        ))}
        {part==="all" && <div className="rounded-md bg-primary/10 border border-primary/30 p-2">
          <p className="text-[10px] font-bold tracking-[0.16em] text-primary mb-1">SYSTEMIC VERDICT</p>
          <p className="text-foreground">{verdict}</p>
          <p className="text-muted-foreground mt-1">{awayName} {Math.round((100 * data.away) / ((data.away + data.home) || 1))}% · {homeName} {Math.round((100 * data.home) / ((data.away + data.home) || 1))}%</p>
        </div>}
      </div>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md bg-muted/30 p-2">
      <p className="font-bold text-foreground mb-1">{title}</p>
      <ul className="space-y-0.5">{items.map((l, i) => <li key={i} className={l.startsWith("⚡") ? "text-primary font-semibold" : "text-muted-foreground"}>• {l}</li>)}</ul>
    </div>
  );
}

const iso = (t?: Tri) => (t ? `${t[0]}-${String(t[1]).padStart(2, "0")}-${String(t[2]).padStart(2, "0")}` : "");
function DateEditor({ entities }: { entities: DecodeEntity[] }) {
  const ov = useOverrides();
  return (
    <div className="rounded-md border border-primary/40 p-2 space-y-1">
      <p className="text-[10px] font-bold tracking-[0.16em] text-primary">Dates · saved on this device</p>
      {entities.map(e => {
        const k = entityKey(e.kind, e.name); const o = ov[k];
        return (
          <div key={k} className="flex flex-wrap items-center gap-2">
            <span className="w-48 truncate text-foreground">{e.name} <span className="text-muted-foreground">({e.role ?? e.kind})</span></span>
            <input type="date" defaultValue={o?.date ?? iso(e.date)} onBlur={ev => ev.target.value && setOverride(k, { date: ev.target.value })} className="bg-background border border-border rounded px-1 py-0.5" />
            {e.kind === "player" && <input placeholder="Jersey" defaultValue={o?.jersey ?? e.jersey ?? ""} onBlur={ev => setOverride(k, { jersey: ev.target.value })} className="w-16 bg-background border border-border rounded px-1 py-0.5" />}
            {!e.date && !o && <span className="text-destructive font-semibold">MISSING</span>}
            {o && <><span className="text-primary font-semibold">EDITED</span><button onClick={() => clearOverride(k)} className="underline text-muted-foreground">reset</button></>}
          </div>
        );
      })}
    </div>
  );
}

/** Page-level toolbox: every saved edit, across all sports. */
export function SavedEdits() {
  const ov = useOverrides(); const [open, setOpen] = useState(false); const keys = Object.keys(ov);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(v => !v)} className="text-xs font-bold px-3 py-1.5 rounded bg-primary text-primary-foreground">DATE TOOLBOX · {keys.length} saved edits</button>
      {open && <div className="mt-2 rounded-lg border border-border p-3 text-[11px] space-y-1">
        <p className="text-muted-foreground">Pick a sport, then press EDIT DATES on any game to change a team, player, coach, city or stadium date. Edits here apply to all future games.</p>
        {keys.length === 0 ? <p className="text-muted-foreground">No edits yet.</p> : keys.map(k => (
          <div key={k} className="flex flex-wrap items-center gap-2">
            <span className="w-56 truncate text-foreground">{k.replace(":", " · ")}</span>
            <input type="date" defaultValue={ov[k].date ?? ""} onBlur={ev => ev.target.value && setOverride(k, { date: ev.target.value })} className="bg-background border border-border rounded px-1 py-0.5" />
            {ov[k].jersey && <span className="text-muted-foreground">#{ov[k].jersey}</span>}
            <button onClick={() => clearOverride(k)} className="underline text-muted-foreground">remove</button>
          </div>))}
      </div>}
    </div>
  );
}
