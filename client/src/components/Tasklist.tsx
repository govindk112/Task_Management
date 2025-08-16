"use client";

import {format } from "date-fns";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Table,TableBody,TableFooter,TableHeader,TableHead,TableRow,TableCell } from "./ui/table";
import { Select,SelectContent,SelectGroup,SelectItem,SelectLabel,SelectTrigger,SelectValue } from "./ui/select";

const Tasklist = () => {
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("none");

    const tasks = [
    { _id: "1", title: "Design Homepage", description: "Create hero section", priority: "High", status: "To Do", dueDate: new Date() },
    { _id: "2", title: "Setup API", description: "Integrate auth", priority: "Medium", status: "In Progress", dueDate: new Date() },
    { _id: "3", title: "Testing", description: "Unit tests", priority: "Low", status: "Completed", dueDate: new Date() },
  ];

  const filteredTasks = tasks.filter(
    (task) =>
      (statusFilter === "all" || task.status === statusFilter) &&
      (priorityFilter === "all" || task.priority === priorityFilter)
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "title")
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);

    if (sortBy === "priority") {
      const priorityOrder: any = { Low: 0, Medium: 1, High: 2 };
      return sortOrder === "asc"
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    if (sortBy === "dueDate") {
      if (!a.dueDate) return sortOrder === "asc" ? 1 : -1;
      if (!b.dueDate) return sortOrder === "asc" ? -1 : 1;
      return sortOrder === "asc"
        ? a.dueDate.getTime() - b.dueDate.getTime()
        : b.dueDate.getTime() - a.dueDate.getTime();
    }

    return 0;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4 justify-start">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-fit px-4 bg-background dark:bg-secondary ">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value)}
        >
          <SelectTrigger className="w-fit px-4 bg-background dark:bg-secondary ">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value)}
        >
          <SelectTrigger className="w-fit px-4 bg-background dark:bg-secondary ">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Sorting</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
          </SelectContent>
        </Select>

        {sortBy !== "none" && (
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </Button>
        )}
      </div>

      {/* Tasks */}
      <div className="py-4 space-y-2">
        {sortedTasks.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-6">
            No tasks found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tasks</TableHead>
                <TableHead className="text-nowrap">Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Menu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => (
                <TableRow key={task._id}>
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
                    {task.dueDate
                      ? format(task.dueDate, "MMM d, yyyy")
                      : "No Due Date"}
                  </TableCell>
                  <TableCell className="text-nowrap">
                    {task.priority}
                  </TableCell>
                  <TableCell className="text-nowrap">
                    <Select value={task.status} onValueChange={() => {}}>
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
                  <TableCell className="text-right">
                    {/* <EditDeleteMenu task={task} /> */}
                    <span className="text-gray-400">Menu</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="text-left text-sm" colSpan={5}>
                  Total Tasks : {sortedTasks.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Tasklist;