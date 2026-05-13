import React, { useState } from "react";
// import MilestoneModal from "../components/MilestoneModal";
// import TaskModal from "../components/TaskModal.jsx";
// import SubtaskModal from "./SubtaskModal.jsx";
// import TimesheetModal from "../components/TimesheetModal.jsx";

import {
  fullName,
  getInitials,
  getAvatarColor,
} from "../lib/common";

const Avatar = ({ name = "", size = 22 }) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
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
    completed: { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
    inprogress: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
    todo: { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
    reopen: { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
    rejected: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
    approved: { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
    pending: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
    open: { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
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

const Chevron = ({ open, color = "#94a3b8" }) => (
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
    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
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
      background: open ? color + "15" : "#f8fafc",
      borderColor: color + "45",
      color: color,
    }}
  >
    <Chevron open={open} color={color} />
    {label}
  </button>
);

const ITH = ({ children, className = "" }) => (
  <th className={`py-2 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 ${className}`}>
    {children}
  </th>
);

const ITD = ({ children, className = "" }) => (
  <td className={`py-2 px-3 text-[12px] text-slate-600 border-b border-slate-100 ${className}`}>
    {children}
  </td>
);

const TimesheetSection = ({ timesheets = [], onEditTimesheet }) => {
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
        <div className="rounded-lg border border-cyan-100 overflow-hidden shadow-sm bg-white mb-3 mr-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <ITH className="!bg-cyan-50 !text-cyan-700">Work Date</ITH>
                <ITH className="!bg-cyan-50 !text-cyan-700">Remarks</ITH>
                <ITH className="!bg-cyan-50 !text-cyan-700 text-center">Hours</ITH>
                <ITH className="!bg-cyan-50 !text-cyan-700">Status</ITH>
                <ITH className="!bg-cyan-50 !text-cyan-700 text-right">Actions</ITH>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((ts, i) => (
                <tr key={ts._id || i} className="hover:bg-cyan-50/40 transition-colors">
                  <ITD className="font-semibold text-slate-800">{ts.date ? new Date(ts.date).toISOString().split("T")[0] : "—"}</ITD>
                  <ITD className="text-slate-500 italic max-w-[200px] truncate">{ts.remarks || ts.description || "—"}</ITD>
                  <ITD className="text-center">
                    <span className="font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full text-[11px]">
                      {ts.hours || ts.hoursWorked || "0"}h
                    </span>
                  </ITD>
                  <ITD><StatusBadge status={ts.approvalStatus || ts.status} /></ITD>
                  <ITD className="text-right">
                    <ActionBtn onClick={() => onEditTimesheet?.(ts)} />
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
        <div className="rounded-lg border border-violet-100 overflow-hidden shadow-sm bg-white mb-3">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <ITH className="bg-violet-50 text-violet-700 w-8">#</ITH>
                <ITH className="bg-violet-50 text-violet-700">Subtask Title</ITH>
                <ITH className="bg-violet-50 text-violet-700">Created By</ITH>
                <ITH className="bg-violet-50 text-violet-700">Estimated Hours</ITH>
                <ITH className="bg-violet-50 text-violet-700">Start Date</ITH>
                <ITH className="bg-violet-50 text-violet-700">End Date</ITH>
                <ITH className="bg-violet-50 text-violet-700 text-right">Actions</ITH>
              </tr>
            </thead>
            <tbody>
              {subtasks.map((st, i) => (
                <React.Fragment key={st._id || i}>
                  <tr className="hover:bg-violet-50/30 transition-colors">
                    <ITD className="text-slate-400 font-mono text-[10px]">{i + 1}</ITD>
                    <ITD className="font-semibold text-slate-800">{st.title}</ITD>
                    <ITD>
                      <div className="flex items-center gap-2">
                        <Avatar name={st?.userData?.name} size={22} />
                        <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[100px]">{st?.userData?.name}</span>
                      </div>
                    </ITD>
                    <ITD className="font-semibold text-slate-800">{st?.estimatedHours || '-'}</ITD>
                    <ITD className="font-semibold text-slate-800">{st?.startDate || '-'}</ITD>
                    <ITD className="font-semibold text-slate-800">{st.endDate || '-'}</ITD>
                    <ITD className="text-right">
                      <ActionBtn onClick={() => onEditSubtask?.(st)} />
                    </ITD>
                  </tr>
                  {(st.timesheets?.length > 0 || st.subtasks?.length > 0 || st.children?.length > 0) && (
                    <tr>
                      <td colSpan={7} className="px-3 pb-2 bg-slate-50/30">
                        <TimesheetSection timesheets={st.timesheets} onEditTimesheet={onEditTimesheet} />
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
        className={`border-b border-slate-100 transition-colors ${hasChild ? "cursor-pointer" : ""} ${open ? "bg-sky-50/40" : "hover:bg-sky-50/20"}`}
      >
        <td className="py-2.5 px-3 w-7 text-center">
          {hasChild ? <Chevron open={open} color="#0284c7" /> : <span className="inline-block w-3" />}
        </td>
        <td className="py-2.5 px-2 text-slate-400 font-mono text-[10px] w-8">{index + 1}</td>
        <td className="py-2.5 px-3 font-semibold text-slate-800 text-[13px]">{task.title}</td>
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-2">
            <Avatar name={name} size={22} />
            <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[100px]">{name}</span>
          </div>
        </td>
        <td className="py-2.5 px-3 text-[11px] font-medium text-slate-500">{task.startDate || "—"}</td>
        <td className="py-2.5 px-3 text-[11px] font-medium text-slate-500">{task.endDate || "—"}</td>
        <td className="py-2.5 px-3"><StatusBadge status={task.status} /></td>
        <td className="py-2.5 px-3 text-right">
          <ActionBtn onClick={() => onEditTask(task)} />
        </td>
      </tr>

      {open && hasChild && (
        <tr>
          <td colSpan={8} className="px-6 py-2 bg-sky-50/20 border-b border-slate-100">
            <SubtaskSection
              subtasks={task.subtasks}
              onEditSubtask={onEditSubtask}
              onEditTimesheet={onEditTimesheet}
            />
            <TimesheetSection
              timesheets={task.timesheets}
              onEditTimesheet={onEditTimesheet}
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
    <div className="py-4 text-center text-slate-400 text-xs italic font-semibold">
      No tasks available for this milestone.
    </div>
  );

  return (
    <div className="mt-2 ml-5">
      <SectionToggleBtn label={`Associated Tasks (${tasks.length})`} open={open} onToggle={() => setOpen(p => !p)} color="#0284c7" />
      {open && (
        <div className="rounded-xl border border-sky-100 overflow-hidden shadow-sm bg-white mb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sky-50 border-b border-sky-100">
                <th className="py-2 px-3 w-7" />
                <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-sky-700 w-8">#</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-700">Task Title</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-700 w-40">Assignee</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-700 w-28">Start Date</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-700 w-28">End Date</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-sky-700 w-28">Status</th>
                <th className="py-2 px-3 text-right text-[10px] font-bold uppercase text-sky-700 w-16">Actions</th>
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

  const ownerName = milestone.owner?.first_name || "—";

  return (
    <>
      <tr onClick={() => setOpen(p => !p)} className={`border-b border-slate-100 cursor-pointer transition-colors ${open ? "bg-indigo-50/50" : "hover:bg-indigo-50/25"}`}>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1">
            <Chevron open={open} color="#4f46e5" />
            <span className="text-[11px] text-slate-400 font-mono font-bold">{index + 1}</span>
          </div>
        </td>
        <td className="py-3 px-3 font-bold text-slate-800 text-[13px]">{milestone.name || milestone.title}</td>
        {/* <td className="py-3 px-3">
          <div className="flex items-center gap-2">
            <Avatar name={ownerName} size={22} />
            <span className="text-[11px] font-semibold text-slate-600">{ownerName}</span>
          </div>
        </td> */}
        <td className="py-3 px-3 text-[11px] font-semibold text-slate-500">{milestone.startDate || "—"}</td>
        <td className="py-3 px-3 text-[11px] font-semibold text-slate-500">{milestone.endDate || milestone.dueDate || "—"}</td>
        <td className="py-3 px-3"><StatusBadge status={milestone.status} /></td>
        <td className="py-3 px-3 text-right">
          <ActionBtn onClick={() => onEdit(milestone)} />
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={7} className="bg-indigo-50/10 px-4 py-1 border-b border-slate-200">
            <TaskSection
              tasks={milestone.tasks}
              onEditTask={(t) => { setTaskEditData(t); setTaskModalOpen(true); }}
              onEditSubtask={(st) => { setSubtaskEditData(st); setSubtaskModalOpen(true); }}
              onEditTimesheet={(ts) => { setTsEditData(ts); setTsModalOpen(true); }}
            />
          </td>
        </tr>
      )}

      {/* <TaskModal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} editData={taskEditData} onSuccess={refetch} /> */}
      {/* <SubtaskModal isOpen={subtaskModalOpen} onClose={() => setSubtaskModalOpen(false)} editData={subtaskEditData} onSuccess={refetch} /> */}
      {/* <TimesheetModal isOpen={tsModalOpen} onClose={() => setTsModalOpen(false)} editData={tsEditData} onSuccess={refetch} /> */}
    </>
  );
};

const ProjectTree = ({ milestones = [], refetch }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSectionOpen, setIsSectionOpen] = useState(true);

  return (
    <div className="p-2 bg-slate-50/30 rounded-xl">
      <SectionToggleBtn label="Project Milestones" open={isSectionOpen} onToggle={() => setIsSectionOpen(p => !p)} color="#303F9F" />
      {isSectionOpen && (
        <div className="rounded-xl border border-indigo-100 overflow-hidden shadow-sm bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-indigo-50/80 border-b border-indigo-100">
                <th className="py-2.5 px-4 text-left text-[10px] font-black uppercase tracking-wider text-indigo-700 w-20">#</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-700">Milestone Name</th>
                {/* <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-700 w-36">Owner</th> */}
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-700 w-28">Start</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-700 w-28">Due Date</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-black uppercase text-indigo-700 w-28">Status</th>
                <th className="py-2.5 px-3 text-right text-[10px] font-black uppercase text-indigo-700 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {milestones && milestones.length > 0 ? milestones.map((m, i) => (
                <MilestoneRow key={m._id || i} milestone={m} index={i} onEdit={(ms) => { setEditData(ms); setModalOpen(true); }} refetch={refetch} />
              )) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-semibold italic text-sm">
                    No milestones found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* <MilestoneModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editData={editData} onSuccess={refetch} /> */}
    </div>
  );
};

export default ProjectTree;