"use client"

import { Button } from "./ui/button"
import { Plus, List, LayoutGrid } from "lucide-react"
import { useDashboardStore } from "@/store/DashboardStore"
import { useModalStore } from "@/store/modalStore"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { useSearchParams } from "next/navigation"
import { useProjectStore } from "@/store/useProjectStore"
import { useEffect, useState } from "react"

const Header = () => {
    const { boardView, setBoardView } = useDashboardStore()
    const { setIsAddModalOpen } = useModalStore()
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId');
    const { projects } = useProjectStore();
    
    const [headerTitle, setHeaderTitle] = useState("Task Management");
    
    useEffect(() => {
        if (projectId) {
            const project = projects.find(p => p.id === projectId);
            setHeaderTitle(project?.name || "Task Management");
        } else {
            setHeaderTitle("Task Management");
        }
    }, [projectId, projects]);
    
    return(
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{headerTitle}</h2>
            <div className="flex items-center gap-4">
               
                <Button 
                    size="sm" 
                    className="bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
                 <div
      >
      </div>
            </div>
           
        </div>
    )
}

export default Header;
