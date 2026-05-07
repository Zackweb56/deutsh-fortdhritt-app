import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Book, Headphones, PenTool, Mic, ArrowRight, BookOpen, Clock, LayoutGrid, Target, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import b1GoetheLesen from '@/data/preparation/goethe/b1/lesen.json';
import b1GoetheHoren from '@/data/preparation/goethe/b1/horen.json';
import b1GoetheSchreiben from '@/data/preparation/goethe/b1/schreiben.json';
import b1GoetheSprechen from '@/data/preparation/goethe/b1/sprechen.json';
import b2GoetheLesen from '@/data/preparation/goethe/b2/lesen.json';
import b2GoetheHoren from '@/data/preparation/goethe/b2/horen.json';
import b2GoetheSchreiben from '@/data/preparation/goethe/b2/schreiben.json';
import b2GoetheSprechen from '@/data/preparation/goethe/b2/sprechen.json';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';

type Level = 'B1' | 'B2';
type Module = 'lesen' | 'horen' | 'schreiben' | 'sprechen';
type Institute = 'goethe' | 'telc';

const MODULE_DISPLAY_MAP: Record<Module, string> = {
  lesen: 'Lesen',
  horen: 'Hören',
  schreiben: 'Schreiben',
  sprechen: 'Sprechen'
};

const AVAILABLE_MODULES: Record<string, Record<string, Module[]>> = {
  goethe: {
    b1: ['lesen', 'horen', 'schreiben', 'sprechen'],
    b2: ['lesen', 'horen', 'schreiben', 'sprechen'],
  },
  telc: {
    b1: [],
    b2: [],
  },
};

const aufgabentypLabels: Record<string, string> = {
  'richtig-falsch': 'Richtig/Falsch',
  'mehrfachauswahl-3-gliedrig': 'Mehrfachauswahl (3-gliedrig)',
  'zuordnung': 'Zuordnung (Anzeige/Situation)',
  'ja-nein': 'Ja/Nein',
  'lueckentext': 'Lückentext',
};

const getAufgabentypLabel = (type?: string) => {
  if (!type) return 'Aufgabentyp';
  return aufgabentypLabels[type] || type;
};

const getTeilRoleLabel = (module?: Module | null, teilNummer?: number) => {
  const map: Record<string, Record<number, string>> = {
    lesen: {
      1: 'Globalverstehen (Richtig/Falsch)',
      2: 'Detailverstehen (Presse/Artikel)',
      3: 'Selektives Lesen (Zuordnung)',
      4: 'Meinungen verstehen (Ja/Nein)',
      5: 'Regeln/Anweisungen verstehen',
    },
    horen: {
      1: 'Kurze Hörtexte verstehen',
      2: 'Gespräch im Detail verstehen',
      3: 'Aussagen Richtig/Falsch',
      4: 'Diskussion/Positionen erkennen',
    },
    schreiben: {
      1: 'Persönliche E-Mail schreiben',
      2: 'Meinung im Forum begründen',
      3: 'Formelle Nachricht schreiben',
    },
    sprechen: {
      1: 'Gemeinsam planen',
      2: 'Thema präsentieren',
      3: 'Feedback geben und nachfragen',
    },
  };
  if (!module || !teilNummer) return 'Teil-Rolle';
  return map[module]?.[teilNummer] || 'Teil-Rolle';
};

export const PreparationTab = () => {
  const navigate = useNavigate();
  const { preparationState, setPreparationState: setGlobalPrepState } = useApp();
  
  const [step, setStep] = useState<'level' | 'institute' | 'module' | 'teil' | 'topic' | 'preview'>(preparationState.step);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(preparationState.level as Level | null);
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(preparationState.institute as Institute | null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(preparationState.module as Module | null);
  const [selectedTeilId, setSelectedTeilId] = useState<string | null>(preparationState.teilId as string | null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(preparationState.topicId as string | null);
  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const limited = isLimitedAccess();

  // Derived selectedTeil and selectedTopic based on selected IDs
  const selectedTeil = moduleData?.teile?.find((t: any) => t.id === selectedTeilId) || null;
  const selectedTopic = selectedTeil?.themen?.find((t: any) => t.id === selectedTopicId) || null;

  // Sync global state when local state changes
  useEffect(() => {
    setGlobalPrepState({
      step,
      level: selectedLevel,
      institute: selectedInstitute,
      module: selectedModule,
      teilId: selectedTeilId,
      topicId: selectedTopicId,
    });
  }, [step, selectedLevel, selectedInstitute, selectedModule, selectedTeilId, selectedTopicId]);

  const isModuleAvailable = (candidate: Module) => {
    if (!selectedInstitute || !selectedLevel) return false;
    const levelKey = selectedLevel.toLowerCase();
    const instituteMap = AVAILABLE_MODULES[selectedInstitute];
    return instituteMap?.[levelKey]?.includes(candidate) || false;
  };

  const getMetaPoints = (data: any) => {
    const meta = data?.meta || {};
    return meta.totalPunkte ?? meta.maxPunkte ?? meta.totalMesspunkte ?? '-';
  };

  const MODULE_DATA_MAP: Record<string, Record<string, Record<string, any>>> = {
    goethe: {
      b1: {
        lesen: b1GoetheLesen,
        horen: b1GoetheHoren,
        schreiben: b1GoetheSchreiben,
        sprechen: b1GoetheSprechen,
      },
      b2: {
        lesen: b2GoetheLesen,
        horen: b2GoetheHoren,
        schreiben: b2GoetheSchreiben,
        sprechen: b2GoetheSprechen,
      },
    },
    telc: {
      b1: {},
      b2: {},
    },
  };

  useEffect(() => {
    if (!selectedLevel || !selectedInstitute || !selectedModule) {
      setModuleData(null);
      setLoading(false);
      return;
    }

    if (!isModuleAvailable(selectedModule)) {
      setModuleData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const moduleData = MODULE_DATA_MAP[selectedInstitute]?.[selectedLevel.toLowerCase()]?.[selectedModule] || null;
    setModuleData(moduleData);
    setLoading(false);
  }, [selectedLevel, selectedInstitute, selectedModule]);

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setSelectedInstitute(null);
    setSelectedModule(null);
    setSelectedTeilId(null);
    setSelectedTopicId(null);
    setStep('institute');
  };

  const handleInstituteSelect = (institute: Institute) => {
    setSelectedInstitute(institute);
    setSelectedModule(null);
    setSelectedTeilId(null);
    setSelectedTopicId(null);
    setStep('module');
  };

  const handleModuleSelect = (module: Module) => {
    if (!isModuleAvailable(module)) return;
    setSelectedModule(module);
    setSelectedTeilId(null);
    setSelectedTopicId(null);
    setStep('teil');
  };

  const handleTeilSelect = (part: any) => {
    setSelectedTeilId(part.id);
    setSelectedTopicId(null);
    setStep('topic');
  };

  const handleTopicSelect = (topic: any) => {
    setSelectedTopicId(topic.id);
    setStep('preview');
  };

  const resetToLevel = () => {
    setSelectedLevel(null);
    setSelectedInstitute(null);
    setSelectedModule(null);
    setSelectedTeilId(null);
    setSelectedTopicId(null);
    setStep('level');
  };

  const resetToInstitute = () => {
    setSelectedInstitute(null);
    setSelectedModule(null);
    setSelectedTeilId(null);
    setSelectedTopicId(null);
    setStep('institute');
  };

  const resetToModule = () => {
    setSelectedModule(null);
    setSelectedTeilId(null);
    setSelectedTopicId(null);
    setStep('module');
  };

  const resetToTeil = () => {
    setSelectedTeilId(null);
    setSelectedTopicId(null);
    setStep('teil');
  };

  const resetToTopic = () => {
    setSelectedTopicId(null);
    setStep('topic');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 py-4 sm:py-6 animate-in fade-in duration-500" dir="ltr">
      {/* Compact Breadcrumbs */}
      <div className="flex justify-start flex-wrap items-center gap-1 mb-6 sm:mb-10 text-[8px] sm:text-[9px] text-white/30 font-black uppercase tracking-widest italic text-left" dir="ltr">
        <span className="hover:text-white cursor-pointer transition-colors" onClick={resetToLevel}>Start</span>
        {selectedLevel && (
          <>
            <ChevronRight className="h-3 w-3 opacity-20 shrink-0" />
            <span className="hover:text-white cursor-pointer transition-colors" onClick={resetToInstitute}>{selectedLevel}</span>
          </>
        )}
        {selectedInstitute && (
          <>
            <ChevronRight className="h-3 w-3 opacity-20 shrink-0" />
            <span className="hover:text-white cursor-pointer transition-colors uppercase" onClick={resetToModule}>{selectedInstitute}</span>
          </>
        )}
        {selectedModule && (
          <>
            <ChevronRight className="h-3 w-3 opacity-20 shrink-0" />
            <span className="hover:text-white cursor-pointer transition-colors capitalize" onClick={resetToTeil}>
              {selectedModule ? MODULE_DISPLAY_MAP[selectedModule] : ''}
            </span>
          </>
        )}
        {selectedTeil && (
          <>
            <ChevronRight className="h-3 w-3 opacity-20 shrink-0" />
            <span className="text-white">{selectedTeil.label}</span>
          </>
        )}
      </div>

      {step === 'level' && (
        <div className="space-y-6 sm:space-y-10">
          <div className="space-y-2 sm:space-y-3 text-center">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
              Wähle <span className="text-[#ffcc00]">Niveau</span>
            </h2>
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
              Goethe/TELC Vorbereitung
            </p>
          </div>
          <LockOverlay
            isLocked={limited}
            message="التحضير للامتحان متاح فقط للمستخدمين المدفوعين — تواصل عبر واتساب لفتح الوصول الكامل"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl sm:max-w-3xl mx-auto">
              <LevelCard 
                level="B1" 
                description="Intensive Vorbereitung" 
                onClick={() => handleLevelSelect('B1')} 
                color="bg-red-600"
              />
              <LevelCard 
                level="B2" 
                description="Fortgeschrittenes Training" 
                onClick={() => handleLevelSelect('B2')} 
                color="bg-[#ffcc00]"
                textColor="text-black"
              />
            </div>
          </LockOverlay>
        </div>
      )}

      {step === 'institute' && selectedLevel && (
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-2 sm:space-y-3 text-center">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
              Wählen Sie ein Institut
            </h2>
            <p className="text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] italic">
              Die Modulstruktur folgt dem echten Prüfungsformat
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl sm:max-w-3xl mx-auto">
            <InstituteCard title="Goethe-Institut" subtitle="Verfügbar" onClick={() => handleInstituteSelect('goethe')} />
            <InstituteCard title="TELC" subtitle="Demnächst" onClick={() => {}} disabled />
          </div>
        </div>
      )}

      {step === 'module' && selectedLevel && selectedInstitute && (
        <div className="space-y-6 sm:space-y-10">
          <div className="space-y-2 sm:space-y-3 text-center">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
              Module • <span className="text-red-600">{selectedLevel}</span>
            </h2>
            <p className="text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] italic">
              Institut: {selectedInstitute.toUpperCase()}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <ModuleCard 
              title="Lesen" 
              subtitle="Leseverstehen" 
              icon={<Book className="w-5 h-5 text-red-600" />}
              borderColor="red-600"
              disabled={!isModuleAvailable('lesen')}
              onClick={() => handleModuleSelect('lesen')}
            />
            <ModuleCard 
              title="Hören" 
              subtitle="Hörverstehen" 
              icon={<Headphones className="w-5 h-5 text-white" />}
              borderColor="white"
              disabled={!isModuleAvailable('horen')}
              onClick={() => handleModuleSelect('horen')}
            />
            <ModuleCard 
              title="Schreiben" 
              subtitle="Schriftlich" 
              icon={<PenTool className="w-5 h-5 text-[#ffcc00]" />}
              borderColor="#ffcc00"
              disabled={!isModuleAvailable('schreiben')}
              onClick={() => handleModuleSelect('schreiben')}
            />
            <ModuleCard 
              title="Sprechen" 
              subtitle="Mündlich" 
              icon={<Mic className="w-5 h-5 text-blue-500" />}
              borderColor="blue-500"
              disabled={!isModuleAvailable('sprechen')}
              onClick={() => handleModuleSelect('sprechen')}
            />
          </div>
        </div>
      )}

      {step === 'teil' && selectedLevel && selectedModule && selectedInstitute && (
        <div className="space-y-6 sm:space-y-10">
          <div className="space-y-3 sm:space-y-4 text-center">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
               Teile <span className="text-[#ffcc00]">{selectedModule ? MODULE_DISPLAY_MAP[selectedModule] : ''}</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-white/30">
               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {moduleData?.meta.totalZeit}</span>
               <span className="flex items-center gap-1.5"><Target className="w-3 h-3" /> {getMetaPoints(moduleData)} Punkte</span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#ffcc00]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {moduleData?.teile.map((part: any) => (
                <TeilCard 
                  key={part.id}
                  label={part.label}
                  title={part.title}
                  titleAr={part.titleAr}
                  subtitle={part.subtitle}
                  description={part.description}
                  aufgabentyp={part.aufgabentyp}
                  itemCount={part.itemCount}
                  arbeitszeit={part.arbeitszeit}
                  teilRole={getTeilRoleLabel(selectedModule, part.nummer)}
                  showAufgaben={['lesen', 'horen'].includes(selectedModule)}
                  themenCount={part.themen?.length}
                  onClick={() => handleTeilSelect(part)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'topic' && selectedLevel && selectedModule && selectedTeil && selectedInstitute && (
        <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2 sm:space-y-3 text-center">
             <div className="inline-block px-2 sm:px-3 py-1 bg-red-600 rounded-full text-[7px] sm:text-[8px] font-black text-white uppercase italic mb-2 sm:mb-3 tracking-widest">
               {selectedTeil.label}
             </div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
               Wähle ein <span className="text-[#ffcc00]">Thema</span>
            </h2>
            <p className="text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] italic max-w-md mx-auto leading-relaxed">
              {selectedTeil.description}
            </p>
          </div>

          <Card className="bg-[#111] border-white/5 rounded-2xl p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left text-[8px] sm:text-[9px]">
              <div>
                <p className="text-[7px] text-white/30 font-black uppercase tracking-widest">Prüfungsformat</p>
                <p className="text-[9px] text-white font-black mt-1">{getAufgabentypLabel(selectedTeil.aufgabentyp)}</p>
              </div>
              {['lesen', 'horen'].includes(selectedModule) && (
                <div>
                  <p className="text-[7px] text-white/30 font-black uppercase tracking-widest">Aufgaben</p>
                  <p className="text-[9px] text-white font-black mt-1">{selectedTeil.aufgabenNummern} ({selectedTeil.itemCount})</p>
                </div>
              )}
              <div>
                <p className="text-[7px] text-white/30 font-black uppercase tracking-widest">Zeit</p>
                <p className="text-[9px] text-white font-black mt-1">{selectedTeil.arbeitszeit}</p>
              </div>
              <div>
                <p className="text-[7px] text-white/30 font-black uppercase tracking-widest">Themenpool</p>
                <p className="text-[9px] text-white font-black mt-1">{selectedTeil.themen?.length || 0} Themen</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="text-[7px] text-white/30 font-black uppercase tracking-widest">Teil-Rolle</p>
                <p className="text-[9px] text-red-500 font-black mt-1">{getTeilRoleLabel(selectedModule, selectedTeil.nummer)}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {selectedTeil.themen?.map((topic: any) => (
              <TopicCard 
                key={topic.id}
                title={topic.title || (topic.thema1?.title ? `${topic.thema1.title} / ${topic.thema2.title}` : 'Themenauswahl')}
                titleAr={topic.titleAr || (topic.thema1?.titleAr ? `${topic.thema1.titleAr} / ${topic.thema2.titleAr}` : '')}
                subtitle={topic.kandidat ? `Kandidat ${topic.kandidat}` : getTopicSubtitle(selectedTeil, topic)}
                onClick={() => handleTopicSelect(topic)}
              />
            ))}
          </div>
          
          <div className="flex justify-center pt-4 sm:pt-6">
            <Button variant="ghost" className="text-white/20 hover:text-white hover:bg-primary hover:text-white uppercase font-black tracking-widest text-[7px] sm:text-[8px] transition-all" onClick={resetToTeil}>
               <ChevronLeft className="ml-1.5 h-3 w-3" /> Zurück zu den Teilen
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && selectedLevel && selectedInstitute && selectedModule && selectedTeil && selectedTopic && (
        <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2 sm:space-y-3 text-center">
             <div className="inline-block px-3 py-1 bg-[#ffcc00] rounded-full text-[8px] font-black text-black uppercase italic mb-2 tracking-widest">
               Thema Vorschau
             </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
               Bereit für <span className="text-[#ffcc00]">{selectedTopic.title}</span>
            </h2>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] italic max-w-md mx-auto leading-relaxed">
              Hier sehen Sie das Thema des gewählten Teils. Diese Vorschau hilft Ihnen, das richtige Modellhema zu verstehen, bevor Sie mit der eigentlichen Simulation starten.
            </p>
          </div>

          <Card className="bg-[#111] border-white/5 rounded-2xl p-4 sm:p-6 text-left">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[7px] text-white/30 font-black uppercase tracking-widest">Thema</p>
                <p className="text-xs sm:text-sm font-black text-white mt-1 sm:mt-2">{selectedTopic.title}</p>
              </div>
              {selectedTopic.titleAr && (
                <div>
                  <p className="text-[7px] text-white/30 font-black uppercase tracking-widest">Thema (Arabic)</p>
                  <p className="text-xs sm:text-sm font-black text-[#ffcc00] mt-1 sm:mt-2 text-right" dir="rtl">{selectedTopic.titleAr}</p>
                </div>
              )}
              <div>
                <p className="text-[7px] text-white/30 font-black uppercase tracking-widest">Teil</p>
                <p className="text-xs sm:text-sm font-black text-white mt-1 sm:mt-2">{selectedTeil.label} • {getTeilRoleLabel(selectedModule, selectedTeil.nummer)}</p>
              </div>
              <div>
                <p className="text-[7px] text-white/30 font-black uppercase tracking-widest">Themeninfo</p>
                <p className="text-xs sm:text-sm text-white/70 mt-1 sm:mt-2">{getTopicSubtitle(selectedTeil, selectedTopic) || 'Prüfungsthema'}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 text-xs sm:text-sm leading-6 sm:leading-7 text-white/80">
              {selectedTopic.transkript ? (
                <div className="space-y-3">
                  <p className="font-black uppercase tracking-[0.2em] text-white/50">Auszug</p>
                  <p>{selectedTopic.transkript}</p>
                </div>
              ) : selectedTopic.audioTexts ? (
                <div className="space-y-3">
                  <p className="font-black uppercase tracking-[0.2em] text-white/50">Audio-Thema</p>
                  <p>{selectedTopic.audioTexts.length} Audiotext(e) inklusive.</p>
                </div>
              ) : (
                <p className="text-white/70">Dieses Thema ist bereit zum Starten der Simulation.</p>
              )}
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button className="text-white border-white/10 hover:border-primary bg-primary text-white" onClick={resetToTopic}>
              Zurück zu den Themen
            </Button>
            <Button
              className="bg-[#ffcc00] hover:bg-[#ffcc00] text-black font-black uppercase tracking-[0.2em]"
              onClick={() => navigate(`/preparation/${selectedInstitute}/${selectedLevel}/${selectedModule}/${selectedTeil.id}/${selectedTopic.id}`)}
            >
              Simulation starten
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const LevelCard = ({ level, description, onClick, color, textColor = "text-white" }: any) => (
  <Card 
    className="group relative overflow-hidden p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 cursor-pointer bg-[#111] border-white/5 hover:border-white/10 transition-all rounded-[20px]"
    onClick={onClick}
  >
    <div className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center text-lg sm:text-xl font-black italic transition-all group-hover:scale-105 group-hover:rotate-3", color, textColor)}>
      {level}
    </div>
    <div className="space-y-1 text-center">
      <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tighter italic">Niveau {level}</h3>
      <p className="text-white/20 text-[8px] sm:text-[9px] font-black leading-relaxed max-w-[160px] mx-auto uppercase tracking-wider">{description}</p>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </Card>
);

const InstituteCard = ({ title, subtitle, onClick, disabled = false }: any) => (
  <Card
    className={cn(
      "p-4 sm:p-5 rounded-2xl border transition-all text-left",
      disabled
        ? "bg-[#111] border-white/5 opacity-60 cursor-not-allowed"
        : "bg-[#111] border-white/5 hover:border-[#ffcc00]/40 cursor-pointer shadow-xl"
    )}
    onClick={!disabled ? onClick : undefined}
  >
    <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">{title}</h3>
    <p className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1 sm:mt-2", disabled ? "text-white/20" : "text-[#ffcc00]")}>{subtitle}</p>
  </Card>
);

const ModuleCard = ({ title, subtitle, icon, borderColor, onClick, disabled = false }: any) => {
  const getBorderStyle = () => {
    if (borderColor === 'white') return 'group-hover:border-white';
    if (borderColor === '#ffcc00') return 'group-hover:border-[#ffcc00]';
    if (borderColor === 'blue-500') return 'group-hover:border-blue-500';
    return 'group-hover:border-red-600';
  };

  return (
    <Card 
      className={cn(
        "flex flex-col items-center gap-3 p-5 bg-[#111] border border-white/5 transition-all duration-300 rounded-2xl group relative overflow-hidden text-center",
        !disabled ? "cursor-pointer hover:bg-white/[0.03]" : "opacity-50 grayscale cursor-not-allowed"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight italic">{title}</h3>
        <p className="text-white/20 text-[8px] font-black uppercase tracking-widest group-hover:text-white/40 transition-colors duration-300">{!disabled ? subtitle : 'Demnächst'}</p>
      </div>
      {/* Right border - only this changes color per module */}
      <div className={`absolute top-0 right-0 w-[2px] h-0 group-hover:h-full transition-all duration-300 ease-out ${getBorderStyle()}`} />
    </Card>
  );
};

const TeilCard = ({ label, title, titleAr, subtitle, description, aufgabentyp, itemCount, arbeitszeit, themenCount, teilRole, showAufgaben, onClick }: any) => (
  <Card className="p-4 sm:p-5 flex flex-col h-full bg-[#111] border-white/5 hover:border-white/15 rounded-2xl group cursor-pointer transition-all duration-300 hover:bg-white/[0.02] relative overflow-hidden">
    {/* Header */}
    <div className="flex justify-between items-start mb-3">
      <div className="bg-white/5 px-2.5 py-1 rounded-full text-[7px] font-black text-white/50 uppercase italic group-hover:bg-white/10 transition-colors">
        {label}
      </div>
      <BookOpen className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
    </div>
    
    {/* Content - grows to push button down */}
    <div className="flex-1 space-y-2">
      <div>
        {/* German Title - LTR */}
        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tighter italic leading-tight text-left">
          {title}
        </h3>
        {/* Arabic Title - RTL */}
        {titleAr && (
          <p className="text-[10px] sm:text-xs font-black text-[#ffcc00] uppercase tracking-tight mt-0.5 text-right" dir="rtl">
            {titleAr}
          </p>
        )}
      </div>
      
      {/* Subtitle - LTR */}
      <p className="text-[#ffcc00] text-[7px] font-black uppercase tracking-widest text-left">
        {subtitle}
      </p>
      
      <div className="h-px bg-white/5 my-2" />
      
      {/* Description - LTR */}
      <p className="text-white/30 text-[8px] sm:text-[9px] font-medium leading-relaxed line-clamp-2 text-left">
        {description}
      </p>
      
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
        {/* Teil Role - LTR */}
        <span className="text-[6px] sm:text-[7px] font-black text-yellow-500/70 uppercase tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded-full text-left">
          {teilRole}
        </span>
        <span className="text-[6px] sm:text-[7px] font-black text-white/40 uppercase tracking-wider text-left">
          {showAufgaben ? `${itemCount || '-'} Aufgaben • ` : ''}{themenCount || 0} Themen
        </span>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
        {/* Aufgabentyp - LTR */}
        <span className="text-[6px] sm:text-[7px] font-black text-red-500 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full text-left">
          {getAufgabentypLabel(aufgabentyp)}
        </span>
        <span className="text-[6px] sm:text-[7px] font-black text-white/30 uppercase tracking-wider flex items-center gap-1 text-left">
          <Clock className="w-2.5 h-2.5 shrink-0" /> {arbeitszeit}
        </span>
      </div>
    </div>
    
    {/* Button - always at bottom */}
    <Button 
      variant="outline" 
      className="w-full h-8 sm:h-9 mt-4 rounded-lg border-white/10 bg-white/5 text-white/80 uppercase font-black text-[7px] sm:text-[8px] tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
      onClick={onClick}
    >
      Training starten
      <ArrowRight className="w-3 h-3 ml-1.5" />
    </Button>
    
    {/* Subtle hover glow */}
    <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-red-600/0 group-hover:bg-red-600/5 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />
  </Card>
);

const getTopicSubtitle = (teil: any, topic: any) => {
  if (teil?.id === 'teil-1' && Array.isArray(topic?.audioTexts)) return `${topic.audioTexts.length} Audiotexte`;
  if (teil?.aufgabentyp === 'mehrfachauswahl-3-gliedrig') return `${topic?.texts?.length || 1} Text(e)`;
  if (teil?.aufgabentyp === 'zuordnung') return `${topic?.ads?.length || 0} Anzeigen`;
  if (teil?.aufgabentyp === 'ja-nein') return `${topic?.comments?.length || 0} Meinungen`;
  if (teil?.aufgabentyp === 'richtig-falsch') return `${topic?.items?.length || 0} Aussagen`;
  return '';
};

const TopicCard = ({ title, titleAr, subtitle, onClick }: any) => (
  <Card 
    className="p-3 sm:p-4 bg-[#111] border-white/5 hover:border-[#ffcc00]/40 rounded-xl cursor-pointer transition-all hover:translate-y-[-2px] group flex items-center justify-between gap-3"
    onClick={onClick}
  >
    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-[#ffcc00] group-hover:text-black transition-all shrink-0">
      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
    </div>
    <div className="flex-1 min-w-0">
      {/* German Title - LTR */}
      <h4 className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-tight italic truncate text-left">
        {title}
      </h4>
      {/* Arabic Title - RTL */}
      {titleAr && (
        <p className="text-[8px] sm:text-[9px] font-black text-[#ffcc00] uppercase tracking-tight truncate text-left">
          {titleAr}
        </p>
      )}
      {subtitle && (
        <p className="text-[7px] sm:text-[8px] text-white/30 font-black uppercase mt-1 tracking-widest text-left">
          {subtitle}
        </p>
      )}
    </div>
    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/10 group-hover:text-[#ffcc00] transition-all shrink-0" />
  </Card>
);
