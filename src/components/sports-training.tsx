import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "./ui/button";
import { useSportsDocument } from "@/lib/use-sports-document";
import { EMPTY_FEEDBACK, replaceCorrection, type SportsFeedback, type WinnerCorrection } from "@/lib/sports-feedback";
import type { VoteInput } from "@/lib/vote-decode";
import { sportsWeightSnapshot } from "@/lib/sports-weights";
const TrainingContext = createContext<{ state: SportsFeedback; save: (row: WinnerCorrection) => void; remove: (id: string, league: string) => void; ready: boolean; status: string; saveStatus: string } | null>(null);
export function SportsTrainingProvider({ children }: { children: ReactNode }) {
  const document = useSportsDocument<SportsFeedback>("training", "sports", EMPTY_FEEDBACK);
  const [training, setTraining] = useState("");
  const worker = useRef<Worker | null>(null), latest = useRef(document);
  const pending = useRef(new Set<string>());
  const running = useRef(false);
  latest.current = document;
  const start = (state: SportsFeedback, league: string, targetId?: string) => {
    if (running.current) { pending.current.add(league); return; }
    running.current = true;
    const next = new Worker(new URL("../lib/sports-tuning.worker.ts", import.meta.url), { type: "module" }); worker.current = next;
    setTraining(`Tuning ${league} in the background…`);
    next.onmessage = (event: MessageEvent<{ league: string; weights: Record<string, number>; report: string }>) => {
      const current = latest.current; const updated = { ...current.value, leagues: { ...current.value.leagues, [event.data.league]: event.data.weights }, report: event.data.report, pending: (current.value.pending || []).filter(l => l !== event.data.league || pending.current.has(l)) }; current.change(updated); setTraining(""); next.terminate(); worker.current = null; running.current = false;
      const waiting = pending.current.values().next().value;
      if (waiting) { pending.current.delete(waiting); start(updated, waiting); }
    };
    next.onerror = () => { setTraining("Correction saved. Tuning paused; select the pick again to retry."); next.terminate(); worker.current = null; running.current = false; };
    next.postMessage({ state, league, targetId });
  };
  useEffect(() => () => worker.current?.terminate(), []);
  useEffect(() => { if (document.ready && !running.current && document.value.pending?.length) { const league = document.value.pending[0]; if (league) start(document.value, league); } }, [document.ready, document.value.pending]);
  const save = (row: WinnerCorrection) => { const state = { ...document.value, corrections: replaceCorrection(document.value.corrections, row), pending: [...new Set([...(document.value.pending || []), row.league])] }; document.change(state); start(state, row.league, row.id); };
  const remove = (id: string, league: string) => { const remaining = document.value.corrections.filter(r => r.id !== id); const leagues = { ...document.value.leagues }; if (!remaining.some(r => r.league === league)) delete leagues[league]; const state = { ...document.value, leagues, corrections: remaining, pending: [...new Set([...(document.value.pending || []), league])] }; document.change(state); start(state, league); };
  return <TrainingContext.Provider value={{ state: document.value, save, remove, ready: document.ready, status: training || document.value.report || document.status, saveStatus: document.status }}>{children}</TrainingContext.Provider>;
}
export function useSportsTrainingInput(input: VoteInput) {
  const context = useContext(TrainingContext);
  const snapshot = useMemo(() => sportsWeightSnapshot().weights, []);
  return useMemo(() => !context || input.codeMode === "backup" || !Object.keys(context.state.leagues).length ? input : { ...input, personalTrainingThrough: context.state.corrections.map(r => r.correctedAt).sort().at(-1), personalTrainingGameIds: context.state.corrections.map(r => r.id.replace(":", "|")), weightProfileOverride: { global: snapshot.global, leagues: { ...snapshot.leagues, ...context.state.leagues } } }, [input, context?.state.leagues, context?.state.corrections, snapshot]);
}
export function useSportsTrainingProfile() {
  const context = useContext(TrainingContext);
  const snapshot = useMemo(() => sportsWeightSnapshot().weights, []);
  return useMemo(() => !context || !Object.keys(context.state.leagues).length ? undefined : { global: snapshot.global, leagues: { ...snapshot.leagues, ...context.state.leagues } }, [context?.state.leagues, snapshot]);
}
export function WinnerEditor({ id, input, settled, actual, frozen }: { id: string; input: VoteInput; settled: boolean; actual: "home" | "away" | null; frozen?: VoteInput }) {
  const context = useContext(TrainingContext);
  const recorded = context?.state.corrections.some(r => r.id === id);
  useEffect(() => { if (context?.ready && settled && actual && frozen && !recorded) context.save({ id, input: frozen, league: input.league || "", winner: actual, settled: true, correctedAt: new Date().toISOString() }); }, [context?.ready, settled, actual, !!frozen, recorded]);
  if (!context) return null;
  const selected = context.state.corrections.find(r => r.id === id)?.winner;
  return <details className="mt-3 border-t border-border pt-3"><summary className="cursor-pointer text-xs text-primary">Edit pick / train weights{selected ? ` · ${input[selected].name}` : ""}</summary><p className="mt-2 text-xs text-muted-foreground">{settled ? "Correct winner · does not rewrite the original forecast" : "Your pick · training label, not a confirmed result"}</p><div className="flex flex-wrap gap-2 mt-2">{(["away", "home"] as const).map(side => <Button key={side} variant={selected === side ? "default" : "outline"} size="sm" disabled={!context.ready} onClick={() => context.save({ id, league: input.league || "", winner: side, input: { ...input, weightProfileOverride: undefined }, settled, correctedAt: new Date().toISOString() })}>{input[side].name}</Button>)}{selected && <Button variant="ghost" size="sm" onClick={() => context.remove(id, input.league || "")}>Clear correction</Button>}</div><p role="status" className="text-xs text-muted-foreground mt-2">{context.status}</p><p className="text-xs text-muted-foreground mt-1">{context.saveStatus}</p></details>;
}