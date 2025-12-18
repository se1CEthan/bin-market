import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { BotCollections } from "@/components/BotCollections";
import { BotComparison } from "@/components/BotComparison";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import BotListing from "@/pages/BotListing";
import BotDetail from "@/pages/BotDetail";
import DeveloperDashboard from "@/pages/DeveloperDashboard";
import UploadBot from "@/pages/UploadBot";
import DeveloperSignup from "@/pages/DeveloperSignup";
import AdminDashboard from "@/pages/AdminDashboard";
import Account from "@/pages/Account";
import PaymentSuccess from "@/pages/PaymentSuccess";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/" component={Home} />
          <Route path="/bots" component={BotListing} />
          <Route path="/bot/:id" component={BotDetail} />
          <Route path="/developer/dashboard" component={DeveloperDashboard} />
          <Route path="/developer/upload" component={UploadBot} />
          <Route path="/developer/signup" component={DeveloperSignup} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/account" component={Account} />
          <Route path="/account/purchases" component={Account} />
          <Route path="/collections" component={BotCollections} />
          <Route path="/compare" component={BotComparison} />
          <Route path="/payment/success/:botId" component={PaymentSuccess} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
