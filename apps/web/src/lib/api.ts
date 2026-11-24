import type { CatalogoResponse, ContactPayload, FeaturedResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Error ${res.status}`);
  }
  return (await res.json()) as T;
}

export function getCatalogo(): Promise<CatalogoResponse> {
  return request<CatalogoResponse>('/catalogo');
}

export function getDestacado(): Promise<FeaturedResponse> {
  return request<FeaturedResponse>('/destacado');
}

export function enviarContacto(payload: ContactPayload): Promise<{ ok: boolean; message: string }> {
  return request('/contacto', { method: 'POST', body: JSON.stringify(payload) });
}
