"use client";
import { Button } from "./ui/button";
import { useModalStore } from "@/store/modalStore";
import { useTaskStore } from "@/store/taskStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";

const DeleteModal = () => {
  const { setTaskToDelete, taskToDelete, deleteTask } = useTaskStore();
  const { setIsDeleteModalOpen, isDeleteModalOpen } = useModalStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCloseDeleteModal = () => {
    setTaskToDelete("");
    setIsDeleteModalOpen(false);
    setError(null);
  };
  
  const handleDeleteTask = async () => {
    if (!taskToDelete) {
      setError("No task selected to delete");
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }
      
      // Use the correct API endpoint
      const url = `http://localhost:5000/tasks/${taskToDelete}`;
      console.log("Request URL:", url);
      
      const res = await fetch(url, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include the authentication token
        },
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = { error: res.statusText };
        }
        console.error("Error response:", errorData);
        const errorMessage = errorData.error || `Failed to delete task. Status: ${res.status}`;
        throw new Error(errorMessage);
      }
      
      // Update the store
      deleteTask(taskToDelete);
      
      // Close modal
      setTaskToDelete("");
      setIsDeleteModalOpen(false);
      
      console.log("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      setError(error instanceof Error ? error.message : "Failed to delete task");
    } finally {
      setIsDeleting(false);
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
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseDeleteModal} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteTask} 
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;