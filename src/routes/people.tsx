import { createFileRoute } from "@tanstack/react-router";
import PeoplePage from "@/life/people";

export const Route = createFileRoute("/people")({
  head: () => ({
    meta: [
      { title: "People & Lookup — Life Code" },
      { name: "description", content: "Compare compatibility with family, friends and anyone by birth date." },
      { property: "og:title", content: "People & Lookup — Life Code" },
      { property: "og:description", content: "Compare compatibility with family, friends and anyone by birth date." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PeoplePage />,
});
