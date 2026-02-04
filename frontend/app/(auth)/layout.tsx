'use client';

import React from "react"

/**
 * Auth Layout - обёртка для страниц авторизации
 * 
 * Включает AuthMenu и проверяет, не авторизован ли уже пользователь
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthMenu } from '@/components/AuthMenu';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import { hasToken } from '@/lib/auth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Если есть токен, пробуем восстановить сессию
    if (hasToken() && !isAuthenticated && status === 'idle') {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, status]);

  useEffect(() => {
    // Если пользователь уже авторизован, перенаправляем на dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Показываем загрузку пока проверяем сессию
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  // Если уже авторизован, не показываем контент (будет редирект)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <AuthMenu />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
