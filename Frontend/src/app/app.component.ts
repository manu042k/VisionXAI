import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { CommonModule, NgIf } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { PhotoContainerComponent } from './photo-annotation/photo-container.component';
import { ButtonModule } from 'primeng/button';
import { SystemSettingsComponent } from './settings/system-settings.component';
import { Store } from '@ngrx/store';
import { ToastModule } from 'primeng/toast';
import { ChatContainerComponent } from './chat-section/chat-container.component';
import { AppLogoComponent } from './shared/components/app-logo/app-logo.component';
@Component({
  imports: [
    RouterModule,
    Menubar,
    CommonModule,
    SplitterModule,
    PhotoContainerComponent,
    ButtonModule,
    SystemSettingsComponent,
    NgIf,
    ToastModule,
    ChatContainerComponent,
    AppLogoComponent,
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

  public showDialog() {}
}
