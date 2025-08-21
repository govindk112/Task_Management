"use client";

import { useState, useEffect } from "react";
import { useModalStore } from "@/store/modalStore";
import { useTaskStore } from "@/store/taskStore";
import { useUserStore } from "@/store/userStore";
import { Task, TaskPriority, TaskStatus, User } from "@/Types/types";
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
import { v4 as uuidv4 } from "uuid"; // safer than crypto.randomUUID()

export default function AddTaskModal({
  taskToEdit,
  projectId,
}: {
  taskToEdit?: Task | null;
  projectId?: string;
}) {
  const { isAddModalOpen, setIsAddModalOpen } = useModalStore();
  const { addTask, updateTask, tasks = [] } = useTaskStore();
  const { users = [] } = useUserStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  // Preload task data when editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setDueDate(
        taskToEdit.dueDate
          ? typeof taskToEdit.dueDate === "string"
            ? taskToEdit.dueDate
            : ((taskToEdit.dueDate && (taskToEdit.dueDate as any) instanceof Date)
                ? (taskToEdit.dueDate as Date).toISOString().slice(0, 10)
                : "")
          : ""
      );
      setPriority(taskToEdit.priority as TaskPriority);
      setStatus(taskToEdit.status as TaskStatus);
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

  const handleSubmit = () => {
    if (!title.trim()) return;

    const assignedUsers: User[] = users.filter((u) =>
      assignedUserIds.includes(u.id)
    );

    if (taskToEdit) {
      updateTask({
        ...taskToEdit,
        title,
        description,
        dueDate: dueDate || undefined,
        priority,
        status,
        assignedUsers,
      });
    } else {
      addTask({
        _id: uuidv4(),
        title,
        description,
        dueDate: dueDate || undefined,
        priority,
        status,
        projectId: projectId || "default",
        assignedUsers,
      });
    }

    setIsAddModalOpen(false);
  };

  // Users not assigned to other tasks in the same project
  const availableUsers = users.filter(
    (user) =>
      !tasks.some(
        (t) =>
          t.projectId === (projectId || "default") &&
          t._id !== taskToEdit?._id &&
          t.assignedUsers?.some((u) => u.id === user.id)
      )
  );

  return (
    <Dialog
      open={isAddModalOpen}
      onOpenChange={(open) => setIsAddModalOpen(open)}
    >
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
          <Button
            variant="outline"
            onClick={() => setIsAddModalOpen(false)}
          >
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
