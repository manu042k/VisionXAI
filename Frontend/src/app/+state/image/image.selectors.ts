import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ImageState } from './image.state';
import { state } from '@angular/animations';

export const selectImageState = createFeatureSelector<ImageState>('image');
export const selectImage = createSelector(
  selectImageState,
  (state: ImageState) => state.imageFile
);
