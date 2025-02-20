export interface ImageState {
  base64Image: string | null;
  loading: boolean;
  error: string | null;
}

export const initialState: ImageState = {
  base64Image: null,
  loading: false,
  error: null,
}; 