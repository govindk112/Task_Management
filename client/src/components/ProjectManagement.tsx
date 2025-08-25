"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/useProjectStore";
import { useModalStore } from "@/store/modalStore";
import { Plus, Trash2, Edit2, X, Search, Shield, AlertCircle, User } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Define TypeScript interfaces based on backend service
interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
}

// Define User interface
interface User {
  userId: string;
  role: "ADMIN" | "USER";
}

// Status options
const statusOptions = [
  { value: "To Do", color: "red" },
  { value: "In Progress", color: "yellow" },
  { value: "Complete", color: "green" }
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
  const [editStatus, setEditStatus] = useState("To Do");
  
  // Add project state
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState("To Do");
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [windowWidth, setWindowWidth] = useState(0);
  
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isFetchingRole, setIsFetchingRole] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Helper function to get color from status
  const getColorFromStatus = (status: string): string => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : "red";
  };

  // Fetch user role from database
  const fetchUserRole = useCallback(async (userId: string) => {
    setIsFetchingRole(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found when fetching user role");
        return null;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      console.log("Fetching role from:", `${apiUrl}/users/${userId}/role`);
      
      const response = await fetch(`${apiUrl}/users/${userId}/role`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return null;
        }
        console.error("Failed to fetch user role:", response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log("User role response:", data);
      
      // Handle different response formats
      let role = data.role;
      if (!role && data.user && data.user.role) {
        role = data.user.role;
      }
      
      if (!role) {
        console.error("Role not found in response");
        return null;
      }
      
      // Normalize role to uppercase
      role = role.toUpperCase();
      
      if (role !== "ADMIN" && role !== "USER") {
        console.error("Invalid role value:", role);
        return null;
      }
      
      console.log("Successfully fetched role from database:", role);
      return role as "ADMIN" | "USER";
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    } finally {
      setIsFetchingRole(false);
    }
  }, [router]);

  // Fetch user info from token
  const fetchUserInfo = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      console.log("Token from localStorage:", token ? "Token exists" : "No token found");
      
      if (!token) {
        console.log("No token found in localStorage");
        setUser(null);
        setAuthChecked(true);
        setDebugInfo({ token: null, error: "No token found" });
        return;
      }
      
      try {
        // Decode JWT token
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.error("Invalid token format - expected 3 parts, got", parts.length);
          setUser(null);
          setAuthChecked(true);
          setDebugInfo({ token, error: "Invalid token format" });
          return;
        }
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        console.log("Decoded token payload:", decodedToken);
        
        // Try multiple possible field names for user ID
        const userId = decodedToken.userId || 
                      decodedToken.id || 
                      decodedToken.sub || 
                      decodedToken._id;
        
        console.log("Extracted userId:", userId);
        
        if (!userId) {
          console.error("Token missing userId");
          setUser(null);
          setAuthChecked(true);
          setDebugInfo({ 
            token: decodedToken, 
            error: "Token missing userId",
            foundKeys: Object.keys(decodedToken)
          });
          return;
        }
        
        // First, set the user with the role from the token as a temporary value
        // We'll update this after fetching the actual role from the database
        const tokenRole = decodedToken.role || "USER";
        const normalizedTokenRole = tokenRole.toUpperCase() as "ADMIN" | "USER";
        
        console.log("Token role:", tokenRole, "Normalized:", normalizedTokenRole);
        
        const tempUserData = {
          userId: userId,
          role: normalizedTokenRole
        };
        
        console.log("Setting temporary user state with token role:", tempUserData);
        setUser(tempUserData);
        setDebugInfo({ 
          user: tempUserData, 
          token: decodedToken,
          note: "Using token role temporarily, fetching database role..."
        });
        
        // Now try to fetch the actual role from the database
        console.log("Fetching actual role from database...");
        const databaseRole = await fetchUserRole(userId);
        
        if (databaseRole) {
          console.log("Got actual role from database:", databaseRole);
          const finalUserData = {
            userId: userId,
            role: databaseRole
          };
          setUser(finalUserData);
          setDebugInfo({ 
            user: finalUserData, 
            token: decodedToken,
            note: "Updated with role from database"
          });
        } else {
          console.log("Could not fetch role from database, keeping token role");
          setDebugInfo({ 
            user: tempUserData, 
            token: decodedToken,
            note: "Could not fetch database role, using token role"
          });
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        setUser(null);
        setAuthChecked(true);
        setDebugInfo({ token, error: "Token decode error", details: err });
      } finally {
        setAuthChecked(true);
      }
    } catch (err) {
      console.error("Error in fetchUserInfo:", err);
      setUser(null);
      setAuthChecked(true);
      setDebugInfo({ error: "General error", details: err });
    }
  }, [fetchUserRole]);

  // Fetch projects
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
      console.log("Fetching projects from:", `${apiUrl}/projects`);
      
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
        throw new Error(`Failed to fetch projects: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("Raw projects response:", data);
      
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
      
      console.log("Processed projects data:", projectsData);
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
    console.log("Component mounted, fetching user info");
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Fetch projects after user info is loaded
  useEffect(() => {
    if (authChecked && user) {
      console.log("User info loaded, fetching projects");
      fetchProjects();
    }
  }, [authChecked, user, fetchProjects]);

  // Refetch when modal closes
  useEffect(() => {
    if (hasMounted.current && !isAddProjectModalOpen) {
      fetchProjects();
    }
    hasMounted.current = true;
  }, [isAddProjectModalOpen, fetchProjects]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      if (window.innerWidth < 640) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(4);
      } else {
        setItemsPerPage(6);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, projects]);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const projectStatus = "To Do";
    const matchesStatus = filterStatus ? projectStatus === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Handle project update
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
        }),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          setError("You are not authorized to update this project");
          return;
        }
        throw new Error("Failed to update project");
      }
      
      setProjects((prev: Project[]) =>
        prev.map((p: Project) => 
          p.id === editProject.id 
            ? { ...p, name: editName, description: editDescription } 
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
  }, [editName, editDescription, editProject, router, setProjects]);

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
        if (res.status === 403) {
          setError("You are not authorized to delete this project");
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

  // Handle adding a new project (Admin only)
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
        }),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          setError("Only administrators can create projects");
          return;
        }
        throw new Error("Failed to create project");
      }
      
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectStatus("To Do");
      setIsAddProjectModalOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [newProjectName, newProjectDescription, router, setIsAddProjectModalOpen]);

  // Open edit modal
  const openEditModal = useCallback((project: Project) => {
    setEditProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditStatus("To Do");
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

  // Open add project modal (Admin only)
  const openAddModal = useCallback(() => {
    if (user?.role !== "ADMIN") {
      setError("Only administrators can create projects");
      return;
    }
    setIsAddProjectModalOpen(true);
    setError(null);
  }, [user, setIsAddProjectModalOpen]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilterStatus(null);
  }, []);

  // Toggle filter expansion
  const toggleFilterExpansion = useCallback(() => {
    setIsFilterExpanded(!isFilterExpanded);
  }, [isFilterExpanded]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages - 1, start + maxVisiblePages - 3);
      
      if (end === totalPages - 1) {
        start = Math.max(2, end - maxVisiblePages + 3);
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Debug information
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Auth checked:", authChecked);
    console.log("Projects:", projects);
    console.log("Debug info:", debugInfo);
  }, [user, authChecked, projects, debugInfo]);

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Debug Panel */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-yellow-800">Debug Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <div><strong>User ID:</strong> {user?.userId || 'Not available'}</div>
              <div><strong>Role:</strong> {user?.role || 'Not available'}</div>
              <div><strong>Status:</strong> {authChecked ? 'Authenticated' : 'Checking...'}</div>
              <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
              <div><strong>Error:</strong> {error || 'None'}</div>
              <div className="mt-2">
                <strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}
              </div>
              
              {debugInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">Technical Details</summary>
                  <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Project Management</h1>
          {user && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
              user.role === "ADMIN" 
                ? "bg-purple-100 text-purple-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {user.role === "ADMIN" ? (
                <Shield className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              {user.role}
            </div>
          )}
        </div>
        
        {/* Only show New Project button for Admins */}
        {user?.role === "ADMIN" && (
          <Button onClick={openAddModal} disabled={isLoading} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </div>
      
      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
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
                    style={{ backgroundColor: getColorFromStatus(filterStatus) }} 
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
      
      {isLoading || isFetchingRole ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">
            {projects.length === 0 ? "No projects yet" : "No projects match your filters"}
          </h2>
          <p className="text-gray-600 mb-4">
            {projects.length === 0 
              ? (user?.role === "ADMIN" 
                  ? "Create your first project to get started" 
                  : "You don't have any projects assigned to you yet")
              : "Try adjusting your search or filter criteria"
            }
          </p>
          {user?.role === "ADMIN" && (
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
            </span>
            <span className="text-xs">
              {windowWidth < 640 ? "2 per page" : windowWidth < 1024 ? "4 per page" : "6 per page"}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentProjects.map((project) => {
              const isOwner = user && user.userId === project.ownerId;
              
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
                        
                        {/* Only show edit/delete buttons for project owners */}
                        {isOwner && (
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
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: getColorFromStatus("To Do") }} 
                          aria-hidden="true"
                        />
                        <p className="text-sm text-gray-600">To Do</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span>Owner ID:</span>
                        <span className="font-mono">{project.ownerId}</span>
                        {isOwner && (
                          <span className="text-green-600">(You)</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2">...</span>
                      ) : (
                        <PaginationLink 
                          onClick={() => handlePageChange(page as number)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
      
      {/* Add Project Modal - Only for Admins */}
      {isAddProjectModalOpen && user?.role === "ADMIN" && (
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
      
      {/* Edit Project Modal - Only for Project Owners */}
      {editProject && user && user.userId === editProject.ownerId && (
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