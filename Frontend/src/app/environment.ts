import { isDevMode } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const BASE_API_URL = new InjectionToken<string>('Base API URL');

export function configFactory(): string {
  return isDevMode()
    ? 'http://127.0.0.1:8000' // Local development
    : 'https://prod.api.example.com'; // Production
}
