'use client';

import React from "react"

/**
 * Income Page - All income sources, add manually
 */

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchIncomes, addIncome } from '@/store/slices/incomeSlice';
import { fetchPlannedIncomes, addPlannedIncome } from '@/store/slices/planningSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, TrendingUp, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function IncomePage() {
  const dispatch = useAppDispatch();
  const { incomes, isLoading, error } = useAppSelector((state) => state.income);
  const { plannedIncomes } = useAppSelector((state) => state.planning);

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    saveAsRecurring: false,
  });
  const [planForm, setPlanForm] = useState({
    plannedAmount: '',
    categoryName: '',
    description: '',
    saveAsRecurring: false,
  });

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    dispatch(fetchIncomes({ year: currentYear, month: currentMonth }));
    dispatch(fetchPlannedIncomes({ year: currentYear, month: currentMonth }));
  }, [dispatch, currentYear, currentMonth]);

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(incomeForm.amount);
    if (!isNaN(amount) && amount > 0) {
      await dispatch(
        addIncome({
          date: incomeForm.date,
          amount,
          category: incomeForm.category,
          description: incomeForm.description,
          saveAsRecurring: incomeForm.saveAsRecurring,
        })
      );
      setIncomeForm({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        saveAsRecurring: false,
      });
      setIncomeDialogOpen(false);
      dispatch(fetchIncomes({ year: currentYear, month: currentMonth }));
    }
  };

  const handleAddPlannedIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(planForm.plannedAmount);
    if (!isNaN(amount) && amount > 0 && planForm.categoryName) {
      await dispatch(
        addPlannedIncome({
          year: currentYear,
          month: currentMonth,
          plannedAmount: amount,
          categoryName: planForm.categoryName,
          description: planForm.description,
          saveAsRecurring: planForm.saveAsRecurring,
        })
      );
      setPlanForm({ plannedAmount: '', categoryName: '', description: '', saveAsRecurring: false });
      setPlanDialogOpen(false);
      dispatch(fetchPlannedIncomes({ year: currentYear, month: currentMonth }));
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const totalPlannedIncome = plannedIncomes.reduce(
    (sum, income) => sum + income.plannedAmount,
    0
  );
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Доходы</h1>
          <p className="text-muted-foreground mt-1">
            Отслеживайте все источники дохода
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить доход
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить доход</DialogTitle>
                <DialogDescription>
                  Внесите данные о новом источнике дохода
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddIncome}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Дата</Label>
                    <Input
                      id="date"
                      type="date"
                      value={incomeForm.date}
                      onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Сумма</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="50000"
                      value={incomeForm.amount}
                      onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Input
                      id="category"
                      placeholder="Зарплата, Фриланс, Инвестиции..."
                      value={incomeForm.category}
                      onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      placeholder="Дополнительная информация (необязательно)"
                      value={incomeForm.description}
                      onChange={(e) =>
                        setIncomeForm({ ...incomeForm, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={incomeForm.saveAsRecurring}
                      onChange={(e) =>
                        setIncomeForm({ ...incomeForm, saveAsRecurring: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="recurring" className="cursor-pointer">
                      Сохранить как повторяющийся
                    </Label>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIncomeDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">Добавить</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Добавить план
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Плановый доход</DialogTitle>
                <DialogDescription>
                  Установите ожидаемую сумму дохода на месяц
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPlannedIncome}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="planAmount">Плановая сумма</Label>
                    <Input
                      id="planAmount"
                      type="number"
                      placeholder="100000"
                      value={planForm.plannedAmount}
                      onChange={(e) => setPlanForm({ ...planForm, plannedAmount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="planCategoryName">Категория</Label>
                    <Input
                      id="planCategoryName"
                      placeholder="Зарплата, Фриланс, Инвестиции..."
                      value={planForm.categoryName}
                      onChange={(e) => setPlanForm({ ...planForm, categoryName: e.target.value })}
                      required
                    />
                  </div>
                  {/* <div>
                    <Label htmlFor="planDescription">Описание</Label>
                    <Textarea
                      id="planDescription"
                      placeholder="Зарплата, Фриланс, Инвестиции..."
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    />
                  </div> */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="planRecurring"
                      checked={planForm.saveAsRecurring}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, saveAsRecurring: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="planRecurring" className="cursor-pointer">
                      Сохранить как повторяющийся
                    </Label>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setPlanDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">Добавить</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      


      {/* Income Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Общий доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatAmount(totalIncome)}</div>
            <p className="text-xs text-green-600/70 mt-1">За текущий месяц</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                  Плановый доход
                </CardTitle>
            </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalPlannedIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ожидаемая сумма</p>
          </CardContent>
        </Card>
      </div>

    {/* Planned Incomes */} 
      {totalPlannedIncome > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Плановые доходы</CardTitle>
            <CardDescription>На текущий месяц</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plannedIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex justify-between items-center p-4 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {income.categoryName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Плановый доход
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {formatAmount(income.plannedAmount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Incomes */}
      <Card>
        <CardHeader>
          <CardTitle>Все доходы</CardTitle>
          <CardDescription>История всех поступлений</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Нет доходов</h3>
              <p className="text-sm text-muted-foreground">
                Добавьте ваш первый доход, используя кнопку выше
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>
                      {new Date(income.date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className="font-medium">{income.category}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {income.description || '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatAmount(income.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
