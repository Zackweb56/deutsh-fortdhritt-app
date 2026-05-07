import React from 'react';
import { useExamStore } from '@/hooks/useExamStore';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Headphones } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { cn } from '@/lib/utils';
import { ModuleData } from '@/types/exam';
import { Lock, Unlock } from 'lucide-react';

export const HorenModule: React.FC<{ data: ModuleData }> = ({ data }) => {
  const { currentTeil, nextTeil, updateAnswer, answers, finishModule, variantId, playCounts, incrementPlayCount } = useExamStore();
  const [unlockedTasks, setUnlockedTasks] = React.useState<Record<string, boolean>>({});

  const handleUnlock = (id: string) => {
    setUnlockedTasks(prev => ({ ...prev, [id]: true }));
  };

  const isUnlocked = (id: string) => !!unlockedTasks[id];
  
  const teilKey = `teil${currentTeil}`;
  const teilData = data[teilKey] as any;
  const currentAnswers = answers[`horen_${currentTeil}`] || {};

  const handleAnswerChange = (id: string | number, value: string) => {
    updateAnswer('horen', currentTeil.toString(), {
      ...currentAnswers,
      [id]: value
    });
  };

  const isLastTeil = currentTeil === 4;

  const isTeilFinished = () => {
    if (!teilData) return false;
    
    if (teilData.type === 'richtig_falsch_mehrfachauswahl') {
      return teilData.audioTexts?.every((t: any) => 
        currentAnswers[`${t.id}_rf`] && currentAnswers[`${t.id}_mc`]
      ) || teilData.texts?.every((t: any) => 
        currentAnswers[t.q1.id] && currentAnswers[t.q2.id]
      );
    }

    const items = teilData.items || [];
    if (items.length > 0) {
      return items.every((item: any) => item.isExample || currentAnswers[item.id]);
    }
    
    return false;
  };

  const handleNext = () => {
    if (!isTeilFinished()) return;
    
    if (isLastTeil) {
      let rawPoints = 0;
      
      // Teil 1
      const t1 = data.teil1;
      const a1 = answers.horen_1 || {};
      t1.texts?.forEach((t: any) => {
        if (a1[t.q1.id] === t.q1.correct) rawPoints++;
        if (a1[t.q2.id] === t.q2.correct) rawPoints++;
      });
      
      // Teil 2, 3, 4
      [2, 3, 4].forEach(num => {
        const teil = data[`teil${num}`];
        const ans = answers[`horen_${num}`] || {};
        teil?.items?.forEach((item: any) => {
          if (item.isExample) return;
          if (ans[item.id] === item.correct) rawPoints++;
        });
      });

      finishModule('horen', rawPoints);
    } else {
      nextTeil();
    }
    window.scrollTo(0, 0);
  };

  const getAudioUrl = (filename: string) => {
    if (!filename) return '';
    const basePath = data.meta.baseAudioPath || `/src/data/exam/B1/Goethe/variants/variant_${variantId}/horen/`;
    return `${basePath}${filename}`;
  };

  const renderMixedRFMC = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {(teilData.audioTexts || teilData.texts)?.map((text: any) => (
        <div key={text.id} className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg">
              {text.id}
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Aufgabe {text.id}</h3>
          </div>

          <div className="w-full">
            <AudioPlayer 
              src={getAudioUrl(text.audioFile || `${text.id}.mp3`)} 
              maxPlays={teilData.plays || 2} 
              playCount={playCounts[`v${variantId}_horen_${currentTeil}_${text.id}`] || 0}
              onPlay={() => incrementPlayCount(`v${variantId}_horen_${currentTeil}_${text.id}`)}
              onPlayEnd={() => handleUnlock(`task_${text.id}`)}
            />
          </div>

          {!isUnlocked(`task_${text.id}`) && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl w-fit">
              <Lock className="h-3 w-3 text-red-600" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Bitte hören Sie zuerst das Audio</span>
            </div>
          )}

          <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 transition-all", !isUnlocked(`task_${text.id}`) && "opacity-40 grayscale pointer-events-none")}>
            <Card className="bg-[#111] border-white/5 shadow-xl overflow-hidden">
              <CardHeader className="pb-3 bg-white/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40">Richtig oder Falsch?</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="font-bold text-white text-base leading-snug">{text.items?.[0]?.text || text.q1?.text}</p>
                <RadioGroup 
                  value={currentAnswers[text.items?.[0]?.id || text.q1?.id] || ''} 
                  onValueChange={(val) => handleAnswerChange(text.items?.[0]?.id || text.q1?.id, val)}
                  className="flex gap-4"
                >
                  {['Richtig', 'Falsch'].map((val) => (
                    <Label 
                      key={val}
                      className={cn(
                        "flex-1 h-12 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all font-black text-xs uppercase",
                        currentAnswers[text.items?.[0]?.id || text.q1?.id] === val 
                          ? (val === 'Richtig' ? "bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]")
                          : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
                      )}
                    >
                      <RadioGroupItem value={val} className="sr-only" />
                      {val}
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-white/5 shadow-xl overflow-hidden">
              <CardHeader className="pb-3 bg-white/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40">Wählen Sie aus</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="font-bold text-white text-base leading-snug">{text.items?.[1]?.text || text.q2?.text}</p>
                <RadioGroup 
                  value={currentAnswers[text.items?.[1]?.id || text.q2?.id] || ''} 
                  onValueChange={(val) => handleAnswerChange(text.items?.[1]?.id || text.q2?.id, val)}
                  className="space-y-2"
                >
                  {(text.items?.[1]?.options || text.q2?.options || []).map((opt: any) => {
                    const val = typeof opt === 'string' ? opt : opt.value;
                    const label = typeof opt === 'string' ? opt : opt.label;
                    return (
                      <Label 
                        key={val}
                        className={cn(
                          "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                          currentAnswers[text.items?.[1]?.id || text.q2?.id] === val ? "bg-[#ffcc00]/10 border-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.1)]" : "border-white/5 bg-black/20 text-white/60 hover:bg-white/5"
                        )}
                      >
                        <RadioGroupItem value={val} className="mr-4 border-[#ffcc00] text-[#ffcc00]" />
                        <span className="text-xs font-black uppercase leading-tight">{label}</span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMehrfachauswahl = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full">
        <AudioPlayer 
          src={getAudioUrl(teilData.audioFile || `teil${currentTeil}.mp3`)} 
          maxPlays={teilData.plays || 1} 
          playCount={playCounts[`v${variantId}_horen_${currentTeil}_main`] || 0}
          onPlay={() => incrementPlayCount(`v${variantId}_horen_${currentTeil}_main`)}
          onPlayEnd={() => handleUnlock(`teil_${currentTeil}`)}
        />
      </div>

      {!isUnlocked(`teil_${currentTeil}`) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl w-fit mx-auto mt-4">
          <Lock className="h-3 w-3 text-red-600" />
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Bitte hören Sie zuerst das Audio</span>
        </div>
      )}

      <div className={cn("space-y-6 mt-12 transition-all", !isUnlocked(`teil_${currentTeil}`) && "opacity-40 grayscale pointer-events-none")}>
        {teilData.items?.map((item: any) => (
          <Card key={item.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="pb-4 bg-white/5">
              <CardTitle className="text-lg sm:text-xl flex gap-4 font-black leading-tight">
                <span className="text-[#ffcc00] font-black">{item.id}.</span>
                <span className="text-white">{item.text}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup 
                value={currentAnswers[item.id] || ''} 
                onValueChange={(val) => handleAnswerChange(item.id, val)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {item.options?.map((opt: any) => {
                  const val = typeof opt === 'string' ? opt : opt.value;
                  const label = typeof opt === 'string' ? opt : opt.label;
                  return (
                    <Label 
                      key={val}
                      className={cn(
                        "flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all",
                        currentAnswers[item.id] === val ? "bg-[#ffcc00]/10 border-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.1)]" : "border-white/5 bg-black/20 text-white/60 hover:bg-white/5"
                      )}
                    >
                      <RadioGroupItem value={val} className="mr-4 border-[#ffcc00] text-[#ffcc00]" />
                      <span className="font-black uppercase tracking-tight text-xs leading-tight">{label}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderZuordnungPerson = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full">
        <AudioPlayer 
          src={getAudioUrl(teilData.audioFile || `teil${currentTeil}.mp3`)} 
          maxPlays={teilData.plays || 1} 
          playCount={playCounts[`v${variantId}_horen_${currentTeil}_main`] || 0}
          onPlay={() => incrementPlayCount(`v${variantId}_horen_${currentTeil}_main`)}
          onPlayEnd={() => handleUnlock(`teil_${currentTeil}`)}
        />
      </div>

      {!isUnlocked(`teil_${currentTeil}`) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl w-fit mx-auto mt-4">
          <Lock className="h-3 w-3 text-red-600" />
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Bitte hören Sie zuerst das Audio</span>
        </div>
      )}

      <div className={cn("space-y-6 transition-all", !isUnlocked(`teil_${currentTeil}`) && "opacity-40 grayscale pointer-events-none")}>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {teilData.options?.map((opt: any) => (
            <div key={opt.value} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="h-6 w-6 rounded-full bg-[#ffcc00] text-black flex items-center justify-center font-black text-xs uppercase">{opt.value}</span>
              <span className="text-[10px] font-black text-white/60 uppercase">{opt.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {teilData.items?.map((item: any) => (
            <Card key={item.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="h-8 w-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shrink-0">{item.id}</div>
                <p className="flex-1 text-white font-bold leading-snug">{item.text}</p>
                <RadioGroup 
                  value={currentAnswers[item.id] || ''} 
                  onValueChange={(val) => handleAnswerChange(item.id, val)}
                  className="flex gap-2"
                >
                {teilData.options?.map((opt: any) => (
                  <Label 
                    key={opt.value}
                    className={cn(
                      "h-12 w-12 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all font-black text-sm uppercase",
                      currentAnswers[item.id] === opt.value ? "bg-[#ffcc00] border-[#ffcc00] text-black" : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
                    )}
                  >
                    <RadioGroupItem value={opt.value} className="sr-only" />
                    {opt.value}
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </div>
  );

  const renderTeilContent = () => {
    switch (teilData.type) {
      case 'richtig_falsch_mehrfachauswahl':
        return renderMixedRFMC();
      case 'mehrfachauswahl':
        return renderMehrfachauswahl();
      case 'zuordnung_person':
        return renderZuordnungPerson();
      case 'richtig_falsch':
        return renderTeil23(); // Legacy B1 support
      case 'ja_nein':
        return renderTeil4(); // Legacy B1 support
      default:
        // Fallback for B1 parts if type is missing
        if (currentTeil === 1) return renderTeil1();
        if (currentTeil === 2 || currentTeil === 3) return renderTeil23();
        if (currentTeil === 4) return renderTeil4();
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#ffcc00] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Teil {currentTeil}</span>
            <span className="h-[1px] w-12 bg-white/10" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20">
              <Headphones className="h-3 w-3 text-red-600" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Wiedergabe: {teilData?.plays || 1}x</span>
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{teilData?.textType}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">Modul Hören</h1>
          <p className="text-white/40 font-bold text-sm sm:text-base leading-relaxed max-w-2xl mt-4">{teilData?.instructions}</p>
        </div>
      </div>

      {renderTeilContent()}

      <div className="mt-12 flex flex-col items-center sm:items-end gap-4 pb-24">
        {!isTeilFinished() && (
          <p className="text-[10px] font-black text-[#ffcc00] uppercase tracking-widest animate-pulse">
            Bitte beantworten Sie alle Fragen, um fortzufahren
          </p>
        )}
        <Button 
          size="lg" 
          onClick={handleNext}
          disabled={!isTeilFinished()}
          className={cn(
            "h-14 sm:h-12 w-full sm:w-auto px-10 text-lg sm:text-base font-black rounded-xl shadow-xl transition-all",
            isTeilFinished() 
              ? "bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90 hover:scale-[1.02] active:scale-[0.98]" 
              : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
          )}
        >
          {isLastTeil ? (
            <>MODUL ABSCHLIESSEN <CheckCircle2 className="ml-2 h-5 w-5" /></>
          ) : (
            <>NÄCHSTER TEIL <ArrowRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>
      </div>
    </div>
  );
};
