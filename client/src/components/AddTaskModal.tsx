"use client";

import { useEffect, useState } from "react";
import { useModalStore } from "@/store/modalStore";
import { useTaskStore } from "@/store/taskStore";
import { useUserStore } from "@/store/userStore";
import { Task, TaskPriority, TaskStatus, User } from "@/Types/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "./ui/select";
import { Button } from "./ui/button";

export default function AddTaskModal({ projectId }: { projectId?: string }) {
  const { isAddModalOpen, setIsAddModalOpen } = useModalStore();
  const { taskToEdit, setTaskToEdit, addTask, updateTask, deleteTask } = useTaskStore();
  const { users: usersFromStore = [], token: tokenFromStore } = useUserStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const token = tokenFromStore || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  // Load project members
  useEffect(() => {
    if (!isAddModalOpen || !projectId || !token) return;
    const fetchMembers = async () => {
      try {
        const res = await fetch(`http://localhost:5000/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setProjectMembers((data?.members || []).map((m: any) => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatarUrl: m.user.avatarUrl || undefined,
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMembers();
  }, [isAddModalOpen, projectId, token]);

  // Prefill form for editing
  useEffect(() => {
    if (!isAddModalOpen) return;
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.slice(0, 10) : "");
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setAssignedUserIds(taskToEdit.assignedUsers?.map(u => u.id) || []);
    } else {
      setTitle(""); setDescription(""); setDueDate(""); setPriority("Medium"); setStatus("To Do"); setAssignedUserIds([]);
    }
  }, [isAddModalOpen, taskToEdit]);

  const availableUsers = projectMembers.length > 0 ? projectMembers : usersFromStore;

  const handleSubmit = async () => {
    setErrMsg(null);
    if (!title.trim()) return setErrMsg("Title is required");
    if (!projectId) return setErrMsg("No project selected");
    if (!token) return setErrMsg("Please log in again");

    setLoading(true);
    const assigneeId = assignedUserIds[0] || taskToEdit?.assignedUsers?.[0]?.id;

    try {
      let res, data;
      if (taskToEdit) {
        // Edit existing task
        res = await fetch(`http://localhost:5000/tasks/${taskToEdit._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title, description, dueDate, priority, status, assigneeId }),
        });
      } else {
        // Add new task
        res = await fetch(`http://localhost:5000/projects/${projectId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title, description, dueDate, priority, status, assigneeId }),
        });
      }

      data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save task");

      const updatedTask: Task = {
        _id: data._id || data.id,
        title: data.title,
        description: data.description || "",
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().slice(0, 10) : undefined,
        priority: data.priority,
        status: data.status,
        projectId: data.projectId,
        assignedUsers: availableUsers.filter(u => assignedUserIds.includes(u.id)),
      };

      taskToEdit ? updateTask(updatedTask) : addTask(updatedTask);

      setIsAddModalOpen(false);
      setTaskToEdit(null);
    } catch (err: any) {
      setErrMsg(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToEdit || !taskToEdit._id) return;
    if (!confirm("Are you sure you want to delete this task?")) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/tasks/${taskToEdit._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete task");
      }

      deleteTask(taskToEdit._id);
      setIsAddModalOpen(false);
      setTaskToEdit(null);
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if (!open) setTaskToEdit(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{taskToEdit ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>

          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={v => setPriority(v as TaskPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as TaskStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Assign Users</Label>
            <div className="flex flex-wrap gap-2">
              {availableUsers.map(u => (
                <label key={u.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={assignedUserIds.includes(u.id)}
                         onChange={e => e.target.checked
                           ? setAssignedUserIds([...assignedUserIds, u.id])
                           : setAssignedUserIds(assignedUserIds.filter(id => id !== u.id))} />
                  {u.name}
                </label>
              ))}
            </div>
          </div>

          {errMsg && <p className="text-red-500">{errMsg}</p>}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setTaskToEdit(null); }}>Cancel</Button>
          <div className="flex gap-2">
            {taskToEdit && <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button>}
            <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : taskToEdit ? "Update Task" : "Add Task"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
