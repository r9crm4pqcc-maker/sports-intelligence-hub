import { createFileRoute } from "@tanstack/react-router";
import TimingPage from "@/life/timing";

export const Route = createFileRoute("/timing")({
  head: () => ({
    meta: [
      { title: "Goal Timing — The Sauce" },
      { name: "description", content: "Find the best days and hours for your goals." },
      { property: "og:title", content: "Goal Timing — The Sauce" },
      { property: "og:description", content: "Find the best days and hours for your goals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <TimingPage />,
});
