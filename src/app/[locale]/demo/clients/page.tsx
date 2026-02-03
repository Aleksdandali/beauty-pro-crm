export default function ClientsPage() {
  const clients = [
    { 
      id: 1, 
      name: 'Анна Петренко', 
      phone: '+380 67 111 2233', 
      email: 'anna.p@gmail.com',
      visits: 15, 
      totalSpent: 12500,
      discount: 10, 
      lastVisit: '2024-02-01',
      vip: true,
      birthday: '15.05.1990',
      notes: 'VIP клієнт, любить натуральні відтінки'
    },
    { 
      id: 2, 
      name: 'Марія Коваленко', 
      phone: '+380 67 222 3344', 
      email: 'maria.k@gmail.com',
      visits: 8, 
      totalSpent: 5600,
      discount: 5, 
      lastVisit: '2024-01-28',
      vip: false,
      birthday: '22.08.1985',
      notes: 'Алергія на акрил'
    },
    { 
      id: 3, 
      name: 'Ірина Сидоренко', 
      phone: '+380 67 333 4455', 
      email: 'iryna.s@gmail.com',
      visits: 23, 
      totalSpent: 18900,
      discount: 15, 
      lastVisit: '2024-02-02',
      vip: true,
      birthday: '10.03.1995',
      notes: 'Постійний клієнт, приходить кожні 2 тижні'
    },
    { 
      id: 4, 
      name: 'Оксана Бондаренко', 
      phone: '+380 67 444 5566', 
      email: 'oksana.b@gmail.com',
      visits: 3, 
      totalSpent: 1850,
      discount: 0, 
      lastVisit: '2024-01-25',
      vip: false,
      birthday: '30.11.1988',
      notes: ''
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Клієнти</h1>
          <p className="text-sm text-zinc-600">Управління базою клієнтів</p>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition">
          + Додати Клієнта
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-zinc-200">
          <div className="text-sm text-zinc-500 mb-1">Всього клієнтів</div>
          <div className="text-2xl font-bold">248</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-zinc-200">
          <div className="text-sm text-zinc-500 mb-1">VIP клієнтів</div>
          <div className="text-2xl font-bold text-purple-600">42</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-zinc-200">
          <div className="text-sm text-zinc-500 mb-1">Нових за місяць</div>
          <div className="text-2xl font-bold text-green-600">+18</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-zinc-200">
          <div className="text-sm text-zinc-500 mb-1">Середній чек</div>
          <div className="text-2xl font-bold">980 грн</div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Клієнт</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Контакти</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Візити</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Витрачено</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Знижка</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Останній візит</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                        {client.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-black">{client.name}</div>
                          {client.vip && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-zinc-500">{client.birthday}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-black">{client.phone}</div>
                    <div className="text-sm text-zinc-500">{client.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-black">{client.visits}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-black">{client.totalSpent.toLocaleString()} грн</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-green-600">{client.discount}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-500">{client.lastVisit}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
