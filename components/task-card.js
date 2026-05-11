"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/data-context";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getStatusColor, getPriorityColor } from "@/lib/utils";
import { CheckSquare, ChevronRight, ChevronDown } from "lucide-react";

export function TaskCard({ task }) {
  const router = useRouter();
  const { getItems } = useData();
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState([]);

  useEffect(() => {
    // Get subtasks for this task
    const allTasks = getItems("tasks");
    const taskSubtasks = allTasks.filter(
      (t) => t.parentTaskId === task.id.toString()
    );
    setSubtasks(taskSubtasks);
  }, [task.id, getItems]);

  // Calculate progress based on subtasks
  const calculateProgress = () => {
    if (subtasks.length === 0) return task.status === "completed" ? 100 : 0;
    const completedSubtasks = subtasks.filter(
      (subtask) => subtask.status === "completed"
    ).length;
    return Math.round((completedSubtasks / subtasks.length) * 100);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">
            <div
              className="cursor-pointer hover:underline"
              onClick={() => router.push(`/tasks/${task.id}`)}
            >
              {task.title}
            </div>
          </CardTitle>
          <Badge className={getStatusColor(task.status)}>
            {task.status
              ?.replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()) || "To Do"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {task.description || "No description provided"}
        </p>

        {subtasks.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center text-sm font-medium cursor-pointer"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <span>{subtasks.length} Subtasks</span>
              </div>
              <span className="text-xs">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-1" />

            {expanded && (
              <div className="pl-4 space-y-1 mt-2">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center">
                      <CheckSquare
                        className={`h-3 w-3 mr-1 ${
                          subtask.status === "completed"
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span className="truncate max-w-[180px]">
                        {subtask.title}
                      </span>
                    </div>
                    <Badge
                      className={`${getStatusColor(subtask.status)} text-xs`}
                      variant="outline"
                    >
                      {subtask.status
                        ?.replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between items-center w-full">
          <Badge className={getPriorityColor(task.priority)} variant="outline">
            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) ||
              "Medium"}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => router.push(`/tasks/${task.id}`)}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
