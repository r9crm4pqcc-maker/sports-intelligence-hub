import { Card, Page } from "./kit";
import { FRIENDLY, PATH_28, VIRGO } from "@/lib/path28";

function Bars({ rows }: { rows: { name: string; pct: number }[] }) {
  return (
    <div className="space-y-2 mt-2">
      {rows.map((row) => (
        <div key={row.name} className="grid grid-cols-[9rem_1fr_2.75rem] items-center gap-2">
          <span className="text-sm text-foreground truncate">{row.name}</span>
          <span className="h-2 rounded-full bg-border overflow-hidden">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${row.pct}%` }} />
          </span>
          <span className="text-sm text-right text-foreground">{row.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export default function AdvancedPage() {
  return (
    <Page kicker="CUE" title="Friendly matches" lede="The countries, cities, clothes, and cars from the chart, with the 28 career and the Virgo health note.">
      <Card>
        <h2 className="font-display text-lg">Power colors</h2>
        <p className="text-sm mt-2">Black and white. Black and orange. Green.</p>
      </Card>
      <Card>
        <h2 className="font-display text-lg">Countries</h2>
        <Bars rows={FRIENDLY.countries} />
      </Card>
      <Card>
        <h2 className="font-display text-lg">Cities</h2>
        <Bars rows={FRIENDLY.cities} />
      </Card>
      <Card>
        <h2 className="font-display text-lg">Clothing</h2>
        <Bars rows={FRIENDLY.clothes} />
      </Card>
      <Card>
        <h2 className="font-display text-lg">Cars</h2>
        <Bars rows={FRIENDLY.cars} />
      </Card>
      <Card>
        <h2 className="font-display text-lg">Career · 28</h2>
        <p className="text-sm text-foreground/90 mt-2">{PATH_28.career.body}</p>
        <p className="text-sm mt-2">{PATH_28.career.tags.join(" · ")}</p>
        <p className="text-sm text-muted-foreground mt-2">{PATH_28.career.paths.join(" · ")}</p>
        <p className="text-sm text-muted-foreground mt-2">{PATH_28.career.style} {PATH_28.career.watch}</p>
      </Card>
      <Card>
        <h2 className="font-display text-lg">Career · Virgo</h2>
        <p className="text-sm text-foreground/90 mt-2">{VIRGO.career.body}</p>
        <p className="text-sm mt-2">{VIRGO.career.tags.join(" · ")}</p>
        <p className="text-sm text-muted-foreground mt-2">{VIRGO.career.paths.join(" · ")}</p>
        <p className="text-sm text-muted-foreground mt-2">{VIRGO.career.style} {VIRGO.career.watch}</p>
      </Card>
      <Card>
        <h2 className="font-display text-lg">{VIRGO.health.title}</h2>
        <p className="text-sm text-foreground/90 mt-2">{VIRGO.health.body}</p>
        <p className="text-sm mt-2">Vulnerability: {VIRGO.health.vulnerability}. Remedy: {VIRGO.health.remedy}.</p>
        <p className="text-sm text-muted-foreground mt-2">{VIRGO.health.insight}</p>
      </Card>
    </Page>
  );
}
