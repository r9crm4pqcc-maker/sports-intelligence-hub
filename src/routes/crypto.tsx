import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/crypto")({
  head: () => ({
    meta: [
      { title: "Crypto Research — The Sauce" },
      { name: "description", content: "Numerology research for crypto coins." },
      { property: "og:title", content: "Crypto Research — The Sauce" },
      { property: "og:description", content: "Numerology research for crypto coins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => { throw redirect({ to: "/trading-ai" }); },
});
