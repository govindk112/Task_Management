export type TaskStatus = "To Do" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";
export type BoardView = "list" | "kanban";
export type ProjectStatus = "Planning" | "Active" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type Task = {
  [x: string]: any;
  _id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  projectId?: string;
  assignedUsers: User[]; // <-- Add this
};

export interface Project {
  id: string;
  name: string;
  description?: string;
  colorCode?: string;
}