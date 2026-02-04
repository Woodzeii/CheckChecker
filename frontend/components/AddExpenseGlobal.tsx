'use client';

import { usePathname, useRouter } from 'next/navigation';
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
import { Plus, QrCode } from 'lucide-react';

export function AddExpenseGlobal() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleOpen = () => setOpen(true);

  const openManual = () => {
    if (pathname === '/expenses') {
      window.dispatchEvent(new CustomEvent('open-add-expense-manual'));
    } else {
      router.push('/expenses?openAdd=manual');
    }
    setOpen(false);
  };

  const openQr = () => {
    if (pathname === '/expenses') {
      window.dispatchEvent(new CustomEvent('open-add-expense-qr'));
    } else {
      router.push('/expenses?openAdd=qr');
    }
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" className="gap-1" onClick={handleOpen}>
        <Plus className="h-4 w-4" />
        Добавить расход
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить расход</DialogTitle>
            <DialogDescription>
              Выберите способ добавления расхода
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Button className="w-full justify-start gap-2" onClick={openManual}>
              <Plus className="h-4 w-4" />
              Добавить вручную
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={openQr}
            >
              <QrCode className="h-4 w-4" />
              Загрузить QR чек
            </Button>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
