"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };
// linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(237,66,100,1) 0%, rgba(255,237,188,1) 100%)"
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-r from-(--grad-start) to-(--grad-end) ">
      <Card className="w-full max-w-md shadow-lg p-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl md:text-4xl font-bold mb-2 text-center">Dash-App</CardTitle>
          <CardDescription className="text-center text-neutral-500 md:text-base text-sm">Enter your credentials to sign in to your account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-md bg-red-50 text-red-500">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-sm md:text-base">Email</Label>
              <Input 
                className="border-2 py-2.5 px-2.5 rounded-xl mb-2.5 outline-none text-sm w-full"
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-sm md:text-base">Password</Label>
              </div>
              <div className="relative">
                <Input 
                  className="border-2 py-2.5 px-2.5 rounded-xl mb-2.5 outline-none text-sm w-full"
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}>
                  {
                    showPassword 
                    ? (<EyeOff className="h-4 w-4 text-muted-foreground" />)  
                    : (<Eye className="h-4 w-4 text-muted-foreground" />)
                  }
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              // variant={"outline"}
              type="submit" 
              className="w-full mt-6 bg-(--grad-start) hover:bg-(--grad-start-hard) font-extrabold"
              disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center text-sm mt-3">
              Do not have an account?{" "}
              <Link 
                href="/signup" 
                className="text-brand-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}