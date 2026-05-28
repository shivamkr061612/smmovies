export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-white/5">
      <div className="relative aspect-[2/3] animate-pulse bg-gradient-to-br from-slate-800 to-slate-900" />
      <div className="space-y-2 p-3 sm:p-3.5">
        <div className="h-3.5 w-full animate-pulse rounded bg-slate-800" />
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-800" />
      </div>
    </div>
  );
}
