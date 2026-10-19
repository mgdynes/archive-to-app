import { createFileRoute } from "@tanstack/react-router";
import { renderStaticPage } from "@/lib/static-pages";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Mobixgen" },
      { name: "description", content: "Mobixgen digital agency." },
      { property: "og:title", content: "Mobixgen" },
      { property: "og:description", content: "Mobixgen digital agency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  server: {
    handlers: { GET: ({ request }) => renderStaticPage(request) },
  },
});
