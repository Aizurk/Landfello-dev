import { getStoredToken } from "@/lib/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface PaymentInitResponse {
  reference: string;
  authorizationUrl: string;
  accessCode?: string;
  publicKey?: string;
  amountLocal: number;
  currency: string;
  email: string;
  mock: boolean;
}

export interface PaymentVerifyResponse {
  status: string;
  reference: string;
  propertyId: string;
  amountUsd: number;
  message: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.detail || data?.error || `Request failed (${response.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data as T;
}

function authHeaders() {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to buy land");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function initializePayment(propertyId: string): Promise<PaymentInitResponse> {
  const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ propertyId }),
  });
  return parseResponse<PaymentInitResponse>(response);
}

export async function verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/payments/verify/${encodeURIComponent(reference)}`, {
    headers: authHeaders(),
  });
  return parseResponse<PaymentVerifyResponse>(response);
}
