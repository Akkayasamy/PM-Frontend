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

// --- FIXED IMPORTS ---
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
        period: "custom" // Added period filter
    });

    // Helper to calculate dates based on preset periods
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

    // --- FIXED PDF EXPORT LOGIC ---
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();

            // Header for the PDF
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
            alert("Failed to generate PDF. Check console for details.");
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
        } else {
            alert("Web Share API not supported in this browser.");
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
            <div className="flex h-screen items-center justify-center bg-[#f4f7f9]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0091ff] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <DashboardShell>
            <div className="min-h-screen bg-[#f4f7f9] text-[13px]">
                <div className="flex items-center justify-between border-b bg-white px-8 py-4">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="text-[#0091ff]" size={24} />
                        <h1 className="text-xl font-bold text-slate-800">Reports</h1>
                    </div>
                </div>

                <div className="mx-auto max-w-6xl p-8">
                    {view === "categories" ? (
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Category</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div onClick={() => setView("project_list")} className="group flex cursor-pointer items-center gap-5 rounded-lg border border-[#e3e9ef] bg-white p-8 shadow-sm transition-all hover:border-[#0091ff] hover:shadow-md">
                                    <div className="rounded-xl bg-[#f0f7ff] p-5 text-[#0091ff] group-hover:bg-[#0091ff] group-hover:text-white transition-all">
                                        <FolderRoot size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Projects</h3>
                                        <p className="text-slate-500 italic">View reports for {projects.length} projects</p>
                                    </div>
                                    <ChevronRight className="ml-auto text-slate-300" />
                                </div>

                                <div onClick={() => { setView("timesheet_report"); getTimesheetReport(); }} className="group flex cursor-pointer items-center gap-5 rounded-lg border border-[#e3e9ef] bg-white p-8 shadow-sm transition-all hover:border-[#0091ff] hover:shadow-md">
                                    <div className="rounded-xl bg-[#fff7f0] p-5 text-[#ff9100] group-hover:bg-[#ff9100] group-hover:text-white transition-all">
                                        <Clock size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Timesheets</h3>
                                        <p className="text-slate-500 italic">User logs and team hour analysis</p>
                                    </div>
                                    <ChevronRight className="ml-auto text-slate-300" />
                                </div>
                            </div>
                        </div>
                    ) : view === "project_list" ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <button onClick={() => setView("categories")} className="flex items-center gap-2 font-bold text-[#0091ff] hover:underline">
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <div className="relative w-full md:w-[350px]">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-white pl-10 border-[#e3e9ef]"
                                    />
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f9fbff] text-[11px] font-bold uppercase text-slate-500 border-b">
                                        <tr>
                                            <th className="px-6 py-4">Project</th>
                                            <th className="px-6 py-4">Client</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredProjects.map((project) => (
                                            <tr key={project._id} className="hover:bg-[#fcfdfe]">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold">{project.name}</div>
                                                    <div className="text-[11px] text-slate-400">{project.projectId}</div>
                                                </td>
                                                <td className="px-6 py-4">{project.clientName}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant={project.active ? "default" : "secondary"}>
                                                        {project.active ? "ACTIVE" : "INACTIVE"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/reports/${project._id}`}>
                                                        <button className="rounded border border-[#0091ff] px-4 py-1.5 text-[11px] font-bold text-[#0091ff] hover:bg-[#0091ff] hover:text-white transition-all">
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
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={() => setView("categories")} className="flex items-center gap-2 font-bold text-[#0091ff] hover:underline">
                                    <ArrowLeft size={16} /> Back
                                </button>

                                {timesheetData.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={exportToPDF} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-100 text-red-600 rounded font-bold hover:bg-red-50">
                                            <FileText size={14} /> PDF
                                        </button>
                                        <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-100 text-green-600 rounded font-bold hover:bg-green-50">
                                            <TableIcon size={14} /> Excel
                                        </button>
                                        <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 bg-[#0091ff] text-white rounded font-bold hover:bg-[#007ad6]">
                                            <Share2 size={14} /> Share
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 rounded-lg border bg-white p-4 items-end">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Period</label>
                                    <select
                                        className="w-full h-9 rounded-md border px-3 text-[12px]"
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
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">From</label>
                                    <Input
                                        type="date"
                                        disabled={filters.period !== "custom"}
                                        value={filters.fromDate}
                                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">To</label>
                                    <Input
                                        type="date"
                                        disabled={filters.period !== "custom"}
                                        value={filters.toDate}
                                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Project</label>
                                    <select className="w-full h-9 rounded-md border px-3 text-[12px]" value={filters.projectId} onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}>
                                        <option value="all">All Projects</option>
                                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Employee</label>
                                    <select className="w-full h-9 rounded-md border px-3 text-[12px]" value={filters.userId} onChange={(e) => setFilters({ ...filters, userId: e.target.value })}>
                                        <option value="all">All Employees</option>
                                        {users.map(u => <option key={u._id} value={u._id}>{u.name}({u.role})</option>)}
                                    </select>
                                </div>
                                <button onClick={getTimesheetReport} className="h-9 rounded bg-[#0091ff] font-bold text-white hover:bg-[#007ad6]">
                                    Filter
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-lg border bg-white">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f9fbff] text-[11px] font-bold uppercase border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-center">Date</th>
                                            <th className="px-6 py-4">Project</th>
                                            <th className="px-6 py-4">Milestone name</th>
                                            <th className="px-6 py-4">Task name</th>
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4 text-center">Hours</th>
                                            {/* <th className="px-6 py-4">Status</th> */}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {timesheetData.length > 0 ? timesheetData.map((ts, idx) => (
                                            <tr key={idx} className="hover:bg-[#fcfdfe]">
                                                <td className="px-6 py-4 text-center">{new Date(ts.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-slate-600">{ts.projectName}</td>
                                                <td className="px-6 py-4 text-slate-600">{ts?.milestoneName || "-"}</td>
                                                <td className="px-6 py-4 text-slate-600">{ts?.taskName || "-"}</td>
                                                <td className="px-6 py-4 font-bold">{ts.userName}</td>
                                                <td className="px-6 py-4 text-center text-[#0091ff] font-bold">{ts.hours}h</td>
                                                {/* <td className="px-6 py-4">
                                                    <Badge variant={ts.status === 'Approved' ? 'default' : 'outline'}>{ts.status}</Badge>
                                                </td> */}
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="py-20 text-center text-slate-400">No records found.</td></tr>
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