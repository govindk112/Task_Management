"use client";

import { useState } from "react";
import { useModalStore } from "@/store/modalStore";
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

export default function AddProjectModal() {
  const { isAddProjectModalOpen, setIsAddProjectModalOpen } = useModalStore();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [colorCode, setColorCode] = useState("#3b82f6"); // default blue
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, colorCode }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      // ✅ Close modal & reset form
      setIsAddProjectModalOpen(false);
      setName("");
      setDescription("");
      setColorCode("#3b82f6");
    } catch (err) {
      console.error(err);
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

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
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
            />
          </div>

          <div>
            <Label htmlFor="colorCode">Project Color</Label>
            <Input
              id="colorCode"
              type="color"
              value={colorCode}
              onChange={(e) => setColorCode(e.target.value)}
            />
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
          <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading ? "Adding..." : "Add Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
