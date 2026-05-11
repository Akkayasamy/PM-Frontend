import { useApi } from "@/context/api-context"

export function useApiService() {
  const api = useApi()

  // Projects API
  const getProjects = async (params = {}) => {
    return api.get("/projects", params)
  }

  const getProjectById = async (id) => {
    return api.get(`/projects/${id}`)
  }

  const createProject = async (projectData) => {
    return api.post("/projects", projectData)
  }

  const updateProject = async (id, projectData) => {
    return api.put(`/projects/${id}`, projectData)
  }

  const deleteProject = async (id) => {
    return api.delete(`/projects/${id}`)
  }

  // Tasks API
  const getTasks = async (params = {}) => {
    return api.get("/tasks", params)
  }

  const getTaskById = async (id) => {
    return api.get(`/tasks/${id}`)
  }

  const createTask = async (taskData) => {
    return api.post("/tasks", taskData)
  }

  const updateTask = async (id, taskData) => {
    return api.put(`/tasks/${id}`, taskData)
  }

  const deleteTask = async (id) => {
    return api.delete(`/tasks/${id}`)
  }

  // Clients API
  const getClients = async (params = {}) => {
    return api.get("/clients", params)
  }

  const getClientById = async (id) => {
    return api.get(`/clients/${id}`)
  }

  const createClient = async (clientData) => {
    return api.post("/clients", clientData)
  }

  const updateClient = async (id, clientData) => {
    return api.put(`/clients/${id}`, clientData)
  }

  const deleteClient = async (id) => {
    return api.delete(`/clients/${id}`)
  }

  // Users API
  const getUsers = async (params = {}) => {
    return api.get("/users", params)
  }

  const getUserById = async (id) => {
    return api.get(`/users/${id}`)
  }

  // File upload
  const uploadProjectFile = async (projectId, file, metadata = {}) => {
    return api.uploadFile(`/projects/${projectId}/files`, file, metadata)
  }

  return {
    // Projects
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,

    // Tasks
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,

    // Clients
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,

    // Users
    getUsers,
    getUserById,

    // Files
    uploadProjectFile,
  }
}
