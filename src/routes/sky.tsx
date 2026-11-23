import { createFileRoute } from "@tanstack/react-router";
import SkyPage from "@/life/sky";

export const Route = createFileRoute("/sky")({
  head: () => ({
    meta: [
      { title: "Western Chart — Life Code" },
      { name: "description", content: "Your Western astrology chart." },
      { property: "og:title", content: "Western Chart — Life Code" },
      { property: "og:description", content: "Your Western astrology chart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SkyPage />,
});
