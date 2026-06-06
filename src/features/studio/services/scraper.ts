import type { Movie, ScrapeResult, Category, PostContent } from "../types";
import { SITE_BASE_URL as BASE_URL, TELEGRAM_URL } from "../config/site";

const PROXIES = [
  (url: string) => `https://mag.dhanjeerider.workers.dev/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

async function fetchWithProxy(url: string, proxyIndex = 0): Promise<string> {
  if (proxyIndex >= PROXIES.length) {
    throw new Error("All retrieval protocols failed. Please try again shortly.");
  }

  try {
    const proxyUrl = PROXIES[proxyIndex](url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: { Accept: "text/html,application/xhtml+xml,*/*" },
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    if (!text || text.length < 100) throw new Error("Empty response");
    if (text.includes("502 Bad Gateway") || text.includes("origin is not allowed")) {
      throw new Error("Proxy returned error");
    }
    return text;
  } catch (err) {
    console.warn(`Source ${proxyIndex + 1} failed:`, err);
    return fetchWithProxy(url, proxyIndex + 1);
  }
}

function normalizeMediaUrl(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return "";
  const absolute = trimmed.startsWith("//")
    ? `https:${trimmed}`
    : trimmed.startsWith("/")
    ? `${BASE_URL.replace(/\/$/, "")}${trimmed}`
    : trimmed;

  try {
    const url = new URL(absolute);
    // catimages.org is not resolving reliably on phones/hosting. catimages.co
    // serves the same image paths, so swap mirrors before rendering.
    if (/^(www\.)?catimages\.(org|to|net|cc|in)$/i.test(url.hostname)) {
      url.hostname = "catimages.co";
      return url.toString();
    }
    return url.toString();
  } catch {
    return absolute;
  }
}

function imageFromElement(img: HTMLImageElement): string {
  const attrs = [
    "data-src",
    "data-lazy-src",
    "data-original",
    "data-orig-file",
    "data-medium-file",
    "data-large-file",
    "src",
  ];
  for (const attr of attrs) {
    const value = normalizeMediaUrl(img.getAttribute(attr) || "");
    if (value) return value;
  }

  const srcset = img.getAttribute("data-srcset") || img.getAttribute("srcset") || "";
  const first = srcset.split(",")[0]?.trim().split(/\s+/)[0] || "";
  return normalizeMediaUrl(first);
}

// Convert a moviesdrives URL into our internal slug
export function urlToSlug(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/|\/$/g, "");
  } catch {
    return url.replace(/^https?:\/\/[^/]+\//, "").replace(/^\/|\/$/g, "");
  }
}

export function slugToUrl(slug: string): string {
  return `${BASE_URL}/${slug}/`;
}

// Return a shareable path for a post slug (no domain)
export function slugToPath(slug: string): string {
  if (!slug) return "/";
  return slug.startsWith("/") ? slug.replace(/\/$/, "") : `/${slug.replace(/\/$/, "")}`;
}

// Category path: /category/<slug>/ or /category/<slug>/page/<n>/
export function categoryToPath(category: string, page = 1): string {
  if (!category) return page > 1 ? `/page/${page}/` : `/`;
  return page > 1 ? `/category/${category}/page/${page}/` : `/category/${category}/`;
}

// Search path: /search.html?q=...
export function searchToPath(query: string): string {
  return `/search.html?q=${encodeURIComponent(query)}`;
}

function parseListingHTML(html: string): {
  movies: Movie[];
  categories: Category[];
} {
  const movies: Movie[] = [];
  const categories: Category[] = [];
  const seenMovies = new Set<string>();
  const seenCats = new Set<string>();

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // --- Categories from sidebar ---
    const catLinks = doc.querySelectorAll(
      "ul.category-list a, .categories-list a, .widget_categories a, .sidebar-categories a, .sidebar-widget a"
    );
    catLinks.forEach((a) => {
      const name = a.textContent?.trim().replace(/\s*\(\d+\)\s*$/, "") || "";
      const href = a.getAttribute("href") || "";
      if (name && href.includes("/category/")) {
        const match = href.match(/\/category\/([^/]+)/);
        const slug = match ? match[1] : "";
        if (slug && !seenCats.has(slug) && name.length < 40) {
          seenCats.add(slug);
          categories.push({ name, slug });
        }
      }
    });

    // --- Movie cards: .poster-card (preferred) ---
    const posterCards = doc.querySelectorAll(".movies-grid a, .movie-grid a, a:has(.poster-card)");

    if (posterCards.length > 0) {
      posterCards.forEach((anchor) => {
        const card = anchor.querySelector(".poster-card") || anchor;
        const titleEl = card.querySelector(".poster-title, p.poster-title");
        const imgEl = card.querySelector("img");
        const qualityEl = card.querySelector(".poster-quality, span.poster-quality");

        const title = titleEl?.textContent?.trim() || imgEl?.getAttribute("alt")?.trim() || "";
        const imageUrl = imgEl ? imageFromElement(imgEl as HTMLImageElement) : "";
        const href = anchor.getAttribute("href") || "";
        const quality = qualityEl?.textContent?.trim() || "";

        if (!title && !imageUrl) return;
        const id = href || imageUrl || title;
        if (seenMovies.has(id)) return;
        seenMovies.add(id);

        movies.push({
          id,
          title,
          description: "",
          imageUrl,
          downloadUrl: href,
          quality,
          slug: href ? urlToSlug(href) : undefined,
        });
      });
    }

    // --- Fallback: image/heading pairs ---
    if (movies.length === 0) {
      const images = doc.querySelectorAll("img");
      images.forEach((img) => {
        const src = imageFromElement(img as HTMLImageElement);
        const alt = img.getAttribute("alt") || "";
        if (!src || src.includes("logo") || src.includes("icon")) return;

        const container = img.closest("div, article") as Element | null;
        if (!container) return;

        const heading = container.querySelector("h1, h2, h3, h4, h5");
        const headingText = heading?.textContent?.trim() || alt;
        if (!headingText) return;

        const link = container.querySelector("a");
        const href = link?.getAttribute("href") || "";

        const descEl = container.querySelector("p");
        const desc = descEl?.textContent?.trim() || "";

        const id = href || src;
        if (seenMovies.has(id)) return;
        seenMovies.add(id);

        movies.push({
          id,
          title: headingText,
          description: desc,
          imageUrl: src,
          downloadUrl: href,
          slug: href ? urlToSlug(href) : undefined,
        });
      });
    }
  } catch (err) {
    console.error("Parse error:", err);
  }

  return { movies, categories };
}

function extractPagination(html: string, currentPage: number) {
  const pageMatches = html.match(/\/page\/(\d+)\//g);
  const pages = pageMatches ? pageMatches.map((p) => parseInt(p.match(/\d+/)![0], 10)) : [];
  const maxPage = pages.length ? Math.max(...pages) : 1;

  const hasNext =
    html.includes(`/page/${currentPage + 1}/`) ||
    html.includes("next-btn") ||
    html.includes('rel="next"');
  const hasPrev =
    currentPage > 1 &&
    (html.includes(`/page/${currentPage - 1}/`) ||
      html.includes("prev-btn") ||
      html.includes('rel="prev"'));

  return {
    hasNext,
    hasPrev,
    totalPages: Math.max(currentPage + (hasNext ? 1 : 0), maxPage),
  };
}

export async function fetchListing(
  page: number = 1,
  category?: string,
  searchQuery?: string
): Promise<ScrapeResult> {
  // Try JSON search endpoint first when searching — many sites expose an API.
  if (searchQuery) {
    const apiUrl = `${BASE_URL.replace(/\/$/, "")}/search.php?q=${encodeURIComponent(
      searchQuery
    )}&page=${page}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          // mirror provided curl headers to improve compatibility
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
          Referer: `${BASE_URL.replace(/\/$/, "")}/search.html?q=${encodeURIComponent(searchQuery)}&page=${page}`,
        },
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const body = await res.json();
        // body may be array or {data: []} or {results: []}
        const items: any[] = Array.isArray(body)
          ? body
          : body?.data || body?.results || body?.items || (Array.isArray(body?.hits) ? body.hits.map((h: any) => h.document || h) : []) || [];

        const movies: Movie[] = items
          .map((it) => {
            if (!it) return null;
            const title = it.post_title || it.title || it.name || it.t || "";
            const imageUrl = normalizeMediaUrl(
              it.post_thumbnail || it.post_thumbnail_url || it.post_thumb || it.thumb || it.poster || it.image || it.img || it.imageUrl || ""
            );
            let downloadUrl = it.permalink || it.link || it.url || it.download || "";
            // If permalink is relative (starts with /), prefix with BASE_URL
            if (downloadUrl && downloadUrl.startsWith("/")) {
              downloadUrl = `${BASE_URL.replace(/\/$/, "")}${downloadUrl}`;
            }
            const id = it.id || downloadUrl || imageUrl || title;
            const slug = (it.permalink && String(it.permalink).replace(/^\//, "").replace(/\/$/, "")) || (downloadUrl ? urlToSlug(downloadUrl) : it.slug || it.post_name || undefined);
            return {
              id,
              title,
              description: it.description || it.excerpt || "",
              imageUrl,
              downloadUrl,
              quality: it.quality || it.q || "",
              slug,
            } as Movie;
          })
          .filter(Boolean) as Movie[];

        // crude pagination detection
        const hasNext = items.length > 0 && items.length >= 10; // assume page size 10

        return {
          movies,
          categories: DEFAULT_CATEGORIES,
          currentPage: page,
          totalPages: page + (hasNext ? 1 : 0),
          hasNext,
          hasPrev: page > 1,
        };
      }
    } catch (err) {
      // fall back to HTML parsing below
      console.warn("JSON search failed, falling back to HTML parsing:", err);
    }
  }

  let url: string;
  if (category) {
    url = page > 1 ? `${BASE_URL}/category/${category}/page/${page}/` : `${BASE_URL}/category/${category}/`;
  } else {
    url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
  }

  const html = await fetchWithProxy(url);
  const { movies, categories } = parseListingHTML(html);
  const pagination = extractPagination(html, page);

  return {
    movies,
    categories: categories.length > 0 ? categories : DEFAULT_CATEGORIES,
    currentPage: page,
    totalPages: pagination.totalPages,
    hasNext: pagination.hasNext,
    hasPrev: pagination.hasPrev,
  };
}

// Re-export with previous name for compatibility
export const scrapeMovies = fetchListing;

export async function fetchPostContent(slug: string): Promise<PostContent> {
  const url = slugToUrl(slug);
  const html = await fetchWithProxy(url);

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Title - try post-title first, then h1
  const titleEl = doc.querySelector(".post-title, h1.post-title, article h1, h1");
  const title = titleEl?.textContent?.trim() || "Untitled";

  // Date
  const dateEl = doc.querySelector(".post-date, time, .entry-date");
  const date = dateEl?.textContent?.trim() || "";

  // Categories
  const categories: { name: string; slug: string }[] = [];
  const catEls = doc.querySelectorAll(".post-categories a, .category-tag, a[rel='category tag']");
  catEls.forEach((el) => {
    const name = el.textContent?.trim() || "";
    const href = el.getAttribute("href") || "";
    const match = href.match(/\/category\/([^/]+)/);
    if (name && match) {
      categories.push({ name, slug: match[1] });
    }
  });

  // Body content - prefer .page-body, fallback to .post-content / article
  const body =
    doc.querySelector(".page-body") ||
    doc.querySelector(".post-content") ||
    doc.querySelector("article .entry-content") ||
    doc.querySelector("article");

  // Clean body - remove scripts and ads
  let bodyHtml = "";
  let imageUrl = "";
  const screenshots: string[] = [];
  const downloadLinks: { label: string; url: string }[] = [];

  if (body) {
    // Clone so we don't modify the original
    const clone = body.cloneNode(true) as Element;
    clone.querySelectorAll("script, style, ins, .ads, .ad, [class*='advert']").forEach((el) => el.remove());

    // Keep trailers visible and normalize links before rendering.
    clone.querySelectorAll("iframe").forEach((frame) => {
      const src = frame.getAttribute("src") || "";
      if (!/youtube|youtu\.be/i.test(src)) return;
      frame.setAttribute("loading", "lazy");
      frame.setAttribute("allowfullscreen", "true");
      frame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    });

    clone.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (/t\.me|telegram/i.test(href)) {
        a.setAttribute("href", TELEGRAM_URL);
      } else if (href.startsWith("/")) {
        a.setAttribute("href", `${BASE_URL.replace(/\/$/, "")}${href}`);
      }
    });

    // Extract images
    const imgs = clone.querySelectorAll("img");
    imgs.forEach((img, i) => {
      const src = imageFromElement(img as HTMLImageElement);
      if (!src) return;
      if (i === 0) imageUrl = src;
      else screenshots.push(src);
      // Normalize lazy images
      img.setAttribute("src", src);
      img.removeAttribute("srcset");
      img.removeAttribute("data-srcset");
      img.removeAttribute("data-lazy-src");
    });

    // Extract download links - look for anchors with relevant text or URLs
    const links = clone.querySelectorAll("a");
    links.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const text = a.textContent?.trim() || "";
      if (!href || href === "#" || href.startsWith("javascript:")) return;
      // Filter to likely download links
      if (
        /480p|720p|1080p|2160p|4K|HEVC|x264|x265|G-Drive|Download|HDTC|WEB-DL|BluRay/i.test(text + href) &&
        text.length < 200
      ) {
        downloadLinks.push({ label: text || "Download", url: href });
      }
    });

    bodyHtml = clone.innerHTML;
    // Rebrand: replace any reference to the source site with our own brand
    bodyHtml = bodyHtml.replace(/Moviesdrives?\.(cv|lol|my|mom|com|net|org|in|co|to|biz|info)!?/gi, "SMmovies.online");
    bodyHtml = bodyHtml.replace(/\bMoviesdrives?\b/gi, "SMmovies");
  }

  // Featured image fallback
  if (!imageUrl) {
    const featured = doc.querySelector(".post-thumbnail img, .featured-image img, article img");
    imageUrl = featured ? imageFromElement(featured as HTMLImageElement) : "";
  }

  return {
    title,
    date,
    imageUrl,
    bodyHtml,
    categories,
    downloadLinks,
    screenshots,
  };
}

export const DEFAULT_CATEGORIES: Category[] = [
  { name: "All", slug: "" },
  { name: "WEB", slug: "web" },
  { name: "AMZN Prime", slug: "amzn-prime-video" },
  { name: "NETFLIX", slug: "netflix" },
  { name: "JioHotstar", slug: "jiohotstar" },
  { name: "18+", slug: "18" },
  { name: "Dual Audio", slug: "dual-audio" },
  { name: "Bollywood", slug: "bollywood" },
  { name: "Hollywood", slug: "hollywood" },
  { name: "Tamil", slug: "tamil" },
  { name: "Telugu", slug: "telugu" },
  { name: "Malayalam", slug: "malayalam" },
  { name: "Punjabi", slug: "punjabi" },
  { name: "Anime", slug: "anime" },
];

export const CATEGORIES = DEFAULT_CATEGORIES;

// ---------------------------------------------------------------------------
// mdrive.lol link resolver
// Given an mdrive.lol URL (with `?p=ID` or a slug), call the WP REST API,
// extract the real download targets (hubcloud / gdflix / etc.) from the
// post's `content.rendered` and return them.
// ---------------------------------------------------------------------------

const MDRIVE_API = "https://mdrive.lol/wp-json/wp/v2/posts";

async function fetchJsonWithFallback(url: string): Promise<any> {
  // Try direct first (mdrive.lol WP REST usually allows CORS), then proxies.
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) return await res.json();
  } catch {
    /* ignore, try proxies */
  }
  for (let i = 0; i < PROXIES.length; i++) {
    try {
      const res = await fetch(PROXIES[i](url), {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        continue;
      }
    } catch {
      /* try next */
    }
  }
  throw new Error("Failed to fetch mdrive API");
}

async function getMdrivePostId(mdriveUrl: string): Promise<string | null> {
  try {
    const u = new URL(mdriveUrl);
    if (!/mdrive\.lol$/i.test(u.hostname) && !u.hostname.includes("mdrive.lol")) {
      return null;
    }
    const qid = u.searchParams.get("p");
    if (qid && /^\d+$/.test(qid)) return qid;

    // Slug-based: take last non-empty path segment
    const parts = u.pathname.split("/").filter(Boolean);
    const slug = parts[parts.length - 1];
    if (!slug) return null;
    if (/^\d+$/.test(slug)) return slug;

    const data = await fetchJsonWithFallback(
      `${MDRIVE_API}?slug=${encodeURIComponent(slug)}`
    );
    if (Array.isArray(data) && data[0]?.id != null) return String(data[0].id);
    return null;
  } catch {
    return null;
  }
}

export async function resolveMdriveLink(mdriveUrl: string): Promise<string[]> {
  const id = await getMdrivePostId(mdriveUrl);
  if (!id) return [];
  try {
    const data = await fetchJsonWithFallback(`${MDRIVE_API}/${id}`);
    const html: string =
      data?.content?.rendered || data?.content || data?.excerpt?.rendered || "";
    if (!html) return [];
    const re = /https?:\/\/(?:hubcloud|gdflix|gdtot|gdmirror|filepress|mdrive\.mom|fast-dl|sdrive)[^\s"'<>)]+/gi;
    const matches = html.match(re) || [];
    // Dedupe, keep order
    const seen = new Set<string>();
    const out: string[] = [];
    for (const m of matches) {
      const clean = m.replace(/[.,);]+$/, "");
      if (!seen.has(clean)) {
        seen.add(clean);
        out.push(clean);
      }
    }
    return out;
  } catch (e) {
    console.warn("resolveMdriveLink failed", e);
    return [];
  }
}

export function isMdriveLink(url: string): boolean {
  try {
    return new URL(url).hostname.includes("mdrive.lol");
  } catch {
    return false;
  }
}

