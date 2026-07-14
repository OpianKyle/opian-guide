import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';

import { AuthProvider, useAuth } from '@/contexts/auth';
import { AppLayout } from '@/components/layout';
import Landing from '@/pages/landing';
import Auth from '@/pages/auth';
import Dashboard from '@/pages/dashboard';
import FnaForm from '@/pages/fna';
import FnaList from '@/pages/fna-list';
import Policies from '@/pages/policies';
import Appointments from '@/pages/appointments';
import Documents from '@/pages/documents';
import Contact from '@/pages/contact';
import Settings from '@/pages/settings';
import NotFound from '@/pages/not-found';

// Admin pages
import AdminDashboard from '@/pages/admin/dashboard';
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
        <Route path="/fna" component={FnaForm} />
        <Route path="/fna/list" component={FnaList} />
        <Route path="/policies" component={Policies} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/documents" component={Documents} />
        <Route path="/contact" component={Contact} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
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
        <Route path="/admin/advisors" component={AdminAdvisors} />
        <Route path="/admin/admins" component={AdminAdmins} />
        <Route path="/admin/fna" component={AdminFna} />
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
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
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
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
