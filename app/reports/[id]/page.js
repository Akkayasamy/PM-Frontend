"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import api from "@/config/api";
import { Printer, ArrowLeft, Flag, User, Briefcase, Clock, FileSpreadsheet, Share2, MoreHorizontal } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ProjectReportPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`report/project/${id}`);
                if (response.data?.success) setData(response.data.report);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        if (id && user?._id) fetchReport();
    }, [id, user]);

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Project Report');
        sheet.columns = [
            { header: 'Task ID', key: 'taskId', width: 15 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Status', key: 'status', width: 15 }
        ];
        data.tasks.forEach(t => sheet.addRow(t));
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${data.name}_Report.xlsx`);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Project Report: ${data.name}`,
                    text: `Check out the status of ${data.name}`,
                    url: window.location.href,
                });
            } catch (err) { console.log("Sharing failed", err); }
        } else {
            alert("Copy link to clipboard: " + window.location.href);
        }
    };

    if (loading) return <LoadingState />;
    if (!data) return null;

    const progress = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

    return (
        <DashboardShell>
            <div className="min-h-screen bg-background font-sans print:bg-white text-[13px] text-foreground transition-colors duration-300">
                {/* TOOLBAR */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-3 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-lg font-semibold">Project Status Report</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handleShare} className="p-2 text-muted-foreground hover:bg-muted rounded border border-border">
                            <Share2 className="h-4 w-4" />
                        </button>
                        <button onClick={exportToExcel} className="flex items-center gap-2 rounded border border-border bg-card px-4 py-2 font-bold text-muted-foreground hover:bg-muted transition-all">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 rounded-md px-4 py-2 font-bold text-[12px] transition-all active:scale-95
                            bg-primary text-white hover:bg-primary/90 
                            dark:bg-transparent dark:border dark:border-primary dark:text-primary dark:hover:bg-primary/10"
                        >
                            <Printer className="h-4 w-4" />
                            Export PDF
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-[1100px] p-6 space-y-6">
                    {/* HEADER SECTION */}
                    <div className="overflow-hidden rounded border border-border bg-card shadow-sm">
                        <div className="bg-muted/30 border-b border-border p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Project Overview</span>
                                    <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
                                    <p className="text-muted-foreground font-mono text-[11px]">{data.projectCode || data.projectId}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-light text-primary">{progress}%</div>
                                    <div className="w-32 h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                            <InfoTile label="Manager" value={data.managerName} icon={<User className="h-4 w-4 text-indigo-400" />} />
                            <InfoTile label="Client" value={data.client} icon={<Briefcase className="h-4 w-4 text-blue-400" />} />
                            <InfoTile label="Start" value={data.startDate} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
                            <InfoTile label="Deadline" value={data.endDate} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-3 gap-6">
                        <StatBox label="Tasks" value={data.totalTasks} color="border-l-blue-500" />
                        <StatBox label="Efficiency" value={`${progress}%`} color="border-l-emerald-500" />
                        <StatBox label="Milestones" value={data.milestones?.length} color="border-l-amber-500" />
                    </div>

                    {/* LISTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ListSection title="Milestones" icon={<Flag className="h-4 w-4 text-primary" />} data={data.milestones} type="milestone" />
                        <ListSection title="Task Status" icon={<MoreHorizontal className="h-4 w-4 text-primary" />} data={data.tasks} type="task" />
                    </div>
                </div>
            </div>
        </DashboardShell >
    );
}

// SHARED SUB-COMPONENTS
function ListSection({ title, icon, data, type }) {
    return (
        <div className="space-y-3">
            <h3 className="font-bold text-muted-foreground flex items-center gap-2 px-1">{icon} {title}</h3>
            <div className="rounded border border-border bg-card overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border text-[11px] uppercase">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3 text-right">{type === 'task' ? 'Status' : 'Date'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data?.map((item, i) => (
                            <tr key={i} className="hover:bg-muted/20">
                                <td className="px-4 py-3 font-medium text-foreground">{item.name || item.title}</td>
                                <td className="px-4 py-3 text-right">
                                    {type === 'task' ? (
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">{item.status}</span>
                                    ) : (
                                        <span className="text-muted-foreground">{item.dueDate || item.date}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function InfoTile({ label, value, icon }) {
    return (
        <div className="p-4 flex items-center gap-3">
            <div className="bg-muted/50 p-2 rounded">{icon}</div>
            <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase">{label}</div>
                <div className="text-foreground font-bold leading-tight">{value || "--"}</div>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }) {
    return (
        <div className={`bg-card p-5 rounded border border-border border-l-4 shadow-sm ${color}`}>
            <div className="text-[11px] font-bold text-muted-foreground uppercase">{label}</div>
            <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
    );
}