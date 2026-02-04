/**
 * Categories Slice - управление категориями чеков
 * 
 * Thunks:
 * - fetchCategories: получение списка категорий
 * - createCategory: создание новой категории
 * - deleteCategory: удаление категории
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

// Типы
export interface Category {
  id: string | number;
  name: string;
  color?: string;
  icon?: string;
}

export interface CategoriesState {
  items: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Начальное состояние
const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
};

/**
 * Thunk: Получение списка категорий
 */
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>('categories/fetchCategories', async (_, { rejectWithValue }) => {
  const response = await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.LIST);

  if (response.error) {
    return rejectWithValue(response.error);
  }

  return response.data || [];
});

/**
 * Thunk: Создание новой категории
 */
export const createCategory = createAsyncThunk<
  Category,
  { name: string; color?: string; icon?: string },
  { rejectValue: string }
>('categories/createCategory', async (payload, { rejectWithValue }) => {
  const response = await apiClient.post<Category>(
    API_ENDPOINTS.CATEGORIES.CREATE,
    payload
  );

  if (response.error || !response.data) {
    return rejectWithValue(response.error || 'Не удалось создать категорию');
  }

  return response.data;
});

/**
 * Thunk: Удаление категории
 */
export const deleteCategory = createAsyncThunk<
  string | number,
  string | number,
  { rejectValue: string }
>('categories/deleteCategory', async (id, { rejectWithValue }) => {
  const response = await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));

  if (response.error) {
    return rejectWithValue(response.error);
  }

  return id;
});

// Slice
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoriesError: (state) => {
      state.error = null;
    },
    resetCategories: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Ошибка загрузки категорий';
      });

    // Create Category
    builder
      .addCase(createCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Ошибка создания категории';
      });

    // Delete Category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload || 'Ошибка удаления категории';
      });
  },
});

export const { clearCategoriesError, resetCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
