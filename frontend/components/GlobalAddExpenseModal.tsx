'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

export function GlobalAddExpenseModal() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');

  const handleOpen = () => setOpen(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!categoryName || isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264'}/api/Expenses/manual`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('checkchecker_token')}`,
          },
          body: JSON.stringify({
            dateTime: new Date(date).toISOString(),
            amount: parsedAmount,
            // глобально у нас нет plannedExpenses, поэтому просто шлём без userCategoryId
            userCategoryId: null,
            description: description || categoryName,
          }),
        }
      );

      if (response.ok) {
        setAmount('');
        setCategoryName('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setOpen(false);
        // опционально: можно диспатчить событие, чтобы страница расходов перезагрузила список
        window.dispatchEvent(new CustomEvent('refresh-expenses'));
      }
    } catch (err) {
      console.error('Failed to add global expense:', err);
    }
  };

  return (
    <>
      {/* Кнопка, которую вставим в Header рядом с пользователем */}
      <Button size="sm" className="gap-1" onClick={handleOpen}>
        <Plus className="h-4 w-4" />
        Добавить расход
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить расход</DialogTitle>
            <DialogDescription>
              Быстрое добавление расхода с любой страницы
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="globalDate">Дата</Label>
                <Input
                  id="globalDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="globalAmount">Сумма</Label>
                <Input
                  id="globalAmount"
                  type="number"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="globalCategory">Категория</Label>
                <Input
                  id="globalCategory"
                  placeholder="Продукты, Транспорт..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="globalDescription">Описание</Label>
                <Textarea
                  id="globalDescription"
                  placeholder="Что купили..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Добавить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
