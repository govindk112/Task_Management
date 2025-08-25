"use client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import {
  HamburgerIcon,
  FolderKanban,
  Users,
  BarChart3,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useDashboardStore } from "@/store/DashboardStore";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";

interface SidebarProjectProps {
  userRole?: "ADMIN" | "USER";
}

const SidebarProject = ({ userRole }: SidebarProjectProps) => {
  const { activePage, setActivePage } = useDashboardStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem("token"); // remove token
    router.push("/Login"); // redirect to login
  };
  
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  
  // Check if user is admin
  const isAdmin = userRole === "ADMIN";

  return (
    <>
      {/* MOBILE MENU */}
      <div className="sm:hidden flex justify-between items-center p-3 shadow-md bg-background">
        <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <HamburgerIcon className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="space-y-2 p-4">
              <h1 className="py-2 font-bold border-b">Menu</h1>
              <DropdownMenuItem asChild>
                <Button
                  variant={activePage === "project" ? "default" : "link"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActivePage("project")}
                >
                  <FolderKanban className="h-4 w-4" />
                  Project Management
                </Button>
              </DropdownMenuItem>
              {/* Only show User Management if user is Admin */}
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Button
                    variant={activePage === "user" ? "default" : "link"}
                    className="w-full justify-start gap-2"
                    onClick={() => setActivePage("user")}
                  >
                    <Users className="h-4 w-4" />
                    User Management
                  </Button>
                </DropdownMenuItem>
              )}
              {/* Only show Analytics Report if user is Admin */}
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Button
                    variant={activePage === "analytics" ? "default" : "link"}
                    className="w-full justify-start gap-2"
                    onClick={() => setActivePage("analytics")}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics Report
                  </Button>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="bg-red-400 dark:bg-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* DESKTOP MENU */}
      <div className="bg-background border-r shadow-sm transition-all max-sm:hidden w-57 md:w-63">
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
              <Link href="/Profile">
  <Avatar className="cursor-pointer">
    <AvatarImage src="https://github.com/shadcn.png" alt="User" className="w-10 h-10 mx-auto rounded-3xl" />
    <AvatarFallback>GK</AvatarFallback>
  </Avatar>
</Link>
          
          </div>
          {/* Sidebar Navigation */}
          <nav className="flex-1 space-y-2 px-2">
            <Button
              variant={activePage === "project" ? "default" : "link"}
              className="w-full gap-2 justify-start"
              onClick={() => setActivePage("project")}
            >
              <FolderKanban className="h-4 w-4" />
              Project Management
            </Button>
            {/* Only show User Management if user is Admin */}
            {isAdmin && (
              <Button
                variant={activePage === "user" ? "default" : "link"}
                className="w-full gap-2 justify-start"
                onClick={() => setActivePage("user")}
              >
                <Users className="h-4 w-4" />
                User Management
              </Button>
            )}
            {/* Only show Analytics Report if user is Admin */}
            {isAdmin && (
              <Button
                variant={activePage === "analytics" ? "default" : "link"}
                className="w-full gap-2 justify-start"
                onClick={() => setActivePage("analytics")}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics Report
              </Button>
            )}
          </nav>
          {/* Logout Button */}
          <div className="flex items-center gap-4 p-4">
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarProject;