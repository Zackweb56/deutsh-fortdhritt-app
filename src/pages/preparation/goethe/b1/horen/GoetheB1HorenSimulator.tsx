import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import horenData from '@/data/preparation/goethe/b1/horen.json';

import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';
import Teil3 from './teile/Teil3';
import Teil4 from './teile/Teil4';

const parseDurationToSeconds = (duration?: string): number => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) * 60 : 0;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const GoetheB1HorenSimulator: React.FC = () => {
  const { teilId, topicId } = useParams<{ teilId: string; topicId: string }>();
  const navigate = useNavigate();

  const [teil, setTeil] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!teilId || !topicId) return;

    const currentTeil = horenData.teile.find((t: any) => t.id === teilId);
    if (!currentTeil) return;

    let currentTopic: any = null;
    if (currentTeil.themen) {
      currentTopic = currentTeil.themen.find((t: any) => t.id === topicId);
    }

    if (!currentTopic) return;

    setTeil(currentTeil);
    setTopic(currentTopic);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(parseDurationToSeconds(currentTeil.arbeitszeit));
    setIsTimerRunning(true);
  }, [teilId, topicId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowResults(true);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleAnswerChange = (itemId: string, value: string) => {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    setIsTimerRunning(false);
  };

  if (!teil || !topic) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-sans" dir="ltr">
        Laden...
      </div>
    );
  }

  const renderTeil = () => {
    const props = { topic, answers, showResults, onAnswerChange: handleAnswerChange };
    switch (teil.nummer) {
      case 1: return <Teil1 {...props} />;
      case 2: return <Teil2 {...props} />;
      case 3: return <Teil3 {...props} />;
      case 4: return <Teil4 {...props} />;
      default: return <div className="text-white p-4">Teil nicht gefunden</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden" dir="ltr">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-[#111] flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-white/50 hover:text-white" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-xs font-bold uppercase">Zurück</span>
          </Button>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] font-black text-[#ffcc00] uppercase tracking-wider">{horenData.institut} • {horenData.level}</span>
            <span className="text-xs font-bold text-white/90">{horenData.module} • {teil.label}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4">
           <div className={cn(
             'flex flex-col items-center px-4 py-1.5 rounded-xl border transition-all',
             timeLeft > 120 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
             timeLeft > 0 ? 'bg-[#ffcc00]/10 border-[#ffcc00]/30 text-[#ffcc00]' :
             'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'
           )}>
             <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Verbleibende Zeit</span>
             <span className="text-lg font-black tabular-nums leading-none">
               {formatTime(timeLeft)}
             </span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 relative">
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
          
          {/* Instructions Block */}
          <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl flex flex-col gap-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffcc00]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex items-start gap-3 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-[#ffcc00]/20 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-[#ffcc00]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight mb-1">{teil.title}</h2>
                <p className="text-sm text-white/60 leading-relaxed font-medium">
                  {teil.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Ziel</span>
                <span className="text-xs font-bold text-white/80">{teil.pruefungsziel}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Zeit</span>
                <span className="text-xs font-bold text-white/80">{teil.arbeitszeit}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Punkte</span>
                <span className="text-xs font-bold text-white/80">{teil.itemCount} Pkt.</span>
              </div>
            </div>
          </div>

          {/* Active Teil Component */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderTeil()}
          </div>
        </div>
      </main>

      {/* Footer / Submit Area */}
      <footer className="h-20 border-t border-white/10 bg-[#111]/80 backdrop-blur-xl fixed bottom-0 w-full z-40 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full flex justify-between items-center gap-4">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] font-black text-[#ffcc00] uppercase tracking-widest mb-0.5">Thema</span>
            <span className="text-xs font-bold text-white/70 truncate">{topic.title}</span>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {!showResults ? (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setAnswers({})}
                  className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white font-black uppercase tracking-wider px-4 sm:px-6 h-10 sm:h-12 text-[10px] sm:text-xs bg-transparent rounded-xl transition-all"
                >
                  zurücksetzen
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < (teil.itemCount || 0)}
                  className={cn(
                    "font-black uppercase tracking-[0.2em] px-6 sm:px-10 h-10 sm:h-12 text-[10px] sm:text-sm transition-all rounded-xl",
                    Object.keys(answers).length >= (teil.itemCount || 0)
                      ? "bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-black shadow-xl shadow-[#ffcc00]/20 scale-105"
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  )}
                >
                  Auswerten
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setAnswers({});
                    setShowResults(false);
                    setTimeLeft(parseDurationToSeconds(teil.arbeitszeit));
                    setIsTimerRunning(true);
                  }}
                  className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white font-black uppercase tracking-wider px-4 sm:px-6 h-10 sm:h-12 text-[10px] sm:text-xs bg-transparent rounded-xl"
                >
                  Neu starten
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Fertig</span>
                </div>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GoetheB1HorenSimulator;
