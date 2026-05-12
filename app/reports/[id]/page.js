"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context"; 
import api from "@/config/api"; 
import { 
  Search, 
  ChevronRight, 
  LayoutGrid, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import ProjectTree from "../../components/ProjectTree";

export default function OverViewPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedProjectId, setExpandedProjectId] = useState(null);

    const fetchProjectTree = async () => {
        setLoading(true);
        try {
            // Using your standard api config pattern
            const response = await api.get(`projects/tree`, {
                params: { search }
            });
            // Matching the backend response structure { success, results }
            if (response.data?.success) {
                setProjects(response.data.results);
            }
        } catch (err) { 
            console.error("Error fetching project tree:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        if (user?._id) fetchProjectTree();
    }, [user, search]);

    return (
        <DashboardShell>
            <div className="flex flex-col space-y-6 p-8 bg-[#f9fafb] min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <LayoutGrid className="text-blue-600" size={24} />
                            PROJECT <span className="text-blue-600">OVERVIEW</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">
                            Live Status & Hierarchy Tree
                        </p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-80 shadow-sm outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-400 animate-pulse">LOADING PROJECTS...</p>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <ProjectItem
                                key={project._id}
                                project={project}
                                isOpen={expandedProjectId === project._id}
                                onToggle={() => setExpandedProjectId(expandedProjectId === project._id ? null : project._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <AlertCircle className="text-slate-300 mb-2" size={40} />
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No matching projects found</p>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}

function ProjectItem({ project, isOpen, onToggle }) {
    return (
        <div className={`group transition-all duration-300 rounded-2xl border ${
            isOpen ? "bg-white border-blue-500 shadow-xl" : "bg-white border-slate-200 shadow-sm hover:border-blue-300"
        }`}>
            {/* Project Header Card */}
            <div 
                onClick={onToggle}
                className="flex items-center justify-between p-5 cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl transition-colors ${isOpen ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                        <ChevronRight className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase leading-none">
                            {project.name}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                            ID: {project.projectId}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Timeline</span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                            <Calendar size={12} className="text-blue-500" />
                            {project.startDate} <span className="text-slate-300">/</span> {project.endDate}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end min-w-[100px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Budget Status</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase mt-0.5 border ${
                            project.status === 'in_progress' 
                            ? "bg-blue-50 text-blue-600 border-blue-100" 
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                            {project.status?.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Project Tree Content */}
            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-6 pt-0 border-t border-slate-50">
                    <div className="bg-slate-50 rounded-xl p-6">
                        <ProjectTree milestones={project.milestones} />
                    </div>
                </div>
            </div>
        </div>
    );
}