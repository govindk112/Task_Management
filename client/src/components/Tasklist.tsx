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
import { CalendarDays, Users, MoreVertical, ArrowUpDown } from "lucide-react";

interface TasklistProps {
  projectId: string;
}

const Tasklist: React.FC<TasklistProps> = ({ projectId }) => {
  const { getTasksByProject, setTasks, updateTask } = useTaskStore();
  const { setIsAddModalOpen } = useModalStore();
  const projectTasks = getTasksByProject(projectId);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("none");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:5000/projects/${projectId}/tasks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data: Task[] = await res.json();
        setTasks(data); // put tasks into Zustand
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    if (projectId) {
      fetchTasks();
    }
  }, [projectId, setTasks]);

  // Handle updating task status on backend
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    const taskId = task._id || task._id;
    if (!taskId) {
      console.error("Task ID is missing:", task);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to update task status");
      }
      const updated = await res.json();
      updateTask(updated); // update Zustand with backend response
    } catch (err) {
      console.error("Error updating task:", err);
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
      {/* Filters - Responsive */}
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
      
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks found
          </div>
        ) : (
          sortedTasks.map((task) => (
            <Card key={task._id || Math.random()} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <EditDeleteMenu task={task} />
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
                    {task.assignedUsers?.map(user => (
                      <Badge key={user.id} variant="outline" className="text-xs">
                        {user.name}
                      </Badge>
                    ))}
                    {(!task.assignedUsers || task.assignedUsers.length === 0) && (
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
          ))
        )}
      </div>
      
      {/* Desktop View - Table */}
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
                  <TableHead>Assigned Users</TableHead>
                  <TableHead className="text-right">Menu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTasks.map((task) => (
                  <TableRow key={task._id || Math.random()}>
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
                      <div className="flex flex-wrap gap-1">
                        {task.assignedUsers?.map(user => (
                          <Badge key={user.id} variant="secondary" className="text-xs">
                            {user.name}
                          </Badge>
                        ))}
                        {(!task.assignedUsers || task.assignedUsers.length === 0) && (
                          <Badge variant="outline" className="text-xs">Unassigned</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <EditDeleteMenu task={task} />
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
    </div>
  );
};

export default Tasklist;