"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6 text-center">
        <h1 className="text-2xl font-bold text-navy">Something went wrong</h1>
        <p className="mt-2 max-w-md text-slate-600">
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
