"use client"

import { Button } from "./ui/button"
import { Plus, List, LayoutGrid } from "lucide-react"
import { useDashboardStore } from "@/store/DashboardStore"
import { useModalStore } from "@/store/modalStore"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"

const Header = () => {
    const { boardView, setBoardView } = useDashboardStore()
    const { setIsAddModalOpen } = useModalStore()
    const router = useRouter();
    
    return(
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Task Management</h2>
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
        className="cursor-pointer"
         onClick={() => router.push("/Profile")} 
      >
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="User" className="w-10 h-10 mx-auto rounded-3xl"/>
          <AvatarFallback>GK</AvatarFallback>
        </Avatar>
      </div>
            </div>
           
        </div>
    )
}

export default Header;
