import { createFileRoute } from "@tanstack/react-router";
import { renderStaticPage } from "@/lib/static-pages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mobixgen — Full-Service Digital Agency in Nairobi" },
      { name: "description", content: "Web, mobile, AI, SEO, branding and security solutions." },
      { property: "og:title", content: "Mobixgen — Full-Service Digital Agency" },
      { property: "og:description", content: "Crafting digital ecosystems that dominate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  server: {
    handlers: { GET: ({ request }) => renderStaticPage(new URL(request.url).pathname) },
  },
});
