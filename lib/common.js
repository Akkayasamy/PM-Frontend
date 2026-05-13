export const AVATAR_COLORS = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed"];

export const fullName = (assignee) =>
    assignee ? `${assignee.first_name || ""}`.trim() : "—";

export const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "-";

export const getAvatarColor = (name = "") =>
    AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export const STATUS_STYLES = {
  /* ========= DEFAULT / TODO ========= */
  todo: {
    background: "#F4F4F5",
    color: "#52525B",
    border: "1px solid #E4E4E7",
  },

  /* ========= PROGRESS ========= */
  in_progress: {
    background: "#EEF2FF",
    color: "#4338CA",
    border: "1px solid #C7D2FE",
  },

  /* ========= REVIEW / REOPEN ========= */
  in_review: {
    background: "#F5F3FF",
    color: "#6D28D9",
    border: "1px solid #DDD6FE",
  },

  re_open: {
    background: "#F5F3FF",
    color: "#7C3AED",
    border: "1px solid #DDD6FE",
  },

  resolved: {
    background: "#ECFEFF",
    color: "#0E7490",
    border: "1px solid #A5F3FC",
  },

  /* ========= SUCCESS ========= */
  done: {
    background: "#ECFDF5",
    color: "#047857",
    border: "1px solid #A7F3D0",
  },

  completed: {
    background: "#DCFCE7",
    color: "#166534",
    border: "1px solid #86EFAC",
  },

  approved: {
    background: "#ECFDF5",
    color: "#059669",
    border: "1px solid #6EE7B7",
  },

  /* ========= WARNING / HOLD ========= */
  pending: {
    background: "#FFFBEB",
    color: "#B45309",
    border: "1px solid #FDE68A",
  },

  on_hold: {
    background: "#FEF3C7",
    color: "#92400E",
    border: "1px solid #FCD34D",
  },

  hold: {
    background: "#FEF3C7",
    color: "#A16207",
    border: "1px solid #FCD34D",
  },

  /* ========= ERROR / BLOCKED ========= */
  blocked: {
    background: "#FFF1F2",
    color: "#BE123C",
    border: "1px solid #FECDD3",
  },

  rejected: {
    background: "#FFF1F2",
    color: "#E11D48",
    border: "1px solid #FDA4AF",
  },

  cancelled: {
    background: "#F4F4F5",
    color: "#71717A",
    border: "1px solid #E4E4E7",
  },

  delayed: {
    background: "#FFF1F2",
    color: "#BE123C",
    border: "1px solid #FDA4AF",
  },

  /* ========= PRIORITY ========= */
  high: {
    background: "#FEE2E2",
    color: "#DC2626",
    border: "1px solid #FCA5A5",
  },

  normal: {
    background: "#EFF6FF",
    color: "#2563EB",
    border: "1px solid #BFDBFE",
  },

  low: {
    background: "#F0FDF4",
    color: "#16A34A",
    border: "1px solid #BBF7D0",
  },
};