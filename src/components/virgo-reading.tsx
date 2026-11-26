import { VIRGO, VIRGO_MATCHES } from "@/lib/path28";
export function VirgoReading() {
  return (
    <div className="mt-4 space-y-3 text-sm">
      <p className="font-display text-lg text-foreground">{VIRGO.title}</p>
      <p className="text-xs text-muted-foreground">{VIRGO.line}</p>
      <p className="text-foreground/90 leading-relaxed">{VIRGO.overview}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.insight}</p>
      <p className="text-foreground/90 leading-relaxed">{VIRGO.strength}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.weakness}</p>
      <p className="font-display text-lg text-foreground">{VIRGO.love.title}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.love.body}</p>
      <p className="text-foreground">{VIRGO.opposite.sign} · {VIRGO.opposite.pct}. {VIRGO.opposite.note}.</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.opposite.body} {VIRGO.caution}</p>
      <p className="text-foreground">Friendly: {VIRGO.friends.signs.map((s) => `${s.sign} ${s.pct}%`).join(" · ")}.</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.friends.body} {VIRGO.friends.windows}</p>
      <p className="font-display text-lg text-foreground">{VIRGO.health.title}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.health.body}</p>
      <p className="text-foreground">Vulnerability: {VIRGO.health.vulnerability}. Remedy: {VIRGO.health.remedy}.</p>
      <p className="text-muted-foreground">{VIRGO.health.insight}</p>
      <p className="font-display text-lg text-foreground">Career · Virgo</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.career.body}</p>
      <p className="text-foreground">{VIRGO.career.tags.join(" · ")}</p>
      <p className="text-muted-foreground">{VIRGO.career.paths.join(" · ")}</p>
      <p className="text-muted-foreground leading-relaxed">{VIRGO.career.style} {VIRGO.career.watch}</p>
      <p className="text-muted-foreground">All 12, most compatible first.</p>
      <ul className="space-y-1">{VIRGO_MATCHES.map(m => <li key={m.sign}>{m.sign} · {m.pct}%</li>)}</ul>
    </div>
  );
}

