// Serves the original Mobixgen site pages exactly as they were exported,
// adding complete SEO/social tags for the domain the page is served from.
const loaders = import.meta.glob("/src/content/**/*.html", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const REDIRECTS: Record<string, string> = { "terms-of-service": "/terms/" };
const LOGO = "/media/b52ff1eb-3117-4af6-9c67-332e31911753/mobixgen-logo.png";
const DEFAULT_IMAGE = "/assets/hero-web-DkE1G1g1.jpg";

function originOf(request: Request) {
  const url = new URL(request.url);
  const fwd = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
  return fwd ? `https://${fwd}` : url.origin;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const unesc = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

export function enhanceHead(html: string, origin: string, path: string): string {
  const pagePath = path === "" ? "/" : `/${path}/`;
  const url = `${origin}${pagePath}`;
  const preloads = [...html.matchAll(/rel="preload" as="image" href="([^"]+)"/g)].map((m) => m[1]);
  const img = preloads.find((p) => p !== LOGO) ?? DEFAULT_IMAGE;
  const image = img.startsWith("http") ? img : `${origin}${img}`;
  const title = unesc(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "Mobixgen");
  const description = unesc(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const isArticle = path.startsWith("blogs/");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Mobixgen",
        url: `${origin}/`,
        logo: `${origin}${LOGO}`,
      },
      {
        "@type": isArticle ? "Article" : "WebPage",
        ...(isArticle ? { headline: title } : { name: title }),
        description,
        url,
        image,
        publisher: { "@type": "Organization", name: "Mobixgen" },
      },
    ],
  };

  const tags = [
    `<link rel="canonical" href="${esc(url)}"/>`,
    `<meta property="og:url" content="${esc(url)}"/>`,
    `<meta property="og:site_name" content="Mobixgen"/>`,
    `<meta property="og:locale" content="en_US"/>`,
    `<meta property="og:image" content="${esc(image)}"/>`,
    `<meta property="og:image:alt" content="${esc(title)}"/>`,
    `<meta name="twitter:title" content="${esc(title)}"/>`,
    `<meta name="twitter:description" content="${esc(description)}"/>`,
    `<meta name="twitter:image" content="${esc(image)}"/>`,
    `<meta name="theme-color" content="#050807"/>`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>`,
    `<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>`,
    `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>`,
    `<link rel="manifest" href="/site.webmanifest"/>`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`,
  ].join("");

  return html
    .replace(/<link rel="canonical"[^>]*\/?>/g, "")
    .replace(/<meta property="og:(url|image|site_name|locale)"[^>]*\/?>/g, "")
    .replace(/<meta name="twitter:(image|title|description)"[^>]*\/?>/g, "")
    .replace("</head>", `${tags}</head>`);
}

export async function renderStaticPage(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  const path = pathname.replace(/^\/+|\/+$/g, "");
  if (REDIRECTS[path]) {
    return new Response(null, { status: 301, headers: { Location: REDIRECTS[path] } });
  }
  const key = `/src/content/pages/${path === "" ? "home" : path}.html`;
  const page = /^[a-z0-9\-/]*$/.test(path) ? loaders[key] : undefined;
  if (!page) {
    const notFound = loaders["/src/content/errors/404.html"];
    return new Response(notFound ? await notFound() : "Not found", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  const html = enhanceHead(await page(), originOf(request), path);
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
