import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useListPolicies, getListPoliciesQueryKey } from "@workspace/api-client-react";
import type { Policy } from "@workspace/api-client-react";
import {
  ClipboardList, CalendarDays, FolderOpen, CheckCircle2, ArrowRight, Phone, Shield,
  TrendingUp, Building2, Landmark, HeartHandshake, FileText, LockKeyhole,
  CircleAlert, RefreshCw, ChevronRight, BriefcaseBusiness,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth";
import ToolkitDashboardPanel from "@/components/toolkit-dashboard-panel";

const currency = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 });

function formatDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

export default function Dashboard() {
  const { user } = useAuth();
  const isClient = user?.role === "client";
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } =
    useGetDashboardSummary({ query: { enabled: user?.role === "advisor", queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: policies, isLoading: policiesLoading, isError: policiesError, refetch: refetchPolicies } =
    useListPolicies({ query: { enabled: isClient, queryKey: getListPoliciesQueryKey() } });

  if (isClient) {
    return <ClientDashboard
      name={user?.name ?? ""}
      policies={policies}
      isLoading={policiesLoading}
      isError={policiesError}
      onRetry={() => refetchPolicies()}
    />;
  }

  return <AdvisorDashboard
    name={user?.name ?? ""}
    summary={summary}
    isLoading={summaryLoading}
    isError={summaryError}
    onRetry={() => refetchSummary()}
  />;
}

function ClientDashboard({
  name, policies, isLoading, isError, onRetry,
}: {
  name: string;
  policies?: Policy[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activePolicies = policies?.filter((policy) => policy.status.toLowerCase() === "active") ?? [];
  const totalCover = activePolicies.reduce((total, policy) => total + policy.coverAmount, 0);
  const monthlyPremium = activePolicies.reduce((total, policy) => total + policy.premium, 0);
  const nextRenewal = (policies ?? [])
    .filter((policy) => policy.status.toLowerCase() === "active"
      && policy.renewalDate
      && new Date(policy.renewalDate).getTime() >= today.getTime())
    .sort((a, b) => new Date(a.renewalDate!).getTime() - new Date(b.renewalDate!).getTime())[0];

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col justify-between gap-4 border-b border-[#d9d2c2] pb-6 sm:flex-row sm:items-end"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.19em] text-[#8a6d25]">
            <span className="h-px w-6 bg-[#c9a52a]" /> MyIFA client account
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1b2a4a] sm:text-[2.15rem]">
            Good to see you, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-[#667080]">Your cover, policy details and support in one place.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8e2dc] bg-[#f1f6f2] px-3 py-1.5 text-xs font-semibold text-[#37634e]">
          <LockKeyhole className="h-3.5 w-3.5" />
          Secure personal account
        </div>
      </motion.div>

      <section aria-label="Policy overview" className="grid gap-3 sm:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[118px] rounded-xl" />
            <Skeleton className="h-[118px] rounded-xl" />
            <Skeleton className="h-[118px] rounded-xl" />
          </>
        ) : isError ? (
          <Card className="sm:col-span-3 border-[#e6d6c7] bg-[#fffaf5]">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#a45b35]" />
                <div>
                  <p className="font-semibold text-[#1b2a4a]">Your policy information is temporarily unavailable</p>
                  <p className="mt-1 text-sm text-[#687180]">Please try again. Your account details have not been changed.</p>
                </div>
              </div>
              <Button variant="outline" onClick={onRetry} data-testid="button-retry-policies" className="border-[#d4c6b2] text-[#1b2a4a]">
                <RefreshCw className="mr-2 h-4 w-4" /> Try again
              </Button>
            </CardContent>
          </Card>
        ) : policies && policies.length > 0 ? (
          <>
            <OverviewStat icon={Shield} label="Active cover" value={currency.format(totalCover)} detail={`${activePolicies.length} active ${activePolicies.length === 1 ? "policy" : "policies"}`} accent />
            <OverviewStat icon={ClipboardList} label="Policies on record" value={String(policies.length)} detail="Across your MyIFA account" />
            <OverviewStat icon={CalendarDays} label="Next renewal" value={nextRenewal?.renewalDate ? formatDate(nextRenewal.renewalDate) : "No date listed"} detail={nextRenewal?.policyNumber ?? "Based on your policy records"} />
          </>
        ) : !isError ? (
          <Card className="sm:col-span-3 overflow-hidden border-[#e1d9ca] bg-[#fbf9f4]">
            <CardContent className="flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-[#ede6d6] p-3 text-[#1b2a4a]"><Shield className="h-5 w-5" /></div>
                <div>
                  <p className="font-serif text-xl font-semibold text-[#1b2a4a]">No policies are linked yet</p>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-[#697180]">When your cover is added to your MyIFA account, your policy details and renewal information will appear here.</p>
                </div>
              </div>
              <Link href="/contact" data-testid="link-contact-about-cover" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#80641d] hover:text-[#1b2a4a]">
                Ask your adviser <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <Card className="overflow-hidden border-[#e1d9ca] shadow-[0_3px_12px_rgba(27,42,74,0.035)]">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-[#eee9df] px-5 py-4 sm:px-6">
            <div>
              <CardTitle className="font-serif text-xl text-[#1b2a4a]">Your cover</CardTitle>
              <CardDescription className="mt-1 text-[#717986]">A clear view of the policies held on your account.</CardDescription>
            </div>
            <Link href="/policies" data-testid="link-view-all-policies" className="inline-flex items-center gap-1 whitespace-nowrap pt-1 text-sm font-semibold text-[#80641d] hover:text-[#1b2a4a]">
              All policies <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" />
              </div>
            ) : isError ? (
              <div className="p-6 text-sm text-[#697180]">Policy details could not be loaded. Use the retry option above.</div>
            ) : policies?.length ? (
              <div className="divide-y divide-[#eee9df]">
                {policies.slice(0, 5).map((policy) => (
                  <PolicyRow key={policy.id} policy={policy} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center px-6 py-8 text-center">
                <div className="mb-3 rounded-full bg-[#f1ede4] p-3 text-[#7a6a45]"><FileText className="h-5 w-5" /></div>
                <p className="font-medium text-[#1b2a4a]">Your policy list is empty</p>
                <p className="mt-1 max-w-sm text-sm leading-5 text-[#747b86]">Contact your adviser if you expected to see cover here.</p>
              </div>
            )}
            {!isLoading && !isError && (policies?.length ?? 0) > 5 && (
              <div className="border-t border-[#eee9df] px-6 py-3 text-xs text-[#747b86]">Showing 5 of {policies?.length} policies</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-[#e1d9ca] shadow-[0_3px_12px_rgba(27,42,74,0.035)]">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-xl text-[#1b2a4a]">At a glance</CardTitle>
              <CardDescription className="text-[#717986]">Figures from your active policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 px-5 pb-4">
              <div className="flex items-center justify-between border-t border-[#eee9df] py-3">
                <span className="text-sm text-[#687180]">Monthly premium</span>
                <span className="font-mono text-sm font-semibold text-[#1b2a4a]" data-testid="text-monthly-premium">{isLoading || isError ? "—" : `${currency.format(monthlyPremium)} / mo`}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#eee9df] py-3">
                <span className="text-sm text-[#687180]">Active policies</span>
                <span className="font-mono text-sm font-semibold text-[#1b2a4a]" data-testid="text-active-policy-count">{isLoading || isError ? "—" : activePolicies.length}</span>
              </div>
              <p className="border-t border-[#eee9df] pt-3 text-xs leading-5 text-[#868a91]">Policy terms and premiums are subject to your policy documents.</p>
            </CardContent>
          </Card>

          <div className="relative overflow-hidden rounded-xl bg-[#1b2a4a] p-5 text-white shadow-[0_8px_22px_rgba(27,42,74,0.12)]">
            <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border border-white/10" />
            <div className="absolute -right-2 -top-4 h-24 w-24 rounded-full border border-[#c9a52a]/30" />
            <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-[#d6b84e]">Here when you need us</p>
            <h2 className="relative mt-2 font-serif text-xl font-semibold">Talk to your adviser</h2>
            <p className="relative mt-1.5 text-sm leading-5 text-white/70">Questions about your cover? We can help you understand your policy.</p>
            <Link href="/contact" data-testid="link-contact-adviser" className="relative mt-4 inline-flex items-center gap-2 rounded-md bg-[#c9a52a] px-3.5 py-2.5 text-sm font-semibold text-[#1b2a4a] transition-colors hover:bg-[#d9b842]">
              <Phone className="h-4 w-4" /> Contact MyIFA <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1b2a4a]">Your MyIFA services</h2>
            <p className="mt-1 text-sm text-[#717986]">Useful next steps for your insurance and financial wellbeing.</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <ClientAction icon={CalendarDays} title="Appointments" description="Meet with your adviser" href="/appointments" />
          <ClientAction icon={FolderOpen} title="Documents" description="Upload or review files" href="/documents" />
          <ClientAction icon={FileText} title="Financial needs analysis" description="Review your financial picture" href="/fna" />
          <ClientAction icon={BriefcaseBusiness} title="Financial toolkits" description="Explore planning tools" href="/toolkits" />
        </div>
      </section>
    </div>
  );
}

function OverviewStat({ icon: Icon, label, value, detail, accent = false }: {
  icon: typeof Shield; label: string; value: string; detail: string; accent?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={`h-full border-[#e1d9ca] shadow-[0_3px_12px_rgba(27,42,74,0.035)] ${accent ? "bg-[#f8f5ec]" : "bg-[#fffefa]"}`}>
        <CardContent className="flex items-start gap-4 p-5">
          <div className={`rounded-lg p-2.5 ${accent ? "bg-[#e9dfbf] text-[#80641d]" : "bg-[#edf0f4] text-[#34445f]"}`}><Icon className="h-5 w-5" /></div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#727987]">{label}</p>
            <p className="mt-1 truncate font-mono text-xl font-semibold tracking-tight text-[#1b2a4a]" data-testid={`text-overview-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
            <p className="mt-1 truncate text-xs text-[#858994]">{detail}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PolicyRow({ policy }: { policy: Policy }) {
  const isActive = policy.status.toLowerCase() === "active";
  return (
    <div className="flex flex-col justify-between gap-3 px-5 py-4 transition-colors hover:bg-[#fbf9f4] sm:flex-row sm:items-center sm:px-6" data-testid={`row-policy-${policy.id}`}>
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 rounded-md border border-[#e5dfd3] bg-[#f8f6f0] p-2 text-[#45536a]"><Shield className="h-4 w-4" /></div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[#1b2a4a]">{policy.type}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isActive ? "bg-[#edf4ee] text-[#3d684d]" : "bg-[#f2efe8] text-[#756b58]"}`} data-testid={`status-policy-${policy.id}`}>{policy.status}</span>
          </div>
          <p className="mt-1 font-mono text-xs text-[#838995]">{policy.policyNumber}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-5 pl-11 sm:justify-end sm:pl-0">
        <div className="sm:text-right">
          <p className="font-mono text-sm font-semibold text-[#1b2a4a]">{currency.format(policy.coverAmount)}</p>
          <p className="mt-0.5 text-xs text-[#858994]">Cover amount</p>
        </div>
        {policy.renewalDate && (
          <div className="min-w-[84px] sm:text-right">
            <p className="text-sm font-medium text-[#34445f]">{formatDate(policy.renewalDate)}</p>
            <p className="mt-0.5 text-xs text-[#858994]">Renewal</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientAction({ icon: Icon, title, description, href }: {
  icon: typeof CalendarDays; title: string; description: string; href: string;
}) {
  return (
    <Link href={href} data-testid={`link-client-${title.toLowerCase().replace(/\s+/g, "-")}`} className="group flex items-center gap-3 rounded-lg border border-[#e1d9ca] bg-[#fffefa] p-3.5 transition-all hover:-translate-y-0.5 hover:border-[#c9a52a]/60 hover:shadow-[0_5px_14px_rgba(27,42,74,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a52a]">
      <div className="rounded-md bg-[#f1ede4] p-2 text-[#526078] transition-colors group-hover:bg-[#eee4c6] group-hover:text-[#80641d]"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1b2a4a]">{title}</p>
        <p className="mt-0.5 truncate text-xs text-[#7a808b]">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#9b927e] transition-transform group-hover:translate-x-0.5 group-hover:text-[#80641d]" />
    </Link>
  );
}

function AdvisorDashboard({
  name, summary, isLoading, isError, onRetry,
}: {
  name: string;
  summary?: {
    activePolicies: number;
    upcomingAppointments: number;
    totalDocuments: number;
    accountStatus: string;
    pendingFnaCount: number;
    recentActivity: { id: number; type: string; description: string; timestamp: string }[];
  };
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-serif text-3xl font-bold text-foreground">Welcome back, {firstName}</h1>
        <p className="mt-1 text-muted-foreground">Your financial overview at a glance</p>
      </motion.div>

      {isError ? (
        <Card className="border-[#e6d6c7] bg-[#fffaf5]">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-sm text-[#6d5960]"><CircleAlert className="h-5 w-5 text-[#a45b35]" /> Dashboard information could not be loaded.</div>
            <Button variant="outline" onClick={onRetry} data-testid="button-retry-dashboard"><RefreshCw className="mr-2 h-4 w-4" /> Try again</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {isLoading ? (
            <><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></>
          ) : summary ? (
            <>
              <StatCard icon={ClipboardList} label="Active Policies" value={summary.activePolicies.toString()} delay={0.1} />
              <StatCard icon={CalendarDays} label="Upcoming Appointments" value={summary.upcomingAppointments.toString()} delay={0.2} />
              <StatCard icon={FolderOpen} label="Documents" value={summary.totalDocuments.toString()} delay={0.3} />
              <StatCard icon={CheckCircle2} label="Account Status" value={summary.accountStatus} valueColor="text-green-700" delay={0.4} />
            </>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-4"><CardTitle className="font-serif text-xl">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <ActionRow icon={FileText} label="Review Client Toolkit Submissions" href="/toolkit-submissions" />
            <ActionRow icon={CalendarDays} label="Book an Appointment" href="/appointments" />
            <ActionRow icon={ClipboardList} label="View My Policies" href="/policies" />
            <ActionRow icon={FolderOpen} label="Upload a Document" href="/documents" />
            <ActionRow icon={FileText} label="Start new FNA" href="/fna" />
            <ActionRow icon={Phone} label="Contact My Adviser" href="/contact" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-sidebar text-sidebar-foreground shadow-md">
          <div className="absolute -mr-10 -mt-10 h-32 w-32 rounded-bl-full bg-sidebar-primary/20 right-0 top-0" />
          <CardHeader>
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-sidebar-foreground/70">Your Adviser</CardDescription>
            <CardTitle className="mt-1 font-serif text-2xl">Lance Heynes CFP®</CardTitle>
            <p className="text-sm font-medium text-sidebar-primary">Director of Operations</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-sidebar-primary">LH</div>
              <div><p className="text-sm text-sidebar-foreground/80">MyIFA</p><p className="text-xs text-sidebar-foreground/60">Sandton, South Africa</p></div>
            </div>
            <a href="tel:+27861283346" data-testid="link-call-adviser" className="flex w-full items-center justify-center rounded-md bg-sidebar-primary px-4 py-2.5 text-sm font-semibold text-sidebar-primary-foreground transition-colors hover:bg-sidebar-primary/90">
              <Phone className="mr-2 h-4 w-4" /> Call +27 86 128 3346
            </a>
          </CardContent>
        </Card>
      </div>

      <ToolkitDashboardPanel />

      <section>
        <h2 className="mb-4 font-serif text-xl font-bold text-foreground">Our Services</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <ServiceCard icon={Landmark} label="Estate Planning" />
          <ServiceCard icon={Shield} label="Life & Risk" />
          <ServiceCard icon={Building2} label="Business Planning" />
          <ServiceCard icon={TrendingUp} label="Retirement" />
          <ServiceCard icon={HeartHandshake} label="Financial Wellness" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, valueColor = "text-foreground", delay }: {
  icon: typeof ClipboardList; label: string; value: string; valueColor?: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, delay }}>
      <Card className="h-full border-border shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
          <div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-bold ${valueColor}`}>{value}</p></div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActionRow({ icon: Icon, label, href }: { icon: typeof FileText; label: string; href: string }) {
  return (
    <Link href={href} data-testid={`link-advisor-${label.toLowerCase().replace(/\s+/g, "-")}`} className="group flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-4 transition-colors hover:border-border hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-background text-muted-foreground shadow-sm transition-colors group-hover:text-primary"><Icon className="h-4 w-4" /></div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}

function ServiceCard({ icon: Icon, label }: { icon: typeof Landmark; label: string }) {
  return (
    <Card className="border-border shadow-sm transition-colors hover:border-primary/50">
      <CardContent className="flex h-32 flex-col items-center justify-center gap-3 p-4 text-center">
        <Icon className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}
