'use client';

import React from "react"

/**
 * Dashboard Page - Financial Analytics Overview
 */

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchMonthlyAnalytics } from '@/store/slices/analyticsSlice';
import { setBudget } from '@/store/slices/budgetSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { monthlyAnalytics, isLoading } = useAppSelector((state) => state.analytics);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [budgetInput, setBudgetInput] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  useEffect(() => {
    dispatch(fetchMonthlyAnalytics({ year: selectedYear, month: selectedMonth }));
  }, [dispatch, selectedYear, selectedMonth]);

  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetInput);
    if (!isNaN(amount) && amount > 0) {
      dispatch(setBudget({ year: selectedYear, month: selectedMonth, initialAmount: amount }));
      setShowBudgetForm(false);
      setBudgetInput('');
      setTimeout(() => {
        dispatch(fetchMonthlyAnalytics({ year: selectedYear, month: selectedMonth }));
      }, 500);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const analytics = monthlyAnalytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Дашборд</h1>
          <p className="text-muted-foreground mt-1">
            Добро пожаловать, {(() => {
              if (!user?.displayName) return 'Пользователь';
              const words = user.displayName.trim().split(/\s+/);
              return words.length > 1 ? words[1] : words[0];
            })()}
          </p>
        </div>

        {/* Month/Year Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-card border border-border rounded-md px-3 py-2 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleDateString('ru-RU', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-card border border-border rounded-md px-3 py-2 text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget Setup */}
      {!analytics?.initialBudget && !showBudgetForm ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Установите бюджет на месяц</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Установите начальный бюджет для отслеживания расходов и доходов
            </p>
            <Button onClick={() => setShowBudgetForm(true)}>
              Установить бюджет
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {showBudgetForm && (
        <Card>
          <CardHeader>
            <CardTitle>Установить бюджет</CardTitle>
            <CardDescription>
              Укажите начальную сумму бюджета на {selectedMonth}/{selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetBudget} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="budget">Начальная сумма</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="50000"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit">Сохранить</Button>
                <Button type="button" variant="outline" onClick={() => setShowBudgetForm(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Initial Budget */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Начальный бюджет
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(analytics.initialBudget)}</div>
                <p className="text-xs text-muted-foreground mt-1">На начало месяца</p>
              </CardContent>
            </Card>

            {/* Current Budget */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Текущий баланс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analytics.currentBudget >= analytics.initialBudget ? 'text-green-600' : 'text-red-600'}`}>
                  {formatAmount(analytics.currentBudget)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.initialBudget} - {formatAmount(analytics.actualExpensesTotal)} + {formatAmount(analytics.actualIncome)}
                </p>
              </CardContent>
            </Card>

            {/* Total Income */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  Доходы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatAmount(analytics.actualIncome)}</div>
                <p className="text-xs text-green-600/70 mt-1">
                  План: {formatAmount(analytics.plannedIncome)}
                </p>
              </CardContent>
            </Card>

            {/* Total Expenses */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                  Расходы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatAmount(analytics.actualExpensesTotal)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  План: {formatAmount(analytics.plannedExpensesTotal)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          {analytics.byCategory && analytics.byCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Сравнение трат по категориям (топ-10)</CardTitle>
                <CardDescription>Плановые vs фактические расходы с наглядным сравнением</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics.byCategory.slice(0, 10).map((category) => (
                    <div key={category.categoryId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-base">{category.categoryName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            План: {formatAmount(category.planned)}
                          </span>
                          <span className="text-sm font-semibold">
                            Факт: {formatAmount(category.actual)}
                          </span>
                        </div>
                      </div>
                      {/* Comparison bars with plan line */}
                      <div className="relative">
                        {/* Background bar showing max value */}
                        <div className="h-8 bg-secondary rounded-lg overflow-hidden relative">
                          {/* Actual spending bar */}
                          <div
                            className={`absolute top-0 left-0 h-full transition-all ${
                              category.actual > category.planned ? 'bg-destructive' : 'bg-green-600'
                            }`}
                            style={{
                              width: `${Math.min((category.actual / Math.max(category.planned, category.actual)) * 100, 100)}%`,
                            }}
                          >
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-semibold">
                              {formatAmount(category.actual)}
                            </span>
                          </div>
                          {/* Plan indicator line */}
                          {category.planned > 0 && (
                            <div
                              className="absolute top-0 h-full w-1 bg-blue-500"
                              style={{
                                left: `${Math.min((category.planned / Math.max(category.planned, category.actual)) * 100, 100)}%`,
                              }}
                              title={`План: ${formatAmount(category.planned)}`}
                            >
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-blue-500" />
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500" />
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Legend */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                          <span className="text-muted-foreground">Линия плана</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-sm ${
                            category.actual > category.planned ? 'bg-destructive' : 'bg-green-600'
                          }`} />
                          <span className="text-muted-foreground">
                            {category.actual > category.planned ? 'Превышение' : 'В пределах плана'}
                          </span>
                        </div>
                        <span
                          className={`ml-auto font-semibold ${
                            category.difference < 0 ? 'text-green-600' : 'text-destructive'
                          }`}
                        >
                          {category.difference < 0 ? 'Экономия' : 'Перерасход'}: {formatAmount(Math.abs(category.difference))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
