export default async function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            Beauty Pro CRM
          </h1>
          <p className="text-zinc-600">Демонстрація системи управління салоном</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">👥</div>
              <div className="text-green-600 text-sm font-medium">+12%</div>
            </div>
            <div className="text-2xl font-bold text-black mb-1">248</div>
            <div className="text-sm text-zinc-500">Клієнтів</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📅</div>
              <div className="text-blue-600 text-sm font-medium">Сьогодні</div>
            </div>
            <div className="text-2xl font-bold text-black mb-1">12</div>
            <div className="text-sm text-zinc-500">Записів</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">💰</div>
              <div className="text-green-600 text-sm font-medium">+8%</div>
            </div>
            <div className="text-2xl font-bold text-black mb-1">45,800</div>
            <div className="text-sm text-zinc-500">Дохід (грн)</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📦</div>
              <div className="text-orange-600 text-sm font-medium">Низький запас</div>
            </div>
            <div className="text-2xl font-bold text-black mb-1">89</div>
            <div className="text-sm text-zinc-500">Товарів</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
            <h2 className="text-lg font-bold text-black mb-4">
              📅 Записи на Сьогодні
            </h2>
            <div className="space-y-3">
              {[
                { time: '10:00', client: 'Анна Петренко', service: 'Манікюр класичний', master: 'Олена', status: 'confirmed' },
                { time: '12:00', client: 'Марія Коваленко', service: 'Педикюр', master: 'Олена', status: 'pending' },
                { time: '14:30', client: 'Ірина Сидоренко', service: 'Нарощування вій 2D', master: 'Світлана', status: 'confirmed' },
                { time: '16:00', client: 'Оксана Бондаренко', service: 'Стрижка жіноча', master: 'Наталія', status: 'completed' },
              ].map((appt, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
                  <div className="text-sm font-semibold text-zinc-700 w-16">
                    {appt.time}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black">{appt.client}</div>
                    <div className="text-sm text-zinc-500">{appt.service}</div>
                    <div className="text-xs text-zinc-400">Майстер: {appt.master}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                    appt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appt.status === 'completed' ? 'Завершено' :
                     appt.status === 'confirmed' ? 'Підтверджено' :
                     'Очікує'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Clients */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
            <h2 className="text-lg font-bold text-black mb-4">
              👥 Останні Клієнти
            </h2>
            <div className="space-y-3">
              {[
                { name: 'Анна Петренко', phone: '+380 67 111 2233', visits: 15, discount: '10%', vip: true },
                { name: 'Марія Коваленко', phone: '+380 67 222 3344', visits: 8, discount: '5%', vip: false },
                { name: 'Ірина Сидоренко', phone: '+380 67 333 4455', visits: 23, discount: '15%', vip: true },
                { name: 'Оксана Бондаренко', phone: '+380 67 444 5566', visits: 3, discount: '0%', vip: false },
              ].map((client, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    {client.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-black">{client.name}</div>
                      {client.vip && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-500">{client.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-black">{client.visits} візитів</div>
                    <div className="text-xs text-green-600">Знижка: {client.discount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Services */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
            <h2 className="text-lg font-bold text-black mb-4">
              💼 Популярні Послуги
            </h2>
            <div className="space-y-3">
              {[
                { name: 'Манікюр класичний', price: '450 грн', duration: '90 хв', bookings: 45 },
                { name: 'Педикюр класичний', price: '550 грн', duration: '120 хв', bookings: 38 },
                { name: 'Нарощування вій 2D-3D', price: '900 грн', duration: '150 хв', bookings: 32 },
                { name: 'Стрижка жіноча', price: '350 грн', duration: '60 хв', bookings: 28 },
              ].map((service, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-black">{service.name}</div>
                    <div className="text-sm text-zinc-500">{service.duration}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-black">{service.price}</div>
                    <div className="text-xs text-zinc-500">{service.bookings} записів</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
            <h2 className="text-lg font-bold text-black mb-4">
              📦 Стан Інвентарю
            </h2>
            <div className="space-y-3">
              {[
                { brand: 'GETLOUD', item: 'База 30ml', stock: 15, min: 5, status: 'ok' },
                { brand: 'GETLOUD', item: 'Топ 30ml', stock: 12, min: 5, status: 'ok' },
                { brand: 'GETLOUD', item: 'Гель-лак Red #45', stock: 3, min: 3, status: 'low' },
                { brand: 'DEZIK', item: 'Дезінфектор 1L', stock: 2, min: 2, status: 'critical' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-black">{item.item}</div>
                    <div className="text-sm text-zinc-500">{item.brand}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      item.status === 'critical' ? 'text-red-600' :
                      item.status === 'low' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {item.stock} шт
                    </div>
                    <div className="text-xs text-zinc-400">Мін: {item.min}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-zinc-200 text-center">
          <p className="text-sm text-zinc-600 mb-2">
            🎨 <strong>Beauty Pro CRM</strong> - Професійна система управління салоном краси
          </p>
          <p className="text-xs text-zinc-400">
            Next.js 16 • Supabase • TypeScript • Tailwind CSS • Multi-tenant Architecture
          </p>
        </div>
      </div>
    </div>
  );
}
