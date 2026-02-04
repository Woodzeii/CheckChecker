'use client';

/**
 * Header - шапка для защищённых страниц
 */
import { GlobalAddExpenseModal } from '@/components/GlobalAddExpenseModal';
import { AddExpenseButton } from '@/components/AddExpenseButton';
import { AddExpenseGlobal } from '@/components/AddExpenseGlobal';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { resetReceipts } from '@/store/slices/receiptsSlice';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

const getFirstName = (fullName: string | undefined) => {
  if (!fullName) return 'Пользователь';
  const words = fullName.trim().split(/\s+/);
  return words.length > 1 ? words[1] : words[0];
};

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(resetReceipts());
    router.push('/login');
  };

  // Get second word from full name (Surname Name Patronymic format)
  // If only one word, use that word
  const getDisplayName = (fullName: string | undefined) => {
    if (!fullName) return 'Пользователь';
    const words = fullName.trim().split(/\s+/);
    return words.length > 1 ? words[1] : words[0];
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-foreground">CheckChecker</h1>
      </div>

      <div className="flex items-center gap-4">
        <AddExpenseGlobal />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                {getDisplayName(user?.displayName)}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              Настройки
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
