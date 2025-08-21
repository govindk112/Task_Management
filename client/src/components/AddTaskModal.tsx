"use client";

import { useState, useEffect } from "react";
import { useModalStore } from "@/store/modalStore";
import { useTaskStore } from "@/store/taskStore";
import { useUserStore } from "@/store/userStore"; // You need a user store or import users from UserManagement
import { Task, TaskPriority, TaskStatus } from "@/Types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "./ui/select";
import { Button } from "./ui/button";

export default function AddTaskModal({
  taskToEdit,
  projectId,
}: {
  taskToEdit?: Task | null;
  projectId?: string; // 🔑 Pass projectId when creating task inside a project
}) {
  const { isAddModalOpen, setIsAddModalOpen } = useModalStore();
  const { addTask, updateTask } = useTaskStore();
  const { users = [], tasks = [] } = useUserStore(); // Get all users and tasks

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("To Do");

  // Multi-user assignment state
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  // preload task data when editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setDueDate(
        taskToEdit.dueDate
          ? typeof taskToEdit.dueDate === "string"
            ? taskToEdit.dueDate
            : taskToEdit.dueDate.toISOString().slice(0, 10)
          : ""
      );
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setAssignedUserIds(taskToEdit.assignedUsers?.map((u) => u.id) || []);
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("Medium");
      setStatus("To Do");
      setAssignedUserIds([]);
    }
  }, [taskToEdit, isAddModalOpen]);

  // Filter users: only those not assigned to another task in this project
  const availableUsers = users.filter(
    (user) =>
      !tasks.some(
        (t) =>
          t.projectId === (projectId || "default") &&
          t._id !== taskToEdit?._id &&
          t.assignedUsers?.some((u) => u.id === user.id)
      )
  );

  const handleSubmit = () => {
    if (!title.trim()) return;

    // Get user objects from IDs
    const assignedUsers = users.filter((u) => assignedUserIds.includes(u.id));

    if (taskToEdit) {
      // 🔄 update
      updateTask({
        ...taskToEdit,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        status,
        assignedUsers,
      });
    } else {
      // ➕ create
      addTask({
        _id: crypto.randomUUID(),
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        status,
        projectId: projectId || "default", // ensure task is nested
        assignedUsers,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {taskToEdit ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as TaskPriority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Priority</SelectLabel>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as TaskStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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
          </div>

          <div>
            <Label>Assign Users</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableUsers.map((user) => (
                <label key={user.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={assignedUserIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignedUserIds([...assignedUserIds, user.id]);
                      } else {
                        setAssignedUserIds(
                          assignedUserIds.filter((id) => id !== user.id)
                        );
                      }
                    }}
                  />
                  <span>{user.name}</span>
                </label>
              ))}
              {availableUsers.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No users available
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {taskToEdit ? "Update Task" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
