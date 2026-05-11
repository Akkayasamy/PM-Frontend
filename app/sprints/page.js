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
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  Search,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import api from "@/config/api";

// Initial sprint data
const initialData = {
  project: "Website Redesign",
  sprints: [
    {
      sprint_id: "SPR-001",
      name: "Sprint 1",
      goal: "Implement homepage UI and user login",
      start_date: "2025-05-01",
      end_date: "2025-05-15",
      status: "active",
      tasks: [
        {
          _id: "TASK-001",
          title: "Design homepage layout",
          assignee: "Alice",
          status: "done",
          story_points: 3,
        },
        {
          _id: "TASK-002",
          title: "Implement login functionality",
          assignee: "Bob",
          status: "in_progress",
          story_points: 5,
        },
        {
          _id: "TASK-003",
          title: "Set up backend authentication",
          assignee: "Charlie",
          status: "to_do",
          story_points: 5,
        },
      ],
      retrospective_notes: "",
    },
    {
      sprint_id: "SPR-002",
      name: "Sprint 2",
      goal: "Add profile management and optimize performance",
      start_date: "2025-05-16",
      end_date: "2025-05-30",
      status: "planned",
      tasks: [],
      retrospective_notes: "",
    },
  ],
};

// Sample existing tasks that can be added to sprints
const existingTasks = [
  {
    _id: "TASK-101",
    title: "Create user profile page",
    assignee: "Alice",
    status: "to_do",
    story_points: 5,
  },
  {
    _id: "TASK-102",
    title: "Implement password reset functionality",
    assignee: "Bob",
    status: "to_do",
    story_points: 3,
  },
  {
    _id: "TASK-103",
    title: "Add email verification",
    assignee: "Charlie",
    status: "to_do",
    story_points: 3,
  },
  {
    _id: "TASK-104",
    title: "Optimize image loading",
    assignee: "Dave",
    status: "to_do",
    story_points: 2,
  },
  {
    _id: "TASK-105",
    title: "Implement dark mode",
    assignee: "Alice",
    status: "to_do",
    story_points: 5,
  },
  {
    _id: "TASK-106",
    title: "Add user settings page",
    assignee: "Bob",
    status: "to_do",
    story_points: 8,
  },
];

const ITEMS_PER_PAGE = 10; // Number of items per page

export default function SprintManagementPage() {
  const { user, hasPermission } = useAuth();
  const { getItems, createItem, updateItem, deleteItem, getItemById } =
    useData();
  const [isCreateSprintDialogOpen, setIsCreateSprintDialogOpen] =
    useState(false);
  const [isEditSprintDialogOpen, setIsEditSprintDialogOpen] = useState(false);
  const [isViewSprintDialogOpen, setIsViewSprintDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [expandedSprints, setExpandedSprints] = useState({});
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [taskSearchTerm, setTaskSearchTerm] = useState("");
  const [filteredTasks, setFilteredTasks] = useState(existingTasks);

  const [currentSprint, setCurrentSprint] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [sprintFormData, setSprintFormData] = useState({
    sprint_id: "",
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "planned",
    retrospective_notes: "",
    projectId: "",
  });

  const [taskFormData, setTaskFormData] = useState({
    _id: "",
    title: "",
    assignee: "",
    status: "to_do",
    story_points: 1,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("start_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "planned", "completed"
  const [filteredSprints, setFilteredSprints] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [projectName, setProjectName] = useState(initialData.project);
  const [projects, setProjects] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get(`sprint`);
        setSprints(response.data.sprints);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [user, isSuccess]);

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
        const response = await api.get(
          `task/project/${sprintFormData.projectId}`
        );
        setAvailableTasks(response.data.tasks);
      } catch (err) {
        console.log(err);
      }
    };
    if (sprintFormData.projectId) {
      loadResponse();
    }
  }, [sprintFormData]);

  // Filter tasks based on search term
  useEffect(() => {
    if (taskSearchTerm.trim() === "") {
      setFilteredTasks(availableTasks);
    } else {
      const filtered = availableTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
          task.taskId.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
          task.assignee.toLowerCase().includes(taskSearchTerm.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [taskSearchTerm, availableTasks]);

  // Filter and sort sprints
  useEffect(() => {
    let result = [...sprints];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (sprint) =>
          sprint.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sprint.sprint_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sprint.goal?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((sprint) => sprint.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date fields
      if (sortField === "start_date" || sortField === "end_date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredSprints(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [sprints, searchTerm, sortField, sortDirection, statusFilter]);

  // Update available tasks by removing tasks that are already in any sprint
  // useEffect(() => {
  //   const allSprintTaskIds = new Set();
  //   sprints.forEach((sprint) => {
  //     sprint.tasks.forEach((task) => {
  //       allSprintTaskIds.add(task._id);
  //     });
  //   });

  //   const available = existingTasks.filter(
  //     (task) => !allSprintTaskIds.has(task._id)
  //   );
  //   setAvailableTasks(available);
  // }, [sprints]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSprintFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setSprintFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskSelectChange = (name, value) => {
    setTaskFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetSprintForm = () => {
    setSprintFormData({
      sprint_id: `SPR-${String(sprints.length + 1).padStart(3, "0")}`,
      name: "",
      goal: "",
      start_date: "",
      end_date: "",
      status: "planned",
      retrospective_notes: "",
      projectId: "",
    });
    setCurrentSprint(null);
  };

  const resetTaskForm = () => {
    setTaskFormData({
      _id: "",
      title: "",
      assignee: "",
      status: "to_do",
      story_points: 1,
    });
    setCurrentTask(null);
    setSelectedTaskIds([]);
    setTaskSearchTerm("");
  };

  // Inside the SprintManagementPage component, add this line near the top
  const { toast } = useToast();

  // Create a new sprint
  const handleCreateSprint = async () => {
    try {
      // const newSprint = {
      //   ...sprintFormData,
      //   sprint_id: `SPR-${String(sprints.length + 1).padStart(3, "0")}`,
      //   tasks: [],
      // };

      // const updatedSprints = [...sprints, newSprint];
      // setSprints(updatedSprints);
      const response = await api.post("sprint", sprintFormData);
      setSuccess(response);

      toast({
        title: "Sprint created",
        description: `Sprint "${sprintFormData.name}" has been created successfully.`,
      });

      setIsCreateSprintDialogOpen(false);
      resetSprintForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sprint. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update a sprint
  const handleEditSprint = async () => {
    try {
      // const updatedSprints = sprints.map((sprint) =>
      //   sprint.sprint_id === currentSprint.sprint_id
      //     ? { ...sprintFormData, tasks: sprint.tasks }
      //     : sprint
      // );
      const response = await api.put("sprint", sprintFormData);
      setSuccess(response);

      toast({
        title: "Sprint updated",
        description: `Sprint "${sprintFormData.name}" has been updated successfully.`,
      });

      setIsEditSprintDialogOpen(false);
      resetSprintForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sprint. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete a sprint
  const handleDeleteSprint = async (sprintId) => {
    try {
      // const sprintToDelete = sprints.find(
      //   (sprint) => sprint.sprint_id === sprintId
      // );
      // const updatedSprints = sprints.filter(
      //   (sprint) => sprint.sprint_id !== sprintId
      // );

      // setSprints(updatedSprints);
      const response = await api.delete(`sprint/${sprintId}`);
      setSuccess(response);

      toast({
        title: "Sprint deleted",
        description: `Sprint "${sprintId}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sprint. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = async () => {
    try {
      const sprintTasks = availableTasks.filter((atask) => {
        return selectedTaskIds.some((stask) => stask === atask._id);
      });
      const response = await api.post("sprint/task", {
        tasks: sprintTasks,
        sprint_id: currentSprint.sprint_id,
      });
      setSuccess(response);

      // Ensure selectedTaskIds is an array
      // const taskIdsArray = Array.isArray(selectedTaskIds)
      //   ? selectedTaskIds
      //   : [selectedTaskIds].filter(Boolean);

      // if (taskIdsArray.length === 0) {
      //   toast({
      //     title: "Error",
      //     description: "Please select at least one task to add.",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      // const tasksToAdd = availableTasks.filter((task) =>
      //   taskIdsArray.includes(task._id)
      // );

      // if (tasksToAdd.length === 0) {
      //   toast({
      //     title: "Error",
      //     description: "Selected tasks not found.",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      // const updatedSprints = sprints.map((sprint) =>
      //   sprint.sprint_id === currentSprint.sprint_id
      //     ? { ...sprint, tasks: [...sprint.tasks, ...tasksToAdd] }
      //     : sprint
      // );

      // setSprints(updatedSprints);

      toast({
        title: "Tasks added",
        description: `${tasksToAdd.length} task(s) added to sprint "${currentSprint.name}".`,
      });

      setIsAddTaskDialogOpen(false);
      resetTaskForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Create a new task
  const handleCreateTask = () => {
    try {
      const newTask = {
        ...taskFormData,
        _id: `TASK-${String(currentSprint.tasks.length + 1).padStart(3, "0")}`,
      };

      const updatedSprints = sprints.map((sprint) =>
        sprint.sprint_id === currentSprint.sprint_id
          ? { ...sprint, tasks: [...sprint.tasks, newTask] }
          : sprint
      );

      setSprints(updatedSprints);

      toast({
        title: "Task created",
        description: `Task "${newTask.title}" has been created successfully.`,
      });

      setIsCreateTaskDialogOpen(false);
      resetTaskForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update a task
  const handleEditTask = () => {
    try {
      const updatedSprints = sprints.map((sprint) =>
        sprint.sprint_id === currentSprint.sprint_id
          ? {
              ...sprint,
              tasks: sprint.tasks.map((task) =>
                task._id === currentTask._id ? taskFormData : task
              ),
            }
          : sprint
      );

      setSprints(updatedSprints);

      toast({
        title: "Task updated",
        description: `Task "${taskFormData.title}" has been updated successfully.`,
      });

      setIsEditTaskDialogOpen(false);
      resetTaskForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete a task
  const handleDeleteTask = (sprintId, taskId) => {
    try {
      const sprint = sprints.find((s) => s.sprint_id === sprintId);
      const taskToDelete = sprint.tasks.find((t) => t._id === taskId);

      const updatedSprints = sprints.map((sprint) =>
        sprint.sprint_id === sprintId
          ? {
              ...sprint,
              tasks: sprint.tasks.filter((task) => task._id !== taskId),
            }
          : sprint
      );

      setSprints(updatedSprints);

      toast({
        title: "Task deleted",
        description: `Task "${taskToDelete.title}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditSprintDialog = (sprint) => {
    setCurrentSprint(sprint);
    setSprintFormData({
      sprint_id: sprint.sprint_id,
      name: sprint.name || "",
      goal: sprint.goal || "",
      start_date: sprint.start_date || "",
      end_date: sprint.end_date || "",
      status: sprint.status || "planned",
      retrospective_notes: sprint.retrospective_notes || "",
    });
    setIsEditSprintDialogOpen(true);
  };

  const openViewSprintDialog = (sprint) => {
    setCurrentSprint(sprint);
    setIsViewSprintDialogOpen(true);
  };

  const openAddTaskDialog = (sprint) => {
    setCurrentSprint(sprint);
    resetTaskForm();
    setIsAddTaskDialogOpen(true);
  };

  const openCreateTaskDialog = (sprint) => {
    setCurrentSprint(sprint);
    setTaskFormData({
      _id: `TASK-${String(sprint.tasks.length + 1).padStart(3, "0")}`,
      title: "",
      assignee: "",
      status: "to_do",
      story_points: 1,
    });
    setIsCreateTaskDialogOpen(true);
  };

  const openEditTaskDialog = (sprint, task) => {
    setCurrentSprint(sprint);
    setCurrentTask(task);
    setTaskFormData({
      _id: task._id,
      title: task.title || "",
      assignee: task.assignee || "",
      status: task.status || "to_do",
      story_points: task.story_points || 1,
    });
    setIsEditTaskDialogOpen(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Toggle sprint expansion
  const toggleSprintExpansion = (sprintId) => {
    setExpandedSprints((prev) => ({
      ...prev,
      [sprintId]: !prev[sprintId],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Pagination
  const totalPages = Math.ceil(filteredSprints.length / ITEMS_PER_PAGE);
  const paginatedSprints = filteredSprints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get status color
  const getSprintStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "planned":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Get task status color
  const getTaskStatusColor = (status) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "to_do":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Calculate sprint progress
  const getSprintProgress = (sprint) => {
    if (!sprint.tasks || sprint.tasks.length === 0) return 0;

    const completedTasks = sprint.tasks.filter(
      (task) => task.status === "done"
    );
    return Math.round((completedTasks.length / sprint.tasks.length) * 100);
  };

  // Calculate total story points
  const calculateTotalStoryPoints = (sprint) => {
    if (!sprint.tasks || sprint.tasks.length === 0) return 0;
    return sprint.tasks.reduce((total, task) => total + task.story_points, 0);
  };

  // Calculate completed story points
  const calculateCompletedStoryPoints = (sprint) => {
    if (!sprint.tasks || sprint.tasks.length === 0) return 0;
    return sprint.tasks
      .filter((task) => task.status === "done")
      .reduce((total, task) => total + task.story_points, 0);
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

  const canCreate = hasPermission ? hasPermission("create_sprints") : true;
  const canEdit = hasPermission ? hasPermission("edit_sprints") : true;
  const canDelete = hasPermission ? hasPermission("delete_sprints") : true;

  return (
    <ProtectedRoute requiredPermission="view_sprints">
      <DashboardShell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Sprint Management
              </h1>
              <p className="text-muted-foreground">
                Manage your sprints and tasks for {projectName}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search sprints..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {canCreate && (
                <>
                  <Button
                    onClick={() => {
                      resetSprintForm();
                      setIsCreateSprintDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sprint
                  </Button>
                </>
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
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== "all" || searchTerm) && (
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
              Showing {filteredSprints.length} of {sprints.length} sprints
            </div>
          </div>

          {/* Sprints List */}
          <div className="space-y-4">
            {paginatedSprints.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">
                      No sprints found.{" "}
                      {canCreate && "Create your first sprint!"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              paginatedSprints.map((sprint) => (
                <Card key={sprint.sprint_id} className="overflow-hidden">
                  <Collapsible
                    open={expandedSprints[sprint.sprint_id]}
                    onOpenChange={() => toggleSprintExpansion(sprint.sprint_id)}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => toggleSprintExpansion(sprint.sprint_id)}
                    >
                      <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-8 w-8"
                          >
                            {expandedSprints[sprint.sprint_id] ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{sprint.name}</h3>
                            <Badge variant="outline">{sprint.sprint_id}</Badge>
                            <Badge
                              className={getSprintStatusColor(sprint.status)}
                            >
                              {sprint.status.charAt(0).toUpperCase() +
                                sprint.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {sprint.goal}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-right">
                          <div className="font-medium">
                            {formatDate(sprint.start_date)} -{" "}
                            {formatDate(sprint.end_date)}
                          </div>
                          <div className="text-muted-foreground">
                            {calculateDuration(
                              sprint.start_date,
                              sprint.end_date
                            )}
                          </div>
                        </div>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                openAddTaskDialog(sprint);
                              }}
                              className="flex items-center"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canEdit && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditSprintDialog(sprint);
                                }}
                                className="flex items-center"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSprint(sprint.sprint_id);
                                }}
                                className="text-red-600 flex items-center"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4">
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium">Progress</div>
                            <div className="text-sm">
                              {getSprintProgress(sprint)}%
                            </div>
                          </div>
                          <Progress
                            value={getSprintProgress(sprint)}
                            className="h-2"
                          />
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="font-medium">Tasks:</span>{" "}
                              {sprint.tasks.length}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Story Points:</span>{" "}
                              {calculateCompletedStoryPoints(sprint)}/
                              {calculateTotalStoryPoints(sprint)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openAddTaskDialog(sprint)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                          </Button>
                        </div>

                        {sprint.tasks.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            No tasks in this sprint. Add your first task!
                          </div>
                        ) : (
                          <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
                            <Table>
                              <TableHeader className="bg-muted/50">
                                <TableRow>
                                  <TableHead>ID</TableHead>
                                  <TableHead>Title</TableHead>
                                  <TableHead>Assignee</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Points</TableHead>
                                  <TableHead className="w-[100px]">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sprint.tasks.map((task) => (
                                  <TableRow
                                    key={task._id}
                                    className="hover:bg-muted/50"
                                  >
                                    <TableCell>{task.taskId}</TableCell>
                                    <TableCell className="font-medium">
                                      {task.title}
                                    </TableCell>
                                    <TableCell>{task.assignee}</TableCell>
                                    <TableCell>
                                      <Badge
                                        className={getTaskStatusColor(
                                          task?.status
                                        )}
                                      >
                                        {task?.status
                                          ?.replace("_", " ")
                                          .replace(/\b\w/g, (l) =>
                                            l.toUpperCase()
                                          )}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{task.story_points}</TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                          >
                                            <span className="sr-only">
                                              Open menu
                                            </span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>
                                            Actions
                                          </DropdownMenuLabel>
                                          {canEdit && (
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openEditTaskDialog(
                                                  sprint,
                                                  task
                                                );
                                              }}
                                              className="flex items-center"
                                            >
                                              <Pencil className="mr-2 h-4 w-4" />
                                              Edit
                                            </DropdownMenuItem>
                                          )}
                                          {canDelete && (
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTask(
                                                  sprint.sprint_id,
                                                  task._id
                                                );
                                              }}
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
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
          )}

          {/* Create Sprint Dialog */}
          <Dialog
            open={isCreateSprintDialogOpen}
            onOpenChange={setIsCreateSprintDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Sprint</DialogTitle>
                <DialogDescription>
                  Add a new sprint to your project
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Sprint Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={sprintFormData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal">Sprint Goal</Label>
                  <Textarea
                    id="goal"
                    name="goal"
                    value={sprintFormData.goal}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={sprintFormData.start_date}
                      onChange={handleInputChange}
                      max={sprintFormData.end_date}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="end_date">End Date</Label>
                      {sprintFormData.start_date && sprintFormData.end_date && (
                        <Badge variant="outline" className="ml-2">
                          {calculateDuration(
                            sprintFormData.start_date,
                            sprintFormData.end_date
                          )}
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={sprintFormData.end_date}
                      onChange={handleInputChange}
                      min={sprintFormData.start_date}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={sprintFormData.projectId}
                    onValueChange={(value) =>
                      handleSelectChange("projectId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateSprintDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateSprint}>Create Sprint</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Sprint Dialog */}
          <Dialog
            open={isEditSprintDialogOpen}
            onOpenChange={setIsEditSprintDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Sprint</DialogTitle>
                <DialogDescription>
                  Make changes to the sprint details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sprint_id">Sprint ID</Label>
                    <Input
                      id="sprint_id"
                      name="sprint_id"
                      value={sprintFormData.sprint_id}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Sprint Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={sprintFormData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal">Sprint Goal</Label>
                  <Textarea
                    id="goal"
                    name="goal"
                    value={sprintFormData.goal}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={sprintFormData.start_date}
                      onChange={handleInputChange}
                      max={sprintFormData.end_date}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="end_date">End Date</Label>
                      {sprintFormData.start_date && sprintFormData.end_date && (
                        <Badge variant="outline" className="ml-2">
                          {calculateDuration(
                            sprintFormData.start_date,
                            sprintFormData.end_date
                          )}
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={sprintFormData.end_date}
                      onChange={handleInputChange}
                      min={sprintFormData.start_date}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={sprintFormData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* <div className="grid gap-2">
                  <Label htmlFor="retrospective_notes">
                    Retrospective Notes
                  </Label>
                  <Textarea
                    id="retrospective_notes"
                    name="retrospective_notes"
                    value={sprintFormData.retrospective_notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add retrospective notes here..."
                  />
                </div> */}
              </div>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditSprintDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditSprint}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Sprint Dialog */}
          <Dialog
            open={isViewSprintDialogOpen}
            onOpenChange={setIsViewSprintDialogOpen}
          >
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              {currentSprint && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {currentSprint.name}
                    </DialogTitle>
                    <DialogDescription>
                      Sprint ID: {currentSprint.sprint_id || "N/A"}
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Goal
                        </h3>
                        <p className="mt-1">
                          {currentSprint.goal || "No goal specified."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Status
                          </h3>
                          <div className="mt-1">
                            <Badge
                              className={getSprintStatusColor(
                                currentSprint.status
                              )}
                            >
                              {currentSprint.status.charAt(0).toUpperCase() +
                                currentSprint.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Duration
                          </h3>
                          <p className="mt-1">
                            {calculateDuration(
                              currentSprint.start_date,
                              currentSprint.end_date
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Start Date
                          </h3>
                          <p className="mt-1">
                            {currentSprint.start_date
                              ? formatDate(currentSprint.start_date)
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            End Date
                          </h3>
                          <p className="mt-1">
                            {currentSprint.end_date
                              ? formatDate(currentSprint.end_date)
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Progress
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress
                            value={getSprintProgress(currentSprint)}
                            className="h-2 w-full"
                          />
                          <span className="text-xs">
                            {getSprintProgress(currentSprint)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Story Points
                        </h3>
                        <p className="mt-1">
                          {calculateCompletedStoryPoints(currentSprint)}/
                          {calculateTotalStoryPoints(currentSprint)} completed
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Retrospective Notes
                        </h3>
                        <p className="mt-1 whitespace-pre-line">
                          {currentSprint.retrospective_notes ||
                            "No retrospective notes yet."}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="tasks" className="space-y-4 mt-4">
                      {currentSprint.tasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No tasks in this sprint.
                        </div>
                      ) : (
                        <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Points</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentSprint.tasks.map((task) => (
                                <TableRow
                                  key={task._id}
                                  className="hover:bg-muted/50"
                                >
                                  <TableCell>{task._id}</TableCell>
                                  <TableCell className="font-medium">
                                    {task.title}
                                  </TableCell>
                                  <TableCell>{task.assignee}</TableCell>
                                  <TableCell>
                                    <Badge
                                      className={getTaskStatusColor(
                                        task.status
                                      )}
                                    >
                                      {task.status
                                        .replace("_", " ")
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{task.story_points}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    {canEdit && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsViewSprintDialogOpen(false);
                          openEditSprintDialog(currentSprint);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Sprint
                      </Button>
                    )}
                    <Button onClick={() => setIsViewSprintDialogOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Task Dialog (with multi-select checkboxes) */}
          <Dialog
            open={isAddTaskDialogOpen}
            onOpenChange={setIsAddTaskDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Tasks to {currentSprint?.name}</DialogTitle>
                <DialogDescription>
                  Select existing tasks to add to this sprint
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div className="grid gap-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    //value={sprintFormData.status}
                    onValueChange={(value) =>
                      handleSelectChange("projectId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((project) => {
                        return (
                          <SelectItem value={project._id}>
                            {project.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {availableTasks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No available tasks. All tasks are already assigned to
                    sprints.
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <div className="max-h-[300px] overflow-y-auto">
                      {availableTasks.map((task) => (
                        <div
                          key={task._id}
                          className="flex items-center border-b last:border-b-0 p-3 hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedTaskIds((prev) => {
                              const prevArray = Array.isArray(prev)
                                ? prev
                                : [prev].filter(Boolean);
                              if (prevArray.includes(task._id)) {
                                return prevArray.filter(
                                  (id) => id !== task._id
                                );
                              } else {
                                return [...prevArray, task._id];
                              }
                            });
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`task-${task._id}`}
                            checked={
                              Array.isArray(selectedTaskIds)
                                ? selectedTaskIds.includes(task._id)
                                : selectedTaskIds === task._id
                            }
                            onChange={() => {}} // Handled by the div click
                            className="mr-3"
                          />

                          <div className="flex-1" htmlFor={`task-${task._id}`}>
                            <label className="font-medium cursor-pointer">
                              {task.title}
                            </label>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                              <span>
                                Assignee:{" "}
                                {task.functionalConsultant ||
                                  task.technicalConsultant}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{task.taskId}</Badge>
                                {/* <span>Points: {task.story_points}</span> */}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(selectedTaskIds) &&
                  selectedTaskIds.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">
                        Selected tasks: {selectedTaskIds.length}
                      </h4>
                    </div>
                  )}
              </div>

              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsAddTaskDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTask}
                  disabled={
                    !Array.isArray(selectedTaskIds) ||
                    selectedTaskIds.length === 0
                  }
                >
                  Add{" "}
                  {Array.isArray(selectedTaskIds) && selectedTaskIds.length > 0
                    ? `${selectedTaskIds.length} Task${
                        selectedTaskIds.length > 1 ? "s" : ""
                      }`
                    : "Tasks"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Task Dialog */}
          <Dialog
            open={isEditTaskDialogOpen}
            onOpenChange={setIsEditTaskDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Make changes to the task details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="_id">Task ID</Label>
                    <Input
                      id="_id"
                      name="_id"
                      value={taskFormData._id}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={taskFormData.title}
                      onChange={handleTaskInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    name="assignee"
                    value={taskFormData.assignee}
                    onChange={handleTaskInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={taskFormData.status}
                      onValueChange={(value) =>
                        handleTaskSelectChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="to_do">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="story_points">Story Points</Label>
                    <Select
                      value={taskFormData.story_points.toString()}
                      onValueChange={(value) =>
                        handleTaskSelectChange(
                          "story_points",
                          Number.parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Points" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="13">13</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditTaskDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditTask}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
