
import Dashboard from "@/components/Dashboard";
import AddTaskModal from "@/components/AddTaskModal";
import DeleteModal from "@/components/DeleteTask";

export default function Home() {
  return (
    <>
      <Dashboard />
      <AddTaskModal />
      <DeleteModal />
    </>
  )
}
