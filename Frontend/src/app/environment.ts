import { isDevMode } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const BASE_API_URL = new InjectionToken<string>('Base API URL');

export function configFactory(): string {
  return isDevMode()
    ? 'http://localhost:8000' // Local development (backend runs on 8000 by default)
    : 'https://annot-a-ix.vercel.app'; // Production
}
