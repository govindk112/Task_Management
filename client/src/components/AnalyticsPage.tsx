"use client";

import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/Types/types";
import { AlertCircle, RefreshCw, CheckCircle, Clock, Circle, Users, FolderOpen, ListTodo, TrendingUp, Bug } from "lucide-react";

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { tasks = [], fetchTasks: fetchAllTasks, setTasks } = useTaskStore();
  const { projects = [], fetchProjects } = useProjectStore();
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<{ userId: string; role: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<any[]>([]);

  const normalizeStatus = (status: string | undefined | null) => {
    if (!status) return '';
    return String(status).toUpperCase().trim();
  };

  const fetchUserInfo = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setUser(null);
        setAuthChecked(true);
        return;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        setUser(null);
        setAuthChecked(true);
        return;
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decodedToken = JSON.parse(jsonPayload);
      const userId = decodedToken.userId || decodedToken.id || decodedToken.sub || decodedToken._id;
      if (!userId) {
        setUser(null);
        setAuthChecked(true);
        return;
      }

      const tokenRole = decodedToken.role || "USER";
      setUser({ userId, role: tokenRole });
      setAuthChecked(true);
    } catch {
      setUser(null);
      setAuthChecked(true);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUsersError("Authentication token not found");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/users`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`Failed to fetch users: ${res.status}`);
      }

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [router]);

  const fetchAllProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      if (typeof fetchProjects === 'function') {
        await fetchProjects();
      } else {
        const res = await fetch(`${apiUrl}/projects`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch projects: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [fetchProjects]);

  const fetchAllProjectTasks = useCallback(async () => {
    if (!user) return;

    setIsLoadingTasks(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      if (projects.length === 0) {
        await fetchAllProjects();
      }

      const projectIds = projects.map(p => p.id);
      const tasksPromises = projectIds.map(projectId =>
        fetch(`${apiUrl}/projects/${projectId}/tasks`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }).then(res => res.ok ? res.json() : [])
          .catch(() => [])
      );

      const allTasksResults = await Promise.all(tasksPromises);
      const flattenedTasks = allTasksResults.flat();

      setAllTasks(flattenedTasks);

      if (typeof setTasks === 'function') {
        setTasks(flattenedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [user, projects, fetchAllProjects, setTasks]);

  const refreshAllData = useCallback(async () => {
    await fetchUsers();
    await fetchAllProjects();
    await fetchAllProjectTasks();
  }, [fetchUsers, fetchAllProjects, fetchAllProjectTasks]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (authChecked && user) {
      fetchUsers();
      fetchAllProjects();
      fetchAllProjectTasks();
    }
  }, [authChecked, user, fetchUsers, fetchAllProjects, fetchAllProjectTasks]);

  const completedTasks = allTasks ? allTasks.filter(t => normalizeStatus(t?.status) === "COMPLETED").length : 0;
  const inProgressTasks = allTasks ? allTasks.filter(t => normalizeStatus(t?.status) === "IN PROGRESS").length : 0;
  const pendingTasks = allTasks ? allTasks.filter(t => normalizeStatus(t?.status) === "TO DO").length : 0;
  const totalTasks = allTasks ? allTasks.length : 0;

  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const projectProgress = projects && projects.length > 0
    ? projects
        .filter(Boolean)
        .map((project) => {
          if (!project || !project.id) return null;
          const projectTasks = allTasks ? allTasks.filter(t => t?.projectId === project.id) : [];
          const totalTasks = projectTasks.length;
          const completed = projectTasks.filter(t => normalizeStatus(t?.status) === "COMPLETED").length;
          const inProgress = projectTasks.filter(t => normalizeStatus(t?.status) === "IN PROGRESS").length;
          const todo = projectTasks.filter(t => normalizeStatus(t?.status) === "TO DO").length;
          const progress = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;
          return { id: project.id, name: project.name || 'Unnamed Project', progress, totalTasks, completed, inProgress, todo };
        })
        .filter(Boolean)
    : [];

  const userActivity = users && users.length > 0
    ? users
        .filter(Boolean)
        .map(user => ({
          name: user?.name || 'Unknown User',
          tasksCompleted: allTasks ? allTasks.filter(t => normalizeStatus(t?.status) === "COMPLETED" && t?.assignee?.id === user?.id).length : 0,
        }))
        .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
    : [];

  const statusColors = { COMPLETED: "#10B981", "IN PROGRESS": "#3B82F6", "TO DO": "#9CA3AF" };

  if (!authChecked) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (authChecked && !user) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this page.
          </p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects ? projects.length : 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse h-6 w-8 bg-gray-200 rounded"></div>
                <div className="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
              </div>
            ) : usersError ? (
              <div className="text-red-500 text-sm">Error</div>
            ) : (
              <div className="text-2xl font-bold">{users ? users.length : 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Task Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
          <CardDescription>Distribution of tasks by status across all projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Completed</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{completedTasks}</div>
                <div className="text-sm text-muted-foreground">
                  {totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </div>
              </div>
              <Progress value={totalTasks ? (completedTasks / totalTasks) * 100 : 0} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-medium">In Progress</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{inProgressTasks}</div>
                <div className="text-sm text-muted-foreground">
                  {totalTasks ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%
                </div>
              </div>
              <Progress value={totalTasks ? (inProgressTasks / totalTasks) * 100 : 0} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Circle className="h-5 w-5 text-gray-500" />
                <span className="font-medium">To Do</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{pendingTasks}</div>
                <div className="text-sm text-muted-foreground">
                  {totalTasks ? Math.round((pendingTasks / totalTasks) * 100) : 0}%
                </div>
              </div>
              <Progress value={totalTasks ? (pendingTasks / totalTasks) * 100 : 0} className="h-2" />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Progress and task status for each project</CardDescription>
        </CardHeader>
        <CardContent>
          {projectProgress && projectProgress.length > 0 ? (
            <div className="space-y-6">
              {projectProgress.map((project) => (
                <div key={project.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>

                  <Progress value={project.progress} className="h-2.5" />

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Completed: {project.completed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>In Progress: {project.inProgress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span>To Do: {project.todo}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {project.totalTasks} total tasks
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No projects found
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Activity (Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Top performers by tasks completed</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : usersError ? (
            <div className="h-[300px] flex items-center justify-center text-red-500">
              Failed to load user data
            </div>
          ) : userActivity && userActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasksCompleted" name="Tasks Completed" radius={[8, 8, 0, 0]}>
                  {userActivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors.COMPLETED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No user activity data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
