// UserProfile.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/Login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!checkAuth()) return;

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.status === 401) {
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch profile: ${response.status}`);
        }

        const userData: User = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="min-h-screen flex justify-center items-start pt-16 ">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>

        <div className="flex flex-col items-center gap-4 mb-6">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src={user.avatarUrl || "https://github.com/shadcn.png"} 
              alt={`${user.name}'s avatar`} 
            />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>

          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.role === 'ADMIN' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
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

          <div className="flex gap-4 pt-4">
            <Button disabled className="cursor-not-allowed">Save Changes</Button>
            <Button variant="outline" disabled className="cursor-not-allowed">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
