import { createAction, props } from '@ngrx/store';

export const showModal = createAction('[Modal] Show Modal');
export const hideModal = createAction('[Modal] Hide Modal');
export const updateApiModal = createAction(
  '[Modal] Update ApiModal',
  props<{ key: string }>()
);
