import { useState } from 'react';
import { Resource, useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronDown, Plus, ExternalLink, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ResourceCategoryProps {
  category: {
    id: string;
    title: string;
    icon: string;
  };
  resources: Resource[];
}

export const ResourceCategory = ({ category, resources }: ResourceCategoryProps) => {
  const { addResource, deleteResource } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<Resource[] | null>(null);
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);

  const handleAdd = () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    addResource({
      category: category.id,
      title: newTitle.trim(),
      url: newUrl.trim(),
      isDefault: false,
    });

    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
    toast.success('تمت إضافة المصدر');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteResource(deleteId);
      toast.success('تم حذف المصدر');
      setDeleteId(null);
    }
  };

  const handleAISuggest = async () => {
    setIsGenerating(true);
    setSuggestions(null);
    try {
      // Try calling a backend AI endpoint. This endpoint is optional and not bundled with the app.
      // POST body: { categoryId, categoryTitle }
      const resp = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category.id, categoryTitle: category.title }),
      });

      if (resp.ok) {
        const data = await resp.json();
        // Expecting { suggestions: [{ title, url, isDefault? }] }
        if (Array.isArray(data?.suggestions) && data.suggestions.length > 0) {
          const parsed: Resource[] = data.suggestions.map((s: any, idx: number) => ({
            id: `suggested-${Date.now()}-${idx}`,
            category: category.id,
            title: s.title || s.name || 'Untitled',
            url: s.url || s.link || s.href || '',
            isDefault: !!s.isDefault,
          }));
          setSuggestions(parsed);
          setSuggestDialogOpen(true);
          setIsGenerating(false);
          return;
        }
      }

      // Fallback: generate local suggestions (no external API required)
      const fallback = generateLocalSuggestions(category.title);
      setSuggestions(fallback);
      setSuggestDialogOpen(true);
    } catch (error) {
      console.error('AI suggest error', error);
      const fallback = generateLocalSuggestions(category.title);
      setSuggestions(fallback);
      setSuggestDialogOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSuggestion = (res: Resource) => {
    addResource({ category: category.id, title: res.title, url: res.url, isDefault: false });
    toast.success('تمت إضافة المصدر المقترح');
  };

  // A small local fallback suggestion generator. Add more seeds as needed.
  const generateLocalSuggestions = (catTitle: string): Resource[] => {
    const title = catTitle.toLowerCase();
    const now = Date.now();
    if (title.includes('الاستماع') || title.includes('استماع') || title.includes('تحدث')) {
      return [
        { id: `local-${now}-1`, category: category.id, title: 'Easy German (YouTube)', url: 'https://www.youtube.com/@EasyGerman', isDefault: false },
        { id: `local-${now}-2`, category: category.id, title: 'Coffee Break German (Podcast)', url: 'https://coffeebreakgerman.com', isDefault: false },
        { id: `local-${now}-3`, category: category.id, title: 'Deutsche Welle - Audio', url: 'https://learngerman.dw.com/en/overview', isDefault: false },
      ];
    }

    if (title.includes('القواعد') || title.includes('كتابة')) {
      return [
        { id: `local-${now}-1`, category: category.id, title: 'Goethe Institut - Grammar', url: 'https://www.goethe.de', isDefault: false },
        { id: `local-${now}-2`, category: category.id, title: 'Deutsche Welle - Grammar', url: 'https://learngerman.dw.com', isDefault: false },
        { id: `local-${now}-3`, category: category.id, title: 'Grammarly German articles', url: 'https://www.grammarly.com', isDefault: false },
      ];
    }

    if (title.includes('مفردات') || title.includes('قراءة')) {
      return [
        { id: `local-${now}-1`, category: category.id, title: 'Memrise German', url: 'https://www.memrise.com', isDefault: false },
        { id: `local-${now}-2`, category: category.id, title: 'Anki Shared Decks (German)', url: 'https://ankiweb.net', isDefault: false },
        { id: `local-${now}-3`, category: category.id, title: 'Deutsche Welle - Top-Thema', url: 'https://www.dw.com/de/deutsch-lernen/top-thema/s-8031', isDefault: false },
      ];
    }

    // Generic suggestions
    return [
      { id: `local-${now}-1`, category: category.id, title: 'YouTube: Easy German', url: 'https://www.youtube.com/@EasyGerman', isDefault: false },
      { id: `local-${now}-2`, category: category.id, title: 'Goethe Institut', url: 'https://www.goethe.de', isDefault: false },
      { id: `local-${now}-3`, category: category.id, title: 'Deutsche Welle', url: 'https://learngerman.dw.com', isDefault: false },
    ];
  };

  return (
    <Card className="card-gradient">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <h3 className="text-lg font-bold">{category.title}</h3>
              <Badge variant="secondary">{resources.length}</Badge>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-3 mt-3">
            {resources.map(resource => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 min-w-0 flex-1 hover:text-primary transition-colors"
                  >
                    <span className="truncate">{resource.title}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  {resource.isDefault && (
                    <Badge variant="outline" className="flex-shrink-0">افتراضي</Badge>
                  )}
                </div>

                {!resource.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(resource.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {isAdding && (
              <div className="space-y-2 p-3 border border-primary rounded-lg">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="عنوان المصدر"
                />
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                  className="text-left"
                />
                <div className="flex gap-2">
                    <Button onClick={handleAdd} variant="default" className="flex-1">
                      حفظ
                    </Button>
                  <Button
                    onClick={() => {
                      setIsAdding(false);
                      setNewTitle('');
                      setNewUrl('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {!isAdding && (
                <Button
                  onClick={() => setIsAdding(true)}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة مصدر</span>
                </Button>
              )}
              
              <Button
                onClick={handleAISuggest}
                className="flex-1 gap-2 bg-neutral-800 text-neutral-foreground"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري الإنشاء...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>عرض اقتراحات المصادر</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Suggestions dialog */}
      {suggestDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg max-w-3xl w-full p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">اقتراحات لمصادر {category.title}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => { setSuggestDialogOpen(false); setSuggestions(null); }}>
                  إغلاق
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {suggestions && suggestions.length > 0 ? (
                suggestions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex-1 min-w-0">
                      <a href={s.url || '#'} target="_blank" rel="noreferrer" className="truncate hover:text-primary">{s.title}</a>
                      <div className="text-sm text-muted-foreground">{s.url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleAddSuggestion(s)} variant="secondary">إضافة</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-6">لا توجد اقتراحات</div>
              )}
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المصدر؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
