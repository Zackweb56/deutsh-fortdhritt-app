import { useApp } from '@/contexts/AppContext';
import { VocabularyForm } from './VocabularyForm';
import { VocabularyTable } from './VocabularyTable';
import { VocabularyLearning } from './VocabularyLearning';
import { ArtikelQuiz } from './ArtikelQuiz';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const VocabularyTab = () => {
  const { vocabulary } = useApp();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="learning" className="w-full" dir="rtl">
        <TabsList className="flex flex-wrap h-auto w-full gap-1.5 p-1.5 justify-start sm:justify-center rounded-lg bg-muted/50">
          <TabsTrigger
            value="learning"
            className="flex-auto sm:flex-1 h-auto min-h-9 whitespace-nowrap px-3 py-2 text-center text-[8px] sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            تعلم المفردات
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="flex-auto sm:flex-1 h-auto min-h-9 whitespace-nowrap px-3 py-2 text-center text-[8px] sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            اختبار أدوات التعريف
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="flex-auto sm:flex-1 h-auto min-h-9 whitespace-nowrap px-3 py-2 text-center text-[8px] sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            إضافة مفردة جديدة
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="flex-auto sm:flex-1 h-auto min-h-9 whitespace-nowrap px-3 py-2 text-center text-[8px] sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            قائمة المفردات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="learning" className="space-y-6">
          <VocabularyLearning />
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6">
          <ArtikelQuiz />
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <Card className="card-gradient p-6">
            <h2 className="text-xl font-bold mb-4">إضافة مفردة جديدة</h2>
            <VocabularyForm />
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-6">
          <Card className="card-gradient p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">قائمة المفردات</h2>
              <div className="text-sm text-muted-foreground">
                {vocabulary.length} مفردة
              </div>
            </div>
            <VocabularyTable />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
