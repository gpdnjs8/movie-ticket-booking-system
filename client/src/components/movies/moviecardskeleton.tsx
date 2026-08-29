function MovieCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="aspect-[2/3] animate-pulse bg-surface2" />
      <div className="space-y-2 px-3 py-3">
        <div className="h-3 w-4/5 animate-pulse rounded bg-surface2" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface2" />
      </div>
    </div>
  );
}

export default MovieCardSkeleton;
