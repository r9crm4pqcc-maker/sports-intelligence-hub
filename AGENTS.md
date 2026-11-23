<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Imported Life Code app
- Pages from the imported app live in src/life and src/imported-pages; each TanStack route file just renders one page. Why: keeps the original UI untouched.
- src/lib/wouter.tsx is a shim mapping the old Link/useLocation/useSearch API onto TanStack Router. Why: imported pages keep their navigation calls without a second router.
- The app shell renders inside ClientOnly in __root. Why: imported code reads localStorage during render.
- ESPN/FanDuel and RotoWire feeds go through server routes under src/routes/api/sports-data. Why: browser cannot call those hosts directly (CORS).
- tsconfig strict extras (noUncheckedIndexedAccess, exactOptionalPropertyTypes, etc.) are off. Why: imported code was written without them.
- Learned Code weights: sports-weight-profile.json `leagues` holds a per-sport best-replay fit, with `global` as fallback. Why: each sport scores best with its own weights.
- Story Reading (src/lib/sports-story-reading.ts) is a pure function fed by computeFullDecode reads; it is shown on game cards with its own hit tally and never feeds Learned Code votes. Why: the user's reading method sits beside the tuned picks without changing them.
- Knowledge Library content is src/lib/knowledge-library.json (articles + guides parsed from the user's upload); /library/$id serves both by id, and RELATED in src/lib/knowledge-library.ts picks each page's links. Why: one data file keeps every page's links in sync.
- Planet transits come from astronomy-engine in src/lib/transits.ts (sidereal = tropical − Lahiri ayanamsa) and are display-only in Game Energies and the Western/Vedic "sky right now" cards. Why: adds the requested transits without moving scored picks.
