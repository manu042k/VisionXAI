import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Fieldset } from 'primeng/fieldset';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-user-response',
  imports: [CommonModule, AvatarModule, Skeleton, Fieldset, NgIf],
  templateUrl: './user-response.component.html',
  styleUrl: './user-response.component.scss',
})
export class UserResponseComponent {
  @Input() userResponse?: string;
  public avatarTitle: string = 'User';
}
