import Link from "next/link";

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Logo */}
      <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-3xl mb-8">
        <span className="text-4xl">💅</span>
      </div>

      {/* Title */}
      <h1 className="text-6xl md:text-7xl font-bold text-black mb-6 tracking-tight text-center">
        Beauty Pro CRM
      </h1>

      {/* Slogan */}
      <p className="text-xl md:text-2xl text-zinc-500 mb-12 text-center max-w-md">
        Control your beauty business
      </p>

      {/* CTA Button */}
      <Link
        href="/login"
        className="px-10 py-4 bg-black text-white text-lg font-medium rounded-full hover:bg-zinc-800 transition-all duration-200 hover:scale-105 shadow-lg"
      >
        Open System
      </Link>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-sm text-zinc-400">
          © 2026 Beauty Pro CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
