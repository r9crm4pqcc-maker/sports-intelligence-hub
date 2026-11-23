import { Link } from "@tanstack/react-router";
import { Card, CardTitle } from "./kit";
import { RELATED, entryTitle } from "@/lib/knowledge-library";

export function RelatedReading({ page, title = "Learn more in the library" }: { page: keyof typeof RELATED; title?: string }) {
  const ids = RELATED[page] ?? [];
  if (!ids.length) return null;
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <div className="flex flex-wrap gap-2">
        {ids.map((id) => (
          <Link key={id} to="/library/$id" params={{ id }} className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-primary hover:text-primary">
            {entryTitle(id)}
          </Link>
        ))}
      </div>
    </Card>
  );
}
