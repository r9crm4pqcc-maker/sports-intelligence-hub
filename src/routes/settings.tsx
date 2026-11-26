import { createFileRoute } from "@tanstack/react-router";
import Page from "@/life/settings";
export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Life Code" }, { name: "description", content: "Birth data, notifications, green theme preferences and enemy year mode." }, { property: "og:title", content: "Settings — Life Code" }, { property: "og:description", content: "Birth data, notifications, green theme preferences and enemy year mode." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});
