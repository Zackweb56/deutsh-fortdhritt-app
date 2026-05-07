import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Headphones, Volume2, Mic2 } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';

interface Teil4Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil4: React.FC<Teil4Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const { items, transkript, audio } = topic;

  const renderQuestion = (item: any) => {
    const selectedValue = answers[item.id];
    const isCorrect = selectedValue === item.correct;

    return (
      <div 
        key={item.id} 
        className={cn(
          "p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden",
          showResults 
            ? (isCorrect ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]" : "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]") 
            : "bg-[#111] border-white/5 hover:border-white/10"
        )}
      >
        <div className="flex gap-4 mb-6">
          <span className="font-black text-[#ffcc00] text-lg leading-none shrink-0">{item.id}</span>
          <h3 className="text-base font-bold text-white leading-snug">{item.text}</h3>
        </div>

        <div className="space-y-3">
          {item.options.map((option: any) => {
            const isSelected = selectedValue === option.value;
            const isOptionCorrect = item.correct === option.value;

            return (
              <button
                key={option.value}
                disabled={showResults}
                onClick={() => onAnswerChange(item.id, option.value)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                  isSelected 
                    ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/10" 
                    : "bg-transparent border-white/5 text-white/60 hover:border-white/10 hover:text-white",
                  showResults && isOptionCorrect && !isSelected && "border-emerald-500 text-emerald-500"
                )}
              >
                <span className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs uppercase shrink-0 transition-all",
                  isSelected ? "bg-black text-[#ffcc00]" : "bg-white/5 text-white/40 group-hover:bg-white/10"
                )}>
                  {option.value}
                </span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>

        {showResults && (
          <div className="absolute right-6 top-6">
            {isCorrect ? (
              <Check className="h-6 w-6 text-emerald-500" />
            ) : (
              <X className="h-6 w-6 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Lecture Info / Audio */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-5">
           <Mic2 className="h-48 w-48 text-[#ffcc00]" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
           <div className="h-24 w-24 rounded-3xl bg-[#ffcc00]/10 border border-[#ffcc00]/20 flex items-center justify-center text-[#ffcc00] shrink-0">
              <Headphones className="h-10 w-10" />
           </div>
           
           <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] font-black text-[#ffcc00] uppercase tracking-[0.4em] mb-2 block">Akademischer Vortrag</span>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">{topic.title}</h2>
              <p className="text-sm text-white/40 font-medium">Hören Sie den Text zweimal und lösen Sie die Aufgaben.</p>
           </div>

           <div className="shrink-0 w-full md:w-64">
              {audio && (
                <AudioPlayer 
                  src={`/media/audio/goethe/horen/b2/${audio}`} 
                  maxPlays={2} 
                />
              )}
           </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Aufgaben 23–30</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
           {items.map((item: any) => renderQuestion(item))}
        </div>
      </div>

      {/* Transkript */}
      {showResults && transkript && (
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex items-center gap-3 mb-6">
              <Volume2 className="h-5 w-5 text-[#ffcc00]" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Manuskript des Vortrags</h3>
           </div>
           <div className="prose prose-invert max-w-none">
              <p className="text-sm md:text-base text-white/60 leading-relaxed italic font-medium whitespace-pre-line bg-black/20 p-8 rounded-3xl border border-white/5 shadow-inner">
                {transkript}
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Teil4;
