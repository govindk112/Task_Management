export type TaskStatus = "To Do" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";
export type BoardView = "list" | "kanban";
export type ProjectStatus = "Planning" | "Active" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

export type User = {
  name: string;
  email: string;
  token: string;
};

export type Task = {
  _id: string;
  projectId: string;   // 🔑 Link with Project
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
};

export type Project = {
  _id: string;
  name: string;
  priority: ProjectPriority;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  owner?: string;  // 🔑 Link with User
  status: "Active" | "On Hold" | "Completed";
};
