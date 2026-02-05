'use client'

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import Link from 'next/link'

// ============ TRANSLATIONS ============
const translations = {
  ua: {
    nav: { features: 'Можливості', pricing: 'Ціни', testimonials: 'Відгуки', compare: 'Порівняння', login: 'Увійти', cta: 'Спробувати безкоштовно' },
    hero: {
      badge: '14 днів безкоштовно • Без карти',
      title1: 'CRM для салонів краси,',
      titleHighlight: 'яка працює',
      title2: 'на вас',
      subtitle: 'Керуйте записами, клієнтами та фінансами в одному місці. Автоматизуйте рутину та зосередьтесь на тому, що важливо.',
      ctaPrimary: 'Почати безкоштовно',
      ctaSecondary: 'Подивитись демо',
      social: '500+ салонів вже з нами',
    },
    dashboard: {
      title: 'Beauty Pro CRM — Dashboard',
      revenue: 'Виручка', appointments: 'Записи', clients: 'Клієнти', occupancy: 'Заповненість',
      revenueWeek: 'Виручка за тиждень', upcoming: 'Найближчі записи',
      days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'], newClients: 'нові',
    },
    stats: {
      label: 'В цифрах', title: 'Нам довіряють', subtitle: 'Щодня ми допомагаємо салонам працювати ефективніше',
      salons: 'Активних салонів', bookings: 'Записів на місяць', satisfaction: 'Задоволених клієнтів', saved: 'Годин зекономлено',
    },
    features: {
      label: 'Можливості', title: 'Все для вашого салону', subtitle: 'Потужні інструменти, які спростять управління та допоможуть заробляти більше',
      items: [
        { title: 'Онлайн-запис', desc: 'Клієнти записуються 24/7 через ваш сайт або Telegram. Автоматичне підтвердження та синхронізація з календарем.' },
        { title: 'База клієнтів + RFM', desc: 'Повна історія візитів та вподобань. RFM-сегментація допомагає зрозуміти хто ваші VIP, а хто потребує уваги.' },
        { title: 'Аналітика', desc: 'Дашборд з виручкою, популярними послугами та завантаженістю майстрів. Приймайте рішення на даних.' },
        { title: 'Фінанси', desc: 'Облік доходів та витрат, зарплати майстрів, комісії. Завжди знайте скільки заробляєте реально.' },
        { title: 'Нагадування', desc: 'Автоматичні нагадування через Telegram або SMS за 24 години до візиту. Менше пропущених записів.' },
        { title: 'Склад', desc: 'Облік матеріалів та косметики. Сповіщення коли товар закінчується. Контроль списання по клієнтах.' },
      ],
    },
    howItWorks: {
      label: 'Як це працює', title: 'Почніть за 10 хвилин', subtitle: 'Без навчання та складних налаштувань',
      steps: [
        { num: '01', title: 'Зареєструйтесь', desc: 'Створіть акаунт за 2 хвилини. Без карти та зобов\'язань.', time: '2 хв' },
        { num: '02', title: 'Налаштуйте салон', desc: 'Додайте послуги, ціни та майстрів. Імпортуйте клієнтів з Excel.', time: '5 хв' },
        { num: '03', title: 'Приймайте записи', desc: 'Готово! Клієнти записуються онлайн, а ви керуєте всім з телефону.', time: '∞' },
      ],
    },
    pricing: {
      label: 'Ціни', title: 'Прості та прозорі', subtitle: 'Оберіть план під розмір вашого салону', month: '/міс', popular: 'НАЙПОПУЛЯРНІШИЙ',
      plans: [
        { name: 'Free', subtitle: 'Для початку', price: '0', features: ['До 2 майстрів', 'До 100 клієнтів', 'Базовий календар', 'Email підтримка'], cta: 'Почати безкоштовно' },
        { name: 'Pro', subtitle: 'Для зростаючих салонів', price: '499', features: ['До 10 майстрів', 'До 1000 клієнтів', 'Telegram нагадування', 'Повна аналітика', 'RFM сегментація', 'Пріоритетна підтримка'], cta: 'Спробувати Pro' },
        { name: 'Business', subtitle: 'Для мережі салонів', price: '1499', features: ['Необмежено майстрів', 'Необмежено клієнтів', 'SMS нагадування', 'API інтеграції', 'Мультифіліальність', 'Персональний менеджер'], cta: "Зв'язатись з нами" },
      ],
    },
    compare: {
      label: 'Порівняння', title: 'Чому Beauty Pro?', subtitle: 'Порівняйте нас з іншими CRM для салонів',
      feature: 'Функція', us: 'Beauty Pro', competitors: ['CRM A', 'CRM B'],
      headers: ['Онлайн-запис 24/7', 'Telegram-бот', 'RFM-аналітика', 'Склад матеріалів', 'Мобільна версія', 'Українська мова', 'Безкоштовний план', 'API інтеграції'],
    },
    testimonials: {
      label: 'Відгуки', title: 'Нас обирають професіонали', subtitle: 'Понад 500+ салонів вже використовують Beauty Pro CRM',
      items: [
        { text: 'Нарешті все в одному місці! Раніше записували в блокнот, потім Excel... Тепер все автоматизовано. Кількість пропущених записів зменшилась на 70%.', name: 'Олена Коваленко', role: 'Власниця Beauty Lab' },
        { text: 'Аналітика — це щось! Тепер бачу хто з майстрів приносить найбільше, які послуги популярні. За 3 місяці збільшили виручку на 40%.', name: 'Марина Степаненко', role: 'Nail Studio Kyiv' },
        { text: 'Перейшли з іншої CRM — небо і земля. Інтерфейс інтуїтивний, команда освоїла за день. Telegram-бот для записів — це must have.', name: 'Андрій Мельник', role: 'Barbershop BLADE' },
      ],
    },
    faq: {
      label: 'FAQ', title: 'Часті питання',
      items: [
        { q: 'Чи потрібна банківська карта для реєстрації?', a: 'Ні, для безкоштовного плану карта не потрібна. Ви можете користуватися Free планом скільки завгодно і перейти на Pro коли будете готові.' },
        { q: 'Чи можна імпортувати клієнтів з Excel?', a: 'Так! Ви можете імпортувати базу клієнтів з Excel або CSV файлу. Система автоматично розпізнає колонки та запропонує маппінг полів.' },
        { q: 'Чи працює система на телефоні?', a: 'Так, Beauty Pro CRM повністю адаптована для мобільних пристроїв. Ви можете керувати салоном з будь-якого телефону чи планшету через браузер.' },
        { q: 'Як підключити Telegram-нагадування?', a: 'Підключення займає 2 хвилини: створіть бота через BotFather, введіть токен в налаштуваннях, готово.' },
      ],
    },
    ctaSection: {
      title1: 'Готові', titleHighlight: 'почати?', subtitle: 'Приєднуйтесь до сотень салонів, які вже автоматизували свій бізнес',
      cta: 'Створити акаунт безкоштовно', note: 'Без карти • Налаштування за 10 хвилин • Скасувати можна будь-коли',
    },
    footer: {
      desc: 'CRM система для салонів краси. Автоматизуйте рутину та зосередьтесь на клієнтах.',
      product: 'Продукт', contacts: 'Контакти', rights: '© 2026 Beauty Pro CRM. Всі права захищені.', privacy: 'Конфіденційність', terms: 'Умови',
    },
  },
  en: {
    nav: { features: 'Features', pricing: 'Pricing', testimonials: 'Reviews', compare: 'Compare', login: 'Sign in', cta: 'Try for free' },
    hero: {
      badge: '14 days free • No card required',
      title1: 'CRM for beauty salons',
      titleHighlight: 'that works',
      title2: 'for you',
      subtitle: 'Manage appointments, clients and finances in one place. Automate routine and focus on what matters.',
      ctaPrimary: 'Start for free',
      ctaSecondary: 'Watch demo',
      social: '500+ salons already with us',
    },
    dashboard: {
      title: 'Beauty Pro CRM — Dashboard',
      revenue: 'Revenue', appointments: 'Appointments', clients: 'Clients', occupancy: 'Occupancy',
      revenueWeek: 'Revenue this week', upcoming: 'Upcoming appointments',
      days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], newClients: 'new',
    },
    stats: {
      label: 'In numbers', title: 'Trusted by many', subtitle: 'Every day we help salons work more efficiently',
      salons: 'Active salons', bookings: 'Monthly bookings', satisfaction: 'Satisfied clients', saved: 'Hours saved',
    },
    features: {
      label: 'Features', title: 'Everything for your salon', subtitle: 'Powerful tools that simplify management and help you earn more',
      items: [
        { title: 'Online booking', desc: 'Clients book 24/7 via your website or Telegram. Auto-confirmation and calendar sync.' },
        { title: 'Client base + RFM', desc: 'Complete visit history and preferences. RFM segmentation helps identify VIPs and at-risk clients.' },
        { title: 'Analytics', desc: 'Dashboard with revenue, popular services and staff utilization. Make data-driven decisions.' },
        { title: 'Finances', desc: 'Track income, expenses, staff salaries and commissions. Always know your real earnings.' },
        { title: 'Reminders', desc: 'Automatic reminders via Telegram or SMS 24 hours before visit. Fewer no-shows.' },
        { title: 'Inventory', desc: 'Track materials and cosmetics. Alerts when stock is low. Track usage per client.' },
      ],
    },
    howItWorks: {
      label: 'How it works', title: 'Start in 10 minutes', subtitle: 'No training or complex setup needed',
      steps: [
        { num: '01', title: 'Sign up', desc: 'Create an account in 2 minutes. No card, no obligations.', time: '2 min' },
        { num: '02', title: 'Set up your salon', desc: 'Add services, prices and staff. Import clients from Excel.', time: '5 min' },
        { num: '03', title: 'Accept bookings', desc: 'Done! Clients book online, you manage everything from your phone.', time: '∞' },
      ],
    },
    pricing: {
      label: 'Pricing', title: 'Simple & transparent', subtitle: 'Choose a plan that fits your salon', month: '/mo', popular: 'MOST POPULAR',
      plans: [
        { name: 'Free', subtitle: 'To get started', price: '0', features: ['Up to 2 staff', 'Up to 100 clients', 'Basic calendar', 'Email support'], cta: 'Start for free' },
        { name: 'Pro', subtitle: 'For growing salons', price: '499', features: ['Up to 10 staff', 'Up to 1000 clients', 'Telegram reminders', 'Full analytics', 'RFM segmentation', 'Priority support'], cta: 'Try Pro' },
        { name: 'Business', subtitle: 'For salon chains', price: '1499', features: ['Unlimited staff', 'Unlimited clients', 'SMS reminders', 'API integrations', 'Multi-location', 'Personal manager'], cta: 'Contact us' },
      ],
    },
    compare: {
      label: 'Comparison', title: 'Why Beauty Pro?', subtitle: 'Compare us with other salon CRMs',
      feature: 'Feature', us: 'Beauty Pro', competitors: ['CRM A', 'CRM B'],
      headers: ['Online booking 24/7', 'Telegram bot', 'RFM analytics', 'Inventory management', 'Mobile version', 'Ukrainian language', 'Free plan', 'API integrations'],
    },
    testimonials: {
      label: 'Reviews', title: 'Chosen by professionals', subtitle: '500+ salons already use Beauty Pro CRM',
      items: [
        { text: 'Finally everything in one place! We used to write in notebooks, then Excel... Now everything is automated. No-shows decreased by 70%.', name: 'Olena Kovalenko', role: 'Owner, Beauty Lab' },
        { text: 'Analytics is amazing! Now I see which staff brings the most revenue, which services are popular. Increased revenue by 40% in 3 months.', name: 'Maryna Stepanenko', role: 'Nail Studio Kyiv' },
        { text: 'Switched from another CRM — night and day difference. Intuitive interface, team learned it in a day. Telegram bot is a must-have.', name: 'Andriy Melnyk', role: 'Barbershop BLADE' },
      ],
    },
    faq: {
      label: 'FAQ', title: 'Frequently asked questions',
      items: [
        { q: 'Do I need a credit card to sign up?', a: 'No, no card is needed for the free plan. You can use the Free plan as long as you want and upgrade to Pro when ready.' },
        { q: 'Can I import clients from Excel?', a: 'Yes! You can import your client base from Excel or CSV. The system auto-detects columns and suggests field mapping.' },
        { q: 'Does it work on mobile?', a: 'Yes, Beauty Pro CRM is fully responsive. You can manage your salon from any phone or tablet via browser.' },
        { q: 'How to set up Telegram reminders?', a: 'Setup takes 2 minutes: create a bot via BotFather, enter the token in settings, done.' },
      ],
    },
    ctaSection: {
      title1: 'Ready to', titleHighlight: 'start?', subtitle: 'Join hundreds of salons that have already automated their business',
      cta: 'Create free account', note: 'No card • Setup in 10 min • Cancel anytime',
    },
    footer: {
      desc: 'CRM system for beauty salons. Automate routine and focus on clients.',
      product: 'Product', contacts: 'Contacts', rights: '© 2026 Beauty Pro CRM. All rights reserved.', privacy: 'Privacy', terms: 'Terms',
    },
  },
}

type Lang = 'ua' | 'en'
type Theme = 'dark' | 'light'

const AppContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; theme: Theme; setTheme: (t: Theme) => void; t: typeof translations.ua }>({ lang: 'ua', setLang: () => {}, theme: 'dark', setTheme: () => {}, t: translations.ua })
function useApp() { return useContext(AppContext) }

function tc(theme: Theme) {
  return theme === 'dark' ? {
    bg: '#07070a', card: 'rgba(255,255,255,0.02)', cardH: 'rgba(255,255,255,0.04)',
    bd: 'rgba(255,255,255,0.06)', bdH: 'rgba(255,255,255,0.12)',
    tx: 'white', txM: 'rgba(255,255,255,0.40)', txS: 'rgba(255,255,255,0.25)', txF: 'rgba(255,255,255,0.15)',
    hBg: 'rgba(7,7,10,0.85)', grid: 'rgba(255,255,255,0.1)', glow: 0.07, glowBg: 'rgba(255,255,255,0.04)',
  } : {
    bg: '#fafafa', card: 'rgba(0,0,0,0.02)', cardH: 'rgba(0,0,0,0.04)',
    bd: 'rgba(0,0,0,0.08)', bdH: 'rgba(0,0,0,0.15)',
    tx: '#111', txM: 'rgba(0,0,0,0.55)', txS: 'rgba(0,0,0,0.35)', txF: 'rgba(0,0,0,0.12)',
    hBg: 'rgba(250,250,250,0.88)', grid: 'rgba(0,0,0,0.05)', glow: 0.04, glowBg: 'rgba(0,0,0,0.02)',
  }
}

// ============ HOOKS ============
function useInView(th = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: th })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [th])
  return { ref, v }
}

function useCountUp(target: number, dur = 2000) {
  const [count, setCount] = useState(0)
  const { ref, v } = useInView(0.3)
  useEffect(() => {
    if (!v) return
    const st = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - st) / dur, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [v, target, dur])
  return { ref, count }
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, v } = useInView()
  return <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(32px)', transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>{children}</div>
}

const fColors = ['#a855f7', '#ec4899', '#6366f1', '#34d399', '#f59e0b', '#f472b6']
const pColors = ['#a855f7', '#ec4899', '#6366f1']
const sColors = ['#a855f7', '#ec4899', '#34d399']
const tInit = ['ОК', 'МС', 'АМ']

// ============ HEADER ============
function Header() {
  const { t, lang, setLang, theme, setTheme } = useApp()
  const c = tc(theme)
  const [sc, setSc] = useState(false)
  const [mo, setMo] = useState(false)

  useEffect(() => { const f = () => setSc(window.scrollY > 20); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f) }, [])

  const navItems = [{ l: t.nav.features, h: '#features' }, { l: t.nav.pricing, h: '#pricing' }, { l: t.nav.compare, h: '#compare' }, { l: t.nav.testimonials, h: '#testimonials' }]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500" style={{ background: sc ? c.hBg : 'transparent', backdropFilter: sc ? 'blur(20px) saturate(1.4)' : 'none', borderBottom: `1px solid ${sc ? c.bd : 'transparent'}` }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c084fc, #e879a8)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <span className="text-lg font-semibold tracking-tight" style={{ color: c.tx, opacity: 0.9, fontFamily: "'DM Sans', sans-serif" }}>Beauty Pro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(n => <a key={n.h} href={n.h} className="px-4 py-2 text-[15px] rounded-lg transition-colors duration-300" style={{ color: c.txM }}>{n.l}</a>)}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setLang(lang === 'ua' ? 'en' : 'ua')} className="px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all" style={{ color: c.txM, borderColor: c.bd, background: c.card }}>{lang === 'ua' ? '🇺🇦 UA' : '🇬🇧 EN'}</button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg border transition-all" style={{ color: c.txM, borderColor: c.bd, background: c.card }}>
              {theme === 'dark' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
            <Link href="/login" className="px-4 py-2 text-[15px] transition-colors" style={{ color: c.txM }}>{t.nav.login}</Link>
            <Link href="/register" className="group relative px-5 py-2.5 text-[15px] font-medium text-white rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/20" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              <span className="relative z-10">{t.nav.cta}</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #9333ea, #db2777)' }}/>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setLang(lang === 'ua' ? 'en' : 'ua')} className="px-2 py-1 rounded text-[12px] font-medium" style={{ color: c.txM, background: c.card }}>{lang === 'ua' ? 'UA' : 'EN'}</button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 rounded" style={{ color: c.txM }}>
              {theme === 'dark' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
            <button className="p-2" style={{ color: c.txM }} onClick={() => setMo(!mo)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mo ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></>}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="fixed inset-0 z-40 md:hidden transition-all duration-500" style={{ opacity: mo ? 1 : 0, pointerEvents: mo ? 'auto' : 'none', background: theme === 'dark' ? 'rgba(7,7,10,0.97)' : 'rgba(250,250,250,0.97)', backdropFilter: 'blur(24px)' }}>
        <div className="flex flex-col items-center justify-center h-full gap-6">
          {navItems.map(n => <a key={n.h} href={n.h} onClick={() => setMo(false)} className="text-2xl" style={{ color: c.txM }}>{n.l}</a>)}
          <div className="flex flex-col gap-3 mt-4 w-64">
            <Link href="/login" onClick={() => setMo(false)} className="text-center py-3 border rounded-xl" style={{ color: c.txM, borderColor: c.bd }}>{t.nav.login}</Link>
            <Link href="/register" onClick={() => setMo(false)} className="text-center py-3 text-white font-medium rounded-xl" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>{t.nav.cta}</Link>
          </div>
        </div>
      </div>
    </>
  )
}

// ============ HERO ============
function Hero() {
  const { t, theme } = useApp(); const c = tc(theme)
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[72px]" style={{ background: c.bg }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full" style={{ opacity: c.glow, background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}/>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full" style={{ opacity: c.glow * 0.7, background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }}/>
        <div className="absolute inset-0" style={{ opacity: theme === 'dark' ? 0.03 : 0.02, backgroundImage: `linear-gradient(${c.grid} 1px, transparent 1px), linear-gradient(90deg, ${c.grid} 1px, transparent 1px)`, backgroundSize: '64px 64px' }}/>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="max-w-xl">
            <FadeIn><div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8" style={{ borderColor: c.bd, background: c.card }}><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[13px] tracking-wide" style={{ color: c.txM }}>{t.hero.badge}</span></div></FadeIn>
            <FadeIn delay={0.1}><h1 className="text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.08] font-bold tracking-[-0.03em] mb-6" style={{ color: c.tx, fontFamily: "'Playfair Display', serif" }}>{t.hero.title1}{' '}<span className="italic" style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.hero.titleHighlight}</span>{' '}{t.hero.title2}</h1></FadeIn>
            <FadeIn delay={0.2}><p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-lg" style={{ color: c.txM }}>{t.hero.subtitle}</p></FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="group relative inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  <span className="relative z-10">{t.hero.ctaPrimary}</span>
                  <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #9333ea, #db2777)' }}/>
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-medium rounded-2xl border transition-all" style={{ color: c.txM, borderColor: c.bd }}>{t.hero.ctaSecondary}</Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.5}>
              <div className="flex items-center gap-6 mt-12">
                <div className="flex -space-x-2">{['#c084fc','#f472b6','#34d399','#fbbf24'].map((col,i)=><div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-medium text-white" style={{background:col,opacity:0.8,borderColor:c.bg}}>{['ОК','МС','АМ','ЛВ'][i]}</div>)}</div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">{[...Array(5)].map((_,i)=><svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}</div>
                  <p className="text-[13px]" style={{ color: c.txS }}>{t.hero.social}</p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Dashboard */}
          <FadeIn delay={0.2} className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 blur-[80px] opacity-30" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}/>
              <div className="relative rounded-2xl border overflow-hidden" style={{ borderColor: c.bd, background: c.card }}>
                <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: c.bd }}>
                  <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-green-500/60"/></div>
                  <div className="flex-1 text-center text-[12px]" style={{ color: c.txF }}>{t.dashboard.title}</div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {[{l:t.dashboard.revenue,v:'₴ 12,450',col:'#a855f7',ch:'+18%'},{l:t.dashboard.appointments,v:'18',col:'#ec4899',ch:'+5'},{l:t.dashboard.clients,v:'+12',col:'#34d399',ch:t.dashboard.newClients},{l:t.dashboard.occupancy,v:'87%',col:'#fbbf24',ch:'↑ 12%'}].map((s,i)=>(
                      <div key={i} className="rounded-xl p-3 border" style={{borderColor:c.bd,background:c.card}}>
                        <p className="text-[10px] mb-1.5" style={{color:c.txS}}>{s.l}</p>
                        <p className="text-lg font-bold tracking-tight" style={{color:s.col}}>{s.v}</p>
                        <p className="text-[10px] mt-1" style={{color:`${s.col}88`}}>{s.ch}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border p-4" style={{borderColor:c.bd,background:c.card}}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px]" style={{color:c.txS}}>{t.dashboard.revenueWeek}</p>
                      <p className="text-[11px] font-medium" style={{color:'#a855f7'}}>₴ 87,200</p>
                    </div>
                    <div className="flex items-end gap-1.5 h-16">{[40,65,45,80,60,90,75].map((h,i)=><div key={i} className="flex-1 rounded-md" style={{height:`${h}%`,background:`linear-gradient(to top, rgba(168,85,247,${0.2+i*0.08}), rgba(236,72,153,${0.3+i*0.08}))`}}/>)}</div>
                    <div className="flex justify-between mt-2">{t.dashboard.days.map((d,i)=><span key={i} className="text-[9px] flex-1 text-center" style={{color:c.txF}}>{d}</span>)}</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: `linear-gradient(to bottom, transparent, ${c.bg})` }}/>
    </section>
  )
}

// ============ STATS ============
function Stats() {
  const { t, theme } = useApp(); const c = tc(theme)
  const s1=useCountUp(500,2000), s2=useCountUp(50000,2500), s3=useCountUp(98,1800), s4=useCountUp(12000,2200)
  const data = [{ref:s1.ref,cnt:s1.count,sfx:'+',lbl:t.stats.salons,col:'#a855f7'},{ref:s2.ref,cnt:s2.count,sfx:'+',lbl:t.stats.bookings,col:'#ec4899'},{ref:s3.ref,cnt:s3.count,sfx:'%',lbl:t.stats.satisfaction,col:'#34d399'},{ref:s4.ref,cnt:s4.count,sfx:'+',lbl:t.stats.saved,col:'#fbbf24'}]

  return (
    <section className="relative py-24 sm:py-32" style={{background:c.bg}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{background:`linear-gradient(90deg, transparent, #fbbf2433, transparent)`}}/>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <FadeIn><div className="text-center mb-14">
          <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{color:'#fbbf24'}}>{t.stats.label}</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] mb-5" style={{color:c.tx,fontFamily:"'Playfair Display', serif"}}>{t.stats.title}</h2>
          <p className="text-lg max-w-xl mx-auto" style={{color:c.txM}}>{t.stats.subtitle}</p>
        </div></FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.map((s,i)=><FadeIn key={i} delay={i*0.1}><div ref={s.ref} className="text-center p-6 rounded-2xl border" style={{borderColor:c.bd,background:c.card}}>
            <p className="text-4xl sm:text-5xl font-bold tracking-tight mb-2" style={{color:s.col}}>{s.cnt.toLocaleString()}{s.sfx}</p>
            <p className="text-[14px]" style={{color:c.txM}}>{s.lbl}</p>
          </div></FadeIn>)}
        </div>
      </div>
    </section>
  )
}

// ============ FEATURES ============
function Features() {
  const { t, theme } = useApp(); const c = tc(theme)
  const fIcons = [
    <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    <svg key="5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  ]

  return (
    <section id="features" className="relative py-28 sm:py-36" style={{background:c.bg}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{background:`linear-gradient(90deg, transparent, #a855f733, transparent)`}}/>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <FadeIn><div className="text-center mb-16 sm:mb-20">
          <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{color:'#a855f7'}}>{t.features.label}</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] mb-5" style={{color:c.tx,fontFamily:"'Playfair Display', serif"}}>{t.features.title}</h2>
          <p className="text-lg max-w-xl mx-auto" style={{color:c.txM}}>{t.features.subtitle}</p>
        </div></FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {t.features.items.map((f,i)=><FadeIn key={i} delay={i*0.08}>
            <div className="group relative p-6 sm:p-7 rounded-2xl border transition-all duration-500 h-full" style={{borderColor:c.bd,background:c.card}}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background:`radial-gradient(circle at 50% 0%, ${fColors[i]}08, transparent 70%)`}}/>
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border" style={{color:fColors[i],borderColor:c.bd,background:`${fColors[i]}0a`}}>{fIcons[i]}</div>
                <h3 className="text-[17px] font-semibold mb-2.5 tracking-tight" style={{color:c.tx}}>{f.title}</h3>
                <p className="text-[15px] leading-relaxed" style={{color:c.txM}}>{f.desc}</p>
              </div>
            </div>
          </FadeIn>)}
        </div>
      </div>
    </section>
  )
}

// ============ HOW IT WORKS ============
function HowItWorks() {
  const { t, theme } = useApp(); const c = tc(theme)
  return (
    <section className="relative py-28 sm:py-36" style={{background:c.bg}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{background:`linear-gradient(90deg, transparent, #ec489933, transparent)`}}/>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <FadeIn><div className="text-center mb-16 sm:mb-20">
          <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{color:'#ec4899'}}>{t.howItWorks.label}</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] mb-5" style={{color:c.tx,fontFamily:"'Playfair Display', serif"}}>{t.howItWorks.title}</h2>
          <p className="text-lg" style={{color:c.txM}}>{t.howItWorks.subtitle}</p>
        </div></FadeIn>
        <div className="grid md:grid-cols-3 gap-8 sm:gap-12 relative">
          <div className="hidden md:block absolute top-[52px] left-[16%] right-[16%] h-px" style={{background:`linear-gradient(90deg, ${sColors.join(', ')})`,opacity:0.15}}/>
          {t.howItWorks.steps.map((s,i)=><FadeIn key={i} delay={i*0.15}><div className="text-center">
            <div className="relative inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl mb-6 border" style={{borderColor:c.bd,background:`${sColors[i]}0a`}}>
              <span className="text-2xl font-bold tracking-tight" style={{color:sColors[i]}}>{s.num}</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 tracking-tight" style={{color:c.tx}}>{s.title}</h3>
            <p className="text-[15px] leading-relaxed mb-4" style={{color:c.txM}}>{s.desc}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border" style={{color:`${sColors[i]}cc`,borderColor:c.bd,background:`${sColors[i]}08`}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{s.time}
            </span>
          </div></FadeIn>)}
        </div>
      </div>
    </section>
  )
}

// ============ PRICING ============
function Pricing() {
  const { t, theme } = useApp(); const c = tc(theme)
  return (
    <section id="pricing" className="relative py-28 sm:py-36" style={{background:c.bg}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{background:`linear-gradient(90deg, transparent, #34d39933, transparent)`}}/>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <FadeIn><div className="text-center mb-16 sm:mb-20">
          <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{color:'#34d399'}}>{t.pricing.label}</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] mb-5" style={{color:c.tx,fontFamily:"'Playfair Display', serif"}}>{t.pricing.title}</h2>
          <p className="text-lg" style={{color:c.txM}}>{t.pricing.subtitle}</p>
        </div></FadeIn>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {t.pricing.plans.map((p,i)=><FadeIn key={i} delay={i*0.1}>
            <div className={`relative rounded-2xl p-7 sm:p-8 border transition-all duration-500 h-full flex flex-col`} style={{borderColor:i===1?c.bdH:c.bd,background:i===1?(theme==='dark'?'linear-gradient(145deg, rgba(236,72,153,0.06), rgba(168,85,247,0.03))':'linear-gradient(145deg, rgba(236,72,153,0.06), rgba(168,85,247,0.02))'):c.card}}>
              {i===1&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold tracking-wide text-white" style={{background:'linear-gradient(135deg, #a855f7, #ec4899)'}}>{t.pricing.popular}</div>}
              <div className="mb-6">
                <p className="text-[13px] font-medium mb-1" style={{color:pColors[i]}}>{p.subtitle}</p>
                <h3 className="text-xl font-bold mb-4" style={{color:c.tx}}>{p.name}</h3>
                <div className="flex items-baseline gap-1"><span className="text-4xl font-bold tracking-tight" style={{color:c.tx}}>{p.price}₴</span><span className="text-sm" style={{color:c.txS}}>{t.pricing.month}</span></div>
              </div>
              <div className="space-y-3 mb-8 flex-1">{p.features.map((f,fi)=><div key={fi} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{background:`${pColors[i]}15`}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={pColors[i]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div><span className="text-[14px]" style={{color:c.txM}}>{f}</span>
              </div>)}</div>
              <Link href="/register" className={`block text-center py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-300 ${i===1?'text-white hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02]':''}`} style={i===1?{background:'linear-gradient(135deg, #a855f7, #ec4899)'}:{color:c.txM,border:`1px solid ${c.bd}`}}>{p.cta}</Link>
            </div>
          </FadeIn>)}
        </div>
      </div>
    </section>
  )
}

// ============ COMPARE ============
function CompareSection() {
  const { t, theme } = useApp(); const c = tc(theme)
  const bp = [true,true,true,true,true,true,true,true]
  const cA = [true,false,false,false,true,false,false,true]
  const cB = [true,false,true,true,false,false,true,false]
  const Chk = () => <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{background:'#34d39920'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
  const Crs = () => <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{background:c.glowBg}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.txS} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>

  return (
    <section id="compare" className="relative py-28 sm:py-36" style={{background:c.bg}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{background:`linear-gradient(90deg, transparent, #6366f133, transparent)`}}/>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <FadeIn><div className="text-center mb-16">
          <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{color:'#6366f1'}}>{t.compare.label}</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] mb-5" style={{color:c.tx,fontFamily:"'Playfair Display', serif"}}>{t.compare.title}</h2>
          <p className="text-lg" style={{color:c.txM}}>{t.compare.subtitle}</p>
        </div></FadeIn>
        <FadeIn delay={0.1}>
          <div className="rounded-2xl border overflow-hidden" style={{borderColor:c.bd,background:c.card}}>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead><tr style={{borderBottom:`1px solid ${c.bd}`}}>
                  <th className="text-left p-4 font-medium" style={{color:c.txM}}>{t.compare.feature}</th>
                  <th className="p-4 font-bold text-center" style={{color:'#a855f7'}}>{t.compare.us}</th>
                  <th className="p-4 font-medium text-center" style={{color:c.txS}}>{t.compare.competitors[0]}</th>
                  <th className="p-4 font-medium text-center" style={{color:c.txS}}>{t.compare.competitors[1]}</th>
                </tr></thead>
                <tbody>{t.compare.headers.map((h,i)=><tr key={i} style={{borderBottom:i<t.compare.headers.length-1?`1px solid ${c.bd}`:'none'}}>
                  <td className="p-4" style={{color:c.txM}}>{h}</td>
                  <td className="p-4 text-center">{bp[i]?<Chk/>:<Crs/>}</td>
                  <td className="p-4 text-center">{cA[i]?<Chk/>:<Crs/>}</td>
                  <td className="p-4 text-center">{cB[i]?<Chk/>:<Crs/>}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ============ TESTIMONIALS ============
function Testimonials() {
  const { t, theme } = useApp(); const c = tc(theme)
  return (
    <section id="testimonials" className="relative py-28 sm:py-36" style={{background:c.bg}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{background:`linear-gradient(90deg, transparent, #f59e0b33, transparent)`}}/>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <FadeIn><div className="text-center mb-16 sm:mb-20">
          <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{color:'#f59e0b'}}>{t.testimonials.label}</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] mb-5" style={{color:c.tx,fontFamily:"'Playfair Display', serif"}}>{t.testimonials.title}</h2>
          <p className="text-lg" style={{color:c.txM}}>{t.testimonials.subtitle}</p>
        </div></FadeIn>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {t.testimonials.items.map((item,i)=><FadeIn key={i} delay={i*0.1}>
            <div className="relative p-7 rounded-2xl border transition-all duration-500 h-full flex flex-col" style={{borderColor:c.bd,background:c.card}}>
              <svg className="w-8 h-8 mb-4 opacity-20" style={{color:fColors[i]}} viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
              <p className="text-[15px] leading-relaxed flex-1 mb-6" style={{color:c.txM}}>{item.text}</p>
              <div className="flex items-center gap-3 pt-5" style={{borderTop:`1px solid ${c.bd}`}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold text-white" style={{background:fColors[i],opacity:0.7}}>{tInit[i]}</div>
                <div><p className="text-[14px] font-medium" style={{color:c.tx,opacity:0.8}}>{item.name}</p><p className="text-[12px]" style={{color:c.txS}}>{item.role}</p></div>
              </div>
            </div>
          </FadeIn>)}
        </div>
      </div>
    </section>
  )
}

// ============ FAQ ============
function FAQ() {
  const { t, theme } = useApp(); const c = tc(theme)
  const [oi, setOi] = useState<number|null>(null)
  return (
    <section className="relative py-28 sm:py-36" style={{background:c.bg}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{background:`linear-gradient(90deg, transparent, #6366f133, transparent)`}}/>
      <div className="max-w-2xl mx-auto px-5 sm:px-8">
        <FadeIn><div className="text-center mb-14">
          <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4" style={{color:'#6366f1'}}>{t.faq.label}</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]" style={{color:c.tx,fontFamily:"'Playfair Display', serif"}}>{t.faq.title}</h2>
        </div></FadeIn>
        <div className="space-y-2">{t.faq.items.map((item,i)=><FadeIn key={i} delay={i*0.08}>
          <button onClick={()=>setOi(oi===i?null:i)} className="w-full text-left p-5 rounded-xl border transition-all duration-300" style={{borderColor:c.bd,background:oi===i?c.cardH:c.card}}>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[15px] font-medium" style={{color:c.tx,opacity:0.7}}>{item.q}</span>
              <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${oi===i?'rotate-45':''}`} style={{color:c.txS}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div className="overflow-hidden transition-all duration-500" style={{maxHeight:oi===i?'200px':'0',opacity:oi===i?1:0,marginTop:oi===i?'12px':'0'}}>
              <p className="text-[14px] leading-relaxed" style={{color:c.txM}}>{item.a}</p>
            </div>
          </button>
        </FadeIn>)}</div>
      </div>
    </section>
  )
}

// ============ CTA ============
function CTASection() {
  const { t, theme } = useApp(); const c = tc(theme)
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden" style={{background:c.bg}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px" style={{background:`linear-gradient(90deg, transparent, #a855f733, transparent)`}}/>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-[0.08]" style={{background:'radial-gradient(ellipse, #a855f7 0%, transparent 70%)'}}/>
      <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 text-center">
        <FadeIn><h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] mb-6" style={{color:c.tx,fontFamily:"'Playfair Display', serif"}}>{t.ctaSection.title1}{' '}<span className="italic" style={{background:'linear-gradient(135deg, #c084fc, #f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{t.ctaSection.titleHighlight}</span></h2></FadeIn>
        <FadeIn delay={0.1}><p className="text-lg mb-10" style={{color:c.txM}}>{t.ctaSection.subtitle}</p></FadeIn>
        <FadeIn delay={0.2}>
          <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 text-[16px] font-semibold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02]" style={{background:'linear-gradient(135deg, #a855f7, #ec4899)'}}>
            <span className="relative z-10">{t.ctaSection.cta}</span>
            <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'linear-gradient(135deg, #9333ea, #db2777)'}}/>
          </Link>
        </FadeIn>
        <FadeIn delay={0.3}><p className="text-[13px] mt-6" style={{color:c.txF}}>{t.ctaSection.note}</p></FadeIn>
      </div>
    </section>
  )
}

// ============ FOOTER ============
function Footer() {
  const { t, theme } = useApp(); const c = tc(theme)
  return (
    <footer className="relative" style={{background:c.bg,borderTop:`1px solid ${c.bd}`}}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg, #c084fc, #e879a8)'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <span className="text-base font-semibold" style={{color:c.tx,opacity:0.8}}>Beauty Pro</span>
            </Link>
            <p className="text-[14px] leading-relaxed max-w-xs" style={{color:c.txS}}>{t.footer.desc}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold tracking-[0.15em] uppercase mb-4" style={{color:c.txM}}>{t.footer.product}</p>
            <div className="space-y-2.5">{[{l:t.nav.features,h:'#features'},{l:t.nav.pricing,h:'#pricing'},{l:t.nav.testimonials,h:'#testimonials'}].map(n=><a key={n.h} href={n.h} className="block text-[14px] transition-colors" style={{color:c.txS}}>{n.l}</a>)}</div>
          </div>
          <div>
            <p className="text-[12px] font-semibold tracking-[0.15em] uppercase mb-4" style={{color:c.txM}}>{t.footer.contacts}</p>
            <div className="space-y-2.5"><p className="text-[14px]" style={{color:c.txS}}>support@beautypro.ua</p><p className="text-[14px]" style={{color:c.txS}}>+380 (44) 123-45-67</p><p className="text-[14px]" style={{color:c.txS}}>Київ, Україна</p></div>
          </div>
        </div>
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{borderTop:`1px solid ${c.bd}`}}>
          <p className="text-[13px]" style={{color:c.txF}}>{t.footer.rights}</p>
          <div className="flex gap-6"><a href="#" className="text-[13px]" style={{color:c.txF}}>{t.footer.privacy}</a><a href="#" className="text-[13px]" style={{color:c.txF}}>{t.footer.terms}</a></div>
        </div>
      </div>
    </footer>
  )
}

// ============ FLOATING ============
function FloatingTelegram() {
  return <a href="https://t.me/beautypro_support" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/30" style={{background:'linear-gradient(135deg, #2AABEE, #229ED9)'}}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
  </a>
}

function ScrollToTop() {
  const [v, setV] = useState(false); const { theme } = useApp()
  useEffect(() => { const f = () => setV(window.scrollY > 600); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f) }, [])
  return <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="fixed bottom-6 left-6 z-50 w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-500" style={{opacity:v?1:0,pointerEvents:v?'auto':'none',transform:v?'translateY(0)':'translateY(16px)',background:theme==='dark'?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',borderColor:theme==='dark'?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)',color:theme==='dark'?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)',backdropFilter:'blur(12px)'}}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
  </button>
}

// ============ MAIN ============
export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('ua')
  const [theme, setTheme] = useState<Theme>('dark')
  const t = translations[lang]

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, t }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <div className="min-h-screen transition-colors duration-500" style={{background:tc(theme).bg,fontFamily:"'DM Sans', sans-serif",color:tc(theme).tx}}>
        <Header/><Hero/><Stats/><Features/><HowItWorks/><Pricing/><CompareSection/><Testimonials/><FAQ/><CTASection/><Footer/><FloatingTelegram/><ScrollToTop/>
      </div>
    </AppContext.Provider>
  )
}
