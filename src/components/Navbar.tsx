
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = ({
  onLogout,
  username,
  userRole,
  showSidebarTrigger = false,
}: {
  onLogout: () => void;
  username: string | null;
  userRole: string | null;
  showSidebarTrigger?: boolean;
}) => {
  const router = useRouter();

  const handleProfileClick = () => {
    if (userRole === "atasan") {
      router.push("/atasan");
    } else if (userRole === "bawahan") {
      router.push("/bawahan");
    }
  };

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showSidebarTrigger && <SidebarTrigger />}
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold">InfoKegiatanSemarang</h1>
        </div>
        <div>
          {userRole ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleProfileClick}>
                Welcome {username}
              </Button>
              <Button onClick={onLogout}>Logout</Button>
            </div>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
