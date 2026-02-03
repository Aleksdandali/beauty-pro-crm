export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          Dashboard
        </h1>
        <p className="text-zinc-600">Welcome back! Here&apos;s your salon overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">👥</div>
            <div className="text-green-600 text-sm font-medium">+12%</div>
          </div>
          <div className="text-2xl font-bold text-black mb-1">248</div>
          <div className="text-sm text-zinc-500">Total Clients</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📅</div>
            <div className="text-blue-600 text-sm font-medium">Today</div>
          </div>
          <div className="text-2xl font-bold text-black mb-1">12</div>
          <div className="text-sm text-zinc-500">Appointments</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">💰</div>
            <div className="text-green-600 text-sm font-medium">+8%</div>
          </div>
          <div className="text-2xl font-bold text-black mb-1">$45,800</div>
          <div className="text-sm text-zinc-500">Revenue</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📦</div>
            <div className="text-orange-600 text-sm font-medium">Low Stock</div>
          </div>
          <div className="text-2xl font-bold text-black mb-1">89</div>
          <div className="text-sm text-zinc-500">Products</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
          <h2 className="text-lg font-bold text-black mb-4">
            📅 Today&apos;s Appointments
          </h2>
          <div className="space-y-3">
            {[
              { time: '10:00', client: 'Anna Petrenko', service: 'Classic Manicure', master: 'Olena', status: 'confirmed' },
              { time: '12:00', client: 'Maria Kovalenko', service: 'Pedicure', master: 'Olena', status: 'pending' },
              { time: '14:30', client: 'Iryna Sydorenko', service: '2D Lash Extensions', master: 'Svitlana', status: 'confirmed' },
              { time: '16:00', client: 'Oksana Bondarenko', service: 'Haircut', master: 'Natalia', status: 'completed' },
            ].map((appt, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
                <div className="text-sm font-semibold text-zinc-700 w-16">
                  {appt.time}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-black">{appt.client}</div>
                  <div className="text-sm text-zinc-500">{appt.service}</div>
                  <div className="text-xs text-zinc-400">Master: {appt.master}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                  appt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {appt.status === 'completed' ? 'Completed' :
                   appt.status === 'confirmed' ? 'Confirmed' :
                   'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
          <h2 className="text-lg font-bold text-black mb-4">
            👥 Recent Clients
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Anna Petrenko', phone: '+380 67 111 2233', visits: 15, discount: '10%', vip: true },
              { name: 'Maria Kovalenko', phone: '+380 67 222 3344', visits: 8, discount: '5%', vip: false },
              { name: 'Iryna Sydorenko', phone: '+380 67 333 4455', visits: 23, discount: '15%', vip: true },
              { name: 'Oksana Bondarenko', phone: '+380 67 444 5566', visits: 3, discount: '0%', vip: false },
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
                  <div className="text-sm font-medium text-black">{client.visits} visits</div>
                  <div className="text-xs text-green-600">Discount: {client.discount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Services */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
          <h2 className="text-lg font-bold text-black mb-4">
            💼 Popular Services
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Classic Manicure', price: '$45', duration: '90 min', bookings: 45 },
              { name: 'Classic Pedicure', price: '$55', duration: '120 min', bookings: 38 },
              { name: '2D-3D Lash Extensions', price: '$90', duration: '150 min', bookings: 32 },
              { name: 'Haircut', price: '$35', duration: '60 min', bookings: 28 },
            ].map((service, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-black">{service.name}</div>
                  <div className="text-sm text-zinc-500">{service.duration}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-black">{service.price}</div>
                  <div className="text-xs text-zinc-500">{service.bookings} bookings</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
          <h2 className="text-lg font-bold text-black mb-4">
            📦 Inventory Status
          </h2>
          <div className="space-y-3">
            {[
              { brand: 'GETLOUD', item: 'Base 30ml', stock: 15, min: 5, status: 'ok' },
              { brand: 'GETLOUD', item: 'Top 30ml', stock: 12, min: 5, status: 'ok' },
              { brand: 'GETLOUD', item: 'Gel Polish Red #45', stock: 3, min: 3, status: 'low' },
              { brand: 'DEZIK', item: 'Disinfectant 1L', stock: 2, min: 2, status: 'critical' },
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
                    {item.stock} pcs
                  </div>
                  <div className="text-xs text-zinc-400">Min: {item.min}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
