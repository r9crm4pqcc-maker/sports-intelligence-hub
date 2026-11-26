import { createFileRoute } from "@tanstack/react-router";
import AdvancedPage from "@/life/advanced";

export const Route = createFileRoute("/advanced")({
  head: () => ({
    meta: [
      { title: "Friendly — The Sauce" },
      { name: "description", content: "Advanced friendly-number analysis." },
      { property: "og:title", content: "Friendly — The Sauce" },
      { property: "og:description", content: "Advanced friendly-number analysis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AdvancedPage />,
});
