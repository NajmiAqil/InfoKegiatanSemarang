
"use client"

import * as React from "react"
import { useRouter } from "next/navigation";
import CalendarView from "@/components/CalendarView";
import Navbar from "@/components/Navbar";

export default function Home() {
    const [isClient, setIsClient] = React.useState(false)
    const router = useRouter();
    const [userRole, setUserRole] = React.useState<string | null>(null);
    const [username, setUsername] = React.useState<string | null>(null);

    React.useEffect(() => {
        setIsClient(true)
        const role = localStorage.getItem("userRole");
        const storedUsername = localStorage.getItem("username");
        setUserRole(role);
        setUsername(storedUsername);
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("username");
        setUserRole(null);
        setUsername(null);
        router.push("/");
    };


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onLogout={handleLogout} username={username} userRole={userRole} />
      <main className="flex flex-1">
        {isClient && <CalendarView />}
      </main>
    </div>
  );
}
