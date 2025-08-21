"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.push("/dashboard"); // redirect to dashboard if authenticated
    } else {
      router.push("/login"); // redirect to login if not authenticated
    }
  }, [router]);

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
}
