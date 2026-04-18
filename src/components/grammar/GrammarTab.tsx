import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenCheck, PenTool } from 'lucide-react';
import { GrammarVerbsTab } from '@/components/grammar/GrammarVerbsTab';
import { GrammarExercisesTab } from '@/components/grammar/GrammarExercisesTab';

export const GrammarTab = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="exercises" className="w-full" dir="rtl">
        <TabsList className="w-full overflow-x-auto flex sm:w-auto gap-2 p-1">
          <TabsTrigger value="exercises" className="flex items-center gap-2 text-[11px] sm:text-sm whitespace-nowrap px-3 py-2">
            <PenTool className="h-4 w-4" />
            تمارين القواعد
          </TabsTrigger>
          <TabsTrigger value="reference" className="flex items-center gap-2 text-[11px] sm:text-sm whitespace-nowrap px-3 py-2">
            <BookOpenCheck className="h-4 w-4" />
            القواعد والأفعال
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-6">
          <GrammarExercisesTab />
        </TabsContent>

        <TabsContent value="reference" className="space-y-6">
          <GrammarVerbsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

