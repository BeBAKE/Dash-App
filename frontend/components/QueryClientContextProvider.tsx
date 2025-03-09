"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export type ChildType = { children: ReactNode }

export default function QueryClientContextProvider( { children }: ChildType ) {

  return <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>;
}