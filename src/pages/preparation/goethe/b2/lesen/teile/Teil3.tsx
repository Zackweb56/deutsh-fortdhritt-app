import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Teil3Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil3: React.FC<Teil3Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const { text, items, beispiel } = topic;

  const renderQuestion = (item: any, isBeispiel = false) => {
    const selectedValue = isBeispiel ? item.correct : answers[item.id];
    const isCorrect = isBeispiel ? true : selectedValue === item.correct;

    return (
      <div 
        key={item.id} 
        className={cn(
          "p-6 rounded-2xl border transition-all duration-300 relative",
          isBeispiel ? "bg-white/5 border-white/10 opacity-75" : "bg-[#111] border-white/5 hover:border-white/20",
          showResults && !isBeispiel && (isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5")
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
                disabled={isBeispiel || showResults}
                onClick={() => onAnswerChange(item.id, option.value)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                  isSelected 
                    ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/10" 
                    : "bg-transparent border-white/5 text-white/60 hover:border-white/20 hover:text-white",
                  showResults && !isBeispiel && isOptionCorrect && !isSelected && "border-green-500 text-green-500",
                  isBeispiel && isSelected && "bg-white/20 border-white/30 text-white shadow-none"
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

        {showResults && !isBeispiel && (
          <div className="absolute right-6 top-6">
            {isCorrect ? (
              <Check className="h-6 w-6 text-green-500" />
            ) : (
              <X className="h-6 w-6 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      {/* Text Section */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffcc00]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <h2 className="text-2xl md:text-3xl font-black text-white mb-8 pb-6 border-b border-white/10 relative z-10">
          {topic.title}
        </h2>
        
        <div className="prose prose-invert max-w-none relative z-10">
          <p className="text-base md:text-lg text-white/80 leading-relaxed whitespace-pre-line font-medium italic">
             {text}
          </p>
        </div>
      </div>

      {/* Questions Area */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3 mb-8">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Aufgaben</h2>
        </div>

        {beispiel && (
          <div className="space-y-3">
             <span className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Beispiel</span>
             {renderQuestion(beispiel, true)}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 pt-6 border-t border-white/5">
          {items.map((item: any) => renderQuestion(item))}
        </div>
      </div>
    </div>
  );
};

export default Teil3;
