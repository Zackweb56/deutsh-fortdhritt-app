import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Check, 
  ChevronLeft, 
  Volume2, 
  ArrowLeft, 
  ExternalLink,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';
import { speakGerman } from '@/lib/tts';
import vocabsData from '@/data/vocabulars/vocabs_data.json';

interface VocabItem {
  de: string;
  ar: string[];
}

interface Topic {
  topic: string;
  topic_ar: string;
  count: number;
  vocab: VocabItem[];
}

interface Section {
  section: string;
  section_ar: string;
  total_vocab: number;
  topics: Topic[];
}

export const VocabsLibrary = () => {
  const { addVocabulary, vocabulary } = useApp();
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  
  // View State: 'sections' | 'topics' | 'cards'
  const [view, setView] = useState<'sections' | 'topics' | 'cards'>('sections');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Check if a word is already in the app's vocabulary list
  const isAlreadyAdded = (german: string) => {
    return vocabulary.some(v => v.german.toLowerCase() === german.toLowerCase());
  };

  const filteredSections = useMemo(() => {
    if (!search) return vocabsData.sections as Section[];

    const lowerSearch = search.toLowerCase();
    
    return (vocabsData.sections as Section[]).map(section => {
      const filteredTopics = section.topics.map(topic => {
        const filteredVocab = topic.vocab.filter(v => 
          v.de.toLowerCase().includes(lowerSearch) || 
          v.ar.some(a => a.includes(lowerSearch))
        );

        if (filteredVocab.length > 0) {
          return { ...topic, vocab: filteredVocab };
        }

        if (topic.topic.toLowerCase().includes(lowerSearch) || 
            topic.topic_ar.includes(lowerSearch)) {
          return topic;
        }

        return null;
      }).filter(Boolean) as Topic[];

      if (filteredTopics.length > 0 || 
          section.section.toLowerCase().includes(lowerSearch) || 
          section.section_ar.includes(lowerSearch)) {
        return { ...section, topics: filteredTopics.length > 0 ? filteredTopics : section.topics };
      }

      return null;
    }).filter(Boolean) as Section[];
  }, [search]);

  const handleAdd = (item: VocabItem) => {
    const translation = item.ar.join('، ');
    addVocabulary({
      german: item.de,
      translation: translation,
      pronunciation: '-', 
    });
    setAddedIds(prev => new Set(prev).add(item.de));
    toast.success(`تمت إضافة "${item.de}" إلى قائمتك`);
  };

  const handlePlaySound = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakGerman(text);
  };

  const renderGermanWord = (text: string) => {
    const parts = text.split(' ');
    if (parts.length > 1) {
      const article = parts[0].toLowerCase();
      const rest = parts.slice(1).join(' ');
      
      if (article === 'der') return <><span className="text-blue-400">der</span> {rest}</>;
      if (article === 'die') return <><span className="text-primary font-bold">die</span> {rest}</>;
      if (article === 'das') return <><span className="text-accent">das</span> {rest}</>;
    }
    return text;
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    setView('topics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setView('cards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (view === 'cards') {
      setView('topics');
      setSelectedTopic(null);
    } else if (view === 'topics') {
      setView('sections');
      setSelectedSection(null);
    }
  };

  // 1. Cards View (Vocabulary Items)
  if (view === 'cards' && selectedTopic && selectedSection) {
    return (
      <div className="space-y-4">
        <Card className="border border-zinc-800 bg-zinc-900/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>العودة</span>
            </Button>
            <div className="text-right">
              <h2 className="text-lg font-bold text-foreground">{selectedTopic.topic_ar}</h2>
              <p className="text-[10px] text-muted-foreground uppercase">{selectedTopic.topic}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-zinc-400/10 border-none text-zinc-400 font-bold px-3">
            {selectedTopic.vocab.length} كلمة
          </Badge>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedTopic.vocab.map((item, vIdx) => {
            const alreadyInApp = isAlreadyAdded(item.de);
            const isJustAdded = addedIds.has(item.de);

            return (
              <Card 
                key={`${item.de}-${vIdx}`}
                className="group border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all p-5 flex flex-col h-full rounded-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-full bg-zinc-800/50 text-zinc-500 hover:text-accent transition-colors cursor-pointer" onClick={(e) => handlePlaySound(e, item.de)}>
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div className="bg-primary/10 text-primary rounded-full px-2 py-1 flex items-center justify-center text-[10px] font-bold">
                    {vIdx + 1}
                  </div>
                </div>

                <div className="flex-1 text-center space-y-2 mb-6">
                  <h3 className="font-bold text-3xl leading-tight text-foreground" dir="ltr">
                    {renderGermanWord(item.de)}
                  </h3>
                  <p className="text-md text-muted-foreground font-arabic opacity-70">
                    {item.ar.join('، ')}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={alreadyInApp || isJustAdded ? "secondary" : "outline"}
                  className={`w-full gap-2 rounded-lg h-9 text-xs font-bold transition-all ${
                    alreadyInApp || isJustAdded 
                      ? "bg-success text-success-foreground border-none" 
                      : "hover:bg-accent hover:text-black hover:border-accent border-zinc-700 bg-zinc-900"
                  }`}
                  onClick={() => handleAdd(item)}
                  disabled={alreadyInApp || isJustAdded}
                >
                  {alreadyInApp || isJustAdded ? (
                    <><Check className="h-3.5 w-3.5" /> تم الحفظ</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> إضافة</>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Topics View (Sub-sections)
  if (view === 'topics' && selectedSection) {
    return (
      <div className="space-y-4">
        <Card className="border border-zinc-800 bg-zinc-900/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>العودة للأقسام</span>
            </Button>
            <h2 className="text-lg font-bold text-foreground">{selectedSection.section_ar}</h2>
          </div>
          <Badge variant="outline" className="text-[10px] opacity-70 border-zinc-700">{selectedSection.section}</Badge>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedSection.topics.map((topic, tIdx) => (
            <Card
              key={topic.topic}
              onClick={() => handleTopicSelect(topic)}
              className="group cursor-pointer border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all p-5 flex flex-col h-full rounded-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-full bg-zinc-800/50 text-zinc-600 group-hover:text-accent transition-colors">
                  <Layers className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-300 border-none text-[10px] font-bold">
                  {topic.vocab.length} كلمة
                </Badge>
              </div>

              <div className="flex-1 text-right mb-6">
                <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors">
                  {topic.topic_ar}
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{topic.topic}</p>
              </div>

              <Button className="w-full bg-zinc-900 border border-zinc-800 hover:border-accent/50 hover:bg-accent hover:text-black h-10 gap-2 text-xs transition-all">
                <span>ابدأ التعلم</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 3. Main Sections View
  return (
    <div className="space-y-6">
      <Card className="p-4 border border-zinc-800 bg-zinc-900/60">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المكتبة الشاملة..."
            className="pr-12 h-12 text-sm rounded-lg border-zinc-800 bg-zinc-950/40 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary focus-visible:ring-offset-0 transition-all shadow-none"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredSections.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-secondary/20 rounded-2xl border-2 border-dashed border-white/5">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-sm font-bold text-muted-foreground">لم يتم العثور على أي نتائج</p>
          </div>
        ) : (
          filteredSections.map((section, sIdx) => (
            <Card
              key={section.section}
              onClick={() => handleSectionSelect(section)}
              className="group cursor-pointer border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all p-4 flex flex-col rounded-2xl"
            >
              {/* Top Row: Title at Top, Icon on Left */}
              <div className="flex justify-between items-start w-full mb-4">
                <div className="p-2 rounded-full bg-zinc-800/50 text-zinc-500 group-hover:text-accent transition-colors order-last">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                {/* Description Content */}
                <div className="flex-1 text-right space-y-1 mb-8">
                  <h3 className="font-bold text-lg text-foreground transition-colors tracking-tight text-right flex-1 pr-2">
                    {section.section_ar}
                  </h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium opacity-60">
                    {section.section}
                  </p>
                </div>
              </div>

              {/* Footer Section: Strict Bottom Alignment */}
              <div className="mt-auto flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                <Button className="flex-1 bg-zinc-900 border border-zinc-800 h-10 gap-2 text-xs font-bold transition-all hover:bg-accent hover:text-black hover:border-accent">
                  <span>استكشاف</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <div className="bg-zinc-800/50 px-3 py-1.5 rounded-lg text-[10px] text-zinc-500 font-bold border border-zinc-800/50 whitespace-nowrap">
                  {section.total_vocab} كلمة
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
