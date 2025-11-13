
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CalendarView from "@/components/CalendarView";
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarFooter } from "@/components/ui/sidebar";

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

const AtasanPageContent = () => {
    const { setOpen } = useSidebar();
    const router = useRouter();
    const [userRole, setUserRole] = React.useState<string | null>(null);
    const [username, setUsername] = React.useState<string | null>(null);
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
        const role = localStorage.getItem("userRole");
        const storedUsername = localStorage.getItem("username");
        setUserRole(role);
        setUsername(storedUsername);
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
        <div className="flex flex-col min-h-screen">
            <Sidebar variant="floating">
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Avatar className="h-8 w-8">
                            <AvatarFallback>M</AvatarFallback>
                            </Avatar>
                            <span>mahes</span>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <Navbar onLogout={handleLogout} username={username} />
                <main className="flex-1 flex">
                    <CalendarView />
                </main>
            </SidebarInset>
        </div>
    )
}

export default function AtasanPage() {
  return (
    <SidebarProvider defaultOpen={false}>
        <AtasanPageContent />
    </SidebarProvider>
  )
}
