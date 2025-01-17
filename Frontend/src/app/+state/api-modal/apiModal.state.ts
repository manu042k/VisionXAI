export interface ModalState {
  visible: boolean;
  apiModal: {
    key: string;
  };
}

export const initialState: ModalState = {
  visible: false,
  apiModal: {
    key: '',
  },
};
