import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const VocabularyForm = () => {
  const { addVocabulary } = useApp();
  const [german, setGerman] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [translation, setTranslation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!german.trim() || !translation.trim()) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    addVocabulary({
      german: german.trim(),
      pronunciation: pronunciation.trim(),
      translation: translation.trim(),
    });

    setGerman('');
    setPronunciation('');
    setTranslation('');
    
    toast.success('تمت إضافة المفردة بنجاح');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="german">الكلمة الألمانية *</Label>
          <Input
            id="german"
            value={german}
            onChange={(e) => setGerman(e.target.value)}
            placeholder="z.B. Guten Tag"
            dir="ltr"
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pronunciation">النطق</Label>
          <Input
            id="pronunciation"
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
            placeholder="[ˈɡuːtn̩ taːk]"
            dir="ltr"
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="translation">الترجمة العربية *</Label>
          <Input
            id="translation"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder="مرحباً"
          />
        </div>
      </div>

      <Button type="submit" variant="default" className="w-full gap-2">
        <Plus className="h-4 w-4" />
        <span>إضافة</span>
      </Button>
    </form>
  );
};
