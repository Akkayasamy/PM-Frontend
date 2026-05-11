"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { DashboardShell } from "@/components/dashboard-shell";
import ProtectedRoute from "@/components/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  CheckSquare,
  Users,
  Flag,
  AlertCircle,
  Clock,
  Loader2,
  UserPlus,
  ShieldCheck,
  Settings,
  Calendar,
  BarChart3,
  ListTodo,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import api from "@/config/api";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { getItems, loading: dataLoading } = useData();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [resources, setResources] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("users");
        setUsers(response.data.users);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("task");
        setTasks(response.data.tasks);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("project");
        setProjects(response.data.project);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("milestone");
        setMilestones(response.data.milestones);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("resource");
        setResources(response.data.resources);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("issue");
        setIssues(response.data.issues);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const response = await api.get("team");
        setTeams(response.data.teams);
      } catch (err) {
        console.log(err);
      }
    };
    loadResponse();
  }, []);

  // Show loading state while auth or data is loading
  if (authLoading || dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // If no user is logged in, ProtectedRoute will handle the redirect
  if (!user) {
    return null;
  }

  // const projects = getItems("projects")
  //const tasks = getItems("tasks")
  //const teams = getItems("teams")
  // const milestones = getItems("milestones")
  // const resources = getItems("resources")
  //const issues = getItems("issues");
  //const users = getItems("users")

  // Calculate stats based on user role
  const getStats = () => {
    if (user.role === "admin") {
      return [
        {
          title: "Total Projects",
          value: projects.length,
          icon: Briefcase,
          color: "text-blue-500",
        },
        {
          title: "Total Tasks",
          value: tasks.length,
          icon: CheckSquare,
          color: "text-green-500",
        },
        {
          title: "Total Teams",
          value: teams.length,
          icon: Users,
          color: "text-orange-500",
        },
        {
          title: "Total Users",
          value: users.length,
          icon: UserPlus,
          color: "text-purple-500",
        },
      ];
    } else if (user.role === "project_manager") {
      // Filter by projects managed by this PM
      const managedProjects = projects.filter((p) => p.managerId === user.id);
      const managedProjectIds = managedProjects.map((p) => p.id);
      const projectTasks = tasks.filter((t) =>
        managedProjectIds.includes(t.projectId)
      );

      return [
        {
          title: "My Projects",
          value: managedProjects.length,
          icon: Briefcase,
          color: "text-blue-500",
        },
        {
          title: "Active Tasks",
          value: projectTasks.filter((t) => t.status !== "completed").length,
          icon: CheckSquare,
          color: "text-green-500",
        },
        {
          title: "Team Members",
          value: teams.filter((t) => managedProjectIds.includes(t.projectId))
            .length,
          icon: Users,
          color: "text-orange-500",
        },
        {
          title: "Pending Issues",
          value: issues.filter(
            (i) =>
              managedProjectIds.includes(i.projectId) && i.status === "open"
          ).length,
          icon: AlertCircle,
          color: "text-red-500",
        },
      ];
    } else {
      // Team member
      const assignedTasks = tasks.filter((t) => t.assigneeId === user.id);

      return [
        {
          title: "My Tasks",
          value: assignedTasks.length,
          icon: CheckSquare,
          color: "text-green-500",
        },
        {
          title: "Completed Tasks",
          value: assignedTasks.filter((t) => t.status === "completed").length,
          icon: CheckSquare,
          color: "text-blue-500",
        },
        {
          title: "Upcoming Milestones",
          value: milestones.filter((m) => new Date(m.dueDate) > new Date())
            .length,
          icon: Flag,
          color: "text-orange-500",
        },
        {
          title: "My Issues",
          value: issues.filter((i) => i.reporterId === user.id).length,
          icon: AlertCircle,
          color: "text-red-500",
        },
      ];
    }
  };

  const stats = getStats();

  // Render different dashboard content based on user role
  const renderRoleSpecificContent = () => {
    if (user.role === "admin") {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="bg-purple-50 dark:bg-purple-900/20 border-b">
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-purple-500" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage system users and accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Users</span>
                  <span className="text-2xl font-bold">{users.length}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Admins</span>
                    <span>
                      {users.filter((u) => u.role === "admin").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Project Managers</span>
                    <span>
                      {users.filter((u) => u.role === "project_manager").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Team Members</span>
                    <span>
                      {users.filter((u) => u.role === "team_member").length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/admin">
                  <span>Manage Users</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b">
              <CardTitle className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-blue-500" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>
                Manage access control and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Admin</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Full Access
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Project Manager</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Limited Access
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Team Member</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Basic Access
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/admin?tab=roles">
                  <span>Manage Roles</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b">
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-green-500" />
                System Settings
              </CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Projects</span>
                    <span className="text-2xl font-bold">
                      {projects.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tasks</span>
                    <span className="text-2xl font-bold">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Issues</span>
                    <span className="text-2xl font-bold">{issues.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/settings">
                  <span>System Settings</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    } else if (user.role === "project_manager") {
      // Filter by projects managed by this PM
      const managedProjects = projects.filter((p) => p.managerId === user.id);
      const managedProjectIds = managedProjects.map((p) => p.id);
      const projectTasks = tasks.filter((t) =>
        managedProjectIds.includes(t.projectId)
      );

      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b">
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                Active Projects
              </CardTitle>
              <CardDescription>
                Projects you're currently managing
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {managedProjects.length > 0 ? (
                  managedProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {project.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            project.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : project.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : project.status === "on_hold"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {project.status
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <Progress
                        value={
                          project.status === "completed"
                            ? 100
                            : project.status === "in_progress"
                            ? 50
                            : project.status === "on_hold"
                            ? 30
                            : 10
                        }
                        className="h-2"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No projects assigned yet
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/projects">
                  <span>View All Projects</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="bg-orange-50 dark:bg-orange-900/20 border-b">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-500" />
                Team Overview
              </CardTitle>
              <CardDescription>Teams working on your projects</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {teams.filter((t) => managedProjectIds.includes(t.projectId))
                  .length > 0 ? (
                  teams
                    .filter((t) => managedProjectIds.includes(t.projectId))
                    .slice(0, 3)
                    .map((team) => (
                      <div
                        key={team.id}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <div className="text-sm font-medium">{team.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {team.members
                              ? `${team.members.length} members`
                              : "No members"}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/teams?id=${team.id}`}>View</Link>
                        </Button>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No teams assigned yet
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/teams">
                  <span>Manage Teams</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b">
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-green-500" />
                Task Assignment
              </CardTitle>
              <CardDescription>Assign and track project tasks</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {projectTasks.length > 0 ? (
                  <div>
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>To Do</span>
                        <span>
                          {
                            projectTasks.filter((t) => t.status === "todo")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>In Progress</span>
                        <span>
                          {
                            projectTasks.filter(
                              (t) => t.status === "in_progress"
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Review</span>
                        <span>
                          {
                            projectTasks.filter((t) => t.status === "review")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed</span>
                        <span>
                          {
                            projectTasks.filter((t) => t.status === "completed")
                              .length
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">Completion Rate</div>
                      <div className="text-sm font-medium">
                        {projectTasks.length > 0
                          ? Math.round(
                              (projectTasks.filter(
                                (t) => t.status === "completed"
                              ).length /
                                projectTasks.length) *
                                100
                            )
                          : 0}
                        %
                      </div>
                    </div>
                    <Progress
                      value={
                        projectTasks.length > 0
                          ? (projectTasks.filter(
                              (t) => t.status === "completed"
                            ).length /
                              projectTasks.length) *
                            100
                          : 0
                      }
                      className="h-2 mt-2"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tasks created yet
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/tasks">
                  <span>Manage Tasks</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    } else {
      // Team member view
      const assignedTasks = tasks.filter((t) => t.assigneeId === user.id);

      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b">
              <CardTitle className="flex items-center">
                <ListTodo className="h-5 w-5 mr-2 text-green-500" />
                Assigned Tasks
              </CardTitle>
              <CardDescription>Tasks assigned to you</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {assignedTasks.length > 0 ? (
                  assignedTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {task.title}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : task.status === "review"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {task.status
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Project:{" "}
                        {projects.find((p) => p.id === Number(task.projectId))
                          ?.name || "Unassigned"}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tasks assigned yet
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/tasks">
                  <span>View All Tasks</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="bg-orange-50 dark:bg-orange-900/20 border-b">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                Deadlines
              </CardTitle>
              <CardDescription>Upcoming task deadlines</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {assignedTasks.length > 0 ? (
                  <div className="space-y-4">
                    {assignedTasks
                      .filter((t) => t.status !== "completed")
                      .slice(0, 3)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <div className="text-sm font-medium">
                              {task.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Due:{" "}
                              {task.dueDate
                                ? formatDate(task.dueDate)
                                : "No deadline"}
                            </div>
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === "urgent"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No upcoming deadlines
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/calendar">
                  <span>View Calendar</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b">
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Progress Tracker
              </CardTitle>
              <CardDescription>Track your task progress</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {assignedTasks.length > 0 ? (
                  <div>
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>To Do</span>
                        <span>
                          {
                            assignedTasks.filter((t) => t.status === "todo")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>In Progress</span>
                        <span>
                          {
                            assignedTasks.filter(
                              (t) => t.status === "in_progress"
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Review</span>
                        <span>
                          {
                            assignedTasks.filter((t) => t.status === "review")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed</span>
                        <span>
                          {
                            assignedTasks.filter(
                              (t) => t.status === "completed"
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">Completion Rate</div>
                      <div className="text-sm font-medium">
                        {assignedTasks.length > 0
                          ? Math.round(
                              (assignedTasks.filter(
                                (t) => t.status === "completed"
                              ).length /
                                assignedTasks.length) *
                                100
                            )
                          : 0}
                        %
                      </div>
                    </div>
                    <Progress
                      value={
                        assignedTasks.length > 0
                          ? (assignedTasks.filter(
                              (t) => t.status === "completed"
                            ).length /
                              assignedTasks.length) *
                            100
                          : 0
                      }
                      className="h-2 mt-2"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tasks to track
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/tasks">
                  <span>View Progress</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
  };

  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}!</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`rounded-full p-2 ${stat.color
                      .replace("text-", "bg-")
                      .replace("500", "100")}`}
                  >
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Role-specific content */}
          {renderRoleSpecificContent()}

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-muted/60">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              {user.role === "admin" && (
                <TabsTrigger value="system">System Status</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>
                      Recently created or updated projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {projects.length > 0 ? (
                      <div className="space-y-2">
                        {projects.slice(0, 5).map((project) => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-blue-500" />
                              <span>{project.name}</span>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                project.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : project.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : project.status === "on_hold"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {project.status
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No projects yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Milestones</CardTitle>
                    <CardDescription>
                      Milestones due in the next 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {milestones.length > 0 ? (
                      <div className="space-y-2">
                        {milestones.slice(0, 5).map((milestone) => (
                          <div
                            key={milestone.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Flag className="h-4 w-4 text-orange-500" />
                              <span>{milestone.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {milestone.dueDate
                                ? formatDate(milestone.dueDate)
                                : "No date"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No milestones yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Open Issues</CardTitle>
                    <CardDescription>
                      Issues that need attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {issues.length > 0 ? (
                      <div className="space-y-2">
                        {issues.slice(0, 5).map((issue) => (
                          <div
                            key={issue.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span>{issue.title}</span>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                issue.priority === "urgent"
                                  ? "bg-red-100 text-red-800"
                                  : issue.priority === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : issue.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {issue.priority.charAt(0).toUpperCase() +
                                issue.priority.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No issues yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent actions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-blue-100 p-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Logged in to the system
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Just now
                        </p>
                      </div>
                    </div>

                    {/* This would be populated with actual activity data in a real app */}
                    <p className="text-sm text-muted-foreground">
                      Activity will be shown here as you interact with the
                      system.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {user.role === "admin" && (
              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>
                      Overview of system resources and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Total Users</p>
                          <p className="text-2xl font-bold">
                            {getItems("users").length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Projects</p>
                          <p className="text-2xl font-bold">
                            {projects.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Tasks</p>
                          <p className="text-2xl font-bold">{tasks.length}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Issues</p>
                          <p className="text-2xl font-bold">{issues.length}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
