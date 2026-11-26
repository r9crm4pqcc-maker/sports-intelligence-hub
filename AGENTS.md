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
- Story Reading (src/lib/sports-story-reading.ts) is a pure function fed by computeFullDecode reads; src/lib/sports-story-blend.ts adds its lean to the Learned Code margin with a per-sport strength (0 = off) fitted on saved games; it is never rendered in Sports AI. Why: the reading method changes picks only where saved games show it helps.
- Uploaded knowledge documents are applied as app logic, not stored as article pages. Why: the user wants the knowledge active, not a reading library.
- Planet transits come from astronomy-engine in src/lib/transits.ts (sidereal = tropical − Lahiri ayanamsa) and are display-only in Game Energies and the Western/Vedic "sky right now" cards. Why: adds the requested transits without moving scored picks.
- src/lib/nfl-season-2026.json holds exact app-captured NFL inputs with the user's own picks as labels; NFL weights are fitted against it. Why: the user's picks are the ground truth for NFL reading.

## Category and research architecture
- Keep Chart category panels in the imported chart page and date-cycle content in its own route; legacy chart URLs remain available so saved links do not break.
- Sports dates remain ISO internally; use the shared US date conversion and input components at presentation boundaries so date parsing and scoring stay timezone-independent.
- Missing sports facts are researched through an authenticated server function, cached per user in Cloud with RLS, and applied only after explicit user verification to empty fields before manual overrides so human corrections always win.
- Research jobs run serially in the browser while the match board remains interactive; each fact requires a searched source URL and verbatim evidence, and unknown historical starters are never guessed.
- Soccer gear activation is stored per signed-in user in Cloud; use Suspense Query reads and RLS-scoped browser mutations to prevent access to another user's entries.
- Gemstone timing uses a pure rules module and live Lahiri transits with the documented natal rising; never infer test success or clearance from a date alone. Why: source-defined restrictions and user-recorded test progress remain explicit.
- Date-type presentation derives from readDay tones through a shared formatter, without goal scoring. Why: the timing calendar and today's labels must use the same existing classification rules.
