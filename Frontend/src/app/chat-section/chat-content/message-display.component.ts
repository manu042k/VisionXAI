import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  SimpleChanges,
  OnChanges,
  AfterViewChecked,
} from '@angular/core';
import { marked } from 'marked';
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
    // console.log('Messages changed:', this.messages);
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

    // Escape HTML tags to prevent unwanted injection
    content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Handle Math Expressions (Using MathJax Syntax)
    content = content.replace(
      /\$\$(.*?)\$\$/g,
      '<span class="math block">\\[$1\\]</span>'
    ); // Block math
    content = content.replace(
      /\$(.*?)\$/g,
      '<span class="math inline">\\($1\\)</span>'
    ); // Inline math

    // Headers (H1 to H6)
    content = content.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    content = content.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    content = content.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold (**bold** or __bold__)
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic (*italic* or _italic_)
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    content = content.replace(/_(.*?)_/g, '<em>$1</em>');

    // Strikethrough (~~strikethrough~~)
    content = content.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Inline code (`code`)
    content = content.replace(
      /`(.*?)`/g,
      '<code class="bg-gray-200 text-sm px-1 py-0.5 rounded">$1</code>'
    );

    // Code blocks (```code```)
    content = content.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>'
    );

    // Blockquotes (> blockquote)
    content = content.replace(
      /^> (.*$)/gm,
      '<blockquote class="border-l-4 border-gray-400 pl-4 italic">$1</blockquote>'
    );

    // Unordered lists (- or *)
    content = content.replace(/^\s*[-*] (.*$)/gm, '<li>$1</li>');
    content = content.replace(
      /(<li>[\s\S]*?<\/li>)/g,
      '<ul class="pl-5">$1</ul>'
    );

    // Ordered lists (1. 2. 3.)
    content = content.replace(/^\s*\d+\.\s(.*$)/gm, '<li>$1</li>');
    content = content.replace(
      /(<li>[\s\S]*?<\/li>)/g,
      '<ol class="pl-5">$1</ol>'
    );

    // Links [text](url)
    content = content.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g,
      '<a href="$2" target="_blank" class="text-blue-500 underline">$1</a>'
    );

    // Newlines
    content = content.replace(/\n\n/g, '<br><br>');

    // Ensure MathJax updates after setting HTML
    setTimeout(() => {
      const mathJax = (window as any)['MathJax'];
      if (mathJax) {
        mathJax.Hub.Queue(['Typeset', mathJax.Hub]);
      }
    }, 100);

    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
