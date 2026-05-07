import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, ChevronDown } from 'lucide-react';

interface Teil2Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil2: React.FC<Teil2Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const { text, sentences, items, beispiel } = topic;

  // Function to render the text with interactive gaps
  const renderTextWithGaps = () => {
    const parts = text.split(/(\[\.\.\.\d+\.\.\.\])/g);
    
    return parts.map((part: string, index: number) => {
      const match = part.match(/\[\.\.\.(\d+)\.\.\.\]/);
      if (match) {
        const gapId = match[1];
        const isBeispiel = gapId === "0";
        const selectedValue = isBeispiel ? beispiel.correct : answers[gapId];
        const correctValue = isBeispiel ? beispiel.correct : items.find((it: any) => it.id === gapId)?.correct;
        const isCorrect = isBeispiel ? true : selectedValue === correctValue;

        return (
          <span key={index} className="inline-block mx-1 align-middle relative">
            <select
              disabled={isBeispiel || showResults}
              value={selectedValue || ""}
              onChange={(e) => onAnswerChange(gapId, e.target.value)}
              className={cn(
                "appearance-none bg-[#222] border-2 rounded-lg px-2 py-1 text-xs font-black min-w-[3rem] text-center cursor-pointer transition-all",
                !selectedValue ? "border-white/20 text-[#ffcc00]" : "border-[#ffcc00] text-[#ffcc00]",
                showResults && !isBeispiel && (isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"),
                isBeispiel && "border-white/10 opacity-60 text-white cursor-default"
              )}
            >
              <option value="" disabled>{gapId}</option>
              {sentences.map((s: any) => (
                <option key={s.id} value={s.id}>{s.id.toUpperCase()}</option>
              ))}
            </select>
            {showResults && !isBeispiel && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2">
                {isCorrect ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
              </span>
            )}
            {showResults && !isBeispiel && !isCorrect && (
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-green-500 uppercase">
                {correctValue?.toUpperCase()}
              </span>
            )}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Text Container */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl md:text-2xl font-black text-white mb-6 pb-4 border-b border-white/10">
          {topic.title}
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-base md:text-lg text-white/90 leading-loose whitespace-pre-line font-medium">
            {renderTextWithGaps()}
          </p>
        </div>
      </div>

      {/* Sentences Selection Area */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3 mb-6">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Sätze zur Auswahl</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {sentences.map((sentence: any) => {
            // Find where this sentence is used
            let usedInGap = null;
            if (beispiel.correct === sentence.id) usedInGap = "0";
            else {
               const foundGap = Object.keys(answers).find(key => answers[key] === sentence.id);
               if (foundGap) usedInGap = foundGap;
            }

            return (
              <div 
                key={sentence.id} 
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border transition-all duration-300",
                  usedInGap ? "bg-[#ffcc00]/5 border-[#ffcc00]/20" : "bg-[#111] border-white/5"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 uppercase border-2",
                  usedInGap ? "bg-[#ffcc00] border-[#ffcc00] text-black" : "bg-white/5 border-white/10 text-white/50"
                )}>
                  {sentence.id}
                </div>
                <div className="flex-1">
                   <p className="text-sm text-white/80 leading-relaxed font-medium">{sentence.text}</p>
                   {usedInGap && (
                     <span className="text-[10px] font-black text-[#ffcc00] uppercase mt-2 block">
                       Ausgewählt für Lücke {usedInGap}
                     </span>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Teil2;
