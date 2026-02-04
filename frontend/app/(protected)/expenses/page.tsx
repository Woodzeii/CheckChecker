'use client';

import React from "react"

/**
 * Expenses Page - All receipts, upload QR, add manually
 */



import { useSearchParams } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";


import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchReceipts, addReceipt, deleteReceipt } from '@/store/slices/receiptsSlice';
import { fetchPlannedExpenses, addPlannedExpense } from '@/store/slices/planningSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
import { QrCode, Plus, Trash2, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type UnifiedExpense = {
  id: number;
  dateTime: string;
  storeName: string | null;
  category: string;
  amount: number;
  positions: number;
  source: 'receipt' | 'manual';
};

export default function ExpensesPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((state) => state.receipts);
  const { plannedExpenses } = useAppSelector((state) => state.planning);

  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [qrRaw, setQrRaw] = useState('');
  const [planForm, setPlanForm] = useState({
    categoryName: '',
    plannedAmount: '',
    saveAsRecurring: false,
  });
  const [allExpenses, setAllExpenses] = useState<UnifiedExpense[]>([]);
  const [isAllLoading, setIsAllLoading] = useState(false);
  const [manualForm, setManualForm] = useState({
    amount: '',
    categoryName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isCatsLoading, setIsCatsLoading] = useState(false);
  

  const getCategoryId = async (categoryName: string) => {
    const filteredExpenses = plannedExpenses.filter((expense) => expense.category?.name === categoryName);
    if (filteredExpenses.length > 0) {
      return filteredExpenses[0].categoryName;
    }
    return null;
  };
  
  
  

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    dispatch(fetchReceipts());
    dispatch(fetchPlannedExpenses({ year: currentYear, month: currentMonth }));
  }, [dispatch, currentYear, currentMonth]);

  const handleUploadQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qrRaw.trim()) {
      await dispatch(addReceipt({ qrRaw: qrRaw.trim() }));
      setQrRaw('');
      setQrDialogOpen(false);
      dispatch(fetchReceipts());
    }
  };
  
  const handleAddPlannedExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(planForm.plannedAmount);
    if (planForm.categoryName && !isNaN(amount) && amount > 0) {
      await dispatch(
        addPlannedExpense({
          year: currentYear,
          month: currentMonth,
          categoryName: planForm.categoryName,
          plannedAmount: amount,
          saveAsRecurring: planForm.saveAsRecurring,
        })
      );
      setPlanForm({ categoryName: '', plannedAmount: '', saveAsRecurring: false });
      setPlanDialogOpen(false);
      dispatch(fetchPlannedExpenses({ year: currentYear, month: currentMonth }));
    }
  };
  
  const handleDeleteReceipt = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот чек?')) {
      await dispatch(deleteReceipt(id));
      dispatch(fetchReceipts());
    }
  };

  const handleAddManualExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(manualForm.amount);
    const catId = parseInt(manualForm.categoryName, 10);
    
  
    if (!isNaN(amount) && amount > 0 && !isNaN(catId)) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264'}/api/expenses/manual`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('checkchecker_token')}`,
            },
            body: JSON.stringify({
              dateTime: new Date(manualForm.date).toISOString(),
              amount,
              userCategoryId: catId,
              description: manualForm.description,
            }),
          }
        );
  
        if (response.ok) {
          setManualForm({
            amount: '',
            categoryName: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
          });
          setManualDialogOpen(false);
          dispatch(fetchReceipts());
        }
      } catch (error) {
        console.error('Failed to add manual expense:', error);
      }
    }
  };
  

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsCatsLoading(true);
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264'}/api/categories`, // подставь свой URL
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('checkchecker_token')}`,
            },
          }
        );
        if (!resp.ok) return;
        const data = await resp.json();
        setCategories(data); // [{ id, name }]
      } finally {
        setIsCatsLoading(false);
      }
    };
  
    loadCategories();
  }, []);
  

  const handleDeleteManualExpense = async (id: number) => {
    if (!window.confirm('Удалить ручной расход?')) return;
  
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264'}/api/expenses/manual/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('checkchecker_token')}`,
        },
      }
    );
  
    if (resp.ok) {
      // обновим список
      setAllExpenses(prev => prev.filter(e => !(e.source === 'manual' && e.id === id)));
    }
  };
  

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };


  useEffect(() => {
    const refresh = () => {
      dispatch(fetchReceipts());
    };
  
    window.addEventListener('refresh-expenses', refresh);
    return () => window.removeEventListener('refresh-expenses', refresh);
  }, [dispatch]);

  // Global Add Expense 
  useEffect(() => {
    const handleManual = () => {
      setManualDialogOpen(true);
    };
  
    const handleQr = () => {
      setQrDialogOpen(true);
    };
  
    window.addEventListener('open-add-expense-manual', handleManual);
    window.addEventListener('open-add-expense-qr', handleQr);
  
    return () => {
      window.removeEventListener('open-add-expense-manual', handleManual);
      window.removeEventListener('open-add-expense-qr', handleQr);
    };
  }, []);
  const searchParams = useSearchParams();

  useEffect(() => {
    const openAdd = searchParams.get('openAdd');
    if (openAdd === 'manual') {
      setManualDialogOpen(true);
    } else if (openAdd === 'qr') {
      setQrDialogOpen(true);
    }
  }, [searchParams]);
  
  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsAllLoading(true);
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264'}/api/expenses/all`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('checkchecker_token')}`,
            },
          }
        );
        if (!resp.ok) {
          console.error('Failed to load all expenses', await resp.text());
          return;
        }
        const data: UnifiedExpense[] = await resp.json();
        setAllExpenses(data);
      } finally {
        setIsAllLoading(false);
      }
    };
  
    loadAll();
  }, []);
  
  
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Расходы</h1>
          <p className="text-muted-foreground mt-1">
            Управляйте вашими чеками и плановыми расходами
          </p>
        </div>

        <div className="flex gap-2 ml-auto">
          {/* Quick Expense Creation Dropdown */}
          <div className="relative group">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить расход
            </Button>
            <div className="absolute right-0 top-full  w-48 bg-card border border-border rounded-lg shadow-lg hidden group-hover:block z-50">
              <button
                onClick={() => setManualDialogOpen(true)}
                className="w-full text-left px-4 py-2 hover:bg-muted border-b border-border flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Добавить вручную
              </button>
              <button
                onClick={() => setQrDialogOpen(true)}
                className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Загрузить QR чек
              </button>
            </div>
          </div>
          <Button
  type="button"
  onClick={() =>
    toast({
      title: "Проверка",
      description: "Если ты это видишь, тосты работают",
    })
  }
>
  Тест тоста
</Button>
          <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить расход вручную</DialogTitle>
                <DialogDescription>
                  Внесите данные о расходе без QR-кода
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddManualExpense}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="manualDate">Дата</Label>
                    <Input
                      id="manualDate"
                      type="date"
                      value={manualForm.date}
                      onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="manualAmount">Сумма</Label>
                    <Input
                      id="manualAmount"
                      type="number"
                      placeholder="500"
                      value={manualForm.amount}
                      onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                      required
                    />
                        </div>
                        <div>
        <Label>Категория</Label>
        <div className="flex gap-2">
          <Select
            value={manualForm.categoryName}
            onValueChange={(value) =>
              setManualForm((prev) => ({ ...prev, categoryName: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={isCatsLoading ? 'Загрузка...' : 'Выберите категорию'}
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.name)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Кнопка добавления категории (открывает отдельный диалог или страницу настроек) */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setCategoryDialogOpen(true)} // сделаешь отдельный диалог, если захочешь
          >
            +
          </Button>
        </div>
      </div>
                  <div>
                    <Label htmlFor="manualDescription">Описание</Label>
                    <Input
                      id="manualDescription"
                      placeholder="Что купили..."
                      value={manualForm.description}
                      onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setManualDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">Добавить</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая категория</DialogTitle>
              <DialogDescription>
                Введите название категории, оно появится в списке.
              </DialogDescription>
            </DialogHeader>
            
<form
  onSubmit={async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264'}/api/categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('checkchecker_token')}`,
          },
          body: JSON.stringify({ name: newCategoryName.trim() }),
        }
      );

      if (!resp.ok) {
        let message = "Не удалось создать категорию";

        try {
          const data = await resp.json();
          if (typeof data.error === "string") {
            message = data.error;
          }
        } catch {
          // resp не JSON – оставляем дефолт
        }

        toast({
          variant: "destructive",
          title: "Ошибка",
          description: message,
        });

        return;
      }

      const created = await resp.json(); // { id, name }
      setCategories((prev) => [...prev, created]);
      setManualForm((prev) => ({
        ...prev,
        categoryName: created.name, // если работаешь по имени
      }));
      setCategoryDialogOpen(false);

      toast({
        title: "Категория создана",
        description: `«${created.name}» добавлена`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Ошибка сети",
        description: "Проверьте соединение и попробуйте ещё раз",
      });
    }
  }}
>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newCategory">Название категории</Label>
                  <Input
                    id="newCategory"
                    placeholder="Например, Продукты"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Сохранить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>


          <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Загрузить QR чек
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Загрузить QR чек</DialogTitle>
                <DialogDescription>
                  Вставьте данные QR-кода с чека для автоматического парсинга
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadQR}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="qr">QR-код данные</Label>
                    <Input
                      id="qr"
                      placeholder="t=20240101T1200&s=1234.56&fn=..."
                      value={qrRaw}
                      onChange={(e) => setQrRaw(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setQrDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">Загрузить</Button>
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
                <DialogTitle>Добавить плановый расход</DialogTitle>
                <DialogDescription>
                  Установите плановую сумму расходов для категории
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPlannedExpense}>
                <div className="space-y-4">
                <div>
                  <Label>Категория</Label>
                  <div className="flex gap-2">
                  <Select
                    value={manualForm.categoryName}
                    onValueChange={(value) =>
                      setManualForm((prev) => ({ ...prev, categoryName: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={isCatsLoading ? 'Загрузка...' : 'Выберите категорию'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewCategoryName('');
                        setCategoryDialogOpen(true);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
                  <div>
                    <Label htmlFor="amount">Сумма</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="15000"
                      value={planForm.plannedAmount}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, plannedAmount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={planForm.saveAsRecurring}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, saveAsRecurring: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="recurring" className="cursor-pointer">
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

      {/* Planned Expenses */}
      {plannedExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Плановые расходы</CardTitle>
            <CardDescription>На текущий месяц</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plannedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center p-4 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{expense.category?.name}</p>
                    <p className="text-sm text-muted-foreground">Плановый расход</p>
                  </div>
                  <p className="text-lg font-bold">{formatAmount(expense.plannedAmount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Все операции</CardTitle>
          <CardDescription>Чеки и ручные расходы</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : allExpenses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Нет операций</h3>
              <p className="text-sm text-muted-foreground">
                Добавьте первый чек или ручной расход, используя кнопку выше
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Источник</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Позиции</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allExpenses.map((exp) => (
                  <TableRow key={`${exp.source}-${exp.id}`}>
                    <TableCell className="font-medium">
                      {exp.source === 'receipt'
                        ? exp.storeName || 'Чек'
                        : 'Ручной расход'}
                    </TableCell>
                    <TableCell>
                      {new Date(exp.dateTime).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>{exp.category || 'Не определена'}</TableCell>
                    <TableCell>{formatAmount(exp.amount)}</TableCell>
                    <TableCell>{exp.positions}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          exp.source === 'receipt'
                            ? handleDeleteReceipt(exp.id)
                            : handleDeleteManualExpense(exp.id)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
