"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/dashboard-shell";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  Clock,
  Edit,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  X,
  Paperclip,
  CheckCircle2,
  Circle,
  Clock3,
  AlertTriangle,
  PauseCircle,
  RefreshCcw,
  BarChart,
  ChevronUp,
  Download,
  DownloadIcon,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import api from "@/config/api";

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id;
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();

  // States
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);
  const [isAddCommentDialogOpen, setIsAddCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [subtaskFormData, setSubtaskFormData] = useState({
    title: "",
    description: "",
    status: "Open",
    priority: "medium",
    attachments: [],
  });
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [isViewSubtaskDialogOpen, setIsViewSubtaskDialogOpen] = useState(false);
  const [subtaskCommentText, setSubtaskCommentText] = useState("");

  // Local state for sample data
  const [task, setTask] = useState();
  const [subtasks, setSubtasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isDeleteSubtaskDialogOpen, setIsDeleteSubtaskDialogOpen] =
    useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const [isEditSubtaskDialogOpen, setIsEditSubtaskDialogOpen] = useState(false);
  const [deletingSubtaskId, setDeletingSubtaskId] = useState(null);
  const [comments, setComments] = useState([]);
  const [subtaskComments, setSubtaskComments] = useState([]);
  const [isAddAttachmentDialogOpen, setIsAddAttachmentDialogOpen] =
    useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [
    isAddSubtaskAttachmentDialogOpen,
    setIsAddSubtaskAttachmentDialogOpen,
  ] = useState(false);
  const [selectedSubtaskFile, setSelectedSubtaskFile] = useState(null);
  const [uploadingSubtaskAttachment, setUploadingSubtaskAttachment] =
    useState(false);
  const [isAddSubtaskCommentDialogOpen, setIsAddSubtaskCommentDialogOpen] =
    useState(false);

  const sampleTaskComments = [
    {
      _id: "comment1",
      text: "I've reviewed the requirements and they look good. We should be able to complete this within the estimated timeframe.",
      createdBy: "user1",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      _id: "comment2",
      text: "Just wanted to update that I've started working on the initial setup. The database schema is ready and I'm moving on to the API endpoints.",
      createdBy: "user2",
      createdAt: "2024-01-16T14:20:00Z",
    },
    {
      _id: "comment3",
      text: "Great progress! I've tested the API endpoints and they're working perfectly. Ready to move to the frontend implementation.",
      createdBy: "user3",
      createdAt: "2024-01-17T09:15:00Z",
    },
    {
      _id: "comment4",
      text: "The frontend is coming along nicely. I've implemented the main dashboard and user authentication. Should be ready for review by tomorrow.",
      createdBy: "user1",
      createdAt: "2024-01-18T16:45:00Z",
    },
  ];

  const sampleSubtaskComments = [
    {
      _id: "subcomment1",
      text: "Starting work on the user authentication module. I'll implement JWT tokens for session management.",
      createdBy: "user2",
      createdAt: "2024-01-15T11:00:00Z",
    },
    {
      _id: "subcomment2",
      text: "Authentication is working well. I've added password hashing and email verification. Moving on to role-based access control.",
      createdBy: "user2",
      createdAt: "2024-01-16T13:30:00Z",
    },
    {
      _id: "subcomment3",
      text: "Looks good! I've tested the authentication flow and it's working smoothly. The security measures are properly implemented.",
      createdBy: "user3",
      createdAt: "2024-01-17T10:20:00Z",
    },
  ];

  const sampleUsers = [
    {
      _id: "user1",
      name: "John Smith",
      role: "team_member",
      designation: "Technical Lead",
    },
    {
      _id: "user2",
      name: "Sarah Johnson",
      role: "team_member",
      designation: "Full Stack Developer",
    },
    {
      _id: "user3",
      name: "Mike Chen",
      role: "team_member",
      designation: "Frontend Developer",
    },
    {
      _id: "user4",
      name: "Emily Davis",
      role: "team_member",
      designation: "Backend Developer",
    },
  ];

  // useEffect(() => {
  //   const loadComments = async () => {
  //     try {
  //       const response = await api.get(`comments/task/${taskId}`);
  //       setComments(response.data.comments || sampleTaskComments);
  //     } catch (err) {
  //       console.log(err);
  //       // Use sample data if API fails
  //       setComments(sampleTaskComments);
  //     }
  //   };
  //   if (user?._id) {
  //     loadComments();
  //   } else {
  //     // Load sample data immediately if no user
  //     setComments(sampleTaskComments);
  //   }
  // }, [user, taskId, isSuccess]);

  // Load subtask comments when viewing a subtask
  // useEffect(() => {
  //   const loadSubtaskComments = async () => {
  //     if (selectedSubtask?.subTaskId) {
  //       try {
  //         const response = await api.get(
  //           `comments/subtask/${selectedSubtask?.subTaskId}`
  //         );
  //         setSubtaskComments(response.data.comments || []);
  //       } catch (err) {
  //         console.log(err);
  //         // Use sample data if API fails
  //         // setSubtaskComments(sampleSubtaskComments);
  //       }
  //     }
  //   };
  //   if (isViewSubtaskDialogOpen && selectedSubtask) {
  //     loadSubtaskComments();
  //   }
  // }, [isViewSubtaskDialogOpen, selectedSubtask]);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get(`subtask/task/${taskId}`);
        setSubtasks(response.data.subTasks);
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

  // useEffect(() => {
  //   const loadComments = async () => {
  //     try {
  //       const response = await api.get(`comments/task/${taskId}`);
  //       setComments(response.data.comments || []);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   if (user?._id) {
  //     loadComments();
  //   }
  // }, [user, taskId, isSuccess]);

  // Load subtask comments when viewing a subtask
  // useEffect(() => {
  //   const loadSubtaskComments = async () => {
  //     if (selectedSubtask?.subTaskId) {
  //       try {
  //         const response = await api.get(
  //           `comments/subtask/${selectedSubtask.subTaskId}`
  //         );
  //         setSubtaskComments(response.data.comments || []);
  //       } catch (err) {
  //         console.log(err);
  //       }
  //     }
  //   };
  //   if (isViewSubtaskDialogOpen && selectedSubtask) {
  //     loadSubtaskComments();
  //   }
  // }, [isViewSubtaskDialogOpen, selectedSubtask]);

  const consultants = users.filter((u) => u.role === "team_member");

  // Form state for editing
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

  // Permissions
  const canEdit = hasPermission ? hasPermission("edit_tasks") : true;
  const canDelete = hasPermission ? hasPermission("delete_tasks") : true;
  const canUpdateStatus = hasPermission
    ? hasPermission("update_task_status")
    : true;
  const canAddSubtasks = hasPermission ? hasPermission("create_tasks") : true;
  const canAddComments = hasPermission ? hasPermission("add_comments") : true;
  const [expandedSubtasks, setExpandedSubtasks] = React.useState({});

  const toggleSubtaskExpansion = (subTaskId) => {
    setExpandedSubtasks((prev) => ({
      ...prev,
      [subTaskId]: !prev[subTaskId],
    }));
  };

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get(`task/${taskId}`);
        setTask(response.data.task);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [isSuccess]);

  // Initialize form data when task is loaded
  useEffect(() => {
    if (task) {
      setFormData({
        taskId: task.taskId || "",
        title: task.title || "",
        description: task.description || "",
        projectId: task.projectId || "",
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
      });
      setLoading(false);
    }
  }, [task]);

  // Handle input changes for the edit form
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

  // Handle subtask form input changes
  const handleSubtaskInputChange = (e) => {
    const { name, value } = e.target;
    setSubtaskFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubtaskSelectChange = (name, value) => {
    setSubtaskFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openEditSubtaskDialog = (subtask) => {
    if (subtask) {
      setSubtaskFormData({
        ...subtask,
        attachments: subtask.attachments || [],
      });
      setIsEditSubtaskDialogOpen(true);
    }
  };

  // Handle task update
  const handleUpdateTask = async () => {
    try {
      setLoading(true);
      const response = await api.put("task", formData);
      setSuccess(response);
      toast({
        title: "Task updated",
        description: `Task "${formData.title}" has been updated successfully`,
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (task) => {
    try {
      setLoading(true);
      const response = await api.delete(`task/${task.taskId}`);
      setSuccess(response);

      toast({
        title: "Task deleted",
        description: `Task "${task.title}" has been deleted successfully`,
      });

      setTimeout(() => {
        router.push("/tasks");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    try {
      setTask({
        ...task,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: "1",
      });

      setFormData((prev) => ({ ...prev, status: newStatus }));

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

  // Handle priority change
  const handlePriorityChange = (newPriority) => {
    try {
      setTask({
        ...task,
        priority: newPriority,
        updatedAt: new Date().toISOString(),
        updatedBy: "1",
      });

      setFormData((prev) => ({ ...prev, priority: newPriority }));

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

  // Handle subtask creation
  const handleCreateSubtask = async () => {
    try {
      setLoading(true);

      const newSubtask = {
        parentTaskId: taskId,
        parentSubTaskId: selectedSubtask?.subTaskId,
        title: subtaskFormData.title,
        description: subtaskFormData.description,
        status: subtaskFormData.status,
        priority: subtaskFormData.priority,
        startDate: subtaskFormData.startDate,
        endDate: subtaskFormData.endDate,
        estimatedHours: subtaskFormData.estimatedHours,
        projectId: task.projectId,
        createdBy: user._id,
        attachments: subtaskFormData.attachments,
      };

      const response = await api.post("subtask", newSubtask);
      setSuccess(response);

      toast({
        title: "Subtask created",
        description: `Subtask "${subtaskFormData.title}" has been created successfully`,
      });

      setIsAddSubtaskDialogOpen(false);
      setSubtaskFormData({
        title: "",
        description: "",
        status: "Open",
        priority: "medium",
        attachments: [],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create subtask: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubtask = async () => {
    try {
      setLoading(true);

      const response = await api.put("subtask", subtaskFormData);
      setSuccess(response);

      toast({
        title: "Subtask updated",
        description: `Subtask "${subtaskFormData.title}" has been updated successfully`,
      });

      setIsEditSubtaskDialogOpen(false);
      setSubtaskFormData({
        title: "",
        description: "",
        status: "Open",
        priority: "medium",
        startDate: "",
        endDate: "",
        estimatedHours: "",
        attachments: [],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update subtask: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteSubtaskDialog = (subtaskId) => {
    setDeletingSubtaskId(subtaskId);
    setIsDeleteSubtaskDialogOpen(true);
  };

  const handleDeleteSubtask = async () => {
    try {
      setLoading(true);

      const response = await api.delete(`subtask/${deletingSubtaskId}`);
      setSuccess(response);
      setIsDeleteSubtaskDialogOpen(false);

      toast({
        title: "Subtask deleted",
        description: `"${deletingSubtaskId}" has been deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete subtask: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle comment creation
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setLoading(true);

      const newComment = {
        taskId: taskId,
        text: commentText,
        createdBy: user._id,
      };

      const response = await api.post("task/comment", newComment);
      setSuccess(response);

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });

      setIsAddCommentDialogOpen(false);
      setCommentText("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle subtask comment creation
  const handleAddSubtaskComment = async () => {
    if (!subtaskCommentText.trim()) return;

    try {
      setLoading(true);

      const newComment = {
        subTaskId: selectedSubtask.subTaskId,
        text: subtaskCommentText,
        createdBy: user._id,
      };

      const response = await api.post("subtask/comment", newComment);
      setSuccess(response);
      setSelectedSubtask(response.data.subTask);
      // Update local state
      setSubtaskComments((prev) => [newComment, ...prev]);

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });

      setIsAddSubtaskCommentDialogOpen(false);
      setSubtaskCommentText("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle attachment upload
  const handleAddAttachment = async () => {
    if (!selectedFile) return;

    try {
      setUploadingAttachment(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("taskId", taskId);

      const response = await api.post("upload/attachment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update task attachments
      const updatedAttachments = [
        ...(task.attachments || []),
        selectedFile.name,
      ];
      setTask((prev) => ({
        ...prev,
        attachments: updatedAttachments,
      }));

      setFormData((prev) => ({
        ...prev,
        attachments: updatedAttachments,
      }));

      toast({
        title: "Attachment uploaded",
        description: `File "${selectedFile.name}" has been uploaded successfully`,
      });

      setIsAddAttachmentDialogOpen(false);
      setSelectedFile(null);
      setSuccess(response);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload attachment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveAttachment = async (attachmentName, index) => {
    try {
      setLoading(true);

      const response = await api.delete(
        `attachment/${taskId}/${attachmentName}`
      );

      // Update task attachments
      const updatedAttachments = task.attachments.filter((_, i) => i !== index);
      setTask((prev) => ({
        ...prev,
        attachments: updatedAttachments,
      }));

      setFormData((prev) => ({
        ...prev,
        attachments: updatedAttachments,
      }));

      toast({
        title: "Attachment removed",
        description: `File "${attachmentName}" has been removed successfully`,
      });

      setSuccess(response);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to remove attachment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle subtask attachment upload
  const handleAddSubtaskAttachment = async () => {
    if (!selectedSubtaskFile) return;

    try {
      setUploadingSubtaskAttachment(true);

      const formData = new FormData();
      formData.append("file", selectedSubtaskFile);
      formData.append("subtaskId", selectedSubtask.subTaskId);

      const response = await api.post("upload/subtask-attachment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update subtask attachments
      const updatedAttachments = [
        ...(selectedSubtask.attachments || []),
        selectedSubtaskFile.name,
      ];
      setSelectedSubtask((prev) => ({
        ...prev,
        attachments: updatedAttachments,
      }));

      toast({
        title: "Attachment uploaded",
        description: `File "${selectedSubtaskFile.name}" has been uploaded successfully`,
      });

      setIsAddSubtaskAttachmentDialogOpen(false);
      setSelectedSubtaskFile(null);
      setSuccess(response);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload attachment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploadingSubtaskAttachment(false);
    }
  };

  const handleSubtaskFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedSubtaskFile(file);
    }
  };

  const handleRemoveSubtaskAttachment = async (attachmentName, index) => {
    try {
      setLoading(true);

      const response = await api.delete(
        `subtask-attachment/${selectedSubtask.subTaskId}/${attachmentName}`
      );

      // Update subtask attachments
      const updatedAttachments = selectedSubtask.attachments.filter(
        (_, i) => i !== index
      );
      setSelectedSubtask((prev) => ({
        ...prev,
        attachments: updatedAttachments,
      }));

      toast({
        title: "Attachment removed",
        description: `File "${attachmentName}" has been removed successfully`,
      });

      setSuccess(response);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to remove attachment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for UI
  const getStatusIcon = (status) => {
    switch (status) {
      case "Open":
        return <Circle className="h-4 w-4 text-teal-500" />;
      case "WIP":
        return <Clock3 className="h-4 w-4 text-indigo-500" />;
      case "QC":
        return <BarChart className="h-4 w-4 text-amber-500" />;
      case "Under Review":
        return <AlertTriangle className="h-4 w-4 text-violet-500" />;
      case "Closed":
        return <CheckCircle2 className="h-4 w-4 text-slate-500" />;
      case "Re Open":
        return <RefreshCcw className="h-4 w-4 text-rose-500" />;
      case "Hold":
        return <PauseCircle className="h-4 w-4 text-pink-500" />;
      default:
        return <Circle className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100";
      case "WIP":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100";
      case "QC":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
      case "Under Review":
        return "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100";
      case "Closed":
        return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
      case "Re Open":
        return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";
      case "Hold":
        return "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "low":
        return <div className="h-2 w-2 rounded-full bg-emerald-500" />;
      case "medium":
        return <div className="h-2 w-2 rounded-full bg-sky-500" />;
      case "high":
        return <div className="h-2 w-2 rounded-full bg-amber-500" />;
      case "urgent":
        return <div className="h-2 w-2 rounded-full bg-rose-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-slate-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "medium":
        return "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100";
      case "high":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
      case "urgent":
        return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
    }
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, " ") || "Unknown";
  };

  const formatPriority = (priority) => {
    return priority
      ? priority.charAt(0).toUpperCase() + priority.slice(1)
      : "Unknown";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString();
  };

  const getUserName = (userId) => {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "Unknown User";
  };

  const getProjectName = (projectId) => {
    if (!projectId) return "Unassigned";
    const project = projects.find((p) => p._id === projectId);
    return project ? project.name : "Unknown Project";
  };

  const getUserInitials = (userId) => {
    if (!userId) return "UN";
    const user = users.find((u) => u._id === userId);
    if (!user || !user.name) return "UN";

    const nameParts = user.name.split(" ");
    if (nameParts.length === 1)
      return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
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
        setSubtaskFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, response.data.file],
        }));
      } catch (err) {
        console.log(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const getAvatarColor = (userId) => {
    if (!userId) return "bg-slate-500";

    // Generate a consistent color based on the user ID
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];

    const colorIndex = Number.parseInt(userId) % colors.length;
    return colors[colorIndex];
  };

  if (loading && !task) {
    return (
      <ProtectedRoute requiredPermission="view_tasks">
        <DashboardShell>
          <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading task details...</span>
          </div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  if (!task) {
    return (
      <ProtectedRoute requiredPermission="view_tasks">
        <DashboardShell>
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The task you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => router.push("/tasks")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Button>
          </div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  const handleViewSubtask = (subtask) => {
    setSelectedSubtask(subtask);
    setIsViewSubtaskDialogOpen(true);
  };

  const downloadAttachment = async (fileName) => {
    try {
      const response = await api.get(`/download/${fileName}`);
      const url = response.data.url;
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubtaskStatusChange = async (subtaskId, newStatus) => {
    try {
      setLoading(true);
      const updatedSubtasks = subtasks.map((subtask) => {
        if (subtask.subTaskId === subtaskId) {
          return { ...subtask, status: newStatus };
        }
        return subtask;
      });
      setSubtasks(updatedSubtasks);
      toast({
        title: "Subtask status updated",
        description: `Subtask status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update subtask status: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubtaskPriorityChange = async (subtaskId, newPriority) => {
    try {
      setLoading(true);
      const updatedSubtasks = subtasks.map((subtask) => {
        if (subtask.subTaskId === subtaskId) {
          return { ...subtask, priority: newPriority };
        }
        return subtask;
      });
      setSubtasks(updatedSubtasks);
      toast({
        title: "Subtask priority updated",
        description: `Subtask priority changed to ${newPriority}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update subtask priority: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSubtaskRow = (subtask, level = 1) => {
    const paddingLeft = `20px`;
    const isExpanded = expandedSubtasks[subtask.subTaskId];

    return (
      <React.Fragment key={subtask.subTaskId}>
        <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800">
          <TableCell>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{subtask.subTaskId}</span>
              {subtask.children?.length > 0 ? (
                <span
                  onClick={() => toggleSubtaskExpansion(subtask.subTaskId)}
                  className="cursor-pointer underline text-sm text-blue-600"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 opacity-70" />
                  ) : (
                    <ChevronDown className="h-5 w-5 opacity-70" />
                  )}
                </span>
              ) : null}
              {subtask.children?.length > 0 && (
                <Badge variant="primary" className="font-normal">
                  {subtask.children?.length}
                </Badge>
              )}
            </div>
            {subtask?.parentSubTaskId && (
              <small className=" text-muted-foreground">
                Parent: {subtask.parentSubTaskId}
              </small>
            )}
          </TableCell>
          <TableCell>{subtask.title || "-"}</TableCell>

          <TableCell>{subtask.startDate || "-"}</TableCell>
          <TableCell>{subtask.endDate || "-"}</TableCell>
          <TableCell>
            {canUpdateStatus ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 flex items-center gap-1.5 px-2 ${getStatusColor(
                      subtask.status || "Open"
                    )}`}
                  >
                    {getStatusIcon(subtask.status)}
                    <span className="text-sm">
                      {formatStatus(subtask.status)}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    "Open",
                    "WIP",
                    "QC",
                    "Under Review",
                    "Closed",
                    "Re Open",
                    "Hold",
                  ].map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        handleSubtaskStatusChange(subtask.subTaskId, status)
                      }
                      className="gap-2"
                    >
                      {getStatusIcon(status)}
                      <span>{status}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5">
                {getStatusIcon(subtask.status || "Open")}
                <span className="text-sm">{formatStatus(subtask.status)}</span>
              </div>
            )}
          </TableCell>
          <TableCell>
            {canUpdateStatus ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 flex items-center gap-1.5 px-2 ${getPriorityColor(
                      subtask.priority || "medium"
                    )}`}
                  >
                    {getPriorityIcon(subtask.priority)}
                    <span className="text-sm">
                      {formatPriority(subtask.priority)}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["low", "medium", "high", "urgent"].map((priority) => (
                    <DropdownMenuItem
                      key={priority}
                      onClick={() =>
                        handleSubtaskPriorityChange(subtask.subTaskId, priority)
                      }
                      className="gap-2"
                    >
                      {getPriorityIcon(priority)}
                      <span>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5">
                {getPriorityIcon(subtask.priority || "medium")}
                <span className="text-sm">
                  {formatPriority(subtask.priority)}
                </span>
              </div>
            )}
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedSubtask(subtask);
                    setIsAddSubtaskDialogOpen(subtask);
                  }}
                >
                  Add Subtask
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewSubtask(subtask)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openEditSubtaskDialog(subtask)}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsViewSubtaskDialogOpen(false);
                    openDeleteSubtaskDialog(subtask.subTaskId);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>

        {/* Only show children if expanded */}
        {isExpanded &&
          subtask.children?.map((child) => renderSubtaskRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <ProtectedRoute requiredPermission="view_tasks">
      <DashboardShell className="bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto py-6 max-w-7xl">
          <div className="flex flex-col gap-8">
            {/* Header with back button and actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/tasks")}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {getProjectName(task.projectId)} / {task.taskId}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight mt-1">
                    {task.title}
                  </h1>
                </div>
              </div>
              <div className="flex gap-3">
                {canEdit && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteTask(task)}
                    className="gap-2"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Status bar */}
            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Status:
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 flex items-center gap-2 border ${getStatusColor(
                        task.status || "Open"
                      )} transition-colors duration-200`}
                      disabled={!canUpdateStatus}
                    >
                      {getStatusIcon(task.status)}
                      <span>{formatStatus(task.status)}</span>
                      {canUpdateStatus && (
                        <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("Open")}
                      className="gap-2"
                    >
                      {getStatusIcon("Open")}
                      <span>Open</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("WIP")}
                      className="gap-2"
                    >
                      {getStatusIcon("WIP")}
                      <span>WIP</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("QC")}
                      className="gap-2"
                    >
                      {getStatusIcon("QC")}
                      <span>QC</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("Under Review")}
                      className="gap-2"
                    >
                      {getStatusIcon("Under Review")}
                      <span>Under Review</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("Closed")}
                      className="gap-2"
                    >
                      {getStatusIcon("Closed")}
                      <span>Closed</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("Re Open")}
                      className="gap-2"
                    >
                      {getStatusIcon("Re Open")}
                      <span>Re Open</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("Hold")}
                      className="gap-2"
                    >
                      {getStatusIcon("Hold")}
                      <span>Hold</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Priority:
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 flex items-center gap-2 border ${getPriorityColor(
                        task.priority || "medium"
                      )} transition-colors duration-200`}
                      disabled={!canUpdateStatus}
                    >
                      {getPriorityIcon(task.priority)}
                      <span>{formatPriority(task.priority)}</span>
                      {canUpdateStatus && (
                        <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handlePriorityChange("low")}
                      className="gap-2"
                    >
                      {getPriorityIcon("low")}
                      <span>Low</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handlePriorityChange("medium")}
                      className="gap-2"
                    >
                      {getPriorityIcon("medium")}
                      <span>Medium</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handlePriorityChange("high")}
                      className="gap-2"
                    >
                      {getPriorityIcon("high")}
                      <span>High</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handlePriorityChange("urgent")}
                      className="gap-2"
                    >
                      {getPriorityIcon("urgent")}
                      <span>Urgent</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Type:
                </span>
                <Badge variant="secondary" className="font-normal">
                  {task.taskType || "Not specified"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Nature:
                </span>
                <Badge variant="secondary" className="font-normal">
                  {task.taskNature || "Not specified"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Badge
                  variant="outline"
                  className={
                    task.active
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }
                >
                  {task.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Main content with tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Task details and tabs */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden border-none shadow-sm">
                  <CardHeader className="bg-white dark:bg-slate-900 pb-2">
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-slate-900 pt-4">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {task.description || "No description provided."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key details */}
                <Card className="overflow-hidden border-none shadow-sm">
                  <CardHeader className="bg-white dark:bg-slate-900 pb-2">
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-slate-900 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Start Date</span>
                        </div>
                        <p className="text-sm font-medium">
                          {formatDate(task.startDate)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>End Date</span>
                        </div>
                        <p className="text-sm font-medium">
                          {formatDate(task.endDate)}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Estimated Hours</span>
                        </div>
                        <p className="text-sm font-medium">
                          {task.estimatedHours || "Not specified"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Total Hours</span>
                        </div>
                        <p className="text-sm font-medium">
                          {task.totalHours || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex items-center gap-2">
                      <div className="flex h-5 items-center">
                        <Checkbox
                          checked={task.billable}
                          disabled
                          className="rounded-sm"
                        />
                      </div>
                      <div className="text-sm font-medium">Billable</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column - Sidebar with metadata */}
              <div className="space-y-6">
                <Card className="overflow-hidden border-none shadow-sm">
                  <CardHeader className="bg-white dark:bg-slate-900 pb-2">
                    <CardTitle>Project</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-slate-900 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {getProjectName(task.projectId)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {projects.find((p) => p.id === task.projectId)
                            ?.client || "No client"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-sm">
                  <CardHeader className="bg-white dark:bg-slate-900 pb-2">
                    <CardTitle>Assigned To</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-slate-900 pt-4">
                    {task.taskType === "Functional" ? (
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={`h-10 w-10 border ${getAvatarColor(
                            task.functionalConsultant
                          )}`}
                        >
                          <AvatarFallback>
                            {getUserInitials(task.functionalConsultant)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {getUserName(task.functionalConsultant)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Functional Consultant
                          </p>
                        </div>
                      </div>
                    ) : task.taskType === "Technical" ? (
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={`h-10 w-10 border ${getAvatarColor(
                            task.technicalConsultant
                          )}`}
                        >
                          <AvatarFallback>
                            {getUserInitials(task.technicalConsultant)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {getUserName(task.technicalConsultant)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Technical Consultant
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Not assigned</p>
                    )}
                  </CardContent>
                </Card>

                {/* {task.attachments && task.attachments.length > 0 && (
                  <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-white dark:bg-slate-900 pb-2">
                      <CardTitle>Attachments</CardTitle>
                      <CardDescription>
                        {task.attachments.length} files attached
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white dark:bg-slate-900 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                        {task.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                          >
                            <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {attachment}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Added {formatDate(task.createdAt)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => downloadAttachment(attachment)}
                            >
                              <span className="sr-only">Download</span>
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )} */}

                {/* Progress card */}
                <Card className="overflow-hidden border-none shadow-sm">
                  <CardHeader className="bg-white dark:bg-slate-900 pb-2">
                    <CardTitle>Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-slate-900 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Subtasks</span>
                          <span className="text-muted-foreground">
                            {
                              subtasks.filter((s) => s.status === "Closed")
                                .length
                            }
                            /{subtasks.length} completed
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${
                                subtasks.length
                                  ? (subtasks.filter(
                                      (s) => s.status === "Closed"
                                    ).length /
                                      subtasks.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="grid grid-cols-1">
              {/* Tabbed Content */}
              <Card className="overflow-hidden border-none shadow-sm">
                <CardContent className="bg-white dark:bg-slate-900 p-0">
                  <Tabs defaultValue="subtasks" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent h-auto p-0">
                      <TabsTrigger
                        value="subtasks"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                      >
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Subtasks ({subtasks.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="attachments"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attachments ({task.attachments?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger
                        value="comments"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comments ({task?.comments.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="subtasks" className="p-6 mt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Subtasks</h3>
                          <p className="text-sm text-muted-foreground">
                            {subtasks.length}{" "}
                            {subtasks.length === 1 ? "subtask" : "subtasks"}
                          </p>
                        </div>
                        {canAddSubtasks && (
                          <Button
                            size="sm"
                            onClick={() => setIsAddSubtaskDialogOpen(true)}
                            className="gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Add Subtask
                          </Button>
                        )}
                      </div>

                      {subtasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckSquare className="mx-auto h-12 w-12 mb-3 opacity-30" />
                          <p>No subtasks found for this task.</p>
                          {canAddSubtasks && (
                            <Button
                              variant="link"
                              onClick={() => setIsAddSubtaskDialogOpen(true)}
                              className="mt-2 text-primary"
                            >
                              Create your first subtask
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <TableHead>Subtask ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead className="w-[100px]">
                                  Status
                                </TableHead>
                                <TableHead className="w-[100px]">
                                  Priority
                                </TableHead>
                                <TableHead className="w-[80px] text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {subtasks.map((subtask) =>
                                renderSubtaskRow(subtask)
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="attachments" className="p-6 mt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Attachments</h3>
                          <p className="text-sm text-muted-foreground">
                            {task.attachments?.length || 0} files attached
                          </p>
                        </div>
                        {/* <Button
                          size="sm"
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Attachment
                        </Button> */}
                      </div>

                      {!task.attachments || task.attachments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="mx-auto h-12 w-12 mb-3 opacity-30" />
                          <p>No attachments found for this task.</p>
                          <Button
                            variant="link"
                            onClick={() => setIsAddAttachmentDialogOpen(true)}
                            className="mt-2 text-primary"
                          >
                            Add your first attachment
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {task.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-slate-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {attachment}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Added {formatDate(task.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => downloadAttachment(attachment)}
                                >
                                  <span className="sr-only">Download</span>
                                  <Download className="h-4 w-4" />
                                </Button>
                                {/* <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleRemoveAttachment(attachment, index)
                                  }
                                >
                                  <span className="sr-only">Remove</span>
                                  <X className="h-4 w-4" />
                                </Button> */}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="comments" className="p-6 mt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Comments</h3>
                          <p className="text-sm text-muted-foreground">
                            {task?.comments.length}{" "}
                            {task?.comments.length === 1
                              ? "comment"
                              : "comments"}
                          </p>
                        </div>
                        {canAddComments && (
                          <Button
                            size="sm"
                            onClick={() => setIsAddCommentDialogOpen(true)}
                            className="gap-1"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Add Comment
                          </Button>
                        )}
                      </div>

                      {task?.comments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-30" />
                          <p>No comments yet. Be the first to comment!</p>
                          {canAddComments && (
                            <Button
                              variant="link"
                              onClick={() => setIsAddCommentDialogOpen(true)}
                              className="mt-2 text-primary"
                            >
                              Add a comment
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {task?.comments
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                            )
                            .map((comment) => (
                              <div key={comment._id} className="flex gap-4">
                                <Avatar
                                  className={`h-10 w-10 border ${getAvatarColor(
                                    comment.createdBy
                                  )}`}
                                >
                                  <AvatarFallback>
                                    {getUserInitials(comment.createdBy)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {getUserName(comment.createdBy)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDateTime(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm leading-relaxed">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            {/* <div className="grid grid-cols-1 ">
              <Card className="overflow-hidden border-none shadow-sm">
                <CardHeader className="bg-white dark:bg-slate-900 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Subtasks</CardTitle>
                      <CardDescription>
                        {subtasks.length}{" "}
                        {subtasks.length === 1 ? "subtask" : "subtasks"}
                      </CardDescription>
                    </div>

                    {canAddSubtasks && (
                      <Button
                        size="sm"
                        onClick={() => setIsAddSubtaskDialogOpen(true)}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="bg-white dark:bg-slate-900 pt-4">
                  {subtasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckSquare className="mx-auto h-12 w-12 mb-3 opacity-30" />
                      <p>No subtasks found for this task.</p>
                      {canAddSubtasks && (
                        <Button
                          variant="link"
                          onClick={() => setIsAddSubtaskDialogOpen(true)}
                          className="mt-2 text-primary"
                        >
                          Create your first subtask
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <TableHead>Subtask ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>

                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[100px]">
                              Priority
                            </TableHead>
                            <TableHead className="w-[80px] text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {subtasks.map((subtask) => renderSubtaskRow(subtask))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div> */}
          </div>
        </div>

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
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="API Development">
                          API Development
                        </SelectItem>
                        <SelectItem value="Integration">Integration</SelectItem>
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
                    <Label htmlFor="edit-estimatedHours">Estimated Hours</Label>
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
                                consultant.designation?.includes("Technical") ||
                                !consultant.designation
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
                        id="add-attachment"
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const newAttachments = [
                              ...formData.attachments,
                              e.target.files[0].name,
                            ];
                            setFormData((prev) => ({
                              ...prev,
                              attachments: newAttachments,
                            }));
                          }
                        }}
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
              <Button onClick={handleUpdateTask} disabled={loading}>
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

        {/* Add Subtask Dialog with Tabs */}
        <Dialog
          open={isAddSubtaskDialogOpen}
          onOpenChange={setIsAddSubtaskDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Subtask</DialogTitle>
              <DialogDescription>
                Create a new subtask for{" "}
                {selectedSubtask?.subTaskId
                  ? `subtask ${selectedSubtask?.subTaskId}`
                  : "this task"}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="subtask-title">Subtask Name</Label>
                  <Input
                    id="subtask-title"
                    name="title"
                    value={subtaskFormData.title}
                    onChange={handleSubtaskInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subtask-description">Description</Label>
                  <Textarea
                    id="subtask-description"
                    name="description"
                    value={subtaskFormData.description}
                    onChange={handleSubtaskInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subtask-status">Status</Label>
                    <Select
                      value={subtaskFormData.status}
                      onValueChange={(value) =>
                        handleSubtaskSelectChange("status", value)
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
                    <Label htmlFor="subtask-priority">Priority</Label>
                    <Select
                      value={subtaskFormData.priority}
                      onValueChange={(value) =>
                        handleSubtaskSelectChange("priority", value)
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
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subtask-startDate">Start Date</Label>
                    <Input
                      id="subtask-startDate"
                      name="startDate"
                      type="date"
                      value={subtaskFormData.startDate}
                      onChange={handleSubtaskInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subtask-endDate">End Date</Label>
                    <Input
                      id="subtask-endDate"
                      name="endDate"
                      type="date"
                      value={subtaskFormData.endDate}
                      onChange={handleSubtaskInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subtask-estimatedHours">
                    Estimated Hours
                  </Label>
                  <Input
                    id="subtask-estimatedHours"
                    name="estimatedHours"
                    type="number"
                    value={subtaskFormData.estimatedHours}
                    onChange={handleSubtaskInputChange}
                    min="0"
                    step="0.5"
                  />
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label>Attachments</Label>
                  <div className="space-y-2">
                    {subtaskFormData.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => {
                            const newAttachments = [
                              ...subtaskFormData.attachments,
                            ];
                            newAttachments.splice(index, 1);
                            setSubtaskFormData((prev) => ({
                              ...prev,
                              attachments: newAttachments,
                            }));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="relative">
                      <Input
                        type="file"
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        onChange={handleFileChange}

                        // onChange={(e) => {
                        //   if (e.target.files?.[0]) {
                        //     const newAttachments = [
                        //       ...subtaskFormData.attachments,
                        //       e.target.files[0].name,
                        //     ];
                        //     setSubtaskFormData((prev) => ({
                        //       ...prev,
                        //       attachments: newAttachments,
                        //     }));
                        //   }
                        // }}
                      />
                      <div className="border border-dashed border-input rounded-md p-4 flex flex-col items-center justify-center hover:bg-muted/30 transition-colors">
                        <Plus className="h-4 w-4 mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Click to add attachment
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
                onClick={() => setIsAddSubtaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSubtask}
                disabled={loading || !subtaskFormData.title}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Subtask"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Subtask Dialog */}
        <Dialog
          open={isViewSubtaskDialogOpen}
          onOpenChange={setIsViewSubtaskDialogOpen}
        >
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Subtask Details</DialogTitle>
              <DialogDescription>
                View details for subtask {selectedSubtask?.subTaskId}
              </DialogDescription>
            </DialogHeader>
            {selectedSubtask && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Title
                    </Label>
                    <p className="text-sm font-medium">
                      {selectedSubtask.title}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Description
                    </Label>
                    <p className="text-sm leading-relaxed">
                      {selectedSubtask.description || "No description provided"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Status
                      </Label>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedSubtask.status)}
                        <span className="text-sm">
                          {formatStatus(selectedSubtask.status)}
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Priority
                      </Label>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(selectedSubtask.priority)}
                        <span className="text-sm">
                          {formatPriority(selectedSubtask.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Start Date
                      </Label>
                      <p className="text-sm">
                        {formatDate(selectedSubtask.startDate)}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        End Date
                      </Label>
                      <p className="text-sm">
                        {formatDate(selectedSubtask.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Estimated Hours
                    </Label>
                    <p className="text-sm">
                      {selectedSubtask.estimatedHours || "Not specified"}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Created By
                    </Label>
                    <div className="flex items-center gap-2">
                      <Avatar
                        className={`h-6 w-6 border ${getAvatarColor(
                          selectedSubtask.createdBy
                        )}`}
                      >
                        <AvatarFallback className="text-xs">
                          {getUserInitials(selectedSubtask.createdBy)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {getUserName(selectedSubtask.createdBy)}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Attachments</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubtask.attachments?.length || 0} files
                        attached
                      </p>
                    </div>
                    {/* <Button
                      size="sm"
                      onClick={() => setIsAddSubtaskAttachmentDialogOpen(true)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Attachment
                    </Button> */}
                  </div>

                  {!selectedSubtask.attachments ||
                  selectedSubtask.attachments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-3 opacity-30" />
                      <p>No attachments found for this subtask.</p>
                      {/* <Button
                        variant="link"
                        onClick={() =>
                          setIsAddSubtaskAttachmentDialogOpen(true)
                        }
                        className="mt-2 text-primary"
                      >
                        Add your first attachment
                      </Button> */}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {selectedSubtask.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                          <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {attachment}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Added {formatDate(selectedSubtask.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => downloadAttachment(attachment)}
                            >
                              <span className="sr-only">Download</span>
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                            {/* <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() =>
                                handleRemoveSubtaskAttachment(attachment, index)
                              }
                            >
                              <span className="sr-only">Remove</span>
                              <X className="h-4 w-4" />
                            </Button> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Comments</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubtask?.comments?.length}{" "}
                        {selectedSubtask?.comments?.length === 1
                          ? "comment"
                          : "comments"}
                      </p>
                    </div>
                    {canAddComments && (
                      <Button
                        size="sm"
                        onClick={() => setIsAddSubtaskCommentDialogOpen(true)}
                        className="gap-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Add Comment
                      </Button>
                    )}
                  </div>

                  {selectedSubtask?.comments?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-30" />
                      <p>No comments yet. Be the first to comment!</p>
                      {canAddComments && (
                        <Button
                          variant="link"
                          onClick={() => setIsAddSubtaskCommentDialogOpen(true)}
                          className="mt-2 text-primary"
                        >
                          Add a comment
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedSubtask?.comments
                        ?.sort(
                          (a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt)
                        )
                        .map((comment, index) => (
                          <div key={index} className="flex gap-4">
                            <Avatar
                              className={`h-10 w-10 border ${getAvatarColor(
                                comment.createdBy
                              )}`}
                            >
                              <AvatarFallback>
                                {getUserInitials(comment.createdBy)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {getUserName(comment.createdBy)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewSubtaskDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewSubtaskDialogOpen(false);
                  openEditSubtaskDialog(selectedSubtask);
                }}
              >
                Edit Subtask
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Comment Dialog */}
        <Dialog
          open={isAddCommentDialogOpen}
          onOpenChange={setIsAddCommentDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogDescription>
                Add a new comment to this task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="comment-text">Comment</Label>
                <Textarea
                  id="comment-text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  placeholder="Enter your comment here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddCommentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={loading || !commentText.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Comment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditSubtaskDialogOpen}
          onOpenChange={setIsEditSubtaskDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Subtask</DialogTitle>
              <DialogDescription>
                Edit the details of the selected subtask
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-subtask-title">Subtask Name</Label>
                  <Input
                    id="edit-subtask-title"
                    name="title"
                    value={subtaskFormData.title}
                    onChange={handleSubtaskInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-subtask-description">Description</Label>
                  <Textarea
                    id="edit-subtask-description"
                    name="description"
                    value={subtaskFormData.description}
                    onChange={handleSubtaskInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-subtask-status">Status</Label>
                    <Select
                      value={subtaskFormData.status}
                      onValueChange={(value) =>
                        handleSubtaskSelectChange("status", value)
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
                    <Label htmlFor="edit-subtask-priority">Priority</Label>
                    <Select
                      value={subtaskFormData.priority}
                      onValueChange={(value) =>
                        handleSubtaskSelectChange("priority", value)
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
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-subtask-startDate">Start Date</Label>
                    <Input
                      id="edit-subtask-startDate"
                      name="startDate"
                      type="date"
                      value={subtaskFormData.startDate}
                      onChange={handleSubtaskInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-subtask-endDate">End Date</Label>
                    <Input
                      id="edit-subtask-endDate"
                      name="endDate"
                      type="date"
                      value={subtaskFormData.endDate}
                      onChange={handleSubtaskInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-subtask-estimatedHours">
                    Estimated Hours
                  </Label>
                  <Input
                    id="edit-subtask-estimatedHours"
                    name="estimatedHours"
                    type="number"
                    value={subtaskFormData.estimatedHours}
                    onChange={handleSubtaskInputChange}
                    min="0"
                    step="0.5"
                  />
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label>Attachments</Label>
                  <div className="space-y-2">
                    {subtaskFormData.attachments?.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => {
                            const newAttachments = [
                              ...(subtaskFormData.attachments || []),
                            ];
                            newAttachments.splice(index, 1);
                            setSubtaskFormData((prev) => ({
                              ...prev,
                              attachments: newAttachments,
                            }));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="relative">
                      <Input
                        type="file"
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        // onChange={(e) => {
                        //   if (e.target.files?.[0]) {
                        //     const newAttachments = [
                        //       ...(subtaskFormData.attachments || []),
                        //       e.target.files[0].name,
                        //     ];
                        //     setSubtaskFormData((prev) => ({
                        //       ...prev,
                        //       attachments: newAttachments,
                        //     }));
                        //   }
                        // }}
                        onChange={handleFileChange}
                      />
                      <div className="border border-dashed border-input rounded-md p-4 flex flex-col items-center justify-center hover:bg-muted/30 transition-colors">
                        <Plus className="h-4 w-4 mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Click to add attachment
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
                onClick={() => setIsEditSubtaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubtask}
                disabled={loading || !subtaskFormData.title}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Subtask"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isDeleteSubtaskDialogOpen}
          onOpenChange={setIsDeleteSubtaskDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Subtask</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this subtask? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Deleting this subtask will permanently remove it from the
                system.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteSubtaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSubtask}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Subtask"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Attachment Dialog */}
        <Dialog
          open={isAddAttachmentDialogOpen}
          onOpenChange={setIsAddAttachmentDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Attachment</DialogTitle>
              <DialogDescription>
                Upload a new file attachment to this task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="attachment-file">Select File</Label>
                <div className="relative">
                  <Input
                    id="attachment-file"
                    type="file"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                    accept="*/*"
                  />
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Maximum file size: 10MB. All file types are supported.
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddAttachmentDialogOpen(false);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddAttachment}
                disabled={uploadingAttachment || !selectedFile}
              >
                {uploadingAttachment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Attachment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Subtask Attachment Dialog */}
        <Dialog
          open={isAddSubtaskAttachmentDialogOpen}
          onOpenChange={setIsAddSubtaskAttachmentDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Attachment</DialogTitle>
              <DialogDescription>
                Upload a new file attachment to this subtask
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subtask-attachment-file">Select File</Label>
                <div className="relative">
                  <Input
                    id="subtask-attachment-file"
                    type="file"
                    onChange={handleSubtaskFileSelect}
                    className="cursor-pointer"
                    accept="*/*"
                  />
                </div>
                {selectedSubtaskFile && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">
                      {selectedSubtaskFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {(selectedSubtaskFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Maximum file size: 10MB. All file types are supported.
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddSubtaskAttachmentDialogOpen(false);
                  setSelectedSubtaskFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSubtaskAttachment}
                disabled={uploadingSubtaskAttachment || !selectedSubtaskFile}
              >
                {uploadingSubtaskAttachment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Attachment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Subtask Comment Dialog */}
        <Dialog
          open={isAddSubtaskCommentDialogOpen}
          onOpenChange={setIsAddSubtaskCommentDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogDescription>
                Add a new comment to this subtask
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subtask-comment-text">Comment</Label>
                <Textarea
                  id="subtask-comment-text"
                  value={subtaskCommentText}
                  onChange={(e) => setSubtaskCommentText(e.target.value)}
                  rows={4}
                  placeholder="Enter your comment here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddSubtaskCommentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSubtaskComment}
                disabled={loading || !subtaskCommentText.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Comment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </ProtectedRoute>
  );
}
