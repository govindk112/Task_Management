"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Kanban = () => {
  const [tasks, setTasks] = useState([
    { _id: "1", title: "Design Homepage", priority: "High", status: "To Do", dueDate: new Date(), description: "Create hero section" },
    { _id: "2", title: "Setup API", priority: "Medium", status: "In Progress", dueDate: new Date(), description: "Integrate auth" },
    { _id: "3", title: "Testing", priority: "Low", status: "Completed", dueDate: new Date(), description: "Unit tests" }
  ]);

  const statuses = ["To Do", "In Progress", "Completed"];

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If moved to a new column
    if (source.droppableId !== destination.droppableId) {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === draggableId
            ? { ...task, status: destination.droppableId }
            : task
        )
      );
    } else {
      // If reordered in the same column
      const columnTasks = tasks.filter((t) => t.status === source.droppableId);
      const [movedTask] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, movedTask);

      // Rebuild the task list preserving other columns
      const newTasks = tasks.filter((t) => t.status !== source.droppableId);
      setTasks([...newTasks, ...columnTasks]);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 justify-evenly max-lg:flex-wrap">
        {statuses.map((status) => (
          <div key={status} className="dark:bg-secondary bg-gray-200 p-4 rounded-lg w-full">
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
                    .sort((a, b) => a.index - b.index) // keep order
                    .map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-background p-4 rounded shadow flex justify-between"
                          >
                            <div className="flex flex-col items-start">
                              <Badge className={"bg-primary"}>{task.priority}</Badge>
                              <div className="capitalize">
                                <h3 className="font-semibold text-lg">{task.title}</h3>
                                {task.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 my-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {format(task.dueDate, "MMM d, yyyy")}
                                </div>
                              )}
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
