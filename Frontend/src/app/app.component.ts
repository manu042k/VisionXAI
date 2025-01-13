import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { ButtonModule } from 'primeng/button';
import { PrimeNG } from 'primeng/config';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { SplitterModule } from 'primeng/splitter';
import { Fluid } from 'primeng/fluid';
import { Panel } from 'primeng/panel';
import { Fieldset } from 'primeng/fieldset';
import { Skeleton } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { AutoFocus } from 'primeng/autofocus';
import { MainChatComponent } from './chat-section/main-chat.component';
import { UserInputComponent } from './chat-section/user-input/user-input.component';
@Component({
  imports: [
    NxWelcomeComponent,
    RouterModule,
    ButtonModule,
    Menubar,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    Ripple,
    CommonModule,
    SplitterModule,
    Panel,
    Fluid,
    Fieldset,
    Skeleton,
    FormsModule,
    TextareaModule,
    AutoFocus,
    MainChatComponent,
    UserInputComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private primeng: PrimeNG) {}

  public value: string = '';
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [];
  }
}
