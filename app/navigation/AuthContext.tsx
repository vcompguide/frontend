"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  description?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatarUrl?: string, description?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      console.log("User loaded from localStorage:", parsedUser);
    }
    setIsLoading(false);
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
    avatarUrl?: string,
    description?: string
  ) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          avatarUrl: avatarUrl || "",
          description: description || "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      
      // Store token
      setAccessToken(data.access_token);
      localStorage.setItem("access_token", data.access_token);
      
      // Fetch full user details including ID
      try {
        const userResponse = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${data.access_token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          console.error("Failed to fetch user details:", await userResponse.text());
          // Fallback to basic user data
          const userData = { id: "", name, email, avatarUrl, description };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (userError) {
        console.error("Error fetching user details:", userError);
        // Fallback to basic user data
        const userData = { id: "", name, email, avatarUrl, description };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      
      // Store token
      setAccessToken(data.access_token);
      localStorage.setItem("access_token", data.access_token);
      
      // Fetch full user details including ID
      try {
        const userResponse = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${data.access_token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          console.log("User logged in:", userData);
        } else {
          const errorText = await userResponse.text();
          console.error("Failed to fetch user details:", errorText);
          // Fallback to basic user data from email
          const userData = { id: "", name: email.split('@')[0], email };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (userError) {
        console.error("Error fetching user details:", userError);
        // Fallback to basic user data from email
        const userData = { id: "", name: email.split('@')[0], email };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
