"use client"
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Tasklist from "@/components/Tasklist";
import Kanban from "@/components/Kanban";
import { useDashboardStore } from "@/store/DashboardStore";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { boardView, setBoardView } = useDashboardStore();
  const { getTasksByProject } = useTaskStore();
  const { projects } = useProjectStore();
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

  // Create a wrapper component that uses the filtered tasks
  const FilteredTasklist = () => {
    const tasks = projectId ? getTasksByProject(projectId) : [];
    return <Tasklist />;
  };

  const FilteredKanban = () => {
    const tasks = projectId ? getTasksByProject(projectId) : [];
    return <Kanban />;
  };

  return (
    <div className="flex max-sm:flex-col h-screen bg-secondary dark:bg-background">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <Header />
        <div className="mb-4">
          {projectId && (
            <p className="text-sm text-gray-600">
              Showing tasks for this project
            </p>
          )}
        </div>
        {boardView === "list" ? (
          <FilteredTasklist />
        ) : (
          <FilteredKanban />
        )}
      </div>
    </div>
  );
}
