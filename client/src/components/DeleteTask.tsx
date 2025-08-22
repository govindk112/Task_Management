"use client";

import { Button } from "./ui/button";
import { useModalStore } from "@/store/modalStore";
import { useTaskStore } from "@/store/taskStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

const DeleteModal = () => {
  const { setTaskToDelete, taskToDelete, deleteTask } = useTaskStore();
  const { setIsDeleteModalOpen, isDeleteModalOpen } = useModalStore();

  const handleCloseDeleteModal = () => {
    setTaskToDelete("");
    setIsDeleteModalOpen(false);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) {
      console.log("No task selected to delete");
      return;
    }

    try {
      // Hardcoded API URL for testing
      const url = `http://localhost:5000/tasks/${taskToDelete}`;
    
      console.log("Deleting task at URL:", url);

      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Failed to delete task. Status:", res.status);
        return;
      }

      // Try parsing JSON, but fallback if server returns HTML
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.warn("Response is not JSON:", err);
        data = null;
      }

      deleteTask(taskToDelete);
      setTaskToDelete("");
      setIsDeleteModalOpen(false);
      console.log("Task deleted successfully", data);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={handleCloseDeleteModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteTask}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
