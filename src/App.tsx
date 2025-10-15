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
import NotFound from "./pages/NotFound";
import ScrollToTopButton from "./components/ScrollToTopButton";
import A1Lesson from "./pages/lessons/A1Lesson";
import A2Lesson from "./pages/lessons/A2Lesson";
import B1Lesson from "./pages/lessons/B1Lesson";
import B2Lesson from "./pages/lessons/B2Lesson";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AccessGate>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lessons/a1/:lessonNumber" element={<A1Lesson />} />
            <Route path="/lessons/a2/:lessonNumber" element={<A2Lesson />} />
            <Route path="/lessons/b1/:lessonNumber" element={<B1Lesson />} />
            <Route path="/lessons/b2/:lessonNumber" element={<B2Lesson />} />
            <Route path="/reset-access" element={<ResetAccess />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ScrollToTopButton />
        </BrowserRouter>
      </AccessGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
