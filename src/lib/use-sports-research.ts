import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { researchSportsFacts } from "./sports-research.functions";
import { missingSportsFacts, applyResearchedFacts, approvedResearchFacts, researchFactKey, type ResearchFact } from "./sports-research";
import type { VoteInput } from "./vote-decode";
import { useSportsDocument } from "./use-sports-document";
// One research job at a time keeps live match interaction smooth.
let queue: Promise<unknown> = Promise.resolve();
let pausedUntil = 0;
export function useSportsResearch(input: VoteInput, ready: boolean) {
  const research = useServerFn(researchSportsFacts);
  const [sessionRevision, setSessionRevision] = useState(0);
  const [retry, setRetry] = useState(0);
  useEffect(() => { const { data } = supabase.auth.onAuthStateChange(event => { if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") setSessionRevision(v => v + 1); }); return () => data.subscription.unsubscribe(); }, []);
  const [result, setResult] = useState<{ key: string; facts: ResearchFact[]; status: string }>({ key: "", facts: [], status: "" });
  const tasks = useMemo(() => missingSportsFacts(input), [input]);
  const date = `${input.year}-${String(input.month).padStart(2, "0")}-${String(input.day).padStart(2, "0")}`;
  const key = JSON.stringify({ tasks, date, league: input.league });
  const approvals = useSportsDocument<string[]>("approvals", key, []);
  const approved = approvals.value;
  useEffect(() => {
    if (!ready || !tasks.length) return;
    let alive = true;
    const timer = setTimeout(() => { void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      if (!data.session) { setResult({ key, facts: [], status: "Sign in in Settings to automatically research missing facts." }); return; }
      setResult({ key, facts: [], status: "Researching missing facts…" });
      queue = queue.catch(() => {}).then(async () => {
        if (!alive) return;
        if (Date.now() < pausedUntil) { setResult({ key, facts: [], status: "Web search is temporarily busy. Research again shortly; your data is unchanged." }); return; }
        try {
          const found = await research({ data: { tasks, date, league: input.league || "", refresh: retry > 0 } });
          if ("retryAfter" in found && typeof found.retryAfter === "number") pausedUntil = Date.now() + found.retryAfter * 1000;
          if (alive) setResult({ key, facts: found.facts, status: found.error || (found.facts.length ? `${found.facts.length} facts found — review and verify before use.` : "Missing facts remain unverified; no guesses applied.") });
        } catch { if (alive) setResult({ key, facts: [], status: "Research unavailable. Existing facts are unchanged." }); }
      });
    }); }, 650);
    return () => { alive = false; clearTimeout(timer); };
  }, [key, ready, sessionRevision, retry]);
  const facts = result.key === key ? result.facts : [];
  const accepted = useMemo(() => approvedResearchFacts(facts, approved), [facts, approved]);
  const verify = (fact: ResearchFact) => {
    if (!approvals.userId || !approvals.ready) return;
    const signature = researchFactKey(fact);
    const next = approved.includes(signature) ? approved.filter(v => v !== signature) : [...approved, signature];
    approvals.change(next);
  };
  return { input: useMemo(() => applyResearchedFacts(input, accepted), [input, accepted]), facts, verify, isVerified: (f: ResearchFact) => approved.includes(researchFactKey(f)), status: result.key === key ? result.status : "", verificationStatus: approvals.status, retry: () => setRetry(v => v + 1), missingCount: tasks.length };
}
