"use client";

import { useEffect } from "react";
import { TableView } from "@/components/TableView";

export default function Dashboard() {
  // Setting page title
  useEffect(() => {
    document.title = "Dashboard | TableGlow";
    return () => {
      document.title = "TableGlow";
    };
  }, []);

  return <TableView />;
}
