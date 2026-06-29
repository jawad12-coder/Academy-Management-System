import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Users, BookOpen, UserCheck, 
  CreditCard, FileText, Award, Calendar,
  Image as ImageIcon, MessageSquare, Settings, LogOut,
  Bell, Menu, X, BookMarked
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getNavigation = (role: string | undefined) => {
  switch (role) {
    case 'admin':
    case 'owner':
      return [
        { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Students', href: '/dashboard/admin/students', icon: Users },
        { name: 'Teachers', href: '/dashboard/admin/teachers', icon: BookOpen },
        { name: 'Parents', href: '/dashboard/admin/parents', icon: UserCheck },
        { name: 'Classes', href: '/dashboard/admin/classes', icon: BookMarked },
        { name: 'Subjects', href: '/dashboard/admin/subjects', icon: BookOpen },
        { name: 'Attendance', href: '/dashboard/admin/attendance', icon: Calendar },
        { name: 'Fees', href: '/dashboard/admin/fees', icon: CreditCard },
        { name: 'Exams', href: '/dashboard/admin/exams', icon: FileText },
        { name: 'Results', href: '/dashboard/admin/results', icon: Award },
        { name: 'Homework', href: '/dashboard/admin/homework', icon: BookOpen },
        { name: 'Notices', href: '/dashboard/admin/notices', icon: MessageSquare },
        { name: 'Inquiries', href: '/dashboard/admin/inquiries', icon: Users },
        { name: 'Gallery', href: '/dashboard/admin/gallery', icon: ImageIcon },
        { name: 'Messages', href: '/dashboard/admin/messages', icon: MessageSquare },
        { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
      ];
    case 'teacher':
      return [
        { name: 'Overview', href: '/dashboard/teacher', icon: LayoutDashboard },
        { name: 'Attendance', href: '/dashboard/teacher/attendance', icon: Calendar },
        { name: 'Homework', href: '/dashboard/teacher/homework', icon: BookOpen },
        { name: 'Results', href: '/dashboard/teacher/results', icon: Award },
      ];
    case 'parent':
      return [
        { name: 'Overview', href: '/dashboard/parent', icon: LayoutDashboard },
        { name: 'Messages', href: '/dashboard/parent/messages', icon: MessageSquare },
      ];
    case 'student':
      return [
        { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
      ];
    default:
      return [];
  }
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = getNavigation(user?.role);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground">
          <Link href="/" className="flex items-center gap-2 font-serif font-bold text-lg cursor-pointer">
            <span className="text-accent">Awan</span> Academy
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background shadow-sm z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-foreground hidden sm:block">
              {navigation.find(n => n.href === location)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url || ''} alt={user?.full_name || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs font-semibold mt-1 uppercase text-accent">
                      {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { window.location.href = '/'; }}>
                  Return to Website
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
