"use client";
import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Table, TableBody, TableFooter, TableHeader, TableHead, TableRow, TableCell
} from "./ui/table";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from "./ui/select";
import { useTaskStore } from "@/store/taskStore";
import { useModalStore } from "@/store/modalStore";
import { Task, TaskStatus } from "@/Types/types";
import EditDeleteMenu from "./EditTaskModel";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { CalendarDays, Users, MoreVertical, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
interface TasklistProps {
  projectId: string;
}
// Helper function to get user info from token
const getUserInfo = () => {
  const token = localStorage.getItem("token");
  if (!token) return { role: null, userId: null };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { 
      role: payload.role, 
      userId: payload.userId || payload.id || payload.sub 
    };
  } catch (e) {
    console.error("Error decoding token", e);
    return { role: null, userId: null };
  }
};
const Tasklist: React.FC<TasklistProps> = ({ projectId }) => {
  const { getTasksByProject, setTasks, updateTask } = useTaskStore();
  const { setIsAddModalOpen } = useModalStore();
  const projectTasks = getTasksByProject(projectId);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("none");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state for mobile view
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2); // 2 tasks per page on mobile
  
  // Base URL for API calls
  const API_BASE_URL = "http://localhost:5000";
  
  // Get user info on component mount
  useEffect(() => {
    const { role, userId } = getUserInfo();
    setUserRole(role);
    setUserId(userId);
    console.log("User info:", { role, userId });
  }, []);
  
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        
        console.log("Fetching tasks for project:", projectId);
        
        // Fixed API endpoint to match backend routes
        const res = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Response status:", res.status);
        console.log("Response content-type:", res.headers.get("content-type"));
        
        // Check if response is HTML (error page)
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
          const text = await res.text();
          console.error("Received non-JSON response:", text.substring(0, 200));
          throw new Error(`Server returned non-JSON response. Status: ${res.status}. This might indicate an authentication issue or incorrect endpoint.`);
        }
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch tasks (${res.status}): ${errorText}`);
        }
        
        const data: Task[] = await res.json();
        console.log("Fetched tasks:", data);
        
        setTasks(data); // put tasks into Zustand
      } catch (err: any) {
        console.error("Error fetching tasks:", err);
        setError(err.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [projectId, setTasks, userRole, userId]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, sortBy, sortOrder, projectId]);
  
  // Handle updating task status on backend
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    const taskId = task.id;
    if (!taskId) {
      console.error("Task ID is missing:", task);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // For regular users, only send status field
      // For admins, send all fields
      const updateData = userRole === "USER" 
        ? { status: newStatus }
        : {
            status: newStatus,
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            assigneeId: task.assignee?.id || null
          };
      
      console.log("Sending update data:", updateData);
      
      // Use the specific endpoint provided
      const endpoint = `${API_BASE_URL}/projects/tasks/${taskId}`;
      console.log("Using endpoint:", endpoint);
      
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      console.log("Response status:", response.status);
      console.log("Response content-type:", response.headers.get("content-type"));
      
      // Check if response is HTML (error page)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        const text = await response.text();
        console.error("Received non-JSON response:", text);
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. Response: ${text.substring(0, 200)}...`);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server response:", errorData);
        throw new Error(errorData.error || `Failed to update task status (${response.status})`);
      }
      
      const updated = await response.json();
      console.log("Task updated:", updated);
      updateTask(updated); // update Zustand with backend response
    } catch (err: any) {
      console.error("Error updating task:", err);
      alert(`Failed to update task: ${err.message}`);
    }
  };
  
  // filtering
  const filteredTasks = projectTasks.filter(
    (task) =>
      (statusFilter === "all" || task.status === statusFilter) &&
      (priorityFilter === "all" || task.priority === priorityFilter)
  );
  
  // sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "title")
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    if (sortBy === "priority") {
      const priorityOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2 };
      return sortOrder === "asc"
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate) return sortOrder === "asc" ? 1 : -1;
      if (!b.dueDate) return sortOrder === "asc" ? -1 : 1;
      return sortOrder === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });
  
  // Pagination for mobile view
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const indexOfLastTask = currentPage * itemsPerPage;
  const indexOfFirstTask = indexOfLastTask - itemsPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="w-full">
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    
      
      {/* Filters - Responsive */}
      {!loading && !error && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Filter & Sort Tasks</h2>
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-40 md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value)}>
                <SelectTrigger className="w-full sm:w-40 md:w-48">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort By */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-40 md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Sorting</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort Order */}
              {sortBy !== "none" && (
                <Button 
                  variant="outline" 
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="flex items-center gap-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                </Button>
              )}
            </div>
          </div>
          
          {/* Task Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
      
      {/* Mobile View - Cards */}
      {!loading && !error && (
        <div className="md:hidden space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks found
            </div>
          ) : (
            <>
              <div className="mb-2 text-sm text-gray-600">
                Showing {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, sortedTasks.length)} of {sortedTasks.length} tasks
              </div>
              
              {currentTasks.map((task) => (
                <Card key={task.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      {/* Only show edit/delete menu for admins */}
                      {userRole === "ADMIN" && <EditDeleteMenu task={task} />}
                    </div>
                    {task.description && (
                      <CardDescription className="mt-1">
                        {task.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No Due Date"}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-wrap gap-1">
                        {task.assignee ? (
                          <Badge variant="outline" className="text-xs">
                            {task.assignee.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Unassigned</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-3 border-t">
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleStatusChange(task, value as TaskStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </CardFooter>
                </Card>
              ))}
              
              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Desktop View - Table */}
      {!loading && !error && (
        <div className="hidden md:block">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tasks</TableHead>
                    <TableHead className="text-nowrap">Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned User</TableHead>
                    <TableHead className="text-right">Menu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="space-y-2 text-nowrap w-1/2 capitalize">
                        <div>
                          <h3 className="font-semibold text-base">{task.title}</h3>
                          {task.description && (
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No Due Date"}
                      </TableCell>
                      <TableCell className="text-nowrap">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-nowrap">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task, value as TaskStatus)}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Status</SelectLabel>
                              <SelectItem value="To Do">To Do</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {task.assignee ? (
                          <Badge variant="secondary" className="text-xs">
                            {task.assignee.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Only show edit/delete menu for admins */}
                        {userRole === "ADMIN" && <EditDeleteMenu task={task} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="text-left text-sm" colSpan={5}>
                      Total Tasks: {sortedTasks.length}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Tasklist;