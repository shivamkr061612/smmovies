import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import StudioApp from "@/features/studio/StudioApp";

export const Route = createFileRoute("/$")({
  component: Splat,
});

function Splat() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-[#000000]" />;
  return <StudioApp />;
}