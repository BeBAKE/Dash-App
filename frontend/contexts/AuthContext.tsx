"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_URL } from '@/constants/urls';

import { AxiosResponse } from 'axios';



interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      const tokenData = localStorage.getItem('tokenTimestamp');
      if (!tokenData) return;
      
      const tokenTimestamp = parseInt(tokenData);
      const now = Date.now();
      
      if (now - tokenTimestamp > 60 * 60 * 1000) {
        toast({
          title: "Session expired",
          description: "Please login again.",
          variant: "destructive",
        });
        logout();
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [token, toast]);


  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const res : AxiosResponse<any, any> = await axios({
        url:`${API_URL}/user/login`,
        method:"POST",
        data:{
          email : email,
          password : password
        }
      })
      
      const tokenResponse = res.data.data.token as string
      const userResponse = res.data.data.user 
      
      localStorage.setItem('token', tokenResponse);
      localStorage.setItem('user', JSON.stringify(userResponse));
      localStorage.setItem('tokenTimestamp', Date.now().toString());
      
      setToken(tokenResponse);
      setUser(userResponse);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userResponse.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const res : AxiosResponse<any, any> = await axios({
        url:`${API_URL}/user/signup`,
        method:"POST",
        data:{
          email : email,
          name : name,
          password : password
        }
      })
      
      const tokenResponse = res.data.data.token as string
      const userResponse = res.data.data.user 
      
      localStorage.setItem('token', tokenResponse);
      localStorage.setItem('user', JSON.stringify(userResponse));
      localStorage.setItem('tokenTimestamp', Date.now().toString());
      
      setToken(tokenResponse);
      setUser(userResponse);
      
      toast({
        title: "Signup successful",
        description: `Welcome, ${name}!`,
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimestamp');
    localStorage.removeItem('tables')
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};