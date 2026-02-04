/**
 * Receipts Slice - управление состоянием чеков
 * 
 * Thunks:
 * - fetchReceipts: получение списка чеков
 * - addReceipt: добавление нового чека
 * - deleteReceipt: удаление чека
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

// Типы
export interface ReceiptItem {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  sum: number;
  category?: string | null;
}

export interface Receipt {
  id: number;
  qrRaw: string;
  totalSum: number;
  dateTime: string;
  storeName?: string | null;
  items?: ReceiptItem[];
}

export interface ReceiptsState {
  items: Receipt[];
  isLoading: boolean;
  error: string | null;
}

export interface AddReceiptPayload {
  rawData: string; // Строка QR-кода или данные чека
}

// Начальное состояние
const initialState: ReceiptsState = {
  items: [],
  isLoading: false,
  error: null,
};

/**
 * Thunk: Получение списка чеков
 */
export const fetchReceipts = createAsyncThunk<
  Receipt[],
  void,
  { rejectValue: string }
>('receipts/fetchReceipts', async (_, { rejectWithValue }) => {
  const response = await apiClient.get<Receipt[]>(API_ENDPOINTS.RECEIPTS.LIST);

  if (response.error) {
    return rejectWithValue(response.error);
  }

  // Если API не доступен, возвращаем демо-данные
  // TODO: Удалить после подключения реального API
  if (!response.data) {
    return getDemoReceipts();
  }

  return response.data;
});

/**
 * Thunk: Добавление нового чека (парсинг QR-кода)
 */
export const addReceipt = createAsyncThunk<
  Receipt,
  AddReceiptPayload,
  { rejectValue: string }
>('receipts/addReceipt', async (payload, { rejectWithValue }) => {
  const response = await apiClient.post<Receipt>(
    API_ENDPOINTS.RECEIPTS.PARSE,
    payload
  );

  if (response.error || !response.data) {
    return rejectWithValue(response.error || 'Не удалось добавить чек');
  }

  return response.data;
});

/**
 * Thunk: Debug raw receipt data
 */
export const debugRawReceipt = createAsyncThunk<
  unknown,
  AddReceiptPayload,
  { rejectValue: string }
>('receipts/debugRawReceipt', async (payload, { rejectWithValue }) => {
  const response = await apiClient.post<unknown>(
    API_ENDPOINTS.RECEIPTS.DEBUG_RAW,
    payload
  );

  if (response.error) {
    return rejectWithValue(response.error);
  }

  return response.data;
});

/**
 * Thunk: Удаление чека
 */
export const deleteReceipt = createAsyncThunk<
  string,
  string | number,
  { rejectValue: string }
>('receipts/deleteReceipt', async (id, { rejectWithValue }) => {
  const response = await apiClient.delete<string>(API_ENDPOINTS.RECEIPTS.DELETE(id));

  if (response.error) {
    return rejectWithValue(response.error);
  }

  return id;
});

// Вспомогательная функция: демо-данные
function getDemoReceipts(): Receipt[] {
  return [
    {
      id: '1',
      date: '2025-01-20',
      store: 'Пятёрочка',
      totalAmount: 1523.50,
      status: 'processed',
      category: 'Продукты',
      createdAt: '2025-01-20T14:30:00Z',
    },
    {
      id: '2',
      date: '2025-01-19',
      store: 'Магнит',
      totalAmount: 876.00,
      status: 'processed',
      category: 'Продукты',
      createdAt: '2025-01-19T18:45:00Z',
    },
    {
      id: '3',
      date: '2025-01-18',
      store: 'DNS',
      totalAmount: 15990.00,
      status: 'processed',
      category: 'Электроника',
      createdAt: '2025-01-18T12:00:00Z',
    },
    {
      id: '4',
      date: '2025-01-17',
      store: 'Аптека',
      totalAmount: 450.30,
      status: 'pending',
      category: 'Здоровье',
      createdAt: '2025-01-17T09:15:00Z',
    },
  ];
}

// Slice
const receiptsSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    clearReceiptsError: (state) => {
      state.error = null;
    },
    resetReceipts: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Receipts
    builder
      .addCase(fetchReceipts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки чеков';
      });

    // Add Receipt
    builder
      .addCase(addReceipt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReceipt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.error = null;
      })
      .addCase(addReceipt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка добавления чека';
      });

    // Delete Receipt
    builder
      .addCase(deleteReceipt.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteReceipt.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteReceipt.rejected, (state, action) => {
        state.error = action.payload || 'Ошибка удаления чека';
      });
  },
});

export const { clearReceiptsError, resetReceipts } = receiptsSlice.actions;
export default receiptsSlice.reducer;
