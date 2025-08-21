"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { User } from "@/Types/types";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);

  // Fetch all demo users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // 👇 assuming your backend returns all users and filters out project owners
    const res = await fetch("http://localhost:5000/users"); 
    const data = await res.json();
    setUsers(data);
  };

  // Delete User (if needed)
  const handleDelete = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {/* 🔥 Removed Add User Button */}
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500">No demo members available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h2 className="font-semibold">{user.name}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
