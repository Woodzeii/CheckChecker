'use client';

/**
 * AuthMenu - верхнее меню для страниц авторизации
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AuthMenu() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <Link href="/" className="text-xl font-bold text-foreground">
        CheckChecker
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          href="/login"
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === '/login'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Вход
        </Link>
        <Link
          href="/register"
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === '/register'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Регистрация
        </Link>
      </nav>
    </header>
  );
}
