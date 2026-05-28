import { useEffect, useRef } from "react";

export const SMARTLINK_URL =
  "https://www.effectivecpmnetwork.com/iu0wu48z9?key=f87c4cb3748f529d8c3d393cb2559874";

const NATIVE_BANNER_SRC =
  "https://pl29571563.effectivecpmnetwork.com/f37266488c33c6ae8a2a7638bf35a76a/invoke.js";
const NATIVE_BANNER_ID = "container-f37266488c33c6ae8a2a7638bf35a76a";

const POPUNDER_SRC =
  "https://pl29571561.effectivecpmnetwork.com/b0/26/cd/b026cdd717a2a0e37439f6b873d4cac1.js";

/**
 * Adsterra "highperformanceformat" banner.
 * Rendered inside an isolated iframe (srcDoc) so multiple banners with
 * different keys can coexist without atOptions colliding.
 */
export function AdsterraBanner({
  adKey,
  width,
  height,
  className,
}: {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body><script type="text/javascript">atOptions = {'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};</script><script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script></body></html>`;
  return (
    <div
      className={className}
      style={{ display: "flex", justifyContent: "center" }}
    >
      <iframe
        title="ad"
        srcDoc={html}
        width={width}
        height={height}
        style={{ border: 0, display: "block", background: "transparent" }}
        scrolling="no"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      />
    </div>
  );
}

export function Banner320x50({ className }: { className?: string }) {
  return (
    <AdsterraBanner
      adKey="15fa0fe45f9cc9ef78bc0647e4cab407"
      width={320}
      height={50}
      className={className}
    />
  );
}

export function Banner160x600({ className }: { className?: string }) {
  return (
    <AdsterraBanner
      adKey="2645e15fabb610a245883c44a55e7267"
      width={160}
      height={600}
      className={className}
    />
  );
}

/** Native banner (effectivecpmnetwork). Loads the script once into a container. */
export function NativeBanner({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Avoid duplicating the script if it's already on the page.
    if (!document.querySelector(`script[src="${NATIVE_BANNER_SRC}"]`)) {
      const s = document.createElement("script");
      s.async = true;
      s.setAttribute("data-cfasync", "false");
      s.src = NATIVE_BANNER_SRC;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div ref={ref} className={className}>
      <div id={NATIVE_BANNER_ID} />
    </div>
  );
}

/** Mount once at app root to enable popunder ads globally. */
export function PopunderLoader() {
  useEffect(() => {
    if (document.querySelector(`script[src="${POPUNDER_SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = POPUNDER_SRC;
    document.body.appendChild(s);
  }, []);
  return null;
}

/**
 * Fire a smartlink popup. Call from any download/CTA button click.
 * Capped at MAX_SMARTLINK_OPENS per visitor (tracked in localStorage) —
 * after the cap is reached, clicks proceed normally without redirecting.
 */
const SMARTLINK_COUNT_KEY = "md_smartlink_opens_v1";
const MAX_SMARTLINK_OPENS = 2;

export function openSmartlink() {
  try {
    const raw = localStorage.getItem(SMARTLINK_COUNT_KEY);
    const count = raw ? parseInt(raw, 10) || 0 : 0;
    if (count >= MAX_SMARTLINK_OPENS) return;
    localStorage.setItem(SMARTLINK_COUNT_KEY, String(count + 1));
    window.open(SMARTLINK_URL, "_blank", "noopener,noreferrer");
  } catch {
    /* popup blocked or storage unavailable — ignore */
  }
}