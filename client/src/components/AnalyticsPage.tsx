"use client"
import { useTaskStore } from "@/store/taskStore"
import { useProjectStore } from "@/store/useProjectStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { User } from "@/Types/types"
import { Shield, AlertCircle, RefreshCw } from "lucide-react"
// import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { tasks = [] } = useTaskStore()
  const { projects = [] } = useProjectStore()
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<{ userId: string; role: "ADMIN" | "USER" } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isFetchingRole, setIsFetchingRole] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Fetch user role from database
  const fetchUserRole = useCallback(async (userId: string) => {
    setIsFetchingRole(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found when fetching user role");
        return null;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      console.log("Fetching role from:", `${apiUrl}/users/${userId}/role`);
      
      const response = await fetch(`${apiUrl}/users/${userId}/role`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return null;
        }
        console.error("Failed to fetch user role:", response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log("User role response:", data);
      
      // Handle different response formats
      let role = data.role;
      if (!role && data.user && data.user.role) {
        role = data.user.role;
      }
      
      if (!role) {
        console.error("Role not found in response");
        return null;
      }
      
      // Normalize role to uppercase
      role = role.toUpperCase();
      
      if (role !== "ADMIN" && role !== "USER") {
        console.error("Invalid role value:", role);
        return null;
      }
      
      console.log("Successfully fetched role from database:", role);
      return role as "ADMIN" | "USER";
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    } finally {
      setIsFetchingRole(false);
    }
  }, [router]);

  // Fetch user info from token
  const fetchUserInfo = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      console.log("Token from localStorage:", token ? "Token exists" : "No token found");
      
      if (!token) {
        console.log("No token found in localStorage");
        setUser(null);
        setAuthChecked(true);
        setDebugInfo({ token: null, error: "No token found" });
        return;
      }
      
      try {
        // Decode JWT token
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.error("Invalid token format - expected 3 parts, got", parts.length);
          setUser(null);
          setAuthChecked(true);
          setDebugInfo({ token, error: "Invalid token format" });
          return;
        }
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        console.log("Decoded token payload:", decodedToken);
        
        // Try multiple possible field names for user ID
        const userId = decodedToken.userId || 
                      decodedToken.id || 
                      decodedToken.sub || 
                      decodedToken._id;
        
        console.log("Extracted userId:", userId);
        
        if (!userId) {
          console.error("Token missing userId");
          setUser(null);
          setAuthChecked(true);
          setDebugInfo({ 
            token: decodedToken, 
            error: "Token missing userId",
            foundKeys: Object.keys(decodedToken)
          });
          return;
        }
        
        // First, set the user with the role from the token as a temporary value
        const tokenRole = decodedToken.role || "USER";
        const normalizedTokenRole = tokenRole.toUpperCase() as "ADMIN" | "USER";
        
        console.log("Token role:", tokenRole, "Normalized:", normalizedTokenRole);
        
        const tempUserData = {
          userId: userId,
          role: normalizedTokenRole
        };
        
        console.log("Setting temporary user state with token role:", tempUserData);
        setUser(tempUserData);
        setDebugInfo({ 
          user: tempUserData, 
          token: decodedToken,
          note: "Using token role temporarily, fetching database role..."
        });
        
        // Now try to fetch the actual role from the database
        console.log("Fetching actual role from database...");
        const databaseRole = await fetchUserRole(userId);
        
        if (databaseRole) {
          console.log("Got actual role from database:", databaseRole);
          const finalUserData = {
            userId: userId,
            role: databaseRole
          };
          setUser(finalUserData);
          setDebugInfo({ 
            user: finalUserData, 
            token: decodedToken,
            note: "Updated with role from database"
          });
        } else {
          console.log("Could not fetch role from database, keeping token role");
          setDebugInfo({ 
            user: tempUserData, 
            token: decodedToken,
            note: "Could not fetch database role, using token role"
          });
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        setUser(null);
        setAuthChecked(true);
        setDebugInfo({ token, error: "Token decode error", details: err });
      } finally {
        setAuthChecked(true);
      }
    } catch (err) {
      console.error("Error in fetchUserInfo:", err);
      setUser(null);
      setAuthChecked(true);
      setDebugInfo({ error: "General error", details: err });
    }
  }, [fetchUserRole]);
    
  const fetchUsers = useCallback(async () => {
    // Only fetch users if the user is an admin
    if (!user || user.role !== "ADMIN") {
      return;
    }
    
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
      console.error("Error fetching users:", error);
      setUsersError(error instanceof Error ? error.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [user, router]);
  
  // Initialize user info
  useEffect(() => {
    console.log("Component mounted, fetching user info");
    fetchUserInfo();
  }, [fetchUserInfo]);
  
  // Fetch users when user info is loaded and user is admin
  useEffect(() => {
    if (authChecked && user && user.role === "ADMIN") {
      fetchUsers();
    }
  }, [authChecked, user, fetchUsers]);
  
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

  // Show loading state while checking authentication
  if (!authChecked || isFetchingRole) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show access denied if user is not an admin
  if (authChecked && user && user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Shield className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to view this page. Only administrators can access the analytics dashboard.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  // Show login prompt if not authenticated
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
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Debug Information</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <div><strong>User ID:</strong> {user?.userId || 'Not available'}</div>
                <div><strong>Role:</strong> {user?.role || 'Not available'}</div>
                <div><strong>Status:</strong> {authChecked ? 'Authenticated' : 'Checking...'}</div>
                <div><strong>Loading Users:</strong> {isLoadingUsers ? 'Yes' : 'No'}</div>
                {debugInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs">Technical Details</summary>
                    <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          {user && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              <Shield className="w-4 h-4" />
              {user.role}
            </div>
          )}
        </div>
        <Button onClick={fetchUsers} disabled={isLoadingUsers}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
          {isLoadingUsers ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
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