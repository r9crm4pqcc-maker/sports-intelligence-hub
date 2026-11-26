import { createFileRoute } from "@tanstack/react-router";
import VedicPage from "@/life/vedic";

export const Route = createFileRoute("/vedic")({
  head: () => ({
    meta: [
      { title: "Vedic Chart — The Sauce" },
      { name: "description", content: "Your Vedic astrology chart." },
      { property: "og:title", content: "Vedic Chart — The Sauce" },
      { property: "og:description", content: "Your Vedic astrology chart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <VedicPage />,
});
