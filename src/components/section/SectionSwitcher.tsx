import { ArrowRight, ChevronDown, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function SectionSwitcher() {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  if (!isExpanded) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="fixed bottom-5 start-5 z-50 h-12 w-12 rounded-full border-border bg-card shadow-lg"
        aria-label="إظهار زر الأقسام"
        aria-expanded={false}
        onClick={() => setIsExpanded(true)}
      >
        <LayoutGrid aria-hidden="true" className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div
      className="fixed bottom-5 start-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur"
      dir="rtl"
    >
      <Button
        type="button"
        className="h-11 gap-2 rounded-xl px-4 shadow-sm"
        aria-label="العودة إلى الأقسام"
        onClick={() => navigate("/sections")}
      >
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
        <span className="font-semibold">العودة إلى الأقسام</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
        aria-label="إخفاء زر الأقسام"
        aria-expanded={true}
        onClick={() => setIsExpanded(false)}
      >
        <ChevronDown aria-hidden="true" className="h-5 w-5" />
      </Button>
    </div>
  );
}
