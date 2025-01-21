import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_API_URL } from '../environment';
import { LLMInput } from '../constants/llmInput';
import { Observable } from 'rxjs';
import { URLS } from '../constants/url';

@Injectable({
  providedIn: 'root',
})
export class LlmService {
  private http = inject(HttpClient);
  private baseUrl: string = inject(BASE_API_URL);

  constructor() {}
  public chatWithLLM(llmInput: LLMInput): Observable<any> {
    console.log(this.baseUrl + URLS.CHAT);
    return this.http.post<string>(this.baseUrl + URLS.CHAT, llmInput);
  }
}
