import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface Income {
  id: number;
  userId: number;
  date: string;
  amount: number;
  category: string;
  description: string;
}

export interface AddIncomePayload {
  date: string;
  amount: number;
  category: string;
  description?: string;
  saveAsRecurring?: boolean;
}

interface IncomeState {
  incomes: Income[];
  isLoading: boolean;
  error: string | null;
}

const initialState: IncomeState = {
  incomes: [],
  isLoading: false,
  error: null,
};

// Thunks
export const fetchIncomes = createAsyncThunk<
  Income[],
  { year: number; month: number },
  { rejectValue: string }
>('income/fetchIncomes', async ({ year, month }, { rejectWithValue }) => {
  const response = await apiClient.get<Income[]>(
    API_ENDPOINTS.INCOMES.LIST(year, month)
  );

  if (response.error || !response.data) {
    return rejectWithValue(response.error || 'Не удалось загрузить доходы');
  }

  return response.data;
});

export const addIncome = createAsyncThunk<
  void,
  AddIncomePayload,
  { rejectValue: string }
>('income/addIncome', async (payload, { rejectWithValue }) => {
  const response = await apiClient.post(API_ENDPOINTS.INCOMES.CREATE, payload);

  if (response.error) {
    return rejectWithValue(response.error);
  }
});

// Slice
const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    clearIncomes: (state) => {
      state.incomes = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch incomes
      .addCase(fetchIncomes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incomes = action.payload;
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка при загрузке доходов';
      })
      // Add income
      .addCase(addIncome.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addIncome.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addIncome.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка при добавлении дохода';
      });
  },
});

export const { clearIncomes } = incomeSlice.actions;
export default incomeSlice.reducer;
