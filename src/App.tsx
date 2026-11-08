import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPlaceholder from "@/pages/LandingPlaceholder";
import SectionEntry from "@/pages/SectionEntry";
import LearningSection from "@/pages/sections/LearningSection";
import ExamPrepSection from "@/pages/sections/ExamPrepSection";
import InterviewSection from "@/pages/sections/InterviewSection";
import { SectionProvider } from "@/contexts/SectionContext";
import ResetAccess from "./pages/ResetAccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import AccessGate from "./components/AccessGate";
import { useEffect, type ReactNode } from "react";
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

const withAccess = (element: ReactNode) => <AccessGate>{element}</AccessGate>;

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
        <AppProvider>
          <SectionProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPlaceholder />} />
                <Route path="/sections" element={withAccess(<SectionEntry />)} />
                <Route path="/learning/*" element={withAccess(<LearningSection />)} />
                <Route path="/exam-preparation/*" element={withAccess(<ExamPrepSection />)} />
                <Route path="/interviews/*" element={withAccess(<InterviewSection />)} />
                <Route path="/lessons/a1/:lessonNumber" element={withAccess(<A1Lesson />)} />
                <Route path="/lessons/a2/:lessonNumber" element={withAccess(<A2Lesson />)} />
                <Route path="/lessons/b1/:lessonNumber" element={withAccess(<B1Lesson />)} />
                <Route path="/lessons/b2/:lessonNumber" element={withAccess(<B2Lesson />)} />
                <Route path="/exams" element={withAccess(<ExamsSelection />)} />
                <Route path="/exam/:instituteLevel" element={withAccess(<ExamSimulator />)} />
                <Route
                  path="/preparation/:institute/:level/:module/:teilId/:topicId"
                  element={withAccess(<PreparationSimulator />)}
                />
                <Route path="/reset-access" element={withAccess(<ResetAccess />)} />
                <Route path="/privacy-policy" element={withAccess(<PrivacyPolicy />)} />
                <Route path="/about" element={withAccess(<About />)} />
                <Route path="/stats" element={withAccess(<SimpleAnalytics />)} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={withAccess(<NotFound />)} />
              </Routes>
              <ScrollToTopButton />
            </BrowserRouter>
          </SectionProvider>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
