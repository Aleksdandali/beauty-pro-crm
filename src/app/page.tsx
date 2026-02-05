"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Wallet, 
  Bell, 
  Package,
  Check,
  ChevronDown,
  Menu,
  X,
  Star,
  ArrowRight,
  Sparkles
} from "lucide-react";

// Animation hook for scroll-triggered fade-in
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Animated section wrapper
function AnimatedSection({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const { ref, isInView } = useInView();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// Feature card data
const features = [
  {
    icon: Calendar,
    title: "Онлайн-запис",
    description: "Клієнти записуються 24/7 через ваш сайт або соцмережі. Автоматичне підтвердження та синхронізація з календарем."
  },
  {
    icon: Users,
    title: "База клієнтів + RFM",
    description: "Повна історія візитів, вподобання та RFM-сегментація. Знайте хто ваші VIP, а хто потребує уваги."
  },
  {
    icon: BarChart3,
    title: "Аналітика",
    description: "Дашборд з виручкою, популярними послугами, завантаженістю майстрів. Приймайте рішення на основі даних."
  },
  {
    icon: Wallet,
    title: "Фінанси",
    description: "Облік доходів та витрат, зарплати майстрів, комісії. Завжди знайте скільки заробляєте."
  },
  {
    icon: Bell,
    title: "Нагадування",
    description: "Автоматичні нагадування клієнтам через Telegram або SMS за 24 години до візиту. Менше no-show."
  },
  {
    icon: Package,
    title: "Склад",
    description: "Облік матеріалів та косметики. Сповіщення коли товар закінчується. Контроль списання."
  }
];

// Pricing plans
const plans = [
  {
    name: "Free",
    price: "0",
    description: "Для початку",
    features: [
      "До 2 майстрів",
      "До 100 клієнтів",
      "Базовий календар",
      "Email підтримка"
    ],
    cta: "Почати безкоштовно",
    popular: false
  },
  {
    name: "Pro",
    price: "499",
    description: "Для зростаючих салонів",
    features: [
      "До 10 майстрів",
      "До 1000 клієнтів",
      "Telegram нагадування",
      "Повна аналітика",
      "RFM сегментація",
      "Пріоритетна підтримка"
    ],
    cta: "Спробувати Pro",
    popular: true
  },
  {
    name: "Business",
    price: "1499",
    description: "Для мережі салонів",
    features: [
      "Необмежено майстрів",
      "Необмежено клієнтів",
      "SMS нагадування",
      "API інтеграції",
      "Мультифіліальність",
      "Персональний менеджер"
    ],
    cta: "Зв'язатись з нами",
    popular: false
  }
];

// Testimonials
const testimonials = [
  {
    name: "Олена Коваленко",
    role: "Власниця Beauty Lab",
    avatar: "ОК",
    content: "Нарешті все в одному місці! Раніше записували в блокнот, потім Excel... Тепер все автоматизовано. Клієнти самі записуються, отримують нагадування. Кількість no-show зменшилась на 70%.",
    rating: 5
  },
  {
    name: "Марина Степаненко",
    role: "Nail Studio Kyiv",
    avatar: "МС",
    content: "Аналітика — це щось! Тепер бачу хто з майстрів приносить найбільше, які послуги популярні. За 3 місяці збільшили виручку на 40% просто оптимізувавши розклад.",
    rating: 5
  },
  {
    name: "Андрій Мельник",
    role: "Barbershop BLADE",
    avatar: "АМ",
    content: "Перейшли з іншої CRM — небо і земля. Інтерфейс інтуїтивний, команда освоїла за день. Telegram-бот для записів — це must have для сучасного барбершопу.",
    rating: 5
  }
];

// FAQ items
const faqItems = [
  {
    question: "Чи потрібна банківська карта для реєстрації?",
    answer: "Ні, для безкоштовного тарифу карта не потрібна. Ви можете користуватись Free-планом скільки завгодно без жодних платежів."
  },
  {
    question: "Чи можна імпортувати клієнтів з Excel?",
    answer: "Так! Ми підтримуємо імпорт з Excel та CSV файлів. Просто завантажте файл і система автоматично розпізнає колонки з даними клієнтів."
  },
  {
    question: "Чи працює система на телефоні?",
    answer: "Так, Beauty Pro CRM повністю адаптована для мобільних пристроїв. Ви можете керувати салоном зі смартфона так само зручно, як з комп'ютера."
  },
  {
    question: "Як підключити Telegram-нагадування?",
    answer: "В налаштуваннях салону є розділ 'Інтеграції'. Підключення Telegram займає 2 хвилини — просто авторизуйте бота і готово. Доступно на тарифах Pro та Business."
  }
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Fixed Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Beauty Pro
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                Можливості
              </a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                Ціни
              </a>
              <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">
                Відгуки
              </a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Link 
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Увійти
              </Link>
              <Link 
                href="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              >
                Спробувати безкоштовно
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-6 space-y-4">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg text-gray-300 hover:text-white transition-colors"
              >
                Можливості
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg text-gray-300 hover:text-white transition-colors"
              >
                Ціни
              </a>
              <a 
                href="#testimonials" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg text-gray-300 hover:text-white transition-colors"
              >
                Відгуки
              </a>
              <div className="pt-4 space-y-3 border-t border-white/10">
                <Link 
                  href="/login"
                  className="block w-full text-center py-3 text-gray-300 border border-white/20 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Увійти
                </Link>
                <Link 
                  href="/register"
                  className="block w-full text-center py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl"
                >
                  Спробувати безкоштовно
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 mb-8">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              14 днів безкоштовно • Без карти
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
              CRM для салонів краси,
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                яка працює на вас
              </span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Керуйте записами, клієнтами та фінансами в одному місці. 
              Автоматизуйте рутину та зосередьтесь на тому, що важливо.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center justify-center gap-2 group"
              >
                Почати безкоштовно
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Подивитись демо
              </Link>
            </div>
          </AnimatedSection>

          {/* Dashboard Mockup */}
          <AnimatedSection delay={400}>
            <div className="mt-16 md:mt-20 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none" />
              <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-2xl shadow-violet-500/10 overflow-hidden">
                {/* Window Controls */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-500">Beauty Pro CRM — Dashboard</span>
                  </div>
                </div>
                {/* Dashboard Content */}
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                    {[
                      { label: "Виручка сьогодні", value: "₴ 12,450", color: "from-emerald-500 to-teal-500" },
                      { label: "Записи на сьогодні", value: "18", color: "from-blue-500 to-cyan-500" },
                      { label: "Нові клієнти", value: "+12", color: "from-violet-500 to-purple-500" },
                      { label: "Завантаженість", value: "87%", color: "from-fuchsia-500 to-pink-500" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/5">
                        <p className="text-[10px] md:text-xs text-gray-500 mb-1">{stat.label}</p>
                        <p className={`text-lg md:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Calendar Preview */}
                  <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs md:text-sm font-medium text-gray-300">Записи на сьогодні</span>
                      <span className="text-[10px] md:text-xs text-gray-500">5 лютого 2026</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { time: "10:00", client: "Марія К.", service: "Стрижка + Фарбування", master: "Оксана", color: "bg-violet-500" },
                        { time: "11:30", client: "Анна С.", service: "Манікюр", master: "Юлія", color: "bg-fuchsia-500" },
                        { time: "14:00", client: "Олена М.", service: "Педикюр", master: "Катерина", color: "bg-pink-500" }
                      ].map((apt, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 md:p-3 bg-white/5 rounded-lg">
                          <div className={`w-1 h-8 md:h-10 ${apt.color} rounded-full`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-white truncate">{apt.client}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 truncate">{apt.service} • {apt.master}</p>
                          </div>
                          <span className="text-[10px] md:text-xs text-gray-400">{apt.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                Все для вашого салону
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Потужні інструменти, які спростять управління та допоможуть заробляти більше
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="group h-full p-6 md:p-8 bg-[#111111] rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/5">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30 transition-colors">
                    <feature.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#111111]/50">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                Як це працює
              </h2>
              <p className="text-lg text-gray-400">
                Почніть за 10 хвилин — без навчання та складних налаштувань
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {[
              { step: "01", title: "Зареєструйтесь", description: "Створіть акаунт за 2 хвилини. Без карти, без зобов'язань.", time: "2 хв" },
              { step: "02", title: "Налаштуйте салон", description: "Додайте послуги, ціни та майстрів. Імпортуйте клієнтів з Excel.", time: "5 хв" },
              { step: "03", title: "Приймайте записи", description: "Готово! Клієнти можуть записуватись, а ви — керувати всім з телефона.", time: "∞" }
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 150}>
                <div className="relative">
                  {/* Connector line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
                  )}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl text-2xl font-bold mb-6 shadow-lg shadow-violet-500/25">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                    <p className="text-gray-400 mb-3">{item.description}</p>
                    <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs text-gray-500">
                      {item.time}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                Прості та прозорі ціни
              </h2>
              <p className="text-lg text-gray-400">
                Оберіть план під розмір вашого салону. Змінюйте в будь-який момент.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {plans.map((plan, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div 
                  className={`relative h-full p-6 md:p-8 rounded-2xl border transition-all ${
                    plan.popular 
                      ? "bg-gradient-to-b from-violet-500/10 to-fuchsia-500/10 border-violet-500/30 shadow-xl shadow-violet-500/10" 
                      : "bg-[#111111] border-white/5 hover:border-white/10"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold rounded-full">
                        Найпопулярніший
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl md:text-5xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">₴/міс</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`block w-full py-3 text-center font-semibold rounded-xl transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25"
                        : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#111111]/50">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                Нас обирають професіонали
              </h2>
              <p className="text-lg text-gray-400">
                Понад 500+ салонів вже використовують Beauty Pro CRM
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="h-full p-6 md:p-8 bg-[#0a0a0a] rounded-2xl border border-white/5">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-sm font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                Часті питання
              </h2>
              <p className="text-lg text-gray-400">
                Не знайшли відповідь? Напишіть нам — відповімо за 5 хвилин
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <AnimatedSection key={i} delay={i * 50}>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-white pr-4">{item.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        openFaq === i ? "rotate-180" : ""
                      }`} 
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-400 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20 blur-[100px] -z-10" />
              
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Готові почати?
              </h2>
              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Приєднуйтесь до сотень салонів, які вже автоматизували свій бізнес
              </p>
              <Link 
                href="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 group"
              >
                Створити акаунт безкоштовно
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Без карти • Налаштування за 10 хвилин • Скасувати можна будь-коли
              </p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Beauty Pro</span>
              </Link>
              <p className="text-gray-500 max-w-sm mb-6">
                CRM система для салонів краси. Автоматизуйте рутину та зосередьтесь на клієнтах.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Продукт</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-500 hover:text-white transition-colors">Можливості</a></li>
                <li><a href="#pricing" className="text-gray-500 hover:text-white transition-colors">Ціни</a></li>
                <li><a href="#testimonials" className="text-gray-500 hover:text-white transition-colors">Відгуки</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Контакти</h4>
              <ul className="space-y-3">
                <li className="text-gray-500">support@beautypro.ua</li>
                <li className="text-gray-500">+380 (44) 123-45-67</li>
                <li className="text-gray-500">Київ, Україна</li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 Beauty Pro CRM. Всі права захищені.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Політика конфіденційності</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Умови використання</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
