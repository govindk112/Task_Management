"use client";
import { useState } from "react";
import { useModalStore } from "@/store/modalStore";
import { useProjectStore } from "@/store/useProjectStore";
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
import { Button } from "./ui/button";
import { toast } from "react-hot-toast"; // For notifications

export default function AddProjectModal() {
  const { isAddProjectModalOpen, setIsAddProjectModalOpen } = useModalStore();
  const { projects, setProjects } = useProjectStore();
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
  if (!name.trim()) {
    setError("Project name is required");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // ✅ API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const url = `${apiUrl}/projects`;

    console.log("Request URL:", url);

    // ✅ Get token
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }
    console.log("Token being used:", token);

    // ✅ Send request
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Prefix only here
      },
      body: JSON.stringify({ name, description }),
    });

    console.log("Response status:", res.status);

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error(`Server returned ${res.status} with non-JSON response`);
    }

    const data = await res.json();
    console.log("Response data:", data);

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    // ✅ Success
    setProjects([...projects, data]);
    toast.success("Project created successfully!");
    setIsAddProjectModalOpen(false);
    setName("");
    setDescription("");
  } catch (err: any) {
    console.error("Error:", err);
    setError(err.message || "Failed to create project");
    toast.error(err.message || "Failed to create project");
  } finally {
    setLoading(false);
  }
};



  return (
    <Dialog open={isAddProjectModalOpen} onOpenChange={setIsAddProjectModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter project name"
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
              disabled={loading}
            />
          </div>
          
          <div>
            
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsAddProjectModalOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim() || loading}
          >
            {loading ? "Adding..." : "Add Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}