import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  selectApiModal,
  selectVisible,
} from '../+state/api-modal/apiModal.selectors';
import {
  hideModal,
  updateApiModal,
} from '../+state/api-modal/apiModal.actions';

@Component({
  selector: 'app-system-settings',
  imports: [CommonModule, Dialog, ButtonModule],
  templateUrl: './system-settings.component.html',
  styleUrl: './system-settings.component.scss',
})
export class SystemSettingsComponent {
  private store = inject(Store);
  public visible$: Observable<boolean> = this.store.select(selectVisible);
  public apiModal$: Observable<{ key: string }> =
    this.store.select(selectApiModal);
  public apiModalKey: string = '';

  public onHide(): void {
    this.store.dispatch(hideModal());
  }

  public onInputChange(event: Event): void {
    console.log('event', (event.target as HTMLInputElement).value);
    const key = (event.target as HTMLInputElement).value;
    this.apiModalKey = key;
  }

  public onSave(): void {
    this.store.dispatch(updateApiModal({ key: this.apiModalKey }));
    this.store.dispatch(hideModal());
  }
}
