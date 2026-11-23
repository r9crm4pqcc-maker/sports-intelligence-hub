import { createFileRoute } from "@tanstack/react-router";
import SportsPredictionPage from "@/imported-pages/sports-prediction";

export const Route = createFileRoute("/sports-prediction")({
  head: () => ({
    meta: [
      { title: "Sports Prediction AI — Life Code" },
      { name: "description", content: "Learned Code picks for NFL, NBA, NHL, college and more, with daily accuracy." },
      { property: "og:title", content: "Sports Prediction AI — Life Code" },
      { property: "og:description", content: "Learned Code picks for NFL, NBA, NHL, college and more, with daily accuracy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SportsPredictionPage />,
});
