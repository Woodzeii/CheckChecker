'use client';

import React from "react"

/**
 * Cart Page - View receipt contents, categories, manage categories
 */

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchReceipts } from '@/store/slices/receiptsSlice';
import { fetchCategories, deleteCategory } from '@/store/slices/categoriesSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, Calendar, Trash2, Edit2, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

interface CategoryStats {
  categoryName: string;
  totalAmount: number;
  itemCount: number;
  topItems: string[];
}

interface ReceiptAnalytics {
  categories: CategoryStats[];
}

export default function CartPage() {
  const dispatch = useAppDispatch();
  const receiptsState = useAppSelector((state) => state.receipts);
  const categoriesState = useAppSelector((state) => state.categories);
  
  const receipts = receiptsState?.items ?? [];
  const isLoading = receiptsState?.isLoading ?? false;
  const categories = categoriesState?.items ?? [];

  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [analytics, setAnalytics] = useState<ReceiptAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    dispatch(fetchReceipts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    loadAnalytics();
  }, [selectedYear, selectedMonth]);

  const loadAnalytics = async () => {
    const response = await apiClient.get<ReceiptAnalytics>(
      API_ENDPOINTS.RECEIPT_ANALYTICS.ANALYTICS(selectedYear, selectedMonth)
    );

    if (response.data) {
      setAnalytics(response.data);
    } else {
      setError(response.error || 'Не удалось загрузить аналитику');
    }
  };

  const handleViewReceipt = (receipt: any) => {
    setSelectedReceipt(receipt);
    setReceiptDialogOpen(true);
  };
  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
  
    try {
      const response = await apiClient.post('/api/Categories', {
        name: newCategory.trim(),
      });
  
      if (!response.error) {
        setNewCategory('');
        setAddDialogOpen(false);
        dispatch(fetchCategories());
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Ошибка при добавлении категории');
    }
  };
  

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      await dispatch(deleteCategory(id));
      dispatch(fetchCategories());
    }
  };

  const handleRenameCategory = (id: number, currentName: string) => {
    setSelectedCategoryId(id);
    setNewCategoryName(currentName);
    setRenameDialogOpen(true);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategoryId && newCategoryName.trim()) {
      try {
        const response = await apiClient.put(
          `/api/Receipts/${selectedCategoryId}`,
          { name: newCategoryName.trim() }
        );
        if (!response.error) {
          dispatch(fetchCategories());
          setRenameDialogOpen(false);
          setSelectedCategoryId(null);
          setNewCategoryName('');
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('Ошибка при переименовании категории');
      }
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Моя корзина</h1>
          <p className="text-muted-foreground mt-1">
            Просматривайте чеки и управляйте категориями
          </p>
        </div>

        {/* Month/Year Selector for Categories */}
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Categories Statistics */}
      {analytics && analytics.categories && analytics.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Расходы по категориям</CardTitle>
            <CardDescription>
              Статистика трат за {selectedMonth}/{selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categories.map((category, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{category.categoryName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.itemCount} {category.itemCount === 1 ? 'товар' : 'товаров'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-destructive">
                        {formatAmount(category.totalAmount)}
                      </p>
                    </div>
                  </div>
                  {category.topItems && category.topItems.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Популярные товары:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.topItems.slice(0, 5).map((item, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>Все чеки</CardTitle>
          <CardDescription>Нажмите на чек, чтобы посмотреть содержимое</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Нет чеков</h3>
              <p className="text-sm text-muted-foreground">
                Загрузите чеки в разделе Расходы
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Магазин</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Позиции</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{receipt.storeName || 'Неизвестно'}</TableCell>
                    <TableCell>
                      {new Date(receipt.dateTime).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(receipt.totalSum)}
                    </TableCell>
                    <TableCell>{receipt.items?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReceipt(receipt)}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card>
      <CardHeader className="flex flex-row items-center justify-between">
  <div>
    <CardTitle>Управление категориями</CardTitle>
    <CardDescription>Редактируйте или удаляйте категории</CardDescription>
  </div>
  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
    <DialogTrigger asChild>
      <Button size="sm">
        Добавить категорию
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Добавить категорию</DialogTitle>
        <DialogDescription>
          Введите название новой категории расходов
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleAddCategory}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newCategory">Название категории</Label>
            <Input
              id="newCategory"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Например, Подписки"
              required
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAddDialogOpen(false)}
          >
            Отмена
          </Button>
          <Button type="submit">Добавить</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</CardHeader>

        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                У вас пока нет пользовательских категорий
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRenameCategory(category.id, category.name)}
                      >
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Button>
                      {category.name !== 'Другое' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Receipt Details Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Содержимое чека</DialogTitle>
            <DialogDescription>
              {selectedReceipt?.storeName || 'Магазин'} -{' '}
              {selectedReceipt && new Date(selectedReceipt.dateTime).toLocaleDateString('ru-RU')}
            </DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Общая сумма:</span>
                  <span className="font-bold text-lg">
                    {formatAmount(selectedReceipt.totalSum)}
                  </span>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead>Кол-во</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedReceipt.items?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatAmount(item.price)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatAmount(item.sum)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setReceiptDialogOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Category Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать категорию</DialogTitle>
            <DialogDescription>
              Введите новое имя для категории
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRename}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newCategoryName">Новое имя</Label>
                <Input
                  id="newCategoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Введите новое имя"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
