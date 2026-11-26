import { createFileRoute } from "@tanstack/react-router";
import Page from "@/life/cycles";
export const Route = createFileRoute("/cycles")({
  head: () => ({ meta: [{ title: "Personal Cycles — The Sauce" }, { name: "description", content: "Your birthday-based personal year, month, and day cycles." }, { property: "og:title", content: "Personal Cycles — The Sauce" }, { property: "og:description", content: "Your birthday-based personal year, month, and day cycles." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});
