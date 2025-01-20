import { createReducer, on } from '@ngrx/store';
import { ImageState } from './image.state';
import * as ImageActions from './image.action';
const initialState: ImageState = {
  base64Image: '',
};

export const imageReducer = createReducer(
  initialState,
  on(ImageActions.addImage, (state: ImageState, { image }) => ({
    ...state,
    base64Image: image,
  })),
  on(ImageActions.clearImage, (state: ImageState) => ({
    ...state,
    base64Image: '',
  }))
);
