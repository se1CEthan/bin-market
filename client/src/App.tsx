import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { AnimatePresence } from "framer-motion";
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
import { ScrollToTop, ParticleBackground } from "@/components/ui/floating-elements";

// Lazy-loaded pages to reduce initial bundle size
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Home = lazy(() => import("@/pages/Home"));
const BotListing = lazy(() => import("@/pages/BotListing"));
const BotDetail = lazy(() => import("@/pages/BotDetail"));
const DeveloperDashboard = lazy(() => import("@/pages/DeveloperDashboard"));
const UploadBot = lazy(() => import("@/pages/UploadBot"));
const DeveloperSignup = lazy(() => import("@/pages/DeveloperSignup"));
const DeveloperPayPalCallback = lazy(() => import("@/pages/DeveloperPayPalCallback"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Account = lazy(() => import("@/pages/Account"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <ParticleBackground />
      <Header />
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/verify-email" component={VerifyEmail} />
              <Route path="/checkout/:botId" component={Checkout} />
              <Route path="/" component={Home} />
              <Route path="/bots" component={BotListing} />
              <Route path="/bot/:id" component={BotDetail} />
              <Route path="/developer/dashboard" component={DeveloperDashboard} />
              <Route path="/developer/dashboardinteractive" component={DeveloperDashboard} />
              <Route path="/developer/upload" component={UploadBot} />
              <Route path="/developer/signup" component={DeveloperSignup} />
              <Route path="/developer/paypal/callback" component={DeveloperPayPalCallback} />
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/account" component={Account} />
              <Route path="/account/purchases" component={Account} />
              <Route path="/collections" component={BotCollections} />
              <Route path="/compare">
                {() => <BotComparison />}
              </Route>
              <Route path="/payment/success/:botId" component={PaymentSuccess} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </AnimatePresence>
      </main>
      <Footer />
      <ChatWidget />
      <ScrollToTop />
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
