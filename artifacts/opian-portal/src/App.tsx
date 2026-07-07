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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/** Renders the app shell with auth-gated routes. */
function ProtectedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

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

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      {/* Protected app routes */}
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
