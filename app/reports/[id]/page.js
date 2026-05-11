"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context"; 
import api from "@/config/api"; 
import { Printer, ArrowLeft, CheckCircle2, ListTodo, Flag, User, Briefcase, Clock } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";

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
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id && user?._id) fetchReport();
    }, [id, user]);

    if (loading) return <LoadingState />;
    if (!data) return null;

    const progress = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

    return (
        <DashboardShell>
            <div className="min-h-screen bg-[#f4f7f9] font-sans print:bg-white text-[13px]">
                {/* Top Zoho-Style Toolbar */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-800">Project Status Report</h2>
                    </div>
                    <button 
                        onClick={() => window.print()} 
                        className="flex items-center gap-2 rounded bg-[#0091ff] px-4 py-2 font-bold text-white hover:bg-[#007add] transition-all"
                    >
                        <Printer className="h-4 w-4" /> Export as PDF
                    </button>
                </div>

                <div className="mx-auto max-w-[1100px] p-6 space-y-6">
                    {/* Header Info Card */}
                    <div className="overflow-hidden rounded border border-[#e3e9ef] bg-white shadow-sm">
                        <div className="bg-[#f9fbff] border-b border-[#e3e9ef] p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0091ff]">
                                        {data.projectGroup || "General Project"}
                                    </span>
                                    <h1 className="text-2xl font-bold text-slate-900">{data.name}</h1>
                                    <p className="text-slate-500 font-mono text-[12px]">{data.projectId}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-light text-[#0091ff]">{progress}%</div>
                                    <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-[#0091ff]" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e3e9ef]">
                            <InfoTile label="Project Manager" value={data.managerName || "Unassigned"} icon={<User className="text-indigo-400" />} />
                            <InfoTile label="Client Name" value={data.clientName} icon={<Briefcase className="text-blue-400" />} />
                            <InfoTile label="Start Date" value={data.startDate} icon={<Clock className="text-slate-400" />} />
                            <InfoTile label="End Date" value={data.endDate} icon={<Clock className="text-slate-400" />} />
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatBox label="Total Tasks" value={data.totalTasks} color="border-l-blue-500" />
                        <StatBox label="Completed" value={data.completedTasks} color="border-l-emerald-500" />
                        <StatBox label="Milestones" value={data.milestones?.length} color="border-l-amber-500" />
                    </div>

                    {/* Tables Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Milestones Table */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 px-1">
                                <Flag className="h-4 w-4 text-[#0091ff]" /> Milestones
                            </h3>
                            <div className="rounded border border-[#e3e9ef] bg-white overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f9fbff] text-slate-500 font-bold border-b border-[#e3e9ef]">
                                        <tr>
                                            <th className="px-4 py-3">Milestone Name</th>
                                            <th className="px-4 py-3 text-right">Target Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f0f3f6]">
                                        {data.milestones?.map((m, i) => (
                                            <tr key={i} className="hover:bg-[#fcfdfe]">
                                                <td className="px-4 py-3 font-medium text-slate-700">{m.name}</td>
                                                <td className="px-4 py-3 text-right text-slate-500">{m.dueDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 px-1">
                                <ListTodo className="h-4 w-4 text-[#0091ff]" /> Task Status
                            </h3>
                            <div className="rounded border border-[#e3e9ef] bg-white overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f9fbff] text-slate-500 font-bold border-b border-[#e3e9ef]">
                                        <tr>
                                            <th className="px-4 py-3">Task</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f0f3f6]">
                                        {data.tasks?.map((t, i) => (
                                            <tr key={i} className="hover:bg-[#fcfdfe]">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-700">{t.title}</div>
                                                    <div className="text-[11px] text-slate-400">{t.taskId}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                        t.status === 'Closed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

// Zoho-Style Sub-components
function InfoTile({ label, value, icon }) {
    return (
        <div className="p-5 flex items-start gap-3">
            <div className="mt-1">{icon}</div>
            <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">{label}</div>
                <div className="text-slate-800 font-semibold">{value || "--"}</div>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }) {
    return (
        <div className={`bg-white p-5 rounded border border-[#e3e9ef] border-l-4 shadow-sm ${color}`}>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{value || 0}</div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center bg-[#f4f7f9]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0091ff] border-t-transparent"></div>
        </div>
    );
}