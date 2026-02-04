'use client';

/**
 * Analytics Page - Monthly chart with income/expenses, budget calculations
 */

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchMonthlyAnalytics } from '@/store/slices/analyticsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
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

  // Prepare chart data
  const chartData = monthlyAnalytics?.dailySeries
    ? monthlyAnalytics.dailySeries.dates.map((date, index) => ({
        date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        income: monthlyAnalytics.dailySeries.incomes[index],
        expenses: monthlyAnalytics.dailySeries.expenses[index],
      }))
    : [];

  const analytics = monthlyAnalytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Аналитика</h1>
          <p className="text-muted-foreground mt-1">
            Визуализация финансовых показателей
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Текущий бюджет
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analytics.currentBudget >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {formatAmount(analytics.currentBudget)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Начальный: {formatAmount(analytics.initialBudget)}
                </p>
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
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(analytics.actualIncome)}
                </div>
                <p className="text-xs text-green-600/70 mt-1">
                  План: {formatAmount(analytics.plannedIncome)}
                  {analytics.plannedIncome > 0 && (
                    <span className={`ml-1 ${analytics.actualIncome >= analytics.plannedIncome ? 'text-green-600' : 'text-destructive'}`}>
                      ({Math.round((analytics.actualIncome / analytics.plannedIncome) * 100)}%)
                    </span>
                  )}
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
                <div className="text-2xl font-bold text-destructive">
                  {formatAmount(analytics.actualExpensesTotal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  План: {formatAmount(analytics.plannedExpensesTotal)}
                  {analytics.plannedExpensesTotal > 0 && (
                    <span className={`ml-1 ${analytics.actualExpensesTotal <= analytics.plannedExpensesTotal ? 'text-accent' : 'text-destructive'}`}>
                      ({Math.round((analytics.actualExpensesTotal / analytics.plannedExpensesTotal) * 100)}%)
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>Расчет бюджета</CardTitle>
              <CardDescription>Как изменился бюджет за месяц</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Начальный</p>
                    <p className="text-xl font-bold">{formatAmount(analytics.initialBudget)}</p>
                  </div>
                  <span className="text-2xl text-destructive font-bold">-</span>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Расходы</p>
                    <p className="text-xl font-bold text-destructive">
                      {formatAmount(analytics.actualExpensesTotal)}
                    </p>
                  </div>
                  <span className="text-2xl text-accent font-bold">+</span>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Доходы</p>
                    <p className="text-xl font-bold text-accent">
                      {formatAmount(analytics.actualIncome)}
                    </p>
                  </div>
                  <span className="text-2xl font-bold">=</span>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Текущий</p>
                    <p className={`text-xl font-bold ${analytics.currentBudget >= 0 ? 'text-accent' : 'text-destructive'}`}>
                      {formatAmount(analytics.currentBudget)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>График доходов и расходов</CardTitle>
                <CardDescription>
                  Динамика по дням месяца (зеленый - доходы, красный - расходы)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatAmount(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#16a34a"
                      strokeWidth={3}
                      name="Доходы"
                      dot={{ fill: '#16a34a', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#dc2626"
                      strokeWidth={3}
                      name="Расходы"
                      dot={{ fill: '#dc2626', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Category Comparison */}
          {analytics.byCategory && analytics.byCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Сравнение плановых и фактических расходов</CardTitle>
                <CardDescription>По каждой категории</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.byCategory.map((category) => (
                    <div key={category.categoryId} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{category.categoryName}</h3>
                        <span
                          className={`text-sm font-semibold ${
                            category.difference < 0 ? 'text-green-600' : 'text-destructive'
                          }`}
                        >
                          {category.difference < 0 ? '↓' : '↑'} {formatAmount(Math.abs(category.difference))}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Плановые</p>
                          <p className="text-lg font-bold">{formatAmount(category.planned)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Фактические</p>
                          <p className={`text-lg font-bold ${
                            category.actual > category.planned ? 'text-destructive' : 'text-green-600'
                          }`}>
                            {formatAmount(category.actual)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 relative h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary"
                          style={{
                            width: `${Math.min((category.actual / Math.max(category.planned, category.actual)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interesting Facts */}
          {chartData.length > 0 && analytics.byCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Интересные факты</CardTitle>
                <CardDescription>Статистика за выбранный месяц</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Most expensive category */}
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Самая затратная категория</p>
                    <p className="text-xl font-bold text-destructive">
                      {analytics.byCategory.reduce((max, cat) => 
                        cat.actual > max.actual ? cat : max
                      ).categoryName}
                    </p>
                    <p className="text-sm mt-1">
                      {formatAmount(analytics.byCategory.reduce((max, cat) => 
                        cat.actual > max.actual ? cat : max
                      ).actual)}
                    </p>
                  </div>
                  {/* Most expensive day */}
                  <div className="p-4 bg-orange-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Самый затратный день</p>
                    <p className="text-xl font-bold text-orange-600">
                      {(() => {
                        const maxIndex = analytics.dailySeries.expenses.indexOf(
                          Math.max(...analytics.dailySeries.expenses)
                        );
                        return new Date(analytics.dailySeries.dates[maxIndex]).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long'
                        });
                      })()}
                    </p>
                    <p className="text-sm mt-1">
                      {formatAmount(Math.max(...analytics.dailySeries.expenses))}
                    </p>
                  </div>
                  {/* Average daily expense */}
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Средний расход в день</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatAmount(
                        analytics.dailySeries.expenses.reduce((a, b) => a + b, 0) / 
                        analytics.dailySeries.expenses.filter(e => e > 0).length
                      )}
                    </p>
                    <p className="text-sm mt-1">
                      {analytics.dailySeries.expenses.filter(e => e > 0).length} дней с тратами
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          
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
