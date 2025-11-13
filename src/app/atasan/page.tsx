
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CalendarView from "@/components/CalendarView";
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home } from "lucide-react";

const Navbar = ({ onLogout, username }: { onLogout: () => void; username: string | null }) => {
  return (
    <header className="bg-primary text-primary-foreground px-4 py-2 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Welcome {username}</h1>
        </div>
        <div>
          <Button onClick={onLogout}>Logout</Button>
        </div>
      </div>
    </header>
  );
};

export default function AtasanPage() {
    const router = useRouter();
    const [userRole, setUserRole] = React.useState<string | null>(null);
    const [username, setUsername] = React.useState<string | null>(null);
    const [isClient, setIsClient] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<string | null>(null);


    React.useEffect(() => {
        setIsClient(true);
        const role = localStorage.getItem("userRole");
        const storedUsername = localStorage.getItem("username");
        setUserRole(role);
        setUsername(storedUsername);
        setSelectedUser(storedUsername); // Default to viewing own schedule
        if (role !== "atasan") {
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

    if (!isClient || userRole !== 'atasan') {
        return null; // Or a loading spinner
    }

    return (
        <SidebarProvider defaultOpen={false}>
             <Sidebar variant="floating">
                <SidebarContent>
                    <SidebarMenu>
                         <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setSelectedUser(username)}>
                                <Home />
                                <span>My Schedule</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setSelectedUser('mahes')}>
                            <Avatar className="h-8 w-8">
                            <AvatarFallback>M</AvatarFallback>
                            </Avatar>
                            <span>mahes</span>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <Navbar onLogout={handleLogout} username={username} />
                <main className="flex-1 flex p-4">
                    <CalendarView viewedUser={selectedUser} />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
