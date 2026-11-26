import { createFileRoute } from "@tanstack/react-router";
import DatesPage from "@/life/dates";

export const Route = createFileRoute("/dates/$sub")({
  head: () => ({
    meta: [
      { title: "Date List — The Sauce" },
      { name: "description", content: "A focused list of dates for your Life Path." },
      { property: "og:title", content: "Date List — The Sauce" },
      { property: "og:description", content: "A focused list of dates for your Life Path." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <DatesPage />,
});
