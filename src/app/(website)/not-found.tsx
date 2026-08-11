import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A2540] px-6 text-center">

      <h1 className="text-8xl font-bold text-amber-500">
        404
      </h1>

      <h2 className="mt-4 text-4xl font-bold text-white">
        Page Not Found
      </h2>

      <p className="mt-4 text-slate-300">
        The page you are looking for does not exist.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-xl bg-amber-600 px-8 py-4 text-white"
      >
        Return Home
      </Link>

    </div>
  );
}