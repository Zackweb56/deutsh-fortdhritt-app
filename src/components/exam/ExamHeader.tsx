import React, { useEffect } from 'react';
import { useExamStore } from '@/hooks/useExamStore';
import { Progress } from '@/components/ui/progress';
import { Timer, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ExamHeader: React.FC<{ totalTeile: number }> = ({ totalTeile }) => {
  const currentModule = useExamStore(state => state.currentModule);
  const currentTeil = useExamStore(state => state.currentTeil);
  const timeLeft = useExamStore(state => state.timeLeft);
  const tick = useExamStore(state => state.tick);
  const isTimerActive = useExamStore(state => state.isTimerActive);

  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      tick();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTimerActive, tick, timeLeft <= 0]); // Added minimal dependency to re-trigger when timeLeft becomes > 0

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300; // 5 minutes

  const moduleNames: Record<string, string> = {
    lesen: 'Lesen',
    horen: 'Hören',
    schreiben: 'Schreiben',
    sprechen: 'Sprechen',
  };

  const progress = ((currentTeil - 1) / totalTeile) * 100;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl">
      <div className="container mx-auto px-4 py-2 sm:py-3">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-black via-red-600 to-[#ffcc00] flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-[10px] sm:text-sm">{moduleNames[currentModule as string]?.charAt(0) || 'P'}</span>
              </div>
              <div>
                <h2 className="text-[10px] sm:text-base font-black text-white tracking-tight uppercase leading-none">
                  {moduleNames[currentModule as string] || 'Prüfung'}
                </h2>
                <p className="text-[7px] sm:text-[9px] font-black text-white/30 uppercase tracking-widest mt-0.5">
                  Teil {currentTeil} von {totalTeile}
                </p>
              </div>
            </div>

            {isTimerActive && (
            <div className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1 rounded-md sm:rounded-lg border transition-all duration-500",
              isLowTime 
                ? "bg-white/5 border-[#ffcc00]/50 text-[#ffcc00] shadow-[0_0_10px_rgba(255,204,0,0.1)]" 
                : "bg-white/5 border-white/5 text-white/60"
            )}>
              <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-50" />
              <span className="font-mono text-xs sm:text-base font-bold tabular-nums tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>
            )}
          </div>
          
          <div className="flex flex-col gap-0.5">
            <div className="h-0.5 sm:h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-black via-red-600 to-[#ffcc00] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
