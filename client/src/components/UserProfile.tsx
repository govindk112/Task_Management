"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile() {
  const [email] = useState("govind@example.com"); // example data
  const [name] = useState("Govind Karguppikar");

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        {/* Avatar */}
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src="/profile-pic.jpg" alt={name} />
          <AvatarFallback>GK</AvatarFallback>
        </Avatar>

        {/* Name */}
        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
          {name}
        </h2>

        {/* Email */}
        <div className="mb-4 text-left">
          <Label className="text-black dark:text-white">Email</Label>
          <Input value={email} readOnly className="mt-1" />
        </div>

        {/* Current Password */}
        <div className="mb-4 text-left">
          <Label className="text-black dark:text-white">Current Password</Label>
          <Input type="password" placeholder="Enter current password" className="mt-1" />
        </div>

        {/* Confirm New Password */}
        <div className="mb-6 text-left">
          <Label className="text-black dark:text-white">Confirm New Password</Label>
          <Input type="password" placeholder="Confirm new password" className="mt-1" />
        </div>

        {/* Update Password Button */}
        <Button className="w-full mb-3">Update Password</Button>

        {/* Delete Account Button */}
        <Button variant="destructive" className="w-full">
          Delete Account
        </Button>
      </div>
    </div>
  );
}