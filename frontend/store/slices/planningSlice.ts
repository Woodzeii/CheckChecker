import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

type UserCategory = {
  "id": 0,
  "userId": 0,
  "name": "string",
  "isDefault": true,
  "color": "string",
  "type": "string"
}
// Types
export interface MonthlyPlannedExpense {
  id: number;
  year: number;
  month: number;
  categoryName: string;
  plannedAmount: number;
  category?: UserCategory;
}

export interface MonthlyPlannedIncome {
  id: number;
  year: number;
  month: number;
  plannedAmount: number;
  categoryName: string;
  description?: string;
}

export interface AddPlannedExpensePayload {
  year: number;
  month: number;
  categoryName: string;
  plannedAmount: number;
  saveAsRecurring?: boolean;
}

export interface AddPlannedIncomePayload {
  year: number;
  month: number;
  plannedAmount: number;
  categoryName: string;
  description?: string;
  saveAsRecurring?: boolean;
}

interface PlanningState {
  plannedExpenses: MonthlyPlannedExpense[];
  plannedIncomes: MonthlyPlannedIncome[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PlanningState = {
  plannedExpenses: [],
  plannedIncomes: [],
  isLoading: false,
  error: null,
};

// Thunks
export const fetchPlannedExpenses = createAsyncThunk<
  MonthlyPlannedExpense[],
  { year: number; month: number },
  { rejectValue: string }
>('planning/fetchPlannedExpenses', async ({ year, month }, { rejectWithValue }) => {
  const response = await apiClient.get<MonthlyPlannedExpense[]>(
    API_ENDPOINTS.PLANNING.PLANNED_EXPENSES(year, month)
  );

  if (response.error || !response.data) {
    return rejectWithValue(response.error || 'Не удалось загрузить плановые расходы');
  }

  return response.data;
});

export const addPlannedExpense = createAsyncThunk<
  void,
  AddPlannedExpensePayload,
  { rejectValue: string }
>('planning/addPlannedExpense', async (payload, { rejectWithValue }) => {
  const response = await apiClient.post(
    API_ENDPOINTS.PLANNING.CREATE_PLANNED_EXPENSE,
    payload
  );

  if (response.error) {
    return rejectWithValue(response.error);
  }
});

export const fetchPlannedIncomes = createAsyncThunk<
  MonthlyPlannedIncome[],
  { year: number; month: number },
  { rejectValue: string }
>('planning/fetchPlannedIncomes', async ({ year, month }, { rejectWithValue }) => {
  const response = await apiClient.get<MonthlyPlannedIncome[]>(
    API_ENDPOINTS.PLANNING.PLANNED_INCOME(year, month)
  );

  if (response.error || !response.data) {
    return rejectWithValue(response.error || 'Не удалось загрузить плановые доходы');
  }

  return response.data;
});

export const addPlannedIncome = createAsyncThunk<
  void,
  AddPlannedIncomePayload,
  { rejectValue: string }
>('planning/addPlannedIncome', async (payload, { rejectWithValue }) => {
  const response = await apiClient.post(
    API_ENDPOINTS.PLANNING.CREATE_PLANNED_INCOME,
    payload
  );

  if (response.error) {
    return rejectWithValue(response.error);
  }
});

// Slice
const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    clearPlanning: (state) => {
      state.plannedExpenses = [];
      state.plannedIncomes = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch planned expenses
      .addCase(fetchPlannedExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlannedExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plannedExpenses = action.payload;
      })
      .addCase(fetchPlannedExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка при загрузке плановых расходов';
      })
      // Add planned expense
      .addCase(addPlannedExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPlannedExpense.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addPlannedExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка при добавлении планового расхода';
      })
      // Fetch planned incomes
      .addCase(fetchPlannedIncomes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlannedIncomes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plannedIncomes = action.payload;
      })
      .addCase(fetchPlannedIncomes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка при загрузке плановых доходов';
      })
      // Add planned income
      .addCase(addPlannedIncome.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPlannedIncome.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addPlannedIncome.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка при добавлении планового дохода';
      });
  },
});

export const { clearPlanning } = planningSlice.actions;
export default planningSlice.reducer;
