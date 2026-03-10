"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p className="text-sm font-semibold text-red-400">Something went wrong</p>
      <p className="max-w-xs text-center text-xs text-zinc-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
      >
        Try again
      </button>
    </div>
  );
}
