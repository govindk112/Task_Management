"use client";
import { Button } from "./ui/button";
import { useModalStore } from "@/store/modalStore";
import { useTaskStore } from "@/store/taskStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState, useEffect } from "react";

// Function to decode JWT token and extract user information
const decodeJWT = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const DeleteModal = () => {
  const { setTaskToDelete, taskToDelete, deleteTask } = useTaskStore();
  const { setIsDeleteModalOpen, isDeleteModalOpen } = useModalStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Get token and decode it to get user role
  useEffect(() => {
    const authToken = localStorage.getItem('token');
    
    if (authToken) {
      setToken(authToken);
      console.log("Token found:", authToken);
      
      const decoded = decodeJWT(authToken);
      if (decoded) {
        setDecodedToken(decoded);
        console.log("Decoded token:", decoded);
        
        const role = decoded.role || decoded.userRole || decoded.permissions?.role;
        if (role) {
          setUserRole(role);
          console.log("User role from token:", role);
        } else {
          console.log("Role not found in token. Available fields:", Object.keys(decoded));
        }
      } else {
        console.error("Failed to decode token");
      }
    } else {
      console.log("Token not found in localStorage");
    }
  }, []);
  
  // Reset error when modal opens/closes
  useEffect(() => {
    if (!isDeleteModalOpen) {
      setError(null);
    }
  }, [isDeleteModalOpen]);
  
  const handleCloseDeleteModal = () => {
    setTaskToDelete("");
    setIsDeleteModalOpen(false);
    setError(null);
  };
  
  const handleDeleteTask = async () => {
    console.log("Delete attempt started");
    console.log("Task ID to delete:", taskToDelete);
    console.log("User role:", userRole);
    console.log("Token available:", !!token);
    
    if (!taskToDelete) {
      setError("No task selected to delete");
      return;
    }
    
    if (userRole !== "ADMIN") {
      setError(`You don't have permission to delete tasks. Current role: ${userRole || 'none'}. Admin access required.`);
      return;
    }
    
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      // First, let's verify the task exists by fetching it
      console.log("Verifying task exists before deletion...");
      // UPDATED: Using the correct URL format
      const verifyUrl = `http://localhost:5000/projects/tasks/${taskToDelete}`;
      console.log("Verification URL:", verifyUrl);
      
      const verifyRes = await fetch(verifyUrl, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      console.log("Verification response status:", verifyRes.status);
      
      if (verifyRes.status === 404) {
        throw new Error(`Task with ID ${taskToDelete} not found in the database`);
      }
      
      if (!verifyRes.ok) {
        const errorText = await verifyRes.text();
        throw new Error(`Error verifying task: ${errorText || verifyRes.statusText}`);
      }
      
      const taskData = await verifyRes.json();
      console.log("Task data:", taskData);
      setDebugInfo({ 
        taskExists: true, 
        taskData,
        deleteUrl: `http://localhost:5000/projects/tasks/${taskToDelete}`
      });
      
      // Now proceed with deletion
      console.log("Proceeding with deletion...");
      // UPDATED: Using the correct URL format
      const deleteUrl = `http://localhost:5000/projects/tasks/${taskToDelete}`;
      console.log("Delete URL:", deleteUrl);
      
      const deleteRes = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      console.log("Delete response status:", deleteRes.status);
      
      // Try to get response body for debugging
      let responseBody;
      try {
        responseBody = await deleteRes.text();
        console.log("Delete response body:", responseBody);
      } catch (e) {
        console.error("Error reading delete response body:", e);
      }
      
      // Handle different response statuses
      if (deleteRes.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (deleteRes.status === 403) {
        throw new Error("You don't have permission to delete this task. Admin access required.");
      } else if (deleteRes.status === 404) {
        throw new Error("Task not found. It may have been already deleted.");
      } else if (!deleteRes.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseBody);
        } catch (e) {
          errorData = { error: responseBody || deleteRes.statusText };
        }
        throw new Error(errorData.error || `Failed to delete task. Status: ${deleteRes.status}`);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogDescription>
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
            <div><strong>Task ID:</strong> {taskToDelete}</div>
            <div><strong>User Role:</strong> {userRole || 'Not loaded'}</div>
            <div><strong>Token:</strong> {token ? 'Available' : 'Missing'}</div>
            <div><strong>API URL:</strong> http://localhost:5000/projects/tasks/{taskToDelete}</div>
            {debugInfo && (
              <div className="mt-2">
                <div><strong>Debug Info:</strong></div>
                <pre className="text-xs overflow-auto max-h-40 bg-gray-200 p-1 rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
            {decodedToken && (
              <div className="mt-2">
                <div><strong>Decoded Token:</strong></div>
                <pre className="text-xs overflow-auto max-h-32 bg-gray-200 p-1 rounded">
                  {JSON.stringify(decodedToken, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-2">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleCloseDeleteModal} 
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteTask} 
            disabled={isDeleting || userRole !== "ADMIN"}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : "Delete Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;