import { EMPTY_TASK } from "@/lib/constants";
import { Task } from "@/Types/types";
import { create } from "zustand";

export type State = {
  tasks: Task[];
  taskToEdit: Task | null;   // 🔑 null = add mode
  taskToDelete: string;
};

export type Actions = {
  setTasks: (tasks: Task[]) => void;
  setTaskToEdit: (task: Task | null) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  setTaskToDelete: (taskId: string) => void;
  resetTaskToEdit: () => void;

  // Selector
  getTasksByProject: (projectId: string) => Task[];
};

export const useTaskStore = create<State & Actions>((set, get) => ({
  tasks: [],
  taskToEdit: null,
  taskToDelete: "",

  setTasks: (tasks) => set({ tasks }),
  setTaskToEdit: (task) => set({ taskToEdit: task }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task._id !== taskId),
    })),
  setTaskToDelete: (taskId) => set({ taskToDelete: taskId }),
  resetTaskToEdit: () => set({ taskToEdit: null }),

  // Selector: tasks by project
  getTasksByProject: (projectId) =>
    get().tasks.filter((t) => t.projectId === projectId),
}));
