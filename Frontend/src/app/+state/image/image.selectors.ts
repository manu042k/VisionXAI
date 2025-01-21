import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ImageState } from './image.state';

export const selectImageState = createFeatureSelector<ImageState>('image');
export const selectImage = createSelector(
  selectImageState,
  (state: ImageState) => state.base64Image
);
