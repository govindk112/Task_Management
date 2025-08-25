"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: "ADMIN" | "USER";
}

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Replace with your real logged-in user id or token if needed
  const userId = "1";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/users/${userId}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>

      <div className="flex flex-col items-center gap-4 mb-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.avatar || "https://github.com/shadcn.png"} alt="User Avatar" />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <Input value={user.name} readOnly />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <Input value={user.email} readOnly />
        </div>
        <div className="flex gap-4">
          <Button disabled>Save Changes</Button>
          <Button variant="outline" disabled>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
