"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import api from "@/config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Check if user is logged in from localStorage
      const checkAuth = async () => {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          }
        } catch (error) {
          console.error("Error checking auth:", error);
          localStorage.removeItem("user");
          setUser(null);
        } finally {
          setLoading(false);
        }
        // try {
        //   const response = await api.get("me");
        //   setUser(response.data.user);
        // } catch (err) {
        //   console.log(err);
        // }
      };

      checkAuth();
    }
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("role");
        setRoles(response.data.roles);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  const login = (userData) => {
    try {
      // Store user data in local storage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    try {
      // Clear local storage and state
      localStorage.removeItem("user");
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (userData) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  const hasPermission = (requiredPermission) => {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === "admin") return true;
    // Check for custom role
    // if (user.role && user.role.startsWith("custom_")) {
    if (user.role) {
      // const roleId = user.role.replace("custom_", "");
      const roleName = user.role;
      // Get roles from localStorage directly instead of using useData
      //  const appData = JSON.parse(localStorage.getItem("appData") || "{}");
      //  const roles = appData.roles || [];

      //  const role = roles.find((r) => r.name === Number.parseInt(roleId));
      const role = roles.find((r) => r.name === roleName);
      if (
        role &&
        role.permissions &&
        role.permissions.includes(requiredPermission)
      ) {
        return true;
      }
    }

    // // Project Manager permissions
    // if (user.role === "project_manager") {
    //   const managerPermissions = [
    //     "view_projects",
    //     "create_projects",
    //     "edit_projects",
    //     "view_tasks",
    //     "create_tasks",
    //     "edit_tasks",
    //     "delete_tasks",
    //     "view_team_members",
    //     "assign_tasks",
    //     "view_milestones",
    //     "create_milestones",
    //     "edit_milestones",
    //     "view_resources",
    //     "assign_resources",
    //     "view_issues",
    //     "create_issues",
    //     "edit_issues",
    //     "resolve_issues",
    //     "view_consultants",
    //     "create_consultants",
    //     "edit_consultants",
    //     "create_teams",
    //     "edit_teams",
    //     "view_clients",
    //     "create_clients",
    //     "edit_clients",
    //   ];
    //   return managerPermissions.includes(requiredPermission);
    // }

    // // Team Member permissions
    // if (user.role === "team_member") {
    //   const memberPermissions = [
    //     "view_projects",
    //     "view_tasks",
    //     "update_task_status",
    //     "view_team_members",
    //     "view_milestones",
    //     "view_resources",
    //     "view_issues",
    //     "create_issues",
    //     "update_issue_status",
    //     "view_consultants",
    //     "view_clients",
    //   ];
    //   return memberPermissions.includes(requiredPermission);
    // }

    return false;
  };

  const getUserRole = () => {
    if (!user) return null;

    if (user.role && user.role.startsWith("custom_")) {
      const roleId = user.role.replace("custom_", "");
      // Get roles from localStorage directly instead of using useData
      const appData = JSON.parse(localStorage.getItem("appData") || "{}");
      const roles = appData.roles || [];
      const role = roles.find((r) => r.id === Number.parseInt(roleId));
      return role ? role.name : "Custom Role";
    }

    return user.role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        hasPermission,
        getUserRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
