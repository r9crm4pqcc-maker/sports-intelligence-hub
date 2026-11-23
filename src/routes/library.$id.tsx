import { createFileRoute, notFound } from "@tanstack/react-router";
import { LibraryEntryPage } from "@/life/library";
import { getLibraryEntry } from "@/lib/knowledge-library";

export const Route = createFileRoute("/library/$id")({
  loader: ({ params }) => {
    const entry = getLibraryEntry(params.id);
    if (!entry) throw notFound();
    const description = entry.kind === "article" ? entry.item.subtitle || entry.item.question : `Life Code guide: ${entry.item.title}.`;
    return { title: entry.item.title, description };
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.title ?? "Library"} — Life Code Library`;
    const description = loaderData?.description ?? "Life Code Knowledge Library.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: LibraryEntryRoute,
});

function LibraryEntryRoute() {
  const { id } = Route.useParams();
  return <LibraryEntryPage id={id} />;
}
