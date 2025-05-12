import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminEstablishments from "@/pages/admin/establishments";
import OwnerDashboard from "@/pages/owner/dashboard";
import ClientDashboard from "@/pages/client/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} role="admin" />
      <ProtectedRoute path="/admin/users" component={AdminUsers} role="admin" />
      <ProtectedRoute path="/admin/establishments" component={AdminEstablishments} role="admin" />
      <ProtectedRoute path="/owner" component={OwnerDashboard} role="owner" />
      <ProtectedRoute path="/client" component={ClientDashboard} role="client" />
      <ProtectedRoute path="/" component={() => {
        return <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Bem-vindo ao AgendaHub</h1>
            <p className="text-lg">Você será redirecionado para o seu painel...</p>
          </div>
        </div>;
      }} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="agendahub-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
