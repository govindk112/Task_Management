"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Shield, AlertCircle } from "lucide-react";
import { User as UserType } from "@/Types/types";

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [user, setUser] = useState<{ userId: string; role: "ADMIN" | "USER" } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isFetchingRole, setIsFetchingRole] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user role from database
  const fetchUserRole = useCallback(
    async (userId: string) => {
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
    },
    [router]
  );

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

  // Fetch all demo users
  const fetchUsers = useCallback(
    async () => {
      if (!user || user.role !== "ADMIN") return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/users`, {
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
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUsers(data);
      } catch {
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user, router]
  );

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (authChecked && user && user.role === "ADMIN") {
      fetchUsers();
    }
  }, [authChecked, user, fetchUsers]);

  // Delete User
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/users/${id}`, {
        method: "DELETE",
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
        if (res.status === 403) {
          alert("You are not authorized to delete users");
          return;
        }
        throw new Error("Failed to delete user");
      }

      fetchUsers();
    } catch {
      alert("Failed to delete user. Please try again.");
    }
  };

  const getAvatarUrl = (user: UserType) => {
    if (user.avatarUrl) return user.avatarUrl;

    const initials = user.name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&background=0D8ABC&color=fff&size=64`;
  };

  if (!authChecked || isFetchingRole) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (authChecked && user && user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Shield className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to view this page. Only administrators can access user
            management.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (authChecked && !user) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this page.
          </p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">User Management</h1>
          {user && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              <Shield className="w-4 h-4" />
              {user.role}
            </div>
          )}
        </div>
        <Button onClick={fetchUsers} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xl">👤</span>
            </div>
          </div>
          <p className="text-gray-500">No demo members available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div className="absolute inset-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm hidden">
                      {user.name
                        .split(" ")
                        .map((part) => part.charAt(0))
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-semibold">{user.name}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(user.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  aria-label="Delete user"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
