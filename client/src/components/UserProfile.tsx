"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user data from API
  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  // Handle password update
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, newPassword }),
    });

    alert("Password updated!");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Handle account delete
  const handleDeleteAccount = async () => {
    await fetch("/api/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });
    alert("Account deleted");
  };

  if (!user) return <p className="text-center">Loading...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        {/* Avatar with Initials */}
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarFallback>
            {user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
          {user.name}
        </h2>

        {/* Email */}
        <div className="mb-4 text-left">
          <Label className="text-black dark:text-white">Email</Label>
          <Input value={user.email} readOnly className="mt-1" />
        </div>

        {/* Current Password */}
        <div className="mb-4 text-left">
          <Label className="text-black dark:text-white">Current Password</Label>
          <Input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* New Password */}
        <div className="mb-4 text-left">
          <Label className="text-black dark:text-white">New Password</Label>
          <Input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Confirm New Password */}
        <div className="mb-6 text-left">
          <Label className="text-black dark:text-white">Confirm New Password</Label>
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Update Password Button */}
        <Button onClick={handleUpdatePassword} className="w-full mb-3">
          Update Password
        </Button>

        {/* Delete Account Button */}
        <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
          Delete Account
        </Button>
      </div>
    </div>
  );
}
