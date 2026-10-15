export default function Loading() {
  return (
    <main id="main" aria-busy="true" aria-label="Loading portfolio" className="flex min-h-svh flex-col items-center justify-center gap-6 px-5">
      <div className="fixed top-2 left-1/2 h-[54px] w-[calc(100%-1.5rem)] max-w-[744px] -translate-x-1/2 animate-pulse rounded-2xl border border-muted2 bg-muted" />
      <div className="h-4 w-20 animate-pulse rounded bg-muted3" />
      <div className="h-24 w-full max-w-lg animate-pulse rounded-2xl bg-muted" />
      <div className="h-24 w-full max-w-sm animate-pulse rounded-2xl bg-muted" />
      <span role="status" className="section-copy">Loading portfolio…</span>
    </main>
  );
}
