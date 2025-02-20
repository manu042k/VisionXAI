import { createReducer, on } from '@ngrx/store';
import * as ImageActions from './image.actions';
import { initialState } from './image.state';

export const imageReducer = createReducer(
  initialState,

  on(ImageActions.setImage, (state, { base64Image }) => ({
    ...state,
    base64Image,
    error: null,
    loading: false,
  })),

  on(ImageActions.clearImage, (state) => ({
    ...state,
    base64Image: null,
    error: null,
  })),

  on(ImageActions.loadImageFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  }))
); 