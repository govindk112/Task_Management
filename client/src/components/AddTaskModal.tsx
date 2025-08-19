"use client";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { EMPTY_TASK } from "@/lib/constants";
import { useTaskStore } from "@/store/taskStore";
import { useModalStore } from "@/store/modalStore";
import { TaskPriority, TaskStatus } from "@/Types/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { format } from "date-fns";

const AddTaskModal = () => {
  const { newTask, setNewTask } = useTaskStore();
  const { isAddModalOpen, setIsAddModalOpen } = useModalStore();

  const handleClose = () => {
    setIsAddModalOpen(false);
    setNewTask(EMPTY_TASK);
  };

  return (
    <Dialog open={isAddModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {newTask._id ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (newTask._id) {
            // This is an edit - but we need to handle this differently
            // For now, let's focus on adding new tasks
            useTaskStore.getState().updateTask(newTask);
          } else {
            // Add new task
            const taskToAdd = {
              ...newTask,
              _id: Date.now().toString(), // Generate a simple ID
              createdAt: new Date(),
            };
            useTaskStore.getState().addTask(taskToAdd);
          }
          handleClose();
        }}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-left">
                Title
              </Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-left">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-left">
                Status
              </Label>
              <Select
                value={newTask.status}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, status: value as TaskStatus })
                }
              >
                <SelectTrigger className="col-span-3">
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
              <Label htmlFor="priority" className="text-left">
                Priority
              </Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, priority: value as TaskPriority })
                }
              >
                <SelectTrigger className="col-span-3">
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
              <Label htmlFor="dueDate" className="text-left">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate ? format(newTask.dueDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    dueDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="col-span-3 w-fit"
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
};

export default AddTaskModal;
