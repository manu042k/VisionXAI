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
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { modalReducer } from './+state/api-modal/apiModal.reducer';
import { chatReducer } from './+state/chat-messages/message.reducers';
import { ChatEffects } from './+state/chat-messages/message.effects';
import { BASE_API_URL, configFactory } from './environment';
import { imageReducer } from './+state/image/image.reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({
      modal: modalReducer,
      chat: chatReducer,
      image: imageReducer,
    }),
    provideStoreDevtools({ logOnly: !isDevMode() }),
    provideEffects([]),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
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
  ],
};
