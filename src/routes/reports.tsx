import { createFileRoute } from "@tanstack/react-router";
import ReportsPage from "@/life/reports";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Calendar — Life Code" },
      { name: "description", content: "Daily, monthly and yearly calendar compatibility for your Life Path." },
      { property: "og:title", content: "Calendar — Life Code" },
      { property: "og:description", content: "Daily, monthly and yearly calendar compatibility for your Life Path." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ReportsPage />,
});
