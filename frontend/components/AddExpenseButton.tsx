'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function AddExpenseButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (pathname === '/expenses') {
      window.dispatchEvent(new CustomEvent('open-add-expense'));
    } else {
      router.push('/expenses');
    }
  };

  return (
    <Button
      size="sm"
      className="gap-1"
      onClick={handleClick}
    >
      <Plus className="h-4 w-4" />
      Добавить расход
    </Button>
  );
}
