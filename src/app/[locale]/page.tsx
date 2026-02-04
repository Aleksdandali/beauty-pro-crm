export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-zinc-50">
      <div className="text-center p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-black mb-4">
            Beauty Pro CRM
          </h1>
          <div className="h-1 w-32 bg-black mx-auto"></div>
        </div>
        
        <p className="text-2xl text-zinc-600 mb-8">
          ✨ Система працює! ✨
        </p>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-xs text-zinc-500">Локаль</div>
            <div className="font-semibold">{locale}</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl mb-2">🗄️</div>
            <div className="text-xs text-zinc-500">База даних</div>
            <div className="font-semibold text-green-600">Готова</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-xs text-zinc-500">Хостинг</div>
            <div className="font-semibold">Vercel</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <a 
            href={`/${locale}/auth/signin`}
            className="block px-8 py-4 bg-black text-white rounded-lg hover:bg-zinc-800 transition-all hover:scale-105"
          >
            Увійти в Систему
          </a>
          
          <p className="text-xs text-zinc-400">
            Локалізація: UK/EN • База: Supabase • Framework: Next.js 14
          </p>
        </div>
      </div>
    </div>
  );
}
