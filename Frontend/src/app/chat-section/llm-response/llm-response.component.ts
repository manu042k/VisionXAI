import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { Fieldset } from 'primeng/fieldset';
import { Skeleton } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { selectLatestAIMessage } from 'src/app/+state/chat-messages/message.selectors';

@Component({
  selector: 'app-llm-response',
  imports: [
    CommonModule,
    AvatarModule,
    Skeleton,
    Fieldset,
    NgIf,
    TextareaModule,
  ],
  templateUrl: './llm-response.component.html',
  styleUrl: './llm-response.component.scss',
})
export class LlmResponseComponent implements OnInit, OnDestroy {
  @Input() llmResponse: string = '';
  @Input() setLoading?: boolean;
  public avatarTitle: string = 'AiX';

  private store = inject(Store);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Subscribe to the latest AI message
    this.store
      .select(selectLatestAIMessage)
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        if (message) {
          this.llmResponse = message.content;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
