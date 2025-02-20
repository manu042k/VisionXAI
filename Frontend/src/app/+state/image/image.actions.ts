import { createAction, props } from '@ngrx/store';

export const setImage = createAction(
  '[Image] Set Image',
  props<{ base64Image: string }>()
);

export const clearImage = createAction('[Image] Clear Image');

export const loadImageFailure = createAction(
  '[Image] Load Image Failure',
  props<{ error: string }>()
); 