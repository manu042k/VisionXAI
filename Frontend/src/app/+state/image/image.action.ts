import { createAction, props } from '@ngrx/store';
import { ImageState } from './image.state';

export const addImage = createAction(
  '[Image] Add Image',
  props<{ image: ImageState }>()
);

export const clearImage = createAction('[Image] Clear Image');
