import type { Movie, ScrapeResult, Category, PostContent } from "../types";
import { SITE_BASE_URL as BASE_URL } from "../config/site";

// WordPress REST API endpoints
const API_BASE = `${BASE_URL.replace(/\/$/, "")}/wp-json/wp/v2`;
const MDRIVE_POSTS_API = "https://mdrive.lol/wp-json/wp/v2/posts";

const PER_PAGE = 20;

// ---------- URL helpers (kept for routing compatibility) ----------
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

export function slugToPath(slug: string): string {
  if (!slug) return "/";
  return slug.startsWith("/") ? slug.replace(/\/$/, "") : `/${slug.replace(/\/$/, "")}`;
}

export function categoryToPath(category: string, page = 1): string {
  if (!category) return page > 1 ? `/page/${page}/` : `/`;
  return page > 1 ? `/category/${category}/page/${page}/` : `/category/${category}/`;
}

export function searchToPath(query: string): string {
  return `/search.html?q=${encodeURIComponent(query)}`;
}

// ---------- Tiny utilities ----------
function decodeEntities(s: string): string {
  if (!s) return "";
  if (typeof document === "undefined") {
    return s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#8211;/g, "–")
      .replace(/&#8217;/g, "'");
  }
  const ta = document.createElement("textarea");
  ta.innerHTML = s;
  return ta.value;
}

function stripHtml(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, "").trim();
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || d.innerText || "").trim();
}

async function getJSON(url: string): Promise<{ data: any; headers: Headers }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, headers: res.headers };
  } finally {
    clearTimeout(t);
  }
}

// ---------- Category slug → ID cache ----------
const categoryIdCache = new Map<string, number | null>();

async function resolveCategoryId(slug: string): Promise<number | null> {
  if (!slug) return null;
  if (categoryIdCache.has(slug)) return categoryIdCache.get(slug)!;
  try {
    const { data } = await getJSON(
      `${API_BASE}/categories?slug=${encodeURIComponent(slug)}&per_page=1`
    );
    const id = Array.isArray(data) && data[0]?.id ? data[0].id : null;
    categoryIdCache.set(slug, id);
    return id;
  } catch {
    categoryIdCache.set(slug, null);
    return null;
  }
}

// ---------- Map a WP post → Movie ----------
function postToMovie(p: any): Movie {
  const featured =
    p?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    p?.jetpack_featured_media_url ||
    "";
  let imageUrl: string = featured || "";
  const rendered: string = p?.content?.rendered || "";
  if (!imageUrl && rendered) {
    const m = rendered.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m) imageUrl = m[1];
  }

  // Try to guess quality from title
  const title = decodeEntities(p?.title?.rendered || "");
  const qMatch = title.match(/\b(480p|720p|1080p|2160p|4K|HDTC|WEB-DL|BluRay|HEVC)\b/i);

  return {
    id: String(p.id),
    title,
    description: stripHtml(p?.excerpt?.rendered || "").slice(0, 200),
    imageUrl,
    downloadUrl: p?.link || "",
    quality: qMatch?.[1] || "",
    slug: p?.slug || (p?.link ? urlToSlug(p.link) : ""),
  };
}

// ---------- Listing ----------
export async function fetchListing(
  page: number = 1,
  category?: string,
  searchQuery?: string
): Promise<ScrapeResult> {
  const params = new URLSearchParams();
  params.set("per_page", String(PER_PAGE));
  params.set("page", String(page));
  params.set("_embed", "1");

  if (searchQuery) {
    params.set("search", searchQuery);
  }
  if (category) {
    const id = await resolveCategoryId(category);
    if (id) params.set("categories", String(id));
  }

  const url = `${API_BASE}/posts?${params.toString()}`;

  let data: any[] = [];
  let headers: Headers | null = null;
  try {
    const res = await getJSON(url);
    data = Array.isArray(res.data) ? res.data : [];
    headers = res.headers;
  } catch (err) {
    // WP returns 400 when page > total pages — treat as empty
    console.warn("Listing fetch failed:", err);
    return {
      movies: [],
      categories: DEFAULT_CATEGORIES,
      currentPage: page,
      totalPages: page,
      hasNext: false,
      hasPrev: page > 1,
    };
  }

  const movies: Movie[] = data.map(postToMovie);
  const totalPages = Number(headers?.get("X-WP-TotalPages")) || page;

  return {
    movies,
    categories: DEFAULT_CATEGORIES,
    currentPage: page,
    totalPages: Math.max(totalPages, page),
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export const scrapeMovies = fetchListing;

// ---------- Single post ----------
export async function fetchPostContent(slug: string): Promise<PostContent> {
  // slug may include nested path; WP slug filter expects just the last segment
  const cleanSlug = slug.replace(/^\/|\/$/g, "").split("/").pop() || slug;
  const url = `${API_BASE}/posts?slug=${encodeURIComponent(cleanSlug)}&_embed=1`;
  const { data } = await getJSON(url);
  const post = Array.isArray(data) ? data[0] : null;
  if (!post) throw new Error("Post not found");

  const title = decodeEntities(post.title?.rendered || "Untitled");

  // Date — format nicely
  let date = "";
  if (post.date) {
    try {
      date = new Date(post.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      date = post.date;
    }
  }

  // Categories from _embedded["wp:term"][0]
  const categories: { name: string; slug: string }[] = [];
  const terms = post._embedded?.["wp:term"]?.[0] || [];
  for (const t of terms) {
    if (t?.name && t?.slug) categories.push({ name: decodeEntities(t.name), slug: t.slug });
  }

  // Featured image
  const featured =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    post.jetpack_featured_media_url ||
    "";

  // Parse body HTML
  const rendered: string = post.content?.rendered || "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="root">${rendered}</div>`, "text/html");
  const root = doc.getElementById("root")!;

  // Remove ads/scripts
  root
    .querySelectorAll("script, style, iframe, ins, .ads, .ad, [class*='advert']")
    .forEach((el) => el.remove());

  // Rewrite all Telegram links to our own group
  const TELEGRAM_URL = "https://t.me/+FSWElNbfXwdjYWNl";
  root.querySelectorAll("a[href]").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (
      href.includes("t.me/") ||
      href.includes("telegram.me/") ||
      href.includes("telegram.dog/") ||
      href.includes("//telegram.")
    ) {
      a.setAttribute("href", TELEGRAM_URL);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });

  // Extract images
  let imageUrl = featured;
  const screenshots: string[] = [];
  const imgs = root.querySelectorAll("img");
  imgs.forEach((img, i) => {
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return;
    if (!imageUrl && i === 0) imageUrl = src;
    else if (src !== imageUrl) screenshots.push(src);
    if (img.getAttribute("data-src")) img.setAttribute("src", src);
  });

  // Extract download links — anchors pointing to mdrive.lol/archive/{id}
  // Also rewrite the anchor in-place so body clicks are intercepted by mdriveId.
  const downloadLinks: { label: string; url: string; mdriveId?: string }[] = [];
  const anchors = root.querySelectorAll("a[href]");
  anchors.forEach((a) => {
    const href = a.getAttribute("href") || "";
    const text = (a.textContent || "").trim();
    const m = href.match(/mdrive\.lol\/(?:archive|\?p=)\/?(\d+)/i);
    if (m) {
      const id = m[1];
      a.setAttribute("data-mdrive-id", id);
      downloadLinks.push({ label: text || "Download", url: href, mdriveId: id });
    } else if (
      /480p|720p|1080p|2160p|4K|HEVC|x264|x265|G-Drive|Download|HDTC|WEB-DL|BluRay|Zip|HubCloud|GDFliX/i.test(
        text + href
      ) &&
      text.length > 0 &&
      text.length < 200 &&
      href.startsWith("http")
    ) {
      downloadLinks.push({ label: text, url: href });
    }
  });

  const bodyHtml = root.innerHTML;

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

// ---------- Generate mdrive download links from API ----------
const mdriveCache = new Map<string, { label: string; url: string }[]>();

export async function fetchMdriveLinks(
  id: string
): Promise<{ label: string; url: string }[]> {
  if (mdriveCache.has(id)) return mdriveCache.get(id)!;

  const { data } = await getJSON(`${MDRIVE_POSTS_API}/${id}`);
  const html: string = data?.content?.rendered || "";
  if (!html) {
    mdriveCache.set(id, []);
    return [];
  }

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const anchors = doc.querySelectorAll("a[href]");
  const out: { label: string; url: string }[] = [];
  const seen = new Set<string>();

  anchors.forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (!href || seen.has(href)) return;
    // Only direct mirror providers — skip the source site / ads
    if (
      /hubcloud|gdflix|gdtot|fastdl|drive\.google|pixel|gdbot|filepress|mdisk|workers\.dev/i.test(
        href
      )
    ) {
      let label = (a.textContent || "").trim();
      if (!label) {
        if (/hubcloud/i.test(href)) label = "HubCloud";
        else if (/gdflix/i.test(href)) label = "GDFliX";
        else label = "Download";
      }
      seen.add(href);
      out.push({ label, url: href });
    }
  });

  mdriveCache.set(id, out);
  return out;
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
