"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  CheckSquare,
  Eye,
  Filter,
  X,
  Loader2,
  ChevronDown,
  TableIcon,
  Kanban,
  Calendar,
  User,
} from "lucide-react";
import { FileText } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { toastMessages } from "@/lib/utils";
import api from "@/config/api";

export default function TasksPage() {
  const { user, hasPermission } = useAuth();
  const { getItems, updateItem, deleteItem, getItemById, createItem } =
    useData();
  const router = useRouter();
  const { toast } = useToast();

  // View state
  const [currentView, setCurrentView] = useState("table");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    milestoneId: "",
    reportedDate: "",
    startDate: "",
    endDate: "",
    status: "Open",
    taskType: "",
    taskNature: "",
    priority: "medium",
    functionalConsultant: "",
    technicalConsultant: "",
    totalHours: "",
    estimatedHours: "",
    billable: true,
    attachments: [],
    active: true,
    planDate: "",
    actualDate: ""
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState(Array(5).fill(null));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [isSuccess, setSuccess] = useState(false);

  // Kanban columns configuration
  const kanbanColumns = [
    { id: "Open", title: "Open", color: "bg-teal-50 border-teal-200" },
    { id: "WIP", title: "In Progress", color: "bg-blue-50 border-blue-200" },
    { id: "QC", title: "Quality Check", color: "bg-amber-50 border-amber-200" },
    {
      id: "Under Review",
      title: "Under Review",
      color: "bg-purple-50 border-purple-200",
    },
    { id: "Hold", title: "On Hold", color: "bg-pink-50 border-pink-200" },
    { id: "Closed", title: "Completed", color: "bg-green-50 border-green-200" },
  ];

  // Memoize data to prevent unnecessary re-renders
  const consultants = useMemo(
    () => users.filter((u) => u.role === "team_member"),
    [users]
  );

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get(`task/user/${user?._id}`);
        setTasks(response.data.tasks);
      } catch (err) {
        console.log(err);
      }
    };
    if (user?._id) {
      loadResponse();
    }
  }, [user, isSuccess]);

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
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("milestone");
        setMilestones(response.data.milestones);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [isSuccess]);

  // Get unique task types and natures for filters
  const taskTypes = useMemo(
    () => [...new Set(tasks.map((task) => task.taskType).filter(Boolean))],
    [tasks]
  );
  const taskNatures = useMemo(
    () => [...new Set(tasks.map((task) => task.taskNature).filter(Boolean))],
    [tasks]
  );

  // Get current task data
  const currentTask = useMemo(
    () => (currentTaskId ? getItemById("tasks", currentTaskId) : null),
    [currentTaskId, getItemById]
  );

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    // Start with tasks that don't have a parentTaskId (filter out subtasks)
    let result = tasks.filter((task) => !task.parentTaskId);

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.taskId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Apply project filter
    if (projectFilter !== "all") {
      result = result.filter((task) => task.projectId === projectFilter);
    }

    // Apply active filter
    if (activeFilter !== "all") {
      result = result.filter((task) =>
        activeFilter === "active" ? task.active : !task.active
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special cases
      if (sortField === "projectId") {
        aValue =
          getItemById("projects", Number.parseInt(a.projectId))?.name || "";
        bValue =
          getItemById("projects", Number.parseInt(b.projectId))?.name || "";
      } else if (
        sortField === "functionalConsultant" ||
        sortField === "technicalConsultant"
      ) {
        aValue =
          getItemById("users", Number.parseInt(a[sortField]))?.name || "";
        bValue =
          getItemById("users", Number.parseInt(b[sortField]))?.name || "";
      } else if (sortField === "totalHours" || sortField === "estimatedHours") {
        aValue = Number.parseFloat(aValue) || 0;
        bValue = Number.parseFloat(bValue) || 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    tasks,
    searchTerm,
    sortField,
    sortDirection,
    statusFilter,
    priorityFilter,
    projectFilter,
    activeFilter,
    getItemById,
  ]);

  // Paginated tasks for table view
  const paginatedTasks = useMemo(() => {
    return filteredTasks.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredTasks, currentPage, itemsPerPage]);

  // Group tasks by status for kanban view
  const kanbanTasks = useMemo(() => {
    const grouped = {};
    kanbanColumns.forEach((column) => {
      grouped[column.id] = filteredTasks.filter(
        (task) => task.status === column.id
      );
    });
    return grouped;
  }, [filteredTasks, kanbanColumns]);

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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      projectId: "",
      milestoneId: "",
      reportedDate: "",
      startDate: "",
      endDate: "",
      status: "Open",
      taskType: "",
      taskNature: "",
      priority: "medium",
      functionalConsultant: "",
      technicalConsultant: "",
      totalHours: "",
      estimatedHours: "",
      billable: true,
      attachments: [],
      active: true,
      planDate: "",
      actualDate: ""
    });
    setCurrentTaskId(null);
    setUploadStatuses(Array(5).fill(null));
  };

  const handleCreateTask = async () => {
    try {
      const response = await api.post("task", formData);
      setSuccess(response);
      toast(toastMessages.create("Task", formData.title));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("create", "task", error));
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async () => {
    try {
      setLoading(true);
      const response = await api.put("task", formData);
      setSuccess(response);
      toast(toastMessages.update("Task", formData.title));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("update", "task", error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (task) => {
    try {
      setLoading(true);
      const response = await api.delete(`task/${task.taskId}`);
      setSuccess(response);
      toast(toastMessages.delete("Task", task.title));
    } catch (error) {
      toast(toastMessages.error("delete", "task", error));
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (task) => {
    setCurrentTaskId(task.taskId);
    setFormData({
      taskId: task.taskId || "",
      title: task.title || "",
      description: task.description || "",
      projectId: task.projectId || "",
      milestoneId: task.milestoneId || "",
      reportedDate: task.reportedDate || "",
      startDate: task.startDate || "",
      endDate: task.endDate || "",
      status: task.status || "Open",
      taskType: task.taskType || "",
      taskNature: task.taskNature || "",
      priority: task.priority || "medium",
      functionalConsultant: task.functionalConsultant || "",
      technicalConsultant: task.technicalConsultant || "",
      totalHours: task.totalHours || "",
      estimatedHours: task.estimatedHours || "",
      billable: task.billable !== undefined ? task.billable : true,
      attachments: task.attachments || [],
      active: task.active !== undefined ? task.active : true,
      planDate: task?.planDate,
      actualDate: task?.actualDate
    });
    setIsEditDialogOpen(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setProjectFilter("all");
    setActiveFilter("all");
  };

  const canCreate = hasPermission("create_tasks");
  const canEdit = hasPermission("edit_tasks");
  const canDelete = hasPermission("delete_tasks");
  const canUpdateStatus = hasPermission("update_task_status");

  // Function to handle status updates directly in the table
  const handleStatusChange = async (task, newStatus) => {
    try {
      const response = await api.put("task", {
        status: newStatus,
        taskId: task.taskId,
      });
      setSuccess(response);
      toast({
        title: "Task status updated",
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update task status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Function to handle priority updates directly in the table
  const handlePriorityChange = async (task, newPriority) => {
    try {
      const response = await api.put("task", {
        priority: newPriority,
        taskId: task.taskId,
      });
      setSuccess(response);
      toast({
        title: "Task priority updated",
        description: `Task priority changed to ${newPriority}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update task priority: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Handle drag and drop for kanban
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(task));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    try {
      const task = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (task.status !== newStatus) {
        await handleStatusChange(task, newStatus);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const fileName = e.target.files[0].name;
    const timestamp = new Date().getTime();
    const ext = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
    const uniqueFileName = `${timestamp}.${ext}`;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileData = e.target.result.split(",")[1];
      const formData = new FormData();
      formData.append("fileName", uniqueFileName);
      formData.append("fileContent", fileData);
      formData.append("mimetype", file.type);
      try {
        const response = await api.post("/upload/attachment", formData);
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, response.data.file],
        }));
      } catch (err) {
        console.log(err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Function to export tasks to CSV
  const exportToCSV = () => {
    try {
      setLoading(true);

      // Define the CSV headers
      const headers = [
        "Task ID",
        "Title",
        "Description",
        "Project",
        "Status",
        "Priority",
        "Task Type",
        "Task Nature",
        "Start Date",
        "End Date",
        "Estimated Hours",
        "Total Hours",
        "Billable",
        "Active",
      ];

      // Convert tasks to CSV rows
      const csvRows = filteredTasks.map((task) => {
        const project = task.projectId
          ? getItemById("projects", Number.parseInt(task.projectId))?.name ||
          "Unassigned"
          : "Unassigned";

        return [
          task.taskId || "",
          task.title || "",
          task.description?.replace(/,/g, ";").replace(/\n/g, " ") || "",
          project,
          task.status || "",
          task.priority || "",
          task.taskType || "",
          task.taskNature || "",
          task.startDate || "",
          task.endDate || "",
          task.estimatedHours || "",
          task.totalHours || "",
          task.billable ? "Yes" : "No",
          task.active ? "Yes" : "No",
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      // Create a Blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `tasks_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `${filteredTasks.length} tasks exported to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: `Failed to export tasks: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100";
      case "WIP":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100";
      case "QC":
        return "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100";
      case "Under Review":
        return "bg-violet-100 text-violet-800 dark:bg-violet-800 dark:text-violet-100";
      case "Closed":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100";
      case "Re Open":
        return "bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-100";
      case "Hold":
        return "bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100";
      case "medium":
        return "bg-sky-100 text-sky-800 dark:bg-sky-800 dark:text-sky-100";
      case "high":
        return "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100";
      case "urgent":
        return "bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-100";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100";
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ");
  };

  const formatPriority = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getProject = (projectId) => {
    const project = projects.find((project) => project._id === projectId);
    return project;
  };

  const getUser = (id) => {
    const user = users.find((user) => user._id === id);
    return user;
  };

  // Kanban Task Card Component
  const TaskCard = ({ task }) => (
    <Card
      className="mb-3 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4
              className="font-medium text-sm cursor-pointer hover:underline"
              onClick={() => router.push(`/tasks/${task.taskId}`)}
            >
              {task.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">{task.taskId}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/tasks/${task.taskId}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => openEditDialog(task)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => handleDeleteTask(task)}
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
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Badge
              className={getPriorityColor(task.priority)}
              variant="secondary"
            >
              {formatPriority(task.priority)}
            </Badge>
            {(task.functionalConsultant || task.technicalConsultant) && (
              <div className="flex items-center text-xs text-muted-foreground">
                <User className="h-3 w-3 mr-1" />
                {getUser(task.functionalConsultant || task.technicalConsultant)
                  ?.name || "Unassigned"}
              </div>
            )}
          </div>

          {task.projectId && (
            <div className="text-xs text-muted-foreground">
              📁 {getProject(task.projectId)?.name || "Unknown Project"}
            </div>
          )}

          {(task.startDate || task.endDate) && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {task.startDate && task.endDate
                ? `${task.startDate} - ${task.endDate}`
                : task.startDate || task.endDate}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute requiredPermission="view_tasks">
      <DashboardShell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground">
                Manage your tasks and track progress
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  disabled={loading || filteredTasks.length === 0}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
                {canCreate && (
                  <Button
                    onClick={() => {
                      resetForm();
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                )}
              </div>
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
              {filteredTasks.length} of{" "}
              {tasks.filter((task) => !task.parentTaskId).length} tasks
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="WIP">WIP</SelectItem>
                <SelectItem value="QC">QC</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Re Open">Re Open</SelectItem>
                <SelectItem value="Hold">Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project, i) => (
                  <SelectItem key={i} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== "all" ||
              priorityFilter !== "all" ||
              projectFilter !== "all" ||
              activeFilter !== "all" ||
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
                        onClick={() => handleSort("taskId")}
                      >
                        <div className="flex items-center">
                          Task ID
                          {sortField === "taskId" ? (
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
                        className="w-[30%] cursor-pointer"
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center">
                          Task Name
                          {sortField === "title" ? (
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
                        className="w-[20%] cursor-pointer"
                        onClick={() => handleSort("endDate")}
                      >
                        <div className="flex items-center">
                          End Date
                          {sortField === "endDate" ? (
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
                        onClick={() => handleSort("functionalConsultant")}
                      >
                        <div className="flex items-center">
                          Assigned To
                          {sortField === "functionalConsultant" ? (
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
                        onClick={() => handleSort("projectId")}
                      >
                        <div className="flex items-center">
                          Project
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
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-2" />
                            <p className="text-muted-foreground">
                              No tasks found.{" "}
                              {canCreate && "Create your first task!"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTasks.map((task, i) => (
                        <TableRow key={i}>
                          <TableCell>{task.taskId || "-"}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div>
                                <div className="flex items-center">
                                  <span
                                    className="cursor-pointer hover:underline"
                                    onClick={() =>
                                      router.push(`/tasks/${task.taskId}`)
                                    }
                                  >
                                    {task.title}
                                  </span>
                                </div>
                                {task.taskType && (
                                  <span className="text-xs text-muted-foreground">
                                    {task.taskType} - {task.taskNature}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {task.startDate ? task.startDate : ""}
                          </TableCell>
                          <TableCell>
                            {task.endDate ? task.endDate : ""}
                          </TableCell>
                          <TableCell>
                            {task.functionalConsultant
                              ? getUser(task.functionalConsultant)?.name || ""
                              : getUser(task.technicalConsultant)?.name || ""}
                          </TableCell>
                          <TableCell>
                            {task.projectId
                              ? getProject(task.projectId)?.name || "Unassigned"
                              : "Unassigned"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 flex items-center gap-1"
                                >
                                  <Badge
                                    className={getStatusColor(
                                      task.status || "Open"
                                    )}
                                  >
                                    {formatStatus(task.status)}
                                  </Badge>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuLabel>
                                  Change Status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(task, "Open")
                                  }
                                >
                                  Open
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(task, "WIP")
                                  }
                                >
                                  WIP
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(task, "QC")}
                                >
                                  QC
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(task, "Under Review")
                                  }
                                >
                                  Under Review
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(task, "Closed")
                                  }
                                >
                                  Closed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(task, "Re Open")
                                  }
                                >
                                  Re Open
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(task, "Hold")
                                  }
                                >
                                  Hold
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 flex items-center gap-1"
                                >
                                  <Badge
                                    className={getPriorityColor(
                                      task.priority || "medium"
                                    )}
                                  >
                                    {formatPriority(task.priority)}
                                  </Badge>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuLabel>
                                  Change Priority
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handlePriorityChange(task, "low")
                                  }
                                >
                                  Low
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handlePriorityChange(task, "medium")
                                  }
                                >
                                  Medium
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handlePriorityChange(task, "high")
                                  }
                                >
                                  High
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handlePriorityChange(task, "urgent")
                                  }
                                >
                                  Urgent
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                                  onClick={() =>
                                    router.push(`/tasks/${task.taskId}`)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {canEdit && (
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(task)}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {canDelete && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTask(task)}
                                    className="text-red-600"
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

              {/* Pagination for Table View */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">
                    Items per page
                  </p>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil(filteredTasks.length / itemsPerPage)
                        ),
                      },
                      (_, i) => {
                        const pageNumber = i + 1;
                        const isCurrentPage = pageNumber === currentPage;
                        const totalPages = Math.ceil(
                          filteredTasks.length / itemsPerPage
                        );
                        const isWithinRange =
                          Math.abs(pageNumber - currentPage) < 2 ||
                          pageNumber === 1 ||
                          pageNumber === totalPages;

                        if (!isWithinRange) {
                          if (pageNumber === 2 && currentPage > 3)
                            return <span key={pageNumber}>...</span>;
                          if (
                            pageNumber === totalPages - 1 &&
                            currentPage < totalPages - 2
                          )
                            return <span key={pageNumber}>...</span>;
                          return null;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={isCurrentPage ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8"
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        );
                      }
                    ).filter(Boolean)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(filteredTasks.length / itemsPerPage)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(filteredTasks.length / itemsPerPage)
                    }
                  >
                    Next
                  </Button>
                </div>
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
                      {kanbanTasks[column.id]?.length || 0}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {kanbanTasks[column.id]?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-xs">No tasks</div>
                      </div>
                    ) : (
                      kanbanTasks[column.id]?.map((task) => (
                        <TaskCard key={task.taskId} task={task} />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Task Dialog */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your project
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="assignment">Assignment</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Task Name</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Task Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="projectId">Project</Label>
                      <Select
                        value={formData.projectId}
                        onValueChange={(value) =>
                          handleSelectChange("projectId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project._id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* ── MILESTONE DROPDOWN (Create) ── */}
                    <div className="grid gap-2">
                      <Label htmlFor="milestoneId">Milestone</Label>
                      <Select
                        value={formData.milestoneId}
                        onValueChange={(value) =>
                          handleSelectChange("milestoneId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a milestone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {milestones.map((milestone) => (
                            <SelectItem
                              key={milestone._id}
                              value={milestone._id}
                            >
                              {milestone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* ── END MILESTONE DROPDOWN ── */}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status">Task Status</Label>
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
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="WIP">WIP</SelectItem>
                          <SelectItem value="QC">QC</SelectItem>
                          <SelectItem value="Under Review">
                            Under Review
                          </SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="Re Open">Re Open</SelectItem>
                          <SelectItem value="Hold">Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          handleSelectChange("priority", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="taskType">Task Type</Label>
                      <Select
                        value={formData.taskType}
                        onValueChange={(value) =>
                          handleSelectChange("taskType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Functional">Functional</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="taskNature">Task Nature</Label>
                      <Select
                        value={formData.taskNature}
                        onValueChange={(value) =>
                          handleSelectChange("taskNature", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select task nature" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Configuration">
                            Configuration
                          </SelectItem>
                          <SelectItem value="CSV Upload">CSV Upload</SelectItem>
                          <SelectItem value="Saved Search">
                            Saved Search
                          </SelectItem>
                          <SelectItem value="Customization">
                            Customization
                          </SelectItem>
                          <SelectItem value="Training">Training</SelectItem>
                          <SelectItem value="Layout">Layout</SelectItem>
                          <SelectItem value="SQL Report">SQL Report</SelectItem>
                          <SelectItem value="Development">
                            Development
                          </SelectItem>
                          <SelectItem value="API Development">
                            API Development
                          </SelectItem>
                          <SelectItem value="Integration">
                            Integration
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="planDate">Plan Date</Label>
                      <Input
                        id="planDate"
                        name="planDate"
                        type="date"
                        value={formData.planDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="actualDate">Actual Date</Label>
                      <Input
                        id="actualDate"
                        name="actualDate"
                        type="date"
                        value={formData.actualDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="estimatedHours">Estimated Hours</Label>
                      <Input
                        id="estimatedHours"
                        name="estimatedHours"
                        type="number"
                        value={formData.estimatedHours}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="totalHours">Total Hours</Label>
                      <Input
                        id="totalHours"
                        name="totalHours"
                        type="number"
                        value={formData.totalHours}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="billable"
                      checked={formData.billable}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("billable", checked)
                      }
                    />
                    <Label htmlFor="billable">Billable</Label>
                  </div>
                </TabsContent>

                <TabsContent value="assignment" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    {formData.taskType === "Functional" ? (
                      <div className="grid gap-2">
                        <Label htmlFor="functionalConsultant">
                          Functional Consultant
                        </Label>
                        <Select
                          value={formData.functionalConsultant}
                          onValueChange={(value) =>
                            handleSelectChange("functionalConsultant", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a consultant" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {consultants
                              .filter(
                                (consultant) =>
                                  consultant.designation?.includes(
                                    "Functional"
                                  ) || !consultant.designation
                              )
                              .map((consultant) => (
                                <SelectItem
                                  key={consultant._id}
                                  value={consultant._id}
                                >
                                  {consultant.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : formData.taskType === "Technical" ? (
                      <div className="grid gap-2">
                        <Label htmlFor="technicalConsultant">
                          Technical Consultant
                        </Label>
                        <Select
                          value={formData.technicalConsultant}
                          onValueChange={(value) =>
                            handleSelectChange("technicalConsultant", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a consultant" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {consultants
                              .filter(
                                (consultant) =>
                                  consultant.designation?.includes(
                                    "Technical"
                                  ) || !consultant.designation
                              )
                              .map((consultant) => (
                                <SelectItem
                                  key={consultant._id}
                                  value={consultant._id}
                                >
                                  {consultant.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Please select a task type to see assignment options
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="attachments" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Manage attachments for this task.
                    </p>
                    <div className="grid gap-4">
                      {formData.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-slate-500" />
                            </div>
                            <span className="text-sm">{attachment}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              const newAttachments = [...formData.attachments];
                              newAttachments.splice(index, 1);
                              setFormData((prev) => ({
                                ...prev,
                                attachments: newAttachments,
                              }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="relative">
                        <Input
                          type="file"
                          id={`attachment`}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                          onChange={handleFileChange}
                        />
                        <div className="border border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center hover:bg-muted/30 transition-colors">
                          <Plus className="h-6 w-6 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to add a new attachment
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Task Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Make changes to the task details
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="assignment">Assignment</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">Task Name</Label>
                    <Input
                      id="edit-title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Task Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-projectId">Project</Label>
                      <Select
                        value={formData.projectId}
                        onValueChange={(value) =>
                          handleSelectChange("projectId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project._id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* ── MILESTONE DROPDOWN (Edit) ── */}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-milestoneId">Milestone</Label>
                      <Select
                        value={formData.milestoneId}
                        onValueChange={(value) =>
                          handleSelectChange("milestoneId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a milestone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {milestones.map((milestone) => (
                            <SelectItem
                              key={milestone._id}
                              value={milestone._id}
                            >
                              {milestone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* ── END MILESTONE DROPDOWN ── */}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Task Status</Label>
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
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="WIP">WIP</SelectItem>
                          <SelectItem value="QC">QC</SelectItem>
                          <SelectItem value="Under Review">
                            Under Review
                          </SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="Re Open">Re Open</SelectItem>
                          <SelectItem value="Hold">Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          handleSelectChange("priority", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-taskType">Task Type</Label>
                      <Select
                        value={formData.taskType}
                        onValueChange={(value) =>
                          handleSelectChange("taskType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Functional">Functional</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-taskNature">Task Nature</Label>
                      <Select
                        value={formData.taskNature}
                        onValueChange={(value) =>
                          handleSelectChange("taskNature", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select task nature" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Configuration">
                            Configuration
                          </SelectItem>
                          <SelectItem value="CSV Upload">CSV Upload</SelectItem>
                          <SelectItem value="Saved Search">
                            Saved Search
                          </SelectItem>
                          <SelectItem value="Customization">
                            Customization
                          </SelectItem>
                          <SelectItem value="Training">Training</SelectItem>
                          <SelectItem value="Layout">Layout</SelectItem>
                          <SelectItem value="SQL Report">SQL Report</SelectItem>
                          <SelectItem value="Development">
                            Development
                          </SelectItem>
                          <SelectItem value="API Development">
                            API Development
                          </SelectItem>
                          <SelectItem value="Integration">
                            Integration
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-startDate">Start Date</Label>
                      <Input
                        id="edit-startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-endDate">End Date</Label>
                      <Input
                        id="edit-endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-planDate">Plan Date</Label>
                      <Input
                        id="edit-planDate"
                        name="planDate"
                        type="date"
                        value={formData.planDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-actualDate">Actual Date</Label>
                      <Input
                        id="edit-actualDate"
                        name="actualDate"
                        type="date"
                        value={formData.actualDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-estimatedHours">
                        Estimated Hours
                      </Label>
                      <Input
                        id="edit-estimatedHours"
                        name="estimatedHours"
                        type="number"
                        value={formData.estimatedHours}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-totalHours">Total Hours</Label>
                      <Input
                        id="edit-totalHours"
                        name="totalHours"
                        type="number"
                        value={formData.totalHours}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-billable"
                      checked={formData.billable}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("billable", checked)
                      }
                    />
                    <Label htmlFor="edit-billable">Billable</Label>
                  </div>
                </TabsContent>

                <TabsContent value="assignment" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    {formData.taskType === "Functional" ? (
                      <div className="grid gap-2">
                        <Label htmlFor="edit-functionalConsultant">
                          Functional Consultant
                        </Label>
                        <Select
                          value={formData.functionalConsultant}
                          onValueChange={(value) =>
                            handleSelectChange("functionalConsultant", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a consultant" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {consultants
                              .filter(
                                (consultant) =>
                                  consultant.designation?.includes(
                                    "Functional"
                                  ) || !consultant.designation
                              )
                              .map((consultant) => (
                                <SelectItem
                                  key={consultant._id}
                                  value={consultant._id}
                                >
                                  {consultant.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : formData.taskType === "Technical" ? (
                      <div className="grid gap-2">
                        <Label htmlFor="edit-technicalConsultant">
                          Technical Consultant
                        </Label>
                        <Select
                          value={formData.technicalConsultant}
                          onValueChange={(value) =>
                            handleSelectChange("technicalConsultant", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a consultant" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {consultants
                              .filter(
                                (consultant) =>
                                  consultant.designation?.includes(
                                    "Technical"
                                  ) || !consultant.designation
                              )
                              .map((consultant) => (
                                <SelectItem
                                  key={consultant._id}
                                  value={consultant._id}
                                >
                                  {consultant.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Please select a task type to see assignment options
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Manage attachments for this task.
                    </p>
                    <div className="grid gap-4">
                      {formData.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-slate-500" />
                            </div>
                            <span className="text-sm">{attachment}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              const newAttachments = [...formData.attachments];
                              newAttachments.splice(index, 1);
                              setFormData((prev) => ({
                                ...prev,
                                attachments: newAttachments,
                              }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="relative">
                        <Input
                          type="file"
                          id={`edit-attachment`}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                          onChange={handleFileChange}
                        />
                        <div className="border border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center hover:bg-muted/30 transition-colors">
                          <Plus className="h-6 w-6 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to add a new attachment
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditTask} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
