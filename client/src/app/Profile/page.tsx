"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: "ADMIN" | "USER";
}

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Replace with your real logged-in user id
  const currentUserId = "1";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }
        
        const response = await fetch('http://localhost:5000/users/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include' // Include cookies if needed
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch users: ${response.status}`);
        }
        
        const users: User[] = await response.json();
        
        // Find the current user in the array
        const currentUser = users.find(u => u.id === currentUserId);
        
        if (currentUser) {
          setUser(currentUser);
        } else {
          setError("User not found in the list. You might need admin privileges.");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [currentUserId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      <div className="flex flex-col items-center gap-4 mb-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.avatarUrl || "https://github.com/shadcn.png"} alt="User Avatar" />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-muted-foreground">{user.email}</p>
        <span className={`px-2 py-1 rounded text-xs ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
          {user.role}
        </span>
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
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <Input value={user.role} readOnly />
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