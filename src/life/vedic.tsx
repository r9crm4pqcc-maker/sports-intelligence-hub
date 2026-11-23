import { Card, Page } from "./kit";
import { VEDIC_NATAL } from "@/lib/path28";
import { SkyNow } from "./sky-now";

const BLOCKS = [
  { title: "Colors", lines: [
    "Favorable: orange, deep red, white/cream, navy/dark blue, smoky grey.",
    "Partial: soft pink.",
    "Avoid as a main color: green, yellow, dominant black.",
    "Competition: solid red or navy.",
    "Daily: navy or white.",
    "Rest: white or cream.",
  ] },
  { title: "Numbers", lines: [
    "Favorable: 1, 2, 4, 7, 8, 9, and the same family (10, 11, 17, 18, 19, 28).",
    "Avoid: 5, 14, 23 and 3, 12, 21, 30.",
    "Best jersey: 9 or 18 (Mars), then 10 (Sun).",
    "Money: 28.",
  ] },
  { title: "Days", lines: [
    "Favorable: Sunday, Monday, Tuesday, Saturday.",
    "Partial: Friday.",
    "Avoid for starts: Wednesday, Thursday.",
    "Best for training and competition: Tuesday.",
  ] },
  { title: "Months", lines: [
    "Favorable: mid-August to mid-September, mid-December to mid-January, mid-April to mid-May.",
    "Avoid: mid-October to mid-November, mid-February to mid-March, mid-June to mid-July.",
  ] },
  { title: "Directions", lines: [
    "Favorable: south, east, west, north-west, south-west.",
    "Partial: south-east.",
    "Avoid: north, north-east.",
    "Sleep with your head to the south or the east. Never north.",
    "Bed in the south-west corner.",
  ] },
  { title: "Metals", lines: [
    "Favorable: copper.",
    "Partial: silver.",
    "Avoid: gold, in this reading.",
  ] },
];

export default function VedicPage() {
  return (
    <Page kicker="Vedic" title="Sidereal chart" lede="September 8, 2009. This page is the Vedic chart only. These colors, numbers, days, months, directions, and metals are the Vedic reading. They are not the Western chart and not the numerology power colors.">
      <Card>
        <p className="text-xs text-muted-foreground mb-2">{VEDIC_NATAL.when}. Libra rising.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left"><tr><th className="py-1 pr-3">Planet</th><th className="pr-3">Sign</th><th className="pr-3">Nakshatra</th><th>Notes</th></tr></thead>
            <tbody>
              {VEDIC_NATAL.rows.map((r) => (
                <tr key={r.planet} className="border-t border-border"><td className="py-1 pr-3">{r.planet}</td><td className="pr-3">{r.sign}</td><td className="pr-3">{r.nakshatra}</td><td>{r.notes}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {BLOCKS.map((b) => (
        <Card key={b.title}>
          <h2 className="font-display text-lg">{b.title}</h2>
          <ul className="mt-2 space-y-1 text-sm text-foreground">{b.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        </Card>
      ))}
      <Card>
        <h2 className="font-display text-lg">Body</h2>
        <p className="text-sm text-muted-foreground mt-2">Traditional planet-to-tissue notes. Not a diagnosis.</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>Sun rules bone. Sidereal Sun is in Leo, its own sign.</li>
          <li>Moon rules blood.</li>
          <li>Mars rules bone marrow.</li>
          <li>Mercury rules skin. Retrograde, in its own sign, Virgo.</li>
          <li>Jupiter rules fat. Retrograde and debilitated in Capricorn. That is the weak planet here.</li>
          <li>Venus rules semen.</li>
          <li>Saturn rules muscle. Atmakaraka in Leo, not a weak Saturn.</li>
        </ul>
      </Card>
      <SkyNow primary="sidereal" />
    </Page>
  );
}
