'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ============ ANIMATION HOOK ============
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

function AnimateIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, isVisible } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

// ============ COMPONENTS ============

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(7, 7, 10, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c084fc 0%, #e879a8 100%)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Beauty Pro
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Можливості', href: '#features' },
              { label: 'Ціни', href: '#pricing' },
              { label: 'Відгуки', href: '#testimonials' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-[15px] text-white/50 hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/[0.04]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-[15px] text-white/60 hover:text-white transition-colors duration-300"
            >
              Увійти
            </Link>
            <Link
              href="/register"
              className="group relative px-5 py-2.5 text-[15px] font-medium text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
            >
              <span className="relative z-10">Спробувати безкоштовно</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)' }} />
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-500"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          background: 'rgba(7, 7, 10, 0.97)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-6">
          {[
            { label: 'Можливості', href: '#features' },
            { label: 'Ціни', href: '#pricing' },
            { label: 'Відгуки', href: '#testimonials' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-2xl text-white/70 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4 w-64">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-center py-3 text-white/60 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
              Увійти
            </Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="text-center py-3 text-white font-medium rounded-xl" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
              Спробувати безкоштовно
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[72px]" style={{ background: '#07070a' }}>
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left side - text */}
          <div className="max-w-xl">
            <AnimateIn>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[13px] text-white/50 tracking-wide">14 днів безкоштовно • Без карти</span>
              </div>
            </AnimateIn>

            <AnimateIn delay={0.1}>
              <h1 className="text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.08] font-bold tracking-[-0.03em] text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                CRM для салонів краси,{' '}
                <span className="italic" style={{ background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  яка працює
                </span>
                {' '}на вас
              </h1>
            </AnimateIn>

            <AnimateIn delay={0.2}>
              <p className="text-lg sm:text-xl text-white/40 leading-relaxed mb-10 max-w-lg">
                Керуйте записами, клієнтами та фінансами в одному місці. Автоматизуйте рутину та зосередьтесь на тому, що важливо.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                >
                  <span className="relative z-10">Почати безкоштовно</span>
                  <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)' }} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-medium text-white/60 rounded-2xl border border-white/[0.08] hover:border-white/[0.16] hover:text-white hover:bg-white/[0.03] transition-all duration-300"
                >
                  Подивитись демо
                </Link>
              </div>
            </AnimateIn>

            <AnimateIn delay={0.5}>
              <div className="flex items-center gap-6 mt-12">
                <div className="flex -space-x-2">
                  {['#c084fc', '#f472b6', '#34d399', '#fbbf24'].map((color, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#07070a] flex items-center justify-center text-[11px] font-medium text-white" style={{ background: color, opacity: 0.8 }}>
                      {['ОК', 'МС', 'АМ', 'ЛВ'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-[13px] text-white/30">500+ салонів вже з нами</p>
                </div>
              </div>
            </AnimateIn>
          </div>

          {/* Right side - Dashboard mockup */}
          <AnimateIn delay={0.2} className="hidden lg:block">
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 blur-[80px] opacity-30" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }} />

              <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)' }}>
                {/* Window bar */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 text-center text-[12px] text-white/20 tracking-wide">Beauty Pro CRM — Dashboard</div>
                </div>

                {/* Dashboard content */}
                <div className="p-5 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Виручка', value: '₴ 12,450', color: '#a855f7', change: '+18%' },
                      { label: 'Записи', value: '18', color: '#ec4899', change: '+5' },
                      { label: 'Клієнти', value: '+12', color: '#34d399', change: 'нові' },
                      { label: 'Заповненість', value: '87%', color: '#fbbf24', change: '↑ 12%' },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-xl p-3 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-[10px] text-white/30 mb-1.5">{stat.label}</p>
                        <p className="text-lg font-bold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[10px] mt-1" style={{ color: `${stat.color}88` }}>{stat.change}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="rounded-xl border border-white/[0.06] p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] text-white/30">Виручка за тиждень</p>
                      <p className="text-[11px] font-medium" style={{ color: '#a855f7' }}>₴ 87,200</p>
                    </div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                        <div key={i} className="flex-1 rounded-md transition-all" style={{ height: `${h}%`, background: `linear-gradient(to top, rgba(168,85,247,${0.2 + i * 0.08}), rgba(236,72,153,${0.3 + i * 0.08}))` }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((d, i) => (
                        <span key={i} className="text-[9px] text-white/20 flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>

                  {/* Appointments */}
                  <div className="rounded-xl border border-white/[0.06] p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-[11px] text-white/30 mb-3">Найближчі записи</p>
                    {[
                      { name: 'Марія К.', service: 'Стрижка + Фарбування', time: '10:00', master: 'Оксана' },
                      { name: 'Анна С.', service: 'Манікюр', time: '11:30', master: 'Юлія' },
                      { name: 'Олена М.', service: 'Педикюр', time: '14:00', master: 'Катерина' },
                    ].map((apt, i) => (
                      <div key={i} className={`flex items-center justify-between py-2.5 ${i < 2 ? 'border-b border-white/[0.04]' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-medium text-white" style={{ background: ['#a855f7', '#ec4899', '#6366f1'][i], opacity: 0.7 }}>
                            {apt.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-[12px] text-white/70">{apt.name}</p>
                            <p className="text-[10px] text-white/25">{apt.service} • {apt.master}</p>
                          </div>
                        </div>
                        <span className="text-[12px] font-medium text-white/40">{apt.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, transparent, #07070a)' }} />
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: 'Онлайн-запис',
      desc: 'Клієнти записуються 24/7 через ваш сайт або Telegram. Автоматичне підтвердження та синхронізація з календарем.',
      color: '#a855f7',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'База клієнтів + RFM',
      desc: 'Повна історія візитів та вподобань. RFM-сегментація допомагає зрозуміти хто ваші VIP, а хто потребує уваги.',
      color: '#ec4899',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      title: 'Аналітика',
      desc: 'Дашборд з виручкою, популярними послугами та завантаженістю майстрів. Приймайте рішення на даних.',
      color: '#6366f1',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      title: 'Фінанси',
      desc: 'Облік доходів та витрат, зарплати майстрів, комісії. Завжди знайте скільки заробляєте реально.',
      color: '#34d399',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: 'Нагадування',
      desc: 'Автоматичні нагадування через Telegram або SMS за 24 години до візиту. Менше пропущених записів.',
      color: '#f59e0b',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      title: 'Склад',
      desc: 'Облік матеріалів та косметики. Сповіщення коли товар закінчується. Контроль списання по клієнтах.',
      color: '#f472b6',
    },
  ]

  return (
    <section id="features" className="relative py-28 sm:py-36" style={{ background: '#07070a' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateIn>
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: '#a855f7' }}>Можливості</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Все для вашого салону
            </h2>
            <p className="text-lg text-white/35 max-w-xl mx-auto">Потужні інструменти, які спростять управління та допоможуть заробляти більше</p>
          </div>
        </AnimateIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <AnimateIn key={i} delay={i * 0.08}>
              <div className="group relative p-6 sm:p-7 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 h-full" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${f.color}08, transparent 70%)` }} />

                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border border-white/[0.06]" style={{ color: f.color, background: `${f.color}0a` }}>
                    {f.icon}
                  </div>
                  <h3 className="text-[17px] font-semibold text-white mb-2.5 tracking-tight">{f.title}</h3>
                  <p className="text-[15px] text-white/35 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Зареєструйтесь', desc: 'Створіть акаунт за 2 хвилини. Без карти та зобов\'язань.', time: '2 хв', color: '#a855f7' },
    { num: '02', title: 'Налаштуйте салон', desc: 'Додайте послуги, ціни та майстрів. Імпортуйте клієнтів з Excel.', time: '5 хв', color: '#ec4899' },
    { num: '03', title: 'Приймайте записи', desc: 'Готово! Клієнти записуються онлайн, а ви керуєте всім з телефону.', time: '∞', color: '#34d399' },
  ]

  return (
    <section className="relative py-28 sm:py-36" style={{ background: '#07070a' }}>
      {/* Subtle divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateIn>
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: '#ec4899' }}>Як це працює</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Почніть за 10 хвилин
            </h2>
            <p className="text-lg text-white/35">Без навчання та складних налаштувань</p>
          </div>
        </AnimateIn>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-12 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[52px] left-[16%] right-[16%] h-px" style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899, #34d399)', opacity: 0.15 }} />

          {steps.map((step, i) => (
            <AnimateIn key={i} delay={i * 0.15}>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl mb-6 border border-white/[0.08]" style={{ background: `${step.color}0a` }}>
                  <span className="text-2xl font-bold tracking-tight" style={{ color: step.color }}>{step.num}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{step.title}</h3>
                <p className="text-[15px] text-white/35 leading-relaxed mb-4">{step.desc}</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border border-white/[0.06]" style={{ color: `${step.color}cc`, background: `${step.color}08` }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {step.time}
                </span>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const plans = [
    {
      name: 'Free',
      subtitle: 'Для початку',
      price: '0',
      features: ['До 2 майстрів', 'До 100 клієнтів', 'Базовий календар', 'Email підтримка'],
      cta: 'Почати безкоштовно',
      popular: false,
      color: '#a855f7',
    },
    {
      name: 'Pro',
      subtitle: 'Для зростаючих салонів',
      price: '499',
      features: ['До 10 майстрів', 'До 1000 клієнтів', 'Telegram нагадування', 'Повна аналітика', 'RFM сегментація', 'Пріоритетна підтримка'],
      cta: 'Спробувати Pro',
      popular: true,
      color: '#ec4899',
    },
    {
      name: 'Business',
      subtitle: 'Для мережі салонів',
      price: '1499',
      features: ['Необмежено майстрів', 'Необмежено клієнтів', 'SMS нагадування', 'API інтеграції', 'Мультифіліальність', 'Персональний менеджер'],
      cta: "Зв'язатись з нами",
      popular: false,
      color: '#6366f1',
    },
  ]

  return (
    <section id="pricing" className="relative py-28 sm:py-36" style={{ background: '#07070a' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.2), transparent)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateIn>
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: '#34d399' }}>Ціни</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Прості та прозорі
            </h2>
            <p className="text-lg text-white/35">Оберіть план під розмір вашого салону</p>
          </div>
        </AnimateIn>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <AnimateIn key={i} delay={i * 0.1}>
              <div className={`relative rounded-2xl p-7 sm:p-8 border transition-all duration-500 h-full flex flex-col ${plan.popular ? 'border-white/[0.12]' : 'border-white/[0.06] hover:border-white/[0.1]'}`}
                style={{ background: plan.popular ? 'linear-gradient(145deg, rgba(236,72,153,0.06) 0%, rgba(168,85,247,0.03) 100%)' : 'rgba(255,255,255,0.02)' }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold tracking-wide text-white" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                    НАЙПОПУЛЯРНІШИЙ
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-[13px] font-medium mb-1" style={{ color: plan.color }}>{plan.subtitle}</p>
                  <h3 className="text-xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white tracking-tight">{plan.price}₴</span>
                    <span className="text-white/30 text-sm">/міс</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, fi) => (
                    <div key={fi} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${plan.color}15` }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <span className="text-[14px] text-white/45">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className={`block text-center py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'text-white hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02]'
                      : 'text-white/70 border border-white/[0.08] hover:border-white/[0.16] hover:text-white hover:bg-white/[0.03]'
                  }`}
                  style={plan.popular ? { background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' } : {}}
                >
                  {plan.cta}
                </Link>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const testimonials = [
    {
      text: 'Нарешті все в одному місці! Раніше записували в блокнот, потім Excel... Тепер все автоматизовано. Кількість пропущених записів зменшилась на 70%.',
      name: 'Олена Коваленко',
      role: 'Власниця Beauty Lab',
      initials: 'ОК',
      color: '#a855f7',
    },
    {
      text: 'Аналітика — це щось! Тепер бачу хто з майстрів приносить найбільше, які послуги популярні. За 3 місяці збільшили виручку на 40%.',
      name: 'Марина Степаненко',
      role: 'Nail Studio Kyiv',
      initials: 'МС',
      color: '#ec4899',
    },
    {
      text: 'Перейшли з іншої CRM — небо і земля. Інтерфейс інтуїтивний, команда освоїла за день. Telegram-бот для записів — це must have.',
      name: 'Андрій Мельник',
      role: 'Barbershop BLADE',
      initials: 'АМ',
      color: '#6366f1',
    },
  ]

  return (
    <section id="testimonials" className="relative py-28 sm:py-36" style={{ background: '#07070a' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateIn>
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: '#f59e0b' }}>Відгуки</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Нас обирають професіонали
            </h2>
            <p className="text-lg text-white/35">Понад 500+ салонів вже використовують Beauty Pro CRM</p>
          </div>
        </AnimateIn>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <AnimateIn key={i} delay={i * 0.1}>
              <div className="relative p-7 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all duration-500 h-full flex flex-col" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {/* Quote icon */}
                <svg className="w-8 h-8 mb-4 opacity-20" style={{ color: t.color }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <p className="text-[15px] text-white/50 leading-relaxed flex-1 mb-6">{t.text}</p>

                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold text-white" style={{ background: t.color, opacity: 0.7 }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-white/80">{t.name}</p>
                    <p className="text-[12px] text-white/30">{t.role}</p>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const questions = [
    { q: 'Чи потрібна банківська карта для реєстрації?', a: 'Ні, для безкоштовного плану карта не потрібна. Ви можете користуватися Free планом скільки завгодно і перейти на Pro коли будете готові.' },
    { q: 'Чи можна імпортувати клієнтів з Excel?', a: 'Так! Ви можете імпортувати базу клієнтів з Excel або CSV файлу. Система автоматично розпізнає колонки та запропонує маппінг полів.' },
    { q: 'Чи працює система на телефоні?', a: 'Так, Beauty Pro CRM повністю адаптована для мобільних пристроїв. Ви можете керувати салоном з будь-якого телефону чи планшету через браузер.' },
    { q: 'Як підключити Telegram-нагадування?', a: 'Підключення займає 2 хвилини: створіть бота через BotFather, введіть токен в налаштуваннях, готово. Клієнти будуть автоматично отримувати нагадування.' },
  ]

  return (
    <section className="relative py-28 sm:py-36" style={{ background: '#07070a' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(244,158,11,0.2), transparent)' }} />

      <div className="max-w-2xl mx-auto px-5 sm:px-8">
        <AnimateIn>
          <div className="text-center mb-14">
            <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: '#6366f1' }}>FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Часті питання
            </h2>
          </div>
        </AnimateIn>

        <div className="space-y-2">
          {questions.map((item, i) => (
            <AnimateIn key={i} delay={i * 0.08}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-5 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
                style={{ background: openIndex === i ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[15px] font-medium text-white/70">{item.q}</span>
                  <svg className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <div className="overflow-hidden transition-all duration-500" style={{ maxHeight: openIndex === i ? '200px' : '0', opacity: openIndex === i ? 1 : 0, marginTop: openIndex === i ? '12px' : '0' }}>
                  <p className="text-[14px] text-white/35 leading-relaxed">{item.a}</p>
                </div>
              </button>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden" style={{ background: '#07070a' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent)' }} />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-[0.08]" style={{ background: 'radial-gradient(ellipse, #a855f7 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 text-center">
        <AnimateIn>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Готові{' '}
            <span className="italic" style={{ background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              почати?
            </span>
          </h2>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <p className="text-lg text-white/35 mb-10">
            Приєднуйтесь до сотень салонів, які вже автоматизували свій бізнес
          </p>
        </AnimateIn>

        <AnimateIn delay={0.2}>
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 px-8 py-4 text-[16px] font-semibold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <span className="relative z-10">Створити акаунт безкоштовно</span>
            <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)' }} />
          </Link>
        </AnimateIn>

        <AnimateIn delay={0.3}>
          <p className="text-[13px] text-white/20 mt-6">
            Без карти • Налаштування за 10 хвилин • Скасувати можна будь-коли
          </p>
        </AnimateIn>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]" style={{ background: '#07070a' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c084fc 0%, #e879a8 100%)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <span className="text-base font-semibold text-white/80">Beauty Pro</span>
            </Link>
            <p className="text-[14px] text-white/25 leading-relaxed max-w-xs">
              CRM система для салонів краси. Автоматизуйте рутину та зосередьтесь на клієнтах.
            </p>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-white/40 tracking-[0.15em] uppercase mb-4">Продукт</p>
            <div className="space-y-2.5">
              {[
                { label: 'Можливості', href: '#features' },
                { label: 'Ціни', href: '#pricing' },
                { label: 'Відгуки', href: '#testimonials' },
              ].map((link) => (
                <a key={link.href} href={link.href} className="block text-[14px] text-white/25 hover:text-white/50 transition-colors">{link.label}</a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-white/40 tracking-[0.15em] uppercase mb-4">Контакти</p>
            <div className="space-y-2.5">
              <p className="text-[14px] text-white/25">support@beautypro.ua</p>
              <p className="text-[14px] text-white/25">+380 (44) 123-45-67</p>
              <p className="text-[14px] text-white/25">Київ, Україна</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-white/15">© 2026 Beauty Pro CRM. Всі права захищені.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[13px] text-white/15 hover:text-white/30 transition-colors">Конфіденційність</a>
            <a href="#" className="text-[13px] text-white/15 hover:text-white/30 transition-colors">Умови</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============ MAIN PAGE ============
export default function LandingPage() {
  return (
    <>
      {/* Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen" style={{ background: '#07070a', fontFamily: "'DM Sans', sans-serif", color: 'white' }}>
        <Header />
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </>
  )
}
