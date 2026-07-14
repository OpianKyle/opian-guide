import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAdminGetSession, useAdminLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  FileText, 
  Calendar, 
  Shield, 
  FolderOpen, 
  LogOut,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: session, isLoading } = useAdminGetSession();
  const logout = useAdminLogout();

  // Redirect to login when session is resolved and there's no admin — never
  // call setLocation during render; put it in an effect instead.
  useEffect(() => {
    if (!isLoading && !session?.admin) {
      setLocation("/login");
    }
  }, [isLoading, session, setLocation]);

  if (isLoading || !session?.admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
    });
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/advisors", label: "Advisors", icon: Briefcase },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/fna", label: "FNA Submissions", icon: FileText },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/policies", label: "Policies", icon: Shield },
    { href: "/documents", label: "Documents", icon: FolderOpen },
  ];

  if (session.admin.role === "super_admin") {
    navItems.push({ href: "/admins", label: "Admin Users", icon: UserCog });
  }

  return (
    <div className="min-h-[100dvh] flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-sidebar-primary-foreground font-semibold text-lg tracking-tight">
            <div className="w-6 h-6 bg-sidebar-primary rounded flex items-center justify-center text-xs">O</div>
            OPIAN <span className="text-sidebar-foreground/60 font-normal">Admin</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Platform
          </div>
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">{session.admin.name}</span>
              <span className="text-xs text-sidebar-foreground/60 capitalize">{session.admin.role?.replace('_', ' ')}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center justify-between px-8 md:hidden">
          <div className="font-semibold text-foreground">OPIAN</div>
          <button onClick={handleLogout} className="text-muted-foreground"><LogOut className="w-5 h-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
