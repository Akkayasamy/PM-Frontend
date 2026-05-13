"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import axios from "axios";
// Importing from your specific components path
import ProjectTree from "../../components/ProjectTree";
import { DashboardShell } from "@/components/dashboard-shell";

// Using a custom axios instance if you have one, or standard axios
const api = axios.create({
  baseURL: "http://localhost:4000/api/v1", // Adjust to your backend port
});

const OverViewPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  console.log(projects, 'projects<<<<<')

  // Matches your requested fetch style
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Using the route we defined in the backend
      const response = await api.get(`/projects/tree`, {
        params: { search, currentPage }
      });

      // MongoDB returns 'results' and 'totalCount' from our controller
      setProjects(response.data.results || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      console.error("Error fetching project tree:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, currentPage]);

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
        <div className="max-w-[1200px] mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-xl font-black text-[#0f172a] uppercase">
                Project Overview
              </h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest mt-1 uppercase">
                {totalCount} Total Projects Found
              </p>
            </div>

            <div className="relative">
              <input
                className="border border-slate-200 p-2 pl-4 rounded-lg w-72 text-sm shadow-sm outline-none focus:ring-2 ring-blue-500 transition-all"
                placeholder="Search by name or project ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {loading && (
                <div className="absolute right-3 top-2.5 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              )}
            </div>
          </div>

          {/* Project List */}
          {projects.length === 0 && !loading ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-400 font-medium">No projects matching your search.</p>
            </div>
          ) : (
            <LayoutGroup>
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectContainer
                    key={project._id}
                    project={project}
                    isExpanded={expandedProjectId === project._id}
                    onToggle={() => setExpandedProjectId(expandedProjectId === project._id ? null : project._id)}
                  />
                ))}
              </div>
            </LayoutGroup>
          )}
        </div>
      </div>
    </DashboardShell>
  );
};

const ProjectContainer = ({ project, isExpanded, onToggle }) => (
  <motion.div layout className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
    <motion.div
      layout="position"
      onClick={onToggle}
      className={`p-2 flex justify-between items-center cursor-pointer transition-colors ${isExpanded ? "bg-[#1e293b] text-white" : "hover:bg-slate-50"
        }`}
    >
      <div className="flex items-center gap-2">
        <motion.span
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={`inline-flex items-center justify-center font-extrabold text-[12px] transition-colors leading-none select-none px-1 ${isExpanded ? "text-white-700" : "text-black-600"
            }`}
        >
          {'\u276F'}
        </motion.span>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-tight">
            {project.name}
          </h2>
          {/* <span className={`text-[9px] font-mono ${isExpanded ? "text-slate-400" : "text-slate-500"}`}>
            {project.projectId}
          </span> */}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* <div className="text-right hidden md:block">
          <p className={`text-[9px] font-bold uppercase ${isExpanded ? "text-slate-400" : "text-slate-500"}`}>Budget</p>
          <p className="text-xs font-bold">${project.budget}</p>
        </div> */}
        <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${isExpanded ? "bg-white/10 border-white/20" : "bg-blue-50 border-blue-100 text-blue-600"
          }`}>
          {project.status?.replace('_', ' ')}
        </div>
      </div>
    </motion.div>

    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-6 bg-white border-t border-slate-100"
        >
          <ProjectTree milestones={project.milestones} />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default OverViewPage;