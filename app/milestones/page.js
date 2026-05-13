"use client";

import { useEffect, useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  Flag,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Add this import at the top with other imports
import { useToast } from "@/hooks/use-toast";
import { toastMessages } from "@/lib/utils";
import api from "@/config/api";

export default function MilestonesPage() {
  const { user, hasPermission } = useAuth();
  const { getItems, createItem, updateItem, deleteItem, getItemById } =
    useData();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const [isSuccess, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    dueDate: "",
    projectId: "",
    status: "planned",
  });

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get(`task`);
        setTasks(response.data.tasks);
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

  // Inside the MilestonesPage component, add this line near the top
  const { toast } = useToast();

  // const milestones = getItems("milestones") || []
  //const projects = getItems("projects") || []
  // const tasks = getItems("tasks") || []

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      dueDate: "",
      projectId: "",
      status: "planned",
    });
    setCurrentMilestone(null);
  };

  // Update handleCreateMilestone function
  const handleCreateMilestone = async () => {
    try {
      // createItem("milestones", {
      //   ...formData,
      //   createdBy: user.id,
      //   createdAt: new Date().toISOString(),
      // });
      const response = await api.post("milestone", formData);
      setSuccess(response);
      toast(toastMessages.create("Milestone", formData.name));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("create", "milestone", error));
    }
  };

  // Update handleEditMilestone function
  const handleEditMilestone = async () => {
    try {
      // updateItem("milestones", currentMilestone.id, {
      //   ...formData,
      //   updatedAt: new Date().toISOString(),
      // });
      const response = await api.put("milestone", formData);
      setSuccess(response);
      toast(toastMessages.update("Milestone", formData.name));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("update", "milestone", error));
    }
  };

  // Update handleDeleteMilestone function
  const handleDeleteMilestone = async (milestone) => {
    try {
      // const milestone = getItemById("milestones", id);
      // deleteItem("milestones", id);
      const response = await api.delete(`milestone/${milestone._id}`);
      setSuccess(response);
      toast(toastMessages.delete("Milestone", milestone.name));
    } catch (error) {
      toast(toastMessages.error("delete", "milestone", error));
    }
  };

  const openEditDialog = (milestone) => {
    //const milestone = getItemById("milestones", id);
    setCurrentMilestone(milestone);
    setFormData(milestone);
    // setFormData({
    //   name: milestone.name,
    //   description: milestone.description,
    //   dueDate: milestone.dueDate,
    //   projectId: milestone.projectId,
    //   status: milestone.status,
    // });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "planned":
        return <Badge variant="outline">Planned</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "delayed":
        return <Badge variant="destructive">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMilestoneProgress = (milestoneId) => {
    const milestoneTasks = tasks.filter(
      (task) => task.milestoneId === milestoneId
    );
    if (milestoneTasks.length === 0) return 0;

    const completedTasks = milestoneTasks.filter(
      (task) => task.status === "completed"
    ).length;
    return Math.round((completedTasks / milestoneTasks.length) * 100);
  };

  const canCreate = hasPermission("create_milestones");
  const canEdit = hasPermission("edit_milestones");
  const canDelete = hasPermission("delete_milestones");

  return (
    <ProtectedRoute requiredPermission="view_milestones">
      <DashboardShell>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
            <p className="text-muted-foreground">
              Track project milestones and deliverables
            </p>
          </div>
          {canCreate && (
            <>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Milestone</DialogTitle>
                    <DialogDescription>
                      Create a new milestone for your project
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Milestone Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
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
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
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
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateMilestone}>
                      Create Milestone
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        <div className="mt-6 grid gap-6">
          {milestones.length === 0 ? (
            <div className="text-center py-8">
              <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No milestones found
              </h3>
              <p className="text-muted-foreground">
                Get started by creating your first milestone.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {milestones.map((milestone) => {
                const progress = getMilestoneProgress(milestone.id);
                const project = milestone.projectId
                  ? getItemById(
                    "projects",
                    Number.parseInt(milestone.projectId)
                  )
                  : null;

                return (
                  <Card key={milestone.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        {getStatusBadge(milestone.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => openEditDialog(milestone)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteMilestone(milestone)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-lg mt-2">
                        {milestone.name}
                      </CardTitle>
                      <CardDescription>
                        {project ? project.name : "No project assigned"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {milestone.description || "No description provided"}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>
                            Due:{" "}
                            {milestone.dueDate
                              ? new Date(milestone.dueDate).toLocaleDateString()
                              : "No due date"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Milestone Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Milestone</DialogTitle>
              <DialogDescription>
                Make changes to the milestone details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Milestone Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
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
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
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
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditMilestone}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </ProtectedRoute>
  );
}
