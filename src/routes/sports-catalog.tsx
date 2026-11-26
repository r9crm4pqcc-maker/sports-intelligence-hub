import { createFileRoute } from "@tanstack/react-router";
import SportsCatalogPage from "@/imported-pages/sports-catalog";

export const Route = createFileRoute("/sports-catalog")({
  head: () => ({
    meta: [
      { title: "Sports Catalog — The Sauce" },
      { name: "description", content: "Reference catalog of founding dates and sports entities." },
      { property: "og:title", content: "Sports Catalog — The Sauce" },
      { property: "og:description", content: "Reference catalog of founding dates and sports entities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SportsCatalogPage />,
});
