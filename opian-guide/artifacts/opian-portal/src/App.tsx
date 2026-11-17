import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from 'wouter';

import { AuthProvider, useAuth } from '@/contexts/auth';
import { AppLayout } from '@/components/layout';
import Auth from '@/pages/auth';
import HomePage from '@/pages/home';
import Dashboard from '@/pages/dashboard';
import Leads from '@/pages/leads';
import EmailCampaigns from '@/pages/email-campaigns';
import FnaForm from '@/pages/fna';
import FnaList from '@/pages/fna-list';
import Policies from '@/pages/policies';
import Appointments from '@/pages/appointments';
import Documents from '@/pages/documents';
import Toolkits from '@/pages/toolkits';
import ToolkitSubmissions from '@/pages/toolkit-submissions';
import PersonalToolkitAd from '@/pages/personal-toolkit-ad';
import BusinessToolkitAd from '@/pages/business-toolkit-ad';
import Contact from '@/pages/contact';
import Settings from '@/pages/settings';
import NotFound from '@/pages/not-found';

// Admin pages
import AdminDashboard from '@/pages/admin/dashboard';
import AdminLeads from '@/pages/admin/leads';
import AdminImportLeads from '@/pages/admin/import-leads';
import AdminAdvisors from '@/pages/admin/advisors';
import AdminAdmins from '@/pages/admin/admins';
import AdminFna from '@/pages/admin/fna';
import AdminAppointments from '@/pages/admin/appointments';
import AdminPolicies from '@/pages/admin/policies';
import AdminDocuments from '@/pages/admin/documents';
import AdminClients from '@/pages/admin/clients';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const homeTitle = 'Free Financial Planning Tools for South Africans | MyIFA';
const homeDescription =
  'Free financial planning tools and practical guides for South Africans. Understand your options, then explore an independent provider selected by MyIFA.';

function RouteMetadata() {
  const [location] = useLocation();

  useEffect(() => {
    const isLandingPage = location === '/';
    document.title = isLandingPage ? homeTitle : 'MyIFA | Secure Portal';

    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute(
        'content',
        isLandingPage ? homeDescription : 'Secure sign-in and account pages for MyIFA users.',
      );
    document
      .querySelector<HTMLMetaElement>('meta[name="robots"]')
      ?.setAttribute('content', isLandingPage ? 'index, follow' : 'noindex, nofollow');

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (isLandingPage) {
      canonical?.setAttribute('href', 'https://myifa.co.za/');
    } else {
      canonical?.remove();
    }

    const openGraphUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (isLandingPage) {
      openGraphUrl?.setAttribute('content', 'https://myifa.co.za/');
    } else {
      openGraphUrl?.remove();
    }
  }, [location]);

  return null;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    </div>
  );
}

/** Advisor / client protected routes */
function ProtectedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Redirect to="/auth" />;

  return (
    <AppLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/leads" component={Leads} />
        <Route path="/email-campaigns">
          {() => user.role === "advisor" ? <EmailCampaigns /> : <Redirect to="/dashboard" />}
        </Route>
        <Route path="/fna/list">
          {() => user.role === "advisor" ? <FnaList /> : <Redirect to="/dashboard" />}
        </Route>
        <Route path="/policies" component={Policies} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/documents" component={Documents} />
        <Route path="/toolkits">
          {() => user.role === "client" ? <Toolkits /> : <Redirect to="/dashboard" />}
        </Route>
        <Route path="/toolkit-submissions">
          {() => user.role === "advisor" ? <ToolkitSubmissions /> : <Redirect to="/dashboard" />}
        </Route>
        <Route path="/contact" component={Contact} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

/** Keep FNA submissions public while showing the portal shell to signed-in users. */
function FnaRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <FnaForm />;

  return (
    <AppLayout>
      <FnaForm />
    </AppLayout>
  );
}

/** Admin protected routes */
function AdminProtectedApp() {
  const { adminUser, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!adminUser) return <Redirect to="/auth?role=admin" />;

  return (
    <AppLayout>
      <Switch>
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/leads" component={AdminLeads} />
        <Route path="/admin/email-campaigns" component={EmailCampaigns} />
        <Route path="/admin/import-leads" component={AdminImportLeads} />
        <Route path="/admin/advisors" component={AdminAdvisors} />
        <Route path="/admin/admins" component={AdminAdmins} />
        <Route path="/admin/fna" component={AdminFna} />
        <Route path="/admin/toolkit-submissions" component={ToolkitSubmissions} />
        <Route path="/admin/appointments" component={AdminAppointments} />
        <Route path="/admin/policies" component={AdminPolicies} />
        <Route path="/admin/documents" component={AdminDocuments} />
        <Route path="/admin/clients" component={AdminClients} />
        <Route><Redirect to="/admin/dashboard" /></Route>
      </Switch>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={Auth} />
      <Route path="/fna" component={FnaRoute} />
      <Route path="/personal-toolkit" component={PersonalToolkitAd} />
      <Route path="/business-toolkit" component={BusinessToolkitAd} />
      {/* Admin */}
      <Route path="/admin/:rest*">{() => <AdminProtectedApp />}</Route>
      {/* Advisor / client */}
      <Route>{() => <ProtectedApp />}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <RouteMetadata />
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
