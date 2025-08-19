import { EMPTY_TASK } from "@/lib/constants";
import { Task } from "@/Types/types";
import { create } from "zustand";

export type state ={
    tasks: Task[];
    newTask: Task;
    tasktoDelete: string;
}

export type actions = {
    setTasks: (tasks: Task[]) => void;
    setNewTask: (task: Task) => void;
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;
    setTaskToDelete: (taskId: string) => void;
    resetNewTask: () => void;
}

export const useTaskStore = create<state & actions>((set) => ({
    tasks: [],
    newTask: EMPTY_TASK,
    tasktoDelete: "",

    setTasks: (tasks) => set({ tasks }),
    setNewTask: (task) => set({ newTask: task }),
    addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
    updateTask: (task) => set((state) => ({
        tasks: state.tasks.map(t => t._id === task._id ? task : t)
    })),
    deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(task => task._id !== taskId)
    })),
    setTaskToDelete: (taskId) => set({ tasktoDelete: taskId }),
    resetNewTask: () => set({ newTask: EMPTY_TASK }),
}));