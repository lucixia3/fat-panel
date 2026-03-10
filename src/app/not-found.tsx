export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p className="text-4xl font-bold text-zinc-700">404</p>
      <p className="text-sm text-zinc-500">Page not found</p>
      <a href="/" className="text-xs text-brand-light hover:underline">
        Go home
      </a>
    </div>
  );
}
