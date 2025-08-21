import { Task } from "./types";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TaskWithUsers extends Task {
  assignedUsers: User[];
  assigneeId?: string;
}

export interface ProjectWithUsers {
  id: string;
  name: string;
  users: User[];
}
