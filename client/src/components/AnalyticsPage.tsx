"use client"
import { useTaskStore } from "@/store/taskStore"
import { useProjectStore } from "@/store/useProjectStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { useEffect, useState } from "react"
import { User } from "@/Types/types"
// import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsDashboard() {
  const { tasks = [] } = useTaskStore()
  const { projects = [] } = useProjectStore()
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
    
  useEffect(() => {
    fetchUsers();
  }, []);
    
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUsersError("Authentication token not found");
        return;
      }
      
      const res = await fetch("http://localhost:5000/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }); 
      
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
      }
      
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersError(error instanceof Error ? error.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Task status counts - using correct status values
  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length
  const pendingTasks = tasks.filter(t => t.status === "TO_DO").length
  
  // User activity: count completed tasks per user (using single assignee)
  const userActivity = users.map(user => ({
    name: user.name,
    tasksCompleted: tasks.filter(
      t => t.status === "COMPLETED" && t.assignee?.id === user.id
    ).length,
  })).sort((a, b) => b.tasksCompleted - a.tasksCompleted)
  
  // Project progress: percent completed per project
  const projectProgress = projects.map((project) => {
    const projectTasks = tasks.filter(t => t.projectId === project.id)
    const totalTasks = projectTasks.length
    const completed = projectTasks.filter(t => t.status === "COMPLETED").length
    const progress = totalTasks ? Math.round((completed / totalTasks) * 100) : 0
    return {
      name: project.name,
      progress,
      totalTasks,
      completed
    }
  })
  
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0
    
  // Skeleton for user activity chart
  const UserActivitySkeleton = () => (
    <div className="h-[300px] flex items-center justify-center">
      <div className="text-center">
        {/* <Skeleton className="h-6 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto" /> */}
      </div>
    </div>
  )
  
  // Skeleton for user count
  const UserCountSkeleton = () => (
    <div className="flex items-center space-x-2">
      {/* <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-6 w-12" /> */}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <UserCountSkeleton />
            ) : usersError ? (
              <div className="text-red-500 text-sm">Error</div>
            ) : (
              <div className="text-2xl font-bold">{users.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Task Overview & Project Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
            <CardDescription>Current task distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Completed</span>
                <span className="text-sm font-medium">{completedTasks}</span>
              </div>
              <Progress value={tasks.length ? (completedTasks / tasks.length) * 100 : 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">In Progress</span>
                <span className="text-sm font-medium">{inProgressTasks}</span>
              </div>
              <Progress value={tasks.length ? (inProgressTasks / tasks.length) * 100 : 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">To Do</span>
                <span className="text-sm font-medium">{pendingTasks}</span>
              </div>
              <Progress value={tasks.length ? (pendingTasks / tasks.length) * 100 : 0} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Progress across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectProgress.length > 0 ? (
                projectProgress.map((project) => (
                  <div key={project.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{project.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress value={project.progress} />
                    <div className="text-xs text-muted-foreground">
                      {project.totalTasks
                        ? `${project.completed} of ${project.totalTasks} tasks completed`
                        : "No tasks"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No projects found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User Activity (Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Top performers by tasks completed</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <UserActivitySkeleton />
          ) : usersError ? (
            <div className="h-[300px] flex items-center justify-center text-red-500">
              Failed to load user data
            </div>
          ) : userActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasksCompleted" fill="#6366f1" radius={[8, 8, 0, 0]} />
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
  )
}