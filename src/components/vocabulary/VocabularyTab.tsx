import { useState } from 'react';
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
      <Tabs defaultValue="learning" className="w-full">
        <TabsList className="flex w-full sm:grid sm:grid-cols-4 overflow-x-auto">
          <TabsTrigger value="learning" className="text-[10px] sm:text-sm">تعلم المفردات</TabsTrigger>
          <TabsTrigger value="quiz" className="text-[10px] sm:text-sm">اختبار المقالات</TabsTrigger>
          <TabsTrigger value="add" className="text-[10px] sm:text-sm">إضافة مفردة جديدة</TabsTrigger>
          <TabsTrigger value="list" className="text-[10px] sm:text-sm">قائمة المفردات</TabsTrigger>
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
