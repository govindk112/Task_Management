"use client";
import SidebarProject from "@/components/SidebarProject";
import { useDashboardStore } from "@/store/DashboardStore";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProjectManagement from "@/components/ProjectManagement";
import UserManagement from "@/components/UserManagement";
import AnalyticsDashboard from "@/components/AnalyticsPage";
import { Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { activePage } = useDashboardStore();
  const [user, setUser] = useState<{ userId: string; role: "ADMIN" | "USER" } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/users/${userId}/role`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      const role = (data.role || data.user?.role || "USER").toUpperCase();
      return role === "ADMIN" || role === "USER" ? role : null;
    } catch {
      return null;
    }
  }, []);

  const fetchUserInfo = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      const userId = payload.userId || payload.id || payload.sub || payload._id;
      if (!userId) return null;

      let role = (payload.role || "USER").toUpperCase() as "ADMIN" | "USER";
      const dbRole = await fetchUserRole(userId);
      if (dbRole) role = dbRole;

      return { userId, role };
    } catch {
      return null;
    }
  }, [fetchUserRole]);

  useEffect(() => {
    const initialize = async () => {
      const currentUser = await fetchUserInfo();
      if (!currentUser) {
        router.push("/Login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };
    initialize();
  }, [fetchUserInfo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
        <Button onClick={() => router.push("/login")}>Log In</Button>
      </div>
    );
  }

  const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <Shield className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        You don't have permission to view this page. Only administrators can access this section.
      </p>
      <Button onClick={() => router.push("/dashboard?activePage=project")}>Go to Projects</Button>
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
      case "project":
        return <ProjectManagement />;
      case "user":
        return user.role === "ADMIN" ? <UserManagement /> : <AccessDenied />;
      case "analytics":
        return user.role === "ADMIN" ? <AnalyticsDashboard /> : <AccessDenied />;
      default:
        return <ProjectManagement />;
    }
  };

  return (
    <div className="flex max-sm:flex-col h-screen bg-secondary dark:bg-background">
      <SidebarProject userRole={user.role} />
      <div className="flex-1 p-8 overflow-auto">{renderPage()}</div>
    </div>
  );
}
