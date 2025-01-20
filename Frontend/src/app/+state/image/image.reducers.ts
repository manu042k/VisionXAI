import { createReducer, on } from '@ngrx/store';
import { ImageState } from './image.state';
import * as ImageActions from './image.action';
const initialState: ImageState = {
  imageFile: null,
};

export const imageReducer = createReducer(
  initialState,
  on(ImageActions.addImage, (state: ImageState, { image }) => ({
    ...state,
    imageFile: image.imageFile,
  })),
  on(ImageActions.clearImage, (state: ImageState) => ({
    ...state,
    imageFile: null,
  }))
);
