import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_SOURCE_HOSTS = new Set([
  "new1.moviesdrive.cyou",
  "new2.moviesdrive.beer",
  "new1.moviesdrive.christmas",
  "new2.moviesdrive.christmas",
  "new3.moviesdrive.christmas",
  "moviesdrive.christmas",
  "new6.moviesdrives.my",
  "new3.moviesdrives.my",
  "mdrive.lol",
]);

function isAllowedSourceUrl(url: URL): boolean {
  return (
    (url.protocol === "https:" || url.protocol === "http:") &&
    !url.username &&
    !url.password &&
    (!url.port || url.port === "80" || url.port === "443") &&
    ALLOWED_SOURCE_HOSTS.has(url.hostname.toLowerCase())
  );
}

export const Route = createFileRoute("/api/public/proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url).searchParams.get("url");
        if (!url || url.length > 2048) return new Response("Missing or invalid url", { status: 400 });
        try {
          let target = new URL(url);
          if (!isAllowedSourceUrl(target)) {
            return new Response("Unsupported source host", { status: 403 });
          }
          for (let redirect = 0; redirect <= 4; redirect += 1) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 20000);
            let res: Response;
            try {
              res = await fetch(target.toString(), {
                redirect: "manual",
                signal: controller.signal,
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/147.0.0.0 Mobile Safari/537.36",
                  Accept: "text/html,application/xhtml+xml,application/json,*/*",
                  "Accept-Language": "en-US,en;q=0.9",
                },
              });
            } finally {
              clearTimeout(timeout);
            }

            if (res.status >= 300 && res.status < 400) {
              const location = res.headers.get("location");
              if (!location || redirect === 4) {
                return new Response("Unsupported or excessive source redirects", { status: 502 });
              }
              target = new URL(location, target);
              if (!isAllowedSourceUrl(target)) {
                return new Response("Redirected to an unsupported source host", { status: 403 });
              }
              continue;
            }

            const body = await res.arrayBuffer();
            const contentType = res.headers.get("content-type") || "text/html; charset=utf-8";
            return new Response(body, {
              status: res.status,
              headers: {
                "content-type": contentType,
                "access-control-allow-origin": "*",
                "cache-control": "public, max-age=120",
                "x-content-type-options": "nosniff",
              },
            });
          }
          return new Response("Source redirect limit reached", { status: 502 });
        } catch (err) {
          return new Response(
            `Proxy fetch failed: ${(err as Error).message}`,
            { status: 502 },
          );
        }
      },
    },
  },
});
