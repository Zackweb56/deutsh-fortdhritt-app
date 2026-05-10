import React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Info, CheckCircle2 } from 'lucide-react';

interface Teil1Props {
  teil: any;
  topic: any;
  hasStarted: boolean;
  selectedThema: 'thema1' | 'thema2' | null;
  setSelectedThema: (thema: 'thema1' | 'thema2') => void;
}

const Teil1: React.FC<Teil1Props> = ({ teil, topic, hasStarted, selectedThema, setSelectedThema }) => {
  return (
    <div className="space-y-8 font-serif">
      <div className="flex items-end justify-between border-b-2 border-gray-900 pb-4">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{teil.label}</h2>
        <span className="text-sm text-gray-600 italic">Vorbereitungszeit: 15 Min.</span>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-gray-50 border border-gray-200 text-sm text-gray-700 leading-relaxed italic">
          {teil.instructions}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['thema1', 'thema2'] as const).map((key) => {
            const isSelected = selectedThema === key;
            const thema = topic[key];
            
            return (
              <button
                key={key}
                disabled={hasStarted}
                onClick={() => setSelectedThema(key)}
                className={cn(
                  "p-6 border transition-all text-left relative group rounded-none",
                  isSelected
                    ? "bg-[#fff9c4] border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white border-gray-200 hover:border-gray-400 grayscale opacity-60",
                  hasStarted && !isSelected && "hidden"
                )}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="h-5 w-5 text-gray-900" />
                  </div>
                )}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Thema {key === 'thema1' ? '1' : '2'}</span>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {thema.title}
                  </h3>
                  {thema.titleAr && (
                    <p className="text-sm font-bold text-gray-500" dir="rtl">
                      {thema.titleAr}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedThema && (
          <div className={cn(
            "p-8 space-y-8 border-2 border-gray-900 transition-all",
            hasStarted ? "bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]" : "bg-[#fff9c4]"
          )}>
            <div className="space-y-2 text-center border-b border-gray-200 pb-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Prüfungsthema</span>
              <h3 className="text-2xl font-bold text-gray-900 uppercase">
                {topic[selectedThema].title}
              </h3>
            </div>

            <div className="space-y-6">
              <p className="text-base text-gray-600 font-bold uppercase tracking-widest text-center text-xs">Leitpunkte für Ihren Vortrag:</p>
              <ul className="space-y-4">
                {topic[selectedThema].leitpunkte.map((lp: string, i: number) => (
                  <li key={i} className="flex items-start gap-4 p-4 border border-gray-100 bg-gray-50/50">
                    <span className="h-2 w-2 rounded-full bg-gray-900 mt-2 shrink-0" />
                    <p className="text-base text-gray-800 leading-relaxed font-medium">{lp}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-gray-100 italic text-sm text-gray-500 text-center">
              Strukturieren Sie Ihren Vortrag (Einleitung, Hauptteil, Schluss).
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teil1;
