'use client';

/**
 * Home Page - главная страница приложения
 * Перенаправляет на dashboard если авторизован, иначе на login
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import { hasToken } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Проверяем наличие токена
    if (hasToken() && status === 'idle') {
      dispatch(fetchCurrentUser());
    } else if (!hasToken()) {
      router.push('/login');
    }
  }, [dispatch, status]);

  useEffect(() => {
    // После проверки перенаправляем
    if (status !== 'loading' && status !== 'idle') {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Загрузка CheckChecker...</p>
      </div>
    </div>
  );
}
