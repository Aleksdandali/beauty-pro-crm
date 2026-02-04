export default function DashboardPage() {
  return (
    <div>
      {/* Header - Hidden on Mobile (shown in tabs) */}
      <div className="mb-6 md:mb-8 hidden md:block">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
          Overview
        </h1>
        <p className="text-sm text-zinc-500">Welcome back! Here's your salon performance</p>
      </div>

      {/* Mobile Title */}
      <div className="mb-6 md:hidden">
        <h1 className="text-xl font-bold text-black tracking-tight">
          Beauty Pro CRM
        </h1>
        <p className="text-sm text-zinc-600 mt-1">Демонстрація системи управління салоном</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs md:text-sm font-medium text-zinc-500">Total Revenue</div>
            <span className="text-emerald-600 text-xs font-medium">+8%</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">₴ 45,800</div>
          <div className="text-xs text-zinc-500">Last 30 days</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs md:text-sm font-medium text-zinc-500">Active Clients</div>
            <span className="text-emerald-600 text-xs font-medium">+12%</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">248</div>
          <div className="text-xs text-zinc-500">Registered users</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs md:text-sm font-medium text-zinc-500">Appointments</div>
            <span className="text-blue-600 text-xs font-medium">Today</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">12</div>
          <div className="text-xs text-zinc-500">This month</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Today's Schedule */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold text-zinc-900 mb-4">
            Today's Schedule
          </h2>
          <div className="space-y-2 md:space-y-3">
            {[
              { time: '10:00', client: 'Anna Petrenko', service: 'Classic Manicure', status: 'confirmed' },
              { time: '12:00', client: 'Maria Kovalenko', service: 'Pedicure', status: 'pending' },
              { time: '14:30', client: 'Iryna Sydorenko', service: '2D Lash Extensions', status: 'confirmed' },
            ].map((appt, i) => (
              <div key={i} className="flex items-center gap-3 md:gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div className="text-xs md:text-sm font-semibold text-zinc-900 w-12 md:w-14">
                  {appt.time}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 text-xs md:text-sm truncate">{appt.client}</div>
                  <div className="text-xs text-zinc-500 truncate">{appt.service}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap ${
                  appt.status === 'confirmed' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {appt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold text-zinc-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-2 md:space-y-3">
            {[
              { name: 'Anna Petrenko', action: 'Appointment booked', time: '10 min ago' },
              { name: 'Maria Kovalenko', action: 'Payment received', time: '1 hour ago' },
              { name: 'Iryna Sydorenko', action: 'Profile updated', time: '2 hours ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 md:gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {activity.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 text-xs md:text-sm truncate">{activity.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{activity.action}</div>
                </div>
                <div className="text-xs text-zinc-400 whitespace-nowrap">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alert - More important on mobile, shows first on smaller screens */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm lg:col-start-1">
          <h2 className="text-sm md:text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <span>📦</span> Стан Інвентарю
          </h2>
          <div className="space-y-2 md:space-y-3">
            {[
              { brand: 'GETLOUD', item: 'База 30ml', stock: 15, min: 5, status: 'ok' },
              { brand: 'GETLOUD', item: 'Топ 30ml', stock: 12, min: 5, status: 'ok' },
              { brand: 'GETLOUD', item: 'Гель-лак Red #45', stock: 3, min: 3, status: 'low' },
              { brand: 'DEZIK', item: 'Дезінфектор 1L', stock: 2, min: 2, status: 'critical' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 md:gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 text-xs md:text-sm truncate">{item.item}</div>
                  <div className="text-xs text-zinc-500">{item.brand}</div>
                </div>
                <div className={`text-sm md:text-base font-bold whitespace-nowrap ${
                  item.status === 'critical' ? 'text-red-600' : 
                  item.status === 'low' ? 'text-orange-600' :
                  'text-emerald-600'
                }`}>
                  {item.stock} шт
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
