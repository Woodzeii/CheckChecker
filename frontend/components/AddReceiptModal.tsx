'use client';

import React from "react"

/**
 * AddReceiptModal - модальное окно для добавления чека
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addReceipt } from '@/store/slices/receiptsSlice';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, QrCode } from 'lucide-react';

export function AddReceiptModal() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.receipts);
  
  const [isOpen, setIsOpen] = useState(false);
  const [rawData, setRawData] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rawData.trim()) return;

    const result = await dispatch(addReceipt({ rawData: rawData.trim() }));
    
    if (addReceipt.fulfilled.match(result)) {
      setRawData('');
      setIsOpen(false);
    }
  };

  const isLoading = status === 'loading';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Добавить чек
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить новый чек</DialogTitle>
          <DialogDescription>
            Введите данные QR-кода или строку чека для обработки
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="rawData">Данные чека</Label>
              <Textarea
                id="rawData"
                placeholder="Вставьте данные QR-кода или строку чека..."
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                rows={5}
                disabled={isLoading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Поддерживается формат QR-кода ФНС или ручной ввод данных
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <QrCode className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Скоро: сканирование QR-кода через камеру
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading || !rawData.trim()}>
              {isLoading ? 'Отправка...' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
