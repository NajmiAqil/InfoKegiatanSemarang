
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Navbar = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">InfoKegiatanSemarang (Atasan)</h1>
        <div>
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Button onClick={onLogout}>Logout</Button>
        </div>
      </div>
    </header>
  );
};

export default function AtasanPage() {
  const router = useRouter();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
    if (role !== "atasan") {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    setUserRole(null);
    router.push("/");
  };

  if (!userRole) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onLogout={handleLogout} />
      <main className="flex-1 flex items-center justify-center">
        <h2 className="text-3xl font-bold">Welcome, Atasan!</h2>
      </main>
    </div>
  );
}
