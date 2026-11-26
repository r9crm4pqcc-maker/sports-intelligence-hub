import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { researchSportsFacts } from "./sports-research.functions";
import { missingSportsFacts, applyResearchedFacts, type ResearchFact } from "./sports-research";
import type { VoteInput } from "./vote-decode";
// One research job at a time keeps live match interaction smooth.
let queue: Promise<unknown> = Promise.resolve();
export function useSportsResearch(input: VoteInput, ready: boolean) {
  const research = useServerFn(researchSportsFacts);
  const [result, setResult] = useState<{ key: string; facts: ResearchFact[]; status: string }>({ key: "", facts: [], status: "" });
  const tasks = useMemo(() => missingSportsFacts(input), [input]);
  const date = `${input.year}-${String(input.month).padStart(2, "0")}-${String(input.day).padStart(2, "0")}`;
  const key = JSON.stringify({ tasks, date, league: input.league });
  useEffect(() => {
    if (!ready || !tasks.length) return;
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      if (!data.session) { setResult({ key, facts: [], status: "Sign in in Settings to automatically research missing facts." }); return; }
      setResult({ key, facts: [], status: "Researching missing facts…" });
      queue = queue.catch(() => {}).then(async () => {
        if (!alive) return;
        try {
          const found = await research({ data: { tasks, date, league: input.league || "" } });
          if (alive) setResult({ key, facts: found.facts, status: found.error || (found.facts.length ? `${found.facts.length} source-backed facts filled` : "Missing facts remain unverified; no guesses applied.") });
        } catch { if (alive) setResult({ key, facts: [], status: "Research unavailable. Existing facts are unchanged." }); }
      });
    });
    return () => { alive = false; };
  }, [key, ready]);
  const facts = result.key === key ? result.facts : [];
  return { input: useMemo(() => applyResearchedFacts(input, facts), [input, facts]), facts, status: result.key === key ? result.status : "" };
}
