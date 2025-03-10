import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from 'src/mytheme-2';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { BASE_API_URL, configFactory } from './environment';
import { errorHandlerInterceptor } from './interceptors/error-handler.interceptor';
import { MessageService } from 'primeng/api';
import { imageReducer } from './+state/image/image.reducer';
import { chatReducer } from './+state/chat/chat.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({
      image: imageReducer,
      chat: chatReducer,
    }),
    provideStoreDevtools({ logOnly: false }),
    provideEffects([]),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([errorHandlerInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
      },
    }),
    {
      provide: BASE_API_URL,
      useFactory: configFactory, // Dynamically determine the URL
    },
    MessageService,
  ],
};
