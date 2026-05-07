import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Teil2Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil2: React.FC<Teil2Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic || !topic.texts) return null;

  const renderItem = (item: any, isBeispiel = false) => {
    const isCorrect = answers[item.id] === item.correct;

    return (
      <div 
        key={item.id} 
        className={cn(
          "flex flex-col gap-4 p-5 rounded-xl border transition-all duration-300",
          isBeispiel ? "bg-white/5 border-white/10 opacity-75" : "bg-[#111] border-white/5 hover:border-white/20",
          showResults && !isBeispiel && (isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5")
        )}
      >
        <div className="flex gap-3 items-start">
          <span className="font-black text-[#ffcc00] text-lg w-6 shrink-0 pt-0.5">{item.id}</span>
          <p className="text-base text-white/90 font-bold leading-snug flex-1">{item.text}</p>
          {showResults && !isBeispiel && (
            <div className="shrink-0">
              {isCorrect ? <Check className="h-6 w-6 text-green-500" /> : <X className="h-6 w-6 text-red-500" />}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-9">
          {item.options.map((opt: any) => {
            const isSelected = isBeispiel ? opt.value === item.correct : answers[item.id] === opt.value;
            const isActuallyCorrect = opt.value === item.correct;

            return (
              <button
                key={opt.value}
                disabled={isBeispiel || showResults}
                onClick={() => onAnswerChange(item.id, opt.value)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all",
                  isSelected 
                    ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]" 
                    : "bg-transparent border-white/10 text-white/70 hover:border-white/30 hover:text-white",
                  showResults && !isBeispiel && isActuallyCorrect && !isSelected && "border-green-500 text-green-500 bg-green-500/10",
                  isBeispiel && isSelected && "bg-white/20 border-white/30 text-white shadow-none"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-6 w-6 rounded border font-black text-xs uppercase shrink-0",
                  isSelected ? "border-black/30" : "border-current"
                )}>
                  {opt.value}
                </div>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {topic.texts.map((textObj: any, index: number) => (
        <div key={textObj.id || index} className="space-y-6">
          {/* Text Section */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffcc00]/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
            
            <div className="mb-6 pb-4 border-b border-white/10">
              <h2 className="text-xl md:text-2xl font-black text-white mb-2">{textObj.title}</h2>
              {textObj.source && (
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{textObj.source}</span>
              )}
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-base md:text-lg text-white/80 leading-loose whitespace-pre-line font-medium">
                {textObj.content}
              </p>
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            {textObj.beispiel && renderItem(textObj.beispiel, true)}
            {textObj.items?.map((item: any) => renderItem(item, false))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Teil2;
