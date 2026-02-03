export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">
          Beauty Pro CRM
        </h1>
        <p className="text-xl text-zinc-600 mb-8">
          ✨ System is working! ✨
        </p>
        <div className="space-y-2 text-sm text-zinc-500">
          <p>🌍 Locale: {locale}</p>
          <p>🗄️ Database: Ready</p>
          <p>🚀 Production: Vercel</p>
        </div>
        <div className="mt-8">
          <a 
            href={`/${locale}/auth/signin`}
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
