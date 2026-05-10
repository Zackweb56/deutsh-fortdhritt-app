import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, Plus, BookOpen, Check, ChevronLeft, Volume2 } from 'lucide-react';
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
  
  // View State
  const [view, setView] = useState<'sections' | 'topic'>('sections');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

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

  const handleTopicClick = (section: Section, topic: Topic) => {
    setSelectedSection(section);
    setSelectedTopic(topic);
    setView('topic');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setView('sections');
    setSelectedTopic(null);
    setSelectedSection(null);
  };

  const renderGermanWord = (text: string) => {
    const parts = text.split(' ');
    if (parts.length > 1) {
      const article = parts[0].toLowerCase();
      const rest = parts.slice(1).join(' ');
      
      if (article === 'der') return <><span className="text-blue-400">der</span> {rest}</>;
      if (article === 'die') return <><span className="text-primary font-black">die</span> {rest}</>;
      if (article === 'das') return <><span className="text-accent">das</span> {rest}</>;
    }
    return text;
  };

  if (view === 'topic' && selectedTopic && selectedSection) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBack}
            className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs font-medium">العودة</span>
          </Button>
          <div className="text-right">
            <h2 className="text-lg font-bold text-foreground">
              {selectedTopic.topic}
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {selectedTopic.topic_ar} • {selectedSection.section}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {selectedTopic.vocab.map((item, vIdx) => {
            const alreadyInApp = isAlreadyAdded(item.de);
            const isJustAdded = addedIds.has(item.de);

            return (
              <Card 
                key={`${item.de}-${vIdx}`}
                className="group relative overflow-hidden border-none bg-secondary/50 backdrop-blur-sm hover:bg-secondary/80 transition-all duration-300 rounded-xl focus-within:ring-0"
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className="absolute top-2 left-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-white/10 text-muted-foreground transition-all"
                      onClick={(e) => handlePlaySound(e, item.de)}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="w-full mt-2">
                    <div className="text-base font-bold text-foreground transition-colors leading-tight mb-1" dir="ltr">
                      {renderGermanWord(item.de)}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium font-arabic">
                      {item.ar.join('، ')}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={alreadyInApp || isJustAdded ? "secondary" : "outline"}
                    className={`w-full gap-1.5 rounded-lg h-8 text-[10px] font-bold transition-all duration-500 focus-visible:ring-0 ${
                      alreadyInApp || isJustAdded 
                        ? "bg-success text-success-foreground border-none" 
                        : "hover:bg-accent hover:text-accent-foreground border-white/10"
                    }`}
                    onClick={() => handleAdd(item)}
                    disabled={alreadyInApp || isJustAdded}
                  >
                    {alreadyInApp || isJustAdded ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>تمت</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        <span>إضافة</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن قسم أو كلمة..."
          className="pr-10 h-10 text-sm rounded-xl border-none bg-secondary/50 focus-visible:ring-primary/20 transition-all shadow-inner"
        />
      </div>

      <div className="space-y-2">
        {filteredSections.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border-2 border-dashed border-white/5">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-10" />
            <p className="text-sm font-bold">لم يتم العثور على نتائج</p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-2">
            {filteredSections.slice(0, 20).map((section) => (
              <AccordionItem 
                key={section.section} 
                value={section.section}
                className="border-none rounded-xl bg-secondary/30 overflow-hidden transition-all px-4 hover:bg-secondary/40"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-base font-bold text-foreground tracking-tight uppercase">
                      {section.section}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium font-arabic opacity-70">
                      {section.section_ar} • {section.total_vocab} كلمة
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {section.topics.map((topic) => (
                      <button
                        key={topic.topic}
                        onClick={() => handleTopicClick(section, topic)}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/40 hover:bg-primary/10 transition-all text-right group shadow-sm"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {topic.topic}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60 font-medium font-arabic mt-0.5">
                            {topic.topic_ar}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                            {topic.vocab.length}
                          </span>
                          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
            {filteredSections.length > 20 && (
              <p className="text-center text-[10px] text-muted-foreground py-4 italic">
                استخدم البحث لمشاهدة المزيد من الأقسام...
              </p>
            )}
          </Accordion>
        )}
      </div>
    </div>
  );
};
