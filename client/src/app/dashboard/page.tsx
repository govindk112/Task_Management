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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ userId: string; role: "ADMIN" | "USER" } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isFetchingRole, setIsFetchingRole] = useState(false);
  const router = useRouter();

  // Fetch user role from database
  const fetchUserRole = useCallback(async (userId: string) => {
    setIsFetchingRole(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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
        return null;
      }

      const data = await response.json();
      let role = data.role || data.user?.role;
      if (!role) return null;

      role = role.toUpperCase();
      if (role !== "ADMIN" && role !== "USER") return null;

      return role as "ADMIN" | "USER";
    } catch {
      return null;
    } finally {
      setIsFetchingRole(false);
    }
  }, [router]);

  // Fetch user info from token
  const fetchUserInfo = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      setAuthChecked(true);
      return;
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        setUser(null);
        setAuthChecked(true);
        return;
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const decodedToken = JSON.parse(jsonPayload);

      const userId =
        decodedToken.userId || decodedToken.id || decodedToken.sub || decodedToken._id;
      if (!userId) {
        setUser(null);
        setAuthChecked(true);
        return;
      }

      const tokenRole = decodedToken.role || "USER";
      const normalizedTokenRole = tokenRole.toUpperCase() as "ADMIN" | "USER";

      setUser({ userId, role: normalizedTokenRole });

      const databaseRole = await fetchUserRole(userId);
      if (databaseRole) {
        setUser({ userId, role: databaseRole });
      }
    } catch {
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  }, [fetchUserRole]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
    } else {
      setIsAuthenticated(true);
      fetchUserInfo();
    }
  }, [router, fetchUserInfo]);

  // Access Denied Component
  const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <Shield className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        You don't have permission to view this page. Only administrators can access this section.
      </p>
      <Button onClick={() => router.push("/dashboard?activePage=project")} className="mt-4">
        Go to Projects
      </Button>
    </div>
  );

  if (!isAuthenticated || !authChecked || isFetchingRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="text-gray-600 mb-6">
          You need to be logged in to access this page.
        </p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          Log In
        </Button>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "project":
        return <ProjectManagement />;
      case "user":
        return user?.role === "ADMIN" ? <UserManagement /> : <AccessDenied />;
      case "analytics":
        return user?.role === "ADMIN" ? <AnalyticsDashboard /> : <AccessDenied />;
      default:
        return <ProjectManagement />;
    }
  };

  return (
    <div className="flex max-sm:flex-col h-screen bg-secondary dark:bg-background">
      <SidebarProject userRole={user?.role} />
      <div className="flex-1 p-8 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}
