import Link from "next/link";

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center">
              <span className="text-white text-lg font-bold">💅</span>
            </div>
            <span className="text-zinc-100 font-semibold text-sm">Beauty Pro CRM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-zinc-100 mb-6 tracking-tight">
            Beauty Salon Management
            <br />
            <span className="text-emerald-500">Made Simple</span>
          </h1>
          <p className="text-lg text-zinc-400 mb-12 max-w-2xl mx-auto">
            Complete CRM system for beauty salons. Manage appointments, clients, inventory, and staff in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="border border-zinc-700 text-zinc-300 hover:bg-zinc-900 px-6 py-3 rounded-md text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-sm text-zinc-500 text-center">
            © 2026 Beauty Pro CRM. Built with Next.js 14 & Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
