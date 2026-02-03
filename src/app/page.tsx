export default function HomePage() {
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
          <p>🗄️ Database ready for expansion</p>
          <p>🚀 Run: <code className="bg-zinc-100 px-2 py-1 rounded">npm run db:expand</code></p>
        </div>
      </div>
    </div>
  );
}
