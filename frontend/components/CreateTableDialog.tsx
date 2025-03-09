"use client"

import { useState } from "react";
import { useTable } from "@/contexts/TableContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

interface ColumnInput {
  id: string;
  name: string;
  type: "text" | "date";
}

export function CreateTableDialog() {
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState<ColumnInput[]>([
    { id: crypto.randomUUID(), name: "", type: "text" }
  ]);
  const { createTable, isLoading } = useTable();

  const addColumn = () => {
    setColumns([...columns, { id: crypto.randomUUID(), name: "", type: "text" }]);
  };

  const removeColumn = (id: string) => {
    if (columns.length === 1) return;
    setColumns(columns.filter(col => col.id !== id));
  };

  const updateColumn = (id: string, field: "name" | "type", value: string) => {
    setColumns(
      columns.map(col => 
        col.id === id 
          ? { ...col, [field]: value } 
          : col
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableName.trim()) return;
    
    const validColumns = columns.filter(col => col.name.trim());
    if (validColumns.length === 0) return;
    
    createTable(tableName, validColumns);
  };

  return (
    <DialogContent className="sm:max-w-md h-[500px] overflow-x-auto">
      <DialogHeader>
        <DialogTitle>Create New Table</DialogTitle>
        <DialogDescription>
          Create a new table to connect with Google Sheets
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-2">
          <Label htmlFor="tableName">Table Name</Label>
          <Input
            id="tableName"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Columns</Label>
            <Button type="submit" disabled={isLoading} className="bg-(--grad-start) hover:bg-(--grad-start-hard) font-extrabold">
              {isLoading ? "Creating..." : "Create Table"}
            </Button>
            {/* <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addColumn}
              className="h-8 px-2 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Column
            </Button> */}
          </div>
          
          {columns.map((column, index) => (
            <div key={column.id} className="grid grid-cols-[1fr,auto,auto] gap-2 items-center">
              <Input
                value={column.name}
                onChange={(e) => updateColumn(column.id, "name", e.target.value)}
                placeholder={`Column ${index + 1} name`}
                required
              />
              
              <Select
                value={column.type}
                onValueChange={(value) => updateColumn(column.id, "type", value as "text" | "date")}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeColumn(column.id)}
                disabled={columns.length === 1}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addColumn}
            className="h-8 px-2 text-xs"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Column
          </Button>
          {/* <Button type="submit" disabled={isLoading} className="bg-(--grad-start) hover:bg-(--grad-start-hard) font-extrabold">
            {isLoading ? "Creating..." : "Create Table"}
          </Button> */}
        </DialogFooter>
      </form>
    </DialogContent>
  );
}