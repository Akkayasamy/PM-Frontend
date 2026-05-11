"use client";

import { useState, useEffect, useMemo } from "react";
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
  User,
  Eye,
  Filter,
  X,
  Mail,
  Phone,
  Tag,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { toastMessages } from "@/lib/utils";
import api from "@/config/api";

export default function ConsultantsPage() {
  const { user, hasPermission } = useAuth();
  const { getItems, createItem, updateItem, deleteItem, getItemById } =
    useData();

  const { toast } = useToast();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentConsultantId, setCurrentConsultantId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    consultantId: "",
    name: "",
    role: "",
    email: "",
    mobile: "",
    ratePerHour: "",
    designation: "",
    teamName: "",
    type: "",
    active: true,
    skills: [],
  });
  const [newSkill, setNewSkill] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeFilter, setActiveFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");

  const [isSuccess, setSuccess] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentConsultant, setCurrentConsultant] = useState(null);

  // Memoize data to prevent unnecessary re-renders
  // const consultants = useMemo(() => getItems("consultants"), [getItems]);
  // const roles = useMemo(
  //   () => getItems("users").map((user) => ({ id: user.id, role: user.role })),
  //   [getItems]
  // );

  // const roles = users.map((user) => ({ id: user._id, role: user.role }));

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
        const response = await api.get("role");
        setRoles(response.data.roles);
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
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("consultant");
        setConsultants(response.data.consultants);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, [isSuccess]);

  // Get current consultant data
  // const currentConsultant = useMemo(
  //   () =>
  //     currentConsultantId
  //       ? getItemById("consultants", currentConsultantId)
  //       : null,
  //   [currentConsultantId, getItemById]
  // );

  // Get unique team names for filter
  const teamNames = useMemo(
    () => [
      ...new Set(
        consultants.map((consultant) => consultant.teamName).filter(Boolean)
      ),
    ],
    [consultants]
  );

  // Filter and sort consultants
  const filteredConsultants = useMemo(() => {
    let result = [...consultants];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (consultant) =>
          consultant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          consultant.consultantId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          consultant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          consultant.designation
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          consultant.skills?.some((skill) =>
            skill.skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply active filter
    if (activeFilter !== "all") {
      result = result.filter((consultant) =>
        activeFilter === "active" ? consultant.active : !consultant.active
      );
    }

    // Apply team filter
    if (teamFilter !== "all") {
      result = result.filter(
        (consultant) => consultant.teamName === teamFilter
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special cases
      if (sortField === "role") {
        const aRole = roles.find((r) => r.id.toString() === a.role)?.role || "";
        const bRole = roles.find((r) => r.id.toString() === b.role)?.role || "";
        aValue = aRole;
        bValue = bRole;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    consultants,
    searchTerm,
    sortField,
    sortDirection,
    activeFilter,
    teamFilter,
    roles,
  ]);

  // Load consultant data when editing
  useEffect(() => {
    if (currentConsultant && isEditDialogOpen) {
      setFormData({
        consultantId: currentConsultant.consultantId || "",
        name: currentConsultant.name || "",
        role: currentConsultant.role || "",
        email: currentConsultant.email || "",
        mobile: currentConsultant.mobile || "",
        ratePerHour: currentConsultant.ratePerHour || "",
        designation: currentConsultant.designation || "",
        teamName: currentConsultant.teamName || "",
        type: currentConsultant.type || "",
        active:
          currentConsultant.active !== undefined
            ? currentConsultant.active
            : true,
        skills: currentConsultant.skills || [],
      });
    }
  }, [currentConsultant, isEditDialogOpen]);

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

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [
          ...prev.skills,
          // {
          //   id:
          //     prev.skills.length > 0
          //       ? Math.max(...prev.skills.map((s) => s.id)) + 1
          //       : 1,
          //   consultantId: currentConsultantId || 0,
          //   skill: newSkill.trim(),
          // },
          newSkill,
        ],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillId),
    }));
  };

  const resetForm = () => {
    setFormData({
      consultantId: "",
      name: "",
      role: "",
      email: "",
      mobile: "",
      ratePerHour: "",
      designation: "",
      teamName: "",
      type: "",
      active: true,
      skills: [],
    });
    setCurrentConsultantId(null);
    setNewSkill("");
  };

  const handleCreateConsultant = async () => {
    try {
      // createItem("consultants", {
      //   ...formData,
      //   createdBy: user.id,
      //   createdAt: new Date().toISOString(),
      // });
      const response = await api.post("consultant", formData);
      setSuccess(response);
      toast(toastMessages.create("Consultant", formData.name));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("create", "consultant", error));
    }
  };

  const handleEditConsultant = async (consultant) => {
    try {
      // updateItem("consultants", currentConsultantId, {
      //   ...formData,
      //   updatedAt: new Date().toISOString(),
      // });
      const response = await api.put("consultant", formData);
      setSuccess(response);
      toast(toastMessages.update("Consultant", formData.name));
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast(toastMessages.error("update", "consultant", error));
    }
  };

  const handleDeleteConsultant = async (consultant) => {
    try {
      // const consultant = getItemById("consultants", id);
      // deleteItem("consultants", id);
      const response = await api.delete(
        `consultant/${consultant.consultantId}`
      );
      setSuccess(response);
      toast(toastMessages.delete("Consultant", consultant.name));
    } catch (error) {
      toast(toastMessages.error("delete", "consultant", error));
    }
  };

  const openEditDialog = (consultant) => {
    setCurrentConsultant(consultant);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (consultant) => {
    setCurrentConsultant(consultant);
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
    setTeamFilter("all");
  };

  const types = [
    { name: "Functional", value: "Functional" },
    { name: "Technical", value: "Technical" },
  ];

  const canCreate = hasPermission("create_consultants");
  const canEdit = hasPermission("edit_consultants");
  const canDelete = hasPermission("delete_consultants");

  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Consultants</h1>
              <p className="text-muted-foreground">
                Manage your consultants and their skills
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search consultants..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {canCreate && (
                <>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Consultant
                  </Button>
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Consultant</DialogTitle>
                        <DialogDescription>
                          Add a new consultant to your organization
                        </DialogDescription>
                      </DialogHeader>
                      <Tabs defaultValue="basic">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="basic">Basic Info</TabsTrigger>
                          <TabsTrigger value="skills">Skills</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 gap-4">
                            {/* <div className="grid gap-2">
                              <Label htmlFor="consultantId">
                                Consultant ID
                              </Label>
                              <Input
                                id="consultantId"
                                name="consultantId"
                                value={formData.consultantId}
                                onChange={handleInputChange}
                              />
                            </div> */}
                            <div className="grid gap-2">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="mobile">Mobile</Label>
                              <Input
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="role">Role</Label>
                              <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                  handleSelectChange("role", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem
                                      key={role._id}
                                      value={role.name}
                                    >
                                      {role.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="designation">Designation</Label>
                              <Input
                                id="designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="teamName">Team Name</Label>
                              <Select
                                value={formData.teamName}
                                onValueChange={(value) =>
                                  handleSelectChange("teamName", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Team" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teams.map((team) => (
                                    <SelectItem
                                      key={team._id}
                                      value={team.name}
                                    >
                                      {team.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="type">Type</Label>
                              <Select
                                value={formData.type}
                                onValueChange={(value) =>
                                  handleSelectChange("type", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {types.map((type) => (
                                    <SelectItem
                                      key={type._id}
                                      value={type.name}
                                    >
                                      {type.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="ratePerHour">
                                Rate Per Hour ($)
                              </Label>
                              <Input
                                id="ratePerHour"
                                name="ratePerHour"
                                type="number"
                                value={formData.ratePerHour}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="grid gap-2">
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

                        <TabsContent value="skills" className="space-y-4 mt-4">
                          <div className="space-y-4">
                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <Label htmlFor="newSkill">Add Skill</Label>
                                <Input
                                  id="newSkill"
                                  value={newSkill}
                                  onChange={(e) => setNewSkill(e.target.value)}
                                  placeholder="Enter a skill"
                                />
                              </div>
                              <Button type="button" onClick={addSkill}>
                                Add
                              </Button>
                            </div>

                            <div className="border rounded-md p-4">
                              <h3 className="text-sm font-medium mb-2">
                                Skills
                              </h3>
                              {formData.skills.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No skills added yet.
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {formData.skills.map((skill, index) => (
                                    <Badge
                                      key={index}
                                      className="flex items-center gap-1 px-3 py-1"
                                    >
                                      {skill}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => removeSkill(skill)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
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
                        <Button onClick={handleCreateConsultant}>
                          Create Consultant
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

            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teamNames.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(activeFilter !== "all" || teamFilter !== "all" || searchTerm) && (
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
              Showing {filteredConsultants.length} of {consultants.length}{" "}
              consultants
            </div>
          </div>

          <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead
                    className="w-[15%] cursor-pointer"
                    onClick={() => handleSort("consultantId")}
                  >
                    <div className="flex items-center">
                      Consultant ID
                      {sortField === "consultantId" ? (
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
                    onClick={() => handleSort("designation")}
                  >
                    <div className="flex items-center">
                      Designation
                      {sortField === "designation" ? (
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
                    onClick={() => handleSort("teamName")}
                  >
                    <div className="flex items-center">
                      Team
                      {sortField === "teamName" ? (
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
                    onClick={() => handleSort("ratePerHour")}
                  >
                    <div className="flex items-center">
                      Rate/Hour
                      {sortField === "ratePerHour" ? (
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
                {filteredConsultants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">
                          No consultants found.{" "}
                          {canCreate && "Add your first consultant!"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConsultants.map((consultant) => (
                    <TableRow key={consultant.id} className="hover:bg-muted/50">
                      <TableCell>{consultant.consultantId || "-"}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{consultant.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {consultant.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{consultant.designation || "-"}</TableCell>
                      <TableCell>{consultant.teamName || "-"}</TableCell>
                      <TableCell>${consultant.ratePerHour || "0"}/hr</TableCell>
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
                              onClick={() => openViewDialog(consultant)}
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => openEditDialog(consultant)}
                                className="flex items-center"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteConsultant(consultant)
                                }
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

          {/* View Consultant Dialog */}
          {currentConsultant && (
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {currentConsultant.name}
                  </DialogTitle>
                  <DialogDescription>
                    Consultant ID: {currentConsultant.consultantId || "N/A"}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Status
                        </h3>
                        <div className="mt-1">
                          <Badge
                            className={
                              currentConsultant.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {currentConsultant.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Role
                        </h3>
                        <p className="mt-1">{currentConsultant.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Email
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p>{currentConsultant.email || "N/A"}</p>
                          {currentConsultant.email && (
                            <a
                              href={`mailto:${currentConsultant.email}`}
                              className="text-primary text-sm"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Mobile
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p>{currentConsultant.mobile || "N/A"}</p>
                          {currentConsultant.mobile && (
                            <a
                              href={`tel:${currentConsultant.mobile}`}
                              className="text-primary text-sm"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Designation
                        </h3>
                        <p className="mt-1">
                          {currentConsultant.designation || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Team
                        </h3>
                        <p className="mt-1">
                          {currentConsultant.teamName || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Consultant Type
                        </h3>
                        <p className="mt-1">
                          {currentConsultant.type || "N/A"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Rate Per Hour
                        </h3>
                        <p className="mt-1">
                          ${currentConsultant.ratePerHour || "0"}/hr
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4 mt-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Skill Set
                      </h3>
                      {currentConsultant.skills &&
                      currentConsultant.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentConsultant.skills.map((skill, index) => (
                            <Badge key={index} className="px-3 py-1">
                              <Tag className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          No skills listed.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  {canEdit && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        openEditDialog(currentConsultant.id);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Consultant
                    </Button>
                  )}
                  <Button onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Consultant Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Consultant</DialogTitle>
                <DialogDescription>
                  Make changes to the consultant details
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* <div className="grid gap-2">
                      <Label htmlFor="edit-consultantId">Consultant ID</Label>
                      <Input
                        id="edit-consultantId"
                        name="consultantId"
                        value={formData.consultantId}
                        onChange={handleInputChange}
                      />
                    </div> */}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-mobile">Mobile</Label>
                      <Input
                        id="edit-mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          handleSelectChange("role", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role._id} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-designation">Designation</Label>
                      <Input
                        id="edit-designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-teamName">Team Name</Label>
                      <Select
                        value={formData.teamName}
                        onValueChange={(value) =>
                          handleSelectChange("teamName", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team._id} value={team.name}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* <Input
                        id="edit-teamName"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleInputChange}
                      /> */}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          handleSelectChange("type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((type) => (
                            <SelectItem key={type._id} value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-ratePerHour">
                        Rate Per Hour ($)
                      </Label>
                      <Input
                        id="edit-ratePerHour"
                        name="ratePerHour"
                        type="number"
                        value={formData.ratePerHour}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid gap-2">
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
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="edit-newSkill">Add Skill</Label>
                        <Input
                          id="edit-newSkill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Enter a skill"
                        />
                      </div>
                      <Button type="button" onClick={addSkill}>
                        Add
                      </Button>
                    </div>

                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2">Skills</h3>
                      {formData.skills.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No skills added yet.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {skill}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => removeSkill(skill)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
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
                <Button onClick={handleEditConsultant}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
