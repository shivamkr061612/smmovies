import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url).searchParams.get("url");
        if (!url) return new Response("Missing url", { status: 400 });
        try {
          const target = new URL(url);
          if (!/^https?:$/.test(target.protocol)) {
            return new Response("Bad protocol", { status: 400 });
          }
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);
          const res = await fetch(target.toString(), {
            signal: controller.signal,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/json,*/*",
              "Accept-Language": "en-US,en;q=0.9",
            },
          });
          clearTimeout(timeout);
          const body = await res.arrayBuffer();
          const contentType =
            res.headers.get("content-type") || "text/html; charset=utf-8";
          return new Response(body, {
            status: res.status,
            headers: {
              "content-type": contentType,
              "access-control-allow-origin": "*",
              "cache-control": "public, max-age=120",
            },
          });
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
