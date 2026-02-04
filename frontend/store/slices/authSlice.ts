/**
 * Auth Slice - управление состоянием авторизации
 * 
 * Thunks:
 * - login: вход в систему
 * - register: регистрация
 * - fetchCurrentUser: получение текущего пользователя
 * - logout: выход из системы
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { saveToken, removeToken, getToken } from '@/lib/auth';

// Типы
export interface User {
  id: string | number;
  displayName: string;
  email: string;
  // Добавьте другие поля по необходимости
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface LoginCredentials {
  login: string;
  password: string;
}

interface RegisterPayload {
  login: string;
  email: string;
  name: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

// Начальное состояние
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

/**
 * Thunk: Вход в систему
 * 1. Отправляет credentials на /Auth/login
 * 2. Сохраняет токен
 * 3. Загружает данные пользователя
 */
export const login = createAsyncThunk<
  { user: User; token: string },
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue, dispatch }) => {
  // 1. Логин
  const loginResponse = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    credentials,
    { skipAuth: true }
  );

  if (loginResponse.error || !loginResponse.data?.token) {
    return rejectWithValue(loginResponse.error || 'Ошибка авторизации');
  }

  const token = loginResponse.data.token;
  saveToken(token);

  // 2. Получаем данные пользователя
  const userResponse = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);

  if (userResponse.error || !userResponse.data) {
    removeToken();
    return rejectWithValue(userResponse.error || 'Не удалось получить данные пользователя');
  }

  return { user: userResponse.data, token };
});

/**
 * Thunk: Регистрация
 * 1. Отправляет данные на /Auth/register
 * 2. Сохраняет токен
 * 3. Загружает данные пользователя
 */
export const register = createAsyncThunk<
  { user: User; token: string },
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  // 1. Регистрация
  const registerResponse = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    payload,
    { skipAuth: true }
  );

  if (registerResponse.error || !registerResponse.data?.token) {
    return rejectWithValue(registerResponse.error || 'Ошибка регистрации');
  }

  const token = registerResponse.data.token;
  saveToken(token);

  // 2. Получаем данные пользователя
  const userResponse = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);

  if (userResponse.error || !userResponse.data) {
    removeToken();
    return rejectWithValue(userResponse.error || 'Не удалось получить данные пользователя');
  }

  return { user: userResponse.data, token };
});

/**
 * Thunk: Получение текущего пользователя
 * Используется при загрузке приложения для восстановления сессии
 */
export const fetchCurrentUser = createAsyncThunk<
  { user: User; token: string },
  void,
  { rejectValue: string }
>('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  const token = getToken();
  
  if (!token) {
    return rejectWithValue('Токен не найден');
  }

  const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);

  if (response.error || !response.data) {
    removeToken();
    return rejectWithValue(response.error || 'Сессия истекла');
  }

  return { user: response.data, token };
});

/**
 * Thunk: Выход из системы
 */
export const logout = createAsyncThunk('auth/logout', async () => {
  removeToken();
  return null;
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Очистка ошибки
    clearError: (state) => {
      state.error = null;
    },
    // Сброс состояния
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Ошибка авторизации';
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Ошибка регистрации';
        state.isAuthenticated = false;
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null; // Не показываем ошибку при восстановлении сессии
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
