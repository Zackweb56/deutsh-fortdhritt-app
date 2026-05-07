import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Gavel } from 'lucide-react';

interface Teil5Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil5: React.FC<Teil5Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const { title, text } = topic;
  const { ueberschriften, paragraphen } = text;

  const renderParagraphTask = (para: any, isBeispiel = false) => {
    const gapId = para.id;
    const selectedValue = isBeispiel ? topic.beispiel.correct : answers[gapId];
    const correctValue = isBeispiel ? topic.beispiel.correct : topic.items.find((it: any) => it.id === gapId)?.correct;
    const isCorrect = isBeispiel ? true : selectedValue === correctValue;

    return (
      <div 
        key={para.id} 
        className={cn(
          "p-6 rounded-2xl border transition-all duration-300 relative",
          isBeispiel ? "bg-white/5 border-white/10 opacity-75" : "bg-[#111] border-white/5 hover:border-white/20",
          showResults && !isBeispiel && (isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5")
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4 text-[#ffcc00]" />
                <span className="font-black text-[#ffcc00] text-sm uppercase tracking-tighter">{para.title}</span>
             </div>
             <p className="text-sm text-white/80 leading-relaxed font-medium">{para.content}</p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {ueberschriften.map((option: any) => {
              const isSelected = selectedValue === option.id;
              const isOptionCorrect = correctValue === option.id;

              return (
                <button
                  key={option.id}
                  disabled={isBeispiel || showResults}
                  onClick={() => onAnswerChange(gapId, option.id)}
                  title={option.text}
                  className={cn(
                    "py-2 rounded-lg font-black uppercase transition-all border-2 text-[10px]",
                    isSelected 
                      ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-md shadow-[#ffcc00]/10" 
                      : "bg-transparent border-white/10 text-white/40 hover:border-white/30 hover:text-white/70",
                    showResults && !isBeispiel && isOptionCorrect && !isSelected && "border-green-500 text-green-500",
                    isBeispiel && isSelected && "bg-white/20 border-white/30 text-white shadow-none"
                  )}
                >
                  {option.id.toUpperCase()}
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
      {/* Title */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-xl text-center">
        <h2 className="text-2xl font-black text-white">{text.title || title}</h2>
      </div>

      {/* Headings List Area */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Überschriften</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ueberschriften.map((heading: any) => (
            <div key={heading.id} className="bg-[#111] border border-white/5 rounded-xl p-4 flex items-center gap-4 group hover:border-white/10 transition-all">
              <div className="h-8 w-8 rounded bg-[#ffcc00]/10 flex items-center justify-center text-[#ffcc00] text-sm font-black uppercase shrink-0 border border-[#ffcc00]/20">
                {heading.id}
              </div>
              <p className="text-xs text-white/70 font-bold group-hover:text-white transition-colors uppercase tracking-tight">
                {heading.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Paragraphs Task Area */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3 mb-8">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Regelungen</h2>
        </div>

        {topic.beispiel && (
          <div className="space-y-2 opacity-60">
             <span className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Beispiel</span>
             {renderParagraphTask({id: "0", title: "Beispiel", content: "Der Text für das Beispiel... (siehe oben)"}, true)}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 pt-6 border-t border-white/5">
          {paragraphen.map((para: any) => renderParagraphTask(para))}
        </div>
      </div>
    </div>
  );
};

export default Teil5;
