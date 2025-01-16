import { createReducer, on } from '@ngrx/store';
import { initialState } from './apiModal.state';
import { hideModal, showModal, updateApiModal } from './apiModal.actions';

export const modalReducer = createReducer(
  initialState,
  on(showModal, (state) => ({ ...state, visible: true })),
  on(hideModal, (state) => ({ ...state, visible: false })),
  on(updateApiModal, (state, { key }) => ({
    ...state,
    apiModal: { ...state.apiModal, key },
  }))
);
