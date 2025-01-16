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
  visible$: Observable<boolean> = this.store.select(selectVisible);
  apiModal$: Observable<{ key: string }> = this.store.select(selectApiModal);

  apiModal = { key: '' };
  onHide() {
    this.store.dispatch(hideModal());
  }

  onKeyChange(key: string) {
    this.store.dispatch(updateApiModal({ key }));
  }

  onSave() {
    this.store.dispatch(updateApiModal({ key: this.apiModal.key }));
    this.store.dispatch(hideModal());
  }
}
