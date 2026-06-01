import { FOOTER_AD_HTML, SITE_LOGO, SITE_NAME } from "../config/site";

export default function Footer() {
  return (
    <footer className="relative mt-12 border-t border-white/5 bg-[#000000]/60 py-6">
      <div className="mx-auto max-w-7xl px-4 text-center">
        {FOOTER_AD_HTML && (
          <div className="mb-4" dangerouslySetInnerHTML={{ __html: FOOTER_AD_HTML }} />
        )}

        <div className="flex items-center justify-center gap-2">
          {SITE_LOGO ? (
            <img src={SITE_LOGO} alt={SITE_NAME || 'logo'} className="h-8 object-contain" />
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-red-600 bg-red-950">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-500" fill="currentColor">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-sm font-black text-white">
                SM<span className="text-red-600"> Movies</span>
              </span>
            </>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Your destination for the latest movies & web series in HD, 4K quality.
        </p>
        <p className="mt-1 text-xs text-slate-600">
          © {new Date().getFullYear()} {SITE_NAME || 'MoviesDrive'}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
