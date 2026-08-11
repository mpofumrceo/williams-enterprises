"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-navy">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-600">
          {error.message || "We could not load this page."}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-amber-600 px-6 py-2.5 font-semibold text-white hover:bg-amber-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
