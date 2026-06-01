// Central site configuration — edit values here to update the whole app.
// This file supports runtime overrides via `window.__SITE_CONFIG` so you can
// set values in `index.html` or a small JSON file without rebuilding.

declare global {
  interface Window {
    APP_CONFIG?: any;
    getConfig?: (key: string) => any;
  }
}

const readConfig = (key: string, altKey?: string) => {
  if (typeof window === "undefined") return undefined;
  try {
    if (typeof window.getConfig === "function") {
      const v = window.getConfig(key);
      if (v !== undefined && v !== '') return v;
    }
    const app = (window.APP_CONFIG || {});
    if (key in app) return app[key];
    if (altKey && altKey in app) return app[altKey];
    return undefined;
  } catch {
    return undefined;
  }
};

// Base URL of the source site used by the scraper (no trailing slash)
export const SITE_BASE_URL =
  readConfig("scraperUrl") || readConfig("SITE_BASE_URL") || "https://new3.moviesdrives.my";

// Site-level SEO values
export const SITE_NAME = readConfig("siteName") || readConfig("SITE_NAME") || "SM Movies";
export const SITE_TITLE = readConfig("siteTitle") || readConfig("SITE_TITLE") || "SM Movies — Download Latest Movies & Web Series in HD, 4K";
export const SITE_DESCRIPTION = readConfig("siteDescription") || readConfig("SITE_DESCRIPTION") || "Download latest Bollywood, Hollywood, South Indian movies and web series in 480p, 720p, 1080p and 4K quality.";
export const SITE_LOGO = readConfig("logoUrl") || readConfig("SITE_LOGO") || "";

// Logos to render above a post. Provide absolute URLs or relative paths served from `public`.
export const POST_LOGOS_TOP: string[] = readConfig("POST_LOGOS_TOP") || (readConfig("logoUrl") ? [readConfig("logoUrl")] : []);

// Logos to render below a post
export const POST_LOGOS_BOTTOM: string[] = readConfig("POST_LOGOS_BOTTOM") || [];

// Footer ad HTML — paste raw HTML here (will be inserted with `dangerouslySetInnerHTML`).
export const FOOTER_AD_HTML = readConfig("FOOTER_AD_HTML") || readConfig("adInline") || "";

// Export a simple list file (editable) for site maintainers — categories, mirrors, etc.
export const MAINTAINER_LIST: Record<string, string> = readConfig("MAINTAINER_LIST") || {};

// Notice HTML to display site-wide notices (insert raw HTML via index.html runtime config)
export const NOTICE_HTML: string = readConfig("NOTICE_HTML") || readConfig("noticeHtml") || "";

export default {
  SITE_BASE_URL,
  POST_LOGOS_TOP,
  POST_LOGOS_BOTTOM,
  FOOTER_AD_HTML,
  NOTICE_HTML,
  MAINTAINER_LIST,
};
