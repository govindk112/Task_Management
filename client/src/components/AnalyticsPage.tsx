"use client"
import { useTaskStore } from "@/store/taskStore"
import { useUserStore } from "@/store/userStore"
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

export default function AnalyticsDashboard() {
  const { tasks = [] } = useTaskStore()
  const { users = [] } = useUserStore()
  const { projects = [] } = useProjectStore()

  // Task status counts
  const completedTasks = tasks.filter(t => t.status === "Completed").length
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length
  const pendingTasks = tasks.filter(t => t.status === "To Do").length

  // User activity: count completed tasks per user
  const userActivity = users.map(user => ({
    name: user.name,
    tasksCompleted: tasks.filter(
      t => t.status === "Completed" && t.assignedUsers?.some(u => u.id === user.id)
    ).length,
  })).sort((a, b) => b.tasksCompleted - a.tasksCompleted)

  // Project progress: percent completed per project
  const projectProgress = projects.map((project) => {
    const projectTasks = tasks.filter(t => t.projectId === project.id)
    const totalTasks = projectTasks.length
    const completed = projectTasks.filter(t => t.status === "Completed").length
    const progress = totalTasks ? Math.round((completed / totalTasks) * 100) : 0
    return {
      name: project.name,
      progress,
      totalTasks,
    }
  })

  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0

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
            <div className="text-2xl font-bold">{users.length}</div>
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
                <span className="text-sm">Pending</span>
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
              {projectProgress.map((project) => (
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
                      ? `${Math.round((project.progress / 100) * project.totalTasks)} of ${project.totalTasks} tasks completed`
                      : "No tasks"}
                  </div>
                </div>
              ))}
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasksCompleted" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
