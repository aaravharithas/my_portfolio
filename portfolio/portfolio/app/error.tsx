"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex min-h-svh px-5 flex-col items-center justify-center gap-6 text-center">
      <p className="eyebrow text-primary">A little delay</p>
      <h1 className="section-heading">The portfolio is taking a moment.</h1>
      <p className="section-copy max-w-md">The profile couldn’t be loaded. Please try again.</p>
      <button className="primary-button" onClick={reset}>Try again</button>
    </main>
  );
}
