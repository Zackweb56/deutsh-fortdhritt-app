import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { VocabularyForm } from './VocabularyForm';
import { VocabularyTable } from './VocabularyTable';
import { Card } from '@/components/ui/card';

export const VocabularyTab = () => {
  const { vocabulary } = useApp();

  return (
    <div className="space-y-6">
      <Card className="card-gradient p-6">
        <h2 className="text-xl font-bold mb-4">إضافة مفردة جديدة</h2>
        <VocabularyForm />
      </Card>

      <Card className="card-gradient p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">قائمة المفردات</h2>
          <div className="text-sm text-muted-foreground">
            {vocabulary.length} مفردة
          </div>
        </div>
        <VocabularyTable />
      </Card>
    </div>
  );
};
