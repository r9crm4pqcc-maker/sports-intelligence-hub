import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { readSportsDocument, writeSportsDocument } from "./sports-account.functions";
export function useSportsDocument<T>(kind: "people" | "approvals", key: string, empty: T, legacy?: () => T | null) {
  const read = useServerFn(readSportsDocument), write = useServerFn(writeSportsDocument);
  const [identity, setIdentity] = useState<string | null>(null);
  const [value, setValue] = useState<T>(empty);
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const generation = useRef(0), saves = useRef(Promise.resolve());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSave = useRef<(() => void) | null>(null);
  const cacheKey = `sauce-sports:${identity || "guest"}:${kind}:${key}`;
  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => { if (alive) setIdentity(data.session?.user.id || ""); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => { if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) setIdentity(session?.user.id || ""); });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (identity === null) return;
    const current = ++generation.current;
    setReady(false); setValue(empty); setStatus("");
    const load = async () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        const pending = localStorage.getItem(`${cacheKey}:pending`) === "true";
        const claimKey = `sauce-legacy-owner:${kind}:${key}`;
        const owner = localStorage.getItem(claimKey);
        const fallback = cached ? JSON.parse(cached) as T : (!owner || owner === identity ? legacy?.() : null);
        const remote = identity ? await read({ data: { kind, key } }) : null;
        if (generation.current !== current) return;
        const next = pending && cached ? JSON.parse(cached) as T : remote === null ? fallback ?? empty : remote as T;
        setValue(next); setReady(true);
        localStorage.setItem(cacheKey, JSON.stringify(next));
        if (identity && (pending || (remote === null && fallback !== null && fallback !== undefined))) {
          await write({ data: { kind, key, value: next, userId: identity } });
          localStorage.removeItem(`${cacheKey}:pending`);
          localStorage.setItem(claimKey, identity);
        }
        if (generation.current === current) setStatus(identity ? "Saved to your account" : "Saved on this device · sign in to sync");
      } catch (error) { if (generation.current === current) { setReady(true); setStatus(error instanceof Error ? error.message : "Account sync unavailable."); } }
    };
    void load();
    return () => { generation.current++; };
  }, [identity, key, revision]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); pendingSave.current?.(); pendingSave.current = null; }, [key, identity]);
  const change = useCallback((next: T) => {
    if (!ready) return;
    try { localStorage.setItem(cacheKey, JSON.stringify(next)); } catch { setStatus("Changes could not be saved on this device."); return; }
    setValue(next);
    if (!identity) { setStatus("Saved on this device · sign in to sync"); return; }
    setStatus("Saving to your account…");
    localStorage.setItem(`${cacheKey}:pending`, "true");
    const current = generation.current;
    if (timer.current) clearTimeout(timer.current);
    pendingSave.current = () => { saves.current = saves.current.catch(() => {}).then(async () => {
      try { await write({ data: { kind, key, value: next, userId: identity } }); if (localStorage.getItem(cacheKey) === JSON.stringify(next)) localStorage.removeItem(`${cacheKey}:pending`); if (generation.current === current) setStatus("Saved to your account"); }
      catch (error) { if (generation.current === current) setStatus(error instanceof Error ? error.message : "Account save failed."); }
    }); };
    timer.current = setTimeout(() => { pendingSave.current?.(); pendingSave.current = null; }, 450);
  }, [ready, identity, key, cacheKey, kind, write]);
  return { value, change, status, ready, userId: identity || "", reload: () => setRevision(v => v + 1) };
}