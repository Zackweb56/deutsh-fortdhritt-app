import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, CheckCircle2, Loader2, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import schreibenData from '@/data/preparation/goethe/b1/schreiben.json';
import { evaluatePreparationWriting, PreparationWritingResult } from '@/lib/ai/groq';
import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';
import Teil3 from './teile/Teil3';

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

const GoetheB1SchreibenSimulator = () => {
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
    if (userText.trim().length === 0) return;
    
    setIsTimerRunning(false);
    setIsEvaluating(true);
    setShowResultsModal(true);

    try {
      const result = await evaluatePreparationWriting({
        institute: schreibenData.institut,
        level: schreibenData.level,
        teilLabel: teil.label,
        themaTitle: topic.title,
        instructions: `Context: ${topic.situation}\nAufgabe: ${teil.pruefungsziel}\nPunkte: ${topic.aufgabenpunkte?.join(', ') || ''}`,
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden" dir="ltr">      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-[#111] flex items-center justify-between px-4 sticky top-0 z-50">
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
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 relative">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          
          {teil.nummer === 1 && (
            <Teil1
              teil={teil}
              topic={topic}
              userText={userText}
              onTextChange={handleTextChange}
              wordCount={wordCount}
            />
          )}
          {teil.nummer === 2 && (
            <Teil2
              teil={teil}
              topic={topic}
              userText={userText}
              onTextChange={handleTextChange}
              wordCount={wordCount}
            />
          )}
          {teil.nummer === 3 && (
            <Teil3
              teil={teil}
              topic={topic}
              userText={userText}
              onTextChange={handleTextChange}
              wordCount={wordCount}
            />
          )}

        </div>
      </main>

      {/* Footer / Submit Area */}
      <footer className="h-24 border-t border-white/10 bg-[#111] fixed bottom-0 w-full z-40 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full flex justify-between items-center gap-4">
          <div className="flex flex-col flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-[#ffcc00] uppercase">Fortschritt</span>
                <span className="text-[10px] font-bold text-white/30 uppercase">Ziel: {teil.minWords} Wörter</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden max-w-[200px]">
                   <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        wordCount >= teil.minWords ? "bg-emerald-500" : "bg-[#ffcc00]"
                      )}
                      style={{ width: `${Math.min((wordCount / teil.minWords) * 100, 100)}%` }}
                   />
                </div>
                <span className={cn(
                  "text-sm font-black tabular-nums",
                  wordCount >= teil.minWords ? "text-emerald-400" : "text-white"
                )}>{wordCount}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
             <Button 
                variant="outline"
                onClick={() => {
                  if (confirm("Möchten Sie Ihren Text wirklich löschen?")) {
                    setUserText('');
                    setWordCount(0);
                  }
                }}
                className="border-white/10 text-white/40 hover:bg-white/5 hover:text-white font-black uppercase px-4 sm:px-6 h-12 text-[10px] sm:text-xs bg-transparent rounded-xl"
             >
                zurücksetzen
             </Button>
             <Button 
                onClick={handleSubmit}
                disabled={wordCount < teil.minWords || isEvaluating}
                className={cn(
                  "font-black uppercase px-8 sm:px-12 h-12 text-[10px] sm:text-sm transition-all rounded-xl",
                  wordCount >= teil.minWords
                    ? "bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-black"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                )}
             >
                {isEvaluating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Analysieren"}
             </Button>
          </div>
        </div>
      </footer>

      {/* Evaluation Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 sm:p-6" dir="ltr">
          <div className="bg-[#111] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {isEvaluating ? (
              <div className="p-16 flex flex-col items-center justify-center gap-6 h-80">
                <div className="relative">
                   <Loader2 className="h-16 w-16 text-[#ffcc00] animate-spin" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase italic">KI-Analyse</h3>
                  <p className="text-xs text-white/40 font-bold uppercase">Ihre Leistung wird nach Goethe B1 Kriterien bewertet</p>
                </div>
              </div>
            ) : evaluationResult ? (
              <>
                {/* Result Header */}
                <div className="p-8 border-b border-white/5 bg-[#181818] flex items-center justify-between shrink-0">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white uppercase italic">Testergebnis</h2>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-[#ffcc00] uppercase">{schreibenData.level} Standard</span>
                       <span className="h-1 w-1 rounded-full bg-white/20" />
                       <p className="text-xs font-bold text-white/40">{topic.title}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "relative flex flex-col items-center justify-center h-20 w-20 rounded-2xl border-2",
                    evaluationResult.score >= 60 ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-400" : "border-red-500/50 bg-red-500/5 text-red-400"
                  )}>
                    <span className="text-3xl font-black tabular-nums">{evaluationResult.score}</span>
                    <span className="text-[8px] font-black uppercase opacity-60">Punkte</span>
                  </div>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-10">
                  {/* Score Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Aufgabenerfüllung', value: evaluationResult.aufgabenerfuellung },
                      { label: 'Kohärenz', value: evaluationResult.kohaerenz },
                      { label: 'Wortschatz', value: evaluationResult.wortschatz },
                      { label: 'Strukturen', value: evaluationResult.strukturen }
                    ].map((crit, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.04] transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-white/40 uppercase">{crit.label}</span>
                          <span className="text-sm font-black text-[#ffcc00]">{crit.value}/25</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                           <div 
                              className="h-full bg-[#ffcc00] rounded-full transition-all duration-1000 delay-300" 
                              style={{ width: `${(crit.value / 25) * 100}%` }}
                           />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <Info className="h-4 w-4" />
                       </div>
                       <h3 className="text-sm font-black text-white uppercase">Feedback des Prüfers</h3>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl text-sm leading-relaxed text-blue-100/80 font-medium whitespace-pre-wrap">
                      {evaluationResult.feedback}
                    </div>
                  </div>

                  {/* Improved Version */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                       </div>
                       <h3 className="text-sm font-black text-white uppercase">Musterlösung (Besserer Vorschlag)</h3>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl text-sm leading-relaxed text-emerald-100/80 font-medium whitespace-pre-wrap">
                      {evaluationResult.improvedVersion || "Keine Musterlösung verfügbar."}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-white/5 bg-[#181818] shrink-0 flex justify-end gap-4">
                   <Button 
                      variant="outline" 
                      onClick={() => setShowResultsModal(false)}
                      className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white font-black uppercase text-[10px] px-6 h-12 rounded-xl"
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
                      className="bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-black font-black uppercase text-xs px-8 h-12 rounded-xl"
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

export default GoetheB1SchreibenSimulator;
