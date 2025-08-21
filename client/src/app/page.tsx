"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "./dashboard/page";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only run on client
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // redirect to login if no token
    } else {
      setIsChecking(false); // token exists, show dashboard
    }
  }, [router]);

  if (isChecking) {
    return <div>Loading...</div>; // or a spinner
  }

  return <Dashboard />;
}
