"use client"
import Header from "./Header"
import Sidebar from "./Sidebar";
import Tasklist from "./Tasklist";
import Kanban from "./Kanban";
import { useDashboardStore } from "@/store/DashboardStore";

export default function Dashboard() {
     const { boardView, setBoardView } = useDashboardStore()
    return (
     <div className="flex max-sm:flex-col h-screen bg-secondary dark:bg-background">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <Header />
        {boardView === "list" ? <Tasklist  /> : <Kanban/>}
      </div>
    </div>
  );
}