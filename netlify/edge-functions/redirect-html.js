// 301 any *.html URL to its clean-URL equivalent so Google doesn't index duplicates.
// Netlify's built-in pretty-URL serving still maps the clean path back to the .html
// file, so this only affects the external URL the browser / crawler sees.
export default async (request) => {
  const url = new URL(request.url);
  const { pathname } = url;

  let cleanPath = null;
  if (pathname.endsWith("/index.html")) {
    cleanPath = pathname.slice(0, -"index.html".length);
  } else if (pathname.endsWith(".html")) {
    cleanPath = pathname.slice(0, -".html".length);
  }

  if (!cleanPath) return;

  url.pathname = cleanPath;
  return Response.redirect(url.toString(), 301);
};

export const config = {
  pattern: "^/.*\\.html$",
};
