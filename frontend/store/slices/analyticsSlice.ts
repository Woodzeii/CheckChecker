import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface CategoryAnalyticsItem {
  categoryId: number;
  categoryName: string;
  planned: number;
  actual: number;
  difference: number;
}

export interface DailySeries {
  dates: string[];
  expenses: number[];
  incomes: number[];
}

export interface MonthlyAnalyticsResponse {
  year: number;
  month: number;
  initialBudget: number;
  currentBudget: number;
  plannedIncome: number;
  actualIncome: number;
  plannedExpensesTotal: number;
  actualExpensesTotal: number;
  byCategory: CategoryAnalyticsItem[];
  dailySeries: DailySeries;
}

interface AnalyticsState {
  monthlyAnalytics: MonthlyAnalyticsResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  monthlyAnalytics: null,
  isLoading: false,
  error: null,
};

// Thunks
export const fetchMonthlyAnalytics = createAsyncThunk<
  MonthlyAnalyticsResponse,
  { year: number; month: number },
  { rejectValue: string }
>('analytics/fetchMonthlyAnalytics', async ({ year, month }, { rejectWithValue }) => {
  const response = await apiClient.get<MonthlyAnalyticsResponse>(
    `/api/Analytics/monthly?year=${year}&month=${month}`
  );

  if (response.error || !response.data) {
    return rejectWithValue(response.error || 'Не удалось загрузить аналитику');
  }

  return response.data;
});

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.monthlyAnalytics = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyAnalytics = action.payload;
      })
      .addCase(fetchMonthlyAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка при загрузке аналитики';
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
