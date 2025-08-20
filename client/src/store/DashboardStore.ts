import { BoardView, User } from "@/Types/types";
import { create } from "zustand";

export type DashboardPage = "project" | "user" | "analytics";

export type State = {
  boardView: BoardView;
  user: User | null;
  activePage: DashboardPage; // 👈 new field
};

export type Actions = {
  setBoardView: (boardView: BoardView) => void;
  setUser: (user: User | null) => void;
  setActivePage: (page: DashboardPage) => void; // 👈 new action
};

export const useDashboardStore = create<State & Actions>((set) => ({
  boardView: "list",
  user: null,
  activePage: "project", // 👈 default = ProjectManagement

  setUser: (user: User | null) => set({ user }),
  setBoardView: (boardView: BoardView) => set({ boardView }),
  setActivePage: (page: DashboardPage) => set({ activePage: page }),
}));
