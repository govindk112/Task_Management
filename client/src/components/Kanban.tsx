"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface User {
  id: string;
  name: string;
}

interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  assignedUsers?: User[];
  projectId?: string;
}

interface KanbanProps {
  projectId?: string | null;
}

const Kanban: React.FC<KanbanProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const statuses = ["To Do", "In Progress", "Completed"];

  // ✅ Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/projects/${projectId}/tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      setTasks(data); // store tasks in state
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId]);

  // ✅ Update status on drag & drop
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Only run if status changed
    if (source.droppableId !== destination.droppableId) {
      const movedTask = tasks.find((t) => 
        (t._id || t.id)?.toString() === draggableId
      );
      if (!movedTask) return;

      const updatedTask = { ...movedTask, status: destination.droppableId };
      const taskId = movedTask._id || movedTask.id;

      // Update UI instantly
      setTasks((prev) =>
        prev.map((t) => 
          ((t._id || t.id)?.toString() === draggableId) ? updatedTask : t
        )
      );

      // Persist update in backend
      if (taskId) {
        try {
          await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ status: destination.droppableId }),
          });
        } catch (error) {
          console.error("Error updating task status:", error);
        }
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 justify-evenly max-lg:flex-wrap">
        {statuses.map((status) => (
          <div
            key={status}
            className="dark:bg-secondary bg-gray-200 p-4 rounded-lg w-full"
          >
            <h3 className="font-semibold mb-4">{status}</h3>
            <Droppable droppableId={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 min-h-[100px]"
                >
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task, index) => (
                      <Draggable
                        key={task._id || task.id || index}
                        draggableId={(task._id || task.id || index.toString()).toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-background p-4 rounded shadow flex justify-between"
                          >
                            <div className="flex flex-col items-start">
                              <Badge className="bg-primary">
                                {task.priority}
                              </Badge>
                              <div className="capitalize">
                                <h3 className="font-semibold text-lg">
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 my-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-4 w-4 mr-1" />
                                {task.dueDate}
                                </div>
                              )}
                              <div className="flex gap-1 mt-2">
                                {task.assignedUsers?.map((user) => (
                                  <Badge
                                    key={user.id}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {user.name}
                                  </Badge>
                                ))}
                                {(!task.assignedUsers ||
                                  task.assignedUsers.length === 0) && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    Unassigned
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Kanban;
