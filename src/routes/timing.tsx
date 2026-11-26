import { createFileRoute } from "@tanstack/react-router";
import TimingPage from "@/life/timing";

export const Route = createFileRoute("/timing")({
  head: () => ({
    meta: [
      { title: "Date Types — The Sauce" },
      { name: "description", content: "Today's date types and your monthly soulmate, beneficial, wealth and other marked dates." },
      { property: "og:title", content: "Date Types — The Sauce" },
      { property: "og:description", content: "Today's date types and your monthly soulmate, beneficial, wealth and other marked dates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <TimingPage />,
});
