"use client"
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Tasklist from "@/components/Tasklist";
import Kanban from "@/components/Kanban";
import AddTaskModal from "@/components/AddTaskModal";
import DeleteModal from "@/components/DeleteTask";
import { useDashboardStore } from "@/store/DashboardStore";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useModalStore } from "@/store/modalStore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { boardView } = useDashboardStore();
  const { getTasksByProject } = useTaskStore();
  const { projects } = useProjectStore();
  const { isAddModalOpen, setIsAddModalOpen } = useModalStore();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [projectName, setProjectName] = useState<string>("All Tasks");

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p._id === projectId);
      setProjectName(project?.name || "Project Tasks");
    } else {
      setProjectName("All Tasks");
    }
  }, [projectId, projects]);

  // Get filtered tasks for the current project
  const filteredTasks = projectId ? getTasksByProject(projectId) : [];

  return (
    <div className="flex max-sm:flex-col h-screen bg-secondary dark:bg-background">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <Header />
        <div className="mb-4">
          {projectId && (
            <p className="text-sm text-gray-600">
              Showing tasks for project: {projectName}
            </p>
          )}
        </div>
        {boardView === "list" ? (
          <Tasklist projectId={projectId} />
        ) : (
          <Kanban projectId={projectId} />
        )}
        
        {/* Modals */}
        <AddTaskModal 
          projectId={projectId || undefined}
        />
        <DeleteModal />
      </div>
    </div>
  );
}
