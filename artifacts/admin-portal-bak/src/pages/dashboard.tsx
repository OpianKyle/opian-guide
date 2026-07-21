import { useAdminGetDashboard } from "@workspace/api-client-react";
import { Users, Briefcase, FileText, Calendar, Shield, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useAdminGetDashboard();

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 bg-card border rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Advisors", value: dashboard.totalAdvisors, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Clients", value: dashboard.totalClients, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "FNA Submissions", value: dashboard.totalFnaSubmissions, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Pending FNAs", value: dashboard.pendingFna, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Active Policies", value: dashboard.totalPolicies, icon: Shield, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Appointments", value: dashboard.totalAppointments, icon: Calendar, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground">Command centre metrics and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card border rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent FNAs */}
        <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b flex justify-between items-center bg-muted/20">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Recent FNA Submissions
            </h2>
            <Link href="/fna" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboard.recentFna.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No recent submissions</td>
                  </tr>
                ) : (
                  dashboard.recentFna.map(fna => (
                    <tr key={fna.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{fna.firstName} {fna.lastName}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          fna.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                          fna.status === 'in_progress' ? 'bg-amber-500/10 text-amber-600' :
                          fna.status === 'pending' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {fna.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {format(new Date(fna.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b flex justify-between items-center bg-muted/20">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Upcoming Appointments
            </h2>
            <Link href="/appointments" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Advisor</th>
                  <th className="px-5 py-3 font-medium">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboard.recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No upcoming appointments</td>
                  </tr>
                ) : (
                  dashboard.recentAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{apt.clientName}</td>
                      <td className="px-5 py-3 text-muted-foreground">{apt.advisorName}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {format(new Date(apt.date), "MMM d, yyyy")} <span className="mx-1">•</span> {apt.time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
