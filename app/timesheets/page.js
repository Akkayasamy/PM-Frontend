"use client";

import { useState, useMemo, useEffect } from "react";
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
  Clock,
  Loader2,
  FileText,
  X,
  Filter
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
  const [subtasks, setSubtasks] = useState([]);

  // UI states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hours: "",
    projectId: "",
    milestoneId: "",
    taskId: "",
    subTaskId: "",
    description: "",
    userId: user?._id || "",
  });

  // Fetch Initial Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tsRes, projRes, msRes, taskRes] = await Promise.all([
        api.get(`/timesheet/user/${user?._id}`),
        api.get("/project"),
        api.get("/milestone"),
        api.get(`/task`),
      ]);
      setTimesheets(tsRes.data.timesheets || []);
      setProjects(projRes.data.project || []);
      setMilestones(msRes.data.milestones || []);
      setTasks(taskRes.data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchData();
  }, [user]);

  // Fetch subtasks logic
  useEffect(() => {
    const fetchSubtasks = async () => {
      if (!formData.taskId) {
        setSubtasks([]);
        return;
      }
      try {
        const selectedTask = tasks.find(t => t._id === formData.taskId);
        const targetId = selectedTask?.taskId || formData.taskId;
        const response = await api.get(`subtask/task/${targetId}`);
        setSubtasks(response.data.subTasks || []);
      } catch (err) {
        setSubtasks([]);
      }
    };
    fetchSubtasks();
  }, [formData.taskId, tasks]);

  // Cascading Logic
  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      const pId = m.projectId?._id || m.projectId;
      return pId === formData.projectId;
    });
  }, [milestones, formData.projectId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const pId = t.projectId?._id || t.projectId;
      const mId = t.milestoneId?._id || t.milestoneId;
      return pId === formData.projectId && (!formData.milestoneId || mId === formData.milestoneId);
    });
  }, [tasks, formData.projectId, formData.milestoneId]);

  const tableData = useMemo(() => {
    return timesheets.filter((ts) => {
      const matchesSearch = ts.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ts.projectId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const tsProjectId = ts.projectId?._id || ts.projectId;
      const matchesProject = projectFilter === "all" || tsProjectId === projectFilter;
      return matchesSearch && matchesProject;
    });
  }, [timesheets, searchTerm, projectFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (ts) => {
    setEditingId(ts._id);
    setFormData({
      date: new Date(ts.date).toISOString().split("T")[0],
      hours: ts.hours.toString(),
      projectId: ts.projectId?._id || ts.projectId || "",
      milestoneId: ts.milestoneId?._id || ts.milestoneId || "",
      taskId: ts.taskId?._id || ts.taskId || "",
      subTaskId: ts.subTaskId?._id || ts.subTaskId || "",
      description: ts.description || "",
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
      subTaskId: "",
      description: "",
      userId: user?._id || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTimesheet = async (id) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      setLoading(true);
      await api.delete(`/timesheet/${id}`);
      toast({ title: "Deleted", description: "Timesheet entry removed successfully." });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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

  const exportToCSV = () => {
    const headers = ["Date", "Project", "Milestone", "Task", "Hours", "Description"];
    const csvRows = tableData.map(ts => [
      new Date(ts.date).toLocaleDateString(),
      ts.projectId?.name || "",
      ts.milestoneId?.name || "",
      ts.taskId?.title || "",
      ts.hours,
      ts.description?.replace(/,/g, ";") || ""
    ]);
    const csvContent = [headers.join(","), ...csvRows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    // <ProtectedRoute requiredPermission="view_timesheets">
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Timesheets</h1>
            <p className="text-muted-foreground">Manage your work logs and track billable hours.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-8 w-full sm:w-[250px] bg-white text-[13px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV} disabled={tableData.length === 0} className="text-[13px]">
                <FileText className="mr-2 h-4 w-4" /> Export
              </Button>
              {/* CHANGED: Primary color to Indigo to match Task Page style */}
              <Button onClick={handleOpenNew}>
                <Plus className="mr-2 h-4 w-4" /> Log Time
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-8 w-[180px] bg-white border-slate-200 text-[13px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="bg-white px-3 py-1 text-slate-500 font-normal border-slate-200 h-8">
            User: <span className="font-semibold ml-1 text-indigo-700">{user?.name}</span>
          </Badge>
          {(projectFilter !== "all" || searchTerm) && (
            <Button variant="ghost" size="sm" onClick={() => { setProjectFilter("all"); setSearchTerm(""); }} className="h-8">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px] text-xs font-bold uppercase text-slate-500">Date</TableHead>
                <TableHead className="text-xs font-bold uppercase text-slate-500">Project Info</TableHead>
                <TableHead className="text-xs font-bold uppercase text-slate-500">Work Item</TableHead>
                <TableHead className="text-xs font-bold uppercase text-slate-500">Description</TableHead>
                <TableHead className="w-[100px] text-xs font-bold uppercase text-slate-500 text-center">Hours</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">No entries found.</TableCell></TableRow>
              ) : (
                tableData.map((ts) => (
                  <TableRow key={ts._id} className="group border-slate-100">
                    <TableCell className="text-[13px] font-medium text-slate-700">
                      {new Date(ts.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {/* Changed link color to indigo to match task style */}
                        <span className="text-[13px] font-semibold text-indigo-700">{ts.projectId?.name || "N/A"}</span>
                        <span className="text-[11px] text-slate-400">{ts.milestoneId?.name || "General"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal text-[11px] w-fit">
                          {ts.taskId?.title || "Direct Work"}
                        </Badge>
                        {ts.subTaskId && (
                          <span className="text-[10px] text-indigo-500 font-medium ml-1">↳ {ts.subTaskId?.title}</span>
                        )}
                      </div>
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
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTimesheet(ts._id)} className="text-red-600 cursor-pointer">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog for entry */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 border-none shadow-2xl rounded-xl overflow-hidden">

          {/* Clean, Simple Header */}
          <DialogHeader className="px-5 py-3 border-b bg-white">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <DialogTitle className="text-base font-bold text-slate-900">
                {editingId ? "Edit Time Entry" : "Log New Time"}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Body: No Scroll, Multi-column rows */}
          <div className="p-5 grid gap-4 bg-white">

            {/* Line 1: Project and Milestone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-0.5">Project</Label>
                <Select value={formData.projectId} onValueChange={(val) => setFormData(prev => ({ ...prev, projectId: val, milestoneId: "", taskId: "", subTaskId: "" }))}>
                  <SelectTrigger className="h-9 text-[13px] border-slate-200 focus:ring-1 focus:ring-indigo-500">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-0.5">Milestone</Label>
                <Select value={formData.milestoneId} disabled={!formData.projectId} onValueChange={(val) => setFormData(prev => ({ ...prev, milestoneId: val, taskId: "", subTaskId: "" }))}>
                  <SelectTrigger className="h-9 text-[13px] border-slate-200 focus:ring-1 focus:ring-indigo-500">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMilestones.map(m => <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line 2: Task and Subtask */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-0.5">Task</Label>
                <Select value={formData.taskId} disabled={!formData.projectId} onValueChange={(val) => setFormData(prev => ({ ...prev, taskId: val, subTaskId: "" }))}>
                  <SelectTrigger className="h-9 text-[13px] border-slate-200 focus:ring-1 focus:ring-indigo-500">
                    <SelectValue placeholder="Select Task" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTasks.map(t => <SelectItem key={t._id} value={t._id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-0.5">Subtask (Optional)</Label>
                <Select value={formData.subTaskId} disabled={!formData.taskId} onValueChange={(val) => setFormData(prev => ({ ...prev, subTaskId: val }))}>
                  <SelectTrigger className="h-9 text-[13px] border-slate-200 focus:ring-1 focus:ring-indigo-500">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtasks.length > 0 ? (
                      subtasks.map(s => <SelectItem key={s._id} value={s._id}>{s.title}</SelectItem>)
                    ) : (
                      <SelectItem value="none" disabled>No subtasks found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line 3: Date and Hours */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-0.5">Date</Label>
                <Input type="date" name="date" className="h-9 text-[13px] border-slate-200 focus:ring-1 focus:ring-indigo-500" value={formData.date} onChange={handleInputChange} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-0.5">Hours Worked</Label>
                <Input type="number" name="hours" placeholder="0.0" className="h-9 text-[13px] border-slate-200 focus:ring-1 focus:ring-indigo-500" value={formData.hours} onChange={handleInputChange} />
              </div>
            </div>

            {/* Line 4: Description */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-slate-400 ml-0.5">Description</Label>
              <Textarea
                name="description"
                placeholder="Briefly describe your progress..."
                className="text-[13px] min-h-[70px] max-h-[90px] resize-none border-slate-200 p-2.5 focus:ring-1 focus:ring-indigo-500"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-5 py-3 border-t bg-slate-50/50 flex flex-row items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-8 text-[12px] px-3 font-medium text-slate-600">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="h-8 text-[12px] px-4 bg-slate-900 hover:bg-slate-800 text-white transition-all font-medium">
              {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {editingId ? "Update Entry" : "Save Entry"}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </DashboardShell>
    // </ProtectedRoute>
  );
}