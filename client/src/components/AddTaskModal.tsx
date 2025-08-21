"use client";

import { useEffect, useState } from "react";
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

type ProjectMember = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export default function AddTaskModal({
  taskToEdit,
  projectId,
}: {
  taskToEdit?: Task | null;
  projectId?: string;
}) {
  const { isAddModalOpen, setIsAddModalOpen } = useModalStore();
  const { addTask, updateTask, setTaskToEdit } = useTaskStore();
  const { users: usersFromStore = [], token: tokenFromStore } = useUserStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Load project members from backend
  useEffect(() => {
    const loadMembers = async () => {
      if (!projectId) return;
      const token = tokenFromStore || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      if (!token) return;

      try {
        const res = await fetch(`http://localhost:5000/projects/${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        const members: ProjectMember[] = Array.isArray(data?.members)
          ? data.members.map((m: any) => ({
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
              avatarUrl: m.user.avatarUrl ?? null,
            }))
          : [];

        setProjectMembers(members);
      } catch (e) {
        console.error("Error loading project members:", e);
      }
    };

    if (isAddModalOpen) loadMembers();
  }, [isAddModalOpen, projectId, tokenFromStore]);

  // Preload edit data whenever taskToEdit changes
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setDueDate(
        taskToEdit.dueDate
          ? typeof taskToEdit.dueDate === "string"
            ? taskToEdit.dueDate
            : (taskToEdit.dueDate as Date).toISOString().slice(0, 10)
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
  }, [taskToEdit]);

  // Clear taskToEdit when modal closes
  useEffect(() => {
    if (!isAddModalOpen) setTaskToEdit(null);
  }, [isAddModalOpen, setTaskToEdit]);

  const availableUsers: ProjectMember[] = projectMembers.length > 0 ? projectMembers : (usersFromStore as ProjectMember[]);

  const normalizeTask = (apiTask: any): Task => {
    const chosenUsers: User[] = availableUsers
      .filter((u) => assignedUserIds.includes(u.id))
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl ?? undefined,
      }));

    return {
      _id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description ?? "",
      dueDate: apiTask.dueDate ? new Date(apiTask.dueDate).toISOString().slice(0, 10) : undefined,
      priority: apiTask.priority as TaskPriority,
      status: apiTask.status as TaskStatus,
      projectId: apiTask.projectId,
      assignedUsers: chosenUsers,
    };
  };

  const handleSubmit = async () => {
    setErrMsg(null);
    if (!title.trim()) {
      setErrMsg("Title is required");
      return;
    }
    if (!projectId) {
      setErrMsg("No project selected");
      return;
    }

    setLoading(true);
    const token = tokenFromStore || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!token) {
      setErrMsg("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    const assigneeId = assignedUserIds[0] ?? undefined;

    try {
      if (taskToEdit) {
        // UPDATE
        const taskId = taskToEdit._id;
        const res = await fetch(`http://localhost:5000/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title, description, dueDate: dueDate || null, priority, status, assigneeId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update task");

        updateTask(normalizeTask(data));
      } else {
        // CREATE
        const res = await fetch(`http://localhost:5000/projects/${projectId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title, description, dueDate: dueDate || null, priority, status, assigneeId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add task");

        addTask(normalizeTask(data));
      }

      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Error saving task:", err);
      setErrMsg(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{taskToEdit ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter task description" />
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
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
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
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
                      if (e.target.checked) setAssignedUserIds((prev) => [...prev, user.id]);
                      else setAssignedUserIds((prev) => prev.filter((id) => id !== user.id));
                    }}
                  />
                  <span>{user.name}</span>
                </label>
              ))}
              {availableUsers.length === 0 && <span className="text-xs text-muted-foreground">No users available</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Backend supports one assignee; the first checked user will be used.</p>
          </div>

          {errMsg && <p className="text-sm text-red-500">{errMsg}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : taskToEdit ? "Update Task" : "Add Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
