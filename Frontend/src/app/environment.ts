import { isDevMode } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const BASE_API_URL = new InjectionToken<string>('Base API URL');

export function configFactory(): string {
  return isDevMode()
    ? 'https://annot-a-ix-git-production-manu042kpaperwork-gmailcoms-projects.vercel.app' // Local development
    : 'https://annot-a-ix-git-production-manu042kpaperwork-gmailcoms-projects.vercel.app'; // Production
}
