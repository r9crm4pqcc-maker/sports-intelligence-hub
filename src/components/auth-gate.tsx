import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";

export function AuthGate({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "signed-in" | "signed-out">("loading");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) setStatus(data.session ? "signed-in" : "signed-out");
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setStatus(session ? "signed-in" : "signed-out");
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  if (status === "loading") {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading…</div>;
  }

  if (status === "signed-out") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 sparkle-bg">
        <div className="w-full max-w-sm rounded-2xl border border-primary/30 bg-card p-7 text-center shadow-[var(--shadow-gold)] space-y-5">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-gold)]">
            <Zap size={24} className="fill-current" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              THE <span className="text-primary">SAUCE</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your sports research, tuned weights, and personal chart.
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            disabled={signingIn}
            className="w-full font-semibold"
            onClick={async () => {
              setSigningIn(true);
              setError("");
              const result = await lovable.auth.signInWithOAuth("lovable", { redirect_uri: window.location.origin });
              if (result.error) {
                setError(result.error.message);
                setSigningIn(false);
              }
            }}
          >
            <LovableMark />
            {signingIn ? "Connecting…" : "Continue with Lovable"}
          </Button>
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}