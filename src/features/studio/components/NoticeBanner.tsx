import { useState } from "react";
import { NOTICE_HTML } from "../config/site";

export default function NoticeBanner() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  if (!NOTICE_HTML) return null; // render nothing unless notice provided via runtime config

  return (
    <div className="relative rounded-2xl border border-red-500/30 bg-red-950/30 p-4 pr-12 text-sm leading-relaxed text-slate-300 sm:p-5">
      <div dangerouslySetInnerHTML={{ __html: NOTICE_HTML }} />
      <button
        onClick={() => setClosed(true)}
        aria-label="Dismiss notice"
        className="absolute right-3 top-3 rounded-md p-1 text-yellow-400 transition-colors hover:bg-white/10"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
