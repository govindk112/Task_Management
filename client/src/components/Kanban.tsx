"use client";
import React from "react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTaskStore } from "@/store/taskStore";

interface KanbanProps {
  projectId?: string | null;
}

const Kanban: React.FC<KanbanProps> = ({ projectId }) => {
  const { tasks, updateTask, getTasksByProject } = useTaskStore();
  const statuses = ["To Do", "In Progress", "Completed"];

  // Filter tasks by project if projectId is provided
  const projectTasks = projectId ? getTasksByProject(projectId) : tasks;

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If moved to a new column (status change)
    if (source.droppableId !== destination.droppableId) {
      updateTask({
        ...projectTasks.find((t) => t._id === draggableId)!,
        status: destination.droppableId,
      });
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
                  {projectTasks
                    .filter((task) => task.status === status)
                    .map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
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
                                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                                </div>
                              )}
                              {/* User badges */}
                              <div className="flex gap-1 mt-2">
                                {task.assignedUsers?.map((user) => (
                                  <Badge key={user.id} variant="secondary" className="text-xs">
                                    {user.name}
                                  </Badge>
                                ))}
                                {(!task.assignedUsers || task.assignedUsers.length === 0) && (
                                  <Badge variant="outline" className="text-xs">Unassigned</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
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
