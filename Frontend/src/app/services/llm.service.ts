import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_API_URL } from '../environment';
import { LLMInput } from '../constants/llmInput';
import { Observable, Subject } from 'rxjs';
import { URLS } from '../constants/url';
import { LLMResponse } from '../constants/LLMResponse';

@Injectable({
  providedIn: 'root',
})
export class LlmService {
  private http = inject(HttpClient);
  private apiUrl: string = inject(BASE_API_URL);

  // Subject to emit streamed text updates
  private streamTextSubject = new Subject<string>();
  streamText$ = this.streamTextSubject.asObservable();

  constructor() {}

  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  public chatWithLLM(message: LLMInput): Observable<LLMResponse> {
    return this.http.post<LLMResponse>(this.apiUrl + URLS.CHAT, {
      query: message.query,
      base64Image: message.base64Image,
      threadId: message.threadId || this.generateThreadId(),
    });
  }

  async streamChat(query: LLMInput): Promise<void> {
    try {
      const response = await fetch(this.apiUrl + URLS.STREAM_CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          query: query.query,
          base64Image: query.base64Image,
          threadId: query.threadId || this.generateThreadId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream is null');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete SSE messages (ending with \n\n)
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || ''; // Keep incomplete message in buffer

          for (const message of messages) {
            if (message.startsWith('data: ')) {
              const jsonStr = message.substring(6); // Remove 'data: ' prefix
              try {
                const data = JSON.parse(jsonStr);
                if (data.response) {
                  // Emit the actual response content
                  this.streamTextSubject.next(data.response);
                } else if (data.error) {
                  console.error('Stream error:', data.error);
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.error('Error parsing SSE message:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in streamChat:', error);
      throw error;
    }
  }

  formatStreamedText(text: string): string {
    return text;
  }
}
