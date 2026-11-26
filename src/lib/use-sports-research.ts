import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { researchSportsFacts } from "./sports-research.functions";
import { missingSportsFacts, applyResearchedFacts, approvedResearchFacts, researchFactKey, type ResearchFact } from "./sports-research";
import type { VoteInput } from "./vote-decode";
// One research job at a time keeps live match interaction smooth.
let queue: Promise<unknown> = Promise.resolve();
export function useSportsResearch(input: VoteInput, ready: boolean) {
  const research = useServerFn(researchSportsFacts);
  const [sessionRevision, setSessionRevision] = useState(0);
  const [userId, setUserId] = useState("");
  const [approved, setApproved] = useState<string[]>([]);
  const [saveError, setSaveError] = useState("");
  useEffect(() => { const { data } = supabase.auth.onAuthStateChange(event => { if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") setSessionRevision(v => v + 1); }); return () => data.subscription.unsubscribe(); }, []);
  const [result, setResult] = useState<{ key: string; facts: ResearchFact[]; status: string }>({ key: "", facts: [], status: "" });
  const tasks = useMemo(() => missingSportsFacts(input), [input]);
  const date = `${input.year}-${String(input.month).padStart(2, "0")}-${String(input.day).padStart(2, "0")}`;
  const key = JSON.stringify({ tasks, date, league: input.league });
  const approvalKey = `sauce-research-approved:${userId}:${key}`;
  useEffect(() => {
    setApproved([]);
    if (!userId) return;
    try { const saved: unknown = JSON.parse(localStorage.getItem(approvalKey) || "[]"); if (Array.isArray(saved)) setApproved(saved.filter((v): v is string => typeof v === "string")); } catch { setSaveError("Saved verification could not be read."); }
  }, [approvalKey, userId]);
  useEffect(() => {
    if (!ready || !tasks.length) return;
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUserId(data.session?.user.id || "");
      if (!data.session) { setResult({ key, facts: [], status: "Sign in in Settings to automatically research missing facts." }); return; }
      setResult({ key, facts: [], status: "Researching missing facts…" });
      queue = queue.catch(() => {}).then(async () => {
        if (!alive) return;
        try {
          const found = await research({ data: { tasks, date, league: input.league || "" } });
          if (alive) setResult({ key, facts: found.facts, status: found.error || (found.facts.length ? `${found.facts.length} facts found — review and verify before use.` : "Missing facts remain unverified; no guesses applied.") });
        } catch { if (alive) setResult({ key, facts: [], status: "Research unavailable. Existing facts are unchanged." }); }
      });
    });
    return () => { alive = false; };
  }, [key, ready, sessionRevision]);
  const facts = result.key === key ? result.facts : [];
  const accepted = useMemo(() => approvedResearchFacts(facts, approved), [facts, approved]);
  const verify = (fact: ResearchFact) => {
    if (!userId) return;
    const signature = researchFactKey(fact);
    const next = approved.includes(signature) ? approved.filter(v => v !== signature) : [...approved, signature];
    try { localStorage.setItem(approvalKey, JSON.stringify(next)); setApproved(next); setSaveError(""); } catch { setSaveError("Verification could not be saved; this fact was not applied."); }
  };
  return { input: useMemo(() => applyResearchedFacts(input, accepted), [input, accepted]), facts, verify, isVerified: (f: ResearchFact) => approved.includes(researchFactKey(f)), status: saveError || (result.key === key ? result.status : ""), missingCount: tasks.length };
}
