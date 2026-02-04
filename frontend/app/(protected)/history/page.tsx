'use client';

/**
 * History Page - Monthly data with planned vs actual per category
 */

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchMonthlyAnalytics } from '@/store/slices/analyticsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const { monthlyAnalytics, isLoading } = useAppSelector((state) => state.analytics);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  useEffect(() => {
    dispatch(fetchMonthlyAnalytics({ year: selectedYear, month: selectedMonth }));
  }, [dispatch, selectedYear, selectedMonth]);

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
          <h1 className="text-3xl font-bold text-foreground">История</h1>
          <p className="text-muted-foreground mt-1">
            Сравнение плановых и фактических показателей по месяцам
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : analytics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Бюджет
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatAmount(analytics.initialBudget)}</div>
                <p className="text-xs text-muted-foreground mt-1">Начальный</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Доходы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  {formatAmount(analytics.actualIncome)}
                </div>
                <p className="text-xs text-green-600/70 mt-1">
                  План: {formatAmount(analytics.plannedIncome)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  Расходы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-destructive">
                  {formatAmount(analytics.actualExpensesTotal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  План: {formatAmount(analytics.plannedExpensesTotal)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Баланс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${analytics.currentBudget >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {formatAmount(analytics.currentBudget)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Текущий</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Расходы по категориям</CardTitle>
              <CardDescription>
                Сравнение плановых и фактических расходов за {' '}
                {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('ru-RU', {
                  month: 'long',
                  year: 'numeric',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.byCategory && analytics.byCategory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Категория</TableHead>
                      <TableHead className="text-right">Плановая сумма</TableHead>
                      <TableHead className="text-right">Фактическая сумма</TableHead>
                      <TableHead className="text-right">Разница</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.byCategory.map((category) => {
                      const percentage = category.planned > 0
                        ? Math.round((category.actual / category.planned) * 100)
                        : 0;
                      const isOverBudget = category.actual > category.planned;

                      return (
                        <TableRow key={category.categoryId}>
                          <TableCell className="font-medium">{category.categoryName}</TableCell>
                          <TableCell className="text-right">
                            {formatAmount(category.planned)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatAmount(category.actual)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${
                            category.difference > 0 ? 'text-destructive' : 'text-accent'
                          }`}>
                            {category.difference > 0 ? '+' : ''}{formatAmount(category.difference)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${
                            isOverBudget ? 'text-destructive' : 'text-accent'
                          }`}>
                            {percentage}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Total Row */}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>ИТОГО</TableCell>
                      <TableCell className="text-right">
                        {formatAmount(analytics.plannedExpensesTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmount(analytics.actualExpensesTotal)}
                      </TableCell>
                      <TableCell className={`text-right ${
                        analytics.actualExpensesTotal > analytics.plannedExpensesTotal
                          ? 'text-destructive'
                          : 'text-accent'
                      }`}>
                        {analytics.actualExpensesTotal > analytics.plannedExpensesTotal ? '+' : ''}
                        {formatAmount(analytics.actualExpensesTotal - analytics.plannedExpensesTotal)}
                      </TableCell>
                      <TableCell className={`text-right ${
                        analytics.actualExpensesTotal > analytics.plannedExpensesTotal
                          ? 'text-destructive'
                          : 'text-accent'
                      }`}>
                        {analytics.plannedExpensesTotal > 0
                          ? Math.round((analytics.actualExpensesTotal / analytics.plannedExpensesTotal) * 100)
                          : 0}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Нет данных по категориям</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Итоги месяца</CardTitle>
              <CardDescription>Финансовые показатели</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Начальный бюджет</span>
                  <span className="font-bold">{formatAmount(analytics.initialBudget)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                  <span className="text-sm font-medium">Всего расходов</span>
                  <span className="font-bold text-destructive">
                    -{formatAmount(analytics.actualExpensesTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                  <span className="text-sm font-medium">Всего доходов</span>
                  <span className="font-bold text-accent">
                    +{formatAmount(analytics.actualIncome)}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-lg ${
                  analytics.currentBudget >= 0 ? 'bg-accent/20' : 'bg-destructive/20'
                }`}>
                  <span className="text-base font-semibold">Текущий баланс</span>
                  <span className={`text-xl font-bold ${
                    analytics.currentBudget >= 0 ? 'text-accent' : 'text-destructive'
                  }`}>
                    {formatAmount(analytics.currentBudget)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Нет данных для отображения</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
