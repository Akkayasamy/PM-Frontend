"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

export default function ProtectedRoute({ children, requiredPermission = null, requiredRole = null }) {
  const { user, loading, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined" && !loading) {
      if (!user) {
        router.push("/")
      } else if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
        router.push("/dashboard")
      } else if (requiredPermission && !hasPermission(requiredPermission)) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router, requiredPermission, requiredRole, hasPermission])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (
    (requiredRole && user.role !== requiredRole && user.role !== "admin") ||
    (requiredPermission && !hasPermission(requiredPermission))
  ) {
    return null
  }

  return children
}
