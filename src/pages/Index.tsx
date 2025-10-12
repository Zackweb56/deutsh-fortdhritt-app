import { AppProvider, useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TabNavigation } from '@/components/TabNavigation';
import { ScheduleTab } from '@/components/schedule/ScheduleTab';
import { VocabularyTab } from '@/components/vocabulary/VocabularyTab';
import { ResourcesTab } from '@/components/resources/ResourcesTab';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { GraduationCap, RefreshCw, Info, Shield } from 'lucide-react';

const AppContent = () => {
  const { currentTab, isLoaded } = useApp();
  const { resetAll } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95 relative">
        <div className="container mx-auto px-4 py-4 relative">
          <div className="absolute left-4 top-4">
            <Button onClick={() => setConfirmOpen(true)} className="h-10 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <RefreshCw className="h-5 w-5 ml-2" />
              <span>إعادة التعيين</span>
            </Button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">تعلم الألمانية بنفسك</h1>
                <p className="text-xs text-muted-foreground">أداة يومية لتطوير مهاراتك بسرعة</p>
              </div>
            </div>
          </div>
          <TabNavigation />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {currentTab === 'schedule' && <ScheduleTab />}
        {currentTab === 'vocabulary' && <VocabularyTab />}
        {currentTab === 'resources' && <ResourcesTab />}
      </main>
      
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <div dir="rtl" className="text-right">
            <AlertDialogHeader className="sm:text-right text-right mb-4">
              <AlertDialogTitle>إعادة تعيين التقدم</AlertDialogTitle>
              <AlertDialogDescription>
                هذا الإجراء سيعيد ضبط كل التقدم، وسيمسح المفردات والموارد المضافة. هل أنت متأكد؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:flex-row-reverse flex-row-reverse justify-between">
              <AlertDialogCancel onClick={() => setConfirmOpen(false)}>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={() => { resetAll(); setConfirmOpen(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">إعادة تعيين</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>DeutschPath - تعلم الألمانية بنفسك</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/about" 
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Info className="h-4 w-4" />
                حول التطبيق
              </Link>
              <Link 
                to="/privacy-policy" 
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="h-4 w-4" />
                سياسة الخصوصية
              </Link>
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>تم التطوير بـ ❤️ لمساعدة متعلمي اللغة الألمانية</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
