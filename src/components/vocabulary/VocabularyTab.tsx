import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { VocabularyForm } from './VocabularyForm';
import { VocabularyTable } from './VocabularyTable';
import { VocabularyLearning } from './VocabularyLearning';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const VocabularyTab = () => {
  const { vocabulary } = useApp();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="learning" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learning">تعلم المفردات</TabsTrigger>
          <TabsTrigger value="add">إضافة مفردة جديدة</TabsTrigger>
          <TabsTrigger value="list">قائمة المفردات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="learning" className="space-y-6">
          <VocabularyLearning />
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
