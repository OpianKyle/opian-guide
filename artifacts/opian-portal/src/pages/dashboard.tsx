import { useGetDashboardSummary } from "@workspace/api-client-react";
import { 
  ClipboardList, CalendarDays, FolderOpen, CheckCircle2, 
  ArrowRight, Phone, Shield, TrendingUp, Building2, 
  Landmark, HeartHandshake, FileText, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-serif font-bold text-foreground">Welcome back, Kyle</h1>
        <p className="text-muted-foreground mt-1">Your financial overview at a glance</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : summary ? (
          <>
            <StatCard 
              icon={ClipboardList} 
              label="Active Policies" 
              value={summary.activePolicies.toString()} 
              delay={0.1}
            />
            <StatCard 
              icon={CalendarDays} 
              label="Upcoming Appointments" 
              value={summary.upcomingAppointments.toString()} 
              delay={0.2}
            />
            <StatCard 
              icon={FolderOpen} 
              label="Documents" 
              value={summary.totalDocuments.toString()} 
              delay={0.3}
            />
            <StatCard 
              icon={CheckCircle2} 
              label="Account Status" 
              value={summary.accountStatus} 
              valueColor="text-green-600"
              delay={0.4}
            />
          </>
        ) : null}
      </div>

      {/* Main Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <ActionRow icon={CalendarDays} label="Book an Appointment" href="/appointments" />
            <ActionRow icon={ClipboardList} label="View My Policies" href="/policies" />
            <ActionRow icon={FolderOpen} label="Upload a Document" href="/documents" />
            <ActionRow icon={FileText} label="Start new FNA" href="/fna" />
            <ActionRow icon={Phone} label="Contact My Adviser" href="/contact" />
          </CardContent>
        </Card>

        {/* Your Adviser */}
        <Card className="bg-sidebar text-sidebar-foreground border-none shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sidebar-primary/20 rounded-bl-full -mr-10 -mt-10" />
          <CardHeader>
            <CardDescription className="text-sidebar-foreground/70 uppercase tracking-wider text-xs font-bold">
              Your Adviser
            </CardDescription>
            <CardTitle className="text-2xl font-serif mt-1">Lance Heynes CFP®</CardTitle>
            <p className="text-sidebar-primary text-sm font-medium">Director of Operations</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg text-sidebar-primary">
                LH
              </div>
              <div>
                <p className="text-sm text-sidebar-foreground/80">Opian NFS Group</p>
                <p className="text-xs text-sidebar-foreground/60">Sandton, South Africa</p>
              </div>
            </div>
            <Button className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground font-semibold">
              <Phone className="mr-2 h-4 w-4" />
              Call +27 86 128 3346
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Our Services */}
      <div>
        <h2 className="text-xl font-serif font-bold text-foreground mb-4">Our Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ServiceCard icon={Landmark} label="Estate Planning" />
          <ServiceCard icon={Shield} label="Life & Risk" />
          <ServiceCard icon={Building2} label="Business Planning" />
          <ServiceCard icon={TrendingUp} label="Retirement" />
          <ServiceCard icon={HeartHandshake} label="Financial Wellness" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, valueColor = "text-foreground", delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="shadow-sm border-border h-full">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActionRow({ icon: Icon, label, href }: any) {
  return (
    <Link href={href} className="group flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function ServiceCard({ icon: Icon, label }: any) {
  return (
    <Card className="shadow-sm border-border hover:border-primary/50 transition-colors cursor-pointer group">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3 h-32">
        <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}
