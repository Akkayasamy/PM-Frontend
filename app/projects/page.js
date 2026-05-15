"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { DashboardShell } from "@/components/dashboard-shell";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Briefcase,
  Eye,
  Filter,
  X,
  Mail,
  TableIcon,
  Kanban,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Add this import at the top with other imports
import { useToast } from "@/hooks/use-toast";
import { toastMessages } from "@/lib/utils";
import api from "@/config/api";

const ITEMS_PER_PAGE = 10; // Number of items per page

export default function ProjectsPage() {
  const { user, hasPermission } = useAuth();
  const { getItems, createItem, updateItem, deleteItem, getItemById } =
    useData();

  // View state
  const [currentView, setCurrentView] = useState("table");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    active: true,
    budget: "",
    budgetFunctionalHours: "",
    budgetTechnicalHours: "",
    startDate: "",
    endDate: "",
    isBillable: true,
    clientId: "",
    clientName: "",
    clientProjectManager: "",
    clientPMEmail: "",
    clientSPOC1: "",
    clientSPOC1Email: "",
    clientSPOC2: "",
    clientSPOC2Email: "",
    projectGroup: "",
    projectType: "",
    description: "",
    status: "not_started",
    managerId: "",
    actualDate: "",
    teamleadId: "",
    resources: [],
  });


  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeFilter, setActiveFilter] = useState("all"); // "all", "active", "inactive"
  const [billableFilter, setBillableFilter] = useState("all"); // "all", "billable", "non-billable"
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [backendProjectTypes, setBackendProjectTypes] = useState([]); // New state for backend types
  const [teamMembers, setTeamMembers] = useState(); // New state for team-specific members

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Kanban columns configuration
  const kanbanColumns = [
    {
      id: "not_started",
      title: "Not Started",
      color: "bg-gray-50 border-gray-200",
    },
    { id: "planning", title: "Planning", color: "bg-blue-50 border-blue-200" },
    {
      id: "in_progress",
      title: "In Progress",
      color: "bg-yellow-50 border-yellow-200",
    },
    {
      id: "on_hold",
      title: "On Hold",
      color: "bg-orange-50 border-orange-200",
    },
    {
      id: "completed",
      title: "Completed",
      color: "bg-green-50 border-green-200",
    },
    { id: "cancelled", title: "Cancelled", color: "bg-red-50 border-red-200" },
  ];

  useEffect(() => {
    const fetchProjectTypes = async () => {
      try {
        const response = await api.get("projecttype");
        // Ensure we handle the structure correctly (expecting an array)
        setBackendProjectTypes(response.data.projectTypes || response.data || []);
      } catch (err) {
        console.error("Error fetching project types:", err);
      }
    };
    fetchProjectTypes();
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("users");
        setUsers(response.data.users);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  const projectManagers = users.filter((u) => u.role === "project_manager");
  const teamLeads = users.filter((u) => u.role === "team_leader");

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!formData.teamleadId) {
        setTeamMembers();
        return;
      }
      try {

        const response = await api.get(`/user/team/${formData.teamleadId}`);
        setTeamMembers(response?.data?.teams[0] || {});
      } catch (err) {
        console.error("Error fetching team members:", err);
        setTeamMembers([]);
      }
    };
    fetchTeamMembers();
  }, [formData.teamleadId]);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("task");
        setTasks(response.data.tasks);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [isSuccess]);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("project");
        setProjects(response.data.project);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [isSuccess]);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("client");
        setClients(response.data.client);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  // Filter and sort projects
  useEffect(() => {
    let result = [...projects];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.projectId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.clientName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active filter
    if (activeFilter !== "all") {
      result = result.filter((project) =>
        activeFilter === "active" ? project.active : !project.active
      );
    }

    // Apply billable filter
    if (billableFilter !== "all") {
      result = result.filter((project) =>
        billableFilter === "billable" ? project.isBillable : !project.isBillable
      );
    }

    // Apply project type filter
    if (projectTypeFilter !== "all") {
      result = result.filter(
        (project) => project.projectType?._id === projectTypeFilter
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special cases
      if (sortField === "managerId") {
        aValue = getItemById("users", Number.parseInt(a.managerId))?.name || "";
        bValue = getItemById("users", Number.parseInt(b.managerId))?.name || "";
      }

      // Handle numeric
      if (
        sortField === "budget" ||
        sortField === "budgetFunctionalHours" ||
        sortField === "budgetTechnicalHours"
      ) {
        aValue = Number.parseFloat(aValue) || 0;
        bValue = Number.parseFloat(bValue) || 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProjects(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    projects,
    searchTerm,
    sortField,
    sortDirection,
    activeFilter,
    billableFilter,
    projectTypeFilter,
    getItemById,
  ]);

  // Group projects by status for kanban view
  const kanbanProjects = kanbanColumns.reduce((acc, column) => {
    acc[column.id] = filteredProjects.filter(
      (project) => project.status === column.id
    );
    return acc;
  }, {});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (clientId) => {
    if (clientId === "none") {
      setFormData((prev) => ({
        ...prev,
        clientId: "",
        clientName: "",
      }));
      return;
    }

    const selectedClient = clients.find(
      (client) => client.clientId === clientId
    );
    if (selectedClient) {
      setFormData((prev) => ({
        ...prev,
        clientId: clientId,
        clientName: selectedClient.name || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        clientId: "",
        clientName: "",
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: "",
      name: "",
      active: true,
      budget: "",
      budgetFunctionalHours: "",
      budgetTechnicalHours: "",
      startDate: "",
      endDate: "",
      isBillable: true,
      clientId: "",
      clientName: "",
      clientProjectManager: "",
      clientPMEmail: "",
      clientSPOC1: "",
      clientSPOC1Email: "",
      clientSPOC2: "",
      clientSPOC2Email: "",
      projectGroup: "",
      projectType: "",
      description: "",
      status: "planning",
      managerId: "",
      actualDate: "",
      teamleadId: "",
      resources: [],
    });
    setCurrentProject(null);
  };

  // Inside the ProjectsPage component, add this line near the top
  const { toast } = useToast();

  // Update handleCreateProject function
  const handleCreateProject = async () => {
    try {
      const response = await api.post("project", formData);
      setSuccess(response);

      toast(toastMessages.create("Project", formData.name));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("create", "project", error));
    }
  };

  // Update handleEditProject function
  const handleEditProject = async () => {
    try {
      const response = await api.put("project", formData);
      setSuccess(response);
      toast(toastMessages.update("Project", formData.name));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("update", "project", error));
    }
  };

  // Update handleDeleteProject function
  const handleDeleteProject = async (project) => {
    try {
      const response = await api.delete(`project/${project.projectId}`);
      setSuccess(response);
      toast(toastMessages.delete("Project", project.name));
    } catch (error) {
      toast(toastMessages.error("delete", "project", error));
    }
  };

  // Handle status updates for kanban
  const handleStatusChange = async (project, newStatus) => {
    try {
      const response = await api.put("project", {
        status: newStatus,
        projectId: project.projectId,
      });
      setSuccess(response);
      toast({
        title: "Project status updated",
        description: `Project status changed to ${newStatus.replace("_", " ")}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update project status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Handle drag and drop for kanban
  const handleDragStart = (e, project) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(project));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    try {
      const project = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (project.status !== newStatus) {
        await handleStatusChange(project, newStatus);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const openEditDialog = (project) => {
    setCurrentProject(project);
    setFormData({
      projectId: project.projectId || "",
      name: project.name || "",
      active: project.active !== undefined ? project.active : true,
      budget: project.budget || "",
      budgetFunctionalHours: project.budgetFunctionalHours || "",
      budgetTechnicalHours: project.budgetTechnicalHours || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      isBillable: project.isBillable !== undefined ? project.isBillable : true,
      clientId: project.clientId || "",
      clientName: project.clientName || "",
      clientProjectManager: project.clientProjectManager || "",
      clientPMEmail: project.clientPMEmail || "",
      clientSPOC1: project.clientSPOC1 || "",
      clientSPOC1Email: project.clientSPOC1Email || "",
      clientSPOC2: project.clientSPOC2 || "",
      clientSPOC2Email: project.clientSPOC2Email || "",
      projectGroup: project.projectGroup || "",
      projectType: project.projectType?._id?.toString() || "",
      description: project.description || "",
      status: project.status || "planning",
      managerId: project.managerId || "",
      actualDate: project.actualDate || "",
      teamleadId: project.teamleadId || "",
      resources: project.resources || [],
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = async (id) => {
    try {
      const response = await api.get(`project/${id}`);
      setCurrentProject(response.data.project);
      setIsViewDialogOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const canCreate = hasPermission("create_projects");
  const canEdit = hasPermission("edit_projects");
  const canDelete = hasPermission("delete_projects");

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "on_hold":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Get project progress
  const getProjectProgress = (projectId) => {
    const projectTasks = tasks?.filter((task) => task?.projectId === projectId);
    if (projectTasks?.length === 0) return 0;

    const completedTasks = projectTasks?.filter(
      (task) => task.status === "Closed"
    );
    return Math.round((completedTasks?.length / projectTasks?.length) * 100);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter("all");
    setBillableFilter("all");
    setProjectTypeFilter("all");
  };

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getManager = (managerId) => {
    const manager = users.find((user) => user._id === managerId);
    return manager;
  };

  function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) return null;

    const diffTime = end - start;

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays < 0) return "End date must be after start date";
    if (diffDays === 1) return "1 day";
    return `${diffDays} days`;
  }



  const handleAddProjectMember = (memberId) => {
    if (!formData.resources?.includes(memberId)) {
      setFormData((prev) => ({
        ...prev,
        resources: [...(prev.resources || []), memberId],
      }));
    }
  };

  const handleRemoveProjectMember = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      resources: (prev.resources || []).filter((id) => id !== memberId),
    }));
  };

  const handleProjectMemberSelect = (value) => {
    if (value && !(formData.resources || []).includes(value)) {
      setFormData((prev) => ({
        ...prev,
        resources: [...(prev.resources || []), value],
      }));
    }
  };

  const getUserNameById = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "-";
  };

  const ResourcesTabForm = ({ isViewOnly }) => {
    // Using teamMembers state for the dropdown, but users state for name lookups
    const availableMembers = teamMembers?.members;

    if (isViewOnly) {
      return (
        <>
          <h3 className="text-sm font-medium text-muted-foreground">
            Team Members
          </h3>
          {!currentProject?.resources || currentProject?.resources?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No members added yet
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {currentProject?.resources?.map((memberId, i) => {
                // Look up the name in the global users state using the ID
                const member = users.find((u) => u._id === memberId);
                return member ? (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {member.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </>
      )
    }

    return (
      <div className="space-y-6">
        {/* Current Members */}
        <div className="grid gap-2">
          <Label>Current Team Members</Label>

          <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
            {!formData.resources || formData.resources.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members added yet
              </p>
            ) : (
              formData.resources.map((memberId, i) => {
                const member = users.find((u) => u._id === memberId);

                return member ? (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {member.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() =>
                        handleRemoveProjectMember(memberId)
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null
              })
            )}
          </div>
        </div>

        {/* Add Member */}
        <div className="grid gap-2">
          <Label htmlFor="add-member">Add Team Member</Label>

          <Select onValueChange={handleProjectMemberSelect}>
            <SelectTrigger id="add-member">
              <SelectValue placeholder={!formData.teamleadId ? "Please select a Team Leader first" : "Select a team member"} />
            </SelectTrigger>
            <SelectContent>
              {availableMembers
                ?.filter(
                  (member) =>
                    !(formData.resources || []).includes(member)
                )
                .map((member, i) => (
                  <SelectItem key={i} value={member}>
                    {getUserNameById(member)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };
  // Kanban Project Card Component
  const ProjectCard = ({ project }) => (
    <Card
      className="mb-3 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => handleDragStart(e, project)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4
              className="font-medium text-sm cursor-pointer hover:underline"
              onClick={() => openViewDialog(project._id)}
            >
              {project.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {project.projectId}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openViewDialog(project._id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => openEditDialog(project)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => handleDeleteProject(project)}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {project.isBillable && (
                <Badge variant="secondary" className="text-xs">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Billable
                </Badge>
              )}
              {project.active === false && (
                <Badge variant="outline" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            {project.managerId && (
              <div className="flex items-center text-xs text-muted-foreground">
                <User className="h-3 w-3 mr-1" />
                {getManager(project.managerId)?.name || "Unassigned"}
              </div>
            )}
          </div>

          {project.clientName && (
            <div className="text-xs text-muted-foreground">
              🏢 {project.clientName}
            </div>
          )}

          {project.projectType?.typeName && (
            <div className="text-xs text-muted-foreground">
              📋 {project.projectType?.typeName}
            </div>
          )}

          {(project.startDate || project.endDate) && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {project.startDate && project.endDate
                ? `${formatDate(project.startDate)} - ${formatDate(
                  project.endDate
                )}`
                : project.startDate
                  ? formatDate(project.startDate)
                  : formatDate(project.endDate)}
            </div>
          )}

          {project.budget && (
            <div className="flex items-center text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 mr-1" />
              Budget: ${project.budget}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {getProjectProgress(project._id)}%
              </span>
            </div>
            <Progress value={getProjectProgress(project._id)} className="h-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute requiredPermission="view_projects">
      <DashboardShell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground">
                Manage your projects and their details
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {canCreate && (
                <Button onClick={() => {
                  resetForm(),
                    setIsCreateDialogOpen(true)
                }
                }>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Project
                </Button>
              )}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <Tabs
              value={currentView}
              onValueChange={setCurrentView}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Table View
                </TabsTrigger>
                <TabsTrigger value="kanban" className="flex items-center gap-2">
                  <Kanban className="h-4 w-4" />
                  Kanban Board
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="text-sm text-muted-foreground">
              {filteredProjects.length} of {projects.length} projects
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={billableFilter} onValueChange={setBillableFilter}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Billable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="billable">Billable</SelectItem>
                <SelectItem value="non-billable">Non-Billable</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={projectTypeFilter}
              onValueChange={setProjectTypeFilter}
            >
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {/* Dynamically render types from backend */}
                {backendProjectTypes.map((type, i) => (
                  <SelectItem key={i} value={type._id}>
                    {type.typeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(activeFilter !== "all" ||
              billableFilter !== "all" ||
              projectTypeFilter !== "all" ||
              searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
          </div>

          {/* Main Content */}
          {currentView === "table" ? (
            <>
              {/* Table View */}
              <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead
                        className="w-[15%] cursor-pointer"
                        onClick={() => handleSort("projectId")}
                      >
                        <div className="flex items-center">
                          Project ID
                          {sortField === "projectId" ? (
                            sortDirection === "asc" ? (
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
                        className="w-[20%] cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Project Name
                          {sortField === "name" ? (
                            sortDirection === "asc" ? (
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
                        onClick={() => handleSort("clientName")}
                      >
                        <div className="flex items-center">
                          Delivery Manager
                          {sortField === "deliveryManager" ? (
                            sortDirection === "asc" ? (
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
                        onClick={() => handleSort("clientName")}
                      >
                        <div className="flex items-center">
                          Team Leader
                          {sortField === "deliveryManager" ? (
                            sortDirection === "asc" ? (
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
                        onClick={() => handleSort("clientName")}
                      >
                        <div className="flex items-center">
                          Client
                          {sortField === "clientName" ? (
                            sortDirection === "asc" ? (
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
                        onClick={() => handleSort("startDate")}
                      >
                        <div className="flex items-center">
                          Start Date
                          {sortField === "startDate" ? (
                            sortDirection === "asc" ? (
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
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {sortField === "status" ? (
                            sortDirection === "asc" ? (
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
                    {paginatedProjects.length === 0 ? (
                      <TableRow key="empty-row">
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-2" />
                            <p className="text-muted-foreground">
                              No projects found.{" "}
                              {canCreate && "Create your first project!"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedProjects.map((project, index) => (
                        <TableRow
                          key={project.id || project._id || index}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>{project.projectId || "-"}</TableCell>

                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{project.name}</span>

                              {project.projectType?.typeName && (
                                <span className="text-xs text-muted-foreground">
                                  {project.projectType?.typeName}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>{getUserNameById(project.managerId) || "-"}</TableCell>

                          <TableCell>{getUserNameById(project.teamleadId) || "-"}</TableCell>

                          <TableCell>{project.clientName || "-"}</TableCell>

                          <TableCell>
                            {project.startDate
                              ? formatDate(project.startDate)
                              : "-"}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(project.status)}>
                                {project.status
                                  ?.replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                                  "Planning"}
                              </Badge>

                              {project.active === false && (
                                <Badge
                                  variant="outline"
                                  className="bg-gray-100 text-gray-800"
                                >
                                  Inactive
                                </Badge>
                              )}
                            </div>
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
                                  onClick={() => openViewDialog(project._id)}
                                  className="flex items-center"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {canEdit && (
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(project)}
                                    className="flex items-center"
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                )}

                                {canDelete && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteProject(project)}
                                    className="text-red-600 flex items-center"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
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
              <div className="flex justify-between items-center">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            /* Kanban View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[600px]">
              {kanbanColumns.map((column) => (
                <div
                  key={column.id}
                  className={`rounded-lg border-2 border-dashed p-4 ${column.color}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {kanbanProjects[column.id]?.length || 0}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {kanbanProjects[column.id]?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-xs">No projects</div>
                      </div>
                    ) : (
                      kanbanProjects[column.id]?.map((project) => (
                        <ProjectCard key={project._id} project={project} />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Project Dialog */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project to your organization
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic">
                {/* Fix: Changed grid-cols-4 to grid-cols-5 */}
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="client">Client</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  {/* Fix: Added 5th Tab Trigger */}
                  <TabsTrigger value="allocation">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid  gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        max={formData.endDate}
                      />
                    </div>
                    <div className="grid ">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="endDate">End Date</Label>
                        {formData.startDate && formData.endDate && (
                          <Badge variant="outline" className="ml-2">
                            {calculateDuration(
                              formData.startDate,
                              formData.endDate
                            )}
                          </Badge>
                        )}
                      </div>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate}
                      />
                    </div>

                    <div className="grid ">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="actualDate">Actual Date</Label>
                      </div>
                      <Input
                        id="actualDate"
                        name="actualDate"
                        type="date"
                        value={formData.actualDate}
                        onChange={handleInputChange}
                        min={formData.startDate}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div className="grid gap-2">
                      <Label htmlFor="managerId">Project Manager</Label>
                      <Select
                        value={formData.managerId}
                        onValueChange={(value) =>
                          handleSelectChange("managerId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectManagers.map((manager) => (
                            <SelectItem key={manager._id} value={manager?._id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="teamleadId">Team Leader</Label>
                      <Select
                        value={formData.teamleadId}
                        onValueChange={(value) =>
                          handleSelectChange("teamleadId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamLeads.map((tl) => (
                            <SelectItem key={tl._id} value={tl?._id}>
                              {tl.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">
                          Not Started
                        </SelectItem>
                        <SelectItem value="in_progress">
                          In Progress
                        </SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("active", checked)
                        }
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isBillable"
                        checked={formData.isBillable}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("isBillable", checked)
                        }
                      />
                      <Label htmlFor="isBillable">Billable</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="budget" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budgetFunctionalHours">
                        Budget Functional Hours
                      </Label>
                      <Input
                        id="budgetFunctionalHours"
                        name="budgetFunctionalHours"
                        type="number"
                        value={formData.budgetFunctionalHours}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budgetTechnicalHours">
                        Budget Technical Hours
                      </Label>
                      <Input
                        id="budgetTechnicalHours"
                        name="budgetTechnicalHours"
                        type="number"
                        value={formData.budgetTechnicalHours}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="client" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="clientId">Client</Label>
                      <Select
                        value={formData.clientId}
                        onValueChange={handleClientChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {clients.map((client) => (
                            <SelectItem
                              key={client._id}
                              value={client.clientId}
                            >
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="clientProjectManager">
                        Client Project Manager
                      </Label>
                      <Input
                        id="clientProjectManager"
                        name="clientProjectManager"
                        value={formData.clientProjectManager}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="clientPMEmail">Client PM Email</Label>
                      <Input
                        id="clientPMEmail"
                        name="clientPMEmail"
                        type="email"
                        value={formData.clientPMEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="clientSPOC1">Client SPOC 1</Label>
                      <Input
                        id="clientSPOC1"
                        name="clientSPOC1"
                        value={formData.clientSPOC1}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="clientSPOC1Email">
                        Client SPOC 1 Email
                      </Label>
                      <Input
                        id="clientSPOC1Email"
                        name="clientSPOC1Email"
                        type="email"
                        value={formData.clientSPOC1Email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="clientSPOC2">Client SPOC 2</Label>
                      <Input
                        id="clientSPOC2"
                        name="clientSPOC2"
                        value={formData.clientSPOC2}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="clientSPOC2Email">
                        Client SPOC 2 Email
                      </Label>
                      <Input
                        id="clientSPOC2Email"
                        name="clientSPOC2Email"
                        type="email"
                        value={formData.clientSPOC2Email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="projectType">Project Type</Label>
                      <Select
                        value={formData.projectType}
                        onValueChange={(value) =>
                          handleSelectChange("projectType", value)
                        }
                      >
                        <SelectTrigger id="projectType">
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          {backendProjectTypes.map((type, i) => (
                            <SelectItem key={i} value={type._id || type}>
                              {type.typeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Fix: Added 5th Tab Content */}
                <TabsContent value="allocation" className="space-y-4 mt-4">
                  <ResourcesTabForm />
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Project Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              {currentProject && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {currentProject.name}
                    </DialogTitle>
                    <DialogDescription>
                      Project ID: {currentProject.projectId || "N/A"}
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="overview">
                    {/* Fix: Updated to grid-cols-5 to accommodate the new tab */}
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="budget">Budget</TabsTrigger>
                      <TabsTrigger value="client">Client</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      {/* Added Resources Tab Trigger */}
                      <TabsTrigger value="allocation">Resources</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Status
                          </h3>
                          <div className="mt-1">
                            <Badge
                              className={getStatusColor(currentProject.status)}
                            >
                              {currentProject.status
                                ?.replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                                "Planning"}
                            </Badge>
                            {currentProject.active === false && (
                              <Badge
                                variant="outline"
                                className="ml-2 bg-gray-100 text-gray-800"
                              >
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Project Type
                          </h3>
                          <p className="mt-1">
                            {currentProject.projectType?.typeName || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Start Date
                          </h3>
                          <p className="mt-1">
                            {currentProject.startDate
                              ? formatDate(currentProject.startDate)
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            End Date
                          </h3>
                          <p className="mt-1">
                            {currentProject.endDate
                              ? formatDate(currentProject.endDate)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Actual Date
                          </h3>
                          <p className="mt-1">
                            {currentProject.actualDate
                              ? formatDate(currentProject.actualDate)
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Duration
                          </h3>
                          <p className="mt-1">
                            {calculateDuration(
                              currentProject.startDate,
                              currentProject.endDate
                            )}
                          </p>
                        </div>

                        {/* <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Project Manager
                          </h3>
                          <p className="mt-1">
                            {currentProject.managerId
                              ? getManager(currentProject.managerId)?.name ||
                              "Unassigned"
                              : "Unassigned"}
                          </p>
                        </div> */}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Project Manager
                          </h3>
                          <p className="mt-1">
                            {currentProject.managerId
                              ? getManager(currentProject.managerId)?.name ||
                              "Unassigned"
                              : "Unassigned"}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Team Leader
                          </h3>
                          <p className="mt-1">
                            {currentProject.teamleadId
                              ? getManager(currentProject.teamleadId)?.name ||
                              "Unassigned"
                              : "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Description
                        </h3>
                        <p className="mt-1">
                          {currentProject.description ||
                            "No description provided."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Progress
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress
                            value={getProjectProgress(currentProject._id)}
                            className="h-2 w-full"
                          />
                          <span className="text-xs">
                            {getProjectProgress(currentProject._id)}%
                          </span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="budget" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Budget
                          </h3>
                          <p className="mt-1 text-lg font-semibold">
                            {currentProject.budget
                              ? `${currentProject.budget}`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Billable
                          </h3>
                          <p className="mt-1">
                            {currentProject.isBillable === true
                              ? "Yes"
                              : currentProject.isBillable === false
                                ? "No"
                                : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Budget Functional Hours
                          </h3>
                          <p className="mt-1">
                            {currentProject.budgetFunctionalHours || "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Budget Technical Hours
                          </h3>
                          <p className="mt-1">
                            {currentProject.budgetTechnicalHours || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="client" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Client Code
                          </h3>
                          <p className="mt-1">
                            {currentProject.clientId || "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Client Name
                          </h3>
                          <p className="mt-1">
                            {currentProject.clientName || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Client Project Manager
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p>{currentProject.clientProjectManager || "N/A"}</p>
                          {currentProject.clientPMEmail && (
                            <a
                              href={`mailto:${currentProject.clientPMEmail}`}
                              className="text-primary text-sm"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Client SPOC 1
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p>{currentProject.clientSPOC1 || "N/A"}</p>
                          {currentProject.clientSPOC1Email && (
                            <a
                              href={`mailto:${currentProject.clientSPOC1Email}`}
                              className="text-primary text-sm"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Client SPOC 2
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p>{currentProject.clientSPOC2 || "N/A"}</p>
                          {currentProject.clientSPOC2Email && (
                            <a
                              href={`mailto:${currentProject.clientSPOC2Email}`}
                              className="text-primary text-sm"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Project Type
                          </h3>
                          <p className="mt-1">
                            {currentProject.projectType?.typeName || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Created
                        </h3>
                        <p className="mt-1">
                          {currentProject.createdAt
                            ? formatDate(currentProject.createdAt)
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Last Updated
                        </h3>
                        <p className="mt-1">
                          {currentProject.updatedAt
                            ? formatDate(currentProject.updatedAt)
                            : "N/A"}
                        </p>
                      </div>
                    </TabsContent>

                    {/* Added Resources Tab Content */}
                    <TabsContent value="allocation" className="space-y-4 mt-4">
                      <ResourcesTabForm isViewOnly={true} />
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    {canEdit && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          openEditDialog(currentProject);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Project
                      </Button>
                    )}
                    <Button onClick={() => setIsViewDialogOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Project Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Make changes to the project details
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="client">Client</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="allocation">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid  gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Project Name</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid">
                      <Label htmlFor="edit-startDate">Start Date</Label>
                      <Input
                        id="edit-startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        max={formData.endDate}
                      />
                    </div>
                    <div className="grid ">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="edit-endDate">End Date</Label>
                        {formData.startDate && formData.endDate && (
                          <Badge variant="outline" className="ml-2">
                            {calculateDuration(
                              formData.startDate,
                              formData.endDate
                            )}
                          </Badge>
                        )}
                      </div>
                      <Input
                        id="edit-endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate}
                      />
                    </div>

                    <div className="grid ">
                      <Label htmlFor="edit-actualDate">Actual Date</Label>
                      <Input
                        id="edit-actualDate"
                        name="actualDate"
                        type="date"
                        value={formData.actualDate}
                        onChange={handleInputChange}
                        min={formData.startDate}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div className="grid gap-2">
                      <Label htmlFor="edit-managerId">Project Manager</Label>
                      <Select
                        value={formData.managerId}
                        onValueChange={(value) =>
                          handleSelectChange("managerId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectManagers.map((manager) => (
                            <SelectItem key={manager._id} value={manager._id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-teamleadId">Team Leader</Label>
                      <Select
                        value={formData.teamleadId}
                        onValueChange={(value) =>
                          handleSelectChange("teamleadId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team lead" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamLeads.map((tl, i) => (
                            <SelectItem key={i} value={tl._id}>
                              {tl.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">
                          Not Started
                        </SelectItem>
                        <SelectItem value="in_progress">
                          In Progress
                        </SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-active"
                        checked={formData.active}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("active", checked)
                        }
                      />
                      <Label htmlFor="edit-active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-isBillable"
                        checked={formData.isBillable}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("isBillable", checked)
                        }
                      />
                      <Label htmlFor="edit-isBillable">Billable</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="budget" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-budget">Budget ($)</Label>
                      <Input
                        id="edit-budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-budgetFunctionalHours">
                        Budget Functional Hours
                      </Label>
                      <Input
                        id="edit-budgetFunctionalHours"
                        name="budgetFunctionalHours"
                        type="number"
                        value={formData.budgetFunctionalHours}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-budgetTechnicalHours">
                        Budget Technical Hours
                      </Label>
                      <Input
                        id="edit-budgetTechnicalHours"
                        name="budgetTechnicalHours"
                        type="number"
                        value={formData.budgetTechnicalHours}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="client" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-clientId">Client</Label>
                      <Select
                        value={formData.clientId}
                        onValueChange={handleClientChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {clients.map((client) => (
                            <SelectItem
                              key={client._id}
                              value={client.clientId}
                            >
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-clientProjectManager">
                        Client Project Manager
                      </Label>
                      <Input
                        id="edit-clientProjectManager"
                        name="clientProjectManager"
                        value={formData.clientProjectManager}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-clientPMEmail">
                        Client PM Email
                      </Label>
                      <Input
                        id="edit-clientPMEmail"
                        name="clientPMEmail"
                        type="email"
                        value={formData.clientPMEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-clientSPOC1">Client SPOC 1</Label>
                      <Input
                        id="edit-clientSPOC1"
                        name="clientSPOC1"
                        value={formData.clientSPOC1}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-clientSPOC1Email">
                        Client SPOC 1 Email
                      </Label>
                      <Input
                        id="edit-clientSPOC1Email"
                        name="clientSPOC1Email"
                        type="email"
                        value={formData.clientSPOC1Email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-clientSPOC2">Client SPOC 2</Label>
                      <Input
                        id="edit-clientSPOC2"
                        name="clientSPOC2"
                        value={formData.clientSPOC2}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-clientSPOC2Email">
                        Client SPOC 2 Email
                      </Label>
                      <Input
                        id="edit-clientSPOC2Email"
                        name="clientSPOC2Email"
                        type="email"
                        value={formData.clientSPOC2Email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="projectType">Project Type</Label>
                      <Select
                        value={formData.projectType}
                        onValueChange={(value) =>
                          handleSelectChange("projectType", value)
                        }
                      >
                        <SelectTrigger id="projectType">
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          {backendProjectTypes.map((type, i) => (
                            <SelectItem key={i} value={type._id || type}>
                              {type.typeName || type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="allocation" className="space-y-4 mt-4">
                  <ResourcesTabForm />
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditProject}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}