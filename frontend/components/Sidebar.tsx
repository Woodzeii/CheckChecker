'use client';

/**
 * Sidebar - боковое меню для защищённых страниц
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Receipt, TrendingUp, BarChart3, History, ShoppingCart } from 'lucide-react';

const menuItems = [
  {
    label: 'Дашборд',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Расходы',
    href: '/expenses',
    icon: Receipt,
  },
  {
    label: 'Доходы',
    href: '/income',
    icon: TrendingUp,
  },
  {
    label: 'Моя корзина',
    href: '/cart',
    icon: ShoppingCart,
  },
  {
    label: 'Аналитика',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'История',
    href: '/history',
    icon: History,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-73px)] hidden md:block">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/**
 * MobileSidebar - мобильное меню (внизу экрана)
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
