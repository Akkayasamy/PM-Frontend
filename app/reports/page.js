"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  ChevronRight, 
  Search, 
  Briefcase, 
  FolderRoot, 
  ArrowLeft 
} from 'lucide-react';
import api from '@/config/api';
import { DashboardShell } from '@/components/dashboard-shell';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ReportsListPage() {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showProjectList, setShowProjectList] = useState(false); // Controls the click-to-list logic

    // Initial Data Fetch
    useEffect(() => {
        const loadResponse = async () => {
            try {
                const response = await api.get("project");
                const data = response.data.project || [];
                setProjects(data);
                setFilteredProjects(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                setLoading(false);
            }
        };
        loadResponse();
    }, []);

    // Search Logic (Matching your Project Page logic)
    useEffect(() => {
        const result = projects.filter((project) =>
            project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.projectId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProjects(result);
    }, [searchTerm, projects]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f4f7f9]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0091ff] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <DashboardShell>
            <div className="min-h-screen bg-[#f4f7f9] text-[13px]">
                {/* Header Section */}
                <div className="flex items-center justify-between border-b bg-white px-8 py-4">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="text-[#0091ff]" size={24} />
                        <h1 className="text-xl font-bold text-slate-800">Reports</h1>
                    </div>
                </div>

                <div className="mx-auto max-w-6xl p-8">
                    {!showProjectList ? (
                        /* STEP 1: The Initial Project Module Card */
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Category</h2>
                            <div 
                                onClick={() => setShowProjectList(true)}
                                className="group flex w-full max-w-md cursor-pointer items-center gap-5 rounded-lg border border-[#e3e9ef] bg-white p-8 shadow-sm transition-all hover:border-[#0091ff] hover:shadow-md"
                            >
                                <div className="rounded-xl bg-[#f0f7ff] p-5 text-[#0091ff] group-hover:bg-[#0091ff] group-hover:text-white transition-all">
                                    <FolderRoot size={40} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Projects</h3>
                                    <p className="text-slate-500 italic">View and export reports for {projects.length} projects</p>
                                </div>
                                <ChevronRight className="ml-auto text-slate-300" />
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: The Searchable Project List */
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Toolbar */}
                            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <button 
                                    onClick={() => setShowProjectList(false)}
                                    className="flex items-center gap-2 font-bold text-[#0091ff] hover:underline"
                                >
                                    <ArrowLeft size={16} /> Back to Modules
                                </button>
                                
                                <div className="relative w-full md:w-[350px]">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input 
                                        type="text" 
                                        placeholder="Search project name, ID, or client..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-white pl-10 h-10 border-[#e3e9ef] focus:ring-[#0091ff]"
                                    />
                                </div>
                            </div>

                            {/* Project Table (High Density / Professional) */}
                            <div className="overflow-hidden rounded-lg border border-[#e3e9ef] bg-white shadow-sm">
                                <table className="w-full border-collapse text-left">
                                    <thead className="bg-[#f9fbff] text-[11px] font-bold uppercase text-slate-500 border-b">
                                        <tr>
                                            <th className="px-6 py-4">Project Information</th>
                                            <th className="px-6 py-4">Client Name</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredProjects.length > 0 ? (
                                            filteredProjects.map((project) => (
                                                <tr key={project._id} className="group hover:bg-[#fcfdfe] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="rounded bg-slate-50 p-2 text-slate-400 group-hover:bg-[#f0f7ff] group-hover:text-[#0091ff]">
                                                                <Briefcase size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-800">{project.name}</div>
                                                                <div className="text-[11px] text-slate-400 uppercase tracking-tighter">
                                                                    {project.projectId || project.projectCode}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                                        {project.clientName || project.client || "No Client"}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge variant={project.active ? "success" : "secondary"} className="text-[10px] font-bold py-0 h-5">
                                                            {project.active ? "ACTIVE" : "INACTIVE"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link href={`/reports/${project._id}`}>
                                                            <button className="rounded border border-[#0091ff] px-4 py-1.5 text-[11px] font-bold text-[#0091ff] hover:bg-[#0091ff] hover:text-white transition-all shadow-sm">
                                                                Generate Report
                                                            </button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center text-slate-400 italic">
                                                    No projects found matching "{searchTerm}"
                                                </td>
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