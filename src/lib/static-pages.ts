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
  const valid = /^[a-z0-9\-/]*$/.test(path) && loaders[key];
  const html = valid
    ? await loaders[key]()
    : await loaders["/src/content/errors/404.html"]();
  return new Response(html, {
    status: valid ? 200 : 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
