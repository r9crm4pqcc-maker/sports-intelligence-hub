import { Check, ShieldAlert, ExternalLink, Search } from "lucide-react";
import { Button } from "./ui/button";
import { displayDate } from "@/lib/display-date";
import { sourceCredibility, type ResearchFact } from "@/lib/sports-research";
export function ResearchReview({ facts, isVerified, onVerify, missingCount, verificationStatus, onRetry }: { facts: ResearchFact[]; isVerified: (fact: ResearchFact) => boolean; onVerify: (fact: ResearchFact) => void; missingCount: number; verificationStatus: string; onRetry: () => void }) {
  const pending = facts.filter(f => !isVerified(f)).length;
  return <div className="mt-3 border-t border-border pt-3 text-xs">
    <details><summary className="text-primary cursor-pointer"><span className="inline-flex items-center gap-2"><ShieldAlert size={14} />Review research{pending ? ` · ${pending} awaiting approval` : facts.length ? ` · ${facts.length} verified` : " · missing data"}</span></summary>
      <p className="mt-3 text-muted-foreground">{missingCount ? `${missingCount} missing fields. Unverified facts do not affect picks.` : "Feed and manual entries are not research-verified."}</p>
      {missingCount > 0 && <Button variant="ghost" size="sm" onClick={onRetry} className="mt-1"><Search />Research again</Button>}
      {verificationStatus && facts.length > 0 && <p role="status" className="text-muted-foreground">{verificationStatus}</p>}
      {facts.map(f => <div key={f.id} className="border-t border-border mt-3 pt-3 space-y-2"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium">{f.id.replaceAll(":", " · ")} · {displayDate(f.value)}</p><a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">{sourceCredibility(f.sourceUrl)} <ExternalLink size={11} /></a><p className="text-muted-foreground break-all mt-1">{new URL(f.sourceUrl).hostname}</p></div><Button variant="outline" size="sm" aria-label={`${isVerified(f) ? "Unverify" : "Verify"} ${f.id}`} onClick={() => onVerify(f)} className="shrink-0"><Check size={12} />{isVerified(f) ? "Verified" : "Verify"}</Button></div><blockquote className="text-muted-foreground border-l border-border pl-3">{f.quote}</blockquote><p className={isVerified(f) ? "text-primary" : "text-muted-foreground"}>{isVerified(f) ? "Confirmed by you · used in the pick" : "Not verified · not used in the pick"}</p></div>)}
    </details>
  </div>;
}