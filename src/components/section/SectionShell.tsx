import { useEffect, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SectionSwitcher } from "@/components/section/SectionSwitcher";
import { useSection, type AppSection } from "@/contexts/SectionContext";

interface SectionShellProps {
  title: string;
  subtitle?: string;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function SectionShell({ title, subtitle, fullWidth = false, children }: SectionShellProps) {
  const { pathname } = useLocation();
  const { setSection } = useSection();

  useEffect(() => {
    const section: AppSection | undefined = pathname.startsWith("/learning")
      ? "learning"
      : pathname.startsWith("/exam-preparation")
        ? "exam-preparation"
        : pathname.startsWith("/interviews")
          ? "interviews"
          : undefined;
    if (section) setSection(section);
  }, [pathname, setSection]);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <header className="border-b border-border bg-card/60">
        <div
          className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-5 lg:px-8"
          dir="ltr"
        >
          <div className="min-w-0 space-y-1 text-left" dir="rtl">
            <h2 className="text-sm font-bold leading-tight tracking-tight sm:text-2xl">{title}</h2>
            {subtitle && <p className="text-[10px] leading-tight text-muted-foreground sm:text-sm">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2 text-right sm:gap-3" dir="rtl">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden sm:h-12 sm:w-12">
              <img src="/deutschpath_logo.svg" alt="DeutschPath" className="h-9 w-9 object-contain sm:h-12 sm:w-12" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight sm:text-lg">تعلم الألمانية بنفسك</p>
              <p className="text-[9px] leading-tight text-muted-foreground sm:text-xs">أداة يومية لتطوير مهاراتك بسرعة</p>
            </div>
          </div>
        </div>
      </header>
      <main
        className={
          fullWidth
            ? "mx-auto w-full max-w-7xl"
            : "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        }
      >
        {children ?? <Outlet />}
      </main>
      <SectionSwitcher />
    </div>
  );
}
