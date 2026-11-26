import { createFileRoute } from "@tanstack/react-router";
import DayPage from "@/life/day";

export const Route = createFileRoute("/day/$sub")({
  head: () => ({
    meta: [
      { title: "Day Reading — The Sauce" },
      { name: "description", content: "Full reading for a single calendar day." },
      { property: "og:title", content: "Day Reading — The Sauce" },
      { property: "og:description", content: "Full reading for a single calendar day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <DayPage />,
});
