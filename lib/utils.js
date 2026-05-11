export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function getStatusColor(status) {
  const statusColors = {
    // Project statuses
    planning: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    on_hold: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",

    // Task statuses
    todo: "bg-gray-100 text-gray-800",
    review: "bg-purple-100 text-purple-800",

    // Issue statuses
    open: "bg-red-100 text-red-800",
    in_review: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  }

  return statusColors[status] || "bg-gray-100 text-gray-800"
}

export function getPriorityColor(priority) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  }

  return priorityColors[priority] || "bg-gray-100 text-gray-800"
}

/**
 * Helper functions for toast notifications
 */
export const toastMessages = {
  create: (itemType, itemName) => ({
    title: `${itemType} created`,
    description: `${itemType} "${itemName}" has been created successfully.`,
  }),
  update: (itemType, itemName) => ({
    title: `${itemType} updated`,
    description: `${itemType} "${itemName}" has been updated successfully.`,
  }),
  delete: (itemType, itemName) => ({
    title: `${itemType} deleted`,
    description: `${itemType} "${itemName}" has been deleted.`,
  }),
  error: (action, itemType, error) => ({
    title: "Error",
    description: `Failed to ${action} ${itemType}: ${error?.message || "Unknown error"}`,
    variant: "destructive",
  }),
}
