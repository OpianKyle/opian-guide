import { Route, Switch, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Advisors from "./pages/advisors";
import Admins from "./pages/admins";
import Fna from "./pages/fna";
import Appointments from "./pages/appointments";
import Policies from "./pages/policies";
import Documents from "./pages/documents";
import Clients from "./pages/clients";
import Leads from "./pages/leads";
import ImportLeads from "./pages/import-leads";
import EmailCampaigns from "./pages/email-campaigns";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/advisors" component={Advisors} />
        <Route path="/admins" component={Admins} />
        <Route path="/fna" component={Fna} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/policies" component={Policies} />
        <Route path="/documents" component={Documents} />
        <Route path="/clients" component={Clients} />
        <Route path="/leads" component={Leads} />
        <Route path="/import-leads" component={ImportLeads} />
        <Route path="/email-campaigns" component={EmailCampaigns} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/:rest*" component={ProtectedRoutes} />
        </Switch>
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
