import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, ClipboardList, CalendarDays, FolderOpen, Contact, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";

const advisorNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Policies", href: "/policies", icon: ClipboardList },
  { name: "Appointments", href: "/appointments", icon: CalendarDays },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "FNA Form", href: "/fna", icon: FileText },
  { name: "FNA Submissions", href: "/fna/list", icon: FileText },
  { name: "Contact Adviser", href: "/contact", icon: Contact },
];

const clientNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Policies", href: "/policies", icon: ClipboardList },
  { name: "Appointments", href: "/appointments", icon: CalendarDays },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "FNA Form", href: "/fna", icon: FileText },
  { name: "Contact Adviser", href: "/contact", icon: Contact },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = user?.role === "advisor" ? advisorNavItems : clientNavItems;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="flex min-h-[100dvh] w-full bg-background font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-sidebar flex flex-col z-20">
        <div className="h-20 flex items-center justify-center border-b border-white/10 px-4">
          <Logo />
        </div>

        {/* Role badge */}
        {user && (
          <div className="mx-3 mt-3 px-3 py-1.5 bg-white/5 rounded-md border border-white/10">
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">
              {user.role === "advisor" ? "Advisor Portal" : "Client Portal"}
            </p>
          </div>
        )}
        
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? "bg-sidebar-primary text-white" 
                    : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link 
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location === "/settings"
                ? "bg-sidebar-primary text-white" 
                : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="font-medium text-sm">Settings</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pl-[240px] flex flex-col min-h-[100dvh]">
        <header className="h-16 bg-background flex items-center justify-between px-8 z-10 sticky top-0 border-b border-border">
          <div />
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user.role}</p>
              </div>
            )}
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
