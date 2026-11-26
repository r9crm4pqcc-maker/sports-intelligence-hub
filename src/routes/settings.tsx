import { createFileRoute } from "@tanstack/react-router";
import Page from "@/life/settings";
export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — The Sauce" }, { name: "description", content: "Edit your birth data and manage your sports research account." }, { property: "og:title", content: "Settings — The Sauce" }, { property: "og:description", content: "Edit your birth data and manage your sports research account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});
