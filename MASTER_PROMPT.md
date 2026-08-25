# MASTER PROMPT — "SM Movies" Clone (Exact Rebuild)

Copy everything below (from `--- START ---` to `--- END ---`) into a new Lovable project as your first message. It contains the full stack, every API endpoint, all parsing rules, UI spec and ad rules needed to reproduce this website exactly as it works today.

---

--- START ---

Build a movie/web-series download portal named **SM Movies**. It has **no backend database** — all content is fetched live from an external WordPress-based source site through a server-side proxy, parsed in the browser with `DOMParser`, and rendered in a premium glass-morphism UI.

## 1. Stack (fixed — do not change)

- TanStack Start v1 (React 19) + Vite 7, file routes in `src/routes`
- Tailwind CSS v4 via `src/styles.css` (`@theme` tokens, no tailwind.config.js)
- lucide-react for ALL icons (never emojis anywhere)
- No database, no auth, no Lovable Cloud required
- One server route: the CORS proxy (below)

## 2. File structure

```
src/routes/__root.tsx                     head meta + google-site-verification
src/routes/index.tsx                      mounts <StudioApp/> after hydration
src/routes/$.tsx                          catch-all: post pages by slug
src/routes/sitemap[.]xml.ts               dynamic sitemap
src/routes/api/public/proxy.ts            CORS proxy (server route)
src/features/studio/StudioApp.tsx         main app shell + state machine
src/features/studio/config/site.ts        all config, runtime-overridable
src/features/studio/services/scraper.ts   ALL data fetching + parsing
src/features/studio/types.ts              Movie, Category, ScrapeResult, PostContent
src/features/studio/components/
  Header.tsx SideMenu.tsx HeroSlider.tsx NoticeBanner.tsx PosterCard.tsx
  SkeletonCard.tsx Pagination.tsx PostPage.tsx Footer.tsx WelcomePopup.tsx Ads.tsx
public/robots.txt  public/site.webmanifest  public/logo.png  public/sw.js
```

## 3. Types

```ts
export interface Movie { id: string; title: string; description: string; imageUrl: string; downloadUrl: string; quality?: string; category?: string; slug?: string; }
export interface Category { name: string; slug: string; }
export interface ScrapeResult { movies: Movie[]; categories?: Category[]; currentPage: number; totalPages: number; hasNext: boolean; hasPrev: boolean; }
export interface PostContent { title: string; date: string; imageUrl: string; bodyHtml: string; categories: {name:string;slug:string}[]; downloadLinks: {label:string;url:string;mdriveId?:string}[]; screenshots: string[]; }
```

## 4. Config (`src/features/studio/config/site.ts`)

Every value must be readable at runtime from `window.getConfig(key)` or `window.APP_CONFIG[key]` first, then fall back to these defaults:

```
SITE_BASE_URL   = "https://new1.moviesdrive.christmas"     // source site, no trailing slash
SITE_MIRRORS    = [
  "https://new1.moviesdrive.christmas",
  "https://new2.moviesdrive.christmas",
  "https://new3.moviesdrive.christmas",
  "https://moviesdrive.christmas",
  "https://new6.moviesdrives.my",
  "https://new3.moviesdrives.my"
]
SITE_NAME        = "SM Movies"
SITE_TITLE       = "SM Movies — Download Latest Movies & Web Series in HD, 4K"
SITE_DESCRIPTION = "Download latest Bollywood, Hollywood, South Indian movies and web series in 480p, 720p, 1080p and 4K quality."
SITE_LOGO        = "/logo.png"
TELEGRAM_URL          = "https://t.me/+FSWElNbfXwdjYWNl"
WHATSAPP_CHANNEL_URL  = "https://whatsapp.com/channel/0029Vb7WBkQI1rcoQOrStM3g"
NOTICE_HTML = ""   FOOTER_AD_HTML = ""   POST_LOGOS_TOP = [SITE_LOGO]   POST_LOGOS_BOTTOM = []
```

## 5. APIs & ENDPOINTS (complete list)

### 5.1 Own server route — CORS proxy
`GET /api/public/proxy?url=<encoded absolute url>`
- Reject missing url (400) and non-http(s) protocol (400)
- 20s AbortController timeout
- Forward with headers: mobile Chrome `User-Agent` (`Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 ... Chrome/147.0.0.0 Mobile Safari/537.36`), `Accept: text/html,application/xhtml+xml,application/json,*/*`, `Accept-Language: en-US,en;q=0.9`
- Return raw `arrayBuffer()` with upstream `content-type`, plus `access-control-allow-origin: *` and `cache-control: public, max-age=120`
- On throw → 502 `Proxy fetch failed: <message>`

### 5.2 Proxy chain used by the client (in order)
```
1. /api/public/proxy?url=<enc>
2. https://api.allorigins.win/raw?url=<enc>
3. https://mag.dhanjeerider.workers.dev/?url=<enc>
```
Rules per attempt: 20s timeout; treat `!res.ok`, body shorter than 100 chars, or body containing `502 Bad Gateway` / `origin is not allowed` as failure; move to next proxy.

### 5.3 Source-site endpoints (all relative to the active mirror)
```
Home page 1        GET  /
Home page N        GET  /page/{N}/
Category page 1    GET  /category/{slug}/
Category page N    GET  /category/{slug}/page/{N}/
Search JSON (1st)  GET  /search.php?q={query}&page={N}     → JSON
Search HTML (fb)   GET  /search.html?q={query}[&page={N}]  → HTML
Post page          GET  /{slug}/
```

### 5.4 Download-link resolver — mdrive.lol WordPress REST API
```
Lookup by slug : GET https://mdrive.lol/wp-json/wp/v2/posts?slug={slug}   → [{ id, ... }]
Fetch post     : GET https://mdrive.lol/wp-json/wp/v2/posts/{id}          → { content: { rendered } }
```
- Try a **direct** fetch first (mdrive.lol sends CORS headers), then the 3 proxies from 5.2.
- Getting the ID from an `mdrive.lol` URL: use `?p=<digits>` if present; else take the last non-empty path segment — if it is all digits use it, otherwise resolve it via `?slug=`.
- From `content.rendered`, extract real download targets with:
  `/https?:\/\/(?:hubcloud|gdflix|gdtot|gdmirror|filepress|mdrive\.mom|fast-dl|sdrive)[^\s"'<>)]+/gi`
  then strip trailing `.,);`, dedupe, keep order. Return `string[]`.
- `isMdriveLink(url)` = hostname includes `mdrive.lol`.

## 6. Mirror failover logic

Build `MIRRORS = unique([SITE_BASE_URL, ...SITE_MIRRORS])` (strip trailing slash).
`fetchWithProxy(url)`: order mirrors with the one saved in `sessionStorage["sm_active_mirror"]` first; for each mirror rewrite the URL's protocol+host to that mirror and run the 3-proxy chain; on success save that mirror and return the HTML; if all fail throw
`"The source site is currently unreachable (<reason>). Please try again shortly."`

## 7. Listing parse rules (`DOMParser`, `text/html`)

- Categories from `ul.category-list a, .categories-list a, .widget_categories a, .sidebar-categories a, .sidebar-widget a`; keep only hrefs containing `/category/`; slug = `/\/category\/([^/]+)/`; strip trailing `(12)` counts; name length < 40; dedupe.
- Cards from `.movies-grid a, .movie-grid a, a:has(.poster-card)`. Inside each: title from `.poster-title`, image from the `img`, quality from `.poster-quality`; `downloadUrl` = anchor href; `slug` = href pathname without slashes; `id` = href || image || title; dedupe by id.
- Fallback when zero cards: iterate all `img`, skip src containing `logo`/`icon`, take closest `div, article` container, title from `h1..h5` (or alt), description from first `p`, link from first `a`.
- Image URL resolution order: `data-src`, `data-lazy-src`, `data-original`, `data-orig-file`, `data-medium-file`, `data-large-file`, `src`, then first entry of `data-srcset`/`srcset`. Ignore `data:`/`blob:`. Prefix `//` with `https:`, prefix `/` with base URL. **Rewrite hostname `catimages.org|to|net|cc|in` → `catimages.co`** (the .org mirror fails on mobile).
- Pagination: collect all `/page/(\d+)/` occurrences → maxPage; `hasNext` if page+1 link or `next-btn` or `rel="next"`; `hasPrev` similarly for page-1 when page > 1; `totalPages = max(currentPage + hasNext, maxPage)`.

## 8. Search behaviour

1. Call `/search.php?q=..&page=..` through the proxy chain (proxy #1 then allorigins) with `Accept: application/json, text/javascript, */*; q=0.01`, 15s timeout.
2. Accept any of these shapes: bare array, `.data`, `.results`, `.items`, `.hits[].document`.
3. Map fields loosely: title from `post_title|title|name|t`; image from `post_thumbnail|post_thumbnail_url|post_thumb|thumb|poster|image|img|imageUrl`; link from `permalink|link|url|download` (prefix base if it starts with `/`); quality from `quality|q`.
4. `hasNext = items.length >= 10`.
5. If JSON fails/empty → scrape `/search.html?q=...` HTML with the listing parser. If that fails too, return an empty result (never throw to the UI).

## 9. Post page parse rules

- Title: `.post-title, h1.post-title, article h1, h1`. Date: `.post-date, time, .entry-date`.
- Categories: `.post-categories a, .category-tag, a[rel='category tag']`.
- Body container preference: `.page-body` → `.post-content` → `article .entry-content` → `article`. Clone it, then remove `script, style, ins, .ads, .ad, [class*='advert']`.
- **Keep YouTube trailers**: for iframes whose src matches `youtube|youtu.be` set `loading=lazy`, `allowfullscreen`, `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`, `referrerpolicy=strict-origin-when-cross-origin`. Render body with `dangerouslySetInnerHTML` and make iframes responsive (16:9).
- Rewrite every anchor whose href matches `t\.me|telegram` to `TELEGRAM_URL`; make root-relative hrefs absolute.
- Unwrap `<noscript>` blocks that contain `<img>` (WP lazy-load) before extracting images.
- Images: first usable one becomes the poster (`imageUrl`), the rest go to `screenshots`. Skip `logo|icon|spinner|avatar|smiley|emoji`. Normalize `src` and drop `srcset`/`data-srcset`/`data-lazy-src`.
- Download links: anchors whose text+href match `480p|720p|1080p|2160p|4K|HEVC|x264|x265|G-Drive|Download|HDTC|WEB-DL|BluRay` and text length < 200.
- Rebranding on the final HTML string: `Moviesdrives?\.(cv|lol|my|mom|com|net|org|in|co|to|biz|info)!?` → `SMmovies.online`, and `\bMoviesdrives?\b` → `SMmovies`.

## 10. Default categories (sidebar/menu order)

All(""), WEB(web), AMZN Prime(amzn-prime-video), NETFLIX(netflix), JioHotstar(jiohotstar), 18+(18), Dual Audio(dual-audio), Bollywood(bollywood), Hollywood(hollywood), Tamil(tamil), Telugu(telugu), Malayalam(malayalam), Punjabi(punjabi), Anime(anime). Merge server-discovered categories into this list without duplicating slugs.

## 11. App behaviour (`StudioApp.tsx`)

- Single-page view state: `{type:"list"} | {type:"post", slug, fallbackTitle?, fallbackImage?}`.
- Search input debounced 500ms; changing search or category resets to page 1.
- Opening a movie: `history.pushState` to `/<slug>` so the URL is shareable; `popstate` restores the view (`/`, `/category*`, `/search.html*`, `/page*` → list, anything else → post). Back button uses `history.back()` when the current state is a post.
- Hero slider only on home + page 1 + no filters. Notice banner on unfiltered list. Pagination hidden while searching.
- Section heading: `Results for "q"` / `<Category> Movies` / `Latest Releases`, with a `Flame` icon in a glass chip and a "Page N" pill.
- Loading = 12 `SkeletonCard`s. Error = glass card with `RefreshCw` Retry button. Empty = glass card with `FileVideo` icon.
- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`, gap 3/4.
- Desktop-only sticky right sidebar ad slot (160x600) beside the grid.
- Client-side SEO updates on the list view: document.title, meta description, `og:*`/`twitter:*` tags, and a JSON-LD `ItemList` of the first 15 movies injected as `#seo-schema`.

## 12. Download popup (critical UX)

On clicking any download button whose href is an `mdrive.lol` link: **do not navigate**. Call the resolver and show a modal rendered with `createPortal` into `document.body` (so parent transforms can't offset it), positioned `fixed inset-0 flex items-center justify-center`, backdrop blur, panel `max-h-[85vh] overflow-y-auto`, rounded-3xl glass. Show a spinner while resolving, then one row per resolved server link (HubCloud / GDFlix / etc.) opening in a new tab.
For series, extract the episode from the label (`S01E01`, `E01`, `Episode 1`, `Ep 1`) and show it as a red badge with a `Tv` icon both in the modal header and on each row. Close on backdrop click, Escape, and an `X` button.

## 13. Design system

- Palette: pure black background, white text, red accents only (`#dc2626` family). No purple/indigo/amber. Define all colors as tokens in `src/styles.css` — never hardcode `text-white`/`bg-black`/hex in components except the documented shell background.
- iPhone-style glass everywhere: `border border-white/10 bg-white/[0.04] backdrop-blur-md`, plus a reusable `.glass` utility.
- 22px card radii, `cubic-bezier` transitions, hover zoom + red glow, smooth animations.
- Three fixed decorative red radial glows behind the content (top-center, right-middle, bottom-left), responsive sizes, `pointer-events-none`.
- Header: logo + "SM Movies" always visible, hamburger (`Menu`) on the left, search collapsed behind a `Search` icon that expands with animation, and a filter panel with Quality / Language / Year rows.
- Side menu: slide-in glass drawer with realistic lucide icons per category, plus Telegram and WhatsApp community cards.
- Welcome popup: centered, mobile-friendly, glass, appears on **every** page load (no localStorage gate), and must contain **zero ad code**.
- Escape braces in JSX text and never use emojis.

## 14. Ads

Module `Ads.tsx` exports `PopunderLoader`, `Banner320x50`, `Banner160x600`, `NativeBanner`, `openSmartlink(key)`.
- Popunder + banner tag: inject once by id — `src="https://al5sm.com/tag.min.js"`, `data-zone="11198492"`, async, appended to `document.body`.
- Direct smartlink: `https://omg10.com/4/11112237`.
- `openSmartlink(key)` opens the smartlink in a new tab **at most 3 times per button key per session** (in-memory `Map`) with a global 1500ms cooldown between any two opens. Never on the welcome popup.
- Ad slots are centered flex divs with `minHeight` 50 / 600 / 120 that the injected tag fills.

## 15. SEO assets

- `public/robots.txt`: allow all + `Sitemap: https://<domain>/sitemap.xml`.
- Dynamic `src/routes/sitemap[.]xml.ts` returning `application/xml` with the home URL (daily, priority 1.0).
- `public/site.webmanifest`: name/short_name "SM Movies", `background_color #0a0a0a`, `theme_color #dc2626`, icon `/logo.png` 512x512, `display standalone`.
- `__root.tsx` head: charset, viewport, manifest link, favicon, and a `google-site-verification` meta slot.
- `index.tsx` head: unique title/description/og/twitter, `theme-color #000000`.
- Logo must live at `public/logo.png` and be referenced by absolute path `/logo.png` so it survives hosting.

## 16. Acceptance checklist

1. Home shows the latest releases grid; pagination works forward and back.
2. Category filter loads `/category/<slug>/` and paginates.
3. Search returns results via `/search.php`, silently falling back to `/search.html`.
4. Opening a movie changes the URL to `/<slug>` and is shareable/reloadable; browser back returns to the list.
5. Post page shows poster, body, working YouTube trailer, and a screenshots gallery.
6. Every download button opens the centered scrollable popup with resolved HubCloud/GDFlix links and, for series, the episode number.
7. All Telegram links point to the configured group; no "Moviesdrive" branding is visible anywhere.
8. When the primary mirror is down, the app silently switches to a working mirror.
9. Icons are lucide only; no emojis; consistent black/white/red glass UI on mobile and desktop.

--- END ---
