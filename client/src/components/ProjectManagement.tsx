"use client";

import { useEffect, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";

import { Project, ProjectStatus, ProjectPriority } from "@/Types/types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectManagement() {
  const { projects, setProjects } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    // Mock data for demonstration
    const mockProjects: Project[] = [
      {
        _id: "1",
        name: "Website Redesign",
        description: "Complete overhaul of company website with modern design",
        status: "Active",
        priority: "High",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-03-15"),
        owner: "John Doe",
        
      },
      {
        _id: "2",
        name: "Mobile App Development",
        description: "Native mobile app for iOS and Android platforms",
        status: "On Hold",
        priority: "Critical",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-05-01"),
        owner: "Jane Smith",
      },
    ];

    setProjects(mockProjects);
  }, [setProjects]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <Link href="/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link 
            key={project._id} 
            href={`/TaskManager?projectId=${project._id}`}
            className="block"
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Start: {project.startDate?.toLocaleDateString()}</p>
                    <p>End: {project.endDate?.toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    // This will be handled by the Link parent
                  }}
                >
                  View Tasks
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getStatusColor(status: ProjectStatus) {
  const colors: Record<ProjectStatus, string> = {
    Planning: "bg-blue-100 text-blue-800",
    Active: "bg-green-100 text-green-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    "On Hold": "bg-orange-100 text-orange-800",
    Completed: "bg-purple-100 text-purple-800",
    Cancelled: "bg-red-100 text-red-800",
  };
  return colors[status];
}

function getPriorityColor(priority: ProjectPriority) {
  const colors: Record<ProjectPriority, string> = {
    Low: "bg-gray-100 text-gray-800",
    Medium: "bg-blue-100 text-blue-800",
    High: "bg-orange-100 text-orange-800",
    Critical: "bg-red-100 text-red-800",
  };
  return colors[priority];
}
