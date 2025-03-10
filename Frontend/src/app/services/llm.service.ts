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

  public chatWithLLM(message: LLMInput): Observable<LLMResponse> {
    return this.http.post<LLMResponse>(this.apiUrl + URLS.CHAT, {
      query: message.query,
      base64Image: message.base64Image,
    });
  }

  async streamChat(query: LLMInput): Promise<void> {
    try {
      const response = await fetch(this.apiUrl + URLS.STREAM_CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: query.query,
          base64Image: query.base64Image,
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
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          this.streamTextSubject.next(accumulatedText);
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
