import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api";

/**
 * Типы для категорий
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

/**
 * Получить список всех категорий
 */
export async function getCategories(): Promise<Category[]> {
  return await apiClient.get<Category[]>(API_ENDPOINTS.categories.list);
}

/**
 * Создать новую категорию
 */
export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  return await apiClient.post<Category>(API_ENDPOINTS.categories.create, data);
}

/**
 * Удалить категорию
 */
export async function deleteCategory(id: number): Promise<void> {
  return await apiClient.delete<void>(API_ENDPOINTS.categories.delete(id));
}
