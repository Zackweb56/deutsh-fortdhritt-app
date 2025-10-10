import { AppProvider, useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { TabNavigation } from '@/components/TabNavigation';
import { ScheduleTab } from '@/components/schedule/ScheduleTab';
import { VocabularyTab } from '@/components/vocabulary/VocabularyTab';
import { ResourcesTab } from '@/components/resources/ResourcesTab';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { GraduationCap, RefreshCw } from 'lucide-react';

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
