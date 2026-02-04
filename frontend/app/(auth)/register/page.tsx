'use client';

import React from "react"

/**
 * Register Page - страница регистрации
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { register, clearError } from '@/store/slices/authSlice';
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

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Очищаем ошибку при размонтировании
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Редирект после успешной регистрации
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация на фронте
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Пароль должен содержать минимум 6 символов');
      return;
    }

    dispatch(
      register({
        login: formData.email, // Using email as login
        email: formData.email,
        name: formData.name,
        password: formData.password,
      })
    );
  };

  const isLoading = status === 'loading';
  const displayError = validationError || error;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Регистрация
        </CardTitle>
        <CardDescription className="text-center">
          Создайте аккаунт в CheckChecker
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Введите email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">ФИО</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Введите пароль (минимум 6 символов)"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Войти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
