'use client';

/**
 * ReceiptList - компонент списка чеков
 */

import { useAppDispatch } from '@/store';
import { deleteReceipt, type Receipt } from '@/store/slices/receiptsSlice';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Eye } from 'lucide-react';

interface ReceiptListProps {
  receipts: Receipt[];
  isLoading?: boolean;
}

export function ReceiptList({ receipts, isLoading }: ReceiptListProps) {
  const dispatch = useAppDispatch();

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Получение статуса на русском
  const getStatusBadge = (status: Receipt['status']) => {
    const statusConfig = {
      processed: {
        label: 'Обработан',
        className: 'bg-green-100 text-green-700',
      },
      pending: {
        label: 'В обработке',
        className: 'bg-yellow-100 text-yellow-700',
      },
      error: {
        label: 'Ошибка',
        className: 'bg-red-100 text-red-700',
      },
    };

    const config = statusConfig[status];
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleDelete = (id: string | number) => {
    dispatch(deleteReceipt(id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Загрузка чеков...</p>
        </div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Чеков пока нет
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Добавьте свой первый чек, нажав кнопку &quot;Добавить чек&quot; выше
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Магазин</TableHead>
            <TableHead className="hidden sm:table-cell">Категория</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow key={receipt.id}>
              <TableCell className="font-medium">
                {formatDate(receipt.date)}
              </TableCell>
              <TableCell>{receipt.store}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {receipt.category || '—'}
              </TableCell>
              <TableCell className="font-semibold">
                {formatAmount(receipt.totalAmount)}
              </TableCell>
              <TableCell>{getStatusBadge(receipt.status)}</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Удалить чек</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить чек?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Вы уверены, что хотите удалить чек из {receipt.store} на сумму{' '}
                        {formatAmount(receipt.totalAmount)}? Это действие нельзя отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(receipt.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
