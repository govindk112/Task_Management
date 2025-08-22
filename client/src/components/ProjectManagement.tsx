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

// Status options with colors and meanings
const statusOptions = [
  { value: "To Do", color: "red", hex: "#ef4444" },
  { value: "In Progress", color: "yellow", hex: "#eab308" },
  { value: "Complete", color: "green", hex: "#22c55e" }
];

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
  const [editStatus, setEditStatus] = useState("To Do"); // Default status
  
  // Add project state
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState("To Do"); // Default status
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Helper function to get status from color code
  const getStatusFromColor = (colorCode?: string): string => {
    if (!colorCode) return "To Do";
    const option = statusOptions.find(opt => opt.hex === colorCode);
    return option ? option.value : "To Do";
  };

  // Helper function to get color hex from status
  const getColorHexFromStatus = (status: string): string => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.hex : "#ef4444"; // Default to red
  };

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

  // Filter projects based on search query and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const projectStatus = getStatusFromColor(project.colorCode);
    const matchesStatus = filterStatus ? projectStatus === filterStatus : true;
    
    return matchesSearch && matchesStatus;
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
          colorCode: getColorHexFromStatus(editStatus),
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
            ? { ...p, name: editName, description: editDescription, colorCode: getColorHexFromStatus(editStatus) } 
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
  }, [editName, editDescription, editStatus, editProject, router, setProjects]);

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
          colorCode: getColorHexFromStatus(newProjectStatus),
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
      setNewProjectStatus("To Do");
      setIsAddProjectModalOpen(false);
      
      // Projects will be refetched when modal closes due to useEffect
    } catch (err) {
      console.error(err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [newProjectName, newProjectDescription, newProjectStatus, router, setIsAddProjectModalOpen]);

  // Open edit modal with project data
  const openEditModal = useCallback((project: Project) => {
    setEditProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditStatus(getStatusFromColor(project.colorCode));
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
    setNewProjectStatus("To Do");
  }, [setIsAddProjectModalOpen]);

  // Open add project modal
  const openAddModal = useCallback(() => {
    setIsAddProjectModalOpen(true);
    setError(null);
  }, [setIsAddProjectModalOpen]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilterStatus(null);
  }, []);

  // Toggle filter expansion on mobile
  const toggleFilterExpansion = useCallback(() => {
    setIsFilterExpanded(!isFilterExpanded);
  }, [isFilterExpanded]);

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Project Management</h1>
        <Button onClick={openAddModal} disabled={isLoading} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Filter Section - Responsive */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        {/* Mobile Filter Toggle */}
        <div className="sm:hidden mb-3">
          <Button 
            variant="outline" 
            onClick={toggleFilterExpansion}
            className="w-full flex justify-between items-center"
          >
            <span>Filters</span>
            <X className={`w-4 h-4 transform transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        {/* Filter Controls - Hidden on mobile when collapsed */}
        <div className={`${isFilterExpanded ? 'block' : 'hidden'} sm:block`}>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search projects by name or description..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
              >
                <option value="">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
              
              <Button 
                variant="outline" 
                onClick={clearFilters}
                disabled={!searchQuery && !filterStatus}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            </div>
          </div>
          
          {/* Active filters display */}
          {(searchQuery || filterStatus) && (
            <div className="mt-4 flex flex-wrap gap-2">
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
              {filterStatus && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span 
                    className="w-3 h-3 rounded-full border" 
                    style={{ backgroundColor: getColorHexFromStatus(filterStatus) }} 
                  />
                  Status: {filterStatus}
                  <button 
                    onClick={() => setFilterStatus(null)}
                    className="ml-1 text-blue-800 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProjects.map((project) => {
              const projectStatus = getStatusFromColor(project.colorCode);
              const statusColor = getColorHexFromStatus(projectStatus);
              
              return (
                <Link key={project.id} href={`/TaskManager?projectId=${project.id}`} className="block">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary h-full flex flex-col">
                    <CardHeader className="pb-3 flex-grow">
                      <div className="flex justify-between items-start">
                        <div className="pr-8">
                          <CardTitle className="text-lg sm:text-xl mb-1">{project.name}</CardTitle>
                          <CardDescription className="text-sm sm:text-base">
                            {project.description || "No description"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9"
                            onClick={(e) => {
                              e.preventDefault();
                              openEditModal(project);
                            }}
                            aria-label="Edit project"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteProject(project.id);
                            }}
                            aria-label="Delete project"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: statusColor }} 
                          aria-hidden="true"
                        />
                        <p className="text-sm text-gray-600">{projectStatus}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
      
      {/* Add Project Modal - Responsive */}
      {isAddProjectModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-project-title"
          onClick={(e) => e.target === e.currentTarget && closeAddModal()}
        >
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md relative">
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
                <label htmlFor="new-project-status" className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  id="new-project-status"
                  className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                  value={newProjectStatus}
                  onChange={(e) => setNewProjectStatus(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 order-2 sm:order-1" 
                variant="outline"
                onClick={closeAddModal}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 order-1 sm:order-2" 
                onClick={handleAddProject}
                disabled={isLoading || !newProjectName.trim()}
              >
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Project Modal - Responsive */}
      {editProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-project-title"
          onClick={(e) => e.target === e.currentTarget && closeEditModal()}
        >
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md relative">
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
                <label htmlFor="project-status" className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  id="project-status"
                  className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 order-2 sm:order-1" 
                variant="outline"
                onClick={closeEditModal}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 order-1 sm:order-2" 
                onClick={handleUpdateProject}
                disabled={isLoading || !editName.trim()}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}