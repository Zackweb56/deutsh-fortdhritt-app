import { Calendar, BookOpen, GraduationCap, Globe, PenTool, Headphones, FileText, Library, ArrowRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface TabNavigationProps {
  onSelect?: () => void;
}

export const TabNavigation = ({ onSelect }: TabNavigationProps = {}) => {
  const { currentTab, setCurrentTab } = useApp();
  const navigate = useNavigate();

  const tabs = [
    { id: 'schedule' as const, label: 'الجدول الزمني', icon: Calendar },
    { id: 'vocabulary' as const, label: 'المفردات', icon: BookOpen },
    { id: 'grammar' as const, label: 'القواعد', icon: PenTool },
    { id: 'lessons' as const, label: 'الدروس', icon: GraduationCap },
    { id: 'listening' as const, label: 'الاستماع والقراءة', icon: Headphones },
    { id: 'writing' as const, label: 'الكتابة', icon: FileText },
    { id: 'resources' as const, label: 'المصادر', icon: Globe },
    { id: 'preparation' as const, label: 'التحضير للامتحان', icon: Library },
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
      {/* Exam resources were moved to the resources tab */}

      {/* Tabs navigation */}
      <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <Button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id);
                onSelect?.();
              }}
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
