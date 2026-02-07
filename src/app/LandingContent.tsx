'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  FlaskConical,
  Calculator,
  Package,
  Globe,
  Smartphone,
  BarChart3,
  CalendarCheck,
  Check,
  Minus,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Star,
  ArrowRight,
  Mail,
  ExternalLink,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE — Shine Beauty CRM
   Dark-only, CSS animations, no Framer Motion
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Features ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Shield,
    title: 'Журнал стерилізації',
    desc: 'Цифровий журнал за вимогами МОЗ. QR-верифікація для клієнтів',
    span: 'col-span-1 md:col-span-2',
  },
  {
    icon: FlaskConical,
    title: 'Формула клієнта',
    desc: 'База, колір, топ, дизайн — вся історія під рукою',
    span: 'col-span-1',
  },
  {
    icon: Calculator,
    title: 'Калькулятор маржі',
    desc: 'Ціна − матеріали = прибуток. Знайте маржу кожної послуги',
    span: 'col-span-1',
  },
  {
    icon: Package,
    title: 'Автосписання складу',
    desc: 'Завершили запис — матеріали списались автоматично',
    span: 'col-span-1 md:col-span-2',
  },
  {
    icon: Globe,
    title: 'Міні-сайт майстра',
    desc: 'Портфоліо, послуги, онлайн-запис — готовий сайт для Instagram',
    span: 'col-span-1 md:col-span-2',
  },
  {
    icon: Smartphone,
    title: 'Мій день',
    desc: 'Мобільний вигляд для майстра. Свайп = завершити запис',
    span: 'col-span-1',
  },
  {
    icon: BarChart3,
    title: 'RFM Аналітика',
    desc: 'VIP, лояльні, сплячі — знайте своїх клієнтів',
    span: 'col-span-1',
  },
  {
    icon: CalendarCheck,
    title: 'Онлайн-запис',
    desc: 'Клієнт записується сам. Без дзвінків, 24/7',
    span: 'col-span-1 md:col-span-2',
  },
];

// ─── Reviews ─────────────────────────────────────────────────────────────────

const REVIEWS = [
  {
    name: 'Анна К.',
    role: 'Майстер манікюру',
    text: 'Нарешті нормальна CRM для nail-майстра! Журнал стерилізації — це просто бомба.',
    avatar: 'AK',
  },
  {
    name: 'Ольга М.',
    role: 'Власниця салону',
    text: 'Перейшли з Excel за один день. Тепер бачу маржу кожної послуги і хто з майстрів заробляє.',
    avatar: 'OM',
  },
  {
    name: 'Дарина С.',
    role: 'Бровіст',
    text: 'Клієнтки записуються самі через посилання в Instagram. Менше дзвінків — більше роботи.',
    avatar: 'ДС',
  },
];

// ─── Pricing ─────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Free',
    price: '0',
    period: 'назавжди',
    features: [
      { text: '2 майстри', included: true },
      { text: '100 клієнтів', included: true },
      { text: 'Стерилізація базова', included: true },
      { text: 'Онлайн-запис', included: true },
      { text: 'Telegram-бот', included: false },
      { text: 'Аналітика базова', included: true },
      { text: 'Міні-сайт базовий', included: true },
      { text: 'Embed Widget', included: false },
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '499',
    period: '/ міс',
    badge: 'Популярний',
    features: [
      { text: '10 майстрів', included: true },
      { text: '1 000 клієнтів', included: true },
      { text: 'Стерилізація повна + PDF', included: true },
      { text: 'Онлайн-запис', included: true },
      { text: 'Telegram-бот', included: true },
      { text: 'Аналітика повна', included: true },
      { text: 'Міні-сайт розширений', included: true },
      { text: 'Embed Widget', included: true },
    ],
    highlighted: true,
  },
  {
    name: 'Business',
    price: '1 499',
    period: '/ міс',
    features: [
      { text: 'Без обмежень майстрів', included: true },
      { text: 'Без обмежень клієнтів', included: true },
      { text: 'Стерилізація повна + PDF', included: true },
      { text: 'Онлайн-запис', included: true },
      { text: 'Telegram-бот', included: true },
      { text: 'Аналітика повна + API', included: true },
      { text: 'Міні-сайт + свій домен', included: true },
      { text: 'Embed Widget', included: true },
    ],
    highlighted: false,
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: 'Чи підходить для одного майстра?',
    a: 'Так! 80% наших користувачів — приватні майстри. Безкоштовний план ідеально підходить для старту.',
  },
  {
    q: 'Як перенести клієнтів?',
    a: 'Імпорт з Excel або Google Contacts за 2 хвилини. Ми також допоможемо з міграцією безкоштовно.',
  },
  {
    q: 'Чи потрібен журнал стерилізації?',
    a: 'Так, це вимога МОЗ України. Shine замінює паперовий журнал на цифровий з юридичною силою.',
  },
  {
    q: 'Чи працює з телефону?',
    a: 'Повністю! Створено mobile-first для роботи з iPhone та Android. Жодних обмежень.',
  },
  {
    q: 'Скільки коштує?',
    a: 'Є безкоштовний план назавжди. Pro — 499 грн/міс, менше ніж чашка кави на день.',
  },
  {
    q: 'Як почати?',
    a: 'Реєстрація за 2 хвилини, без банківської картки. Одразу отримаєте демо-дані для знайомства.',
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function LandingContent() {
  const [mobileNav, setMobileNav] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ── Scroll animations via IntersectionObserver ── */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-visible');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('[data-anim]').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMobileNav(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0f] text-white">
      {/* ── Inline styles for animations ── */}
      <style>{`
        [data-anim] {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        [data-anim].anim-visible {
          opacity: 1;
          transform: translateY(0);
        }
        [data-anim="scale"] {
          transform: scale(0.95);
        }
        [data-anim="scale"].anim-visible {
          transform: scale(1);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .hero-glow {
          animation: pulse-glow 6s ease-in-out infinite;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">Shine Beauty</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => scrollTo('features')}
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Можливості
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Тарифи
            </button>
            <button
              onClick={() => scrollTo('faq')}
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              FAQ
            </button>
          </nav>

          {/* CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Увійти
            </a>
            <a
              href="/register"
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40"
            >
              Спробувати безкоштовно
            </a>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-white md:hidden"
            aria-label="Меню"
          >
            {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNav && (
          <div className="border-t border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-xl md:hidden">
            <div className="space-y-1 px-4 py-4">
              <button
                onClick={() => scrollTo('features')}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5"
              >
                Можливості
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5"
              >
                Тарифи
              </button>
              <button
                onClick={() => scrollTo('faq')}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5"
              >
                FAQ
              </button>
              <div className="flex gap-2 pt-2">
                <a
                  href="/login"
                  className="flex-1 rounded-lg border border-white/10 py-2.5 text-center text-sm font-medium text-gray-300"
                >
                  Увійти
                </a>
                <a
                  href="/register"
                  className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 text-center text-sm font-bold text-white"
                >
                  Почати
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-16"
      >
        {/* Gradient mesh BG */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="hero-glow absolute top-[10%] left-[15%] h-[500px] w-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            }}
          />
          <div
            className="hero-glow absolute top-[30%] right-[10%] h-[400px] w-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 70%)',
              animationDelay: '2s',
            }}
          />
          <div
            className="hero-glow absolute bottom-[10%] left-[40%] h-[350px] w-[350px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
              animationDelay: '4s',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div
            data-anim
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />7 000+ майстрів вже обирають Shine
          </div>

          <h1
            data-anim
            className="text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            CRM для{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              beauty-бізнесу
            </span>
            <br />
            нового покоління
          </h1>

          <p
            data-anim
            className="mx-auto mt-5 max-w-2xl text-base text-gray-400 sm:text-lg md:text-xl"
          >
            Записи, клієнти, формули, стерилізація, фінанси — все в одному місці
          </p>

          <div
            data-anim
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <a
              href="/register"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 sm:w-auto"
            >
              Спробувати безкоштовно
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 sm:w-auto"
            >
              <ExternalLink className="h-4 w-4" />
              Демо
            </a>
          </div>

          <p data-anim className="mt-4 text-xs text-gray-500">
            Не потрібна банківська картка
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES — Bento Grid
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div data-anim className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-sm font-semibold tracking-wider text-violet-400 uppercase">
              Можливості
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Все, що потрібно beauty-бізнесу
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-400">
              Не просто календар записів. Повна система управління — від стерилізації до аналітики
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  data-anim
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 transition-all duration-300 hover:scale-[1.03] hover:border-violet-500/30 hover:bg-white/[0.06] ${f.span}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-500/0 transition-all duration-500 group-hover:bg-violet-500/10" />

                  <div className="relative z-10">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-400 transition-colors group-hover:text-violet-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1.5 text-base font-bold text-white">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-400">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SOCIAL PROOF
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div data-anim className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Нам довіряють майстри по всій Україні
            </h2>
            <p className="mt-3 text-gray-400">
              7 000+ майстрів з бази Shine Shop вже обирають наші рішення
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                data-anim
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="mb-3 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-gray-300">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-xs font-bold text-violet-300">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div data-anim className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-sm font-semibold tracking-wider text-violet-400 uppercase">
              Тарифи
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Прозорі ціни без прихованих платежів
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-400">
              Почніть безкоштовно. Оновіть коли будете готові.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 sm:items-start">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                data-anim
                className={`relative overflow-hidden rounded-2xl border p-6 transition-all sm:p-8 ${
                  plan.highlighted
                    ? 'border-violet-500/40 bg-violet-500/[0.06] shadow-lg shadow-violet-500/10'
                    : 'border-white/[0.06] bg-white/[0.03]'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {plan.badge && (
                  <span className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-bold text-white">
                    {plan.badge}
                  </span>
                )}

                <p className="text-sm font-semibold text-gray-400">{plan.name}</p>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-lg text-gray-400">₴</span>
                  <span className="ml-1 text-sm text-gray-500">{plan.period}</span>
                </div>

                <a
                  href="/register"
                  className={`mt-6 block rounded-xl py-3 text-center text-sm font-bold transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40'
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.price === '0' ? 'Почати безкоштовно' : 'Обрати план'}
                </a>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      {f.included ? (
                        <Check className="h-4 w-4 shrink-0 text-violet-400" />
                      ) : (
                        <Minus className="h-4 w-4 shrink-0 text-gray-600" />
                      )}
                      <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-white/[0.06] bg-white/[0.02] py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div data-anim className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold tracking-wider text-violet-400 uppercase">
              FAQ
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Часті запитання</h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  data-anim
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-colors hover:border-white/10"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left sm:px-6"
                    aria-expanded={isOpen}
                  >
                    <span className="pr-4 text-sm font-semibold text-white sm:text-base">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-in-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm leading-relaxed text-gray-400 sm:px-6">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* BG glow */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="hero-glow absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)',
            }}
          />
        </div>

        <div data-anim className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Готові спробувати?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-400">
            Приєднуйтесь до тисяч beauty-майстрів, які вже працюють розумніше
          </p>
          <a
            href="/register"
            className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-10 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
          >
            Створити акаунт безкоштовно
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <p className="mt-3 text-xs text-gray-500">Не потрібна банківська картка</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold">Shine Beauty CRM</span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <button
                onClick={() => scrollTo('features')}
                className="text-sm text-gray-400 hover:text-white"
              >
                Можливості
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className="text-sm text-gray-400 hover:text-white"
              >
                Тарифи
              </button>
              <button
                onClick={() => scrollTo('faq')}
                className="text-sm text-gray-400 hover:text-white"
              >
                FAQ
              </button>
            </nav>

            {/* Contact */}
            <a
              href="mailto:shinebeautycrm@gmail.com"
              className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" />
              shinebeautycrm@gmail.com
            </a>
          </div>

          <div className="mt-8 border-t border-white/[0.06] pt-8 text-center text-xs text-gray-600">
            &copy; 2026 Shine Beauty CRM. Всі права захищені.
          </div>
        </div>
      </footer>
    </div>
  );
}
