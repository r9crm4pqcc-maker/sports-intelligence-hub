import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardTitle, Page, Tag } from "./kit";
import { GROUPS, PERSPECTIVE_LABEL, getLibraryEntry, searchLibrary, type GuideBlock, type LibraryArticle, type LibraryGuide } from "@/lib/knowledge-library";
import { lifePath, luckyNumber, fmt } from "@/lib/vote-decode";

export function LibraryIndexPage() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const found = useMemo(() => searchLibrary(query, group), [query, group]);
  return (
    <Page kicker="Knowledge Library" title="Two ways of seeing" lede="Every article and guide from your astrology and numbers document: what science knows, what tradition says, and how this app reads it." wide>
      <Card>
        <label className="block text-xs text-muted-foreground mb-1" htmlFor="library-search">Search the library</label>
        <input id="library-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try: sidereal, Personal Year, Cat, 28, lucky"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setGroup(null)} className={`rounded-full border px-3 py-1 text-xs ${group === null ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>All</button>
          {GROUPS.map((g) => (
            <button key={g} type="button" onClick={() => setGroup(g)} className={`rounded-full border px-3 py-1 text-xs ${group === g ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{g}</button>
          ))}
        </div>
      </Card>
      {found.guides.length > 0 && (
        <section>
          <CardTitle>Guides and house rules</CardTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {found.guides.map((g) => (
              <Link key={g.id} to="/library/$id" params={{ id: g.id }} className="glass-card p-4 block">
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary font-bold">Guide</p>
                <p className="font-display text-lg text-foreground mt-1">{g.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section>
        <CardTitle>Articles · {found.articles.length}</CardTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {found.articles.map((a) => (
            <Link key={a.id} to="/library/$id" params={{ id: a.id }} className="glass-card p-4 block">
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary font-bold">{a.group}</p>
              <p className="font-display text-lg text-foreground mt-1 leading-snug">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.subtitle}</p>
            </Link>
          ))}
        </div>
        {!found.articles.length && !found.guides.length && <p className="text-sm text-muted-foreground">Nothing matches that search.</p>}
      </section>
    </Page>
  );
}

export function LibraryEntryPage({ id }: { id: string }) {
  const entry = getLibraryEntry(id);
  if (!entry) return (
    <Page kicker="Knowledge Library" title="Not in the library">
      <Link to="/library" className="text-sm text-primary hover:underline">Back to the library</Link>
    </Page>
  );
  return entry.kind === "article" ? <ArticleView a={entry.item} /> : <GuideView g={entry.item} />;
}

function Back() {
  return <Link to="/library" className="text-sm text-primary hover:underline">← All articles and guides</Link>;
}

function ArticleView({ a }: { a: LibraryArticle }) {
  const caption = a.figure.length > 1 ? a.figure[a.figure.length - 1] : "";
  const diagram = a.figure.length > 1 ? a.figure.slice(0, -1) : a.figure;
  return (
    <Page kicker={a.group} title={a.title} lede={a.subtitle}>
      <Back />
      <Card>
        <CardTitle>The question</CardTitle>
        <p className="text-foreground font-display text-xl leading-snug">{a.question}</p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-primary font-bold">The short answer</p>
        <p className="text-sm text-foreground leading-relaxed mt-1">{a.shortAnswer}</p>
        {caption && (
          <div className="mt-4 rounded-lg border border-border p-3">
            {diagram.length > 0 && <p className="text-[11px] text-muted-foreground font-mono break-words">{diagram.join(" · ")}</p>}
            <p className="text-xs text-foreground mt-2 leading-relaxed">{caption}</p>
          </div>
        )}
      </Card>
      {a.sections.map((s) => (
        <Card key={s.heading}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <CardTitle>{s.heading === "Perspective" ? PERSPECTIVE_LABEL : s.heading}</CardTitle>
            {s.evidence && <Tag tone={/Established|Historical/.test(s.evidence) ? "good" : "neutral"}>{s.evidence === "CUE Perspective" ? "Interpretation" : s.evidence}</Tag>}
          </div>
          <div className="space-y-2">{s.paragraphs.map((p, i) => <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>)}</div>
        </Card>
      ))}
      <p className="text-xs text-muted-foreground">“CUE” in the text is the system these articles were written for.</p>
    </Page>
  );
}

function GuideView({ g }: { g: LibraryGuide }) {
  return (
    <Page kicker="Guide" title={g.title} wide>
      <Back />
      <Card><GuideBlocks blocks={g.blocks} /></Card>
    </Page>
  );
}

function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  let rows: string[][] = [];
  const flush = (key: number) => {
    if (list.length) { out.push(<ul key={`l${key}`} className="list-disc pl-5 space-y-1 text-sm text-foreground">{list.map((x, i) => <li key={i}>{x}</li>)}</ul>); list = []; }
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(
        <div key={`t${key}`} className="overflow-x-auto"><table className="w-full text-sm text-left">
          <thead><tr>{head.map((c, i) => <th key={i} className="border-b border-border py-1 pr-3 text-primary text-xs uppercase tracking-wide">{c}</th>)}</tr></thead>
          <tbody>{body.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-border py-1 pr-3 text-foreground align-top">{c}</td>)}</tr>)}</tbody>
        </table></div>,
      );
      rows = [];
    }
  };
  blocks.forEach((b, i) => {
    if (b.t === "li") { if (rows.length) flush(i); list.push(b.x); return; }
    if (b.t === "row") { if (list.length) flush(i); rows.push(b.c); return; }
    flush(i);
    if (b.t === "h") out.push(<h2 key={i} className="font-display text-2xl text-foreground pt-4">{b.x}</h2>);
    else if (b.t === "h3") out.push(<h3 key={i} className="font-display text-lg text-foreground pt-2">{b.x}</h3>);
    else if (b.t === "k") out.push(<p key={i} className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold pt-4">{b.x}</p>);
    else if (b.t === "p") out.push(<p key={i} className="text-sm text-foreground leading-relaxed">{b.x}</p>);
    else if (b.t === "chips") out.push(<div key={i} className="flex flex-wrap gap-1.5">{b.c.map((c, j) => <Tag key={j}>{c}</Tag>)}</div>);
    else if (b.t === "calc") out.push(<LifePathCalculator key={i} />);
  });
  flush(blocks.length);
  return <div className="space-y-2">{out}</div>;
}

export function LifePathCalculator() {
  const [dob, setDob] = useState("1984-12-30");
  const m = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const read = m ? (() => {
    const [y, mo, d] = [+m[1], +m[2], +m[3]];
    const digits = [...`${mo}${d}${y}`].map(Number);
    return { lp: lifePath(y, mo, d), digits, lucky: luckyNumber(y, mo) };
  })() : null;
  return (
    <div className="rounded-xl border border-primary/40 p-4 my-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold">Interactive reading · Life Path calculator</p>
      <label className="block text-xs text-muted-foreground mt-2" htmlFor="lp-dob">Date of birth</label>
      <input id="lp-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)}
        className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
      {read && (
        <div className="mt-3">
          <p className="font-display text-3xl text-primary">Life Path {fmt(read.lp)}</p>
          <p className="text-xs text-muted-foreground mt-1">Every digit counts, zeros included: {read.digits.join(" + ")} = {read.lp.compound}{read.lp.compound !== read.lp.reduced ? ` → ${read.lp.reduced}` : ""}. Master numbers 11, 22 and 33 are kept.</p>
          <p className="text-xs text-muted-foreground mt-1">Lucky Number {read.lucky}: first digit of the birth month + last non-zero digit of the birth year, kept whole.</p>
        </div>
      )}
    </div>
  );
}
