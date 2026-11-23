import { createFileRoute } from "@tanstack/react-router";
import CryptoPage from "@/life/crypto";

export const Route = createFileRoute("/crypto")({
  head: () => ({
    meta: [
      { title: "Crypto Research — Life Code" },
      { name: "description", content: "Numerology research for crypto coins." },
      { property: "og:title", content: "Crypto Research — Life Code" },
      { property: "og:description", content: "Numerology research for crypto coins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <CryptoPage />,
});
