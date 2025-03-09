"use client"

import { useState } from "react";
import { useTable } from "@/contexts/TableContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { PlusCircle, RefreshCw, FilePlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TableView() {
  const { currentTable, addColumn, isLoading, updateGoogleSheetId, refreshTableData } = useTable();
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<"text" | "date">("text");
  const [googleSheetId, setGoogleSheetId] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleAddColumn = () => {
    if (!currentTable || !newColumnName.trim()) return;
    
    addColumn(currentTable.id, {
      name: newColumnName,
      type: newColumnType,
    });
    
    // Reset form
    setNewColumnName("");
    setNewColumnType("text");
  };

  const handleConnectGoogleSheet = async () => {
    if (!currentTable || !googleSheetId.trim()) return;
    
    try {
      await updateGoogleSheetId(currentTable.id, googleSheetId);
      setGoogleSheetId("");
    } catch (error) {
      console.error("Error connecting Google Sheet:", error);
    }
  };

  const handleRefreshData = async () => {
    if (!currentTable || !currentTable.googleSheetId) return;
    
    try {
      setRefreshing(true);
      await refreshTableData(currentTable.id);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!currentTable) {
    return (
      <div className="flex flex-col items-center justify-center h-full ">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">No Table Selected</h2>
          <p className="text-muted-foreground mb-6">
            Select a table from the sidebar or create a new one to get started.
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-brand-primary hover:bg-brand-secondary">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Table</DialogTitle>
                <DialogDescription>
                  You'll be redirected to the create table form.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">{currentTable.name}</h1>
          <p className="text-sm text-muted-foreground">
            {currentTable.columns.length} columns, {currentTable.rows?.length || 0} rows
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {
          currentTable.googleSheetId 
          ? (
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Last synced: {currentTable.lastSynced ? new Date(currentTable.lastSynced).toLocaleString() : 'Never'}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshData}
                disabled={refreshing}
              >
                <RefreshCw className={cn(
                  "mr-2 h-4 w-4",
                  refreshing && "animate-spin"
                )} />
                Refresh
              </Button>
            </div>
          ) : (
            //! Connect To google sheets dialog Box
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-slate-100 hover:bg-slate-200">
                  <FilePlus className="mr-2 h-4 w-4" />
                  Connect Google Sheet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Connect Google Sheet</DialogTitle>
                  <DialogDescription>
                    Enter the ID of the Google Sheet you want to connect to this table
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  <Label htmlFor="googleSheetId">Google Sheet ID</Label>
                  <Input
                    id="googleSheetId"
                    value={googleSheetId}
                    onChange={(e) => setGoogleSheetId(e.target.value)}
                    placeholder="Enter Google Sheet ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can find the ID in the URL of your Google Sheet:
                    https://docs.google.com/spreadsheets/d/
                    <span className="font-extrabold text-black">spreadsheetId</span>/edit
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleConnectGoogleSheet}
                    disabled={isLoading || !googleSheetId.trim()}
                    className="bg-(--grad-start) hover:bg-(--grad-start-hard)"
                  >
                    {isLoading ? "Connecting..." : "Connect"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" size="sm" className="bg-(--grad-start) hover:bg-(--grad-start-hard) font-extrabold">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Column
              </Button>
            </PopoverTrigger>
            <ScrollArea className="flex-1">
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Add New Column</h4>
                <div className="space-y-2">
                  <Label htmlFor="columnName">Column Name</Label>
                  <Input
                    id="columnName"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Enter column name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="columnType">Column Type</Label>
                  <Select
                    value={newColumnType}
                    onValueChange={(value) => setNewColumnType(value as "text" | "date")}
                  >
                    <SelectTrigger id="columnType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddColumn}
                  disabled={isLoading || !newColumnName.trim()}
                  className="w-full bg-(--grad-start) hover:bg-(--grad-start-hard) font-extrabold"
                  // className="w-full mt-6  "
                >
                  {isLoading ? "Adding..." : "Add Column"}
                </Button>
              </div>
            </PopoverContent>
            </ScrollArea>
          </Popover>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {/* Table Card */}
        <Card className="">
          <CardContent className="">
            <div className="rounded-md border">
              {/*//! Tables Headings Row */}
              <div className="grid border-b" style={{ 
                gridTemplateColumns: `repeat(${currentTable.columns.length}, minmax(150px, 1fr))` 
              }}>
                {currentTable.columns.map((column) => (
                  <div 
                    key={column.id} 
                    className="flex items-center border-r p-3 font-medium">
                    {column.name}
                    {!column.googleSheetColumn && (
                      <span className="ml-2 rounded bg-brand-accent/30 px-2 py-0.5 text-xs">
                        Dashboard only
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              {currentTable.rows && currentTable.rows.length > 0 ? (
                //! Table Data Row
                <div className="">
                  {currentTable.rows.map((row, rowIndex) => (
                    <div 
                      key={rowIndex}
                      className={`grid ${rowIndex !== currentTable.rows.length - 1 ? 'border-b' : ''}`}
                      style={{ 
                        gridTemplateColumns: `repeat(${currentTable.columns.length}, minmax(150px, 1fr))` 
                      }}
                    >
                      {currentTable.columns.map((column) => (
                        <div key={`${rowIndex}-${column.id}`} className="border-r p-3 truncate">
                          {column.googleSheetColumn ? (
                            column.type === 'date' && row[column.name.toLowerCase()] ? (
                              format(new Date(row[column.name.toLowerCase()]), 'PPP')
                            ) : (
                              row[column.name.toLowerCase()] || '-'
                            )
                          ) : (
                            '-'
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">
                    {currentTable.googleSheetId 
                      ? "No data available in the connected Google Sheet"
                      : "Connect a Google Sheet to display data"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
}

