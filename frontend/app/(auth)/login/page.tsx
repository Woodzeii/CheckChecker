'use client';

import React from "react"

/**
 * Login Page - страница входа в систему
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [planForm, setPlanForm] = useState({
    userCategoryId: '' as string,
    plannedAmount: '',
    saveAsRecurring: false,
  });
  
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });

  // Очищаем ошибку при размонтировании
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Редирект после успешного логина
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const isLoading = status === 'loading';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Вход в систему
        </CardTitle>
        <CardDescription className="text-center">
          Введите свои данные для входа в CheckChecker
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="login">Почта</Label>
            <Input
              id="login"
              name="login"
              type="email"
              placeholder="example@mail.com"
              value={formData.login}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
