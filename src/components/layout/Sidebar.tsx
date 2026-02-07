'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Calendar,
  Package,
  Shield,
  DollarSign,
  BarChart3,
  UserCog,
  Settings,
  Menu,
  X,
  ChevronRight,
  Sun,
  Palette,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';

// ─── Navigation Items ────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  mobileLabel?: string;
}

const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard, mobileLabel: 'Головна' },
  { href: '/master/today', label: 'Мій день', icon: Sun },
  { href: '/dashboard/clients', label: 'Клієнти', icon: Users },
  { href: '/dashboard/services', label: 'Послуги', icon: Palette },
  { href: '/dashboard/calendar', label: 'Календар', icon: Calendar },
  { href: '/dashboard/inventory', label: 'Склад', icon: Package },
];

const secondaryNavItems: NavItem[] = [
  { href: '/dashboard/sterilization', label: 'Стерилізація', icon: Shield },
  { href: '/dashboard/finances', label: 'Фінанси', icon: DollarSign },
  { href: '/dashboard/analytics', label: 'Аналітика', icon: BarChart3 },
];

const bottomNavItems: NavItem[] = [
  { href: '/dashboard/team', label: 'Команда', icon: UserCog },
  { href: '/dashboard/settings', label: 'Налаштування', icon: Settings },
];

// Mobile bottom bar: 5 items (Дашборд, Клієнти, Календар, Склад, Ще)
const mobileNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Головна', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Клієнти', icon: Users },
  { href: '/dashboard/calendar', label: 'Календар', icon: Calendar },
  { href: '/dashboard/inventory', label: 'Склад', icon: Package },
];

const allNavItems = [...mainNavItems, ...secondaryNavItems, ...bottomNavItems];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  if (href === '/master/today') return pathname.startsWith('/master/today');
  return pathname.startsWith(href);
}

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  );
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────

function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userName, salonName, userRole } = useAuth();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col lg:flex',
        'border-r border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--shadow-sm)]',
        '[backdrop-filter:blur(var(--glass-blur))] [-webkit-backdrop-filter:blur(var(--glass-blur))]'
      )}
    >
      {/* Logo + Salon name */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-sm font-bold text-transparent">
            {salonName || 'Shine Beauty'}
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {/* Primary items */}
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {/* Separator */}
        <div className="my-3 border-t border-[var(--glass-border)]" />

        {/* Secondary items */}
        {secondaryNavItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {/* Separator */}
        <div className="my-3 border-t border-[var(--glass-border)]" />

        {/* Bottom items */}
        {bottomNavItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Footer: User + Theme toggle + Logout */}
      <div className="border-t border-[var(--glass-border)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
              {getInitials(userName)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-text-primary block truncate text-sm font-medium">
                {userName || 'Користувач'}
              </span>
              <span className="text-text-secondary block text-xs capitalize">{userRole}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-text-muted hover:text-text-primary flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--glass-bg-hover)]"
              title="Вийти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── NavLink ─────────────────────────────────────────────────────────────────

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        active
          ? 'text-foreground bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10'
          : 'text-text-secondary hover:text-text-primary hover:bg-[var(--glass-bg-hover)]'
      )}
    >
      {/* Active indicator bar */}
      {active && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute top-1 bottom-1 left-0 w-[3px] rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}

      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors',
          active ? 'text-violet-400' : 'text-text-muted group-hover:text-text-secondary'
        )}
      />

      <span>{item.label}</span>

      {active && <ChevronRight className="text-text-muted ml-auto h-3.5 w-3.5" />}
    </Link>
  );
}

// ─── Mobile Bottom Nav ───────────────────────────────────────────────────────

function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { userName, salonName, userRole } = useAuth();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Bottom bar */}
      <nav
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 flex lg:hidden',
          'h-16 items-end justify-around border-t border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]',
          '[backdrop-filter:blur(var(--glass-blur))] [-webkit-backdrop-filter:blur(var(--glass-blur))]',
          'pb-[env(safe-area-inset-bottom,0px)]'
        )}
      >
        {mobileNavItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const isCenter = item.href === '/dashboard/calendar';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors',
                active ? 'text-violet-400' : 'text-text-muted'
              )}
            >
              {isCenter ? (
                <div
                  className={cn(
                    'flex h-10 w-10 -translate-y-1 items-center justify-center rounded-full',
                    active
                      ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'
                      : 'text-text-secondary bg-[var(--glass-bg-hover)]'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className="text-[10px] leading-tight font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* "More" button */}
        <button
          onClick={() => setSheetOpen(true)}
          className="text-text-muted flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] leading-tight font-medium">Ще</span>
        </button>
      </nav>

      {/* Full menu sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              onClick={() => setSheetOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl lg:hidden',
                'bg-background border-t border-[var(--glass-border)]',
                'pb-[env(safe-area-inset-bottom,0px)]'
              )}
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="h-1 w-10 rounded-full bg-[var(--color-text-muted)] opacity-40" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text font-bold text-transparent">
                    {salonName || 'Shine Beauty'}
                  </span>
                </div>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="text-text-secondary flex h-8 w-8 items-center justify-center rounded-full bg-[var(--glass-bg)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="space-y-0.5 px-3 pb-6">
                {allNavItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                        active
                          ? 'text-foreground bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10'
                          : 'text-text-secondary hover:bg-[var(--glass-bg-hover)]'
                      )}
                    >
                      <Icon
                        className={cn('h-5 w-5', active ? 'text-violet-400' : 'text-text-muted')}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-[var(--glass-border)] px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
                      {getInitials(userName)}
                    </div>
                    <div>
                      <span className="text-text-primary block text-sm font-medium">
                        {userName || 'Користувач'}
                      </span>
                      <span className="text-text-secondary block text-xs capitalize">
                        {userRole}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <button
                      onClick={handleLogout}
                      className="text-text-muted hover:text-text-primary flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                      title="Вийти"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}
