import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api";

/**
 * Типы для чеков
 */
export interface Receipt {
  id: number;
  userId: string;
  total: number;
  date: string;
  items?: ReceiptItem[];
  categoryId?: number;
  rawData?: string;
}

export interface ReceiptItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ParseReceiptRequest {
  rawData: string;
  image?: File | Blob;
}

export interface ParseReceiptResponse {
  receipt: Receipt;
  items: ReceiptItem[];
}

/**
 * Парсить чек из сырых данных
 */
export async function parseReceipt(data: ParseReceiptRequest): Promise<ParseReceiptResponse> {
  const formData = new FormData();
  formData.append('rawData', data.rawData);
  
  if (data.image) {
    formData.append('image', data.image);
  }

  return await apiClient.post<ParseReceiptResponse>(
    API_ENDPOINTS.receipts.parse,
    formData
  );
}

/**
 * Получить все чеки текущего пользователя
 */
export async function getUserReceipts(): Promise<Receipt[]> {
  return await apiClient.get<Receipt[]>(API_ENDPOINTS.receipts.getUserReceipts);
}

/**
 * Отладочный endpoint для проверки сырых данных чека
 */
export async function debugRawReceipt(rawData: string): Promise<any> {
  return await apiClient.post<any>(
    API_ENDPOINTS.receipts.debugRaw,
    { rawData }
  );
}
