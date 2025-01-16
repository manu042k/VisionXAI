import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { CommonModule, NgIf } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { AutoFocus } from 'primeng/autofocus';
import { MainChatComponent } from './chat-section/main-chat.component';
import { UserInputComponent } from './chat-section/user-input/user-input.component';
import { PhotoContainerComponent } from './photo-annotation/photo-container.component';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { SystemSettingsComponent } from './settings/system-settings.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectVisible } from './+state/api-modal/apiModal.selectors';
import { showModal } from './+state/api-modal/apiModal.actions';
@Component({
  imports: [
    RouterModule,
    Menubar,
    CommonModule,
    SplitterModule,
    AutoFocus,
    MainChatComponent,
    PhotoContainerComponent,
    UserInputComponent,
    ButtonModule,
    Dialog,
    SystemSettingsComponent,
    NgIf,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public value: string = '';
  items: MenuItem[] | undefined;

  constructor(private primeng: PrimeNG, private store: Store) {}

  ngOnInit() {
    this.items = [];
  }

  showDialog() {
    console.log('show dialog');
    this.store.dispatch(showModal());
  }
}
