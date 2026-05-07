import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, CheckCircle2, Loader2, PenTool, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import schreibenData from '@/data/preparation/goethe/b2/schreiben.json';
import { evaluatePreparationWriting, PreparationWritingResult } from '@/lib/ai/groq';
import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';

const parseDurationToSeconds = (duration?: string): number => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const GoetheB2SchreibenSimulator = () => {
  const { teilId, topicId } = useParams<{ teilId: string; topicId: string }>();
  const navigate = useNavigate();

  const [teil, setTeil] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [userText, setUserText] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Evaluation States
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PreparationWritingResult | null>(null);

  useEffect(() => {
    if (!teilId || !topicId) return;

    const currentTeil = schreibenData.teile.find(t => t.id === teilId);
    if (!currentTeil) return;

    const currentTopic = currentTeil.themen?.find((t: any) => t.id === topicId);
    if (!currentTopic) return;

    setTeil(currentTeil);
    setTopic(currentTopic);
    
    const seconds = parseDurationToSeconds(currentTeil.arbeitszeit);
    setTimeLeft(seconds);
    setIsTimerRunning(true);
    
    setUserText('');
    setWordCount(0);
    setEvaluationResult(null);
    setShowResultsModal(false);
  }, [teilId, topicId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setUserText(text);
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  const handleSubmit = async () => {
    if (wordCount < teil.minWords) return;
    
    setIsTimerRunning(false);
    setIsEvaluating(true);
    setShowResultsModal(true);

    try {
      const result = await evaluatePreparationWriting({
        institute: schreibenData.institut,
        level: schreibenData.level,
        teilLabel: teil.label,
        themaTitle: topic.title,
        instructions: `Context: ${topic.context || topic.situation}\nAufgabe: ${teil.instructions}\nPunkte: ${topic.aufgabenpunkte.join(', ')}`,
        minWords: teil.minWords,
        userText: userText
      });
      setEvaluationResult(result);
    } catch (error) {
      console.error("Evaluation Error:", error);
      setEvaluationResult({
        score: 0,
        aufgabenerfuellung: 0,
        kohaerenz: 0,
        wortschatz: 0,
        strukturen: 0,
        feedback: "Es gab einen Fehler bei der Auswertung. Bitte versuchen Sie es später noch einmal.",
        improvedVersion: ""
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!teil || !topic) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-sans" dir="ltr">
        Laden...
      </div>
    );
  }

  const isSubmitDisabled = wordCount < teil.minWords || isEvaluating;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden" dir="ltr">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-[#111] flex items-center justify-between px-4 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-white/50 hover:text-white" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-xs font-bold uppercase">Zurück</span>
          </Button>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] font-black text-[#ffcc00] uppercase">{schreibenData.institut} • {schreibenData.level}</span>
            <span className="text-xs font-bold text-white/90">{schreibenData.module} • {teil.label}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4">
           <div className={cn(
             'flex flex-col items-center px-4 py-1.5 rounded-xl border transition-all',
             timeLeft > 120 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
             timeLeft > 0 ? 'bg-[#ffcc00]/10 border-[#ffcc00]/30 text-[#ffcc00]' :
             'bg-red-500/10 border-red-500/30 text-red-500'
           )}>
             <span className="text-[8px] font-black uppercase opacity-80">Zeit</span>
             <span className="text-lg font-black tabular-nums leading-none">
               {formatTime(timeLeft)}
             </span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
        {/* Left Side: Task/Instructions */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-[#0c0c0c] border-r border-white/5">
          <div className="max-w-3xl mx-auto space-y-8 pb-32">
            {teil.nummer === 1 ? (
              <Teil1 teil={teil} topic={topic} />
            ) : (
              <Teil2 teil={teil} topic={topic} />
            )}
          </div>
        </div>

        {/* Right Side: Writing Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a] relative">
          <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-end px-2 mb-4">
              <h4 className="text-[10px] font-black uppercase text-[#ffcc00]">Ihre Ausarbeitung</h4>
              <div className={cn(
                "text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition-all",
                wordCount < teil.minWords 
                  ? "text-amber-400 border-amber-400/20 bg-amber-400/5" 
                  : "text-emerald-400 border-emerald-400/20 bg-emerald-400/5"
              )}>
                Wörter: <span className="text-white">{wordCount}</span> / {teil.minWords}
              </div>
            </div>
            
            <textarea 
               value={userText}
               onChange={handleTextChange}
               placeholder="Beginnen Sie hier mit dem Schreiben Ihres Textes..."
               className="flex-1 w-full bg-[#111] border border-white/10 rounded-3xl p-6 sm:p-8 text-white text-base leading-relaxed placeholder:text-white/10 focus:ring-1 focus:ring-[#ffcc00]/30 focus:outline-none transition-all custom-scrollbar resize-none"
               disabled={isEvaluating || showResultsModal}
            />
          </div>

          {/* Fixed Footer for Right Side */}
          <div className="h-20 border-t border-white/5 bg-[#111] flex items-center justify-between px-8 shrink-0">
             <Button 
                variant="ghost"
                onClick={() => {
                  if (confirm("Möchten Sie Ihren Text wirklich löschen?")) {
                    setUserText('');
                    setWordCount(0);
                  }
                }}
                className="text-white/30 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] px-6"
             >
                Löschen
             </Button>
             <Button 
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={cn(
                  "font-black uppercase px-10 h-12 text-xs transition-all rounded-xl",
                  !isSubmitDisabled
                    ? "bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-black"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                )}
             >
                {isEvaluating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Einreichen & Auswerten"}
             </Button>
          </div>
        </div>
      </main>

      {/* Evaluation Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-6" dir="ltr">
          <div className="bg-[#111] border border-white/10 rounded-[48px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {isEvaluating ? (
              <div className="p-20 flex flex-col items-center justify-center gap-8 h-[500px]">
                <div className="relative">
                   <Loader2 className="h-20 w-20 text-[#ffcc00] animate-spin" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black text-white uppercase italic">KI-Analyse</h3>
                  <p className="text-xs text-white/40 font-black uppercase animate-pulse">Ihre Leistung wird nach Goethe B2 Kriterien bewertet</p>
                </div>
              </div>
            ) : evaluationResult ? (
              <>
                {/* Result Header */}
                <div className="p-10 border-b border-white/5 bg-[#181818] flex items-center justify-between shrink-0">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase italic">Prüfungsergebnis</h2>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-[#ffcc00] uppercase bg-[#ffcc00]/10 px-3 py-1 rounded-full">{schreibenData.level} Schreiben</span>
                       <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                       <p className="text-xs font-bold text-white/40 truncate max-w-[200px]">{topic.title}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "relative flex flex-col items-center justify-center h-24 w-24 rounded-[32px] border-2",
                    evaluationResult.score >= 60 ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-400" : "border-red-500/50 bg-red-500/5 text-red-400"
                  )}>
                    <span className="text-4xl font-black tabular-nums">{evaluationResult.score}</span>
                    <span className="text-[8px] font-black uppercase opacity-60">Punkte</span>
                  </div>
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12">
                  {/* Score Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: 'Aufgabenerfüllung', value: evaluationResult.aufgabenerfuellung },
                      { label: 'Kohärenz', value: evaluationResult.kohaerenz },
                      { label: 'Wortschatz', value: evaluationResult.wortschatz },
                      { label: 'Strukturen', value: evaluationResult.strukturen }
                    ].map((crit, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl group hover:bg-white/[0.05] transition-colors">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black text-white/40 uppercase">{crit.label}</span>
                          <span className="text-base font-black text-[#ffcc00]">{crit.value}/25</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-[#ffcc00] rounded-full transition-all duration-1000 delay-300" 
                              style={{ width: `${(crit.value / 25) * 100}%` }}
                           />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <Info className="h-5 w-5" />
                       </div>
                       <h3 className="text-base font-black text-white uppercase">Feedback des Prüfers</h3>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-3xl text-base leading-relaxed text-blue-100/80 font-medium italic whitespace-pre-wrap">
                      {evaluationResult.feedback}
                    </div>
                  </div>

                  {/* Improved Version */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                       </div>
                       <h3 className="text-base font-black text-white uppercase">Musterlösung</h3>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-3xl text-base leading-relaxed text-emerald-100/80 font-medium italic whitespace-pre-wrap">
                      {evaluationResult.improvedVersion || "Keine Verbesserungen vorgeschlagen."}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-10 border-t border-white/5 bg-[#181818] shrink-0 flex justify-end gap-6">
                   <Button 
                      variant="outline" 
                      onClick={() => setShowResultsModal(false)}
                      className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white font-black uppercase text-[10px] px-8 h-14 rounded-2xl"
                   >
                      Schließen
                   </Button>
                   <Button 
                      onClick={() => {
                        setShowResultsModal(false);
                        setUserText('');
                        setWordCount(0);
                        setTimeLeft(parseDurationToSeconds(teil.arbeitszeit));
                        setIsTimerRunning(true);
                      }}
                      className="bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-black font-black uppercase text-xs px-12 h-14 rounded-2xl"
                   >
                      Neu starten
                   </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoetheB2SchreibenSimulator;
