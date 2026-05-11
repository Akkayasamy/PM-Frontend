"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/dashboard-shell";
import ProtectedRoute from "@/components/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Save, Trash2 } from "lucide-react";

// Add this import at the top with other imports
import { useToast } from "@/hooks/use-toast";
import { toastMessages } from "@/lib/utils";

export default function RolesPage() {
  const { getItems, createItem, updateItem, deleteItem } = useData();
  const { hasPermission } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Inside the RolesPage component, add this line near the top
  const { toast } = useToast();

  // All available permissions in the system
  const allPermissions = {
    projects: [
      "view_projects",
      "create_projects",
      "edit_projects",
      "delete_projects",
    ],
    tasks: [
      "view_tasks",
      "create_tasks",
      "edit_tasks",
      "delete_tasks",
      "assign_tasks",
      "update_task_status",
    ],
    consultants: [
      "view_consultants",
      "create_consultants",
      "edit_consultants",
      "delete_consultants",
    ],
    clients: [
      "view_clients",
      "create_clients",
      "edit_clients",
      "delete_clients",
    ], // Added client permissions
    teams: ["view_team_members", "create_teams", "edit_teams", "delete_teams"],
    resources: ["view_resources", "assign_resources"],
    issues: [
      "view_issues",
      "create_issues",
      "edit_issues",
      "resolve_issues",
      "update_issue_status",
    ],
    milestones: [
      "view_milestones",
      "create_milestones",
      "edit_milestones",
      "delete_milestones",
    ],
  };

  // Load roles on component mount
  useEffect(() => {
    if (!hasPermission("admin")) {
      router.push("/dashboard");
      return;
    }

    const fetchedRoles = getItems("roles");
    setRoles(fetchedRoles);
  }, [getItems, hasPermission, router]);

  const handleSelectRole = (role) => {
    setCurrentRole(role);
    setIsEditing(true);
  };

  const handleCreateRole = () => {
    setCurrentRole({
      name: "",
      permissions: [],
      createdAt: new Date().toISOString(),
    });
    setIsEditing(true);
  };

  // Update handleSaveRole function
  const handleSaveRole = () => {
    if (!currentRole.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentRole.id) {
        // Update existing role
        updateItem("roles", currentRole.id, currentRole);
        setRoles(
          roles.map((role) => (role.id === currentRole.id ? currentRole : role))
        );
        toast(toastMessages.update("Role", currentRole.name));
      } else {
        // Create new role
        const newRole = {
          ...currentRole,
          createdAt: new Date().toISOString(),
        };
        createItem("roles", newRole);
        // Refresh roles from data context
        setRoles(getItems("roles"));
        toast(toastMessages.create("Role", currentRole.name));
      }

      setIsEditing(false);
      setCurrentRole(null);
    } catch (error) {
      toast(
        toastMessages.error(currentRole.id ? "update" : "create", "role", error)
      );
    }
  };

  // Update handleDeleteRole function
  const handleDeleteRole = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the role "${currentRole.name}"?`
      )
    ) {
      try {
        deleteItem("roles", currentRole.id);
        setRoles(roles.filter((role) => role.id !== currentRole.id));
        toast(toastMessages.delete("Role", currentRole.name));
        setIsEditing(false);
        setCurrentRole(null);
      } catch (error) {
        toast(toastMessages.error("delete", "role", error));
      }
    }
  };

  const handlePermissionChange = (permission, checked) => {
    if (checked) {
      setCurrentRole({
        ...currentRole,
        permissions: [...(currentRole.permissions || []), permission],
      });
    } else {
      setCurrentRole({
        ...currentRole,
        permissions: (currentRole.permissions || []).filter(
          (p) => p !== permission
        ),
      });
    }
  };

  const handleApplyTemplate = (template) => {
    let templatePermissions = [];

    switch (template) {
      case "viewer":
        templatePermissions = [
          "view_projects",
          "view_tasks",
          "view_team_members",
          "view_consultants",
          "view_clients",
          "view_resources",
          "view_issues",
          "view_milestones",
        ];
        break;
      case "contributor":
        templatePermissions = [
          "view_projects",
          "view_tasks",
          "update_task_status",
          "view_team_members",
          "view_consultants",
          "view_clients",
          "view_resources",
          "view_issues",
          "create_issues",
          "update_issue_status",
          "view_milestones",
        ];
        break;
      case "manager":
        templatePermissions = [
          "view_projects",
          "create_projects",
          "edit_projects",
          "view_tasks",
          "create_tasks",
          "edit_tasks",
          "assign_tasks",
          "view_team_members",
          "create_teams",
          "edit_teams",
          "view_consultants",
          "create_consultants",
          "edit_consultants",
          "view_clients",
          "create_clients",
          "edit_clients",
          "view_resources",
          "assign_resources",
          "view_issues",
          "create_issues",
          "edit_issues",
          "resolve_issues",
          "view_milestones",
          "create_milestones",
          "edit_milestones",
        ];
        break;
      default:
        break;
    }

    setCurrentRole({
      ...currentRole,
      permissions: templatePermissions,
    });
  };

  return (
    <ProtectedRoute>
      <DashboardShell>
        <h1 className="text-3xl font-bold mb-6">Role Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={handleCreateRole}
                  className="w-full"
                  variant="outline"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Role
                </Button>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">System Roles</h3>
                  <div className="grid gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start font-normal h-9 px-3 text-muted-foreground"
                      disabled
                    >
                      Admin
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal h-9 px-3 text-muted-foreground"
                      disabled
                    >
                      Project Manager
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal h-9 px-3 text-muted-foreground"
                      disabled
                    >
                      Team Member
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Custom Roles</h3>
                  <div className="grid gap-2">
                    {roles.map((role) => (
                      <Button
                        key={role.id}
                        variant={
                          currentRole?.id === role.id ? "secondary" : "ghost"
                        }
                        className="justify-start font-normal h-9"
                        onClick={() => handleSelectRole(role)}
                      >
                        {role.name}
                      </Button>
                    ))}
                    {roles.length === 0 && (
                      <p className="text-sm text-muted-foreground px-3 py-2">
                        No custom roles created yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Editor */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {isEditing
                  ? currentRole?.id
                    ? `Edit Role: ${currentRole.name}`
                    : "Create New Role"
                  : "Role Details"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Configure role name and permissions"
                  : "Select a role to view or edit its details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      value={currentRole.name}
                      onChange={(e) =>
                        setCurrentRole({ ...currentRole, name: e.target.value })
                      }
                      placeholder="Enter role name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Templates</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyTemplate("viewer")}
                      >
                        Viewer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyTemplate("contributor")}
                      >
                        Contributor
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyTemplate("manager")}
                      >
                        Manager
                      </Button>
                    </div>
                  </div>

                  <div className="permissions">
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="h-[400px] rounded-md border p-4 overflow-y-auto">
                        <div className="space-y-6">
                          {Object.entries(allPermissions).map(
                            ([category, permissions]) => (
                              <div key={category} className="space-y-2">
                                <h3 className="text-sm font-medium capitalize">
                                  {category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {permissions.map((permission) => (
                                    <div
                                      key={permission}
                                      className="flex items-center space-x-2 select-none"
                                    >
                                      <Checkbox
                                        id={permission}
                                        checked={(
                                          currentRole.permissions || []
                                        ).includes(permission)}
                                        onCheckedChange={(checked) =>
                                          handlePermissionChange(
                                            permission,
                                            checked
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={permission}
                                        className="text-sm font-normal capitalize select-none cursor-pointer"
                                        style={{
                                          WebkitTapHighlightColor:
                                            "transparent",
                                        }}
                                      >
                                        {permission.replace(/_/g, " ")}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                                <Separator className="my-2" />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteRole}
                      disabled={!currentRole.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Role
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setCurrentRole(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveRole}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Role
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  Select a role to view or edit, or create a new role
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
