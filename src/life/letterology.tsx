import { useMemo, useState } from "react";
import { useLife } from "./context";
import { Card, Page } from "./kit";
import { readWord } from "@/lib/letterology";
import { buildChart } from "@/lib/life-studio";
import { fitFace, numberFit } from "@/lib/path28";
import { RelatedReading } from "./related-reading";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

export default function LetterologyPage() {
  const { profile } = useLife();
  const [word, setWord] = useState("numerology");
  const [upper, setUpper] = useState(false);
  const [sensitive, setSensitive] = useState(true);
  const chart = buildChart(profile, { y: profile.year, m: profile.month, d: profile.day });
  const self = fitFace(chart.lifePath.compound, chart.lifePath.reduced);
  const read = useMemo(() => readWord(word, sensitive), [word, sensitive]);
  const fit = read.letters.length ? numberFit(self, read.reducedRoot) : null;

  return (
    <Page kicker="Letterology" title="Words and names" lede="A is 1 through Z is 26. Reduced is that number brought down. Case sensitive keeps the letters you typed. Turn it off and the word is read in lowercase. The numbers do not change between cases.">
      <Card>
        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => setUpper(false)} className={`rounded-full border px-3 py-1 text-sm ${upper ? "border-border text-muted-foreground" : "border-primary text-primary"}`}>Lowercase</button>
          <button type="button" onClick={() => setUpper(true)} className={`rounded-full border px-3 py-1 text-sm ${upper ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>Uppercase</button>
        </div>
        <div className="grid grid-cols-9 sm:grid-cols-13 gap-1">
          {LETTERS.map((ch) => (
            <div key={ch} className="rounded-md border border-border px-1 py-1 text-center">
              <p className="text-sm text-foreground">{upper ? ch.toUpperCase() : ch}</p>
              <p className="text-[10px] text-muted-foreground">{ch.charCodeAt(0) - 96}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <label className="text-xs text-muted-foreground">Word or name</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm flex-1 min-w-[12rem]" value={word} onChange={(e) => setWord(e.target.value)} />
          <button type="button" onClick={() => setWord("")} className="rounded-lg border border-border px-3 py-2 text-sm">Clear</button>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} />
          Case sensitive
        </label>
        {read.letters.length > 0 && (
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Breakdown</p>
              <ol className="space-y-0.5">
                {read.letters.map((l, i) => (
                  <li key={`${l.letter}-${i}`}>{i + 1}. {l.letter} {l.ordinal} {l.reduced}</li>
                ))}
              </ol>
            </div>
            <p>Steps (Reduced)<br />{read.letters.map((l) => l.reduced).join(" + ")} = {read.reducedSum}</p>
            <p>Steps (Non-Reduced)<br />{read.letters.map((l) => l.ordinal).join(" + ")} = {read.fullSum}</p>
            <div className="grid sm:grid-cols-3 gap-2">
              <p>Total Reduced:<br /><span className="font-display text-xl">{read.reducedRoot}</span></p>
              <p>First Letter ({read.first?.letter}):<br /><span className="font-display text-xl">{read.first ? `${read.first.reduced}/${read.first.ordinal}` : "—"}</span></p>
              <p>First Vowel ({read.firstVowel?.letter ?? "—"}):<br /><span className="font-display text-xl">{read.firstVowel ? `${read.firstVowel.reduced}/${read.firstVowel.ordinal}` : "—"}</span></p>
              <p>Vowel Sum:<br /><span className="font-display text-xl">{read.vowelRoot}/{read.vowelFull}</span></p>
              <p>Reduced<br /><span className="font-display text-xl">{read.reducedRoot}/{read.reducedSum}</span></p>
              <p>Non-Reduced<br /><span className="font-display text-xl">{read.fullRoot}/{read.fullSum}</span></p>
            </div>
            {fit && (
              <p className="text-foreground">Against your life path {self}: {fit.pct != null ? `${fit.pct}%` : fit.rel}.{fit.rel === "enemy" ? " Fatal attraction with this name number." : ""}</p>
            )}
          </div>
        )}
      </Card>
      <RelatedReading page="letterology" />
    </Page>
  );
}
