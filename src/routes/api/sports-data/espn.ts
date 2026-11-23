import { createFileRoute } from "@tanstack/react-router";

// Read-only proxy for public sports feeds; only an allow-list of hosts is fetched.
const HOSTS = new Set(["site.api.espn.com", "sports.core.api.espn.com", "site.web.api.espn.com", "cdn.espn.com", "sbapi.nj.sportsbook.fanduel.com"]);
const cache = new Map<string, { expires: number; body: string }>();

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export const Route = createFileRoute("/api/sports-data/espn")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        let url: URL;
        try {
          const raw = new URL(request.url).searchParams.get("url");
          if (!raw) throw new Error("Missing URL");
          url = new URL(raw);
          if (url.protocol !== "https:" || !HOSTS.has(url.hostname) || url.username || url.password || (url.port && url.port !== "443")) throw new Error("bad");
        } catch {
          return json({ error: "Only permitted HTTPS sports feeds are supported." }, 400);
        }
        const key = url.toString();
        const scoreboard = url.pathname.endsWith("/scoreboard");
        const cacheControl = scoreboard ? "no-store" : "public, max-age=15";
        const headers = { "content-type": "application/json", "cache-control": cacheControl };
        const saved = cache.get(key);
        if (saved && saved.expires > Date.now()) return new Response(saved.body, { headers });
        try {
          const upstream = await fetch(key, {
            signal: AbortSignal.timeout(18000),
            headers: { accept: "application/json", "user-agent": "SportsPrediction/1.0" },
          });
          if (!upstream.ok) return json({ error: `Sports provider returned ${upstream.status}` }, 502);
          const body = await upstream.text();
          const data = JSON.parse(body) as { events?: unknown; content?: { sbData?: { events?: unknown } } };
          const events = data.events ?? data.content?.sbData?.events;
          if (scoreboard && !Array.isArray(events)) return json({ error: "Sports provider returned an invalid scoreboard." }, 502);
          if (cache.size > 500) cache.clear();
          const cacheMs = scoreboard && Array.isArray(events) && events.length === 0 ? 500 : scoreboard ? 10000 : 30000;
          cache.set(key, { expires: Date.now() + cacheMs, body });
          return new Response(body, { headers });
        } catch {
          return json({ error: "Sports feed unavailable. Uploaded accuracy logs remain available." }, 502);
        }
      },
    },
  },
});
