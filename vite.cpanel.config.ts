// Dedicated static-shell config for Apache/LiteSpeed shared hosting.
// The normal vite.config.ts remains the source for Lovable/Cloudflare builds.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    spa: {
      enabled: true,
      maskPath: "/",
      prerender: { outputPath: "/_shell", crawlLinks: false },
    },
  },
});