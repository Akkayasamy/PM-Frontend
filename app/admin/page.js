"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { DashboardShell } from "@/components/dashboard-shell";
import ProtectedRoute from "@/components/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Trash2,
  MoreHorizontal,
  Pencil,
  Eye,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  User,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toastMessages } from "@/lib/utils";
import api from "@/config/api";

export default function AdminPage() {
  const { hasPermission } = useAuth();
  const { getItems, createItem, updateItem, deleteItem } = useData();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const { toast } = useToast();

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  // Role state
  const [currentRole, setCurrentRole] = useState(null);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isViewRoleDialogOpen, setIsViewRoleDialogOpen] = useState(false);

  // User search and filter state
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSortField, setUserSortField] = useState("name");
  const [userSortDirection, setUserSortDirection] = useState("asc");
  const [roleFilter, setRoleFilter] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Role search and filter state
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [roleSortField, setRoleSortField] = useState("name");
  const [roleSortDirection, setRoleSortDirection] = useState("asc");
  const [filteredRoles, setFilteredRoles] = useState([]);

  // Pagination state for users
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const USER_ITEMS_PER_PAGE = 10;

  // Pagination state for roles
  const [roleCurrentPage, setRoleCurrentPage] = useState(1);
  const ROLE_ITEMS_PER_PAGE = 10;

  // All available permissions in the system
  const allPermissions = {
    teams: ["view_team_members", "create_teams", "edit_teams", "delete_teams"],
    projects: [
      "view_projects",
      "create_projects",
      "edit_projects",
      "delete_projects",
    ],
    milestones: [
      "view_milestones",
      "create_milestones",
      "edit_milestones",
      "delete_milestones",
    ],
    tasks: [
      "view_tasks",
      "create_tasks",
      "edit_tasks",
      "delete_tasks",
      "assign_tasks",
      "update_task_status",
    ],
    timesheets: [
      "view_timesheets",
      "create_timesheets",
      "edit_timesheets",
      "delete_timesheets",
    ],
    reports: [
      "access_reports",
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
    ],
    resources: ["view_resources", "assign_resources"],
    issues: [
      "view_issues",
      "create_issues",
      "edit_issues",
      "resolve_issues",
      "update_issue_status",
    ],
    overview: [
      "over_view",
    ],
  };

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
  }, [isSuccess]);

  // Load data on component mount
  useEffect(() => {
    if (!hasPermission("admin")) {
      router.push("/dashboard");
      return;
    }

    // const fetchedUsers = getItems("users");
    // const fetchedRoles = getItems("roles");
    // setUsers(fetchedUsers);
    // setRoles(fetchedRoles);

    const loadResponse = async () => {
      try {
        const response = await api.get("users");
        setUsers(response.data.users);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [getItems, hasPermission, router, isSuccess]);

  // Filter and sort users
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (userSearchTerm) {
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[userSortField];
      const bValue = b[userSortField];

      if (aValue < bValue) return userSortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return userSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(result);
    setUserCurrentPage(1); // Reset to first page when filters change
  }, [users, userSearchTerm, userSortField, userSortDirection, roleFilter]);

  // Filter and sort roles
  useEffect(() => {
    let result = [...roles];

    // Apply search filter
    if (roleSearchTerm) {
      result = result.filter((role) =>
        role.name?.toLowerCase().includes(roleSearchTerm.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[roleSortField];
      const bValue = b[roleSortField];

      if (aValue < bValue) return roleSortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return roleSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredRoles(result);
    setRoleCurrentPage(1); // Reset to first page when filters change
  }, [roles, roleSearchTerm, roleSortField, roleSortDirection]);

  // User sorting
  const handleUserSort = (field) => {
    if (userSortField === field) {
      setUserSortDirection(userSortDirection === "asc" ? "desc" : "asc");
    } else {
      setUserSortField(field);
      setUserSortDirection("asc");
    }
  };

  // Role sorting
  const handleRoleSort = (field) => {
    if (roleSortField === field) {
      setRoleSortDirection(roleSortDirection === "asc" ? "desc" : "asc");
    } else {
      setRoleSortField(field);
      setRoleSortDirection("asc");
    }
  };

  // Clear user filters
  const clearUserFilters = () => {
    setUserSearchTerm("");
    setRoleFilter("all");
  };

  // Clear role filters
  const clearRoleFilters = () => {
    setRoleSearchTerm("");
  };

  // User CRUD operations
  const openEditUserDialog = (user) => {
    // const user = users.find((user) => user.id === id);
    setCurrentUser(user);
    setIsEditUserDialogOpen(true);
  };

  const openViewUserDialog = (user) => {
    //const user = users.find((user) => user.id === id);
    setCurrentUser(user);
    setIsViewUserDialogOpen(true);
  };

  const handleCreateUser = async () => {
    setCurrentUser({
      name: "",
      email: "",
      role: "team_member",
      password: "",
    });
    setIsCreateUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (
      !currentUser.name.trim() ||
      !currentUser.email.trim() ||
      !currentUser.password.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Name, email, and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentUser._id) {
        // Update existing user
        const response = await api.put("user", currentUser);
        setSuccess(response);
        // updateItem("users", currentUser.id, currentUser);
        // setUsers(
        //   users.map((user) => (user.id === currentUser.id ? currentUser : user))
        // );
        toast(toastMessages.update("User", currentUser.name));
      } else {
        const response = await api.post("register", currentUser);
        setSuccess(response);
        toast(toastMessages.create("User", currentUser.name));
        // // Create new user
        // createItem("users", currentUser);
        // // Refresh users from data context
        // setUsers(getItems("users"));
        // toast(toastMessages.create("User", currentUser.name));
      }

      setIsEditUserDialogOpen(false);
      setIsCreateUserDialogOpen(false);
      setCurrentUser(null);
    } catch (error) {
      toast(
        toastMessages.error(
          currentUser._id ? "update" : "create",
          "user",
          error
        )
      );
    }
  };

  const handleUpdateUser = async () => {
    if (!currentUser.name.trim() || !currentUser.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentUser._id) {
        // Update existing user
        const response = await api.put("user", currentUser);
        setSuccess(response);
        // updateItem("users", currentUser.id, currentUser);
        // setUsers(
        //   users.map((user) => (user.id === currentUser.id ? currentUser : user))
        // );
        toast(toastMessages.update("User", currentUser.name));
      }
      setIsEditUserDialogOpen(false);
      setIsCreateUserDialogOpen(false);
      setCurrentUser(null);
    } catch (error) {
      toast(
        toastMessages.error(
          currentUser._id ? "update" : "create",
          "user",
          error
        )
      );
    }
  };

  const handleDeleteUser = async (user) => {
    // const userToDelete = users.find((user) => user.id === id);
    if (
      window.confirm(`Are you sure you want to delete the user "${user.name}"?`)
    ) {
      try {
        // deleteItem("users", id);
        // setUsers(users.filter((user) => user.id !== id));
        const response = await api.delete(`user/${user._id}`);
        setSuccess(response);
        toast(toastMessages.delete("User", user.name));
        setIsEditUserDialogOpen(false);
        setIsViewUserDialogOpen(false);
        setCurrentUser(null);
      } catch (error) {
        toast(toastMessages.error("delete", "user", error));
      }
    }
  };

  // Role CRUD operations
  const openEditRoleDialog = (role) => {
    // const role = roles.find((role) => role.id === id);
    setCurrentRole(role);
    setIsEditRoleDialogOpen(true);
  };

  const openViewRoleDialog = (role) => {
    // const role = roles.find((role) => role.id === id);
    setCurrentRole(role);
    setIsViewRoleDialogOpen(true);
  };

  const handleCreateRole = () => {
    setCurrentRole({
      name: "",
      permissions: [],
      createdAt: new Date().toISOString(),
    });
    setIsCreateRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    console.log(currentRole);
    if (!currentRole.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }
    try {
      if (currentRole._id) {
        // Update existing role
        // updateItem("roles", currentRole.id, currentRole);
        // setRoles(
        //   roles.map((role) => (role.id === currentRole.id ? currentRole : role))
        // );
        const response = await api.put("role", currentRole);
        setSuccess(response);
        toast(toastMessages.update("Role", currentRole.name));
      } else {
        // // Create new role
        // const newRole = {
        //   ...currentRole,
        //   createdAt: new Date().toISOString(),
        // };
        // createItem("roles", newRole);
        // // Refresh roles from data context
        // setRoles(getItems("roles"));
        const response = await api.post("role", currentRole);
        setSuccess(response);
        toast(toastMessages.create("Role", currentRole.name));
      }

      setIsEditRoleDialogOpen(false);
      setIsCreateRoleDialogOpen(false);
      setCurrentRole(null);
    } catch (error) {
      toast(
        toastMessages.error(currentRole.id ? "update" : "create", "role", error)
      );
    }
  };

  const handleDeleteRole = async (role) => {
    // const roleToDelete = roles.find((role) => role.id === id);
    if (
      window.confirm(`Are you sure you want to delete the role "${role.name}"?`)
    ) {
      try {
        // deleteItem("roles", id);
        // setRoles(roles.filter((role) => role.id !== id));
        const response = await api.delete(`role/${role.roleId}`);
        setSuccess(response);
        toast(toastMessages.delete("Role", role.name));
        setIsEditRoleDialogOpen(false);
        setIsViewRoleDialogOpen(false);
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

  const formatRoleName = (role) => {
    if (role === "admin") return "Admin";
    if (role === "project_manager") return "Project Manager";
    if (role === "team_member") return "Team Member";

    if (role && role.startsWith("custom_")) {
      const roleId = role.replace("custom_", "");
      const customRole = roles.find((r) => r.id === Number.parseInt(roleId));
      return customRole ? customRole.name : "Custom Role";
    }

    return role;
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "project_manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "team_member":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        if (role && role.startsWith("custom_")) {
          return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300";
        }
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Count users with a specific role
  const countUsersWithRole = (roleId) => {
    if (roleId === undefined) return 0;

    const roleString = `custom_${roleId}`;
    return users.filter((user) => user.role === roleId).length;
  };

  // Pagination for users
  const userTotalPages = Math.ceil(filteredUsers.length / USER_ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (userCurrentPage - 1) * USER_ITEMS_PER_PAGE,
    userCurrentPage * USER_ITEMS_PER_PAGE
  );

  // Pagination for roles
  const roleTotalPages = Math.ceil(filteredRoles.length / ROLE_ITEMS_PER_PAGE);
  const paginatedRoles = filteredRoles.slice(
    (roleCurrentPage - 1) * ROLE_ITEMS_PER_PAGE,
    roleCurrentPage * ROLE_ITEMS_PER_PAGE
  );

  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Users</h1>
          </div>

          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              {/* <TabsTrigger value="system">System</TabsTrigger> */}
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Users</h2>
                    <p className="text-muted-foreground">
                      Manage system users and their roles
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8 w-full sm:w-[250px]"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateUser}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-8 w-[150px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="project_manager">
                        Project Manager
                      </SelectItem>
                      <SelectItem value="team_member">Team Member</SelectItem>
                      {roles.map((role, i) => (
                        <SelectItem key={i} value={`custom_${role.id}`}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(roleFilter !== "all" || userSearchTerm) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearUserFilters}
                      className="h-8"
                    >
                      <X className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  )}

                  <div className="ml-auto text-sm text-muted-foreground">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                </div>

                <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead
                          className="w-[30%] cursor-pointer"
                          onClick={() => handleUserSort("name")}
                        >
                          <div className="flex items-center">
                            Name
                            {userSortField === "name" ? (
                              userSortDirection === "asc" ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowDown className="ml-2 h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="w-[30%] cursor-pointer"
                          onClick={() => handleUserSort("email")}
                        >
                          <div className="flex items-center">
                            Email
                            {userSortField === "email" ? (
                              userSortDirection === "asc" ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowDown className="ml-2 h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleUserSort("role")}
                        >
                          <div className="flex items-center">
                            Role
                            {userSortField === "role" ? (
                              userSortDirection === "asc" ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowDown className="ml-2 h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <User className="h-12 w-12 text-muted-foreground/50 mb-2" />
                              <p className="text-muted-foreground">
                                No users found.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {user.name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {formatRoleName(user.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => openViewUserDialog(user)}
                                    className="flex items-center"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => openEditUserDialog(user)}
                                    className="flex items-center"
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 flex items-center"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination controls */}
                {userTotalPages > 1 && (
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() =>
                        setUserCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={userCurrentPage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span>
                      Page {userCurrentPage} of {userTotalPages}
                    </span>
                    <Button
                      onClick={() =>
                        setUserCurrentPage((prev) =>
                          Math.min(prev + 1, userTotalPages)
                        )
                      }
                      disabled={userCurrentPage === userTotalPages}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Create User Dialog */}
                <Dialog
                  open={isCreateUserDialogOpen}
                  onOpenChange={setIsCreateUserDialogOpen}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>
                        Add a new user to the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={currentUser?.name || ""}
                          onChange={(e) =>
                            setCurrentUser({
                              ...currentUser,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={currentUser?.email || ""}
                          onChange={(e) =>
                            setCurrentUser({
                              ...currentUser,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={currentUser?.role || "team_member"}
                          onValueChange={(value) =>
                            setCurrentUser({ ...currentUser, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            {/* <SelectItem value="project_manager">
                              Project Manager
                            </SelectItem>
                            <SelectItem value="team_member">
                              Team Member
                            </SelectItem> */}
                            {roles.map((role) => (
                              <SelectItem key={role._id} value={`${role.name}`}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={currentUser?.password || ""}
                          onChange={(e) =>
                            setCurrentUser({
                              ...currentUser,
                              password: e.target.value,
                            })
                          }
                          placeholder="Enter password"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateUserDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveUser}>Create User</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog
                  open={isEditUserDialogOpen}
                  onOpenChange={setIsEditUserDialogOpen}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                      <DialogDescription>
                        Make changes to user details
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                          id="edit-name"
                          value={currentUser?.name || ""}
                          onChange={(e) =>
                            setCurrentUser({
                              ...currentUser,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={currentUser?.email || ""}
                          onChange={(e) =>
                            setCurrentUser({
                              ...currentUser,
                              email: e.target.value,
                            })
                          }
                          disabled
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-role">Role</Label>
                        <Select
                          value={currentUser?.role || "team_member"}
                          onValueChange={(value) =>
                            setCurrentUser({ ...currentUser, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            {/* <SelectItem value="project_manager">
                              Project Manager
                            </SelectItem>
                            <SelectItem value="team_member">
                              Team Member
                            </SelectItem> */}
                            {roles.map((role) => (
                              <SelectItem key={role._id} value={`${role.name}`}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-password">Password</Label>
                        <Input
                          id="edit-password"
                          type="password"
                          value={currentUser?.password || ""}
                          onChange={(e) =>
                            setCurrentUser({
                              ...currentUser,
                              password: e.target.value,
                            })
                          }
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditUserDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateUser}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* View User Dialog */}
                <Dialog
                  open={isViewUserDialogOpen}
                  onOpenChange={setIsViewUserDialogOpen}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>User Details</DialogTitle>
                      <DialogDescription>
                        View user information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-center mb-4">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                          {currentUser?.name?.charAt(0) || "U"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Name
                          </h3>
                          <p className="mt-1 font-medium">
                            {currentUser?.name}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Email
                          </h3>
                          <p className="mt-1">{currentUser?.email}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Role
                        </h3>
                        <div className="mt-1">
                          <Badge
                            className={getRoleBadgeColor(currentUser?.role)}
                          >
                            {formatRoleName(currentUser?.role)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsViewUserDialogOpen(false)}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          setIsViewUserDialogOpen(false);
                          openEditUserDialog(currentUser);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Roles</h2>
                    <p className="text-muted-foreground">
                      Manage roles and permissions
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search roles..."
                        className="pl-8 w-full sm:w-[250px]"
                        value={roleSearchTerm}
                        onChange={(e) => setRoleSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateRole}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Role
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>

                  {roleSearchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRoleFilters}
                      className="h-8"
                    >
                      <X className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  )}

                  <div className="ml-auto text-sm text-muted-foreground">
                    Showing {filteredRoles.length} of {roles.length} roles
                  </div>
                </div>

                <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead
                          className="w-[40%] cursor-pointer"
                          onClick={() => handleRoleSort("name")}
                        >
                          <div className="flex items-center">
                            Role Name
                            {roleSortField === "name" ? (
                              roleSortDirection === "asc" ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowDown className="ml-2 h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleRoleSort("permissions")}
                        >
                          <div className="flex items-center">
                            Permissions
                            {roleSortField === "permissions" ? (
                              roleSortDirection === "asc" ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowDown className="ml-2 h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleRoleSort("createdAt")}
                        >
                          <div className="flex items-center">
                            Users
                            {roleSortField === "createdAt" ? (
                              roleSortDirection === "asc" ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowDown className="ml-2 h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRoles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <Shield className="h-12 w-12 text-muted-foreground/50 mb-2" />
                              <p className="text-muted-foreground">
                                No custom roles found.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRoles.map((role) => (
                          <TableRow key={role.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {role.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {role.permissions?.length > 0 ? (
                                  <>
                                    {role.permissions
                                      .slice(0, 3)
                                      .map((permission) => (
                                        <Badge
                                          key={permission}
                                          variant="outline"
                                          className="capitalize"
                                        >
                                          {permission.replace(/_/g, " ")}
                                        </Badge>
                                      ))}
                                    {role.permissions.length > 3 && (
                                      <Badge variant="outline">
                                        +{role.permissions.length - 3} more
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    No permissions
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {countUsersWithRole(role.name)} users
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => openViewRoleDialog(role)}
                                    className="flex items-center"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => openEditRoleDialog(role)}
                                    className="flex items-center"
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteRole(role)}
                                    className="text-red-600 flex items-center"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination controls */}
                {roleTotalPages > 1 && (
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() =>
                        setRoleCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={roleCurrentPage === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span>
                      Page {roleCurrentPage} of {roleTotalPages}
                    </span>
                    <Button
                      onClick={() =>
                        setRoleCurrentPage((prev) =>
                          Math.min(prev + 1, roleTotalPages)
                        )
                      }
                      disabled={roleCurrentPage === roleTotalPages}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Create Role Dialog */}
                <Dialog
                  open={isCreateRoleDialogOpen}
                  onOpenChange={setIsCreateRoleDialogOpen}
                >
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto scrollbar-thin">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>
                        Add a new role with custom permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                          id="role-name"
                          value={currentRole?.name || ""}
                          onChange={(e) =>
                            setCurrentRole({
                              ...currentRole,
                              name: e.target.value,
                            })
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

                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="h-[250px] rounded-md border p-4 overflow-y-auto scrollbar-thin">
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
                                            currentRole?.permissions || []
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
                        {/* <ScrollArea className="h-[300px] rounded-md border p-4">
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
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={permission}
                                          checked={(
                                            currentRole?.permissions || []
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
                                          className="text-sm font-normal capitalize"
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
                        </ScrollArea> */}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateRoleDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveRole}>Create Role</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Edit Role Dialog */}
                <Dialog
                  open={isEditRoleDialogOpen}
                  onOpenChange={setIsEditRoleDialogOpen}
                >
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Role</DialogTitle>
                      <DialogDescription>
                        Modify role name and permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-role-name">Role Name</Label>
                        <Input
                          id="edit-role-name"
                          value={currentRole?.name || ""}
                          onChange={(e) =>
                            setCurrentRole({
                              ...currentRole,
                              name: e.target.value,
                            })
                          }
                          disabled
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

                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="h-[250px] rounded-md border p-4 overflow-y-auto scrollbar-thin">
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
                                            currentRole?.permissions || []
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
                        {/* <ScrollArea className="h-[300px] rounded-md border p-4">
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
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={`edit-${permission}`}
                                          checked={(
                                            currentRole?.permissions || []
                                          ).includes(permission)}
                                          onCheckedChange={(checked) =>
                                            handlePermissionChange(
                                              permission,
                                              checked
                                            )
                                          }
                                        />
                                        <Label
                                          htmlFor={`edit-${permission}`}
                                          className="text-sm font-normal capitalize"
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
                        </ScrollArea> */}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditRoleDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveRole}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* View Role Dialog */}
                <Dialog
                  open={isViewRoleDialogOpen}
                  onOpenChange={setIsViewRoleDialogOpen}
                >
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Role Details</DialogTitle>
                      <DialogDescription>
                        View role information and permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Role Name
                          </h3>
                          <p className="mt-1 font-medium text-lg">
                            {currentRole?.name}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {countUsersWithRole(currentRole?.roleId)} users
                        </Badge>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Permissions
                        </h3>
                        {currentRole?.permissions?.length > 0 ? (
                          <div className="space-y-4">
                            {Object.entries(allPermissions).map(
                              ([category, permissions]) => {
                                const categoryPermissions = permissions.filter(
                                  (permission) =>
                                    currentRole.permissions.includes(permission)
                                );

                                if (categoryPermissions.length === 0)
                                  return null;

                                return (
                                  <div key={category} className="space-y-2">
                                    <h4 className="text-sm font-medium capitalize">
                                      {category}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {categoryPermissions.map((permission) => (
                                        <Badge
                                          key={permission}
                                          variant="outline"
                                          className="capitalize"
                                        >
                                          {permission.replace(/_/g, " ")}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No permissions assigned to this role.
                          </p>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Created
                        </h3>
                        <p className="mt-1">
                          {currentRole?.createdAt
                            ? new Date(
                              currentRole.createdAt
                            ).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsViewRoleDialogOpen(false)}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          setIsViewRoleDialogOpen(false);
                          openEditRoleDialog(currentRole);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            {/* <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure global system settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">System settings will be available in a future update.</p>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
