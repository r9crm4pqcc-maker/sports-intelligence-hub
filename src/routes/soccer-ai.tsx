import { createFileRoute } from "@tanstack/react-router";
import SoccerAIPage from "@/imported-pages/soccer-ai";

export const Route = createFileRoute("/soccer-ai")({
  head: () => ({
    meta: [
      { title: "Soccer AI — The Sauce" },
      { name: "description", content: "Your soccer match-day protocol, jersey compatibility, gear activation and competition timing in The Sauce." },
      { property: "og:title", content: "Soccer AI — The Sauce" },
      { property: "og:description", content: "Your soccer match-day protocol, jersey compatibility, gear activation and competition timing in The Sauce." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SoccerAIPage />,
});
