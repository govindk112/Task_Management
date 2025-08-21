import { create } from "zustand";
import { Project } from "@/Types/types";

type ProjectStore = {
  projects: Project[];
  newProject: Project;
  projectToDelete: string;

  setProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  setProjectToDelete: (projectId: string) => void;
  resetNewProject: () => void;
};

const EMPTY_PROJECT: Project = {
  id: "",
  name: "",
  description: "",
  colorCode: ""
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  newProject: EMPTY_PROJECT,
  projectToDelete: "",

  setProjects: (projects) => {
    if (typeof projects === 'function') {
      set((state) => ({ projects: projects(state.projects) }));
    } else {
      set({ projects });
    }
  },
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
    })),
  deleteProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    })),
  setProjectToDelete: (projectId) => set({ projectToDelete: projectId }),
  resetNewProject: () => set({ newProject: EMPTY_PROJECT }),
}));
