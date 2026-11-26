import { createFileRoute } from "@tanstack/react-router";
import TradingAIPage from "@/imported-pages/trading-ai";

export const Route = createFileRoute("/trading-ai")({
  head: () => ({
    meta: [
      { title: "Stock Market AI — The Sauce" },
      { name: "description", content: "Numerology timing for stocks and markets." },
      { property: "og:title", content: "Stock Market AI — The Sauce" },
      { property: "og:description", content: "Numerology timing for stocks and markets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <TradingAIPage />,
});
