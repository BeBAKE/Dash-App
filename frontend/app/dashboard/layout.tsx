"use client";

import { useAuth } from "@/contexts/AuthContext";
import { TableProvider } from "@/contexts/TableContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <TableProvider>
      <div className="flex h-screen w-full">
          <DashboardSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </TableProvider>
  );
}