"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash, Edit, Eye } from "lucide-react";
import api from "@/config/api";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();

  const { getItems, createItem, updateItem, deleteItem, getItemById } =
    useData();
  const { toast } = useToast();

  // const projects = getItems("projects");
  //const tasks = getItems("tasks");
  //const milestones = getItems("milestones");

  const [events, setEvents] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedView, setSelectedView] = useState("month");
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
    description: "",
    type: "task",
    projectId: "",
    status: "todo",
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);

  // Handle calendar navigation (prev, next, today)
  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

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

  // Combine tasks and milestones into events
  useEffect(() => {
    const taskEvents = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: new Date(task.startDate || task.endDate || new Date()),
      end: new Date(task.endDate || task.startDate || new Date()),
      description: task.description,
      status: task.status,
      projectId: task.projectId,
      type: "task",
      allDay: true,
      originalData: task,
    }));

    const milestoneEvents = milestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.name,
      start: new Date(milestone.dueDate || new Date()),
      end: new Date(milestone.dueDate || new Date()),
      description: milestone.description,
      projectId: milestone.projectId,
      status: milestone.status,
      type: "milestone",
      allDay: true,
      originalData: milestone,
    }));

    const allEvents = [...taskEvents, ...milestoneEvents];

    // Filter events based on selected project and event type
    const filteredEvents = allEvents.filter((event) => {
      const projectMatch =
        selectedProject === "all" || event.projectId === selectedProject;
      const typeMatch =
        selectedEventType === "all" || event.type === selectedEventType;
      return projectMatch && typeMatch;
    });

    setEvents(filteredEvents);
  }, [tasks, milestones, selectedProject, selectedEventType]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    if (!hasPermission("create_tasks")) return;

    setNewEvent({
      title: "",
      start,
      end,
      description: "",
      type: "task",
      projectId: projects.length > 0 ? projects[0]._id : "",
      status: "todo",
    });
    setSelectedEvent(null);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleAddEvent = () => {
    try {
      if (newEvent.type === "task") {
        createItem("tasks", {
          title: newEvent.title,
          description: newEvent.description,
          startDate: format(newEvent.start, "yyyy-MM-dd"),
          endDate: format(newEvent.end, "yyyy-MM-dd"),
          projectId: newEvent.projectId,
          status: newEvent.status || "todo",
          createdBy: user.id,
          createdAt: new Date().toISOString(),
        });

        toast({
          title: "Task created",
          description: `Task "${newEvent.title}" has been created successfully.`,
        });
      } else if (newEvent.type === "milestone") {
        createItem("milestones", {
          name: newEvent.title,
          description: newEvent.description,
          dueDate: format(newEvent.end, "yyyy-MM-dd"),
          projectId: newEvent.projectId,
          status: newEvent.status || "planned",
          createdBy: user.id,
          createdAt: new Date().toISOString(),
        });

        toast({
          title: "Milestone created",
          description: `Milestone "${newEvent.title}" has been created successfully.`,
        });
      }

      // Close the dialog
      setIsDialogOpen(false);

      // Reset the form
      setNewEvent({
        title: "",
        start: new Date(),
        end: new Date(),
        description: "",
        type: "task",
        projectId: "",
        status: "todo",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create ${newEvent.type}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = () => {
    try {
      if (selectedEvent.type === "task") {
        updateItem("tasks", selectedEvent.id, {
          title: newEvent.title,
          description: newEvent.description,
          startDate: format(newEvent.start, "yyyy-MM-dd"),
          endDate: format(newEvent.end, "yyyy-MM-dd"),
          projectId: newEvent.projectId,
          status: newEvent.status,
          updatedAt: new Date().toISOString(),
        });

        toast({
          title: "Task updated",
          description: `Task "${newEvent.title}" has been updated successfully.`,
        });
      } else if (selectedEvent.type === "milestone") {
        updateItem("milestones", selectedEvent.id, {
          name: newEvent.title,
          description: newEvent.description,
          dueDate: format(newEvent.end, "yyyy-MM-dd"),
          projectId: newEvent.projectId,
          status: newEvent.status,
          updatedAt: new Date().toISOString(),
        });

        toast({
          title: "Milestone updated",
          description: `Milestone "${newEvent.title}" has been updated successfully.`,
        });
      }

      // Close the dialog
      setIsDialogOpen(false);
      setIsEditMode(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${selectedEvent.type}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = () => {
    try {
      if (selectedEvent.type === "task") {
        deleteItem("tasks", selectedEvent.id);
        toast({
          title: "Task deleted",
          description: `Task "${selectedEvent.title}" has been deleted.`,
        });
      } else if (selectedEvent.type === "milestone") {
        deleteItem("milestones", selectedEvent.id);
        toast({
          title: "Milestone deleted",
          description: `Milestone "${selectedEvent.title}" has been deleted.`,
        });
      }

      // Close the dialogs
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${selectedEvent.type}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // const () =>  = () => {
  //   setNewEvent({
  //     title: selectedEvent.title,
  //     start: selectedEvent.start,
  //     end: selectedEvent.end,
  //     description: selectedEvent.description,
  //     type: selectedEvent.type,
  //     projectId: selectedEvent.projectId,
  //     status: selectedEvent.status,
  //   });
  //   setIsEditMode(true);
  // };

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3182ce"; // Default blue

    if (event.type === "task") {
      switch (event.status) {
        case "todo":
          backgroundColor = "#8b5cf6"; // Purple
          break;
        case "in_progress":
          backgroundColor = "#f59e0b"; // Amber
          break;
        case "completed":
          backgroundColor = "#10b981"; // Green
          break;
        default:
          backgroundColor = "#8b5cf6"; // Purple
      }
    } else if (event.type === "milestone") {
      switch (event.status) {
        case "planned":
          backgroundColor = "#f97316"; // Orange
          break;
        case "in_progress":
          backgroundColor = "#f59e0b"; // Amber
          break;
        case "completed":
          backgroundColor = "#10b981"; // Green
          break;
        case "delayed":
          backgroundColor = "#ef4444"; // Red
          break;
        default:
          backgroundColor = "#f97316"; // Orange
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
            <p className="text-muted-foreground">
              View and manage your tasks and milestones in a calendar view
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project, i) => (
                  <SelectItem key={i} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedEventType}
              onValueChange={setSelectedEventType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="milestone">Milestones</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
              </SelectContent>
            </Select>

            {/* {hasPermission("create_tasks") && (
              <Button
                onClick={() => {
                  setNewEvent({
                    title: "",
                    start: new Date(),
                    end: new Date(),
                    description: "",
                    type: "task",
                    projectId:
                      projects.length > 0 ? projects[0]._id : "",
                    status: "todo",
                  });
                  setSelectedEvent(null);
                  setIsEditMode(true);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            )} */}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="h-[600px] py-3">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable={hasPermission("create_tasks")}
                eventPropGetter={eventStyleGetter}
                view={selectedView}
                onView={(view) => setSelectedView(view)}
                views={["month", "week", "day", "agenda"]}
                date={currentDate}
                onNavigate={handleNavigate}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? selectedEvent
                  ? `Edit ${selectedEvent.type === "task" ? "Task" : "Milestone"
                  }`
                  : `Add New ${newEvent.type === "task" ? "Task" : "Milestone"}`
                : selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Make changes to the event details"
                : `View details for this ${selectedEvent?.type}`}
            </DialogDescription>
          </DialogHeader>

          {isEditMode ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={format(newEvent.start, "yyyy-MM-dd")}
                    onChange={(e) => {
                      const date = parse(
                        e.target.value,
                        "yyyy-MM-dd",
                        new Date()
                      );
                      setNewEvent({ ...newEvent, start: date });
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={format(newEvent.end, "yyyy-MM-dd")}
                    onChange={(e) => {
                      const date = parse(
                        e.target.value,
                        "yyyy-MM-dd",
                        new Date()
                      );
                      setNewEvent({ ...newEvent, end: date });
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={newEvent.projectId}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, projectId: value })
                  }
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newEvent.status}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {newEvent.type === "task" ? (
                      <>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <h3 className="font-medium">Description</h3>
                <p>{selectedEvent?.description || "No description provided"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Start Date</h3>
                  <p>
                    {selectedEvent?.start
                      ? format(selectedEvent.start, "PPP")
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">End Date</h3>
                  <p>
                    {selectedEvent?.end
                      ? format(selectedEvent.end, "PPP")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Type</h3>
                <p className="capitalize">{selectedEvent?.type}</p>
              </div>

              {selectedEvent?.status && (
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p className="capitalize">
                    {selectedEvent.status.replace("_", " ")}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium">Project</h3>
                <p>
                  {selectedEvent?.projectId
                    ? projects.find((p) => p._id === selectedEvent.projectId)
                      ?.name || "Unknown Project"
                    : "No project assigned"}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    if (!selectedEvent) {
                      setIsDialogOpen(false);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={selectedEvent ? handleEditEvent : handleAddEvent}
                >
                  {selectedEvent ? "Save Changes" : "Add Event"}
                </Button>
              </>
            ) : (
              <div className="flex w-full justify-end">
                {/* <div>
                  {hasPermission("delete_tasks") && (
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div> */}
                <div className="flex gap-2">
                  {hasPermission("edit_tasks") && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/tasks/${selectedEvent.taskId}`)
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  )}
                  <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {selectedEvent?.type}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
