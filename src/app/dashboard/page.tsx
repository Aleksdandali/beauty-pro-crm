export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
          Overview
        </h1>
        <p className="text-sm text-zinc-500">Welcome back! Here's your salon performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-zinc-500">Total Revenue</div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 mb-1">₴ 0.00</div>
          <div className="text-xs text-zinc-500">Last 30 days</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-zinc-500">Active Clients</div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 mb-1">0</div>
          <div className="text-xs text-zinc-500">Registered users</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-zinc-500">Appointments</div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 mb-1">0</div>
          <div className="text-xs text-zinc-500">This month</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900 mb-4">
            Today's Schedule
          </h2>
          <div className="space-y-3">
            {[
              { time: '10:00', client: 'Anna Petrenko', service: 'Classic Manicure', status: 'confirmed' },
              { time: '12:00', client: 'Maria Kovalenko', service: 'Pedicure', status: 'pending' },
              { time: '14:30', client: 'Iryna Sydorenko', service: '2D Lash Extensions', status: 'confirmed' },
            ].map((appt, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-md">
                <div className="text-sm font-semibold text-zinc-900 w-14">
                  {appt.time}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-zinc-900 text-sm">{appt.client}</div>
                  <div className="text-xs text-zinc-500">{appt.service}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-md font-medium ${
                  appt.status === 'confirmed' 
                    ? 'bg-zinc-100 text-zinc-700' 
                    : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {appt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Anna Petrenko', action: 'Appointment booked', time: '10 min ago' },
              { name: 'Maria Kovalenko', action: 'Payment received', time: '1 hour ago' },
              { name: 'Iryna Sydorenko', action: 'Profile updated', time: '2 hours ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-md">
                <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center text-white font-semibold text-sm">
                  {activity.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-zinc-900 text-sm">{activity.name}</div>
                  <div className="text-xs text-zinc-500">{activity.action}</div>
                </div>
                <div className="text-xs text-zinc-400">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900 mb-4">
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Services this week</span>
              <span className="text-sm font-semibold text-zinc-900">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">New clients</span>
              <span className="text-sm font-semibold text-zinc-900">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Average rating</span>
              <span className="text-sm font-semibold text-zinc-900">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Completion rate</span>
              <span className="text-sm font-semibold text-zinc-900">—</span>
            </div>
          </div>
        </div>

        {/* Inventory Alert */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900 mb-4">
            Inventory Alerts
          </h2>
          <div className="space-y-3">
            {[
              { brand: 'GETLOUD', item: 'Gel Polish Red #45', stock: 3, status: 'low' },
              { brand: 'DEZIK', item: 'Disinfectant 1L', stock: 2, status: 'critical' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-zinc-900 text-sm">{item.item}</div>
                  <div className="text-xs text-zinc-500">{item.brand}</div>
                </div>
                <div className={`text-sm font-semibold ${
                  item.status === 'critical' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {item.stock} left
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
