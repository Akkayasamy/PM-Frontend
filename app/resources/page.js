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
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  FileText,
  LinkIcon,
  File,
  ImageIcon,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Add this import at the top with other imports
import { useToast } from "@/hooks/use-toast";
import { toastMessages } from "@/lib/utils";
import api from "@/config/api";

export default function ResourcesPage() {
  const { user, hasPermission } = useAuth();
  const { getItems, createItem, updateItem, deleteItem, getItemById } =
    useData();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [resources, setResources] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isSuccess, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "document",
    url: "",
    projectId: "",
  });
  const [viewMode, setViewMode] = useState("table"); // table or grid

  // const resources = getItems("resources") || []
  // const projects = getItems("projects") || []

  // Inside the ResourcesPage component, add this line near the top
  const { toast } = useToast();

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
        const response = await api.get("resource");
        setResources(response.data.resources);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [isSuccess]);

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
      type: "document",
      url: "",
      projectId: "",
    });
    setCurrentResource(null);
  };

  // Update handleCreateResource function
  const handleCreateResource = async () => {
    try {
      // createItem("resources", {
      //   ...formData,
      //   createdBy: user.id,
      //   createdAt: new Date().toISOString(),
      // });
      const response = await api.post("resource", formData);
      setSuccess(response);
      toast(toastMessages.create("Resource", formData.name));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("create", "resource", error));
    }
  };

  // Update handleEditResource function
  const handleEditResource = async () => {
    try {
      // updateItem("resources", currentResource.id, {
      //   ...formData,
      //   updatedAt: new Date().toISOString(),
      // });
      const response = await api.put("resource", formData);
      setSuccess(response);
      toast(toastMessages.update("Resource", formData.name));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("update", "resource", error));
    }
  };

  // Update handleDeleteResource function
  const handleDeleteResource = async (resource) => {
    try {
      // const resource = getItemById("resources", id);
      // deleteItem("resources", id);
      const response = await api.delete(`resource/${resource._id}`);
      setSuccess(response);
      toast(toastMessages.delete("Resource", resource.name));
    } catch (error) {
      toast(toastMessages.error("delete", "resource", error));
    }
  };

  const openEditDialog = (resource) => {
    // const resource = getItemById("resources", id);
    // setCurrentResource(resource);
    // setFormData({
    //   name: resource.name,
    //   description: resource.description,
    //   type: resource.type,
    //   url: resource.url,
    //   projectId: resource.projectId,
    // });
    setFormData(resource);
    setIsEditDialogOpen(true);
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "link":
        return <LinkIcon className="h-4 w-4" />;
      case "file":
        return <File className="h-4 w-4" />;
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const canCreate = hasPermission("create_resources");
  const canEdit = hasPermission("edit_resources");
  const canDelete = hasPermission("delete_resources");

  return (
    <ProtectedRoute requiredPermission="view_resources">
      <DashboardShell>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            <p className="text-muted-foreground">
              Manage project resources and documentation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
            </div>
            {canCreate && (
              <>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Resource</DialogTitle>
                      <DialogDescription>
                        Add a new resource to your project
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Resource Name</Label>
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
                      <div className="grid gap-2">
                        <Label htmlFor="type">Resource Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            handleSelectChange("type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select resource type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="link">Link</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="url">URL or File Path</Label>
                        <Input
                          id="url"
                          name="url"
                          value={formData.url}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="projectId">Related Project</Label>
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
                            <SelectItem value="none">None</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project._id} value={project._id}>
                                {project.name}
                              </SelectItem>
                            ))}
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
                      <Button onClick={handleCreateResource}>
                        Add Resource
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        <div className="mt-6">
          {viewMode === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No resources found. Add your first resource!
                    </TableCell>
                  </TableRow>
                ) : (
                  resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getResourceTypeIcon(resource.type)}
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {resource.name}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {resource.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {resource.projectId
                          ? getItemById(
                              "projects",
                              Number.parseInt(resource.projectId)
                            )?.name || "Unassigned"
                          : "Unassigned"}
                      </TableCell>
                      <TableCell>
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(
                                  resource.url,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => openEditDialog(resource)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteResource(resource)}
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
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  No resources found. Add your first resource!
                </div>
              ) : (
                resources.map((resource) => (
                  <Card key={resource.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {resource.type}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(
                                  resource.url,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => openEditDialog(resource.id)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteResource(resource.id)
                                }
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
                        <div className="flex items-center gap-2">
                          {getResourceTypeIcon(resource.type)}
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {resource.name}
                          </a>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {resource.projectId
                          ? getItemById(
                              "projects",
                              Number.parseInt(resource.projectId)
                            )?.name || "No project"
                          : "No project"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resource.description || "No description provided"}
                      </p>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                      Added on{" "}
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Edit Resource Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
              <DialogDescription>
                Make changes to the resource details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Resource Name</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Resource Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-url">URL or File Path</Label>
                <Input
                  id="edit-url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-projectId">Related Project</Label>
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
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
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
              <Button onClick={handleEditResource}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </ProtectedRoute>
  );
}
