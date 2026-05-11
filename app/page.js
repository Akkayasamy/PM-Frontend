"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useApi } from "@/context/api-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import api from "@/config/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  //const api = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Make a real API call to authenticate
      const response = await api.post("/login", { email, password });

      // If we get here, authentication was successful
      // Pass the user data to the auth context
      localStorage.setItem("token", response?.data.token);
      login(response?.data.user);
    } catch (error) {
      // For demo purposes, let's still allow login with hardcoded credentials
      // This is just a fallback in case the API is not available
      if (email === "admin@example.com" && password === "admin123") {
        login({
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        });
        return;
      } else if (email === "pm@example.com" && password === "manager123") {
        login({
          id: 2,
          name: "Project Manager",
          email: "pm@example.com",
          role: "project_manager",
        });
        return;
      } else if (email === "team@example.com" && password === "team123") {
        login({
          id: 3,
          name: "Team Member",
          email: "team@example.com",
          role: "team_member",
        });
        return;
      }

      setError(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Project Management System
          </CardTitle>
          <CardDescription>Enter your credentials to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            <p>Demo Accounts:</p>
            <p>Admin: admin@example.com / admin123</p>
            <p>Project Manager: pm@example.com / manager123</p>
            <p>Team Member: team@example.com / team123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
