
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CalendarView from "@/components/CalendarView";

const Navbar = ({ onLogout, username }: { onLogout: () => void; username: string | null }) => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome {username}</h1>
        <div>
          <Button onClick={onLogout}>Logout</Button>
        </div>
      </div>
    </header>
  );
};

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
      <Navbar onLogout={handleLogout} username={username} />
      <main className="flex-1 flex">
        <CalendarView />
      </main>
    </div>
  );
}
