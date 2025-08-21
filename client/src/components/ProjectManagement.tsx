// // "use client";

import { useEffect, useRef, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useModalStore } from "@/store/modalStore";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function ProjectManagement() {
  const { projects, setProjects } = useProjectStore();
  const isAddProjectModalOpen = useModalStore((state) => state.isAddProjectModalOpen);
  const hasMounted = useRef(false);

  // Inline Edit Modal state
  const [editProject, setEditProject] = useState<null | any>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("");

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const res = await fetch("http://localhost:5000/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (hasMounted.current && !isAddProjectModalOpen) {
      fetchProjects();
    }
    hasMounted.current = true;
  }, [isAddProjectModalOpen]);

  // Update project in backend
  const handleUpdateProject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`http://localhost:5000/projects/${editProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          colorCode: editColor,
        }),
      });

      if (!res.ok) throw new Error("Failed to update project");

      // Update locally
      setProjects((prev) =>
        prev.map((p) => (p.id === editProject.id ? { ...p, name: editName, description: editDescription, colorCode: editColor } : p))
      );

      setEditProject(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <Button onClick={() => useModalStore.getState().setIsAddProjectModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-gray-600 mb-4">Create your first project to get started</p>
          <Button onClick={() => useModalStore.getState().setIsAddProjectModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/TaskManager?projectId=${project.id}`} className="block relative">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description || "No description"}</CardDescription>

                  {/* Edit & Delete buttons */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {/* Edit */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditProject(project);
                        setEditName(project.name);
                        setEditDescription(project.description || "");
                        setEditColor(project.colorCode || "");
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!confirm("Are you sure you want to delete this project?")) return;

                        try {
                          const token = localStorage.getItem("token");
                          const res = await fetch(`http://localhost:5000/projects/${project.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!res.ok) throw new Error("Failed to delete project");
                          setProjects(projects.filter((p) => p.id !== project.id));
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {project.colorCode && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: project.colorCode }} />
                      <p className="text-sm text-gray-600">Project Color</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={(e) => e.preventDefault()}>
                    View Tasks
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Inline Edit Modal */}
      {editProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setEditProject(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            <input
              type="text"
              className="w-full mb-2 p-2 border rounded"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Project Name"
            />
            <textarea
              className="w-full mb-2 p-2 border rounded"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Project Description"
            />
            <input
              type="color"
              className="w-16 h-8 mb-4"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
            />
            <Button className="w-full" onClick={handleUpdateProject}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
