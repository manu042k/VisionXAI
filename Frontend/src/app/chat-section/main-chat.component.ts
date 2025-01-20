import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { LlmResponseComponent } from './llm-response/llm-response.component';
import { UserResponseComponent } from './user-response/user-response.component';
import { Store } from '@ngrx/store';
import {
  selectLoading,
  selectMessages,
} from '../+state/chat-messages/message.selectors';
import { ProgressSpinner } from 'primeng/progressspinner';
@Component({
  selector: 'app-main-chat',
  imports: [
    CommonModule,
    LlmResponseComponent,
    UserResponseComponent,
    NgIf,
    ProgressSpinner,
  ],
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss'],
})
export class MainChatComponent implements AfterViewChecked, OnInit {
  private store = inject(Store);

  public messages$ = this.store.select(selectMessages);
  public loading$ = this.store.select(selectLoading);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  public isAtBottom: boolean = true;

  ngOnInit(): void {
    this.isAtBottom = true;
  }

  ngAfterViewChecked(): void {
    if (this.isAtBottom) {
      this.scrollToBottom();
    }
  }

  public onScroll(): void {
    const element = this.scrollContainer.nativeElement;
    const isBottom =
      element.scrollHeight === element.scrollTop + element.clientHeight;
    this.isAtBottom = isBottom;
  }

  public scrollToBottom(): void {
    if (this.scrollContainer) {
      const element = this.scrollContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
