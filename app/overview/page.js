"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ProjectTree from "../../components/ProjectTree";
import { DashboardShell } from "@/components/dashboard-shell";
import api from "@/config/api";
import ProtectedRoute from "@/components/protected-route";



const OverViewPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/tree`, {
        params: { search, currentPage }
      });
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
    <ProtectedRoute requiredPermission="over_view">
      <DashboardShell>
        <div className="min-h-screen bg-background p-6 font-sans">
          <div className="max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
                  Project Overview
                </h1>
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1 uppercase">
                  {totalCount} Total Projects Found
                </p>
              </div>

              <div className="relative">
                <input
                  className="bg-card border border-border p-2 pl-4 rounded-lg w-72 text-[13px] shadow-sm outline-none focus:ring-2 ring-sky-500 transition-all text-foreground placeholder:text-muted-foreground/50"
                  placeholder="Search by name or project ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {loading && (
                  <div className="absolute right-3 top-2.5 animate-spin h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full" />
                )}
              </div>
            </div>

            {/* Project List */}
            {projects.length === 0 && !loading ? (
              <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground font-medium text-[13px]">No projects matching your search.</p>
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
    </ProtectedRoute>
  );
};

const ProjectContainer = ({ project, isExpanded, onToggle }) => (
  <motion.div layout className="overflow-hidden border border-border rounded-xl bg-card shadow-sm">
    <motion.div
      layout="position"
      onClick={onToggle}
      className={`p-2 flex justify-between items-center cursor-pointer transition-colors ${isExpanded ? "bg-[#607799] text-white" : "hover:bg-muted/50 text-foreground"
        }`}
    >
      <div className="flex items-center gap-2">
        <motion.span
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={`inline-flex items-center justify-center font-extrabold text-[12px] leading-none select-none px-1 ${isExpanded ? "text-white" : "text-foreground/70"
            }`}
        >
          {'\u276F'}
        </motion.span>
        <div>
          <h2 className="text-[14px] font-bold uppercase tracking-tight">
            {project.name}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${isExpanded
          ? "bg-white/20 border-white/30 text-white"
          : "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400"
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
          className="p-1 bg-card border-t border-border"
        >
          <ProjectTree milestones={project.milestones} />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default OverViewPage;