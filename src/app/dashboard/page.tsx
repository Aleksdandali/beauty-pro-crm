export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-400">Welcome back! Here's your salon overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">👥</div>
            <div className="text-emerald-500 text-xs font-medium">+12%</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mb-1">248</div>
          <div className="text-sm text-zinc-400">Total Clients</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">📅</div>
            <div className="text-blue-400 text-xs font-medium">Today</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mb-1">12</div>
          <div className="text-sm text-zinc-400">Appointments</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">💰</div>
            <div className="text-emerald-500 text-xs font-medium">+8%</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mb-1">₴45,800</div>
          <div className="text-sm text-zinc-400">Revenue</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">📦</div>
            <div className="text-orange-400 text-xs font-medium">Low Stock</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mb-1">89</div>
          <div className="text-sm text-zinc-400">Products</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <h2 className="text-base font-semibold text-zinc-100 mb-4">
            Today's Appointments
          </h2>
          <div className="space-y-3">
            {[
              { time: '10:00', client: 'Anna Petrenko', service: 'Classic Manicure', master: 'Olena', status: 'confirmed' },
              { time: '12:00', client: 'Maria Kovalenko', service: 'Pedicure', master: 'Olena', status: 'pending' },
              { time: '14:30', client: 'Iryna Sydorenko', service: '2D Lash Extensions', master: 'Svitlana', status: 'confirmed' },
              { time: '16:00', client: 'Oksana Bondarenko', service: 'Haircut', master: 'Natalia', status: 'completed' },
            ].map((appt, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-950 border border-zinc-800 rounded-md">
                <div className="text-sm font-semibold text-zinc-300 w-14">
                  {appt.time}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-zinc-100 text-sm">{appt.client}</div>
                  <div className="text-xs text-zinc-400">{appt.service}</div>
                  <div className="text-xs text-zinc-500">Master: {appt.master}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-md ${
                  appt.status === 'completed' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900' :
                  appt.status === 'confirmed' ? 'bg-blue-950/50 text-blue-400 border border-blue-900' :
                  'bg-yellow-950/50 text-yellow-400 border border-yellow-900'
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <h2 className="text-base font-semibold text-zinc-100 mb-4">
            Recent Clients
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Anna Petrenko', phone: '+380 67 111 2233', visits: 15, discount: '10%', vip: true },
              { name: 'Maria Kovalenko', phone: '+380 67 222 3344', visits: 8, discount: '5%', vip: false },
              { name: 'Iryna Sydorenko', phone: '+380 67 333 4455', visits: 23, discount: '15%', vip: true },
              { name: 'Oksana Bondarenko', phone: '+380 67 444 5566', visits: 3, discount: '0%', vip: false },
            ].map((client, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-950 border border-zinc-800 rounded-md">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-md flex items-center justify-center text-white font-semibold text-sm">
                  {client.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-zinc-100 text-sm">{client.name}</div>
                    {client.vip && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-950/50 text-yellow-400 border border-yellow-900 rounded-md">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500">{client.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-zinc-200">{client.visits} visits</div>
                  <div className="text-xs text-emerald-500">Discount: {client.discount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Services */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <h2 className="text-base font-semibold text-zinc-100 mb-4">
            Popular Services
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Classic Manicure', price: '₴450', duration: '90 min', bookings: 45 },
              { name: 'Classic Pedicure', price: '₴550', duration: '120 min', bookings: 38 },
              { name: '2D-3D Lash Extensions', price: '₴900', duration: '150 min', bookings: 32 },
              { name: 'Haircut', price: '₴350', duration: '60 min', bookings: 28 },
            ].map((service, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-950 border border-zinc-800 rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-zinc-100 text-sm">{service.name}</div>
                  <div className="text-xs text-zinc-500">{service.duration}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-zinc-100">{service.price}</div>
                  <div className="text-xs text-zinc-500">{service.bookings} bookings</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <h2 className="text-base font-semibold text-zinc-100 mb-4">
            Inventory Status
          </h2>
          <div className="space-y-3">
            {[
              { brand: 'GETLOUD', item: 'Base 30ml', stock: 15, min: 5, status: 'ok' },
              { brand: 'GETLOUD', item: 'Top 30ml', stock: 12, min: 5, status: 'ok' },
              { brand: 'GETLOUD', item: 'Gel Polish Red #45', stock: 3, min: 3, status: 'low' },
              { brand: 'DEZIK', item: 'Disinfectant 1L', stock: 2, min: 2, status: 'critical' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-950 border border-zinc-800 rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-zinc-100 text-sm">{item.item}</div>
                  <div className="text-xs text-zinc-500">{item.brand}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    item.status === 'critical' ? 'text-red-400' :
                    item.status === 'low' ? 'text-orange-400' :
                    'text-emerald-500'
                  }`}>
                    {item.stock} pcs
                  </div>
                  <div className="text-xs text-zinc-500">Min: {item.min}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
