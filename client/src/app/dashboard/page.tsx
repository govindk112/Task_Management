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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const router = useRouter();

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login"); // redirect to login if not authenticated
    } else {
      setIsAuthenticated(true);
      fetchUserInfo(); // Fetch user info and role
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

  // Show loading state while checking authentication
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

  // Show login prompt if not authenticated
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
        // Only Admins can access User Management
        if (user?.role === "ADMIN") {
          return <UserManagement />;
        } else {
          return <AccessDenied />;
        }
      case "analytics":
        // Only Admins can access Analytics Dashboard
        if (user?.role === "ADMIN") {
          return <AnalyticsDashboard />;
        } else {
          return <AccessDenied />;
        }
      default:
        return <ProjectManagement />;
    }
  };

  return (
    <div className="flex max-sm:flex-col h-screen bg-secondary dark:bg-background">
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-xs">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Debug Info</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <div><strong>Active Page:</strong> {activePage}</div>
                <div><strong>User Role:</strong> {user?.role || 'Not available'}</div>
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
      )}
      
      <SidebarProject userRole={user?.role} />
      <div className="flex-1 p-8 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}