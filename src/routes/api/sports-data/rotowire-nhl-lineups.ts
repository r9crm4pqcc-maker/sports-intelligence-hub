import { createFileRoute } from "@tanstack/react-router";
import { parseRotoWireNhlLineups } from "@/lib/server/rotowire-nhl-parser";

const cache = new Map<string, { expires: number; body: string }>();

function json(body: string, status = 200) {
  return new Response(body, { status, headers: { "content-type": "application/json", "cache-control": "public, max-age=30" } });
}

export const Route = createFileRoute("/api/sports-data/rotowire-nhl-lineups")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const date = new URL(request.url).searchParams.get("date");
        if (date !== "today" && date !== "tomorrow") return json(JSON.stringify({ error: "Choose today or tomorrow for NHL lineups." }), 400);
        const saved = cache.get(date);
        if (saved && saved.expires > Date.now()) return json(saved.body);
        const sourceUrl = new URL("https://www.rotowire.com/hockey/nhl-lineups.php");
        if (date === "tomorrow") sourceUrl.searchParams.set("date", date);
        try {
          const upstream = await fetch(sourceUrl, {
            signal: AbortSignal.timeout(18000),
            headers: { accept: "text/html", "user-agent": "Mozilla/5.0 (compatible; SportsPrediction/1.0)" },
          });
          if (!upstream.ok) return json(JSON.stringify({ error: "RotoWire NHL lineups are unavailable right now." }), 502);
          const body = JSON.stringify(parseRotoWireNhlLineups(await upstream.text(), date, new Date().toISOString()));
          if (cache.size > 10) cache.clear();
          cache.set(date, { expires: Date.now() + 30000, body });
          return json(body);
        } catch {
          return json(JSON.stringify({ error: "RotoWire NHL lineups are unavailable right now." }), 502);
        }
      },
    },
  },
});
