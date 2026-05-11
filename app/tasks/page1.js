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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Check,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toastMessages, getStatusColor, getPriorityColor } from "@/lib/utils";
import api from "@/config/api";

export default function TasksPage() {
  const { user, hasPermission } = useAuth();
  const { getItems, createItem, updateItem, deleteItem, getItemById } =
    useData();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
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
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isSuccess, setSuccess] = useState(false);

  // const tasks = getItems("tasks");
  // const projects = getItems("projects");
  // const users = getItems("users");
  const consultants = users.filter((u) => u.role === "team_member");

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
    console.log(user);
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

  // Get unique task types and natures for filters
  const taskTypes = [
    ...new Set(tasks.map((task) => task.taskType).filter(Boolean)),
  ];
  const taskNatures = [
    ...new Set(tasks.map((task) => task.taskNature).filter(Boolean)),
  ];

  // Filter and sort tasks
  useEffect(() => {
    let result = [...tasks];

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

    setFilteredTasks(result);
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
    });
    setCurrentTask(null);
    setUploadStatuses(Array(5).fill(null));
  };

  const handleCreateTask = async () => {
    try {
      setLoading(true);
      // createItem("tasks", {
      //   ...formData,
      //   createdBy: user.id,
      //   createdAt: new Date().toISOString(),
      // });
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
      // updateItem("tasks", currentTask.id, {
      //   ...formData,
      //   updatedAt: new Date().toISOString(),
      // });
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
      // const task = getItemById("tasks", id);
      //deleteItem("tasks", id);
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
    //const task = getItemById("tasks", id);
    setCurrentTask(task);
    setFormData({
      taskId: task.taskId || "",
      title: task.title || "",
      description: task.description || "",
      projectId: task.projectId || "",
      reportedDate: task.reportedDate || "",
      startDate: task.startDate || "",
      endDate: task.endDate || "",
      status: task.status || "todo",
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
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (task) => {
    // const task = getItemById("tasks", id);
    setCurrentTask(task);
    setIsViewDialogOpen(true);
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

  const [uploadStatuses, setUploadStatuses] = useState(Array(5).fill(null));

  // const handleFileChange = async(index, e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const newAttachments = [...(formData.attachments || [])];
  //   newAttachments[index] = file;
  //   setFormData((prev) => ({ ...prev, attachments: newAttachments }));

  //   setUploadStatuses((prev) => {
  //     const newStatuses = [...prev];
  //     newStatuses[index] = "success";
  //     return newStatuses;
  //   });
  // };

  const handleFileChange = async (index, e) => {
    const file = e.target.files[0];
    const fileName = e.target.files[0].name;
    const timestamp = new Date().getTime();
    // const uniqueFileName = `${timestamp}-${fileName}`;
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
        setFormData((prev) => {
          const updatedAttachments = [...(prev.attachments || [])];
          updatedAttachments[index] = response.data.file;
          const limitedAttachments = updatedAttachments.slice(0, 5);
          return {
            ...prev,
            attachments: limitedAttachments,
          };
        });
      } catch (err) {
        console.log(err);
      }
    };
    reader.readAsDataURL(file);
  };

  console.log(formData);

  const getProject = (projectId) => {
    const project = projects.find((project) => project._id === projectId);
    return project;
  };

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
                {projects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
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

            <div className="ml-auto text-sm text-muted-foreground">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>

          {/* Tasks Table */}
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
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center">
                      Priority
                      {sortField === "priority" ? (
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
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
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
                  filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/50">
                      <TableCell>{task.taskId || "-"}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{task.title}</span>
                          {task.taskType && (
                            <span className="text-xs text-muted-foreground">
                              {task.taskType} - {task.taskNature}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.projectId
                          ? getProject(task.projectId)?.name || "Unassigned"
                          : "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status
                            ?.replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                            "To Do"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority?.charAt(0).toUpperCase() +
                            task.priority?.slice(1) || "Medium"}
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
                              onClick={() => openViewDialog(task)}
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {(canEdit ||
                              (canUpdateStatus &&
                                task.assigneeId === user._id)) && (
                              <DropdownMenuItem
                                onClick={() => openEditDialog(task)}
                                className="flex items-center"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteTask(task)}
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
                            <SelectItem key={project._id} value={project._id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="flex items-center space-x-2 self-end">
                      <Checkbox
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("active", checked)
                        }
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
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
                      Add up to 5 attachments for this task.
                    </p>
                    <div className="grid gap-4">
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1 relative">
                            <Input
                              type="file"
                              id={`attachment-${index}`}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                              onChange={(e) => handleFileChange(index, e)}
                            />
                            <div className="border border-input rounded-md px-3 py-2 flex items-center justify-between bg-background hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="rounded-full bg-primary/10 p-1">
                                  <Plus className="h-3 w-3 text-primary" />
                                </div>
                                <span>
                                  {formData.attachments[index] ||
                                    "Choose a file"}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Browse
                              </span>
                            </div>
                          </div>
                          {/* {uploadStatuses[index] === "success" && (
                            <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md">
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">
                                Uploaded
                              </span>
                            </div>
                          )} */}
                        </div>
                      ))}
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
                            <SelectItem key={project._id} value={project._id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="flex items-center space-x-2 self-end">
                      <Checkbox
                        id="edit-active"
                        checked={formData.active}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("active", checked)
                        }
                      />
                      <Label htmlFor="edit-active">Active</Label>
                    </div>
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
                      Add up to 5 attachments for this task.
                    </p>
                    <div className="grid gap-4">
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1 relative">
                            <Input
                              type="file"
                              id={`edit-attachment-${index}`}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                              onChange={(e) => handleFileChange(index, e)}
                            />
                            <div className="border border-input rounded-md px-3 py-2 flex items-center justify-between bg-background hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="rounded-full bg-primary/10 p-1">
                                  <Plus className="h-3 w-3 text-primary" />
                                </div>
                                <span>
                                  {formData.attachments[index] ||
                                    "Choose a file"}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Browse
                              </span>
                            </div>
                          </div>
                          {uploadStatuses[index] === "success" && (
                            <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md">
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">
                                Uploaded
                              </span>
                            </div>
                          )}
                          {formData.attachments[index] &&
                            !uploadStatuses[index] && (
                              <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                <span className="text-xs font-medium">
                                  {formData.attachments[index]}
                                </span>
                              </div>
                            )}
                        </div>
                      ))}
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

          {/* View Task Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              {currentTask && (
                <>
                  <DialogHeader>
                    <DialogTitle>{currentTask.title}</DialogTitle>
                    <DialogDescription>
                      {currentTask.taskType} - {currentTask.taskNature}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Status
                        </h3>
                        <div className="mt-1">
                          <Badge className={getStatusColor(currentTask.status)}>
                            {currentTask.status
                              ?.replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                              "To Do"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Priority
                        </h3>
                        <div className="mt-1">
                          <Badge
                            className={getPriorityColor(currentTask.priority)}
                          >
                            {currentTask.priority?.charAt(0).toUpperCase() +
                              currentTask.priority?.slice(1) || "Medium"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Description
                      </h3>
                      <p className="mt-1">
                        {currentTask.description || "No description provided."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Project
                        </h3>
                        <p className="mt-1">
                          {currentTask.projectId
                            ? getProject(currentTask.projectId)?.name ||
                              "Unassigned"
                            : "Unassigned"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Billable
                        </h3>
                        <p className="mt-1">
                          {currentTask.billable ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Start Date
                        </h3>
                        <p className="mt-1">
                          {currentTask.startDate || "Not set"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          End Date
                        </h3>
                        <p className="mt-1">
                          {currentTask.endDate || "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Estimated Hours
                        </h3>
                        <p className="mt-1">
                          {currentTask.estimatedHours || "0"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Total Hours
                        </h3>
                        <p className="mt-1">{currentTask.totalHours || "0"}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Assignment
                      </h3>
                      <div className="mt-1">
                        {currentTask.taskType === "Functional" ? (
                          <p>
                            Functional Consultant:{" "}
                            {currentTask.functionalConsultant
                              ? getItemById(
                                  "users",
                                  Number.parseInt(
                                    currentTask.functionalConsultant
                                  )
                                )?.name || "Unassigned"
                              : "Unassigned"}
                          </p>
                        ) : currentTask.taskType === "Technical" ? (
                          <p>
                            Technical Consultant:{" "}
                            {currentTask.technicalConsultant
                              ? getItemById(
                                  "users",
                                  Number.parseInt(
                                    currentTask.technicalConsultant
                                  )
                                )?.name || "Unassigned"
                              : "Unassigned"}
                          </p>
                        ) : (
                          <p>No assignment</p>
                        )}
                      </div>
                    </div>

                    {currentTask.attachments &&
                      currentTask.attachments.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Attachments
                          </h3>
                          <ul className="mt-1 space-y-1">
                            {currentTask.attachments.map(
                              (attachment, index) =>
                                attachment && (
                                  <li key={index} className="text-sm">
                                    {attachment}
                                  </li>
                                )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                  <DialogFooter>
                    {(canEdit ||
                      (canUpdateStatus &&
                        currentTask.assigneeId === user.id.toString())) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          openEditDialog(currentTask);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Task
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
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
