'use client';

import React from "react"

/**
 * Protected Layout - обёртка для защищённых страниц
 * 
 * Проверяет авторизацию и перенаправляет на /login если пользователь не авторизован
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar, MobileNav } from '@/components/Sidebar';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import { hasToken } from '@/lib/auth';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, status, user } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Если есть токен но нет user, пробуем восстановить сессию
      if (hasToken() && !user && status === 'idle') {
        await dispatch(fetchCurrentUser());
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [dispatch, user, status]);

  useEffect(() => {
    // После проверки, если не авторизован - редирект на логин
    if (!isChecking && !isAuthenticated && !hasToken()) {
      router.push('/login');
    }
  }, [isChecking, isAuthenticated, router]);

  // Показываем загрузку пока проверяем авторизацию
  if (isChecking || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если не авторизован, не показываем контент
  if (!isAuthenticated && !hasToken()) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
