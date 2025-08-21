import { create } from 'zustand';
import { User } from '@/Types/userTaskTypes';

interface UserStore {
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  
  // User assignment logic
  getAvailableUsersForTask: (projectId: string, taskId?: string) => User[];
  isUserAvailableForTask: (userId: string, projectId: string, taskId?: string) => boolean;
}

// Use the same structure as UserManagement
const initialUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatar: 'JD' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'JS' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatar: 'BJ' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', avatar: 'AW' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', avatar: 'CB' },
];

export const useUserStore = create<UserStore>((set, get) => ({
  users: initialUsers,
  
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (userId, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      ),
    })),

  // Check if a user is available for assignment to a task
  isUserAvailableForTask: (userId, projectId, taskId) => {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]') as any[];
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    // Check if user is already assigned to any task in this project (excluding current task)
    const isAssigned = projectTasks.some(task => 
      task.assignedUsers?.some((user: User) => user.id === userId) && task._id !== taskId
    );
    
    return !isAssigned;
  },

  // Get all available users for a task in a project
  getAvailableUsersForTask: (projectId, taskId) => {
    const { users } = get();
    return users.filter(user => 
      get().isUserAvailableForTask(user.id, projectId, taskId)
    );
  },
}));
