import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import QueryClientContextProvider from "@/components/QueryClientContextProvider";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";

import "@/app/globals.css";

// const queryClient = new QueryClient();


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dash-App",
  description: "Integrated with google sheets",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* <QueryClientProvider client={queryClient}> */}
        <QueryClientContextProvider>
          <TooltipProvider>
            <AuthProvider>
              {/* <Toaster /> */}
              <Sonner />
              {children}
            </AuthProvider>
          </TooltipProvider>
        </QueryClientContextProvider>
        {/* </QueryClientProvider> */}
      </body>
    </html>
  );
}