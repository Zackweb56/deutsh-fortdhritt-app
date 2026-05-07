import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import lesenData from '@/data/preparation/goethe/b1/lesen.json';

import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';
import Teil3 from './teile/Teil3';
import Teil4 from './teile/Teil4';
import Teil5 from './teile/Teil5';

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

const GoetheB1LesenSimulator = () => {
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

    const currentTeil = lesenData.teile.find(t => t.id === teilId);
    if (!currentTeil) return;

    const currentTopic = currentTeil.themen?.find(t => t.id === topicId);
    if (!currentTopic) return;

    setTeil(currentTeil);
    setTopic(currentTopic);
    
    const seconds = parseDurationToSeconds(currentTeil.arbeitszeit);
    setTimeLeft(seconds);
    setIsTimerRunning(true);
    
    setAnswers({});
    setShowResults(false);
  }, [teilId, topicId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowResults(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleAnswerChange = (itemId: string, value: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    setIsTimerRunning(false);
  };

  if (!teil || !topic) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white" dir="ltr">Laden...</div>;
  }

  const renderTeil = () => {
    const props = { topic, answers, showResults, onAnswerChange: handleAnswerChange };
    switch (teil.nummer) {
      case 1: return <Teil1 {...props} />;
      case 2: return <Teil2 {...props} />;
      case 3: return <Teil3 {...props} />;
      case 4: return <Teil4 {...props} />;
      case 5: return <Teil5 {...props} />;
      default: return <div className="text-white p-4">Teil nicht gefunden</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden" dir="ltr">
      {/* Header */}
      <header className="h-14 border-b border-white/10 bg-[#111] flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-white/50 hover:text-white" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-xs font-bold uppercase">Zurück</span>
          </Button>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] font-black text-[#ffcc00] uppercase tracking-wider">{lesenData.institut} • {lesenData.level}</span>
            <span className="text-xs font-bold text-white/90">{lesenData.module} • {teil.label}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4">
           <div className={cn(
             'flex flex-col items-center px-3 py-1 rounded-md border transition-all',
             timeLeft > 120 ? 'bg-green-500/10 border-green-500/30 text-green-400' :
             timeLeft > 0 ? 'bg-[#ffcc00]/10 border-[#ffcc00]/30 text-[#ffcc00]' :
             'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'
           )}>
             <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Zeit</span>
             <span className="text-sm font-black tabular-nums leading-none">
               {formatTime(timeLeft)}
             </span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 relative">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Instructions Block */}
          <div className="bg-[#ffcc00] p-4 rounded-xl flex items-start gap-3 shadow-lg shadow-[#ffcc00]/5">
            <div className="h-6 w-6 rounded-full bg-black/10 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-black" />
            </div>
            <div>
              <p className="text-sm font-black text-black leading-snug uppercase tracking-tight">
                {teil.instructions}
              </p>
              <div className="flex items-center gap-3 mt-2 opacity-80">
                <span className="text-[10px] font-bold text-black uppercase">{teil.pruefungsziel}</span>
                <span className="text-[10px] font-bold text-black uppercase">•</span>
                <span className="text-[10px] font-bold text-black uppercase">{teil.arbeitszeit}</span>
              </div>
            </div>
          </div>

          {/* Active Teil Component */}
          <div className="pb-24">
            {renderTeil()}
          </div>
        </div>
      </main>

      {/* Footer / Submit Area */}
      <footer className="h-16 border-t border-white/10 bg-[#111] fixed bottom-0 w-full z-40 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full flex justify-between items-center gap-2">
          <div className="text-[10px] sm:text-xs font-bold text-white/50 truncate flex-1 min-w-0 pr-2">
            {topic.title}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!showResults ? (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setAnswers({})}
                  className="border-white/20 text-white/70 hover:bg-white/10 font-bold uppercase tracking-wider px-3 sm:px-6 h-8 sm:h-10 text-[9px] sm:text-xs bg-transparent"
                >
                  Zurücksetzen
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < (teil.itemCount || 0)}
                  className={cn(
                    "font-black uppercase tracking-widest px-4 sm:px-8 h-8 sm:h-10 text-[10px] sm:text-sm transition-all",
                    Object.keys(answers).length >= (teil.itemCount || 0)
                      ? "bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-black shadow-lg shadow-[#ffcc00]/20"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
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
                  className="border-white/20 text-white/70 hover:bg-white/10 font-bold uppercase tracking-wider px-3 sm:px-6 h-8 sm:h-10 text-[9px] sm:text-xs bg-transparent"
                >
                  Neu starten
                </Button>
                <div className="flex items-center gap-1.5 text-green-400 font-black uppercase tracking-widest text-[10px] sm:text-xs">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Ergebnisse</span>
                </div>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GoetheB1LesenSimulator;
