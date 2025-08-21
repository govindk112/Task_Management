"use client";

import { User } from "@/Types/userTaskTypes";
import { Badge } from "./ui/badge";

interface TaskUserDisplayProps {
  taskId: string;
}

export default function TaskUserDisplay({ taskId }: TaskUserDisplayProps) {
  const taskData = JSON.parse(localStorage.getItem(`task_${taskId}`) || '{}');
  const assignedUser: User | undefined = taskData.assignedUsers?.[0];

  if (!assignedUser) {
    return (
      <Badge variant="outline" className="text-xs">
        Unassigned
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="w-6 h-6 rounded-full text-xs">
        {assignedUser.avatar || assignedUser.name.charAt(0)}
      </Badge>
      <span className="text-sm text-muted-foreground">{assignedUser.name}</span>
    </div>
  );
}
