import { createFileRoute } from "@tanstack/react-router";
import ChartPage from "@/life/chart";

export const Route = createFileRoute("/chart")({
  head: () => ({
    meta: [
      { title: "Your Chart — Life Code" },
      { name: "description", content: "Edit your birth data and read your full numerology chart." },
      { property: "og:title", content: "Your Chart — Life Code" },
      { property: "og:description", content: "Edit your birth data and read your full numerology chart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ChartPage />,
});
