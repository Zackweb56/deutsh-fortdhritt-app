import React, { useState } from 'react';
import { useExamStore } from '@/hooks/useExamStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ModuleData } from '@/types/exam';
import { evaluateWritingExam, WritingEvaluationResult } from '@/lib/ai/groq';
import { 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  PenTool, 
  Type, 
  Info, 
  Eye, 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  Check 
} from 'lucide-react';

export const SchreibenModule: React.FC<{ data: ModuleData }> = ({ data }) => {
  const { currentTeil, nextTeil, updateAnswer, answers, finishModule } = useExamStore();
  const [showSample, setShowSample] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<WritingEvaluationResult | null>(null);

  const aufgabeKey = `aufgabe${currentTeil}`;
  const aufgabeData = data[aufgabeKey] as any;
  const currentText = answers[`schreiben_${currentTeil}`] || '';

  const wordCount = currentText.trim() === '' ? 0 : currentText.trim().split(/\s+/).length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateAnswer('schreiben', currentTeil.toString(), e.target.value);
  };

  const isLastTeil = !data[`aufgabe${currentTeil + 1}`];

  const handleNext = async () => {
    if (wordCount < 10) return;
    
    if (isLastTeil) {
      setIsEvaluating(true);
      try {
        const result = await evaluateWritingExam(answers as Record<string, string>);
        setEvaluationResult(result);
      } catch (err) {
        console.error(err);
        finishModule('schreiben', 70);
      } finally {
        setIsEvaluating(false);
      }
    } else {
      setShowSample(false);
      nextTeil();
      window.scrollTo(0, 0);
    }
  };

  const getWordCountColor = (count: number) => {
    if (count >= (aufgabeData?.wordCount || 80)) return "text-green-500 border-green-500 bg-green-500/10";
    if (count >= 20) return "text-orange-500 border-orange-500 bg-orange-500/10";
    return "text-red-500 border-red-500 bg-red-500/10";
  };

  if (isEvaluating || evaluationResult) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {!evaluationResult ? (
          <Card className="bg-[#111] border-2 border-white/5 rounded-[40px] p-12 text-center shadow-2xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <BrainCircuit className="h-16 w-16 text-orange-500 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">Auswertung läuft</h2>
              <p className="text-sm text-white/40 mb-8 font-bold tracking-widest uppercase">Ihre Texte werden nun von der KI analysiert...</p>
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
            </div>
          </Card>
        ) : (
          <Card className="bg-[#111] border-2 border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="text-center relative z-10">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Schreiben Ergebnis</span>
              <h2 className="text-6xl font-black text-white mt-2 tracking-tighter">{evaluationResult.score} <span className="text-3xl text-white/20">/ 100</span></h2>
            </div>

            <div className="grid grid-cols-3 gap-3 relative z-10">
              {[
                { label: 'Teil 1', val: evaluationResult.part1, max: 40 },
                { label: 'Teil 2', val: evaluationResult.part2, max: 40 },
                { label: 'Teil 3', val: evaluationResult.part3, max: 20 },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                  <span className="text-[9px] font-black text-white/40 uppercase block mb-1 tracking-widest">{item.label}</span>
                  <span className="text-xl font-black text-white">{item.val}<span className="text-xs text-white/20 ml-0.5">/{item.max}</span></span>
                </div>
              ))}
            </div>
            
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6 relative z-10">
              <h4 className="text-xs font-black text-orange-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Feedback
              </h4>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{evaluationResult.feedback}</p>
            </div>
            
            <Button onClick={() => finishModule('schreiben', evaluationResult.score)} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase italic shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] relative z-10">
              MODUL BEENDEN <Check className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#ffcc00] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Aufgabe {currentTeil}</span>
            <span className="h-[1px] w-12 bg-white/10" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20">
              <PenTool className="h-3 w-3 text-red-600" />
              <span className="text-[10px] font-black text-red-600 uppercase">Zeit: {aufgabeData?.timeMinutes} min</span>
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{aufgabeData?.type?.replace('_', ' ')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">Modul Schreiben</h1>
          <p className="text-white/40 font-bold text-sm sm:text-base leading-relaxed max-w-2xl mt-4">{aufgabeData?.instructions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-[#111] border-2 border-white/5 shadow-2xl rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 bg-[#ffcc00] h-full" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-5 w-5 text-[#ffcc00]" />
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Situation & Aufgabe</h3>
              </div>
              
              <div className="space-y-6">
                {aufgabeData?.situation && (
                  <p className="text-white/90 text-sm font-medium leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">{aufgabeData.situation}</p>
                )}
                
                {aufgabeData?.topic && (
                  <div className="bg-[#ffcc00]/10 p-4 rounded-xl border border-[#ffcc00]/20">
                    <span className="text-[10px] font-black text-[#ffcc00] uppercase tracking-widest mb-2 block">Thema</span>
                    <p className="text-white text-lg font-black uppercase tracking-tight">{aufgabeData.topic}</p>
                  </div>
                )}

                {aufgabeData?.onlineComment && (
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2">
                    <p className="text-[#ffcc00] font-black text-[10px] uppercase">{aufgabeData.onlineComment.author} schreibt:</p>
                    <p className="text-white/60 italic text-xs leading-relaxed">&quot;{aufgabeData.onlineComment.text}&quot;</p>
                  </div>
                )}

                {(aufgabeData?.pointsToCover || aufgabeData?.aufgabenpunkte) && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Punkte:</p>
                    <ul className="space-y-2">
                      {(aufgabeData.pointsToCover || aufgabeData.aufgabenpunkte).map((point: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="h-4 w-4 rounded-full bg-[#ffcc00]/20 text-[#ffcc00] flex items-center justify-center shrink-0 text-[10px] font-black mt-0.5">•</div>
                          <p className="text-white/70 font-bold text-xs">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aufgabeData?.task && (
                  <p className="text-[#ffcc00] font-black text-[10px] uppercase tracking-tight pt-4 border-t border-white/5">{aufgabeData.task}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="ghost" 
            className="w-full h-10 gap-2 border border-dashed border-white/10 hover:bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-xl"
            onClick={() => setShowSample(!showSample)}
          >
            <Eye className="h-4 w-4" />
            {showSample ? 'Beispiel ausblenden' : 'Beispiel anzeigen'}
          </Button>

          {showSample && (
            <Card className="animate-in fade-in slide-in-from-top-2 duration-300 bg-white/5 border-white/5 rounded-2xl">
              <CardContent className="p-4">
                <p className="text-xs leading-relaxed whitespace-pre-wrap italic text-white/40">{aufgabeData?.sampleAnswer}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="relative group">
            <Textarea 
              value={currentText}
              onChange={handleTextChange}
              placeholder="Schreiben Sie hier Ihren Text..."
              spellCheck="false"
              className="min-h-[450px] text-lg p-8 rounded-3xl border-2 border-white/5 bg-[#111] text-white focus-visible:ring-[#ffcc00] shadow-2xl resize-none font-medium leading-relaxed"
            />
            <div className={cn(
              "absolute bottom-6 right-6 px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase shadow-xl flex items-center gap-2 transition-all duration-300",
              getWordCountColor(wordCount)
            )}>
              <Type className="h-3 w-3" />
              {wordCount} Wörter
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase text-white/20 tracking-widest border border-white/5">
            <Info className="h-3 w-3 shrink-0 text-[#ffcc00]" />
            <p>Empfehlung: ca. {aufgabeData?.wordCount} Wörter. Bewertung erfolgt nach Kriterien.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center sm:items-end gap-4 pb-24">
        {wordCount < 10 && (
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">
            Schreiben Sie mindestens 10 Wörter, um fortzufahren
          </p>
        )}
        <Button 
          size="lg" 
          onClick={handleNext}
          disabled={wordCount < 10 || isEvaluating}
          className={cn(
            "h-14 sm:h-12 w-full sm:w-auto px-10 text-lg sm:text-base font-black rounded-xl shadow-xl transition-all",
            wordCount >= 10 
              ? "bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90 hover:scale-[1.02] active:scale-[0.98]" 
              : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
          )}
        >
          {isLastTeil ? (
            isEvaluating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> WIRD AUSGEWERTET...</> : <>MODUL ABSCHLIESSEN <CheckCircle2 className="ml-2 h-5 w-5" /></>
          ) : (
            <>NÄCHSTER TEIL <ArrowRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>
      </div>
    </div>
  );
};
