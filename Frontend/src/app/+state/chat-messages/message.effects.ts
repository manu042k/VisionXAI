import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as ChatActions from './message.action';
import { ChatState, MESSAGETYPE } from './message.state';

export class ChatEffects {
  constructor(
    private actions$: Actions,
    private store: Store<ChatState>,
    private http: HttpClient
  ) {}

  startStreaming$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.startStreaming),
      switchMap(() => {
        // Call your API to start streaming (e.g., WebSocket, SSE)
        return this.http
          .get('https://your-api-endpoint.com/stream', {
            responseType: 'text', // assuming it streams text data
            observe: 'events',
            headers: {
              /* Add any necessary headers */
            },
          })
          .pipe(
            map((event: any) => {
              // Assuming event is a chunk of the response
              this.store.dispatch(
                ChatActions.addMessage({
                  message: {
                    content: event,
                    sender: MESSAGETYPE.BOT,
                    loading: true,
                  },
                })
              );
              return ChatActions.updateMessageContent({
                id: 'someId',
                content: event,
              });
            }),
            catchError((error) => {
              console.error(error);
              return of(ChatActions.stopStreaming());
            })
          );
      })
    )
  );

  // Effect to stop streaming
  stopStreaming$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.stopStreaming),
        tap(() => {
          // Handle stop logic, e.g., closing WebSocket or SSE connection
          console.log('Stopped streaming.');
        })
      ),
    { dispatch: false }
  );
}
