import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import StudioApp from "@/features/studio/StudioApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SM Movies — Download Latest Movies & Web Series in HD, 4K" },
      { name: "description", content: "Download latest Bollywood, Hollywood, South Indian movies and web series in 480p, 720p, 1080p and 4K quality." },
      { name: "theme-color", content: "#000000" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-[#000000]" />;
  return <StudioApp />;
}
