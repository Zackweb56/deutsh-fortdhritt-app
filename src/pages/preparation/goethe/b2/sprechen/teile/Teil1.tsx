import React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Info, Lock } from 'lucide-react';

interface Teil1Props {
  teil: any;
  topic: any;
  hasStarted: boolean;
  selectedThema: 'thema1' | 'thema2' | null;
  setSelectedThema: (thema: 'thema1' | 'thema2') => void;
}

const Teil1: React.FC<Teil1Props> = ({ teil, topic, hasStarted, selectedThema, setSelectedThema }) => {
  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Header Info Box - Compact & Premium */}
      <div className="bg-[#ffcc00] p-2.5 sm:p-3 rounded-xl flex items-start gap-2.5 border border-black/5 shadow-none">
        <div className="h-7 w-7 rounded-lg bg-black/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="h-4 w-4 text-black" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-2">
            <h2 className="text-[11px] sm:text-xs font-black text-black leading-tight uppercase italic truncate tracking-widest">{teil.title}</h2>
            {topic.kandidat && (
              <span className="bg-black text-[#ffcc00] text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter italic shrink-0">Kand. {topic.kandidat}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 opacity-60">
            <span className="text-[8px] font-bold text-black uppercase tracking-widest">{teil.pruefungsziel}</span>
            <span className="text-[8px] font-bold text-black uppercase opacity-40">•</span>
            <span className="text-[8px] font-bold text-black uppercase tracking-widest">{teil.dauer}</span>
          </div>
        </div>
      </div>

      {/* Theme Selection - Ultra Compact */}
      <div className="grid grid-cols-2 gap-2">
        {(['thema1', 'thema2'] as const).map((key) => {
          const isSelected = selectedThema === key;
          const isDisabled = hasStarted && !isSelected;
          
          return (
            <button
              key={key}
              disabled={hasStarted || (selectedThema !== null && !isSelected)}
              onClick={() => setSelectedThema(key)}
              className={cn(
                "relative p-3 sm:p-4 rounded-xl border transition-all text-left overflow-hidden group shadow-none",
                isSelected
                  ? "bg-[#1a1a1a] border-[#ffcc00]"
                  : "bg-[#111] border-white/5 hover:border-white/10",
                (hasStarted || (selectedThema !== null && !isSelected)) && "opacity-40 grayscale-[0.5] cursor-not-allowed"
              )}
            >
              {isSelected && hasStarted && (
                <div className="absolute top-2 right-2 z-20">
                  <Lock className="h-2.5 w-2.5 text-[#ffcc00]" />
                </div>
              )}
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[6px] font-black text-white/30 uppercase tracking-[0.2em]">Thema</span>
                  <span className={cn(
                    "h-3 w-3 rounded-full flex items-center justify-center text-[7px] font-black",
                    isSelected ? "bg-[#ffcc00] text-black" : "bg-white/5 text-white/40"
                  )}>
                    {key === 'thema1' ? '1' : '2'}
                  </span>
                </div>
                <div>
                  <h3 className={cn(
                    "text-[10px] sm:text-[11px] font-black text-white leading-tight uppercase italic transition-colors line-clamp-1 tracking-tight",
                    !isDisabled && "group-hover:text-[#ffcc00]"
                  )}>
                    {topic[key].title}
                  </h3>
                  {topic[key].titleAr && (
                    <p className="text-[9px] font-black text-[#ffcc00] uppercase tracking-tight mt-0.5 line-clamp-1" dir="rtl">
                      {topic[key].titleAr}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Theme Details - Focused & Compact */}
      {selectedThema && (
        <div className={cn(
          "bg-[#111] border border-white/5 rounded-[20px] p-4 sm:p-6 space-y-4 relative overflow-hidden transition-all duration-500 shadow-none",
          hasStarted ? "border-[#ffcc00]/20" : ""
        )}>
          <div className={cn(
            "absolute top-0 left-0 w-1 h-full transition-colors",
            hasStarted ? "bg-[#ffcc00]" : "bg-[#ffcc00]/20"
          )} />

          <div className="space-y-1 text-center">
            <span className="text-[7px] font-black text-[#ffcc00] uppercase tracking-[0.4em] opacity-60">IHR GEWÄHLTES THEMA</span>
            <h3 className="text-sm sm:text-base font-black text-white italic uppercase tracking-tight leading-tight">
              {topic[selectedThema].title}
            </h3>
            {topic[selectedThema].titleAr && (
              <p className="text-xs sm:text-sm font-black text-[#ffcc00] uppercase tracking-tight" dir="rtl">
                {topic[selectedThema].titleAr}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            <div className="bg-[#1a1a1a] rounded-xl p-3.5 sm:p-4 border border-white/5 space-y-2.5 shadow-none">
              <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Leitpunkte für Ihren Vortrag:</p>
              <div className="grid gap-1.5">
                {topic[selectedThema].leitpunkte.map((lp: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 group">
                    <div className="h-1 w-1 rounded-full bg-[#ffcc00] mt-1.5 shrink-0" />
                    <p className="text-[10px] sm:text-xs text-white/80 font-medium leading-relaxed">{lp}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 sm:p-3.5 border border-[#ffcc00]/10 rounded-xl bg-[#ffcc00]/5 italic shadow-none">
              <div className="h-6 w-6 rounded-lg bg-[#ffcc00]/20 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="h-3 w-3 text-[#ffcc00]" />
              </div>
              <div className="space-y-1">
                <p className="text-[7px] font-black text-[#ffcc00] uppercase tracking-widest">Hinweis:</p>
                <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                  {teil.instructions}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teil1;
