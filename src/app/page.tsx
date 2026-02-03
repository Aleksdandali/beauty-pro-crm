"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [lang, setLang] = useState<"uk" | "en">("uk");

  const content = {
    uk: {
      nav: {
        signIn: "Увійти",
        getStarted: "Почати",
      },
      hero: {
        badge: "Професійне управління салоном",
        title1: "Керуйте своїм",
        title2: "Beauty салоном",
        title3: "як професіонал",
        description: "Все-в-одному CRM система для beauty салонів. Керуйте клієнтами, записами, інвентарем та персоналом в одній красивій платформі.",
        startTrial: "Почати безкоштовно",
        viewDemo: "Подивитись демо",
      },
      features: {
        title: "Все що вам потрібно",
        subtitle: "Потужні функції для ефективного ведення салону",
        items: [
          {
            icon: "👥",
            title: "Управління клієнтами",
            description: "Відстежуйте історію, вподобання та бонуси клієнтів"
          },
          {
            icon: "📅",
            title: "Записи",
            description: "Простий календар з автоматичними нагадуваннями"
          },
          {
            icon: "💼",
            title: "Послуги та ціни",
            description: "Керуйте каталогом послуг та динамічним ціноутворенням"
          },
          {
            icon: "📦",
            title: "Інвентар",
            description: "Контролюйте залишки товарів та отримуйте сповіщення"
          },
          {
            icon: "👨‍💼",
            title: "Персонал",
            description: "Керуйте графіком та ефективністю команди"
          },
          {
            icon: "📊",
            title: "Аналітика",
            description: "Аналіз в реальному часі та бізнес-звіти"
          }
        ]
      },
      cta: {
        title: "Готові почати?",
        subtitle: "Приєднуйтесь до сотень салонів, які вже використовують Beauty Pro CRM",
        button: "Почати безкоштовний період",
      },
      footer: {
        copyright: "© 2024 Beauty Pro CRM. Всі права захищені.",
      }
    },
    en: {
      nav: {
        signIn: "Sign In",
        getStarted: "Get Started",
      },
      hero: {
        badge: "Professional Salon Management",
        title1: "Manage Your",
        title2: "Beauty Salon",
        title3: "Like a Pro",
        description: "All-in-one CRM system for beauty salons. Manage clients, appointments, inventory, and staff in one beautiful platform.",
        startTrial: "Start Free Trial",
        viewDemo: "View Demo",
      },
      features: {
        title: "Everything You Need",
        subtitle: "Powerful features to run your salon efficiently",
        items: [
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
        ]
      },
      cta: {
        title: "Ready to Get Started?",
        subtitle: "Join hundreds of salons already using Beauty Pro CRM",
        button: "Start Your Free Trial",
      },
      footer: {
        copyright: "© 2024 Beauty Pro CRM. All rights reserved.",
      }
    }
  };

  const t = content[lang];

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
              {/* Language Switcher */}
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
                <button
                  onClick={() => setLang("uk")}
                  className={`px-3 py-1 text-sm font-medium rounded transition ${
                    lang === "uk"
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-600 hover:text-black"
                  }`}
                >
                  🇺🇦 UA
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1 text-sm font-medium rounded transition ${
                    lang === "en"
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-600 hover:text-black"
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
              <Link 
                href="/login"
                className="text-sm font-medium text-zinc-600 hover:text-black transition"
              >
                {t.nav.signIn}
              </Link>
              <Link 
                href="/signup"
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition"
              >
                {t.nav.getStarted}
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
            {t.hero.badge}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            {t.hero.title1} {t.hero.title2}
            <br />
            <span className="text-zinc-600">{t.hero.title3}</span>
          </h1>
          
          <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">
            {t.hero.description}
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition shadow-lg"
            >
              {t.hero.startTrial}
            </Link>
            <Link 
              href="/uk/demo"
              className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-50 transition border border-zinc-200"
            >
              {t.hero.viewDemo}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              {t.features.title}
            </h2>
            <p className="text-zinc-600">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feature, i) => (
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
            {t.cta.title}
          </h2>
          <p className="text-xl text-zinc-600 mb-8">
            {t.cta.subtitle}
          </p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition shadow-lg"
          >
            {t.cta.button}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-zinc-500">
            <p>{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
