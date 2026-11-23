import { Link } from "@/lib/wouter";
import { useParams } from "@/lib/wouter";
import { useEffect, useState } from "react";
import { useLife } from "./context";
import { Card, Page, Tag } from "./kit";
import { LIST_LABEL, listDates, type ListKind } from "@/lib/life-studio";

const KINDS = Object.keys(LIST_LABEL) as ListKind[];

export default function DatesPage() {
  const { sub } = useParams();
  const kind = (KINDS.includes(sub as ListKind) ? sub : null) as ListKind | null;
  const { profile } = useLife();
  const [year, setYear] = useState(2026);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);
  const rows = kind ? listDates(profile, kind, year) : [];

  return (
    <Page kicker="Date library" title={kind ? LIST_LABEL[kind] : "Every marked date"} lede="Soulmate, fatal, challenging, love, and beneficial dates repeat every year from your birthday chart. Wealth, 28, and master days are listed for this year and the next.">
      <div className="flex flex-wrap gap-2">
        <Link href="/dates" className={`rounded-full border px-3 py-1 text-xs ${!kind ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>All lists</Link>
        {KINDS.map((k) => (
          <Link key={k} href={`/dates/${k}`} className={`rounded-full border px-3 py-1 text-xs ${kind === k ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{LIST_LABEL[k]}</Link>
        ))}
      </div>
      {!kind && (
        <div className="grid sm:grid-cols-2 gap-3">
          {KINDS.map((k) => (
            <Link key={k} href={`/dates/${k}`} className="glass-card p-4 block">
              <h2 className="font-display text-lg">{LIST_LABEL[k]}</h2>
              <p className="text-sm text-muted-foreground mt-1">{listDates(profile, k, year).length} dates</p>
            </Link>
          ))}
        </div>
      )}
      {kind && (
        <Card>
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.iso + r.label} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/day/${r.iso}`} className="text-foreground hover:text-primary">{r.label}</Link>
                  <p className="text-xs text-muted-foreground mt-1">{r.headline}</p>
                </div>
                <div className="flex flex-wrap gap-1">{r.tones.map((t) => <Tag key={t} tone={t === "fatal" || t === "challenging" ? "bad" : "good"}>{LIST_LABEL[t]}</Tag>)}</div>
              </li>
            ))}
            {!rows.length && <li className="text-sm text-muted-foreground py-4">None in this window.</li>}
          </ul>
        </Card>
      )}
    </Page>
  );
}
