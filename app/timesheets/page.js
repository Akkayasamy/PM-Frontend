"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
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
  FileText,
  Calendar,
  Clock,
  Briefcase,
  Layers,
  CheckCircle2,
  Loader2
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import api from "@/config/api";

export default function TimesheetPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Data states
  const [timesheets, setTimesheets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);

  // UI states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track if editing
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hours: "",
    projectId: "",
    milestoneId: "",
    taskId: "",
    description: "",
    userId: user?._id || "",
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tsRes, projRes, msRes, taskRes] = await Promise.all([
        api.get(`/timesheet/user/${user?._id}`),
        api.get("/project"),
        api.get("/milestone"),
        api.get(`/task/user/${user?._id}`),
      ]);
      setTimesheets(tsRes.data.timesheets);
      setProjects(projRes.data.project);
      setMilestones(msRes.data.milestones);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchData();
  }, [user]);

  // Cascading Logic
  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => m.projectId === formData.projectId);
  }, [milestones, formData.projectId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => 
        t.projectId === formData.projectId && 
        (!formData.milestoneId || t.milestoneId === formData.milestoneId)
    );
  }, [tasks, formData.projectId, formData.milestoneId]);

  const tableData = useMemo(() => {
    return timesheets.filter((ts) => {
      const matchesSearch = ts.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === "all" || ts.projectId?._id === projectFilter;
      return matchesSearch && matchesProject;
    });
  }, [timesheets, searchTerm, projectFilter]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // FIX: Edit functionality
  const handleEdit = (ts) => {
    setEditingId(ts._id);
    setFormData({
      date: new Date(ts.date).toISOString().split("T")[0],
      hours: ts.hours.toString(),
      projectId: ts.projectId?._id || "",
      milestoneId: ts.milestoneId?._id || "",
      taskId: ts.taskId?._id || ts.taskId || "",
      description: ts.description,
      userId: user._id,
    });
    setIsDialogOpen(true);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      hours: "",
      projectId: "",
      milestoneId: "",
      taskId: "",
      description: "",
      userId: user?._id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = { ...formData, userId: user._id };
      
      if (editingId) {
        await api.put(`/timesheet/${editingId}`, payload);
        toast({ title: "Updated", description: "Timesheet entry updated." });
      } else {
        await api.post("/timesheet", payload);
        toast({ title: "Success", description: "Timesheet entry saved." });
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to save entry.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="view_timesheets">
      <DashboardShell>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Timesheets</h1>
              <p className="text-muted-foreground">Track work hours for projects and tasks.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8 w-[250px] bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="bg-sky-600 hover:bg-sky-700" onClick={handleOpenNew}>
                <Plus className="mr-2 h-4 w-4" /> Log Time
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="bg-white px-3 py-1 text-slate-500 font-normal border-slate-200">
                Logged as: <span className="font-semibold ml-1 text-indigo-700">{user?.name}</span>
             </Badge>
             <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px] h-8 bg-white border-slate-200 text-[13px]">
                    <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                </SelectContent>
             </Select>
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px] text-xs font-bold uppercase text-slate-500">Date</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-slate-500">Project & Milestone</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-slate-500">Task</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-slate-500">Description</TableHead>
                  <TableHead className="w-[100px] text-xs font-bold uppercase text-slate-500 text-center">Hours</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((ts) => (
                  <TableRow key={ts._id} className="group border-slate-100">
                    <TableCell className="text-[13px] font-medium text-slate-700">
                        {new Date(ts.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-sky-700">{ts.projectId?.name}</span>
                            <span className="text-[11px] text-slate-400">{ts.milestoneId?.name || "No Milestone"}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal text-[11px]">
                            {ts.taskId?.title || "General Work"}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-600 italic max-w-[300px] truncate">
                        {ts.description}
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold">{ts.hours}h</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[140px]">
                          <DropdownMenuItem onClick={() => handleEdit(ts)} className="text-slate-600 cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4"/> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <Trash className="mr-2 h-4 w-4"/> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Detailed Modal - FIX: Added sizing constraints */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-xl">
            <DialogHeader className="bg-indigo-900 p-6 text-white sticky top-0 z-10">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" /> {editingId ? "Edit Time Entry" : "Log New Time"}
              </DialogTitle>
              <p className="text-indigo-200 text-xs mt-1">Fill in the details for your work activity.</p>
            </DialogHeader>

            <div className="p-6 grid gap-5 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase font-bold text-slate-400">Date</Label>
                  <Input type="date" name="date" className="h-9 text-[13px] border-slate-200" value={formData.date} onChange={handleInputChange} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase font-bold text-slate-400">Hours Worked</Label>
                  <Input type="number" name="hours" placeholder="0.0" className="h-9 text-[13px] border-slate-200" value={formData.hours} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase font-bold text-slate-400">Project</Label>
                <Select value={formData.projectId} onValueChange={(val) => setFormData(prev => ({...prev, projectId: val, milestoneId: "", taskId: ""}))}>
                  <SelectTrigger className="h-9 text-[13px] border-slate-200">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase font-bold text-slate-400">Milestone</Label>
                  <Select value={formData.milestoneId} disabled={!formData.projectId} onValueChange={(val) => setFormData(prev => ({...prev, milestoneId: val, taskId: ""}))}>
                    <SelectTrigger className="h-9 text-[13px] border-slate-200">
                      <SelectValue placeholder="Select Milestone" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMilestones.map(m => <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase font-bold text-slate-400">Task</Label>
                  <Select value={formData.taskId} disabled={!formData.projectId} onValueChange={(val) => setFormData(prev => ({...prev, taskId: val}))}>
                    <SelectTrigger className="h-9 text-[13px] border-slate-200">
                      <SelectValue placeholder="Select Task" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTasks.map(t => <SelectItem key={t._id} value={t._id}>{t.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase font-bold text-slate-400">Work Description</Label>
                <Textarea 
                  name="description"
                  placeholder="Describe your progress..." 
                  className="text-[13px] min-h-[100px] resize-none border-slate-200"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <DialogFooter className="bg-slate-50 p-4 border-t sticky bottom-0 z-10">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[13px]">Cancel</Button>
              <Button className="bg-sky-600 hover:bg-sky-700 text-white px-8 text-[13px] font-semibold" onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editingId ? "Update Entry" : "Save Entry"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </ProtectedRoute>
  );
}