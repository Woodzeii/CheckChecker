/**
 * Redux Store Configuration
 * 
 * Объединяет все slices и экспортирует типизированные hooks
 */

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import receiptsReducer from './slices/receiptsSlice';
import categoriesReducer from './slices/categoriesSlice';
import incomeReducer from './slices/incomeSlice';
import planningReducer from './slices/planningSlice';
import analyticsReducer from './slices/analyticsSlice';
import budgetReducer from './slices/budgetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    receipts: receiptsReducer,
    categories: categoriesReducer,
    income: incomeReducer,
    planning: planningReducer,
    analytics: analyticsReducer,
    budget: budgetReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Типы для RootState и AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типизированные hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
