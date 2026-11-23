import { createFileRoute } from "@tanstack/react-router";
import SoccerAIPage from "@/imported-pages/soccer-ai";

export const Route = createFileRoute("/soccer-ai")({
  head: () => ({
    meta: [
      { title: "Soccer AI — Life Code" },
      { name: "description", content: "Soccer match decoding and predictions." },
      { property: "og:title", content: "Soccer AI — Life Code" },
      { property: "og:description", content: "Soccer match decoding and predictions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SoccerAIPage />,
});
