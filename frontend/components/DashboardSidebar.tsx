"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTable } from "@/contexts/TableContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut, Table as TableIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateTableDialog } from "./CreateTableDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "./ui/card";
import { useState } from "react";

export function DashboardSidebar() {
  const { logout, user } = useAuth();
  const { tables, loadTable, currentTable } = useTable();
  const [ isNavOpen, setIsNavOpen ] = useState(false)
  return (
    <Card >
    <div className="h-screen w-64 flex flex-col border-r bg-(--grad-start-soft)/70">
      <div className="p-4 border-b-1 border-b-gray-400">
        <h1 className="text-xl font-bold text-(--grad-start-hard)">Dash-App</h1>
      </div>
      
      <div className="p-4 border-b-1 border-b-gray-400">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your Tables</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <PlusCircle className="h-5 w-5 text-brand-secondary" />
              </Button>
            </DialogTrigger>
            <CreateTableDialog />
          </Dialog>
        </div>
      </div>
      
      <ScrollArea className="flex-1 py-2 border-b-1 border-b-gray-400">
        {
          tables.length === 0 
          ? 
            (<div className="px-4 py-2 text-sm text-muted-foreground">
              No tables yet. Create your first table!
            </div> )
          : 
            (tables.map((table) => (
              <Button
                key={table.id}
                variant="ghost"
                className={`w-full hover:bg-none justify-start px-14 py-2 text-left ${
                  currentTable?.id === table.id ? "bg-(--grad-start)" : ""
                }`}
                onClick={() => loadTable(table.id)}
              >
                <TableIcon className="mr-2 h-4 w-4" />
                {table.name}
              </Button>
            )))
        }
      </ScrollArea>
      
      {/* Footer Area */}
      <div className="p-4 border-t mt-auto">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-(--grad-start-hard) flex items-center justify-center text-white">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
    </Card>
  );
}