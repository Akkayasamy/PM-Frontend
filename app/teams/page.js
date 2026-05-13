"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { DashboardShell } from "@/components/dashboard-shell";
import ProtectedRoute from "@/components/protected-route";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  X,
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Add this import at the top with other imports
import { useToast } from "@/hooks/use-toast";
import { toastMessages } from "@/lib/utils";
import api from "@/config/api";

function generateTeamId() {
  return "TEAM-" + Math.random().toString(36).substring(2, 9).toUpperCase();
}
const ITEMS_PER_PAGE = 10;

export default function TeamsPage() {
  const { user, hasPermission } = useAuth();
  const { getItems, createItem, updateItem, deleteItem, getItemById } =
    useData();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [formData, setFormData] = useState({
    teamId: "",
    name: "",
    description: "",
    leadId: "",
    deliveryManager: "",
    active: true,
    members: [],
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeFilter, setActiveFilter] = useState("all");
  const [leadFilter, setLeadFilter] = useState("all");
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isSuccess, setSuccess] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Inside the TeamsPage component, add this line near the top
  const { toast } = useToast();

  //const teams = getItems("teams");
  const projects = getItems("projects");
  //const users = getItems("users");
  const teamMembers = users.filter(
    (u) => u.role === "team_member" || u.role === "project_manager"
  );

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
        const response = await api.get("team");
        setTeams(response.data.teams);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [isSuccess]);

  // Filter and sort teams
  useEffect(() => {
    let result = [...teams];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (team) =>
          team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.teamId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active filter
    if (activeFilter !== "all") {
      result = result.filter((team) =>
        activeFilter === "active" ? team.active : !team.active
      );
    }

    // Apply lead filter
    if (leadFilter !== "all") {
      result = result.filter((team) => team.leadId === leadFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special cases
      if (sortField === "leadId") {
        aValue = getItemById("users", Number.parseInt(a.leadId))?.name || "";
        bValue = getItemById("users", Number.parseInt(b.leadId))?.name || "";
      } else if (sortField === "deliveryManager") {
        aValue =
          getItemById("users", Number.parseInt(a.deliveryManager))?.name || "";
        bValue =
          getItemById("users", Number.parseInt(b.deliveryManager))?.name || "";
      } else if (sortField === "members") {
        aValue = a.members?.length || 0;
        bValue = b.members?.length || 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredTeams(result);
  }, [
    teams,
    searchTerm,
    sortField,
    sortDirection,
    activeFilter,
    leadFilter,
    getItemById,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      teamId: "",
      name: "",
      description: "",
      leadId: "",
      deliveryManager: "",
      active: true,
      members: [],
    });
    setCurrentTeam(null);
  };

  // Update handleCreateTeam function
  const handleCreateTeam = async () => {
    try {
      // const teamId = generateTeamId();
      // createItem("teams", {
      //   ...formData,
      //   teamId: teamId,
      //   createdBy: user.id,
      //   createdAt: new Date().toISOString(),
      // });
      const response = await api.post("team", formData);
      setSuccess(response);
      toast(toastMessages.create("Team", formData.name));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("create", "team", error));
    }
  };

  // Update handleEditTeam function
  const handleEditTeam = async () => {
    try {
      // updateItem("teams", currentTeam.id, {
      //   ...formData,
      //   updatedAt: new Date().toISOString(),
      // });
      const response = await api.put("team", formData);
      setSuccess(response);
      toast(toastMessages.update("Team", formData.name));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("update", "team", error));
    }
  };

  // Update handleDeleteTeam function
  const handleDeleteTeam = async (team) => {
    try {
      //  const team = getItemById("teams", id);
      //deleteItem("teams", id);
      const response = await api.delete(`team/${team.teamId}`);
      setSuccess(response);
      toast(toastMessages.delete("Team", team.name));
    } catch (error) {
      toast(toastMessages.error("delete", "team", error));
    }
  };

  const openEditDialog = (team) => {
    // const team = getItemById("teams", id);
    setCurrentTeam(team);
    setFormData({
      teamId: team.teamId || "",
      name: team.name,
      description: team.description,
      leadId: team.leadId,
      deliveryManager: team.deliveryManager,
      active: team.active,
      members: team.members || [],
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (team) => {
    //  const team = getItemById("teams", id);
    setCurrentTeam(team);
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
    setLeadFilter("all");
  };

  const canCreate = hasPermission("create_teams");
  const canEdit = hasPermission("edit_teams");
  const canDelete = hasPermission("delete_teams");

  const handleAddMember = (memberId) => {
    if (!formData.members.includes(memberId)) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, memberId],
      }));
    }
  };

  const handleRemoveMember = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((id) => id !== memberId),
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Add this function after the existing handleRemoveMember function:

  const handleMemberSelect = (value) => {
    if (value && !formData.members.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, value],
      }));
    }
  };

  const getUser = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user;
  };

  return (
    <ProtectedRoute requiredPermission="view_team_members">
      <DashboardShell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
              <p className="text-muted-foreground">
                Manage your teams and team members
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search teams..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {canCreate && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Team
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

            <Select value={leadFilter} onValueChange={setLeadFilter}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Team Lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                {teamMembers.map((member, i) => (
                  <SelectItem key={i} value={member._id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(activeFilter !== "all" || leadFilter !== "all" || searchTerm) && (
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
              Showing {filteredTeams?.length} of {teams?.length} teams
            </div>
          </div>

          <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead
                    className="w-[15%] cursor-pointer"
                    onClick={() => handleSort("teamId")}
                  >
                    <div className="flex items-center">
                      Team ID
                      {sortField === "teamId" ? (
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
                    className="w-[25%] cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name
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
                    onClick={() => handleSort("leadId")}
                  >
                    <div className="flex items-center">
                      Team Lead
                      {sortField === "leadId" ? (
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
                    onClick={() => handleSort("deliveryManager")}
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
                    onClick={() => handleSort("members")}
                  >
                    <div className="flex items-center">
                      Members
                      {sortField === "members" ? (
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
                {paginatedTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">
                          No teams found.{" "}
                          {canCreate && "Create your first team!"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTeams.map((team, i) => (
                    <TableRow key={i} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {team.teamId || "-"}
                      </TableCell>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>
                        {team.leadId
                          ? getUser(team.leadId)?.name || "Unassigned"
                          : "Unassigned"}
                      </TableCell>
                      <TableCell>
                        {team.deliveryManager
                          ? getUser(team.leadId)?.name || "Unassigned"
                          : "Unassigned"}
                      </TableCell>
                      <TableCell>
                        {team.members ? team.members.length : 0} members
                      </TableCell>
                      <TableCell>
                        {team.active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openViewDialog(team)}
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => openEditDialog(team)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteTeam(team)}
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

          {/* Create Team Dialog */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Add a new team to your organization
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="members">Team Members</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Team Name</Label>
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
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="leadId">Team Lead</Label>
                        <Select
                          value={formData.leadId}
                          onValueChange={(value) =>
                            handleSelectChange("leadId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team lead" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member, i) => (
                              <SelectItem key={i} value={member._id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="deliveryManager">
                          Delivery Manager
                        </Label>
                        <Select
                          value={formData.deliveryManager}
                          onValueChange={(value) =>
                            handleSelectChange("deliveryManager", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a delivery manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member, i) => (
                              <SelectItem key={i} value={member._id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  </div>
                </TabsContent>

                <TabsContent value="members" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Current Team Members</Label>
                      <div className="flex flex-wrap gap-2 mb-4 p-2 border rounded-md min-h-[60px]">
                        {formData.members.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No members added yet
                          </p>
                        ) : (
                          formData.members.map((memberId, i) => {
                            const member = users.find(
                              (u) => u._id === memberId
                            );
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
                                  onClick={() => handleRemoveMember(memberId)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ) : null;
                          })
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="add-member">Add Team Member</Label>
                      <Select onValueChange={handleMemberSelect}>
                        <SelectTrigger id="add-member">
                          <SelectValue placeholder="Select a team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers
                            .filter(
                              (member) => !formData.members.includes(member._id)
                            )
                            .map((member, i) => (
                              <SelectItem key={i} value={member._id}>
                                {member.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Team Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Team</DialogTitle>
                <DialogDescription>
                  Make changes to the team details
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="members">Team Members</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Team Name</Label>
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
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="leadId">Team Lead</Label>
                        <Select
                          value={formData.leadId}
                          onValueChange={(value) =>
                            handleSelectChange("leadId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team lead" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member, i) => (
                              <SelectItem key={i} value={member._id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="deliveryManager">
                          Delivery Manager
                        </Label>
                        <Select
                          value={formData.deliveryManager}
                          onValueChange={(value) =>
                            handleSelectChange("deliveryManager", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a delivery manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member, i) => (
                              <SelectItem key={i} value={member._id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  </div>
                </TabsContent>

                <TabsContent value="members" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Current Team Members</Label>
                      <div className="flex flex-wrap gap-2 mb-4 p-2 border rounded-md min-h-[60px]">
                        {formData.members.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No members added yet
                          </p>
                        ) : (
                          formData.members.map((memberId, i) => {
                            const member = users.find(
                              (u) => u._id === memberId
                            );
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
                                  onClick={() => handleRemoveMember(memberId)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ) : null;
                          })
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-add-member">Add Team Member</Label>
                      <Select onValueChange={handleMemberSelect}>
                        <SelectTrigger id="edit-add-member">
                          <SelectValue placeholder="Select a team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers
                            .filter(
                              (member) => !formData.members.includes(member._id)
                            )
                            .map((member, i) => (
                              <SelectItem key={i} value={member._id}>
                                {member.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditTeam}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pagination controls */}
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

          {/* View Team Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Team Details</DialogTitle>
                <DialogDescription>
                  {currentTeam?.description || "No description provided"}
                </DialogDescription>
              </DialogHeader>
              {currentTeam && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Team ID
                    </h3>
                    <p className="text-base font-medium mt-1">
                      {currentTeam.teamId}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Team Name
                      </h3>
                      <p className="text-base font-medium mt-1">
                        {currentTeam.name}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Status
                      </h3>
                      <div className="mt-1">
                        {currentTeam.active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Team Lead
                      </h3>
                      <p className="text-base mt-1">
                        {currentTeam.leadId
                          ? getUser(currentTeam.leadId)?.name || "Unassigned"
                          : "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Delivery Manager
                      </h3>
                      <p className="text-base mt-1">
                        {currentTeam.deliveryManager
                          ? getUser(currentTeam.leadId)?.name || "Unassigned"
                          : "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Team Members
                    </h3>
                    {currentTeam.members && currentTeam.members.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {currentTeam.members.map((memberId, i) => {
                            const member = users.find(
                              (u) => u._id === memberId
                            );
                            return member ? (
                              <Badge key={i} variant="outline">
                                {member.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        No team members assigned
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Created
                    </h3>
                    <p className="text-sm mt-1">
                      {currentTeam.createdAt
                        ? new Date(currentTeam.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter className="mt-6">
                {canEdit && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      openEditDialog(currentTeam);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Team
                  </Button>
                )}
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
