// Serves the original Mobixgen site pages exactly as they were exported.
const loaders = import.meta.glob("/src/content/**/*.html", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const REDIRECTS: Record<string, string> = { "terms-of-service": "/terms/" };

export async function renderStaticPage(pathname: string): Promise<Response> {
  const path = pathname.replace(/^\/+|\/+$/g, "");
  if (REDIRECTS[path]) {
    return new Response(null, { status: 301, headers: { Location: REDIRECTS[path] } });
  }
  const key = `/src/content/pages/${path === "" ? "home" : path}.html`;
  const page = /^[a-z0-9\-/]*$/.test(path) ? loaders[key] : undefined;
  const valid = Boolean(page);
  const notFound = loaders["/src/content/errors/404.html"];
  const html = page ? await page() : notFound ? await notFound() : "Not found";
  return new Response(html, {
    status: valid ? 200 : 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
