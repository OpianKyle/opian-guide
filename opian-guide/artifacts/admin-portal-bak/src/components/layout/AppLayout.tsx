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
  Briefcase,
  UserPlus,
  Upload,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: session, isLoading } = useAdminGetSession();
  const logout = useAdminLogout();

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
    { href: "/leads", label: "Leads", icon: UserPlus },
    { href: "/import-leads", label: "Import Leads", icon: Upload },
    { href: "/email-campaigns", label: "Email Campaigns", icon: Mail },
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
    <div className="min-h-[100dvh] flex bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col hidden md:flex shadow-sm">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <img src="/logo.png" alt="MyIFA Financial Services" className="h-8 object-contain" />
        </div>

        {/* Role badge */}
        <div className="px-5 pt-4 pb-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Command Centre
          </span>
        </div>

        <div className="flex-1 py-2 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/20"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground truncate">{session.admin.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{session.admin.role?.replace('_', ' ')}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 md:hidden shadow-sm">
          <img src="/logo.png" alt="MyIFA" className="h-7 object-contain" />
          <button onClick={handleLogout} className="text-muted-foreground p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
