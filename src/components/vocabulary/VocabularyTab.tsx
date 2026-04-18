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
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 p-2 sm:grid-cols-4">
          <TabsTrigger
            value="learning"
            className="h-auto min-h-12 whitespace-normal px-3 py-3 text-center text-xs leading-5 sm:min-h-10 sm:text-sm"
          >
            تعلم المفردات
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="h-auto min-h-12 whitespace-normal px-3 py-3 text-center text-xs leading-5 sm:min-h-10 sm:text-sm"
          >
            اختبار أدوات التعريف
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="h-auto min-h-12 whitespace-normal px-3 py-3 text-center text-xs leading-5 sm:min-h-10 sm:text-sm"
          >
            إضافة مفردة جديدة
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="h-auto min-h-12 whitespace-normal px-3 py-3 text-center text-xs leading-5 sm:min-h-10 sm:text-sm"
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
