import React, { useState } from "react";

import {
  fullName,
  getInitials,
  getAvatarColor,
} from "../lib/common";

const Avatar = ({ name = "", size = 22 }) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm transition-all"
    style={{
      width: size,
      height: size,
      background: getAvatarColor(name),
      fontSize: size * 0.38,
    }}
  >
    {getInitials(name)}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    completed: { bg: "rgba(209, 250, 229, 0.2)", color: "#10b981", border: "rgba(16, 185, 129, 0.3)" },
    inprogress: { bg: "rgba(219, 234, 254, 0.2)", color: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
    todo: { bg: "rgba(241, 245, 249, 0.2)", color: "#64748b", border: "rgba(100, 116, 139, 0.3)" },
    reopen: { bg: "rgba(254, 249, 195, 0.2)", color: "#eab308", border: "rgba(234, 179, 8, 0.3)" },
    rejected: { bg: "rgba(254, 226, 226, 0.2)", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
    approved: { bg: "rgba(209, 250, 229, 0.2)", color: "#10b981", border: "rgba(16, 185, 129, 0.3)" },
    pending: { bg: "rgba(254, 243, 199, 0.2)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
    open: { bg: "rgba(241, 245, 249, 0.2)", color: "#64748b", border: "rgba(100, 116, 139, 0.3)" },
    draft: { bg: "rgba(241, 245, 249, 0.2)", color: "#64748b", border: "rgba(100, 116, 139, 0.3)" },
    delayed: { bg: "rgba(254, 226, 226, 0.2)", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
  };
  const key = status?.toLowerCase().replace(/[\s_]/g, "") || "todo";
  const s = map[key] || map.todo;
  return (
    <span
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
    >
      {status === "pending" ? "Open" : status?.replace(/_/g, " ") || "—"}
    </span>
  );
};

const Chevron = ({ open, color = "currentColor" }) => (
  <svg
    width={11}
    height={11}
    viewBox="0 0 16 16"
    fill="none"
    className={`transition-transform duration-200 shrink-0 ${open ? "rotate-90" : ""}`}
  >
    <path d="M6 4l4 4-4 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ActionBtn = ({ onClick }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer border border-transparent hover:border-border"
  >
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="2.5" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="8" cy="13.5" r="1.4" />
    </svg>
  </button>
);

const SectionToggleBtn = ({ label, open, onToggle, color = "#6366f1" }) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all select-none mb-2 mt-1"
    style={{
      background: open ? color + "20" : "transparent",
      borderColor: color + "45",
      color: color,
    }}
  >
    <Chevron open={open} color={color} />
    {label}
  </button>
);

const ITH = ({ children, className = "" }) => (
  <th className={`py-2 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border ${className}`}>
    {children}
  </th>
);

const ITD = ({ children, className = "" }) => (
  <td className={`py-2 px-3 text-[12px] text-foreground/80 border-b border-border/50 ${className}`}>
    {children}
  </td>
);

const TimesheetSection = ({ timesheets = [], onEditTimesheet, userData, title }) => {
  const [open, setOpen] = useState(false);
  if (!timesheets || timesheets.length === 0) return null;

  return (
    <div className="mt-2 ml-4">
      <SectionToggleBtn
        label={`Logged Hours (${timesheets.length})`}
        open={open}
        onToggle={() => setOpen(p => !p)}
        color="#0891b2"
      />
      {open && (
        <div className="rounded-lg border border-cyan-500/20 overflow-hidden shadow-sm bg-card mb-3 mr-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <ITH className="!bg-cyan-500/10 !text-cyan-600 dark:!text-cyan-400">Title</ITH>
                <ITH className="!bg-cyan-500/10 !text-cyan-600 dark:!text-cyan-400 text-center">Hours</ITH>
                <ITH className="!bg-cyan-500/10 !text-cyan-600 dark:!text-cyan-400">Remarks</ITH>
                <ITH className="!bg-cyan-500/10 !text-cyan-600 dark:!text-cyan-400">Work Date</ITH>
                <ITH className="!bg-cyan-500/10 !text-cyan-600 dark:!text-cyan-400 text-center">Status</ITH>
                <ITH className="!bg-cyan-500/10 !text-cyan-600 dark:!text-cyan-400 text-right ">Actions</ITH>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((ts, i) => (
                <tr key={ts._id || i} className="hover:bg-cyan-500/5 transition-colors">
                  <ITD className="font-semibold text-foreground">{title || "—"}</ITD>
                  <ITD className="text-center">
                    <span className="font-bold text-cyan-600 bg-cyan-500/10 px-2 py-0.5 rounded-full text-[11px]">
                      {ts.hours || ts.hoursWorked || "0"}h
                    </span>
                  </ITD>
                  <ITD className="text-muted-foreground italic max-w-[200px] truncate">{ts.remarks || ts.description || "—"}</ITD>
                  <ITD className="font-semibold text-foreground">{ts.date ? new Date(ts.date).toISOString().split("T")[0] : "—"}</ITD>
                  <ITD className="text-center"><StatusBadge status={ts.approvalStatus || ts.status} /></ITD>
                  <ITD className="text-right">
                    <ActionBtn onClick={() => window.open("/timesheets", "_blank")} />
                  </ITD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SubtaskSection = ({ subtasks = [], onEditSubtask, onEditTimesheet }) => {
  const [open, setOpen] = useState(false);
  if (!subtasks || subtasks.length === 0) return null;

  return (
    <div className="mt-2 ml-4">
      <SectionToggleBtn
        label={`Subtasks (${subtasks.length})`}
        open={open}
        onToggle={() => setOpen(p => !p)}
        color="#7c3aed"
      />
      {open && (
        <div className="rounded-lg border border-violet-500/20 overflow-hidden shadow-sm bg-card mb-3">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <ITH className="!bg-violet-500/10 !text-violet-600 dark:!text-violet-400 w-8">#</ITH>
                <ITH className="!bg-violet-500/10 !text-violet-600 dark:!text-violet-400">Subtask Title</ITH>
                {/* <ITH className="!bg-violet-500/10 !text-violet-600 dark:!text-violet-400">Created By</ITH> */}
                <ITH className="!bg-violet-500/10 !text-violet-600 dark:!text-violet-400">Estimated Hours</ITH>
                <ITH className="!bg-violet-500/10 !text-violet-600 dark:!text-violet-400">Start Date</ITH>
                <ITH className="!bg-violet-500/10 !text-violet-600 dark:!text-violet-400">End Date</ITH>
              </tr>
            </thead>
            <tbody>
              {subtasks.map((st, i) => (
                <React.Fragment key={st._id || i}>
                  <tr className="hover:bg-violet-500/5 transition-colors">
                    <ITD className="text-muted-foreground font-mono text-[10px]">{i + 1}</ITD>
                    <ITD className="font-semibold text-foreground">{st.title}</ITD>
                    {/* <ITD>
                      <div className="flex items-center gap-2">
                        <Avatar name={st?.userData?.name} size={22} />
                        <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[100px]">{st?.userData?.name}</span>
                      </div>
                    </ITD> */}
                    <ITD className="font-semibold text-foreground">{st?.estimatedHours || '-'}</ITD>
                    <ITD className="font-semibold text-foreground">{st?.startDate || '-'}</ITD>
                    <ITD className="font-semibold text-foreground">{st.endDate || '-'}</ITD>
                  </tr>
                  {(st.timesheets?.length > 0 || st.subtasks?.length > 0 || st.children?.length > 0) && (
                    <tr>
                      <td colSpan={7} className="px-3 pb-2 bg-muted/10">
                        <TimesheetSection timesheets={st.timesheets} onEditTimesheet={onEditTimesheet} userData={st?.userData} title={st?.title} />
                        <SubtaskSection
                          subtasks={st.subtasks || st.children}
                          onEditSubtask={onEditSubtask}
                          onEditTimesheet={onEditTimesheet}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TaskRow = ({ task, index, onEditTask, onEditSubtask, onEditTimesheet }) => {
  const [open, setOpen] = useState(false);
  const hasChild = (task.subtasks && task.subtasks.length > 0) || (task.timesheets && task.timesheets.length > 0);
  const name = task?.userDetails?.name || '-';

  return (
    <>
      <tr
        onClick={() => hasChild && setOpen(p => !p)}
        className={`border-b border-border/50 transition-colors ${hasChild ? "cursor-pointer" : ""} ${open ? "bg-sky-500/10" : "hover:bg-sky-500/5"}`}
      >
        <td className="py-2.5 px-3 w-7 text-center">
          {hasChild ? <Chevron open={open} color="#0284c7" /> : <span className="inline-block w-3" />}
        </td>
        <td className="py-2.5 px-2 text-muted-foreground font-mono text-[10px] w-8">{index + 1}</td>
        <td className="py-2.5 px-3 font-semibold text-foreground text-[13px]">{task.title}</td>
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-2">
            <Avatar name={name} size={22} />
            <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[100px]">{name}</span>
          </div>
        </td>
        <td className="py-2.5 px-3 text-[11px] font-medium text-muted-foreground">{task.planDate || "—"}</td>
        <td className="py-2.5 px-3 text-[11px] font-medium text-muted-foreground">{task.actualDate || "—"}</td>
        <td className="py-2.5 px-3"><StatusBadge status={task.status} /></td>
        <td className="py-2.5 px-3 text-right">
          <ActionBtn onClick={() => window.open("/tasks", "_blank")} />
        </td>
      </tr>

      {open && hasChild && (
        <tr>
          <td colSpan={8} className="px-6 py-2 bg-sky-500/5 border-b border-border/50">
            <SubtaskSection
              subtasks={task.subtasks}
              onEditSubtask={onEditSubtask}
              onEditTimesheet={onEditTimesheet}
            />
            <TimesheetSection
              timesheets={task.timesheets}
              onEditTimesheet={onEditTimesheet}
              userData={task?.userDetails}
              title={task?.title}
            />
          </td>
        </tr>
      )}
    </>
  );
};

const TaskSection = ({ tasks = [], onEditTask, onEditSubtask, onEditTimesheet }) => {
  const [open, setOpen] = useState(true);

  if (!tasks || tasks.length === 0) return (
    <div className="py-4 text-center text-muted-foreground text-xs italic font-semibold">
      No tasks available for this milestone.
    </div>
  );

  return (
    <div className="mt-2 ml-5">
      <SectionToggleBtn label={`Associated Tasks (${tasks.length})`} open={open} onToggle={() => setOpen(p => !p)} color="#0284c7" />
      {open && (
        <div className="rounded-xl border border-sky-500/20 overflow-hidden shadow-sm bg-card mb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sky-500/10 border-b border-sky-500/20">
                <th className="py-2 px-3 w-7" />
                <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 w-8">#</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400">Task Title</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 w-40">Assignee</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 w-28">Plan Date</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 w-28">Actual Date</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 w-28">Status</th>
                <th className="py-2 px-3 text-right text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <TaskRow
                  key={t._id || i}
                  task={t}
                  index={i}
                  onEditTask={onEditTask}
                  onEditSubtask={onEditSubtask}
                  onEditTimesheet={onEditTimesheet}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MilestoneRow = ({ milestone, index, onEdit, refetch }) => {
  const [open, setOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskEditData, setTaskEditData] = useState(null);
  const [subtaskModalOpen, setSubtaskModalOpen] = useState(false);
  const [subtaskEditData, setSubtaskEditData] = useState(null);
  const [tsModalOpen, setTsModalOpen] = useState(false);
  const [tsEditData, setTsEditData] = useState(null);

  return (
    <>
      <tr onClick={() => setOpen(p => !p)} className={`border-b border-border/50 cursor-pointer transition-colors ${open ? "bg-indigo-500/10" : "hover:bg-indigo-500/5"}`}>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <Chevron open={open} color="#4f46e5" />
            <span className="text-[11px] text-muted-foreground font-mono font-bold">{index + 1}</span>
          </div>
        </td>
        <td className="py-3 px-3 font-bold text-foreground text-[13px]">{milestone.name || milestone.title}</td>
        <td className="py-3 px-3 text-[11px] font-semibold text-muted-foreground">{milestone?.managerName || "—"}</td>
        <td className="py-3 px-3 text-[11px] font-semibold text-muted-foreground">{milestone?.teamleadName || "—"}</td>
        <td className="py-3 px-3 text-[11px] font-semibold text-muted-foreground">{milestone?.startDate || "—"}</td>
        <td className="py-3 px-3 text-[11px] font-semibold text-muted-foreground">{milestone?.dueDate || "—"}</td>
        <td className="py-3 px-3 text-[11px] font-semibold text-muted-foreground">{milestone?.completedDate || "—"}</td>
        <td className="py-3 px-3"><StatusBadge status={milestone.status} /></td>
        <td className="py-3 px-3 text-right">
          <ActionBtn onClick={() => window.open("/milestones", "_blank")} />
        </td>
      </tr>

      {open && (
        <tr>
          {/* FIX: was colSpan={7}, table has 9 columns so changed to colSpan={9} */}
          <td colSpan={9} className="bg-indigo-500/5 px-4 py-1 border-b border-border/50">
            <TaskSection
              tasks={milestone.tasks}
              onEditTask={(t) => { setTaskEditData(t); setTaskModalOpen(true); }}
              onEditSubtask={(st) => { setSubtaskEditData(st); setSubtaskModalOpen(true); }}
              onEditTimesheet={(ts) => { setTsEditData(ts); setTsModalOpen(true); }}
            />
          </td>
        </tr>
      )}
    </>
  );
};

const ProjectTree = ({ milestones = [], refetch }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSectionOpen, setIsSectionOpen] = useState(true);

  return (
    <div className="p-2 bg-background/50 rounded-xl transition-colors">
      <SectionToggleBtn label="Project Milestones" open={isSectionOpen} onToggle={() => setIsSectionOpen(p => !p)} color="#303F9F" />
      {isSectionOpen && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="py-2.5 px-4 text-center text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 w-20">#</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Milestone Name</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 w-28">Project Manager</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 w-28">Team Leader</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 w-28">Start Date</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 w-28">Due Date</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 w-28">Completion Date</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 w-28">Status</th>
                <th className="py-2.5 px-3 text-right text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {milestones && milestones.length > 0 ? milestones.map((m, i) => (
                <MilestoneRow key={m._id || i} milestone={m} index={i} onEdit={(ms) => { setEditData(ms); setModalOpen(true); }} refetch={refetch} />
              )) : (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-muted-foreground font-semibold italic text-sm">
                    No milestones found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectTree;