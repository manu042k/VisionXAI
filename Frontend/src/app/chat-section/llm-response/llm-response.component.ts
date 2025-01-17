import { Component, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { Fieldset } from 'primeng/fieldset';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-llm-response',
  imports: [CommonModule, AvatarModule, Skeleton, Fieldset, NgIf],
  templateUrl: './llm-response.component.html',
  styleUrl: './llm-response.component.scss',
})
export class LlmResponseComponent {
  @Input() llmResponse: string = '';
  @Input() setLoading?: boolean;
  public avatarTitle: string = 'AiX';
}
