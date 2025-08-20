"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { format } from "date-fns";
import { TaskPriority, TaskStatus } from "@/Types/types";

type AddTaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
};

export default function AddTaskModal({
  open,
  onOpenChange,
  projectId,
}: AddTaskModalProps) {
  const { newTask, setNewTask, addTask, updateTask, resetNewTask } =
    useTaskStore();
  const { projects } = useProjectStore();

  // Reset newTask when modal closes
  useEffect(() => {
    if (!open) resetNewTask();
  }, [open, resetNewTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title || !newTask.projectId) {
      return; // validation
    }

    if (newTask._id) {
      updateTask(newTask);
    } else {
      addTask({
        ...newTask,
        _id: Date.now().toString(),
        projectId: projectId || newTask.projectId,
      });
    }

    resetNewTask();
    onOpenChange(false);
  };

  const handleClose = () => {
    resetNewTask();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {newTask._id ? "Edit Task" : "Add New Task"}
            </DialogTitle>
            <DialogDescription>
              {newTask._id
                ? "Update task details below."
                : "Fill in the details to add a new task."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            {/* Project */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectId" className="text-right">
                Project
              </Label>
              <Select
                name="projectId"
                value={newTask.projectId || ""}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, projectId: value })
                }
                disabled={!!projectId}
              >
                <SelectTrigger id="projectId" className="col-span-3">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                name="status"
                value={newTask.status}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, status: value as TaskStatus })
                }
              >
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                name="priority"
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, priority: value as TaskPriority })
                }
              >
                <SelectTrigger id="priority" className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={
                  newTask.dueDate ? format(newTask.dueDate, "yyyy-MM-dd") : ""
                }
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: new Date(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {newTask._id ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
