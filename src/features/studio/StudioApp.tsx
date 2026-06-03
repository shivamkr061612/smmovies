import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import HeroSlider from "./components/HeroSlider";
import NoticeBanner from "./components/NoticeBanner";
import PosterCard from "./components/PosterCard";
import SkeletonCard from "./components/SkeletonCard";
import Pagination from "./components/Pagination";
import PostPage from "./components/PostPage";
import Footer from "./components/Footer";
import {
  Banner320x50,
  Banner160x600,
  NativeBanner,
} from "./components/Ads";
import { fetchListing, DEFAULT_CATEGORIES, urlToSlug, slugToPath } from "./services/scraper";
import { SITE_BASE_URL, SITE_TITLE, SITE_DESCRIPTION, SITE_LOGO } from "./config/site";
import type { Movie, ScrapeResult, Category } from "./types";

type View =
  | { type: "list" }
  | { type: "post"; slug: string; fallbackTitle?: string; fallbackImage?: string };

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<View>({ type: "list" });

  const fetchData = useCallback(
    async (page: number, category: string, search: string) => {
      setLoading(true);
      setError(null);
      try {
        const result: ScrapeResult = await fetchListing(
          page,
          category || undefined,
          search || undefined
        );
        setMovies(result.movies);
        if (result.categories && result.categories.length > 0) {
          // Merge with defaults to keep all options available
          const merged = [...DEFAULT_CATEGORIES];
          result.categories.forEach((c) => {
            if (!merged.find((m) => m.slug === c.slug)) merged.push(c);
          });
          setCategories(merged);
        }
        setTotalPages(Math.max(result.totalPages, page + (result.hasNext ? 1 : 0)));
        setHasNext(result.hasNext);
        setHasPrev(result.hasPrev);
      } catch (err) {
        console.error(err);
        setError("Failed to load content. Please try again shortly.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(pendingSearch);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [pendingSearch]);

  // Fetch when filters change
  useEffect(() => {
    if (view.type === "list") {
      fetchData(currentPage, selectedCategory, searchQuery);
    }
  }, [currentPage, selectedCategory, searchQuery, fetchData, view.type]);

  // SEO meta updates for listing view
  useEffect(() => {
    if (view.type !== "list") return;
    const catName = categories.find((c) => c.slug === selectedCategory)?.name || "Latest";
    if (searchQuery) {
      document.title = `Search: ${searchQuery} | MoviesDrive`;
    } else if (selectedCategory) {
      document.title = `${catName} Movies & Web Series — Page ${currentPage} | MoviesDrive`;
    } else {
      document.title = SITE_TITLE;
    }

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      `Download latest ${catName} movies and web series in 480p, 720p, 1080p and 4K quality. Bollywood, Hollywood, South Indian, Anime and more.`
    );

    // JSON-LD ItemList
    document.getElementById("seo-schema")?.remove();
    if (movies.length > 0) {
      const script = document.createElement("script");
      script.id = "seo-schema";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: movies.slice(0, 15).map((m, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Movie",
            name: m.title,
            image: m.imageUrl,
          },
        })),
      });
      document.head.appendChild(script);
    }

    // Open Graph / Twitter meta for listing
    const setMetaTag = (key: string, value: string, isProperty = true) => {
      if (!value) return;
      const selector = isProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', key);
        else el.setAttribute('name', key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    setMetaTag('og:title', document.title, true);
    setMetaTag('og:description', SITE_DESCRIPTION || document.querySelector('meta[name="description"]')?.getAttribute('content') || '', true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', `${SITE_BASE_URL}${window.location.pathname}`, true);
    if (SITE_LOGO) setMetaTag('og:image', SITE_LOGO, true);
    setMetaTag('twitter:card', 'summary_large_image', false);
    setMetaTag('twitter:title', document.title, false);
    setMetaTag('twitter:description', SITE_DESCRIPTION || '', false);
    if (SITE_LOGO) setMetaTag('twitter:image', SITE_LOGO, false);
  }, [view, categories, selectedCategory, currentPage, searchQuery, movies]);

  const handleOpenMovie = (movie: Movie) => {
    const slug = movie.slug || (movie.downloadUrl ? urlToSlug(movie.downloadUrl) : "");
    if (!slug) return;
    setView({
      type: "post",
      slug,
      fallbackTitle: movie.title,
      fallbackImage: movie.imageUrl,
    });
    // push path without domain so user can share
    try {
      const path = slugToPath(slug);
      window.history.pushState({ type: "post", slug }, "", path);
    } catch (err) {
      // ignore
    }
  };

  const handleBackToList = () => {
    if (window.history.state?.type === "post") {
      window.history.back();
      return;
    }
    setView({ type: "list" });
    try {
      window.history.replaceState({ type: "list" }, "", "/");
    } catch (err) {}
  };

  // Sync with browser navigation (back/forward)
  useEffect(() => {
    const onPop = () => {
      const p = window.location.pathname || "/";
      if (
        p === "/" ||
        p.startsWith("/category") ||
        p.startsWith("/search.html") ||
        p.startsWith("/page")
      ) {
        setView({ type: "list" });
      } else {
        const slug = p.replace(/^\//, "").replace(/\/$/, "");
        if (slug) setView({ type: "post", slug });
        else setView({ type: "list" });
      }
    };

    window.addEventListener("popstate", onPop);
    // run once to initialize view from URL
    onPop();
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    setSearchQuery("");
    setPendingSearch("");
    setView({ type: "list" });
  };

  const handleHome = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setPendingSearch("");
    setCurrentPage(1);
    setView({ type: "list" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentCategoryName =
    categories.find((c) => c.slug === selectedCategory)?.name || "";

  const showHero = view.type === "list" && !selectedCategory && !searchQuery && currentPage === 1;
  const showNotice = view.type === "list" && !selectedCategory && !searchQuery;
  const showPagination = view.type === "list" && !searchQuery && (hasNext || hasPrev || totalPages > 1);

  const listHeading = searchQuery
    ? `Results for "${searchQuery}"`
    : selectedCategory
    ? `${currentCategoryName} Movies`
    : "Latest Releases";

  return (
    <div className="min-h-screen bg-black">
      {/* Decorative red background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 rounded-full bg-red-700/15 blur-[80px] h-[180px] w-[180px] sm:h-[320px] sm:w-[320px] md:h-[500px] md:w-[500px]" />
        <div className="absolute top-1/3 right-0 translate-x-1/3 rounded-full bg-red-600/10 blur-[80px] h-[140px] w-[140px] sm:h-[280px] sm:w-[280px] md:h-[400px] md:w-[400px]" />
        <div className="absolute bottom-0 left-0 -translate-x-1/3 rounded-full bg-red-800/10 blur-[100px] h-[140px] w-[140px] sm:h-[280px] sm:w-[280px] md:h-[400px] md:w-[400px]" />
      </div>

      <Header
        searchValue={pendingSearch}
        onSearch={setPendingSearch}
        onMenuClick={() => setMenuOpen(true)}
        onLogoClick={handleHome}
      />

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onHome={handleHome}
      />

      <main className="relative mx-auto max-w-7xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
        {view.type === "post" ? (
            <PostPage
              slug={view.slug}
              fallbackTitle={view.fallbackTitle}
              fallbackImage={view.fallbackImage}
              onBack={handleBackToList}
              onSelectCategory={handleSelectCategory}
              categories={categories}
            />
        ) : (
          <div className="lg:flex lg:gap-6">
            <div className="min-w-0 flex-1 space-y-5 sm:space-y-6">
            {/* Hero slider only on home page 1 */}
            {showHero && !loading && movies.length > 0 && (
              <HeroSlider movies={movies} onOpenMovie={handleOpenMovie} />
            )}

            {/* Top banner */}
            <Banner320x50 className="py-1" />

            {/* Notice banner */}
            {showNotice && <NoticeBanner />}

            {/* Section heading */}
            <div className="flex items-center justify-between gap-3 px-1 pt-2">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-white sm:text-2xl">
                <span className="text-2xl sm:text-3xl">🔥</span>
                {listHeading}
              </h2>
              {view.type === "list" && !searchQuery && (
                <span className="text-xs font-medium text-slate-400 sm:text-sm">
                  Page {currentPage}
                </span>
              )}
            </div>

            {/* Status */}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-500 border-r-transparent" />
                Loading...
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                <p className="text-sm text-red-300">{error}</p>
                <button
                  onClick={() => fetchData(currentPage, selectedCategory, searchQuery)}
                  className="mt-3 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 ring-1 ring-red-500/20 transition-colors hover:bg-red-500/20"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Movies grid */}
            {!error && (
              <div className="movies-grid grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                  : movies.map((movie) => (
                      <PosterCard key={movie.id} movie={movie} onClick={handleOpenMovie} />
                    ))}
              </div>
            )}

            {/* Native banner under the grid */}
            {!loading && !error && movies.length > 0 && (
              <NativeBanner className="mt-4" />
            )}

            {/* Empty state */}
            {!loading && !error && movies.length === 0 && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 text-4xl">
                  🎞️
                </div>
                <h3 className="text-lg font-semibold text-slate-300">No movies found</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {searchQuery
                    ? "Try a different search term."
                    : "Try a different category or check back later."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {showPagination && !loading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrev={hasPrev}
                onPageChange={handlePageChange}
              />
            )}

            {/* Bottom mobile banner */}
            <Banner320x50 className="py-2 lg:hidden" />
            </div>

            {/* Sidebar 160x600 — desktop only */}
            <aside className="hidden lg:flex lg:w-[176px] lg:flex-shrink-0 lg:justify-center">
              <div className="sticky top-20">
                <Banner160x600 />
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Footer (moved to component) */}
      <Footer />
    </div>
  );
}
