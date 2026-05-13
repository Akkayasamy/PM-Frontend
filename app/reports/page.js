"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    BarChart3,
    ChevronRight,
    Search,
    FolderRoot,
    ArrowLeft,
    Clock,
    Share2,
    FileText,
    Table as TableIcon
} from 'lucide-react';
import api from '@/config/api';
import { DashboardShell } from '@/components/dashboard-shell';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// PDF & Excel Exports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportsListPage() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [timesheetData, setTimesheetData] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState("categories");

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        projectId: "all",
        userId: "all",
        period: "custom"
    });

    const handlePeriodChange = (period) => {
        const today = new Date();
        let from = "";
        let to = today.toISOString().split('T')[0];

        if (period === "weekly") {
            const lastWeek = new Date();
            lastWeek.setDate(today.getDate() - 7);
            from = lastWeek.toISOString().split('T')[0];
        } else if (period === "monthly") {
            const lastMonth = new Date();
            lastMonth.setMonth(today.getMonth() - 1);
            from = lastMonth.toISOString().split('T')[0];
        } else if (period === "yearly") {
            const lastYear = new Date();
            lastYear.setFullYear(today.getFullYear() - 1);
            from = lastYear.toISOString().split('T')[0];
        }

        setFilters({
            ...filters,
            period: period,
            fromDate: from || (period === "custom" ? filters.fromDate : ""),
            toDate: to || (period === "custom" ? filters.toDate : "")
        });
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Timesheet Report", 14, 15);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

            const tableColumn = ["User", "Project", "Date", "Hours", "Status"];
            const tableRows = timesheetData.map(ts => [
                ts.userName || "N/A",
                ts.projectName || "N/A",
                ts.date ? new Date(ts.date).toLocaleDateString() : "N/A",
                `${ts.hours || 0}h`,
                ts.status || "N/A"
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 30,
                theme: 'striped',
                headStyles: { fillColor: [0, 145, 255] },
                styles: { fontSize: 9, cellPadding: 3 },
                alternateRowStyles: { fillColor: [245, 247, 249] }
            });

            doc.save(`Timesheet_Report_${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
        }
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(timesheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheets");
        XLSX.writeFile(workbook, `Timesheet_Report_${new Date().getTime()}.xlsx`);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Timesheet Report',
                    text: `Shared Timesheet Report entries: ${timesheetData.length}`,
                    url: window.location.href
                });
            } catch (err) { console.error(err); }
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [projRes, userRes] = await Promise.all([
                    api.get("project"),
                    api.get("users")
                ]);
                const projData = projRes.data.project || [];
                setProjects(projData);
                setFilteredProjects(projData);
                setUsers(userRes.data.users || []);
            } catch (err) {
                console.error("Data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const getTimesheetReport = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await api.get(`report/timesheets?${query}`);
            setTimesheetData(response.data.data || []);
        } catch (err) {
            console.error("Report fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const result = projects.filter((project) =>
            project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.projectId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProjects(result);
    }, [searchTerm, projects]);

    if (loading && view === "categories") {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <DashboardShell>
            <div className="min-h-screen bg-background text-[13px] text-foreground">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-card px-8 py-4">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="text-primary" size={24} />
                        <h1 className="text-xl font-bold tracking-tight">Reports</h1>
                    </div>
                </div>

                <div className="mx-auto max-w-6xl p-8">
                    {view === "categories" ? (
                        <div className="flex flex-col gap-6">
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Select Category</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category Card: Projects */}
                                <div onClick={() => setView("project_list")} className="group flex cursor-pointer items-center gap-5 rounded-lg border border-border bg-card p-8 shadow-sm transition-all hover:border-primary hover:shadow-md">
                                    <div className="rounded-xl bg-primary/10 p-5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <FolderRoot size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Projects</h3>
                                        <p className="text-muted-foreground italic">Detailed metrics for {projects.length} projects</p>
                                    </div>
                                    <ChevronRight className="ml-auto text-muted-foreground/50" />
                                </div>

                                {/* Category Card: Timesheets */}
                                <div onClick={() => { setView("timesheet_report"); getTimesheetReport(); }} className="group flex cursor-pointer items-center gap-5 rounded-lg border border-border bg-card p-8 shadow-sm transition-all hover:border-orange-500 hover:shadow-md">
                                    <div className="rounded-xl bg-orange-500/10 p-5 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                        <Clock size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Timesheets</h3>
                                        <p className="text-muted-foreground italic">Logs and team hour analysis</p>
                                    </div>
                                    <ChevronRight className="ml-auto text-muted-foreground/50" />
                                </div>
                            </div>
                        </div>
                    ) : view === "project_list" ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <button onClick={() => setView("categories")} className="flex items-center gap-2 font-bold text-primary hover:underline">
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <div className="relative w-full md:w-[350px]">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search projects..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-card border-border h-9"
                                    />
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-muted/50 text-[11px] font-bold uppercase text-muted-foreground border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4">Project</th>
                                            <th className="px-6 py-4">Client</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredProjects.map((project) => (
                                            <tr key={project._id} className="hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold">{project.name}</div>
                                                    <div className="text-[11px] text-muted-foreground">{project.projectId}</div>
                                                </td>
                                                <td className="px-6 py-4">{project.clientName}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant={project.active ? "default" : "secondary"} className="text-[10px]">
                                                        {project.active ? "ACTIVE" : "INACTIVE"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/reports/${project._id}`}>
                                                        <button className="rounded border border-primary px-4 py-1 text-[11px] font-bold text-primary hover:bg-primary hover:text-white transition-all">
                                                            View
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* Timesheet Report View */
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={() => setView("categories")} className="flex items-center gap-2 font-bold text-primary hover:underline">
                                    <ArrowLeft size={16} /> Back
                                </button>

                                {timesheetData.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={exportToPDF} className="flex items-center gap-2 px-3 py-1.5 bg-card border border-red-200 dark:border-red-900/50 text-red-600 rounded font-bold text-[11px] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                                            <FileText size={14} /> PDF
                                        </button>
                                        <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-1.5 bg-card border border-green-200 dark:border-green-900/50 text-green-600 rounded font-bold text-[11px] hover:bg-green-50 dark:hover:bg-green-950/20 transition-all">
                                            <TableIcon size={14} /> Excel
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded font-bold text-[11px] transition-all
                                            border border-border bg-background text-foreground hover:bg-muted
                                            dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                                        >
                                            <Share2 size={14} className="text-primary dark:text-sky-400" />
                                            Share
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Filters Bar */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 rounded-lg border border-border bg-card p-4 items-end shadow-sm">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Period</label>
                                    <select
                                        className="w-full h-9 rounded-md border border-border bg-background px-2 text-[12px] focus:ring-1 focus:ring-primary outline-none"
                                        value={filters.period}
                                        onChange={(e) => handlePeriodChange(e.target.value)}
                                    >
                                        <option value="custom">Custom Range</option>
                                        <option value="weekly">Last 7 Days</option>
                                        <option value="monthly">Last 30 Days</option>
                                        <option value="yearly">Last Year</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">From</label>
                                    <Input
                                        type="date"
                                        disabled={filters.period !== "custom"}
                                        value={filters.fromDate}
                                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                                        className="h-9 text-[12px] bg-background"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">To</label>
                                    <Input
                                        type="date"
                                        disabled={filters.period !== "custom"}
                                        value={filters.toDate}
                                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                        className="h-9 text-[12px] bg-background"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Project</label>
                                    <select
                                        className="w-full h-9 rounded-md border border-border bg-background px-2 text-[12px] outline-none"
                                        value={filters.projectId}
                                        onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                                    >
                                        <option value="all">All Projects</option>
                                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Team</label>
                                    <select
                                        className="w-full h-9 rounded-md border border-border bg-background px-2 text-[12px] outline-none"
                                        value={filters.userId}
                                        onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                                    >
                                        <option value="all">All Employees</option>
                                        {users.map(u => (u?.role == "project_manager" || u?.role == "Team Leader") && (<option key={u._id} value={u._id}>{u.name}</option>))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Employee</label>
                                    <select
                                        className="w-full h-9 rounded-md border border-border bg-background px-2 text-[12px] outline-none"
                                        value={filters.userId}
                                        onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                                    >
                                        <option value="all">All Employees</option>
                                        {users.map(u => u?.role === "team_member" && (<option key={u._id} value={u._id}>{u.name}</option>))}
                                    </select>
                                </div>
                                <button
                                    onClick={getTimesheetReport}
                                    className="h-9 px-6 rounded-md border border-border bg-background text-[12px] font-bold text-foreground transition-all hover:bg-muted active:scale-95 dark:border-border dark:bg-background dark:text-white dark:hover:bg-muted"
                                >
                                    Filter
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-muted/50 text-[11px] font-bold uppercase border-b border-border text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-4 text-center">Date</th>
                                            <th className="px-6 py-4">Project</th>
                                            <th className="px-6 py-4">Task</th>
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4 text-center">Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {timesheetData.length > 0 ? timesheetData.map((ts, idx) => (
                                            <tr key={idx} className="hover:bg-muted/30">
                                                <td className="px-6 py-4 text-center text-muted-foreground">
                                                    {ts.date ? new Date(ts.date).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4 font-medium">{ts.projectName}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{ts?.taskName || "-"}</td>
                                                <td className="px-6 py-4 font-bold">{ts.userName}</td>
                                                <td className="px-6 py-4 text-center text-primary font-bold">{ts.hours}h</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center text-muted-foreground italic">No records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}