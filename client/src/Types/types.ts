export type TaskStatus = "To Do" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";
export type BoardView = "list" | "kanban";
export type ProjectStatus = "Planning" | "Active" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type Task = {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  projectId?: string;
  assignedUsers: User[]; // <-- Add this
};

export type Project = {
  _id: string;
  name: string;
  priority: ProjectPriority;
  description?: string;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  owner?: string;  // 🔑 Link with User
  status: ProjectStatus;
};
