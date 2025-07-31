
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Ads from "./pages/Ads";
import TalentPool from "./pages/TalentPool";
import Matching from "./pages/Matching";
import Applicants from "./pages/Applicants";
import LinkedIn from "./pages/LinkedIn";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FloatingAIAgent from "@/components/ai/FloatingAIAgent";
import SuperAIAgent from "@/components/ai/SuperAIAgent";
import AiInterview from "./pages/AiInterview";
import Assessment from "./pages/Assessment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FloatingAIAgent />
          <SuperAIAgent />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/ads" element={
              <ProtectedRoute>
                <Ads />
              </ProtectedRoute>
            } />
            <Route path="/applicants" element={
              <ProtectedRoute>
                <Applicants />
              </ProtectedRoute>
            } />
            <Route path="/talent-pool" element={
              <ProtectedRoute>
                <TalentPool />
              </ProtectedRoute>
            } />
            <Route path="/matching" element={
              <ProtectedRoute>
                <Matching />
              </ProtectedRoute>
            } />
            <Route path="/ai-interview" element={
              <ProtectedRoute>
                <AiInterview />
              </ProtectedRoute>
            } />
            <Route path="/assessment" element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            } />
            <Route path="/linkedin" element={
              <ProtectedRoute>
                <LinkedIn />
              </ProtectedRoute>
            } />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
