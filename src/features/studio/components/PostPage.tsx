import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Share2, Calendar, Download, ArrowRight, Sparkles, X, Cloud, HardDrive, Link as LinkIcon, Loader2 } from "lucide-react";
import { fetchPostContent, slugToPath, resolveMdriveLink, isMdriveLink } from "../services/scraper";
import { POST_LOGOS_TOP, POST_LOGOS_BOTTOM, SITE_BASE_URL, SITE_TITLE, SITE_DESCRIPTION, SITE_LOGO } from "../config/site";
import type { PostContent } from "../types";
import {
  Banner320x50,
  Banner160x600,
  NativeBanner,
  openSmartlink,
} from "./Ads";

interface PostPageProps {
  slug: string;
  fallbackTitle?: string;
  fallbackImage?: string;
  onBack: () => void;
  onSelectCategory: (slug: string) => void;
  categories?: { name: string; slug: string }[];
}

export default function PostPage({
  slug,
  fallbackTitle,
  fallbackImage,
  onBack,
  onSelectCategory,
  categories,
}: PostPageProps) {
  const [post, setPost] = useState<PostContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [popup, setPopup] = useState<{ label: string; loading: boolean; links: string[]; error: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPost(null);

    fetchPostContent(slug)
      .then((data) => {
        if (cancelled) return;
        setPost(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Failed to load this post. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Update document title for SEO
  useEffect(() => {
    if (post?.title) {
      const title = `${post.title} | ${SITE_TITLE}`;
      document.title = title;

      // set meta description (first 160 chars of text)
      const tmp = document.createElement('div');
      tmp.innerHTML = post.bodyHtml || "";
      const text = (tmp.textContent || tmp.innerText || "").trim().replace(/\s+/g, ' ');
      const desc = (post.downloadLinks?.[0]?.label || text.substring(0, 160) || SITE_DESCRIPTION || '').replace(/\n/g, ' ');

      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', desc);

      const setMeta = (nameOrProp: string, value: string, isProp = true) => {
        if (!value) return;
        const sel = isProp ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
        let el = document.querySelector(sel) as HTMLMetaElement | null;
        if (!el) {
          el = document.createElement('meta');
          if (isProp) el.setAttribute('property', nameOrProp);
          else el.setAttribute('name', nameOrProp);
          document.head.appendChild(el);
        }
        el.setAttribute('content', value);
      };

      const fullUrl = `${SITE_BASE_URL.replace(/\/$/, '')}${slugToPath(slug)}`;
      setMeta('og:title', title, true);
      setMeta('og:description', desc, true);
      setMeta('og:type', 'article', true);
      setMeta('og:url', fullUrl, true);
      setMeta('og:image', post.imageUrl || SITE_LOGO || '', true);
      setMeta('twitter:card', 'summary_large_image', false);
      setMeta('twitter:title', title, false);
      setMeta('twitter:description', desc, false);
      setMeta('twitter:image', post.imageUrl || SITE_LOGO || '', false);

      // JSON-LD for Movie
      document.getElementById('seo-post-schema')?.remove();
      const ld = {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: post.title,
        image: post.imageUrl || SITE_LOGO || undefined,
        url: fullUrl,
        datePublished: post.date || undefined,
        description: desc || undefined,
      };
      const s = document.createElement('script');
      s.id = 'seo-post-schema';
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    }
  }, [post]);

  // Intercept clicks on any link inside the scraped post body. For mdrive.lol
  // links we resolve the real download URL through the WP REST API and open
  // that instead of redirecting the user through mdrive.lol.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (isMdriveLink(href)) {
        e.preventDefault();
        e.stopPropagation();
        handleMdriveClick(href, target.textContent?.trim() || "Download");
        return;
      }
      openSmartlink();
    };
    el.addEventListener("click", onClick, true);
    return () => el.removeEventListener("click", onClick, true);
  }, [post]);

  async function handleMdriveClick(url: string, label: string) {
    if (popup?.loading) return;
    setPopup({ label, loading: true, links: [], error: null });
    try {
      openSmartlink();
      const links = await resolveMdriveLink(url);
      if (links.length === 0) {
        setPopup({
          label,
          loading: false,
          links: [],
          error: "Could not generate direct links for this option. Please try another.",
        });
        return;
      }
      setPopup({ label, loading: false, links, error: null });
    } catch (err) {
      console.error(err);
      setPopup({
        label,
        loading: false,
        links: [],
        error: "Failed to generate download links. Please try again.",
      });
    }
  }

  function serverLabel(u: string): { name: string; Icon: typeof Cloud } {
    const h = (() => {
      try { return new URL(u).hostname.toLowerCase(); } catch { return ""; }
    })();
    if (h.includes("hubcloud")) return { name: "HubCloud", Icon: Cloud };
    if (h.includes("gdflix")) return { name: "GDFlix", Icon: HardDrive };
    if (h.includes("gdtot")) return { name: "GDToT", Icon: HardDrive };
    if (h.includes("gdmirror")) return { name: "GDMirror", Icon: HardDrive };
    if (h.includes("filepress")) return { name: "FilePress", Icon: HardDrive };
    if (h.includes("mdrive.mom")) return { name: "MDrive", Icon: Cloud };
    if (h.includes("fast-dl")) return { name: "Fast-DL", Icon: Cloud };
    if (h.includes("sdrive")) return { name: "SDrive", Icon: Cloud };
    return { name: h || "Direct Link", Icon: LinkIcon };
  }

  const displayTitle = post?.title || fallbackTitle || "Loading...";
  const displayImage = post?.imageUrl || fallbackImage || "";

  return (
    <article className="post-content overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl ring-1 ring-white/5 backdrop-blur-2xl">
      {/* Top logos */}
      {POST_LOGOS_TOP && POST_LOGOS_TOP.length > 0 && (
        <div className="p-4 flex items-center justify-center gap-4">
          {POST_LOGOS_TOP.map((u) => (
            <img key={u} src={u} alt="logo" className="h-8 object-contain" />
          ))}
        </div>
      )}

      {/* Back / Share - glass bar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-3 py-2.5 backdrop-blur-xl sm:px-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 backdrop-blur-xl transition-all hover:bg-white/15 hover:text-white active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </button>
        <button
          onClick={() => {
            try {
              const path = `/${slug.replace(/^\//, "").replace(/\/$/, "")}`;
              const full = window.location?.origin ? `${window.location.origin}${path}` : path;
              navigator.clipboard?.writeText(full);
              alert(`Copied to clipboard: ${full}`);
            } catch {
              /* noop */
            }
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 backdrop-blur-xl transition-all hover:bg-white/15 hover:text-white active:scale-95"
        >
          <Share2 className="h-4 w-4" strokeWidth={2.2} />
          Share
        </button>
      </div>

      {/* Header */}
      <header className="post-header px-4 py-5 sm:px-8 sm:py-8">
        <h1 className="post-title text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl">
          {displayTitle}
        </h1>

        <div className="post-meta mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          {post?.date && (
            <span className="post-date inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" strokeWidth={2} />
              {post.date}
            </span>
          )}

          {post && post.categories.length > 0 && (
            <div className="post-categories flex flex-wrap items-center gap-2">
              {post.categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => onSelectCategory(c.slug)}
                  className="category-tag inline-flex items-center rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200 backdrop-blur-xl transition-all hover:bg-red-500/20 hover:text-white"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mx-4 border-t border-white/10 sm:mx-8" />

      {/* Body */}
      <main className="page-body px-4 py-6 sm:px-8 sm:py-8">
        {/* Top banner */}
        <Banner320x50 className="mb-5" />

        {loading && (
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
            <div className="mx-auto mt-6 aspect-[2/3] w-full max-w-xs animate-pulse rounded-xl bg-slate-800" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
            <p className="text-sm text-red-300">{error}</p>
            {displayImage && (
              <img
                src={displayImage}
                alt={displayTitle}
                className="mx-auto mt-4 max-w-xs rounded-xl"
              />
            )}
          </div>
        )}

        {!loading && !error && post && (
          <div ref={bodyRef}>
            {/* Rendered content */}
            <div
              className="prose-body text-base leading-loose text-slate-300 [&_a]:text-red-400 [&_a:hover]:text-red-300 [&_strong]:text-white [&_b]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_p]:my-4 [&_p]:text-center [&_img]:mx-auto [&_img]:my-6 [&_img]:rounded-xl [&_img]:shadow-2xl [&_img]:max-w-full [&_img]:h-auto"
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
            />

            {/* Native banner between body and quick downloads */}
            <NativeBanner className="my-6" />

            {/* Quick download links section — iOS glass */}
            {post.downloadLinks.length > 0 && (
              <div className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-red-500/15 via-red-500/10 to-red-700/10 p-5 shadow-xl backdrop-blur-2xl">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl">
                    <Download className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </span>
                  Quick Download Links
                  <Sparkles className="h-4 w-4 text-red-300" strokeWidth={2.2} />
                </h3>
                {/* status banner removed — popup now shows resolved links */}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {post.downloadLinks.slice(0, 20).map((link, i) => {
                    const mdrive = isMdriveLink(link.url);
                    const isLoading = resolving === link.label;
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (mdrive) {
                            e.preventDefault();
                            handleMdriveClick(link.url, link.label);
                          } else {
                            openSmartlink();
                          }
                        }}
                        aria-busy={isLoading}
                        className={`group flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm font-medium text-slate-100 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.16] hover:shadow-lg active:scale-[0.98] ${
                          isLoading ? "pointer-events-none opacity-70" : ""
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white">
                            <Download className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </span>
                          <span className="line-clamp-1">
                            {isLoading ? "Generating…" : link.label}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/60 transition-transform group-hover:translate-x-0.5 group-hover:text-white" strokeWidth={2.2} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All categories (from listing) */}
            {categories && categories.length > 0 && (
              <div className="mt-8 rounded-2xl border border-white/5 bg-[#0a0a0a]/40 p-4">
                <h4 className="mb-3 text-sm font-bold text-slate-300">All Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => onSelectCategory(c.slug)}
                      className="inline-flex items-center rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-red-600 hover:text-white"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Post bottom logos */}
            {POST_LOGOS_BOTTOM && POST_LOGOS_BOTTOM.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 px-4 sm:px-8">
                {POST_LOGOS_BOTTOM.map((u) => (
                  <img key={u} src={u} alt="logo" className="h-8 object-contain" />
                ))}
              </div>
            )}

            {/* Bottom banners */}
            <Banner320x50 className="mt-8 lg:hidden" />
            <div className="mt-8 hidden lg:flex lg:justify-center">
              <Banner160x600 />
            </div>
          </div>
        )}
      </main>
    </article>
  );
}
