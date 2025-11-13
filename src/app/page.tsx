
"use client"

import * as React from "react"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CalendarView from "@/components/CalendarView";

const Navbar = () => {
    const router = useRouter();
    const [userRole, setUserRole] = React.useState<string | null>(null);
    const [username, setUsername] = React.useState<string | null>(null);

    React.useEffect(() => {
        const role = localStorage.getItem("userRole");
        const storedUsername = localStorage.getItem("username");
        setUserRole(role);
        setUsername(storedUsername);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("username");
        setUserRole(null);
        setUsername(null);
        router.push("/");
    };

    const handleProfileClick = () => {
        if(userRole === 'atasan') {
            router.push('/atasan');
        } else if (userRole === 'bawahan') {
            router.push('/bawahan');
        }
    }

    return (
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">InfoKegiatanSemarang</h1>
          <div>
            {userRole ? (
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleProfileClick}>
                        Welcome {username}
                    </Button>
                    <Button onClick={handleLogout}>Logout</Button>
                </div>
            ) : (
              <Link href="/login">
                <Button>
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  };

export default function Home() {
    const [isClient, setIsClient] = React.useState(false)

    React.useEffect(() => {
        setIsClient(true)
    }, [])


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex flex-1">
        {isClient && <CalendarView />}
      </main>
    </div>
  );
}
