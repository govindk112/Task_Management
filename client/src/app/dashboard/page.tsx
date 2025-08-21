"use client";

import SidebarProject from "@/components/SidebarProject";
import { useDashboardStore } from "@/store/DashboardStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProjectManagement from "@/components/ProjectManagement";
import UserManagement from "@/components/UserManagement";
import AnalyticsDashboard from "@/components/AnalyticsPage";

export default function Dashboard() {
  const { activePage } = useDashboardStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // redirect to login if not authenticated
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const renderPage = () => {
    switch (activePage) {
      case "project":
        return <ProjectManagement />;
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
      <div className="flex-1 p-8 overflow-auto">{renderPage()}</div>
    </div>
  );
}
