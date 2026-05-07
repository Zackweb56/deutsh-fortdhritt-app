import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, MessageSquareQuote } from 'lucide-react';

interface Teil4Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil4: React.FC<Teil4Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const { title, contextText, ueberschriften, comments, items, beispiel } = topic;

  const renderHeadingTask = (heading: any, isBeispiel = false) => {
    const gapId = heading.id;
    const selectedValue = isBeispiel ? beispiel.correct : answers[gapId];
    const correctValue = isBeispiel ? beispiel.correct : items.find((it: any) => it.id === gapId)?.correct;
    const isCorrect = isBeispiel ? true : selectedValue === correctValue;

    return (
      <div 
        key={heading.id} 
        className={cn(
          "p-5 rounded-2xl border transition-all duration-300 relative",
          isBeispiel ? "bg-white/5 border-white/10 opacity-75" : "bg-[#111] border-white/5 hover:border-white/20",
          showResults && !isBeispiel && (isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5")
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
             <span className="font-black text-[#ffcc00] text-lg leading-none shrink-0">{heading.id}</span>
             <h3 className="text-sm font-bold text-white leading-relaxed">{heading.text}</h3>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((option) => {
              const isSelected = selectedValue === option;
              const isOptionCorrect = correctValue === option;

              return (
                <button
                  key={option}
                  disabled={isBeispiel || showResults}
                  onClick={() => onAnswerChange(gapId, option)}
                  className={cn(
                    "py-2 rounded-lg font-black uppercase transition-all border-2 text-[10px]",
                    isSelected 
                      ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-md shadow-[#ffcc00]/10" 
                      : "bg-transparent border-white/10 text-white/40 hover:border-white/30 hover:text-white/70",
                    showResults && !isBeispiel && isOptionCorrect && !isSelected && "border-green-500 text-green-500",
                    isBeispiel && isSelected && "bg-white/20 border-white/30 text-white shadow-none"
                  )}
                >
                  {option.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {showResults && !isBeispiel && (
          <div className="absolute right-4 top-4">
            {isCorrect ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      {/* Title & Context */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-black text-white mb-2">{title}</h2>
        <p className="text-sm text-white/60 italic">{contextText}</p>
      </div>

      {/* Comments Area */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Kommentare</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="bg-[#111] border border-white/5 rounded-xl p-5 relative group hover:border-white/10 transition-all">
              <div className="flex items-center gap-2 mb-3">
                 <div className="h-6 w-6 rounded bg-[#ffcc00]/20 flex items-center justify-center text-[#ffcc00] text-[10px] font-black uppercase">
                   {comment.id}
                 </div>
                 <span className="text-xs font-black text-white/40 uppercase tracking-widest">{comment.author}</span>
                 <MessageSquareQuote className="h-3 w-3 text-white/20 ml-auto group-hover:text-[#ffcc00]/40 transition-colors" />
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-medium italic">
                "{comment.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Headings Task Area */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3 mb-8">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Zuordnung</h2>
        </div>

        {beispiel && renderHeadingTask({id: "0", text: "Beispiel: " + comments.find((c: any) => c.id === beispiel.correct)?.author + "s Meinung"}, true)}

        <div className="grid grid-cols-1 gap-4 pt-6 border-t border-white/5">
          {ueberschriften.map((heading: any) => renderHeadingTask(heading))}
        </div>
      </div>
    </div>
  );
};

export default Teil4;
