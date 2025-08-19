import { TaskPriority,Task } from "@/Types/types";

export const EMPTY_TASK: Task = {
  _id: "",
  title: "",
  description: "",
  status: "To Do",
  priority: "Low",
  dueDate: undefined,
};

export const priorityOptions =(priority: TaskPriority) => {
    if (priority === "Low") {
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    } else if (priority === "Medium") {
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    } else if (priority === "High") {
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    }
};