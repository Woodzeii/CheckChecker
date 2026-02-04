/**
 * Вспомогательные функции для работы с JWT токеном
 */

const TOKEN_KEY = 'checkchecker_token';

/**
 * Сохраняет токен в localStorage
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Получает токен из localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Удаляет токен из localStorage
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Проверяет, есть ли токен
 */
export function hasToken(): boolean {
  return !!getToken();
}
