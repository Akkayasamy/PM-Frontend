"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Users,
  Flag,
  Package,
  AlertCircle,
  Shield,
  LogOut,
  Settings,
  Calendar,
  User,
  Building,
  Timer,
  FileText,
  CalendarClock 
} from "lucide-react";

export function MainNav({ closeSidebar }) {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  const handleLinkClick = () => {
    if (closeSidebar) closeSidebar();
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      permission: null, // Everyone can access
    },
    {
      title: "reports",
      href: "/reports",
      icon: FileText,
      permission: null,
    },
    {
      title: "timesheets",
      href: "/timesheets",
      icon: CalendarClock ,
      permission: null,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: Briefcase,
      permission: "view_projects",
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      permission: "view_tasks",
    },
    {
      title: "Sprints",
      href: "/sprints",
      icon: Timer,
      permission: "view_sprints",
    },
    {
      title: "Teams",
      href: "/teams",
      icon: Users,
      permission: "view_team_members",
    },
    {
      title: "Consultants",
      href: "/consultants",
      icon: User,
      permission: "view_consultants", // Everyone can access
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Building,
      permission: "view_clients",
    },
    {
      title: "Milestones",
      href: "/milestones",
      icon: Flag,
      permission: "view_milestones",
    },
    {
      title: "Resources",
      href: "/resources",
      icon: Package,
      permission: "view_resources",
    },
    {
      title: "Issues",
      href: "/issues",
      icon: AlertCircle,
      permission: "view_issues",
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: Calendar,
      permission: "view_projects",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      permission: null,
    },
    {
      title: "Users",
      href: "/admin",
      icon: Shield,
      permission: null,
      role: "admin", // Only admin can access
    },
  ];

  return (
    <nav className="flex flex-col space-y-1">
      <div className="mb-4 px-3 py-2">
        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Main Navigation
          </h2>
        </div>
      </div>

      {navItems.map((item) => {
        // Check if user has permission to see this nav item
        const hasAccess =
          (!item.permission || hasPermission(item.permission)) &&
          (!item.role || user.role === item.role);

        if (!hasAccess) return null;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-700",
              pathname === item.href
                ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-primary-foreground"
                : "text-gray-600 dark:text-gray-300"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}

      <div className="mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500"
          onClick={logout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          <span>Log out</span>
        </Button>
      </div>
    </nav>
  );
}
