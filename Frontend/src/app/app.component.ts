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
import { MainChatComponent } from './chat-section/main-chat.component';
import { UserInputComponent } from './chat-section/user-input/user-input.component';
import { PhotoContainerComponent } from './photo-annotation/photo-container.component';
import { ButtonModule } from 'primeng/button';
import { SystemSettingsComponent } from './settings/system-settings.component';
import { Store } from '@ngrx/store';
import { showModal } from './+state/api-modal/apiModal.actions';
@Component({
  imports: [
    RouterModule,
    Menubar,
    CommonModule,
    SplitterModule,
    MainChatComponent,
    PhotoContainerComponent,
    UserInputComponent,
    ButtonModule,
    SystemSettingsComponent,
    NgIf,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public items: MenuItem[] | undefined;

  private store = inject(Store);

  ngOnInit() {
    this.items = [];
  }

  public showDialog() {
    this.store.dispatch(showModal());
  }
}
