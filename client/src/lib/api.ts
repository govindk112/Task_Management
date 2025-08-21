// Mock API service based on Prisma schema
import { User } from '@/Types/userTaskTypes';
import { Task } from '@/Types/types';

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: 'Admin' | 'Manager' | 'Member';
  status?: 'Active' | 'Inactive';
  joinDate?: string;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'InProgress' | 'Done';
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  projectId: string;
  assigneeId: string;
}

export const api = {
  // User endpoints
  users: {
    getAll: async (): Promise<UserData[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { 
          id: '550e8400-e29b-41d4-a716-446655440001', 
          name: 'John Doe', 
          email: 'john@example.com', 
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          role: 'Admin',
          status: 'Active',
          joinDate: '2024-01-15'
        },
        { 
          id: '550e8400-e29b-41d4-a716-446655440002', 
          name: 'Jane Smith', 
          email: 'jane@example.com', 
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
          role: 'Manager',
          status: 'Active',
          joinDate: '2024-02-20'
        },
        { 
          id: '550e8400-e29b-41d4-a716-446655440003', 
          name: 'Bob Johnson', 
          email: 'bob@example.com', 
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
          role: 'Member',
          status: 'Active',
          joinDate: '2024-03-10'
        },
        { 
          id: '550e8400-e29b-41d4-a716-446655440004', 
          name: 'Alice Williams', 
          email: 'alice@example.com', 
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
          role: 'Member',
          status: 'Active',
          joinDate: '2024-04-05'
        },
        { 
          id: '550e8400-e29b-41d4-a716-446655440005', 
          name: 'Charlie Brown', 
          email: 'charlie@example.com', 
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
          role: 'Member',
          status: 'Inactive',
          joinDate: '2024-05-12'
        },
      ];
    },

    create: async (userData: Omit<UserData, 'id'>): Promise<UserData> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: crypto.randomUUID(),
        ...userData,
        joinDate: new Date().toISOString().split('T')[0]
      };
    },

    update: async (id: string, updates: Partial<UserData>): Promise<UserData> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id, ...updates } as UserData;
    }
  },

  // Task endpoints
  tasks: {
    getAll: async (): Promise<TaskData[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { 
          id: 'task-001', 
          title: 'Design Homepage', 
          description: 'Create responsive homepage design',
          status: 'InProgress', 
          priority: 'High',
          dueDate: '2024-12-20',
          projectId: 'project-001',
          assigneeId: '550e8400-e29b-41d4-a716-446655440001'
        },
        { 
          id: 'task-002', 
          title: 'API Integration', 
          description: 'Integrate REST API endpoints',
          status: 'Done', 
          priority: 'High',
          dueDate: '2024-12-15',
          projectId: 'project-001',
          assigneeId: '550e8400-e29b-41d4-a716-446655440002'
        },
        { 
          id: 'task-003', 
          title: 'User Testing', 
          description: 'Conduct user acceptance testing',
          status: 'Todo', 
          priority: 'Medium',
          dueDate: '2024-12-25',
          projectId: 'project-002',
          assigneeId: '550e8400-e29b-41d4-a716-446655440003'
        },
        { 
          id: 'task-004', 
          title: 'Bug Fixes', 
          description: 'Fix reported bugs from QA',
          status: 'InProgress', 
          priority: 'High',
          dueDate: '2024-12-18',
          projectId: 'project-001',
          assigneeId: '550e8400-e29b-41d4-a716-446655440001'
        },
        { 
          id: 'task-005', 
          title: 'Documentation', 
          description: 'Write API documentation',
          status: 'Done', 
          priority: 'Low',
          dueDate: '2024-12-10',
          projectId: 'project-003',
          assigneeId: '550e8400-e29b-41d4-a716-446655440004'
        },
        { 
          id: 'task-006', 
          title: 'Code Review', 
          description: 'Review pull requests',
          status: 'InProgress', 
          priority: 'Medium',
          dueDate: '2024-12-22',
          projectId: 'project-002',
          assigneeId: '550e8400-e29b-41d4-a716-446655440002'
        },
      ];
    }
  },

  // Analytics endpoints
  analytics: {
    getWorkingUsers: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const users = await api.users.getAll();
      const tasks = await api.tasks.getAll();
      
      // Filter only active users with assigned tasks
      const workingUsers = users
        .filter(user => user.status === 'Active')
        .map(user => {
          const userTasks = tasks.filter(task => task.assigneeId === user.id);
          const completedTasks = userTasks.filter(task => task.status === 'Done').length;
          
          return {
            ...user,
            tasksCount: userTasks.length,
            completedTasks,
            isWorking: userTasks.length > 0
          };
        })
        .filter(user => user.isWorking);
      
      return workingUsers;
    },

    getAnalyticsData: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const users = await api.users.getAll();
      const tasks = await api.tasks.getAll();
      
      const workingUsers = await api.analytics.getWorkingUsers();
      
      return {
        totalProjects: 3,
        totalUsers: users.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'Done').length,
        pendingTasks: tasks.filter(t => t.status === 'Todo').length,
        inProgressTasks: tasks.filter(t => t.status === 'InProgress').length,
        userActivity: workingUsers.map(user => ({
          name: user.name,
          tasksCompleted: user.completedTasks,
          tasksCount: user.tasksCount
        })),
        projectProgress: [
          { name: "Website Redesign", progress: 75, totalTasks: 3 },
          { name: "Mobile App", progress: 50, totalTasks: 2 },
          { name: "API Development", progress: 100, totalTasks: 1 },
        ],
      };
    }
  }
};
// Complete dynamic API service based on Prisma schema
export interface UserData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: 'Admin' | 'Manager' | 'Member';
  status?: 'Active' | 'Inactive';
  joinDate?: string;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'InProgress' | 'Done';
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  projectId: string;
  assigneeId: string;
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  colorCode?: string;
  ownerId: string;
}

// Mock data storage
let mockUsers: UserData[] = [
  { 
    id: '550e8400-e29b-41d4-a716-446655440001', 
    name: 'John Doe', 
    email: 'john@example.com', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    role: 'Admin',
    status: 'Active',
    joinDate: '2024-01-15'
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440002', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    role: 'Manager',
    status: 'Active',
    joinDate: '2024-02-20'
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440003', 
    name: 'Bob Johnson', 
    email: 'bob@example.com', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    role: 'Member',
    status: 'Active',
    joinDate: '2024-03-10'
  },
];

let mockTasks: TaskData[] = [
  { 
    id: 'task-001', 
    title: 'Design Homepage', 
    description: 'Create responsive homepage design',
    status: 'InProgress', 
    priority: 'High',
    dueDate: '2024-12-20',
    projectId: 'project-001',
    assigneeId: '550e8400-e29b-41d4-a716-446655440001'
  },
  { 
    id: 'task-002', 
    title: 'API Integration', 
    description: 'Integrate REST API endpoints',
    status: 'Done', 
    priority: 'High',
    dueDate: '2024-12-15',
    projectId: 'project-001',
    assigneeId: '550e8400-e29b-41d4-a716-446655440002'
  },
  { 
    id: 'task-003', 
    title: 'User Testing', 
    description: 'Conduct user acceptance testing',
    status: 'Todo', 
    priority: 'Medium',
    dueDate: '2024-12-25',
    projectId: 'project-002',
    assigneeId: '550e8400-e29b-41d4-a716-446655440003'
  },
];

let mockProjects: ProjectData[] = [
  { 
    id: 'project-001', 
    name: 'Website Redesign', 
    description: 'Complete redesign of company website',
    colorCode: '#3b82f6',
    ownerId: '550e8400-e29b-41d4-a716-446655440001'
  },
  { 
    id: 'project-002', 
    name: 'Mobile App', 
    description: 'Native mobile application development',
    colorCode: '#10b981',
    ownerId: '550e8400-e29b-41d4-a716-446655440002'
  },
];

export const dynamicApi = {
  // User endpoints
  users: {
    getAll: async (): Promise<UserData[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...mockUsers];
    },

    create: async (userData: Omit<UserData, 'id'>): Promise<UserData> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newUser = {
        id: crypto.randomUUID(),
        ...userData,
        joinDate: new Date().toISOString().split('T')[0]
      };
      mockUsers.push(newUser);
      return newUser;
    },

    update: async (id: string, updates: Partial<UserData>): Promise<UserData> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...updates };
        return mockUsers[index];
      }
      throw new Error('User not found');
    },

    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockUsers = mockUsers.filter(u => u.id !== id);
    }
  },

  // Task endpoints
  tasks: {
    getAll: async (): Promise<TaskData[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...mockTasks];
    },

    create: async (taskData: Omit<TaskData, 'id'>): Promise<TaskData> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTask = {
        id: crypto.randomUUID(),
        ...taskData
      };
      mockTasks.push(newTask);
      return newTask;
    },

    update: async (id: string, updates: Partial<TaskData>): Promise<TaskData> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockTasks.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTasks[index] = { ...mockTasks[index], ...updates };
        return mockTasks[index];
      }
      throw new Error('Task not found');
    },

    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockTasks = mockTasks.filter(t => t.id !== id);
    }
  },

  // Project endpoints
  projects: {
    getAll: async (): Promise<ProjectData[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...mockProjects];
    },

    create: async (projectData: Omit<ProjectData, 'id'>): Promise<ProjectData> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newProject = {
        id: crypto.randomUUID(),
        ...projectData
      };
      mockProjects.push(newProject);
      return newProject;
    },

    update: async (id: string, updates: Partial<ProjectData>): Promise<ProjectData> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockProjects.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProjects[index] = { ...mockProjects[index], ...updates };
        return mockProjects[index];
      }
      throw new Error('Project not found');
    },

    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockProjects = mockProjects.filter(p => p.id !== id);
    }
  },

  // Analytics endpoints
  analytics: {
    getWorkingUsers: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const workingUsers = mockUsers
        .filter(user => user.status === 'Active')
        .map(user => {
          const userTasks = mockTasks.filter(task => task.assigneeId === user.id);
          const completedTasks = userTasks.filter(task => task.status === 'Done').length;
          
          return {
            ...user,
            tasksCount: userTasks.length,
            completedTasks,
            isWorking: userTasks.length > 0
          };
        })
        .filter(user => user.isWorking);
      
      return workingUsers;
    },

    getAnalyticsData: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const workingUsers = await dynamicApi.analytics.getWorkingUsers();
      
      return {
        totalProjects: mockProjects.length,
        totalUsers: mockUsers.length,
        totalTasks: mockTasks.length,
        completedTasks: mockTasks.filter(t => t.status === 'Done').length,
        pendingTasks: mockTasks.filter(t => t.status === 'Todo').length,
        inProgressTasks: mockTasks.filter(t => t.status === 'InProgress').length,
        userActivity: workingUsers.map(user => ({
          name: user.name,
          tasksCompleted: user.completedTasks,
          tasksCount: user.tasksCount
        })),
        projectProgress: mockProjects.map(project => {
          const projectTasks = mockTasks.filter(t => t.projectId === project.id);
          const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
          const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
          
          return {
            name: project.name,
            progress,
            totalTasks: projectTasks.length
          };
        }),
      };
    }
  }
};
