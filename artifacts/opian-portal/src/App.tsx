import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { AppLayout } from '@/components/layout';
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

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
