import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Volume2 } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';

interface Teil1Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (itemId: string, value: string) => void;
}

const Teil1: React.FC<Teil1Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const audioTexts = topic.audioTexts || [];
  const maxPlays = 2; // Fixed for Teil 1

  const renderTask = (item: any) => {
    const selectedValue = answers[item.id];
    const isCorrect = selectedValue === item.correct;
    const isRF = item.type === 'richtig-falsch';

    return (
      <div 
        key={item.id} 
        className={cn(
          "p-4 rounded-xl border transition-all duration-300 relative",
          showResults ? (isCorrect ? "border-emerald-500/50 bg-emerald-500/5" : "border-red-500/50 bg-red-500/5") : "bg-[#111] border-white/5"
        )}
      >
        <div className="flex gap-3 mb-4">
           <span className="font-black text-[#ffcc00] text-sm shrink-0 mt-0.5">{item.id}</span>
           <p className="text-sm font-bold text-white/90 leading-relaxed">{item.text}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isRF ? (
            ['Richtig', 'Falsch'].map((option) => (
              <button
                key={option}
                disabled={showResults}
                onClick={() => onAnswerChange(item.id, option)}
                className={cn(
                  "flex-1 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] border-2 transition-all",
                  selectedValue === option 
                    ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/10" 
                    : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white",
                  showResults && item.correct === option && selectedValue !== option && "border-emerald-500 text-emerald-500"
                )}
              >
                {option}
              </button>
            ))
          ) : (
            item.options.map((option: string, idx: number) => {
              const val = option;
              const label = String.fromCharCode(97 + idx); // a, b, c
              const isSelected = selectedValue === val;
              const isOptionCorrect = item.correct === val;

              return (
                <button
                  key={val}
                  disabled={showResults}
                  onClick={() => onAnswerChange(item.id, val)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all group",
                    isSelected 
                      ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-md shadow-[#ffcc00]/10" 
                      : "bg-transparent border-white/5 text-white/60 hover:border-white/10 hover:text-white",
                    showResults && isOptionCorrect && !isSelected && "border-emerald-500 text-emerald-500"
                  )}
                >
                  <span className={cn(
                    "h-6 w-6 rounded flex items-center justify-center font-black text-[10px] uppercase shrink-0 transition-all",
                    isSelected ? "bg-black text-[#ffcc00]" : "bg-white/5 text-white/40 group-hover:bg-white/10"
                  )}>
                    {label}
                  </span>
                  <span className="text-xs font-bold leading-tight">{option}</span>
                </button>
              );
            })
          )}
        </div>

        {showResults && (
          <div className="absolute right-3 top-3">
            {isCorrect ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {audioTexts.map((text: any, index: number) => (
        <div key={text.id} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-[#ffcc00]" />
               <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">
                 {text.title || `Text ${index + 1}`}
               </h3>
            </div>
            {index === 0 && (
               <span className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-black text-white/50 uppercase tracking-widest border border-white/5">
                 Beispiel
               </span>
            )}
          </div>

          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ffcc00]/40 group-hover:bg-[#ffcc00] transition-all" />
            
            {text.audio && (
              <div className="mb-6">
                <AudioPlayer 
                  src={`/media/audio/goethe/horen/b1/${text.audio}`} 
                  maxPlays={maxPlays} 
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {text.items.map((item: any) => renderTask(item))}
            </div>

            {showResults && text.transkript && (
              <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-[10px] font-black text-[#ffcc00] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Volume2 className="h-3 w-3" />
                  Transkript
                </p>
                <p className="text-xs text-white/50 leading-relaxed italic font-medium bg-black/20 p-4 rounded-xl border border-white/5">
                  "{text.transkript}"
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Teil1;
