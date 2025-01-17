import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ModalState } from './apiModal.state';

export const selectModalState = createFeatureSelector<ModalState>('modal');

export const selectVisible = createSelector(
  selectModalState,
  (state) => state.visible
);

export const selectApiModal = createSelector(
  selectModalState,
  (state) => state.apiModal
);
