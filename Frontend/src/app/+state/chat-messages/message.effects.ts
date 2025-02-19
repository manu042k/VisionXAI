import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as ChatActions from './message.action';
import { ChatState, MESSAGETYPE } from './message.state';
import { LlmService } from '../../services/llm.service';

@Injectable()
export class ChatEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<ChatState>);
  private http = inject(HttpClient);
  private llmService = inject(LlmService);

  startStreaming$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.startStreaming),
      switchMap(({ query }) => {
        // Start the streaming and map the responses to actions
        return this.llmService.streamText$.pipe(
          map((content) => {
            console.log('Streamed content:', content);
            return ChatActions.streamMessage({ content });
          }),
          takeUntil(this.actions$.pipe(ofType(ChatActions.streamComplete))),
          catchError((error) => {
            console.error('Streaming error:', error);
            return of(ChatActions.streamComplete());
          })
        );
      })
    )
  );

  // Start the actual streaming process
  initiateStreaming$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.startStreaming),
        switchMap(({ query }) => {
          this.llmService.streamChat(query);
          return [];
        })
      ),
    { dispatch: false }
  );

  // Effect to stop streaming
  stopStreaming$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.stopStreaming),
        tap(() => {
          // Handle stop logic, e.g., closing WebSocket or SSE connection
        })
      ),
    { dispatch: false }
  );
}
