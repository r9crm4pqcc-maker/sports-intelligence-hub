import { createFileRoute } from "@tanstack/react-router";
import LetterologyPage from "@/life/letterology";

export const Route = createFileRoute("/letterology")({
  head: () => ({
    meta: [
      { title: "Letterology — Life Code" },
      { name: "description", content: "Decode names and words letter by letter." },
      { property: "og:title", content: "Letterology — Life Code" },
      { property: "og:description", content: "Decode names and words letter by letter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LetterologyPage />,
});
