import { useEffect, useState } from "react";
import { Card, CardTitle } from "./kit";
import { lahiriAyanamsa, transitsAt, type Transit } from "@/lib/transits";

/** Today's planets in both zodiacs — the "two ways of seeing" made live. */
export function SkyNow({ primary }: { primary: "tropical" | "sidereal" }) {
  const [now, setNow] = useState<{ rows: Transit[]; ayan: number; at: string } | null>(null);
  useEffect(() => {
    const d = new Date();
    setNow({ rows: transitsAt(d), ayan: lahiriAyanamsa(d), at: d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) });
  }, []);
  return (
    <Card>
      <CardTitle>The sky right now · both zodiacs</CardTitle>
      {!now ? <p className="text-sm text-muted-foreground">Reading the sky…</p> : (
        <>
          <p className="text-xs text-muted-foreground mb-2">{now.at}. Sidereal = tropical − ayanamsa (Lahiri {now.ayan.toFixed(2)}°), so most planets sit one sign back in the Vedic zodiac.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead><tr>
                <th className="py-1 pr-3 text-xs uppercase tracking-wide text-primary border-b border-border">Planet</th>
                <th className={`py-1 pr-3 text-xs uppercase tracking-wide border-b border-border ${primary === "tropical" ? "text-primary" : "text-muted-foreground"}`}>Western (tropical)</th>
                <th className={`py-1 pr-3 text-xs uppercase tracking-wide border-b border-border ${primary === "sidereal" ? "text-primary" : "text-muted-foreground"}`}>Vedic (sidereal)</th>
              </tr></thead>
              <tbody>{now.rows.map((r) => (
                <tr key={r.planet}>
                  <td className="py-1 pr-3 border-b border-border text-foreground">{r.planet}{r.retrograde ? " ℞" : ""}</td>
                  <td className={`py-1 pr-3 border-b border-border ${primary === "tropical" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{r.tropical}</td>
                  <td className={`py-1 pr-3 border-b border-border ${primary === "sidereal" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{r.sidereal}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
