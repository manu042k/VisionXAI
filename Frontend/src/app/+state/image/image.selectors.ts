import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ImageState } from './image.state';

export const selectImageState = createFeatureSelector<ImageState>('image');

export const selectBase64Image = createSelector(
  selectImageState,
  (state) => state.base64Image
);

export const selectImageError = createSelector(
  selectImageState,
  (state) => state.error
); 