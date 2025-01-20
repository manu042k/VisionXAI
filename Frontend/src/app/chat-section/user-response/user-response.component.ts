import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Fieldset } from 'primeng/fieldset';

@Component({
  selector: 'app-user-response',
  imports: [CommonModule, AvatarModule, Fieldset, NgIf],
  templateUrl: './user-response.component.html',
  styleUrl: './user-response.component.scss',
})
export class UserResponseComponent {
  @Input() userResponse?: string;
  public avatarTitle: string = 'User';
}
