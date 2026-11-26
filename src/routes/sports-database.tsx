import { createFileRoute } from "@tanstack/react-router";
import SportsCatalogPage from "@/imported-pages/sports-catalog";

export const Route = createFileRoute("/sports-database")({
  head: () => ({
    meta: [
      { title: "Sports Database — The Sauce" },
      { name: "description", content: "Teams, people, cities and stadiums used in game analysis." },
      { property: "og:title", content: "Sports Database — The Sauce" },
      { property: "og:description", content: "Teams, people, cities and stadiums used in game analysis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SportsCatalogPage title="Sports Database" />,
});
