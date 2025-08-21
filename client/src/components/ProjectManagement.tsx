"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useModalStore } from "@/store/modalStore";

import { Project } from "@/Types/types";
import { Plus } from "lucide-react";
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
import AddProjectModal from "@/components/AddProjectModal"; // Import the modal

export default function ProjectManagement() {
  const { projects, setProjects } = useProjectStore();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
          method: "GET",
          credentials: "include", // send cookies/JWT if needed
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // if JWT based
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data: Project[] = await res.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [setProjects]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <Button
          onClick={() =>
            useModalStore.getState().setIsAddProjectModalOpen(true)
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/TaskManager?projectId=${project.id}`}
            className="block"
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {project.colorCode && (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: project.colorCode }}
                    />
                    <p className="text-sm text-gray-600">Project Color</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigation handled by Link
                  }}
                >
                  View Tasks
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {/* Modal for adding project */}
      <AddProjectModal />
    </div>
  );
}
