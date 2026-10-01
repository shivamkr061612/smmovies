import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import StudioApp from "@/features/studio/StudioApp";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Movie Details & Downloads — SM Movies" },
      { name: "description", content: "View movie and series details, trailers, screenshots, and available download options on SM Movies." },
      { property: "og:title", content: "Movie Details & Downloads — SM Movies" },
      { property: "og:description", content: "View movie and series details, trailers, screenshots, and available download options on SM Movies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Splat,
});

function Splat() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-[#000000]" />;
  return <StudioApp />;
}