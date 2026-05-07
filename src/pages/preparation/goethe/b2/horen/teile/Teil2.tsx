import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Volume2 } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';

interface Teil2Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil2: React.FC<Teil2Props> = ({ topic, answers, showResults, onAnswerChange }) => {
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
      {/* Central Audio Player Section */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-50" />
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">{topic.title}</h2>
          <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">Radio-Interview • 2x Hören</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
           {audio && (
             <AudioPlayer 
               src={`/media/audio/goethe/horen/b2/${audio}`} 
               maxPlays={2} 
             />
           )}
        </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Aufgaben 11–16</h2>
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
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Vollständiges Transkript</h3>
           </div>
           <div className="prose prose-invert max-w-none">
              <p className="text-sm md:text-base text-white/60 leading-relaxed italic font-medium whitespace-pre-line bg-black/20 p-6 rounded-2xl border border-white/5">
                {transkript}
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Teil2;
