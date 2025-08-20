import { create } from "zustand";

export type State = {
  isDeleteModalOpen: boolean;
  isAddModalOpen: boolean;
  isAddProjectModalOpen: boolean;
};

export type Actions = {
  setIsDeleteModalOpen: (value: boolean) => void;
  setIsAddModalOpen: (value: boolean) => void;
  setIsAddProjectModalOpen: (value: boolean) => void;
};
export const useModalStore = create<State & Actions>((set) => ({
  isDeleteModalOpen: false,
  isAddModalOpen: false,
  isAddProjectModalOpen: false,

  setIsDeleteModalOpen: (value: boolean) => set({ isDeleteModalOpen: value }),
  setIsAddModalOpen: (value: boolean) => set({ isAddModalOpen: value }),
  setIsAddProjectModalOpen: (value: boolean) => set({ isAddProjectModalOpen: value }),
}));
