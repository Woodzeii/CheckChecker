import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface MonthlyBudget {
  id: number;
  year: number;
  month: number;
  initialAmount: number;
}

export interface SetBudgetPayload {
  year: number;
  month: number;
  initialAmount: number;
}

interface BudgetState {
  currentBudget: MonthlyBudget | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  currentBudget: null,
  isLoading: false,
  error: null,
};

// Thunks
export const setBudget = createAsyncThunk<
  void,
  SetBudgetPayload,
  { rejectValue: string }
>('budget/setBudget', async (payload, { rejectWithValue }) => {
  const response = await apiClient.post(API_ENDPOINTS.BUDGET.CREATE, payload);

  if (response.error) {
    return rejectWithValue(response.error);
  }
});

// Slice
const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearBudget: (state) => {
      state.currentBudget = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setBudget.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(setBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка при установке бюджета';
      });
  },
});

export const { clearBudget } = budgetSlice.actions;
export default budgetSlice.reducer;
