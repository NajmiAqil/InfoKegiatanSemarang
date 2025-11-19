
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import CalendarView from "@/components/CalendarView";
import Navbar from "@/components/Navbar";

export default function BawahanPage() {
  const router = useRouter();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    const storedUsername = localStorage.getItem("username");
    setUserRole(role);
    setUsername(storedUsername);
    if (role !== "bawahan") {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    setUserRole(null);
    setUsername(null);
    router.push("/");
  };

  if (!userRole) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onLogout={handleLogout} username={username} userRole={userRole} />
      <main className="flex-1 flex">
        <CalendarView />
      </main>
    </div>
  );
}
