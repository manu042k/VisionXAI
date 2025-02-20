import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  SimpleChanges,
  OnChanges,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppLogoComponent } from '../../shared/components/app-logo/app-logo.component';

export interface ChatMessage {
  content: string;
  sender: 'USER' | 'BOT';
  timestamp: Date;
  loading?: boolean;
}

@Component({
  selector: 'app-message-display',
  standalone: true,
  imports: [CommonModule, SkeletonModule, AppLogoComponent],
  templateUrl: './message-display.component.html',
  styleUrls: ['./message-display.component.scss'],
})
export class MessageDisplayComponent implements OnChanges, AfterViewChecked {
  @Input() messages: ChatMessage[] = [];
  @ViewChild('messageContainer') private scrollContainer!: ElementRef;
  private isAtBottom = true;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    console.log('Messages changed:', this.messages);
    this.isAtBottom = true;
  }

  ngAfterViewChecked() {
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

  isLastMessage(index: number): boolean {
    return index === this.messages.length - 1;
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  formatMarkdown(content: string): SafeHtml {
    if (!content) return '';

    // Handle bold text
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle newlines
    content = content.replace(/\n\n/g, '<br><br>');

    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
