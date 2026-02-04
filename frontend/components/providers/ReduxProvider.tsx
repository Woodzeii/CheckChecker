'use client';

import React from "react"

/**
 * Redux Provider Component
 * 
 * Обёртка для предоставления Redux store всему приложению
 */

import { Provider } from 'react-redux';
import { store } from '@/store';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
