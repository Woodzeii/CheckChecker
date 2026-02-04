/**
 * API Client - обёртка над fetch для работы с backend
 * 
 * Автоматически:
 * - Подставляет baseURL из конфига
 * - Добавляет Authorization header с JWT токеном
 * - Обрабатывает JSON responses
 * - Обрабатывает ошибки 401 (Unauthorized)
 */

import { BASE_URL } from '@/config/api';
import { getToken, removeToken } from '@/lib/auth';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Базовая функция для API запросов
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options;
  
  const url = `${BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Добавляем Authorization header если есть токен и не пропускаем авторизацию
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Обработка 401 - токен невалиден или истёк
    if (response.status === 401) {
      removeToken();
      // Можно добавить редирект на логин или dispatch logout action
      // Это будет обработано в Redux thunks
    }

    // Пытаемся распарсить JSON
    let data: T | undefined;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // Ответ не JSON
      }
    }

    if (!response.ok) {
      const errorMessage = 
        (data as { message?: string })?.message || 
        (data as { error?: string })?.error || 
        `Ошибка ${response.status}`;
      
      return {
        error: errorMessage,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('[API Client] Request error:', error);
    return {
      error: error instanceof Error ? error.message : 'Ошибка сети',
      status: 0,
    };
  }
}

/**
 * GET запрос
 */
export function get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST запрос
 */
export function post<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT запрос
 */
export function put<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE запрос
 */
export function del<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { ...options, method: 'DELETE' });
}

export const apiClient = {
  get,
  post,
  put,
  delete: del,
};

export default apiClient;
