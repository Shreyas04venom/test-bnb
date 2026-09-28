import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import AuthPage from "./pages/Auth";
import OnboardingPage from "./pages/Onboarding";
import DashboardPage from "./pages/Dashboard";
import ProjectsPage from "./pages/Projects";
import ProjectDetailPage from "./pages/ProjectDetail";
import PatchesPage from "./pages/Patches";
import PatchDetailPage from "./pages/PatchDetail";
import DeploymentsPage from "./pages/Deployments";
import VerificationPage from "./pages/Verification";
import ConflictsPage from "./pages/Conflicts";
import CollaborationPage from "./pages/Collaboration";
import VersionsPage from "./pages/Versions";
import RollbackPage from "./pages/Rollback";
import AuditLogsPage from "./pages/AuditLogs";
import SettingsPage from "./pages/Settings";
import IntegrationsHubPage from "./pages/integrations/IntegrationsHub";
import GitHubIntegrationPage from "./pages/integrations/GitHubIntegration";
import VercelIntegrationPage from "./pages/integrations/VercelIntegration";
import NetlifyIntegrationPage from "./pages/integrations/NetlifyIntegration";
import SupabaseIntegrationPage from "./pages/integrations/SupabaseIntegration";
import ExtensionConnectPage from "./pages/ExtensionConnect";
import ExtensionSuccessPage from "./pages/ExtensionSuccess";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* Landing */}
      <Route path="/" component={Home} />
      <Route path="/features" component={Home} />
      <Route path="/security" component={Home} />
      <Route path="/pricing" component={Home} />
      <Route path="/about" component={Home} />

      {/* Auth */}
      <Route path="/login" component={AuthPage} />
      <Route path="/signup" component={AuthPage} />

      {/* Onboarding */}
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/onboarding/github" component={OnboardingPage} />
      <Route path="/onboarding/provider" component={OnboardingPage} />
      <Route path="/onboarding/project" component={OnboardingPage} />
      <Route path="/onboarding/verify" component={OnboardingPage} />
      <Route path="/onboarding/extension" component={OnboardingPage} />

      {/* Dashboard Core Control Plane */}
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:id" component={ProjectDetailPage} />
      <Route path="/patches" component={PatchesPage} />
      <Route path="/patches/:id" component={PatchDetailPage} />
      <Route path="/deployments" component={DeploymentsPage} />
      <Route path="/verification" component={VerificationPage} />
      <Route path="/conflicts" component={ConflictsPage} />
      <Route path="/collaboration" component={CollaborationPage} />
      <Route path="/versions" component={VersionsPage} />
      <Route path="/rollback" component={RollbackPage} />
      <Route path="/audit" component={AuditLogsPage} />
      <Route path="/notifications" component={DashboardPage} />

      {/* Settings & Distinct Integrations */}
      <Route path="/settings" component={SettingsPage} />
      <Route path="/settings/profile" component={SettingsPage} />
      <Route path="/settings/workspace" component={SettingsPage} />
      <Route path="/settings/team" component={SettingsPage} />
      <Route path="/settings/integrations" component={IntegrationsHubPage} />
      <Route path="/settings/integrations/github" component={GitHubIntegrationPage} />
      <Route path="/settings/integrations/vercel" component={VercelIntegrationPage} />
      <Route path="/settings/integrations/netlify" component={NetlifyIntegrationPage} />
      <Route path="/settings/integrations/supabase" component={SupabaseIntegrationPage} />
      <Route path="/settings/security" component={SettingsPage} />
      <Route path="/settings/extension" component={SettingsPage} />
      <Route path="/settings/ai" component={SettingsPage} />
      <Route path="/settings/billing" component={SettingsPage} />

      {/* Chrome Extension Pairing & Auth */}
      <Route path="/extension/connect" component={ExtensionConnectPage} />
      <Route path="/extension/success" component={ExtensionSuccessPage} />
      <Route path="/extension/revoke" component={ExtensionConnectPage} />

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
