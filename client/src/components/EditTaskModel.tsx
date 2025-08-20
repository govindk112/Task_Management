"use client";

import React from "react";
import { Task } from "@/Types/types";
import { Button } from "./ui/button";
import { MoreVertical } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useModalStore } from "@/store/modalStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const EditDeleteMenu = ({ task }: { task: Task }) => {
  const { setTaskToDelete, setTaskToEdit } = useTaskStore();
  const { setIsDeleteModalOpen, setIsAddModalOpen } = useModalStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setTaskToEdit(task); // Store the task
            setIsAddModalOpen(true); // Open the Edit Task modal
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTaskToDelete(task._id);
            setIsDeleteModalOpen(true);
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EditDeleteMenu;
