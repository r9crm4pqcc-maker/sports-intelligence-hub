import { createFileRoute } from "@tanstack/react-router";
import { LibraryIndexPage } from "@/life/library";

export const Route = createFileRoute("/library/")({
  head: () => ({
    meta: [
      { title: "Knowledge Library — Life Code" },
      { name: "description", content: "Articles and guides on tropical vs sidereal astrology, the Chinese zodiac, numerology, lucky numbers and more." },
      { property: "og:title", content: "Knowledge Library — Life Code" },
      { property: "og:description", content: "Articles and guides on tropical vs sidereal astrology, the Chinese zodiac, numerology, lucky numbers and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LibraryIndexPage />,
});
