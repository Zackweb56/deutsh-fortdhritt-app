import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ResetAccess from "./pages/ResetAccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import AccessGate from "./components/AccessGate";
import { useEffect } from "react";
import { setupAdsAutoSync } from "./lib/ads";
import NotFound from "./pages/NotFound";
import ScrollToTopButton from "./components/ScrollToTopButton";
import A1Lesson from "./pages/lessons/A1Lesson";
import A2Lesson from "./pages/lessons/A2Lesson";
import B1Lesson from "./pages/lessons/B1Lesson";
import B2Lesson from "./pages/lessons/B2Lesson";
import { AppProvider } from "./contexts/AppContext";

const queryClient = new QueryClient();

import ExamSimulator from "./pages/exam/ExamSimulator";
import ExamsSelection from "./pages/exam/ExamsSelection";
import PreparationSimulator from "./pages/preparation/PreparationSimulator";
import SimpleAnalytics from "./pages/admin/SimpleAnalytics";

const getDeviceId = (): string => {
  try {
    const key = 'device_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'fallback-id';
  }
};

const App = () => {
  useEffect(() => {
    setupAdsAutoSync();
    
    // Record visit for analytics
    const recordVisit = async () => {
      // Don't track on localhost to avoid 404 errors during development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
      }
      
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: getDeviceId() }),
        });
      } catch (error) {
        // Silently fail in production
      }
    };
    
    recordVisit();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AccessGate>
          <AppProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/lessons/a1/:lessonNumber" element={<A1Lesson />} />
                <Route path="/lessons/a2/:lessonNumber" element={<A2Lesson />} />
                <Route path="/lessons/b1/:lessonNumber" element={<B1Lesson />} />
                <Route path="/lessons/b2/:lessonNumber" element={<B2Lesson />} />
                 <Route path="/exams" element={<ExamsSelection />} />
                <Route path="/exam/:instituteLevel" element={<ExamSimulator />} />
                <Route path="/preparation/:institute/:level/:module/:teilId/:topicId" element={<PreparationSimulator />} />
                <Route path="/reset-access" element={<ResetAccess />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/about" element={<About />} />
                <Route path="/stats" element={<SimpleAnalytics />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ScrollToTopButton />
            </BrowserRouter>
          </AppProvider>
        </AccessGate>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
