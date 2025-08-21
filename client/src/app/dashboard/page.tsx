"use client"

import SidebarProject from "@/components/SidebarProject";
import { useDashboardStore } from "@/store/DashboardStore";

// Pages
import ProjectManagement from "@/components/ProjectManagement";
import UserManagement from "@/components/UserManagement";
import AnalyticsDashboard from "@/components/AnalyticsPage";
export default function Dashboard() {
  const { activePage } = useDashboardStore();

  const renderPage = () => {
    switch (activePage) {
      case "project":
        return <ProjectManagement />; // inside it you can show Tasklist / Kanban etc.
      case "user":
        return <UserManagement />;
      case "analytics":
        return <AnalyticsDashboard />;
      default:
        return <ProjectManagement />;
    }
  };

  return (
    <div className="flex max-sm:flex-col h-screen bg-secondary dark:bg-background">
      <SidebarProject />
      <div className="flex-1 p-8 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}
