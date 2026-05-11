"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { DashboardShell } from "@/components/dashboard-shell";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Eye,
  Filter,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toastMessages } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/config/api";

// Pagination constants
const ITEMS_PER_PAGE = 10;

export default function ClientsPage() {
  const { user, hasPermission } = useAuth();
  const { getItems, createItem, updateItem, deleteItem, getItemById } =
    useData();
  const { toast } = useToast();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [isSuccess, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    active: true,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    password: "",
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredClients, setFilteredClients] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  //const clients = getItems("clients") || [];
  // const projects = getItems("projects") || [];

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
        const response = await api.get("client");
        setClients(response.data.client);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [isSuccess]);

  // Filter and sort clients
  useEffect(() => {
    let result = [...clients];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (client) =>
          client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.clientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          client.contactEmail
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          client.contactPhone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active filter
    if (activeFilter !== "all") {
      result = result.filter((client) =>
        activeFilter === "active" ? client.active : !client.active
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredClients(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [clients, searchTerm, sortField, sortDirection, activeFilter]);

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
      clientId: "",
      name: "",
      active: true,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    });
    setCurrentClient(null);
  };

  const handleCreateClient = async () => {
    try {
      // createItem("clients", {
      //   ...formData,
      //   createdBy: user.id,
      //   createdAt: new Date().toISOString(),
      // });
      const response = await api.post("client", formData);
      setSuccess(response);
      toast(toastMessages.create("Client", formData.name));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("create", "client", error));
    }
  };

  const handleEditClient = async () => {
    try {
      // updateItem("clients", currentClient.id, {
      //   ...formData,
      //   updatedAt: new Date().toISOString(),
      // });
      const response = await api.put("client", formData);
      setSuccess(response);
      toast(toastMessages.update("Client", formData.name));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("update", "client", error));
    }
  };

  const handleDeleteClient = async (client) => {
    try {
      // const client = getItemById("clients", id);
      //deleteItem("clients", id);
      const response = await api.delete(`client/${client.clientId}`);
      setSuccess(response);
      toast(toastMessages.delete("Client", client.name));
    } catch (error) {
      toast(toastMessages.error("delete", "client", error));
    }
  };

  const openEditDialog = (client) => {
    //   const client = getItemById("clients", id);
    setCurrentClient(client);
    setFormData({
      clientId: client.clientId || "",
      name: client.name || "",
      active: client.active !== undefined ? client.active : true,
      contactName: client.contactName || "",
      contactEmail: client.contactEmail || "",
      contactPhone: client.contactPhone || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (client) => {
    // const client = getItemById("clients", id);
    setCurrentClient(client);
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
    setActiveFilter("all");
  };

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const canCreate = hasPermission("create_clients");
  const canEdit = hasPermission("edit_clients");
  const canDelete = hasPermission("delete_clients");

  return (
    <ProtectedRoute requiredPermission="view_clients">
      <DashboardShell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
              <p className="text-muted-foreground">
                Manage your clients and their projects
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {canCreate && (
                <>
                  <Button
                    onClick={() => {
                      resetForm();
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Client
                  </Button>
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Client</DialogTitle>
                        <DialogDescription>
                          Add a new client to your organization
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {/* <div className="grid gap-2">
                          <Label htmlFor="clientId">Client ID</Label>
                          <Input
                            id="clientId"
                            name="clientId"
                            value={formData.clientId}
                            onChange={handleInputChange}
                          />
                        </div> */}
                        <div className="grid gap-2">
                          <Label htmlFor="name">Client Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="contactName">Contact Person</Label>
                            <Input
                              id="contactName"
                              name="contactName"
                              value={formData.contactName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input
                              id="contactEmail"
                              name="contactEmail"
                              type="email"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="contactPhone">Contact Phone</Label>
                          <Input
                            id="contactPhone"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
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
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateClient}>
                          Create Client
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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

            {(activeFilter !== "all" || searchTerm) && (
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
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          </div>

          <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead
                    className="w-[15%] cursor-pointer"
                    onClick={() => handleSort("clientId")}
                  >
                    <div className="flex items-center">
                      Client ID
                      {sortField === "clientId" ? (
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
                      Client Name
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
                    className="w-[15%] cursor-pointer"
                    onClick={() => handleSort("contactName")}
                  >
                    <div className="flex items-center">
                      Contact Person
                      {sortField === "contactName" ? (
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
                    className="w-[15%] cursor-pointer"
                    onClick={() => handleSort("contactEmail")}
                  >
                    <div className="flex items-center">
                      Email
                      {sortField === "contactEmail" ? (
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
                    className="w-[15%] cursor-pointer"
                    onClick={() => handleSort("contactPhone")}
                  >
                    <div className="flex items-center">
                      Phone
                      {sortField === "contactPhone" ? (
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
                    className="w-[10%] cursor-pointer"
                    onClick={() => handleSort("active")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === "active" ? (
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
                {paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">
                          No clients found.{" "}
                          {canCreate && "Create your first client!"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                      <TableCell>{client.clientId || "-"}</TableCell>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.contactName || "-"}</TableCell>
                      <TableCell>{client.contactEmail || "-"}</TableCell>
                      <TableCell>{client.contactPhone || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={client.active ? "default" : "secondary"}
                          className={
                            client.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {client.active ? "Active" : "Inactive"}
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
                              onClick={() => openViewDialog(client)}
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => openEditDialog(client)}
                                className="flex items-center"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteClient(client)}
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
          {filteredClients.length > 0 && (
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

          {/* View Client Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent>
              {currentClient && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {currentClient.name}
                    </DialogTitle>
                    <DialogDescription>
                      Client ID: {currentClient.clientId || "N/A"}
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="projects">Projects</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Client Name
                        </h3>
                        <p className="mt-1">{currentClient.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Contact Person
                        </h3>
                        <p className="mt-1">
                          {currentClient.contactName || "N/A"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Contact Email
                          </h3>
                          <p className="mt-1">
                            {currentClient.contactEmail || "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Contact Phone
                          </h3>
                          <p className="mt-1">
                            {currentClient.contactPhone || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Status
                        </h3>
                        <div className="mt-1">
                          <Badge
                            variant={
                              currentClient.active ? "default" : "secondary"
                            }
                            className={
                              currentClient.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {currentClient.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Created
                        </h3>
                        <p className="mt-1">
                          {currentClient.createdAt
                            ? new Date(
                                currentClient.createdAt
                              ).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                      {currentClient.updatedAt && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Last Updated
                          </h3>
                          <p className="mt-1">
                            {new Date(
                              currentClient.updatedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-4 py-4">
                      <h3 className="text-sm font-medium">
                        Associated Projects
                      </h3>
                      {projects.filter(
                        (project) =>
                          project.clientCode === currentClient.clientId ||
                          project.clientName === currentClient.name
                      ).length > 0 ? (
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Project ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Start Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {projects
                                .filter(
                                  (project) =>
                                    project.clientCode ===
                                      currentClient.clientId ||
                                    project.clientName === currentClient.name
                                )
                                .map((project) => (
                                  <TableRow key={project.id}>
                                    <TableCell>
                                      {project.projectId || "-"}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      {project.name}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={
                                          project.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : project.status === "in_progress"
                                            ? "bg-blue-100 text-blue-800"
                                            : project.status === "on_hold"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                        }
                                      >
                                        {project.status
                                          ?.replace("_", " ")
                                          .replace(/\b\w/g, (l) =>
                                            l.toUpperCase()
                                          ) || "Planning"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {project.startDate
                                        ? new Date(
                                            project.startDate
                                          ).toLocaleDateString()
                                        : "-"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No projects associated with this client.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    {canEdit && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          openEditDialog(currentClient.id);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Client
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

          {/* Edit Client Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
                <DialogDescription>
                  Make changes to the client details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* <div className="grid gap-2">
                  <Label htmlFor="edit-clientId">Client ID</Label>
                  <Input
                    id="edit-clientId"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                  />
                </div> */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Client Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-contactName">Contact Person</Label>
                    <Input
                      id="edit-contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-contactEmail">Contact Email</Label>
                    <Input
                      id="edit-contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                  <Input
                    id="edit-contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                  />
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
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditClient}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
