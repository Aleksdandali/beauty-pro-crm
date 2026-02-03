import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-xl">💅</span>
              </div>
              <span className="text-xl font-bold text-black">Beauty Pro CRM</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-sm font-medium text-zinc-600 hover:text-black transition"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-sm text-zinc-600 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Professional Salon Management
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Manage Your Beauty Salon
            <br />
            <span className="text-zinc-600">Like a Pro</span>
          </h1>
          
          <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">
            All-in-one CRM system for beauty salons. Manage clients, appointments, 
            inventory, and staff in one beautiful platform.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/uk/demo"
              className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-50 transition border border-zinc-200"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Everything You Need
            </h2>
            <p className="text-zinc-600">
              Powerful features to run your salon efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "👥",
                title: "Client Management",
                description: "Track client history, preferences, and loyalty rewards"
              },
              {
                icon: "📅",
                title: "Appointments",
                description: "Easy scheduling with calendar view and reminders"
              },
              {
                icon: "💼",
                title: "Services & Pricing",
                description: "Manage your service catalog and dynamic pricing"
              },
              {
                icon: "📦",
                title: "Inventory",
                description: "Track product stock and get low-stock alerts"
              },
              {
                icon: "👨‍💼",
                title: "Staff Management",
                description: "Manage team schedules and performance"
              },
              {
                icon: "📊",
                title: "Analytics",
                description: "Real-time insights and business reports"
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="bg-white p-6 rounded-xl border border-zinc-200 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-zinc-600 mb-8">
            Join hundreds of salons already using Beauty Pro CRM
          </p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition shadow-lg"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-zinc-500">
            <p>&copy; 2024 Beauty Pro CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
