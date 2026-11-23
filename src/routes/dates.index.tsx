import { createFileRoute } from "@tanstack/react-router";
import DatesPage from "@/life/dates";

export const Route = createFileRoute("/dates/")({
  head: () => ({
    meta: [
      { title: "Date Library — Life Code" },
      { name: "description", content: "Friendly, enemy, and special date lists for your Life Path." },
      { property: "og:title", content: "Date Library — Life Code" },
      { property: "og:description", content: "Friendly, enemy, and special date lists for your Life Path." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <DatesPage />,
});
