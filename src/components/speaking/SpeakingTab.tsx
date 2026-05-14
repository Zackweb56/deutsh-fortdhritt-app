import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  MoreVertical,
  User,
  ChevronRight,
  X,
  History,
  Info,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
  Globe
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import speakingData from '@/data/speaking/senarios.json';
import SpeakingConversation from './SpeakingConversation';

const SpeakingTab = () => {
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeScenario, setActiveScenario] = useState(null);
  const [pendingScenario, setPendingScenario] = useState(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);

  // Filter levels and scenarios
  const currentLevelData = speakingData.levels.find(l => l.level === selectedLevel);
  const filteredScenarios = currentLevelData?.scenarios.filter(s =>
    s.topic.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelectScenario = (scenario) => {
    if (isChatActive && activeScenario?.id !== scenario.id) {
      setPendingScenario(scenario);
      setShowSwitchModal(true);
    } else {
      setActiveScenario(scenario);
      setIsChatActive(false);
      if (window.innerWidth < 768) {
        setIsMobileMenuOpen(false);
      }
    }
  };

  const confirmSwitch = () => {
    setActiveScenario(pendingScenario);
    setIsChatActive(false);
    setShowSwitchModal(false);
    setPendingScenario(null);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex h-[82vh] bg-background border border-border rounded-2xl overflow-hidden shadow-2xl relative text-xs">

      {/* Sidebar - Scenario List */}
      <div className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-[320px] border-r border-border bg-card/30 z-20 transition-all duration-300
      `}>
        {/* Sidebar Header */}
        <div className="p-3 bg-card border-b border-l border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" dir="rtl">المواقف التعليمية</h2>
            {/* <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="rounded-full h-7 w-7">
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div> */}
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن موقف..."
              className="pl-9 bg-muted/50 border-none rounded-xl h-8 text-[11px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['A1', 'A2', 'B1', 'B2'].map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`
                flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-bold
                ${selectedLevel === level
                    ? 'bg-yellow-500/15 text-yellow-600'
                    : 'bg-muted/40 text-foreground/70 hover:bg-muted/60'
                  }
                `}
              >
                <span>{level}</span>
                <span className={`
                text-[9px] font-medium px-1 -ml-1.5 rounded-full min-w-[18px] text-center
                  ${selectedLevel === level
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-black/15 text-foreground/50'
                  }
                `}>
                  {currentLevelData?.scenarios.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Level Description */}
        {/* {currentLevelData && ( */}
        {/* <div className="px-4 py-2 bg-muted/20 border-b border-border/50 text-center space-y-1">
             <p className="text-[10px] font-bold text-primary" dir="ltr">{currentLevelData.description.de}</p>
             <p className="text-[10px] text-muted-foreground" dir="rtl">{currentLevelData.description.ar}</p>
          </div> */}
        {/* )} */}

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredScenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => handleSelectScenario(scenario)}
              className={`
                flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-border/30
                ${activeScenario?.id === scenario.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30'}
              `}
            >
              <div className="h-10 w-10 rounded-full bg-neutral-300/10 flex items-center justify-center text-lg shrink-0 border border-border/50">
                {scenario.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-[12px] font-medium text-foreground truncate text-left" dir="ltr">
                    {scenario.topic}
                  </h4>
                  <Badge className="text-[8px] h-3 px-1 bg-accent text-accent-foreground">
                    {scenario.difficulty}
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-[9px] truncate text-primary text-right" dir="rtl">{scenario.ai_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate text-right italic" dir="rtl">
                    {scenario.description.ar}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredScenarios.length === 0 && (
            <div className="p-8 text-center opacity-50">
              <p className="text-xs">لا توجد نتائج</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`
  flex-1 flex flex-col bg-neutral-950/20
  ${!isMobileMenuOpen ? 'flex' : 'hidden md:flex'}
`}>
        {activeScenario ? (
          <>
            {!isChatActive ? (
              /* Ready Screen */
              <div className="flex-1 flex flex-col h-full overflow-y-auto">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 right-0 p-3 flex justify-end bg-neutral-950/20 backdrop-blur-sm z-10">
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content Container */}
                <div className="flex-1 flex flex-col items-center justify-center px-2 py-4">
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-full bg-neutral-300/10 flex items-center justify-center text-3xl mb-4">
                    {activeScenario.icon}
                  </div>

                  {/* Title Section */}
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-bold text-primary mb-0.5" dir="ltr">{activeScenario.ai_name}</h2>
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5" dir="ltr">{activeScenario.topic}</p>
                    <Badge className="text-[9px] bg-accent text-accent-foreground px-2 py-0 h-4">
                      مستوى {activeScenario.difficulty}
                    </Badge>
                  </div>

                  {/* Description Section */}
                  <div className="w-full max-w-sm mb-6">
                    <div className="space-y-1.5 mb-4">
                      <p className="text-[11px] font-medium leading-relaxed text-center" dir="ltr">
                        {activeScenario.description.de}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed text-center" dir="rtl">
                        {activeScenario.description.ar}
                      </p>
                    </div>

                    {/* User Role Badge */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/5">
                        <User className="h-3 w-3 text-yellow-600" />
                        <span className="text-[10px] text-yellow-600">دورك:</span>
                        <span className="text-xs font-bold text-primary" dir="ltr">{activeScenario.user_role}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    size="sm"
                    onClick={() => setIsChatActive(true)}
                    className="rounded-full px-6 h-9 text-xs font-medium bg-primary hover:bg-primary/90 gap-1.5"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    بدء المحادثة
                  </Button>
                </div>
              </div>
            ) : (
              /* Active Conversation */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <SpeakingConversation
                  scenario={activeScenario}
                  onBack={() => setIsMobileMenuOpen(true)}
                  onEnd={() => setIsChatActive(false)}
                />
              </div>
            )}
          </>
        ) : (
          /* Empty State / Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-3 border border-yellow-500/20">
              <Globe className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-base font-bold mb-1.5 text-center">تدريب المحادثة التفاعلي</h2>
            <p className="text-[11px] text-muted-foreground max-w-[260px] text-center" dir="rtl">
              اختر شخصية أو موقفاً من القائمة الجانبية لبدء التدريب على التحدث باللغة الألمانية
            </p>

            {/* Feature Hints - Simplified */}
            <div className="mt-6 flex gap-4 opacity-40">
              <div className="flex flex-col items-center gap-1">
                <div className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center">
                  <PlayCircle className="h-3 w-3" />
                </div>
                <span className="text-[8px] font-medium">ابدأ</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center">
                  <Info className="h-3 w-3" />
                </div>
                <span className="text-[8px] font-medium">تعلم</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-[8px] font-medium">أتقن</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showSwitchModal} onOpenChange={setShowSwitchModal}>
        <DialogContent className="sm:max-w-[380px] border-yellow-500/30 text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600 justify-end" dir="rtl">
              <AlertTriangle className="h-4 w-4" />
              تغيير الموقف
            </DialogTitle>
            <DialogDescription className="text-right pt-2" dir="rtl">
              هل أنت متأكد أنك تريد مغادرة المحادثة الحالية؟ سيتم فقدان تقدمك في هذا السيناريو.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button variant="ghost" size="sm" onClick={() => setShowSwitchModal(false)} className="text-xs h-8">إلغاء</Button>
            <Button variant="destructive" size="sm" onClick={confirmSwitch} className="text-xs h-8 bg-primary">تغيير الآن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SpeakingTab;
