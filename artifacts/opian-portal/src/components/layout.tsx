import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, ClipboardList, CalendarDays, FolderOpen, Contact, Settings, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Policies", href: "/policies", icon: ClipboardList },
  { name: "Appointments", href: "/appointments", icon: CalendarDays },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "FNA Form", href: "/fna", icon: FileText },
  { name: "FNA Submissions", href: "/fna/list", icon: FileText },
  { name: "Contact Adviser", href: "/contact", icon: Contact },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-[100dvh] w-full bg-background font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-sidebar flex flex-col z-20">
        <div className="h-20 flex flex-col items-center justify-center border-b border-white/10">
          <div className="flex items-center gap-2 text-white mb-1">
            <ShieldCheck className="h-6 w-6 text-sidebar-primary" />
            <span className="font-serif text-xl font-bold tracking-wider">OPIAN</span>
          </div>
          <span className="text-sidebar-primary text-xs font-semibold tracking-[0.2em]">NFS GROUP</span>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
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

        <div className="p-3 mt-auto">
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
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pl-[240px] flex flex-col min-h-[100dvh]">
        <header className="h-20 bg-background flex items-center justify-end px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">KH</AvatarFallback>
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
