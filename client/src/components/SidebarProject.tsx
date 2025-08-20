"use client"

import { Button } from "./ui/button"
import { useRouter } from "next/navigation";
import { HamburgerIcon, LayoutGrid, List, LogOut, Moon, Sun, Users, BarChart3, FolderKanban } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useDashboardStore } from "@/store/DashboardStore"
import { useTheme } from "next-themes"

const SidebarProject = () => {
  const { boardView, setBoardView, activePage, setActivePage } = useDashboardStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <>
      {/* MOBILE MENU  */}
      <div className="sm:hidden flex justify-between items-center p-3 shadow-md bg-background">
        <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>

        <div className="flex justify-center items-center">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <HamburgerIcon className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="space-y-2 p-4">
              <h1 className="py-2 font-bold border-b">Menu</h1>

              {/* Project Management */}
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

              {/* User Management */}
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

              {/* Analytics Report */}
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

              <DropdownMenuItem className="bg-red-400 dark:bg-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
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
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Sidebar Nav */}
          <nav className="flex-1 space-y-2 px-2">
            <Button
              variant={activePage === "project" ? "default" : "link"}
              className="w-full gap-2 justify-start"
              onClick={() => setActivePage("project")}
            >
              <FolderKanban className="h-4 w-4" />
              Project Management
            </Button>

            <Button
              variant={activePage === "user" ? "default" : "link"}
              className="w-full gap-2 justify-start"
              onClick={() => setActivePage("user")}
            >
              <Users className="h-4 w-4" />
              User Management
            </Button>

            <Button
              variant={activePage === "analytics" ? "default" : "link"}
              className="w-full gap-2 justify-start"
              onClick={() => setActivePage("analytics")}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics Report
            </Button>
          </nav>

          {/* Logout */}
          <div className="flex items-center gap-4 p-4">
            <Button variant="destructive" className="w-full">
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
