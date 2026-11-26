import { Card, Page } from "./kit";
import { FRIENDLY } from "@/lib/path28";

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
    <Page kicker="CUE" title="Friendly matches" lede="Countries, cities, clothes, and cars.">
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
    </Page>
  );
}
