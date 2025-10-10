import { Calendar, BookOpen, Library } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// Exam simulation links (Goethe official practice pages)
const EXAM_SIMULATIONS = [
  { level: 'A1', title: 'Goethe — Practice materials A1', url: 'https://www.goethe.de/ins/mm/en/spr/prf/gzsd1/ueb.html' },
  { level: 'A2', title: 'Goethe — Exam training A2', url: 'https://www.goethe.de/ins/us/en/spr/prf/ueb/pa2.html' },
  { level: 'A2', title: 'Goethe — Practice materials A2', url: 'https://www.goethe.de/ins/de/en/prf/prf/gzsd2/ub2.html' },
  { level: 'B1', title: 'Goethe — Exam training B1', url: 'https://www.goethe.de/ins/us/en/spr/prf/ueb/pb1.html' },
  { level: 'B1', title: 'Goethe — Practice materials B1', url: 'https://www.goethe.de/ins/mm/en/spr/prf/gzb1/ueb.html' },
  { level: 'B2', title: 'Goethe — Exam training B2', url: 'https://www.goethe.de/ins/us/en/spr/prf/ueb/pb2.html' },
  { level: 'B2', title: 'Goethe — Practice materials B2', url: 'https://www.goethe.de/ins/mm/en/spr/prf/gzb2/ue9.html' },
];

export const TabNavigation = () => {
  const { currentTab, setCurrentTab } = useApp();

  const tabs = [
    { id: 'schedule' as const, label: 'الجدول الزمني', icon: Calendar },
    { id: 'vocabulary' as const, label: 'المفردات', icon: BookOpen },
    { id: 'resources' as const, label: 'المصادر', icon: Library },
  ];

  return (
    <div
      className="
        flex flex-wrap sm:flex-nowrap
        gap-2 p-2
        bg-card rounded-lg border border-border
        w-full
      "
    >
      {/* Exam simulations dialog trigger */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="
              flex-none w-full sm:w-auto
              justify-center
            "
          >
            محاكاة الامتحان
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>محاكاة الامتحان - نماذج رسمية</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {EXAM_SIMULATIONS.map((s) => (
              <div
                key={s.url}
                className="
                  p-2 rounded border border-border
                  flex flex-col sm:flex-row
                  sm:items-center sm:justify-between
                  gap-2
                "
              >
                <div>
                  <div className="font-medium text-sm sm:text-base">
                    {s.level} — {s.title}
                  </div>
                </div>
                <div>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    افتح المحاكاة
                  </a>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter />
        </DialogContent>
      </Dialog>

      {/* Tabs navigation */}
      <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <Button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              variant="ghost"
              className={`
                flex-1 gap-2 justify-center
                text-sm sm:text-base
                ${isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-neutral-800 text-neutral-foreground'}
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
