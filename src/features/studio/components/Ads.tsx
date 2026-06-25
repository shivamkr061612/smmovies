// Ads integration: Adsterra-style popunder + banner/native scripts,
// plus a direct smartlink used on click. Each button is capped to
// at most MAX_PER_KEY smartlink opens per session to avoid annoying users.

import { useEffect, useRef } from "react";

export const SMARTLINK_URL = "https://omg10.com/4/11112237";
const MAX_PER_KEY = 3;

const POPUNDER_SRC = "https://al5sm.com/tag.min.js";
const POPUNDER_ZONE = "11198492";
const BANNER_SRC = "https://al5sm.com/tag.min.js";
const BANNER_ZONE = "11198492";

// Per-button click counter (session-scoped, in-memory).
const clickCounts = new Map<string, number>();
// Global throttle: at most one smartlink open per N ms across the page.
let lastOpenAt = 0;
const GLOBAL_COOLDOWN_MS = 1500;

function injectScriptOnce(id: string, src: string, zone: string) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.dataset.zone = zone;
  s.src = src;
  document.body.appendChild(s);
}

// Inject popunder + banner/native loader scripts once on first mount.
function useInjectAds() {
  useEffect(() => {
    injectScriptOnce("ads-popunder", POPUNDER_SRC, POPUNDER_ZONE);
    injectScriptOnce("ads-banner", BANNER_SRC, BANNER_ZONE);
  }, []);
}

export function PopunderLoader() {
  useInjectAds();
  return null;
}

// Renders a banner placeholder. The injected nap5k tag script
// auto-fills banner/native slots on the page.
function AdSlot({ className, minHeight }: { className?: string; minHeight: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useInjectAds();
  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight, display: "flex", justifyContent: "center", alignItems: "center" }}
      data-ad-zone={BANNER_ZONE}
    />
  );
}

export function Banner320x50({ className }: { className?: string }) {
  return <AdSlot className={className} minHeight={50} />;
}

export function Banner160x600({ className }: { className?: string }) {
  return <AdSlot className={className} minHeight={600} />;
}

export function NativeBanner({ className }: { className?: string }) {
  return <AdSlot className={className} minHeight={120} />;
}

// Open the smartlink, but at most MAX_PER_KEY times per button key
// per session, and respect a short global cooldown.
export function openSmartlink(key: string = "__global__") {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastOpenAt < GLOBAL_COOLDOWN_MS) return;

  const count = clickCounts.get(key) || 0;
  if (count >= MAX_PER_KEY) return;
  clickCounts.set(key, count + 1);
  lastOpenAt = now;

  try {
    window.open(SMARTLINK_URL, "_blank", "noopener,noreferrer");
  } catch {
    /* noop */
  }
}

// Backwards-compatible alias for the old component name.
export function AdsterraBanner({ className }: { adKey?: string; width?: number; height?: number; className?: string }) {
  return <AdSlot className={className} minHeight={90} />;
}
