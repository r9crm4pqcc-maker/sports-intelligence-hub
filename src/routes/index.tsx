import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/life/home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Sauce — Decode Suite" },
      { name: "description", content: "Your daily numerology, date library, calendar, and sports prediction tools in one place." },
      { property: "og:title", content: "The Sauce — Decode Suite" },
      { property: "og:description", content: "Your daily numerology, date library, calendar, and sports prediction tools in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <HomePage />,
});
