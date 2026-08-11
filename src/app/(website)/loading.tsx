export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A2540]">

      <div className="text-center">

        <div className="mx-auto h-20 w-20 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />

        <h2 className="mt-6 text-2xl font-bold text-white">
          Loading...
        </h2>

      </div>

    </div>
  );
}