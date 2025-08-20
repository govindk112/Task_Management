"use client"
import { useState } from "react"
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

interface AnalyticsData {
  totalProjects: number
  totalUsers: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  userActivity: Array<{
    name: string
    tasksCompleted: number
  }>
  projectProgress: Array<{
    name: string
    progress: number
    totalTasks: number
  }>
}

export default function AnalyticsDashboard() {
  const [analyticsData] = useState<AnalyticsData>({
    totalProjects: 5,
    totalUsers: 12,
    totalTasks: 48,
    completedTasks: 32,
    pendingTasks: 8,
    inProgressTasks: 8,
    userActivity: [
      { name: "John Doe", tasksCompleted: 12 },
      { name: "Jane Smith", tasksCompleted: 10 },
      { name: "Bob Johnson", tasksCompleted: 8 },
      { name: "Alice Brown", tasksCompleted: 6 },
      { name: "Charlie Wilson", tasksCompleted: 4 },
    ],
    projectProgress: [
      { name: "Website Redesign", progress: 85, totalTasks: 20 },
      { name: "Mobile App", progress: 60, totalTasks: 15 },
      { name: "API Development", progress: 40, totalTasks: 10 },
      { name: "Database Migration", progress: 90, totalTasks: 8 },
      { name: "Testing Suite", progress: 25, totalTasks: 12 },
    ],
  })

  const completionRate = Math.round(
    (analyticsData.completedTasks / analyticsData.totalTasks) * 100
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
            <div className="text-2xl font-bold">{analyticsData.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalTasks}</div>
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
                <span className="text-sm font-medium">{analyticsData.completedTasks}</span>
              </div>
              <Progress
                value={(analyticsData.completedTasks / analyticsData.totalTasks) * 100}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">In Progress</span>
                <span className="text-sm font-medium">{analyticsData.inProgressTasks}</span>
              </div>
              <Progress
                value={(analyticsData.inProgressTasks / analyticsData.totalTasks) * 100}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pending</span>
                <span className="text-sm font-medium">{analyticsData.pendingTasks}</span>
              </div>
              <Progress
                value={(analyticsData.pendingTasks / analyticsData.totalTasks) * 100}
              />
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
              {analyticsData.projectProgress.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <Progress value={project.progress} />
                  <div className="text-xs text-muted-foreground">
                    {Math.round((project.progress / 100) * project.totalTasks)} of{" "}
                    {project.totalTasks} tasks completed
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
            <BarChart data={analyticsData.userActivity}>
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
