'use client';

/**
 * Receipts Page - страница списка чеков
 */

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchReceipts } from '@/store/slices/receiptsSlice';
import { ReceiptList } from '@/components/ReceiptList';
import { AddReceiptModal } from '@/components/AddReceiptModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Receipt, TrendingUp } from 'lucide-react';

export default function ReceiptsPage() {
  const dispatch = useAppDispatch();
  const { items, totalCount, totalAmount, status, error } = useAppSelector(
    (state) => state.receipts
  );
// Но реально выпил.)
  useEffect(() => {
    // Загружаем чеки при первом рендере
    if (status === 'idle') {
      dispatch(fetchReceipts());
    }
  }, [dispatch, status]);

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Мои чеки
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление вашими чеками и расходами
          </p>
        </div>
        <AddReceiptModal />
      </div>

      {/* Краткая статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего чеков
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общая сумма
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ошибка загрузки */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Список чеков */}
      <Card>
        <CardHeader>
          <CardTitle>Список чеков</CardTitle>
          <CardDescription>
            Все ваши добавленные чеки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceiptList receipts={items} isLoading={status === 'loading'} />
        </CardContent>
      </Card>
    </div>
  );
}
