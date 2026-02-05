'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

type Lang = 'ua' | 'en'
type Theme = 'dark' | 'light'

const translations: Record<Lang, Record<string, string>> = {
  ua: {
    'nav.product': 'Продукт',
    'nav.features': 'Можливості',
    'nav.pricing': 'Тарифи',
    'nav.reviews': 'Відгуки',
    'nav.faq': 'FAQ',
    'nav.cta': 'Спробувати',
    'hero.pill': 'CRM створена для beauty-індустрії',
    'hero.title1': 'Ваш салон втрачає ',
    'hero.title2': ' щомісяця без CRM',
    'hero.desc': 'No-show, забуті клієнти, хаос у записах — це не дрібниці, це реальні гроші. ShinePRO закриває ці діри за 5 хвилин.',
    'hero.btn1': 'Запустити безкоштовно',
    'hero.btn2': 'Розрахувати втрати',
    'hero.proof': 'Створено для ',
    'hero.proof2': 'українських салонів краси',
    'calc.eyebrow': 'Калькулятор втрат',
    'calc.title1': 'Скільки ви втрачаєте ',
    'calc.title2': 'щомісяця',
    'calc.desc': 'Рухайте слайдери — побачите реальну картину втрат вашого салону без CRM',
    'calc.masters': 'Кількість майстрів',
    'calc.bookings': 'Записів на день (на майстра)',
    'calc.avgcheck': 'Середній чек, ₴',
    'calc.results': 'Ваші щомісячні втрати',
    'calc.noshow': 'No-show (12% записів)',
    'calc.churn': 'Втрата клієнтів (34%)',
    'calc.materials': 'Перевитрата матеріалів',
    'calc.time': 'Час на рутину (3 год/день)',
    'calc.total': 'Загальні втрати на місяць',
    'calc.total.sub': 'Це можна повернути з ShinePRO',
    'calc.cta': 'Перестати втрачати гроші',
    'feat.eyebrow': 'Можливості',
    'feat.title': 'Не просто CRM, а операційна система вашого салону',
    'feat.desc': 'Кожна функція вирішує конкретну бізнес-проблему і приносить вимірюваний результат.',
    'feat.1.title': 'Розумний календар з AI-оптимізацією',
    'feat.1.desc': 'Система аналізує середню тривалість послуг і пропонує оптимальне розміщення записів. Мінус 40 хвилин простоїв на день.',
    'feat.2.title': 'Автоматизації',
    'feat.2.desc': '7 готових сценаріїв які працюють без вашої участі. No-show знижується з 12% до 2%.',
    'feat.3.title': 'RFM-сегментація',
    'feat.3.desc': 'Автоматичний поділ бази по лояльності. Кожен сегмент отримує свою стратегію повернення.',
    'feat.4.title': 'Склад',
    'feat.4.desc': 'Техкарти автоматично списують матеріали. Повідомлення коли запас менше мінімуму.',
    'feat.5.title': 'Фінанси',
    'feat.5.desc': 'Зарплати, комісії, бонуси — автоматичний розрахунок. Monobank та ПриватБанк інтеграція.',
    'feat.6.title': 'Telegram-бот',
    'feat.6.desc': 'Клієнти записуються через бот, отримують нагадування і залишають відгуки. 24/7 без адміністратора.',
    'pricing.eyebrow': 'Тарифи',
    'pricing.title1': 'Прозорі ціни без ',
    'pricing.title2': 'прихованих платежів',
    'pricing.desc': 'Оберіть план під ваш салон. Завжди можна змінити.',
    'pricing.monthly': 'Щомісяця',
    'pricing.yearly': 'Щорічно',
    'pricing.start.name': 'Start',
    'pricing.start.desc': 'Для solo-майстрів та невеликих студій',
    'pricing.start.f1': 'До 2 майстрів',
    'pricing.start.f2': 'Онлайн-запис + календар',
    'pricing.start.f3': 'Telegram-нагадування',
    'pricing.start.f4': 'База клієнтів до 500',
    'pricing.start.btn': 'Почати безкоштовно',
    'pricing.pro.name': 'Pro',
    'pricing.pro.tag': 'Найпопулярніший',
    'pricing.pro.desc': 'Для салонів з командою та амбіціями',
    'pricing.pro.f1': 'До 8 майстрів',
    'pricing.pro.f2': 'RFM-аналітика + автоматизації',
    'pricing.pro.f3': 'Telegram-бот для запису',
    'pricing.pro.f4': 'Склад + техкарти',
    'pricing.pro.f5': 'Фінанси + зарплати',
    'pricing.pro.btn': 'Почати безкоштовно',
    'pricing.ent.name': 'Enterprise',
    'pricing.ent.desc': 'Для мереж салонів та франшиз',
    'pricing.ent.f1': 'Необмежено майстрів',
    'pricing.ent.f2': 'Мультилокації',
    'pricing.ent.f3': 'API + кастомні інтеграції',
    'pricing.ent.f4': 'Виділений менеджер',
    'pricing.ent.btn': "Зв'язатися з нами",
    'reviews.eyebrow': 'Відгуки',
    'reviews.title': 'Що кажуть власники салонів',
    'reviews.desc': 'Реальні історії, конкретні цифри',
    'rev.1': 'За перший місяць <strong>no-show впав з 14% до 2.3%</strong>. Це ₴23,000 які раніше просто зникали. Автонагадування в Telegram — найкраща інвестиція.',
    'rev.1.name': 'Олена М.',
    'rev.1.co': 'Nail-студія · Київ · 5 майстрів',
    'rev.2': 'RFM-сегментація показала, що <strong>27% бази — «сплячі» клієнти</strong>. Запустили автоматичну реактивацію — повернули 68 клієнтів за місяць.',
    'rev.2.name': 'Ірина К.',
    'rev.2.co': 'Beauty Space · Одеса · 3 майстри',
    'rev.3': 'Техкарти з автосписанням — <strong>щомісячна економія ₴12,000 на матеріалах</strong>. Раніше зливали на перевитрату. Тепер кожен грам під контролем.',
    'rev.3.name': 'Анастасія Ш.',
    'rev.3.co': 'Nail Bar · Харків · 7 майстрів',
    'faq.title': 'Часті запитання',
    'faq.desc': 'Не знайшли відповідь? Напишіть нам в Telegram — відповімо за 5 хвилин.',
    'faq.1.q': 'Скільки часу займає налаштування?',
    'faq.1.a': 'Реєстрація займає 5 хвилин. Базове налаштування з додаванням послуг і майстрів — 15 хвилин. Якщо у вас є база клієнтів в Excel або іншій CRM, ми безкоштовно допоможемо перенести її протягом 24 годин.',
    'faq.2.q': 'Чи потрібно встановлювати щось на комп\'ютер?',
    'faq.2.a': 'Ні. ShinePRO працює в браузері та як PWA-додаток на телефоні. Заходите з будь-якого пристрою — всі дані синхронізуються автоматично.',
    'faq.3.q': 'Як працює Telegram-бот для клієнтів?',
    'faq.3.a': 'Клієнт знаходить бот вашого салону в Telegram, бачить вільні слоти, обирає майстра та послугу, підтверджує запис. За 2 години до візиту отримує нагадування.',
    'faq.4.q': 'Що якщо мені не підійде?',
    'faq.4.a': '14 днів безкоштовного тріалу без прив\'язки картки. Якщо не підійде — просто не продовжуйте. Жодних зобов\'язань.',
    'cta.title1': 'Перестаньте рахувати в Excel.',
    'cta.title2': 'Почніть ',
    'cta.title3': 'заробляти більше',
    'cta.desc': 'Залиште заявку — ми допоможемо налаштувати все за вас. Безкоштовно.',
    'cta.name': "Ваше ім'я",
    'cta.phone': '+380 XX XXX XX XX',
    'cta.salon': 'Назва салону',
    'cta.submit': 'Отримати безкоштовний доступ',
    'cta.note': '14 днів безкоштовно · Без картки · Налаштування за 5 хвилин',
    'cta.f1': 'Без картки',
    'cta.f2': "Без зобов'язань",
    'cta.f3': 'Підтримка 24/7',
    'footer.copy': '© 2026 ShinePRO. Всі права захищені.',
    'footer.privacy': 'Конфіденційність',
    'footer.terms': 'Умови',
    'footer.support': 'Підтримка',
    'toast': "Заявку надіслано! Зв'яжемося з вами за 5 хвилин.",
    'per.month': ' / міс',
  },
  en: {
    'nav.product': 'Product',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.reviews': 'Reviews',
    'nav.faq': 'FAQ',
    'nav.cta': 'Try Free',
    'hero.pill': 'CRM built for the beauty industry',
    'hero.title1': 'Your salon loses ',
    'hero.title2': ' monthly without a CRM',
    'hero.desc': 'No-shows, forgotten clients, booking chaos — these aren\'t minor issues, they\'re real money. ShinePRO fixes these gaps in 5 minutes.',
    'hero.btn1': 'Start for free',
    'hero.btn2': 'Calculate losses',
    'hero.proof': 'Built for ',
    'hero.proof2': 'Ukrainian beauty salons',
    'calc.eyebrow': 'Loss Calculator',
    'calc.title1': 'How much do you lose ',
    'calc.title2': 'every month',
    'calc.desc': 'Move the sliders — see the real picture of your salon\'s losses without a CRM',
    'calc.masters': 'Number of stylists',
    'calc.bookings': 'Bookings per day (per stylist)',
    'calc.avgcheck': 'Average check, ₴',
    'calc.results': 'Your monthly losses',
    'calc.noshow': 'No-shows (12% of bookings)',
    'calc.churn': 'Client churn (34%)',
    'calc.materials': 'Material overspending',
    'calc.time': 'Time on routine (3 hrs/day)',
    'calc.total': 'Total monthly losses',
    'calc.total.sub': 'You can recover this with ShinePRO',
    'calc.cta': 'Stop losing money',
    'feat.eyebrow': 'Features',
    'feat.title': 'Not just a CRM — your salon\'s operating system',
    'feat.desc': 'Every feature solves a real business problem and delivers measurable results.',
    'feat.1.title': 'Smart Calendar with AI Optimization',
    'feat.1.desc': 'The system analyzes average service duration and suggests optimal booking placement. Minus 40 minutes of downtime per day.',
    'feat.2.title': 'Automations',
    'feat.2.desc': '7 ready-made scenarios that work without your involvement. No-show drops from 12% to 2%.',
    'feat.3.title': 'RFM Segmentation',
    'feat.3.desc': 'Automatic segmentation by loyalty. Each segment gets its own retention strategy.',
    'feat.4.title': 'Inventory',
    'feat.4.desc': 'Tech cards auto-deduct materials. Alerts when stock falls below minimum.',
    'feat.5.title': 'Finance',
    'feat.5.desc': 'Salaries, commissions, bonuses — automatic calculation. Monobank & PrivatBank integration.',
    'feat.6.title': 'Telegram Bot',
    'feat.6.desc': 'Clients book via bot, get reminders and leave reviews. 24/7 without a receptionist.',
    'pricing.eyebrow': 'Pricing',
    'pricing.title1': 'Transparent pricing with ',
    'pricing.title2': 'no hidden fees',
    'pricing.desc': 'Choose a plan for your salon. Switch anytime.',
    'pricing.monthly': 'Monthly',
    'pricing.yearly': 'Yearly',
    'pricing.start.name': 'Start',
    'pricing.start.desc': 'For solo stylists and small studios',
    'pricing.start.f1': 'Up to 2 stylists',
    'pricing.start.f2': 'Online booking + calendar',
    'pricing.start.f3': 'Telegram reminders',
    'pricing.start.f4': 'Client database up to 500',
    'pricing.start.btn': 'Start for free',
    'pricing.pro.name': 'Pro',
    'pricing.pro.tag': 'Most Popular',
    'pricing.pro.desc': 'For salons with a team and ambitions',
    'pricing.pro.f1': 'Up to 8 stylists',
    'pricing.pro.f2': 'RFM analytics + automations',
    'pricing.pro.f3': 'Telegram bot for booking',
    'pricing.pro.f4': 'Inventory + tech cards',
    'pricing.pro.f5': 'Finance + payroll',
    'pricing.pro.btn': 'Start for free',
    'pricing.ent.name': 'Enterprise',
    'pricing.ent.desc': 'For salon chains and franchises',
    'pricing.ent.f1': 'Unlimited stylists',
    'pricing.ent.f2': 'Multi-location',
    'pricing.ent.f3': 'API + custom integrations',
    'pricing.ent.f4': 'Dedicated manager',
    'pricing.ent.btn': 'Contact us',
    'reviews.eyebrow': 'Reviews',
    'reviews.title': 'What salon owners say',
    'reviews.desc': 'Real stories, real numbers',
    'rev.1': 'In the first month, <strong>no-shows dropped from 14% to 2.3%</strong>. That\'s ₴23,000 that used to just vanish. Telegram auto-reminders — best investment ever.',
    'rev.1.name': 'Olena M.',
    'rev.1.co': 'Nail studio · Kyiv · 5 stylists',
    'rev.2': 'RFM segmentation revealed that <strong>27% of our database were "sleeping" clients</strong>. We launched auto-reactivation — brought back 68 clients in a month.',
    'rev.2.name': 'Iryna K.',
    'rev.2.co': 'Beauty Space · Odesa · 3 stylists',
    'rev.3': 'Tech cards with auto-deduction — <strong>₴12,000 monthly savings on materials</strong>. We used to overspend. Now every gram is tracked.',
    'rev.3.name': 'Anastasia Sh.',
    'rev.3.co': 'Nail Bar · Kharkiv · 7 stylists',
    'faq.title': 'Frequently Asked Questions',
    'faq.desc': 'Can\'t find an answer? Message us on Telegram — we\'ll reply in 5 minutes.',
    'faq.1.q': 'How long does setup take?',
    'faq.1.a': 'Registration takes 5 minutes. Basic setup with services and stylists — 15 minutes. If you have a client database in Excel or another CRM, we\'ll migrate it for free within 24 hours.',
    'faq.2.q': 'Do I need to install anything?',
    'faq.2.a': 'No. ShinePRO works in the browser and as a PWA app on your phone. Access from any device — all data syncs automatically.',
    'faq.3.q': 'How does the Telegram bot work?',
    'faq.3.a': 'Clients find your salon\'s bot on Telegram, see available slots, choose a stylist and service, and confirm the booking. 2 hours before the visit, they get a reminder.',
    'faq.4.q': 'What if it\'s not for me?',
    'faq.4.a': '14-day free trial with no credit card required. If it doesn\'t work out — just don\'t continue. No obligations.',
    'cta.title1': 'Stop counting in Excel.',
    'cta.title2': 'Start ',
    'cta.title3': 'earning more',
    'cta.desc': 'Leave a request — we\'ll help you set everything up. For free.',
    'cta.name': 'Your name',
    'cta.phone': '+380 XX XXX XX XX',
    'cta.salon': 'Salon name',
    'cta.submit': 'Get free access',
    'cta.note': '14 days free · No card · Setup in 5 minutes',
    'cta.f1': 'No card',
    'cta.f2': 'No obligations',
    'cta.f3': '24/7 support',
    'footer.copy': '© 2026 ShinePRO. All rights reserved.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.support': 'Support',
    'toast': 'Request sent! We\'ll contact you within 5 minutes.',
    'per.month': ' / mo',
  },
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)
  const [masters, setMasters] = useState(4)
  const [bookings, setBookings] = useState(6)
  const [avgCheck, setAvgCheck] = useState(850)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [lang, setLang] = useState<Lang>('ua')
  const [theme, setTheme] = useState<Theme>('dark')

  const t = useCallback((key: string) => translations[lang][key] || key, [lang])

  // Theme handler
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Scroll handler for nav
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculator
  const workDays = 26
  const monthlyRevenue = masters * bookings * avgCheck * workDays
  const lossNoshow = Math.round(monthlyRevenue * 0.12)
  const lossChurn = Math.round(monthlyRevenue * 0.34 * 0.15)
  const lossMaterials = masters * 4500
  const lossTime = masters * 150 * workDays
  const lossTotal = lossNoshow + lossChurn + lossMaterials + lossTime

  const formatNumber = (n: number) => n.toLocaleString('uk-UA')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 4000)
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        :root{
          --bg-0:#07060B;--bg-1:#0C0B12;--bg-2:#11101A;--bg-3:#161521;
          --bg-card:#13121E;--bg-card-h:#1A1928;
          --b1:rgba(255,255,255,0.04);--b2:rgba(255,255,255,0.07);
          --b3:rgba(255,255,255,0.12);--b4:rgba(255,255,255,0.18);
          --t1:#EEEDF2;--t2:#8D8BA0;--t3:#5C5A70;--t4:#3D3B50;
          --violet:#8B5CF6;--violet-s:rgba(139,92,246,0.10);--violet-g:rgba(139,92,246,0.25);
          --rose:#E8437A;--rose-s:rgba(232,67,122,0.10);
          --amber:#E5A430;--amber-s:rgba(229,164,48,0.10);
          --emerald:#22C583;--emerald-s:rgba(34,197,131,0.10);
          --sky:#38ADF5;--sky-s:rgba(56,173,245,0.10);
          --g-main:linear-gradient(135deg,#8B5CF6,#E8437A,#E5A430);
          --g-text:linear-gradient(135deg,#C4B5FD,#F9A8D4,#FCD34D);
          --g-subtle:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(232,67,122,0.06),rgba(229,164,48,0.03));
          --font:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;
          --ease:cubic-bezier(0.16,1,0.3,1);
          --r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:20px;
        }
        [data-theme="light"]{
          --bg-0:#FAFAFA;--bg-1:#F3F3F5;--bg-2:#EEEDF2;--bg-3:#E4E3EA;
          --bg-card:#FFFFFF;--bg-card-h:#F8F7FB;
          --b1:rgba(0,0,0,0.04);--b2:rgba(0,0,0,0.08);
          --b3:rgba(0,0,0,0.14);--b4:rgba(0,0,0,0.22);
          --t1:#1A1A2E;--t2:#5C5A70;--t3:#8D8BA0;--t4:#AEADC0;
          --violet-s:rgba(139,92,246,0.08);--violet-g:rgba(139,92,246,0.18);
          --rose-s:rgba(232,67,122,0.08);
          --amber-s:rgba(229,164,48,0.08);
          --emerald-s:rgba(34,197,131,0.08);
          --sky-s:rgba(56,173,245,0.08);
          --g-subtle:linear-gradient(135deg,rgba(139,92,246,0.06),rgba(232,67,122,0.03),rgba(229,164,48,0.02));
        }
        [data-theme="light"] body::after{display:none}
        [data-theme="light"] .amb{opacity:0.4}
        [data-theme="light"] .nav.scrolled{background:rgba(250,250,250,0.85)}
        [data-theme="light"] .logo-mark::after{background:var(--bg-0)}
        [data-theme="light"] .btn-s{color:#fff;background:var(--violet)}
        [data-theme="light"] .btn-p{color:#fff;background:var(--violet)}
        [data-theme="light"] .btn-p:hover{box-shadow:0 8px 32px rgba(139,92,246,0.25)}
        [data-theme="light"] .btn-g{background:rgba(0,0,0,0.03);border-color:var(--b2)}
        [data-theme="light"] .price-btn-primary{background:var(--violet);color:#fff}
        [data-theme="light"] .price-btn-primary:hover{box-shadow:0 4px 20px rgba(139,92,246,0.25)}
        [data-theme="light"] .d-stat-v,.d-stat-l,.d-name,.d-card-t,.d-title{color:var(--t1)}
        [data-theme="light"] .show-border-in{background:var(--bg-1)}
        [data-theme="light"] .show-frame{background:var(--bg-1);box-shadow:0 24px 80px rgba(0,0,0,0.08),0 0 0 1px var(--b1)}
        [data-theme="light"] .lead-submit{background:var(--violet);color:#fff}
        [data-theme="light"] .lead-submit:hover{box-shadow:0 8px 32px rgba(139,92,246,0.25)}
        [data-theme="light"] .av{border-color:var(--bg-0)}

        html{scroll-behavior:smooth}
        body{font-family:var(--font);background:var(--bg-0);color:var(--t1);overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.6}
        ::selection{background:var(--violet-s);color:var(--t1)}
        
        body::after{content:'';position:fixed;inset:0;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E");pointer-events:none;z-index:10000}

        .amb{position:fixed;pointer-events:none;border-radius:50%;filter:blur(140px);z-index:0}
        .amb-1{width:900px;height:900px;top:-350px;left:-250px;background:rgba(139,92,246,0.06)}
        .amb-2{width:700px;height:700px;top:35%;right:-300px;background:rgba(232,67,122,0.04)}
        .amb-3{width:800px;height:800px;bottom:5%;left:-200px;background:rgba(229,164,48,0.03)}

        .ico{width:48px;height:48px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0}
        .ico svg{width:22px;height:22px}
        .ico-violet{background:var(--violet-s);color:var(--violet)}
        .ico-rose{background:var(--rose-s);color:var(--rose)}
        .ico-amber{background:var(--amber-s);color:var(--amber)}
        .ico-emerald{background:var(--emerald-s);color:var(--emerald)}
        .ico-sky{background:var(--sky-s);color:var(--sky)}

        .nav{position:fixed;top:0;left:0;right:0;z-index:1000;transition:all 0.4s}
        .nav.scrolled{background:rgba(7,6,11,0.82);backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);border-bottom:1px solid var(--b1)}
        .nav-in{max-width:1240px;margin:0 auto;padding:0 32px;height:68px;display:flex;align-items:center;justify-content:space-between}
        .nav-l{display:flex;align-items:center;gap:48px}
        .logo{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--t1)}
        .logo-mark{width:34px;height:34px;border-radius:9px;background:var(--g-main);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .logo-mark::after{content:'';position:absolute;inset:1.5px;border-radius:7.5px;background:var(--bg-0)}
        .logo-mark span{position:relative;z-index:1;font-weight:800;font-size:14px;background:var(--g-main);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .logo-name{font-weight:700;font-size:17px;letter-spacing:-0.02em}
        .nav-menu{display:flex;gap:2px;list-style:none}
        .nav-menu a{color:var(--t2);text-decoration:none;font-size:14px;font-weight:500;padding:8px 14px;border-radius:var(--r-sm);transition:all 0.2s}
        .nav-menu a:hover{color:var(--t1);background:rgba(255,255,255,0.04)}
        .nav-r{display:flex;align-items:center;gap:12px}
        .btn-s{padding:9px 22px;font-size:13px;font-weight:600;color:var(--bg-0);background:var(--t1);border:none;border-radius:var(--r-sm);cursor:pointer;font-family:var(--font);transition:all 0.3s var(--ease);text-decoration:none}
        .btn-s:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(255,255,255,0.15)}

        .hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:160px 32px 100px;overflow:hidden}
        .hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);background-size:72px 72px;mask-image:radial-gradient(ellipse 70% 55% at 50% 40%,black,transparent);-webkit-mask-image:radial-gradient(ellipse 70% 55% at 50% 40%,black,transparent)}
        .hero-radial{position:absolute;width:1100px;height:650px;top:50%;left:50%;transform:translate(-50%,-55%);background:radial-gradient(ellipse,rgba(139,92,246,0.07) 0%,rgba(232,67,122,0.025) 40%,transparent 70%);pointer-events:none}

        .hero-c{position:relative;z-index:1;max-width:840px}
        .hero-pill{display:inline-flex;align-items:center;gap:10px;padding:7px 18px 7px 10px;border-radius:100px;border:1px solid rgba(139,92,246,0.18);background:rgba(139,92,246,0.05);font-size:13px;font-weight:500;color:var(--violet);margin-bottom:36px;transition:border-color 0.3s,background 0.3s;cursor:default}
        .hero-pill:hover{border-color:rgba(139,92,246,0.3);background:rgba(139,92,246,0.08)}
        .pill-dot{width:7px;height:7px;border-radius:50%;background:var(--violet);position:relative}
        .pill-dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;background:var(--violet);opacity:0.3;animation:ping 2s infinite}
        @keyframes ping{0%{transform:scale(1);opacity:0.3}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}

        .hero h1{font-size:clamp(42px,6.5vw,80px);font-weight:800;line-height:1.02;letter-spacing:-0.04em}
        .gt{background:var(--g-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hero-desc{font-size:clamp(16px,1.8vw,20px);color:var(--t2);max-width:540px;margin:24px auto 0;font-weight:400;line-height:1.65}
        .hero-btns{display:flex;gap:14px;justify-content:center;margin-top:44px}

        .btn-p{display:inline-flex;align-items:center;gap:10px;padding:15px 34px;font-size:15px;font-weight:600;color:var(--bg-0);background:var(--t1);border:none;border-radius:var(--r-md);cursor:pointer;font-family:var(--font);transition:all 0.35s var(--ease);text-decoration:none;position:relative;overflow:hidden}
        .btn-p::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent,rgba(255,255,255,0.15),transparent);transform:translateX(-100%);transition:transform 0.6s}
        .btn-p:hover::before{transform:translateX(100%)}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(255,255,255,0.12)}

        .btn-g{display:inline-flex;align-items:center;gap:10px;padding:15px 32px;font-size:15px;font-weight:500;color:var(--t2);background:rgba(255,255,255,0.03);border:1px solid var(--b2);border-radius:var(--r-md);cursor:pointer;font-family:var(--font);text-decoration:none;transition:all 0.35s var(--ease)}
        .btn-g:hover{color:var(--t1);background:rgba(255,255,255,0.06);border-color:var(--b3);transform:translateY(-2px)}

        .hero-proof{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:48px}
        .avatars{display:flex}
        .av{width:34px;height:34px;border-radius:50%;border:2px solid var(--bg-0);margin-left:-10px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--bg-0)}
        .av:first-child{margin-left:0}
        .hero-proof span{font-size:14px;color:var(--t2)}
        .hero-proof strong{color:var(--t1);font-weight:600}

        .eyebrow{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;display:block;margin-bottom:16px;background:var(--g-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent}

        .calc{padding:140px 32px;position:relative}
        .calc-wrap{max-width:1000px;margin:0 auto}
        .calc-hd{text-align:center;max-width:680px;margin:0 auto 60px}
        .calc-hd h2{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-0.03em;line-height:1.1;margin-bottom:12px}
        .calc-hd p{color:var(--t2);font-size:16px;line-height:1.65}
        .calc-box{border-radius:var(--r-xl);border:1px solid var(--b2);background:var(--bg-card);padding:48px;position:relative;overflow:hidden}
        .calc-box::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:var(--g-main);opacity:0.3}
        .calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
        .calc-inputs{display:flex;flex-direction:column;gap:28px}
        .calc-field label{display:block;font-size:13px;font-weight:600;color:var(--t2);margin-bottom:10px}
        .range-current{font-size:24px;font-weight:800;color:var(--t1);margin-bottom:12px;font-variant-numeric:tabular-nums}
        .calc-field input[type="range"]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:rgba(255,255,255,0.06);outline:none;cursor:pointer}
        .calc-field input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:var(--violet);border:3px solid var(--bg-card);cursor:pointer;box-shadow:0 0 20px rgba(139,92,246,0.4);transition:transform 0.2s}
        .calc-field input[type="range"]::-webkit-slider-thumb:hover{transform:scale(1.15)}
        .range-vals{display:flex;justify-content:space-between;margin-top:8px}
        .range-vals span{font-size:11px;color:var(--t4)}

        .calc-results{padding:32px;border-radius:var(--r-lg);background:rgba(139,92,246,0.04);border:1px solid rgba(139,92,246,0.12)}
        .calc-results h3{font-size:16px;font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:10px}
        .loss-item{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--b1)}
        .loss-item:last-of-type{border-bottom:none}
        .loss-label{font-size:14px;color:var(--t2)}
        .loss-value{font-size:18px;font-weight:800;color:var(--rose);font-variant-numeric:tabular-nums}
        .loss-total{margin-top:20px;padding:20px;border-radius:var(--r-md);background:rgba(232,67,122,0.08);border:1px solid rgba(232,67,122,0.15);text-align:center}
        .loss-total-label{font-size:13px;color:var(--t2);margin-bottom:6px}
        .loss-total-value{font-size:36px;font-weight:900;color:var(--rose);font-variant-numeric:tabular-nums;letter-spacing:-0.03em}
        .loss-total-sub{font-size:12px;color:var(--t3);margin-top:4px}
        .calc-cta{margin-top:20px;text-align:center}
        .calc-cta .btn-p{width:100%;justify-content:center}

        .showcase{position:relative;padding:0 32px 140px;z-index:1}
        .show-wrap{max-width:1140px;margin:0 auto;position:relative}
        .show-border{position:absolute;inset:-1px;border-radius:18px;background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(232,67,122,0.15),rgba(229,164,48,0.08));z-index:0}
        .show-border-in{position:absolute;inset:1px;border-radius:17px;background:var(--bg-1)}
        .show-frame{position:relative;z-index:1;border-radius:18px;overflow:hidden;background:var(--bg-1);box-shadow:0 24px 80px rgba(0,0,0,0.5),0 0 0 1px var(--b1),0 0 60px rgba(139,92,246,0.1)}
        .chrome{display:flex;align-items:center;padding:14px 20px;background:rgba(255,255,255,0.012);border-bottom:1px solid var(--b1);gap:10px}
        .dots{display:flex;gap:7px}
        .dot{width:12px;height:12px;border-radius:50%}
        .dot-r{background:rgba(255,95,87,0.65)}.dot-y{background:rgba(255,189,46,0.55)}.dot-g{background:rgba(39,201,63,0.55)}
        .url-bar{flex:1;max-width:360px;margin-left:12px;padding:6px 14px;border-radius:6px;background:rgba(255,255,255,0.025);border:1px solid var(--b1);font-size:12px;color:var(--t3);display:flex;align-items:center;gap:6px}

        .dash{display:grid;grid-template-columns:240px 1fr;min-height:520px}
        .d-side{border-right:1px solid var(--b1);padding:20px 0;background:rgba(255,255,255,0.006)}
        .d-salon{margin:0 14px 20px;padding:14px;border-radius:var(--r-md);background:var(--g-subtle);border:1px solid var(--b1)}
        .d-salon-n{font-size:13px;font-weight:700;margin-bottom:2px}
        .d-salon-p{font-size:11px;color:var(--t3)}
        .d-salon-bar{height:4px;background:rgba(255,255,255,0.05);border-radius:2px;margin-top:10px;overflow:hidden}
        .d-salon-fill{height:100%;width:73%;border-radius:2px;background:var(--g-main)}
        .d-grp{padding:0 14px;margin-bottom:24px}
        .d-grp-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--t4);padding:0 12px;margin-bottom:6px}
        .d-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-sm);font-size:13px;font-weight:500;color:var(--t3);cursor:default;transition:all 0.15s;margin-bottom:1px}
        .d-item:hover{color:var(--t2);background:rgba(255,255,255,0.02)}
        .d-item.act{color:var(--t1);background:var(--violet-s)}
        .d-item svg{width:18px;height:18px;opacity:0.5;flex-shrink:0}
        .d-item.act svg{opacity:0.85}
        .d-badge{margin-left:auto;font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;background:var(--violet-s);color:var(--violet)}

        .d-main{padding:24px 28px;overflow:hidden}
        .d-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
        .d-title{font-size:20px;font-weight:700;letter-spacing:-0.02em}
        .d-actions{display:flex;gap:8px}
        .d-filter{padding:7px 14px;font-size:12px;font-weight:500;color:var(--t3);background:rgba(255,255,255,0.025);border:1px solid var(--b1);border-radius:var(--r-sm);font-family:var(--font);display:flex;align-items:center;gap:6px}
        .d-add{padding:7px 14px;font-size:12px;font-weight:600;color:white;background:var(--violet);border:none;border-radius:var(--r-sm);font-family:var(--font);display:flex;align-items:center;gap:5px}

        .d-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .d-stat{padding:18px;border-radius:var(--r-md);border:1px solid var(--b1);background:rgba(255,255,255,0.012);transition:all 0.3s var(--ease)}
        .d-stat:hover{border-color:var(--b3);background:rgba(255,255,255,0.025)}
        .d-stat-l{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px}
        .d-stat-v{font-size:28px;font-weight:800;letter-spacing:-0.03em;line-height:1;margin-bottom:6px}
        .d-delta{font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:100px}
        .d-delta.up{color:var(--emerald);background:var(--emerald-s)}

        .d-bottom{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .d-card{border-radius:var(--r-md);border:1px solid var(--b1);background:rgba(255,255,255,0.012);overflow:hidden}
        .d-card-hd{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--b1)}
        .d-card-t{font-size:13px;font-weight:700}
        .d-card-sub{font-size:11px;color:var(--t3)}

        .d-row{display:grid;grid-template-columns:36px 1fr auto auto;gap:12px;align-items:center;padding:10px 18px;border-bottom:1px solid var(--b1);transition:background 0.15s}
        .d-row:last-child{border-bottom:none}
        .d-row:hover{background:rgba(255,255,255,0.012)}
        .d-av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--bg-0)}
        .d-name{font-size:13px;font-weight:600}
        .d-svc{font-size:11px;color:var(--t3)}
        .d-time{font-size:12px;color:var(--t2);font-weight:500;font-variant-numeric:tabular-nums}
        .d-status{font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px}
        .st-ok{color:var(--emerald);background:var(--emerald-s)}
        .st-wait{color:var(--amber);background:var(--amber-s)}
        .st-done{color:var(--sky);background:var(--sky-s)}

        .feat{padding:140px 32px;position:relative}
        .feat-hd{text-align:center;max-width:680px;margin:0 auto 64px}
        .feat-hd h2{font-size:clamp(32px,4.5vw,50px);font-weight:800;letter-spacing:-0.035em;line-height:1.1;margin-bottom:16px}
        .feat-hd p{color:var(--t2);font-size:17px;line-height:1.65}

        .bento{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-rows:minmax(200px,auto);gap:14px;max-width:1140px;margin:0 auto}
        .bc{border-radius:var(--r-lg);border:1px solid var(--b2);background:var(--bg-card);padding:32px;position:relative;overflow:hidden;transition:all 0.5s var(--ease)}
        .bc::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:var(--g-main);opacity:0;transition:opacity 0.5s}
        .bc:hover{border-color:var(--b3);transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,0.3)}
        .bc:hover::before{opacity:0.4}
        .bc-1{grid-column:span 7;grid-row:span 2}.bc-2{grid-column:span 5}.bc-3{grid-column:span 5}
        .bc-4{grid-column:span 4}.bc-5{grid-column:span 4}.bc-6{grid-column:span 4}
        .bc h3{font-size:18px;font-weight:700;letter-spacing:-0.02em;margin-top:20px;margin-bottom:8px}
        .bc>p{color:var(--t2);font-size:14px;line-height:1.65}

        .pricing{padding:140px 32px;position:relative}
        .pricing-hd{text-align:center;max-width:680px;margin:0 auto 60px}
        .pricing-hd h2{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-0.03em;line-height:1.1;margin-bottom:12px}
        .pricing-hd p{color:var(--t2);font-size:16px}

        .pricing-toggle{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:48px}
        .pricing-toggle span{font-size:14px;color:var(--t3);font-weight:500;transition:color 0.3s}
        .pricing-toggle span.active{color:var(--t1)}
        .toggle-wrap{width:52px;height:28px;border-radius:14px;background:var(--violet);cursor:pointer;position:relative;transition:background 0.3s}
        .toggle-knob{width:22px;height:22px;border-radius:50%;background:white;position:absolute;top:3px;left:3px;transition:transform 0.3s var(--ease);box-shadow:0 2px 8px rgba(0,0,0,0.2)}
        .toggle-wrap.annual .toggle-knob{transform:translateX(24px)}
        .save-badge{padding:4px 10px;border-radius:100px;background:var(--emerald-s);color:var(--emerald);font-size:11px;font-weight:700}

        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1000px;margin:0 auto}
        .price-card{padding:36px 28px;border-radius:var(--r-xl);border:1px solid var(--b2);background:var(--bg-card);position:relative;transition:all 0.4s var(--ease);display:flex;flex-direction:column}
        .price-card:hover{transform:translateY(-4px);border-color:var(--b3);box-shadow:0 12px 40px rgba(0,0,0,0.3)}
        .price-card.popular{border-color:rgba(139,92,246,0.3);background:linear-gradient(180deg,rgba(139,92,246,0.04) 0%,var(--bg-card) 100%)}
        .price-card.popular::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g-main);border-radius:var(--r-xl) var(--r-xl) 0 0}
        .popular-tag{position:absolute;top:-12px;left:50%;transform:translateX(-50%);padding:4px 16px;border-radius:100px;background:var(--violet);color:white;font-size:11px;font-weight:700;white-space:nowrap}
        .price-name{font-size:16px;font-weight:700;margin-bottom:4px}
        .price-desc{font-size:13px;color:var(--t3);margin-bottom:20px;line-height:1.5}
        .price-amount{margin-bottom:24px}
        .price-num{font-size:42px;font-weight:900;letter-spacing:-0.04em;font-variant-numeric:tabular-nums}
        .price-period{font-size:14px;color:var(--t3);font-weight:400}
        .price-features{display:flex;flex-direction:column;gap:12px;margin-bottom:32px;flex:1}
        .pf{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--t2);line-height:1.5}
        .pf svg{width:16px;height:16px;color:var(--emerald);flex-shrink:0;margin-top:2px}
        .price-btn{width:100%;padding:14px;border-radius:var(--r-md);font-size:14px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all 0.3s var(--ease);text-align:center;border:none;text-decoration:none;display:block}
        .price-btn-primary{background:var(--t1);color:var(--bg-0)}
        .price-btn-primary:hover{box-shadow:0 4px 20px rgba(255,255,255,0.15);transform:translateY(-1px)}
        .price-btn-outline{background:transparent;color:var(--t2);border:1px solid var(--b2)}
        .price-btn-outline:hover{border-color:var(--b3);color:var(--t1);background:rgba(255,255,255,0.03)}

        .test{padding:140px 32px}
        .test-hd{text-align:center;max-width:600px;margin:0 auto 64px}
        .test-hd h2{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-0.03em;margin-bottom:12px}
        .test-hd p{color:var(--t2);font-size:16px}
        .test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1140px;margin:0 auto}
        .tc-card{padding:28px;border-radius:var(--r-lg);border:1px solid var(--b2);background:var(--bg-card);transition:all 0.4s var(--ease);display:flex;flex-direction:column}
        .tc-card:hover{border-color:var(--b3);transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.25)}
        .tc-stars{display:flex;gap:3px;margin-bottom:16px}
        .tc-star{width:16px;height:16px;color:var(--amber)}
        .tc-text{font-size:14px;line-height:1.7;color:var(--t2);flex:1;margin-bottom:20px}
        .tc-text strong{color:var(--t1);font-weight:600}
        .tc-author{display:flex;align-items:center;gap:12px;border-top:1px solid var(--b1);padding-top:16px}
        .tc-av-c{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--bg-0)}
        .tc-name{font-size:14px;font-weight:700}
        .tc-co{font-size:12px;color:var(--t3);margin-top:1px}

        .faq{padding:140px 32px}
        .faq-hd{text-align:center;max-width:680px;margin:0 auto 60px}
        .faq-hd h2{font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-0.03em;line-height:1.1;margin-bottom:12px}
        .faq-hd p{color:var(--t2);font-size:16px}
        .faq-list{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:8px}
        .faq-item{border-radius:var(--r-md);border:1px solid var(--b2);background:var(--bg-card);overflow:hidden;transition:border-color 0.3s}
        .faq-item.open{border-color:var(--b3)}
        .faq-q{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;cursor:pointer;gap:16px;transition:background 0.2s}
        .faq-q:hover{background:rgba(255,255,255,0.012)}
        .faq-q span{font-size:15px;font-weight:600}
        .faq-q svg{width:18px;height:18px;color:var(--t3);transition:transform 0.3s var(--ease);flex-shrink:0}
        .faq-item.open .faq-q svg{transform:rotate(45deg);color:var(--violet)}
        .faq-a{max-height:0;overflow:hidden;transition:max-height 0.4s var(--ease)}
        .faq-a-in{padding:0 24px 20px;font-size:14px;color:var(--t2);line-height:1.7}

        .cta{padding:140px 32px;text-align:center;position:relative}
        .cta-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:500px;background:radial-gradient(ellipse,rgba(139,92,246,0.07) 0%,rgba(232,67,122,0.025) 40%,transparent 70%);pointer-events:none}
        .cta-c{position:relative;z-index:1;max-width:640px;margin:0 auto}
        .cta-c h2{font-size:clamp(32px,4.5vw,52px);font-weight:800;letter-spacing:-0.035em;line-height:1.1;margin-bottom:16px}
        .cta-desc{color:var(--t2);font-size:18px;margin-bottom:40px;line-height:1.6}

        .lead-form{max-width:480px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
        .lead-row{display:flex;gap:12px}
        .lead-row input,.lead-form input[type="tel"]{flex:1;padding:14px 18px;border-radius:var(--r-md);border:1px solid var(--b2);background:rgba(255,255,255,0.03);color:var(--t1);font-family:var(--font);font-size:14px;outline:none;transition:border-color 0.3s}
        .lead-row input:focus,.lead-form input[type="tel"]:focus{border-color:var(--violet)}
        .lead-row input::placeholder,.lead-form input::placeholder{color:var(--t4)}
        .lead-submit{padding:16px 40px;font-size:16px;font-weight:700;color:var(--bg-0);background:var(--t1);border:none;border-radius:var(--r-md);cursor:pointer;font-family:var(--font);transition:all 0.35s var(--ease);position:relative;overflow:hidden}
        .lead-submit:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(255,255,255,0.12)}
        .lead-note{font-size:12px;color:var(--t4);margin-top:4px}

        .cta-feats{display:flex;justify-content:center;gap:24px;margin-top:28px;flex-wrap:wrap}
        .cta-f{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--t2)}
        .cta-f svg{width:16px;height:16px;color:var(--emerald)}

        .toast{position:fixed;bottom:40px;left:50%;transform:translateX(-50%) translateY(100px);padding:16px 28px;border-radius:var(--r-md);background:var(--emerald);color:var(--bg-0);font-weight:600;font-size:14px;z-index:9999;transition:transform 0.5s var(--ease);display:flex;align-items:center;gap:10px}
        .toast.show{transform:translateX(-50%) translateY(0)}
        .toast svg{width:20px;height:20px}

        .foot{border-top:1px solid var(--b1);padding:40px 32px}
        .foot-in{max-width:1240px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
        .foot-l{display:flex;align-items:center;gap:32px}
        .foot-copy{font-size:13px;color:var(--t3)}
        .foot-links{display:flex;gap:24px}
        .foot-links a{font-size:13px;color:var(--t3);text-decoration:none;transition:color 0.2s}
        .foot-links a:hover{color:var(--t2)}

        .nav-toggles{display:flex;align-items:center;gap:6px;margin-right:8px}
        .t-btn{width:36px;height:36px;border-radius:var(--r-sm);border:1px solid var(--b2);background:rgba(255,255,255,0.03);color:var(--t2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;font-family:var(--font);font-size:12px;font-weight:700;padding:0}
        .t-btn:hover{border-color:var(--b3);color:var(--t1);background:rgba(255,255,255,0.06)}
        .t-btn.active{border-color:var(--violet);color:var(--violet);background:var(--violet-s)}
        .t-btn svg{width:16px;height:16px}
        .lang-toggle{display:flex;border-radius:var(--r-sm);border:1px solid var(--b2);overflow:hidden}
        .lang-btn{padding:6px 10px;font-size:11px;font-weight:700;font-family:var(--font);border:none;background:transparent;color:var(--t3);cursor:pointer;transition:all 0.2s}
        .lang-btn.active{background:var(--violet);color:#fff}

        @media(max-width:1024px){
          .bento{grid-template-columns:repeat(6,1fr)}
          .bc-1{grid-column:span 6;grid-row:span 1}.bc-2,.bc-3{grid-column:span 3}.bc-4,.bc-5,.bc-6{grid-column:span 2}
          .dash{grid-template-columns:1fr}.d-side{display:none}
          .pricing-grid{grid-template-columns:1fr;max-width:400px;margin:0 auto}
          .calc-grid{grid-template-columns:1fr}
        }
        @media(max-width:768px){
          .bento{grid-template-columns:1fr}
          .bc-1,.bc-2,.bc-3,.bc-4,.bc-5,.bc-6{grid-column:span 1}
          .d-stats{grid-template-columns:repeat(2,1fr)}
          .d-bottom{grid-template-columns:1fr}
          .test-grid{grid-template-columns:1fr;max-width:500px}
          .nav-menu{display:none}.nav-l{gap:0}
          .hero-btns{flex-direction:column;align-items:center}
          .hero-proof{flex-direction:column;gap:12px}
          .foot-in{flex-direction:column;gap:20px;text-align:center}
          .foot-l{flex-direction:column;gap:16px}
          .lead-row{flex-direction:column}
          .cta-feats{gap:16px}
        }
      `}</style>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}

      <div className="amb amb-1"></div>
      <div className="amb amb-2"></div>
      <div className="amb amb-3"></div>

      {/* NAV */}
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-in">
          <div className="nav-l">
            <Link href="/" className="logo">
              <div className="logo-mark"><span>S</span></div>
              <span className="logo-name">ShinePRO</span>
            </Link>
            <ul className="nav-menu">
              <li><a href="#product">{t('nav.product')}</a></li>
              <li><a href="#features">{t('nav.features')}</a></li>
              <li><a href="#pricing">{t('nav.pricing')}</a></li>
              <li><a href="#reviews">{t('nav.reviews')}</a></li>
              <li><a href="#faq">{t('nav.faq')}</a></li>
            </ul>
          </div>
          <div className="nav-r">
            <div className="nav-toggles">
              <div className="lang-toggle">
                <button className={`lang-btn ${lang === 'ua' ? 'active' : ''}`} onClick={() => setLang('ua')}>UA</button>
                <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
              </div>
              <button className="t-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
            </div>
            <a href="#cta" className="btn-s">{t('nav.cta')}</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-radial"></div>
        <div className="hero-c">
          <div className="hero-pill"><span className="pill-dot"></span>{t('hero.pill')}</div>
          <h1>{t('hero.title1')}<span className="gt">₴47 000</span>{t('hero.title2')}</h1>
          <p className="hero-desc">{t('hero.desc')}</p>
          <div className="hero-btns">
            <a href="#cta" className="btn-p">
              {t('hero.btn1')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="#calculator" className="btn-g">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              {t('hero.btn2')}
            </a>
          </div>
          <div className="hero-proof">
            <div className="avatars">
              <div className="av" style={{background:'var(--violet)'}}>ОМ</div>
              <div className="av" style={{background:'var(--rose)'}}>ІК</div>
              <div className="av" style={{background:'var(--amber)'}}>АШ</div>
              <div className="av" style={{background:'var(--emerald)'}}>НП</div>
              <div className="av" style={{background:'var(--sky)'}}>ТВ</div>
            </div>
            <span>{t('hero.proof')}<strong>{t('hero.proof2')}</strong></span>
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="showcase" id="product">
        <div className="show-wrap">
          <div className="show-border"><div className="show-border-in"></div></div>
          <div className="show-frame">
            <div className="chrome">
              <div className="dots"><span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span></div>
              <div className="url-bar">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--emerald)'}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                app.shineprocrm.com/dashboard
              </div>
            </div>
            <div className="dash">
              <div className="d-side">
                <div className="d-salon">
                  <div className="d-salon-n">Nail Studio OMG</div>
                  <div className="d-salon-p">Pro план · 4 майстри</div>
                  <div className="d-salon-bar"><div className="d-salon-fill"></div></div>
                </div>
                <div className="d-grp">
                  <div className="d-grp-label">Основне</div>
                  <div className="d-item act">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                    Дашборд
                  </div>
                  <div className="d-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Календар<span className="d-badge">12</span>
                  </div>
                  <div className="d-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    Клієнти
                  </div>
                </div>
              </div>
              <div className="d-main">
                <div className="d-top">
                  <div className="d-title">Дашборд</div>
                  <div className="d-actions">
                    <div className="d-filter">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                      Лютий 2026
                    </div>
                    <div className="d-add">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Новий запис
                    </div>
                  </div>
                </div>
                <div className="d-stats">
                  <div className="d-stat"><div className="d-stat-l">Виручка</div><div className="d-stat-v">₴284K</div><span className="d-delta up">↑ 12.3%</span></div>
                  <div className="d-stat"><div className="d-stat-l">Записи</div><div className="d-stat-v">847</div><span className="d-delta up">↑ 8.1%</span></div>
                  <div className="d-stat"><div className="d-stat-l">Нові клієнти</div><div className="d-stat-v">126</div><span className="d-delta up">↑ 15.7%</span></div>
                  <div className="d-stat"><div className="d-stat-l">Ретеншен</div><div className="d-stat-v">94%</div><span className="d-delta up">↑ 2.1%</span></div>
                </div>
                <div className="d-bottom">
                  <div className="d-card">
                    <div className="d-card-hd"><div><div className="d-card-t">Виручка по дням</div><div className="d-card-sub">Лютий 2026</div></div><div className="d-card-sub">₴284,200</div></div>
                    <div style={{padding:'16px',height:'140px'}}>
                      <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{width:'100%',height:'100%'}}>
                        <defs>
                          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path d="M0,80 L40,65 L80,70 L120,45 L160,55 L200,30 L240,40 L280,25 L320,35 L360,15 L400,20" fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M0,80 L40,65 L80,70 L120,45 L160,55 L200,30 L240,40 L280,25 L320,35 L360,15 L400,20 L400,100 L0,100 Z" fill="url(#cg)"/>
                      </svg>
                    </div>
                  </div>
                  <div className="d-card">
                    <div className="d-card-hd"><div><div className="d-card-t">Найближчі записи</div><div className="d-card-sub">Сьогодні</div></div></div>
                    <div>
                      <div className="d-row"><div className="d-av" style={{background:'var(--violet)'}}>АК</div><div><div className="d-name">Анна Коваленко</div><div className="d-svc">Манікюр + покриття</div></div><div className="d-time">09:00</div><div className="d-status st-ok">Підтв.</div></div>
                      <div className="d-row"><div className="d-av" style={{background:'var(--rose)'}}>МП</div><div><div className="d-name">Марія Петренко</div><div className="d-svc">Нарощування</div></div><div className="d-time">10:30</div><div className="d-status st-wait">Очік.</div></div>
                      <div className="d-row"><div className="d-av" style={{background:'var(--amber)'}}>ОС</div><div><div className="d-name">Олена Сидорук</div><div className="d-svc">Педикюр апаратний</div></div><div className="d-time">12:00</div><div className="d-status st-ok">Підтв.</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="calc" id="calculator">
        <div className="calc-wrap">
          <div className="calc-hd">
            <span className="eyebrow">{t('calc.eyebrow')}</span>
            <h2>{t('calc.title1')}<span className="gt">{t('calc.title2')}</span>?</h2>
            <p>{t('calc.desc')}</p>
          </div>
          <div className="calc-box">
            <div className="calc-grid">
              <div className="calc-inputs">
                <div className="calc-field">
                  <label>{t('calc.masters')}</label>
                  <div className="range-current">{masters}</div>
                  <input type="range" min="1" max="15" value={masters} onChange={e => setMasters(Number(e.target.value))} />
                  <div className="range-vals"><span>1</span><span>15</span></div>
                </div>
                <div className="calc-field">
                  <label>{t('calc.bookings')}</label>
                  <div className="range-current">{bookings}</div>
                  <input type="range" min="2" max="12" value={bookings} onChange={e => setBookings(Number(e.target.value))} />
                  <div className="range-vals"><span>2</span><span>12</span></div>
                </div>
                <div className="calc-field">
                  <label>{t('calc.avgcheck')}</label>
                  <div className="range-current">₴{formatNumber(avgCheck)}</div>
                  <input type="range" min="300" max="3000" step="50" value={avgCheck} onChange={e => setAvgCheck(Number(e.target.value))} />
                  <div className="range-vals"><span>₴300</span><span>₴3 000</span></div>
                </div>
              </div>
              <div className="calc-results">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--rose)'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {t('calc.results')}
                </h3>
                <div className="loss-item"><span className="loss-label">{t('calc.noshow')}</span><span className="loss-value">₴{formatNumber(lossNoshow)}</span></div>
                <div className="loss-item"><span className="loss-label">{t('calc.churn')}</span><span className="loss-value">₴{formatNumber(lossChurn)}</span></div>
                <div className="loss-item"><span className="loss-label">{t('calc.materials')}</span><span className="loss-value">₴{formatNumber(lossMaterials)}</span></div>
                <div className="loss-item"><span className="loss-label">{t('calc.time')}</span><span className="loss-value">₴{formatNumber(lossTime)}</span></div>
                <div className="loss-total">
                  <div className="loss-total-label">{t('calc.total')}</div>
                  <div className="loss-total-value">₴{formatNumber(lossTotal)}</div>
                  <div className="loss-total-sub">{t('calc.total.sub')}</div>
                </div>
                <div className="calc-cta">
                  <a href="#cta" className="btn-p">
                    {t('calc.cta')}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat" id="features">
        <div className="feat-hd">
          <span className="eyebrow">{t('feat.eyebrow')}</span>
          <h2>{t('feat.title')}</h2>
          <p>{t('feat.desc')}</p>
        </div>
        <div className="bento">
          <div className="bc bc-1">
            <div className="ico ico-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3>{t('feat.1.title')}</h3>
            <p>{t('feat.1.desc')}</p>
          </div>
          <div className="bc bc-2">
            <div className="ico ico-rose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3>{t('feat.2.title')}</h3>
            <p>{t('feat.2.desc')}</p>
          </div>
          <div className="bc bc-3">
            <div className="ico ico-emerald">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <h3>{t('feat.3.title')}</h3>
            <p>{t('feat.3.desc')}</p>
          </div>
          <div className="bc bc-4">
            <div className="ico ico-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <h3>{t('feat.4.title')}</h3>
            <p>{t('feat.4.desc')}</p>
          </div>
          <div className="bc bc-5">
            <div className="ico ico-sky">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3>{t('feat.5.title')}</h3>
            <p>{t('feat.5.desc')}</p>
          </div>
          <div className="bc bc-6">
            <div className="ico ico-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <h3>{t('feat.6.title')}</h3>
            <p>{t('feat.6.desc')}</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="pricing-hd">
          <span className="eyebrow">{t('pricing.eyebrow')}</span>
          <h2>{t('pricing.title1')}<span className="gt">{t('pricing.title2')}</span></h2>
          <p>{t('pricing.desc')}</p>
        </div>
        <div className="pricing-toggle">
          <span className={!isAnnual ? 'active' : ''}>{t('pricing.monthly')}</span>
          <div className={`toggle-wrap ${isAnnual ? 'annual' : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
            <div className="toggle-knob"></div>
          </div>
          <span className={isAnnual ? 'active' : ''}>{t('pricing.yearly')}</span>
          <span className="save-badge">—20%</span>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-name">{t('pricing.start.name')}</div>
            <div className="price-desc">{t('pricing.start.desc')}</div>
            <div className="price-amount">
              <span className="price-num">₴{formatNumber(isAnnual ? 399 : 499)}</span>
              <span className="price-period">{t('per.month')}</span>
            </div>
            <div className="price-features">
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.start.f1')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.start.f2')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.start.f3')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.start.f4')}</div>
            </div>
            <a href="#cta" className="price-btn price-btn-outline">{t('pricing.start.btn')}</a>
          </div>
          <div className="price-card popular">
            <span className="popular-tag">{t('pricing.pro.tag')}</span>
            <div className="price-name">{t('pricing.pro.name')}</div>
            <div className="price-desc">{t('pricing.pro.desc')}</div>
            <div className="price-amount">
              <span className="price-num">₴{formatNumber(isAnnual ? 799 : 999)}</span>
              <span className="price-period">{t('per.month')}</span>
            </div>
            <div className="price-features">
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.pro.f1')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.pro.f2')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.pro.f3')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.pro.f4')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.pro.f5')}</div>
            </div>
            <a href="#cta" className="price-btn price-btn-primary">{t('pricing.pro.btn')}</a>
          </div>
          <div className="price-card">
            <div className="price-name">{t('pricing.ent.name')}</div>
            <div className="price-desc">{t('pricing.ent.desc')}</div>
            <div className="price-amount">
              <span className="price-num">₴{formatNumber(isAnnual ? 1999 : 2499)}</span>
              <span className="price-period">{t('per.month')}</span>
            </div>
            <div className="price-features">
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.ent.f1')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.ent.f2')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.ent.f3')}</div>
              <div className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('pricing.ent.f4')}</div>
            </div>
            <a href="#cta" className="price-btn price-btn-outline">{t('pricing.ent.btn')}</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="test" id="reviews">
        <div className="test-hd">
          <span className="eyebrow">{t('reviews.eyebrow')}</span>
          <h2>{t('reviews.title')}</h2>
          <p>{t('reviews.desc')}</p>
        </div>
        <div className="test-grid">
          <div className="tc-card">
            <div className="tc-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="tc-star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <p className="tc-text" dangerouslySetInnerHTML={{__html: t('rev.1')}} />
            <div className="tc-author">
              <div className="tc-av-c" style={{background:'var(--violet)'}}>ОМ</div>
              <div><div className="tc-name">{t('rev.1.name')}</div><div className="tc-co">{t('rev.1.co')}</div></div>
            </div>
          </div>
          <div className="tc-card">
            <div className="tc-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="tc-star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <p className="tc-text" dangerouslySetInnerHTML={{__html: t('rev.2')}} />
            <div className="tc-author">
              <div className="tc-av-c" style={{background:'var(--rose)'}}>ІК</div>
              <div><div className="tc-name">{t('rev.2.name')}</div><div className="tc-co">{t('rev.2.co')}</div></div>
            </div>
          </div>
          <div className="tc-card">
            <div className="tc-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="tc-star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <p className="tc-text" dangerouslySetInnerHTML={{__html: t('rev.3')}} />
            <div className="tc-author">
              <div className="tc-av-c" style={{background:'var(--amber)'}}>АШ</div>
              <div><div className="tc-name">{t('rev.3.name')}</div><div className="tc-co">{t('rev.3.co')}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="faq-hd">
          <span className="eyebrow">FAQ</span>
          <h2>{t('faq.title')}</h2>
          <p>{t('faq.desc')}</p>
        </div>
        <div className="faq-list">
          {[
            { q: t('faq.1.q'), a: t('faq.1.a') },
            { q: t('faq.2.q'), a: t('faq.2.a') },
            { q: t('faq.3.q'), a: t('faq.3.a') },
            { q: t('faq.4.q'), a: t('faq.4.a') },
          ].map((item, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-q">
                <span>{item.q}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div className="faq-a" style={{maxHeight: openFaq === i ? '200px' : 0}}>
                <div className="faq-a-in">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="cta">
        <div className="cta-glow"></div>
        <div className="cta-c">
          <h2>{t('cta.title1')}<br/>{t('cta.title2')}<span className="gt">{t('cta.title3')}</span></h2>
          <p className="cta-desc">{t('cta.desc')}</p>
          <form className="lead-form" onSubmit={handleSubmit}>
            <div className="lead-row">
              <input type="text" placeholder={t('cta.name')} required />
              <input type="tel" placeholder={t('cta.phone')} required />
            </div>
            <div className="lead-row">
              <input type="text" placeholder={t('cta.salon')} />
            </div>
            <button type="submit" className="lead-submit">{t('cta.submit')}</button>
            <div className="lead-note">{t('cta.note')}</div>
          </form>
          <div className="cta-feats">
            <div className="cta-f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('cta.f1')}</div>
            <div className="cta-f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('cta.f2')}</div>
            <div className="cta-f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t('cta.f3')}</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-in">
          <div className="foot-l">
            <Link href="/" className="logo">
              <div className="logo-mark"><span>S</span></div>
              <span className="logo-name">ShinePRO</span>
            </Link>
            <span className="foot-copy">{t('footer.copy')}</span>
          </div>
          <div className="foot-links">
            <a href="#">{t('footer.privacy')}</a>
            <a href="#">{t('footer.terms')}</a>
            <a href="#">{t('footer.support')}</a>
          </div>
        </div>
      </footer>

      {/* TOAST */}
      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{t('toast')}</span>
      </div>
    </>
  )
}
