import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { AutoFocus } from 'primeng/autofocus';

@Component({
  selector: 'app-user-input',
  imports: [CommonModule, TextareaModule, ButtonModule, AutoFocus],
  templateUrl: './user-input.component.html',
  styleUrl: './user-input.component.scss',
})
export class UserInputComponent {
  public placeholder: string = 'Start typing...';
}
