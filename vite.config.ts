// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig(({ mode }) => ({
  nitro: true, // Force Nitro to run outside Lovable sandbox (needed for GitHub Actions)
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(mode === "cpanel"
      ? {
          // Build a static client shell for Apache/LiteSpeed shared hosting.
          spa: {
            enabled: true,
            maskPath: "/",
            prerender: { outputPath: "/_shell", crawlLinks: false },
          },
        }
      : {}),
  },
}));
