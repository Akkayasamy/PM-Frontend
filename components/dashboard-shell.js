"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Loader2, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DashboardShell({ children }) {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="font-semibold text-xl flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 mr-2 text-primary"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Project Management
            </div>
          </div>
          <UserNav />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Mobile */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out md:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="font-semibold text-xl">Navigation</div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex h-[calc(100vh-4rem)] flex-col gap-2 p-4 overflow-y-auto">
            <MainNav closeSidebar={() => setSidebarOpen(false)} />
          </div>
        </aside>

        {/* Sidebar - Desktop */}
        <aside className="hidden w-64 border-r bg-white dark:bg-gray-800 md:block">
          <div className="flex h-full flex-col gap-2 p-4 overflow-y-auto">
            <MainNav />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
