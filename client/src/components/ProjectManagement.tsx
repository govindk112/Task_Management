"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/useProjectStore";
import { useModalStore } from "@/store/modalStore";
import { Plus, Trash2, Edit2, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Define TypeScript interfaces
interface Project {
  id: string;
  name: string;
  description?: string;
  colorCode?: string;
}

export default function ProjectManagement() {
  const router = useRouter();
  const { projects, setProjects } = useProjectStore();
  const isAddProjectModalOpen = useModalStore((state) => state.isAddProjectModalOpen);
  const setIsAddProjectModalOpen = useModalStore((state) => state.setIsAddProjectModalOpen);
  const hasMounted = useRef(false);
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("#3b82f6"); // Default color
  
  // Add project state
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#3b82f6"); // Default color
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterColor, setFilterColor] = useState<string | null>(null);

  // Fetch projects with useCallback
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.push("/login");
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/projects`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch projects");
      }
      
      const data = await res.json();
      
      // Handle different response formats
      let projectsData: Project[] = [];
      if (Array.isArray(data)) {
        projectsData = data;
      } else if (data && Array.isArray(data.projects)) {
        projectsData = data.projects;
      } else if (data && typeof data === 'object') {
        const values = Object.values(data);
        if (values.length > 0 && Array.isArray(values[0])) {
          projectsData = values[0];
        }
      }
      
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects. Please try again.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [router, setProjects]);

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Refetch when modal closes
  useEffect(() => {
    if (hasMounted.current && !isAddProjectModalOpen) {
      fetchProjects();
    }
    hasMounted.current = true;
  }, [isAddProjectModalOpen, fetchProjects]);

  // Filter projects based on search query and color
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesColor = filterColor ? project.colorCode === filterColor : true;
    
    return matchesSearch && matchesColor;
  });

  // Get unique colors from projects for filter dropdown
  const uniqueColors = Array.from(
    new Set(projects.map(project => project.colorCode).filter(Boolean))
  ) as string[];

  // Handle project update with validation
  const handleUpdateProject = useCallback(async () => {
    if (!editName.trim()) {
      setError("Project name is required");
      return;
    }
    
    if (!editProject) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/projects/${editProject.id}`, {
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
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to update project");
      }
      
      // Update locally
      setProjects((prev: Project[]) =>
        prev.map((p: Project) => 
          p.id === editProject.id 
            ? { ...p, name: editName, description: editDescription, colorCode: editColor } 
            : p
        )
      );
      
      setEditProject(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [editName, editDescription, editColor, editProject, router, setProjects]);

  // Handle project deletion
  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to delete project");
      }
      
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [projects, router, setProjects]);

  // Handle adding a new project
  const handleAddProject = useCallback(async () => {
    if (!newProjectName.trim()) {
      setError("Project name is required");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
          colorCode: newProjectColor,
        }),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to create project");
      }
      
      // Reset form and close modal
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectColor("#3b82f6");
      setIsAddProjectModalOpen(false);
      
      // Projects will be refetched when modal closes due to useEffect
    } catch (err) {
      console.error(err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [newProjectName, newProjectDescription, newProjectColor, router, setIsAddProjectModalOpen]);

  // Open edit modal with project data
  const openEditModal = useCallback((project: Project) => {
    setEditProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditColor(project.colorCode || "#3b82f6");
  }, []);

  // Close edit modal
  const closeEditModal = useCallback(() => {
    setEditProject(null);
    setError(null);
  }, []);

  // Close add project modal
  const closeAddModal = useCallback(() => {
    setIsAddProjectModalOpen(false);
    setError(null);
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectColor("#3b82f6");
  }, [setIsAddProjectModalOpen]);

  // Open add project modal
  const openAddModal = useCallback(() => {
    setIsAddProjectModalOpen(true);
    setError(null);
  }, [setIsAddProjectModalOpen]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilterColor(null);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <Button onClick={openAddModal} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search projects by name or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <div>
              <select
                className="w-full md:w-40 p-2 border rounded focus:ring-primary focus:border-primary"
                value={filterColor || ""}
                onChange={(e) => setFilterColor(e.target.value || null)}
              >
                <option value="">All Colors</option>
                {uniqueColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
            
            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={!searchQuery && !filterColor}
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        {/* Active filters display */}
        {(searchQuery || filterColor) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchQuery && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                Search: "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery("")}
                  className="ml-2 text-blue-800 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filterColor && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: filterColor }} 
                />
                Color: {filterColor}
                <button 
                  onClick={() => setFilterColor(null)}
                  className="ml-1 text-blue-800 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">
            {projects.length === 0 ? "No projects yet" : "No projects match your filters"}
          </h2>
          <p className="text-gray-600 mb-4">
            {projects.length === 0 
              ? "Create your first project to get started" 
              : "Try adjusting your search or filter criteria"
            }
          </p>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/TaskManager?projectId=${project.id}`} className="block relative">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description || "No description"}</CardDescription>
                    
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          openEditModal(project);
                        }}
                        aria-label="Edit project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteProject(project.id);
                        }}
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {project.colorCode && (
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: project.colorCode }} 
                          aria-hidden="true"
                        />
                        <p className="text-sm text-gray-600">Project Color</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
      
      {/* Add Project Modal */}
      {isAddProjectModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-project-title"
          onClick={(e) => e.target === e.currentTarget && closeAddModal()}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={closeAddModal}
              aria-label="Close add project dialog"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <h2 id="add-project-title" className="text-xl font-bold mb-4">Add New Project</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="new-project-name" className="block text-sm font-medium mb-1">
                  Project Name *
                </label>
                <input
                  id="new-project-name"
                  type="text"
                  className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project Name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="new-project-description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="new-project-description"
                  className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Project Description"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="new-project-color" className="block text-sm font-medium mb-1">
                  Project Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="new-project-color"
                    type="color"
                    className="w-12 h-10 border rounded cursor-pointer"
                    value={newProjectColor}
                    onChange={(e) => setNewProjectColor(e.target.value)}
                  />
                  <span className="text-sm text-gray-600">{newProjectColor}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button 
                className="flex-1" 
                onClick={handleAddProject}
                disabled={isLoading || !newProjectName.trim()}
              >
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
              <Button 
                variant="outline" 
                onClick={closeAddModal}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Project Modal */}
      {editProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-project-title"
          onClick={(e) => e.target === e.currentTarget && closeEditModal()}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={closeEditModal}
              aria-label="Close edit dialog"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <h2 id="edit-project-title" className="text-xl font-bold mb-4">Edit Project</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium mb-1">
                  Project Name *
                </label>
                <input
                  id="project-name"
                  type="text"
                  className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Project Name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="project-description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="project-description"
                  className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Project Description"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="project-color" className="block text-sm font-medium mb-1">
                  Project Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="project-color"
                    type="color"
                    className="w-12 h-10 border rounded cursor-pointer"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                  />
                  <span className="text-sm text-gray-600">{editColor}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button 
                className="flex-1" 
                onClick={handleUpdateProject}
                disabled={isLoading || !editName.trim()}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                variant="outline" 
                onClick={closeEditModal}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}