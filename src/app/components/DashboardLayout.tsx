import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  LogOut, 
  GraduationCap,
  Menu,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { useSharedData } from "../context/SharedDataContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  sidebar?: ReactNode;
}

export function DashboardLayout({ children, title, sidebar }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const { announcements } = useSharedData();

  // Filter announcements for the current user
  const myAnnouncements = announcements
    .filter(a => {
      if (a.author_id === user?.user_id) return false; // don't notify them of their own announcements
      if (a.target_audience === "all") return true;
      if (user?.role === "student" && a.target_audience === user?.batch) return true;
      return false;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // We can just mock unread status by showing up to 5 recent ones, and showing a badge if there are any.
  const unreadCount = myAnnouncements.length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = () => {
    const roleLabels = {
      super_admin: "Super Admin",
      hod: "HOD",
      staff: "Staff",
      student: "Student",
    };
    return roleLabels[user?.role || "student"];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            {sidebar && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  {sidebar}
                </SheetContent>
              </Sheet>
            )}
            
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold hidden sm:block">Academic Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{getRoleBadge()}</p>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 bg-red-500">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 mr-4" align="end">
                <div className="p-4 border-b">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {myAnnouncements.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                  ) : (
                    myAnnouncements.slice(0, 5).map((ann) => (
                      <div key={ann.id} className="p-4 border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm text-gray-900">{ann.title}</p>
                          <span className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{ann.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {user?.name && getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="hidden md:block w-64 border-r bg-white min-h-[calc(100vh-4rem)] sticky top-16">
            {sidebar}
          </aside>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
