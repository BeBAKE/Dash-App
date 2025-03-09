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

export default function Signup() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-(--grad-start) to-(--grad-end) p-4">
      <Card className="w-full max-w-md shadow-lg p-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl md:text-4xl font-bold mb-2 text-center">Dash-App</CardTitle>
          <CardDescription className="text-neutral-500 md:text-base text-sm text-center">Enter your information to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-md bg-red-50 text-red-500">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-sm md:text-base">Full Name</Label>
              <Input 
                className="border-2 py-2.5 px-2.5 rounded-xl mb-2.5 outline-none text-sm w-full"
                id="name" 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-sm md:text-base">Email</Label>
              <Input 
                id="email" 
                className="border-2 py-2.5 px-2.5 rounded-xl mb-2.5 outline-none text-sm w-full"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-sm md:text-base">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  className="border-2 py-2.5 px-2.5 rounded-xl mb-2.5 outline-none text-sm w-full"
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
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full mt-6 bg-(--grad-start) hover:bg-(--grad-start-hard) font-extrabold"
              disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm mt-3">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}