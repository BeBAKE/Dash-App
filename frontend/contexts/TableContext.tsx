"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '@/constants/urls';

interface Column {
  id: string;
  name: string;
  type: 'text' | 'date';
  googleSheetColumn?: boolean;
}

interface TableData {
  id: string;
  name: string;
  columns: Column[];
  rows: Record<string, any>[];
  googleSheetId?: string;
  lastSynced?: Date;
  etag?: string; // For tracking if content has changed
}

interface TableContextType {
  tables: TableData[];
  currentTable: TableData | null;
  isLoading: boolean;
  createTable: (name: string, columns: Column[]) => void;
  loadTable: (tableId: string) => void;
  addColumn: (tableId: string, column: Omit<Column, 'id'>) => void;
  updateGoogleSheetId: (tableId: string, googleSheetId: string) => Promise<void>;
  refreshTableData: (tableId: string) => Promise<void>;
  toggleRealTimeUpdates: (tableId: string, enabled: boolean) => void;
  isRealTimeEnabled: (tableId: string) => boolean;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

const fetchGoogleSheetData = async (spreadsheetId: string) => {
  try {
    const metadata = await axios({
      method:"POST",
      url : `${API_URL}/sheets/metadata`,
      data : {
        spreadsheetId : spreadsheetId
      },
      headers : {
        Authorization : `Bearer ${localStorage.getItem("token")}`
      }
    })

    const etag = metadata.data.data.etag;

    const response = await axios({
      method:"POST",
      url : `${API_URL}/sheets/sheetdata`,
      data : {
        spreadsheetId : spreadsheetId
      },
      headers : {
        Authorization : `Bearer ${localStorage.getItem("token")}`
      }
    })

    const data = response.data.data
    
    if (!data.values || data.values.length < 2) {
      throw new Error("No data found in the Google Sheet or invalid format");
    }

    const headers = data.values[0].map((header: string) => header.toLowerCase());
    
    const rows = data.values.slice(1).map((row: any[]) => {
      const rowData: Record<string, any> = {};
      
      headers.forEach((header: string, index: number) => {
        rowData[header] = row[index] || '';
      });
      
      return rowData;
    });

    return { headers, rows, etag };
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    throw error;
  }
};

export const TableProvider = ({ children }: { children: ReactNode }) => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [currentTable, setCurrentTable] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState<Record<string, boolean>>({});
  const pollingIntervalsRef = useRef<Record<string, number>>({});
  const pollingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const { toast } = useToast();

  useEffect(() => {
    const storedTables = localStorage.getItem('tables');
    if (storedTables) {
      try {
        setTables(JSON.parse(storedTables));
      } catch (error) {
        console.error("Error parsing stored tables:", error);
        localStorage.removeItem('tables');
      }
    }
    
    const storedRealTimeUpdates = localStorage.getItem('realTimeUpdates');
    if (storedRealTimeUpdates) {
      try {
        const parsedUpdates = JSON.parse(storedRealTimeUpdates);
        setRealTimeUpdates(parsedUpdates);
        
        Object.entries(parsedUpdates).forEach(([tableId, enabled]) => {
          if (enabled) {
            startPollingForTable(tableId);
          }
        });
      } catch (error) {
        console.error("Error parsing real-time update preferences:", error);
      }
    }
    
    return () => {
      Object.values(pollingTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  useEffect(() => {
    if (tables.length > 0) {
      localStorage.setItem('tables', JSON.stringify(tables));
    }
  }, [tables]);
  
  useEffect(() => {
    localStorage.setItem('realTimeUpdates', JSON.stringify(realTimeUpdates));
  }, [realTimeUpdates]);

  const startPollingForTable = (tableId: string) => {
    if (!pollingIntervalsRef.current[tableId]) {
      pollingIntervalsRef.current[tableId] = 5000;
    }
    
    const pollForUpdates = async () => {
      try {
        const table = tables.find(t => t.id === tableId);
        if (!table || !table.googleSheetId) {
          return;
        }
        
        if (!realTimeUpdates[tableId]) {
          return;
        }
        
        const { headers, rows, etag } = await fetchGoogleSheetData(table.googleSheetId);
        
        if (etag !== table.etag) {
          const googleSheetColumns = table.columns
            .filter(col => col.googleSheetColumn)
            .map(col => col.name.toLowerCase());
          
          const headerMap: Record<string, boolean> = {};
          googleSheetColumns.forEach(col => {
            headerMap[col] = true;
          });
          
          const mappedRows = rows.map((row:any) => {
            const newRow: Record<string, any> = {};
            
            Object.entries(row).forEach(([key, value]) => {
              if (headerMap[key.toLowerCase()]) {
                newRow[key.toLowerCase()] = value;
              }
            });
            
            return newRow;
          });
          
          setTables(prev => prev.map(t => {
            if (t.id === tableId) {
              return {
                ...t,
                rows: mappedRows,
                lastSynced: new Date(),
                etag
              };
            }
            return t;
          }));
          
          if (currentTable && currentTable.id === tableId) {
            setCurrentTable(prev => {
              if (prev) {
                return {
                  ...prev,
                  rows: mappedRows,
                  lastSynced: new Date(),
                  etag
                };
              }
              return prev;
            });
          }
          
          pollingIntervalsRef.current[tableId] = 5000;
          
          console.log(`Data updated for table ${tableId}`);
        } else {
          const currentInterval = pollingIntervalsRef.current[tableId];
          if (currentInterval < 60000) {
            pollingIntervalsRef.current[tableId] = Math.min(currentInterval * 1.5, 60000);
          }
        }
      } catch (error) {
        console.error(`Error polling for updates on table ${tableId}:`, error);
        pollingIntervalsRef.current[tableId] = Math.min(pollingIntervalsRef.current[tableId] * 2, 120000);
      }

      const nextInterval = pollingIntervalsRef.current[tableId];
      pollingTimeoutsRef.current[tableId] = setTimeout(pollForUpdates, nextInterval);
    };
    
    pollForUpdates();
  };

  const stopPollingForTable = (tableId: string) => {
    if (pollingTimeoutsRef.current[tableId]) {
      clearTimeout(pollingTimeoutsRef.current[tableId]);
      delete pollingTimeoutsRef.current[tableId];
    }
  };

  const toggleRealTimeUpdates = (tableId: string, enabled: boolean) => {
    setRealTimeUpdates(prev => ({
      ...prev,
      [tableId]: enabled
    }));
    
    if (enabled) {
      startPollingForTable(tableId);
      toast({
        title: "Real-time updates enabled",
        description: "Your table will now update automatically when the Google Sheet changes.",
      });
    } else {
      stopPollingForTable(tableId);
      toast({
        title: "Real-time updates disabled",
        description: "Your table will no longer update automatically.",
      });
    }
  };
  
  const isRealTimeEnabled = (tableId: string) => {
    return !!realTimeUpdates[tableId];
  };

  const createTable = (name: string, columns: Column[]) => {
    try {
      setIsLoading(true);
      
      const columnsWithIds = columns.map(column => ({
        ...column,
        id: column.id || crypto.randomUUID(),
        googleSheetColumn: true
      }));
      
      const newTable: TableData = {
        id: crypto.randomUUID(),
        name,
        columns: columnsWithIds,
        rows: [],
      };
      
      setTables(prev => [...prev, newTable]);
      setCurrentTable(newTable);
      
      toast({
        title: "Table created",
        description: `"${name}" has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error creating table",
        description: "There was an error creating your table.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTable = (tableId: string) => {
    try {
      setIsLoading(true);
      const table = tables.find(t => t.id === tableId);
      if (!table) {
        throw new Error("Table not found");
      }
      setCurrentTable(table);
      
      if (realTimeUpdates[tableId]) {
        pollingIntervalsRef.current[tableId] = 5000;
      }
    } catch (error) {
      toast({
        title: "Error loading table",
        description: "The requested table could not be loaded.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addColumn = (tableId: string, column: Omit<Column, 'id'>) => {
    try {
      setIsLoading(true);
      
      const newColumn: Column = {
        ...column,
        id: crypto.randomUUID(),
        googleSheetColumn: false,
      };
      
      setTables(prev => prev.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            columns: [...table.columns, newColumn],
          };
        }
        return table;
      }));
      
      if (currentTable && currentTable.id === tableId) {
        setCurrentTable({
          ...currentTable,
          columns: [...currentTable.columns, newColumn],
        });
      }
      
      toast({
        title: "Column added",
        description: `"${column.name}" has been added to your table.`,
      });
    } catch (error) {
      toast({
        title: "Error adding column",
        description: "There was an error adding the column.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoogleSheetId = async (tableId: string, googleSheetId: string) => {
    try {
      setIsLoading(true);
      
      const tableIndex = tables.findIndex(t => t.id === tableId);
      if (tableIndex === -1) {
        throw new Error("Table not found");
      }
      
      const { headers, rows, etag } = await fetchGoogleSheetData(googleSheetId);
      
      const googleSheetColumns = tables[tableIndex].columns
        .filter(col => col.googleSheetColumn)
        .map(col => col.name.toLowerCase());
      
      const headerMap: Record<string, boolean> = {};
      googleSheetColumns.forEach(col => {
        headerMap[col] = true;
      });
      
      const mappedRows = rows.map((row:any) => {
        const newRow: Record<string, any> = {};
        
        Object.entries(row).forEach(([key, value]) => {
          if (headerMap[key.toLowerCase()]) {
            newRow[key.toLowerCase()] = value;
          }
        });
        
        return newRow;
      });
      
      const updatedTables = [...tables];
      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        googleSheetId,
        rows: mappedRows,
        lastSynced: new Date(),
        etag,
      };
      
      setTables(updatedTables);
      
      if (currentTable && currentTable.id === tableId) {
        setCurrentTable(updatedTables[tableIndex]);
      }
      
      toast({
        title: "Google Sheet connected",
        description: "Your table is now connected to Google Sheets.",
      });
    } catch (error) {
      console.error("Error connecting to Google Sheet:", error);
      toast({
        title: "Error connecting to Google Sheet",
        description: "There was an error connecting to your Google Sheet.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTableData = async (tableId: string) => {
    try {
      setIsLoading(true);
      
      const tableIndex = tables.findIndex(t => t.id === tableId);
      if (tableIndex === -1) {
        throw new Error("Table not found");
      }
      
      const table = tables[tableIndex];
      
      if (!table.googleSheetId) {
        throw new Error("Table is not connected to Google Sheets");
      }
      
      const { headers, rows, etag } = await fetchGoogleSheetData(table.googleSheetId);
      
      const googleSheetColumns = table.columns
        .filter(col => col.googleSheetColumn)
        .map(col => col.name.toLowerCase());
      
      const headerMap: Record<string, boolean> = {};
      googleSheetColumns.forEach(col => {
        headerMap[col] = true;
      });
      
      const mappedRows = rows.map((row:any) => {
        const newRow: Record<string, any> = {};
        
        Object.entries(row).forEach(([key, value]) => {
          if (headerMap[key.toLowerCase()]) {
            newRow[key.toLowerCase()] = value;
          }
        });
        
        return newRow;
      });
      
      const updatedTables = [...tables];
      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        rows: mappedRows,
        lastSynced: new Date(),
        etag,
      };
      
      setTables(updatedTables);
      
      if (currentTable && currentTable.id === tableId) {
        setCurrentTable(updatedTables[tableIndex]);
      }
      
      toast({
        title: "Data refreshed",
        description: "Your table data has been updated from Google Sheets.",
      });
      
      if (realTimeUpdates[tableId]) {
        pollingIntervalsRef.current[tableId] = 5000;
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error refreshing data",
        description: "There was an error refreshing your table data.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TableContext.Provider
      value={{
        tables,
        currentTable,
        isLoading,
        createTable,
        loadTable,
        addColumn,
        updateGoogleSheetId,
        refreshTableData,
        toggleRealTimeUpdates,
        isRealTimeEnabled,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};
