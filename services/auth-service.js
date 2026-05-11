import { useApi } from "@/context/api-context"

export function useAuthService() {
  const api = useApi()

  const login = async (credentials) => {
    return api.post("/login", credentials)
  }

  const register = async (userData) => {
    return api.post("/auth/register", userData)
  }

  const logout = async (token) => {
    return api.post("/auth/logout", {}, token)
  }

  const forgotPassword = async (email) => {
    return api.post("/auth/forgot-password", { email })
  }

  const resetPassword = async (token, newPassword) => {
    return api.post("/auth/reset-password", { token, newPassword })
  }

  const getCurrentUser = async (token) => {
    return api.get("/auth/me", {}, token)
  }

  const updateProfile = async (userData, token) => {
    return api.put("/auth/profile", userData, token)
  }

  const changePassword = async (currentPassword, newPassword, token) => {
    return api.post("/auth/change-password", { currentPassword, newPassword }, token)
  }

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updateProfile,
    changePassword,
  }
}
