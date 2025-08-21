"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { User } from "@/Types/types";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", avatarUrl: "" });

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update User
  const handleSave = async () => {
    if (editingUser) {
      // Update existing user
      await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      // Create new user
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({ name: "", email: "", avatarUrl: "" });
    setEditingUser(null);
    setOpen(false);
    fetchUsers();
  };

  // Delete User
  const handleDelete = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  // Open Edit Dialog
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || "",
    });
    setOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingUser(null);
                setForm({ name: "", email: "", avatarUrl: "" });
              }}
            >
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add User"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              <Input
                placeholder="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                placeholder="Avatar URL"
                name="avatarUrl"
                value={form.avatarUrl}
                onChange={handleChange}
              />
              <Button onClick={handleSave}>
                {editingUser ? "Update" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(user)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
