import React, { useState } from "react";

const StatusBadge = ({ status }) => {
  const styles = {
    in_progress: "bg-blue-100 text-blue-700 border-blue-200",
    Closed: "bg-green-100 text-green-700 border-green-200",
    "Under Review": "bg-amber-100 text-amber-700 border-amber-200",
    default: "bg-slate-100 text-slate-600 border-slate-200"
  };
  const style = styles[status] || styles.default;
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${style}`}>
      {status}
    </span>
  );
};

const ProjectTree = ({ milestones }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-2">Project Milestones</h3>
      <div className="rounded-xl border border-indigo-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-indigo-50 text-indigo-700 text-[10px] uppercase font-black">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Milestone Name</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((ms, idx) => (
              <MilestoneRow key={ms._id} ms={ms} idx={idx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MilestoneRow = ({ ms, idx }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr onClick={() => setOpen(!open)} className="border-t hover:bg-slate-50 cursor-pointer">
        <td className="p-3 text-xs font-bold text-slate-400">{idx + 1}</td>
        <td className="p-3 text-xs font-bold text-slate-800">{ms.name}</td>
        <td className="p-3 text-[11px] font-medium text-slate-500">{ms.dueDate}</td>
        <td className="p-3"><StatusBadge status={ms.status} /></td>
      </tr>
      {open && (
        <tr>
          <td colSpan="4" className="p-4 bg-slate-50/50">
            <TaskSection tasks={ms.tasks} />
          </td>
        </tr>
      )}
    </>
  );
};

const TaskSection = ({ tasks }) => (
  <div className="ml-4 border-l-2 border-blue-200 pl-4">
    <h4 className="text-[9px] font-bold text-blue-600 uppercase mb-2">Associated Tasks</h4>
    <div className="bg-white rounded-lg border border-blue-100 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-blue-50 text-blue-700 text-[9px] uppercase">
          <tr>
            <th className="p-2">Task Title</th>
            <th className="p-2">Priority</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task._id} className="border-t">
              <td className="p-2 text-xs font-semibold">{task.title}</td>
              <td className="p-2 text-[10px] uppercase font-bold">{task.priority}</td>
              <td className="p-2"><StatusBadge status={task.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ProjectTree;