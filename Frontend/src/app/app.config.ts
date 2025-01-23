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
import { modalReducer } from './+state/api-modal/apiModal.reducer';
import { chatReducer } from './+state/chat-messages/message.reducers';
import { BASE_API_URL, configFactory } from './environment';
import { imageReducer } from './+state/image/image.reducers';
import { errorHandlerInterceptor } from './interceptors/error-handler.interceptor';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({
      modal: modalReducer,
      chat: chatReducer,
      image: imageReducer,
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
