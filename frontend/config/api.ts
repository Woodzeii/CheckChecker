/**
 * API Configuration
 * 
 * Замените BASE_URL на адрес вашего ASP.NET Core backend.
 * Например: http://localhost:5264 или https://your-api.com
 */

// Базовый URL вашего backend API
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264';

// Эндпоинты API
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/Auth/login',
    REGISTER: '/api/Auth/register',
    ME: '/api/Auth/me',
  },
  // Categories endpoints
  CATEGORIES: {
    LIST: '/api/Categories',
    CREATE: '/api/Categories',
    DELETE: (id: string | number) => `/api/Categories/${id}`,
  },
  // Receipts endpoints
  RECEIPTS: {
    LIST: '/api/Receipts/user/Receipts',
    PARSE: '/api/Receipts/parse',
    DEBUG_RAW: '/api/Receipts/debug-raw',
    DELETE: (id: string | number) => `/api/Receipts/${id}`,
  },
  // Incomes endpoints
  INCOMES: {
    LIST: (year: number, month: number) => `/api/Incomes?year=${year}&month=${month}`,
    CREATE: '/api/Incomes',
  },
  // Planning endpoints
  PLANNING: {
    PLANNED_EXPENSES: (year: number, month: number) => `/api/PlannedExpenses?year=${year}&month=${month}`,
    CREATE_PLANNED_EXPENSE: '/api/PlannedExpenses',
    PLANNED_INCOME: (year: number, month: number) => `/api/PlannedIncome/monthly?year=${year}&month=${month}`,
    CREATE_PLANNED_INCOME: '/api/PlannedIncome',
    DELETE_PLANNED_INCOME: (id: number) => `/api/PlannedIncome/${id}`,
  },
  // Budget endpoints
  BUDGET: {
    CREATE: '/api/Budgets',
    GET: (year: number, month: number) => `/api/Budgets?year=${year}&month=${month}`,
    GET_CURRENT: '/api/Budgets/current',
  },
  // Receipt analytics endpoints
  RECEIPT_ANALYTICS: {
    ANALYTICS: (year: number, month: number) => `/api/Receipts/analytics?year=${year}&month=${month}`,
    EXPENSES: (year: number, month: number) => `/api/Receipts/expenses?year=${year}&month=${month}`,
    UPDATE_CATEGORY: (id: number) => `/api/Receipts/${id}`,
  },
  // Manual Expenses endpoints
  EXPENSES: {
    LIST: (year: number, month: number) => `/api/Expenses?year=${year}&month=${month}`,
    CREATE_MANUAL: '/api/Expenses/manual',
  },
  // Analytics endpoints
  ANALYTICS: {
    MONTHLY: (year: number, month: number) => `/api/Analytics/monthly?year=${year}&month=${month}`,
  },
} as const;
