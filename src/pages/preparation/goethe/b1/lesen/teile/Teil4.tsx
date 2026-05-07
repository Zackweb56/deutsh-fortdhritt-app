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

  const renderItem = (item: any, isBeispiel = false) => {
    const isSelectedJa = isBeispiel ? item.correct === 'Ja' : answers[item.id] === 'Ja';
    const isSelectedNein = isBeispiel ? item.correct === 'Nein' : answers[item.id] === 'Nein';
    const isCorrect = answers[item.id] === item.correct;

    return (
      <div 
        key={item.id} 
        className={cn(
          "flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
          isBeispiel ? "bg-white/5 border-white/10 opacity-75" : "bg-[#111] border-white/5 hover:border-white/20",
          showResults && !isBeispiel && (isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5")
        )}
      >
        {/* Background Quote Icon */}
        <MessageSquareQuote className="absolute -top-4 -right-4 h-24 w-24 text-white/5 pointer-events-none -scale-x-100" />

        <div className="flex items-start gap-3 relative z-10">
          <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
            <span className="font-black text-[#ffcc00] text-xl bg-black/50 h-8 w-8 rounded-lg flex items-center justify-center shadow-inner">
              {item.id}
            </span>
          </div>
          
          <div className="flex-1 space-y-3">
            <p className="text-sm text-white/80 leading-relaxed font-medium italic">
              "{item.text}"
            </p>
            <span className="text-xs font-black text-white/40 block">
              — {item.author}
            </span>
          </div>
        </div>
        
        {/* Answer Buttons */}
        <div className="flex justify-end gap-2 mt-2 relative z-10 border-t border-white/5 pt-4">
          {showResults && !isBeispiel && (
            <div className="mr-auto flex items-center">
              {isCorrect ? (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded text-green-500">
                  <Check className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Richtig</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded text-red-500">
                  <X className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Falsch</span>
                </div>
              )}
            </div>
          )}

          <button
            disabled={isBeispiel || showResults}
            onClick={() => onAnswerChange(item.id, 'Ja')}
            className={cn(
              "px-8 py-2 rounded-lg font-black uppercase tracking-widest text-xs border-2 transition-all",
              isSelectedJa 
                ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]" 
                : "bg-transparent border-white/20 text-white/50 hover:border-white/50 hover:text-white",
              showResults && !isBeispiel && item.correct === 'Ja' && !isSelectedJa && "border-green-500 text-green-500",
              isBeispiel && isSelectedJa && "bg-white/20 border-white/30 text-white shadow-none"
            )}
          >
            Ja
          </button>
          <button
            disabled={isBeispiel || showResults}
            onClick={() => onAnswerChange(item.id, 'Nein')}
            className={cn(
              "px-8 py-2 rounded-lg font-black uppercase tracking-widest text-xs border-2 transition-all",
              isSelectedNein 
                ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]" 
                : "bg-transparent border-white/20 text-white/50 hover:border-white/50 hover:text-white",
              showResults && !isBeispiel && item.correct === 'Nein' && !isSelectedNein && "border-green-500 text-green-500",
              isBeispiel && isSelectedNein && "bg-white/20 border-white/30 text-white shadow-none"
            )}
          >
            Nein
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Context Block */}
      {topic.contextText && (
        <div className="bg-[#1a1a1a] p-5 border-l-4 border-[#ffcc00] rounded-r-xl shadow-lg">
          <p className="text-sm text-white/90 font-medium leading-relaxed">
            {topic.contextText}
          </p>
        </div>
      )}

      {/* Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-black text-white uppercase tracking-wider">{topic.title}</h2>
      </div>

      {/* Kommentare / Leserbriefe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {topic.beispiel && renderItem(topic.beispiel, true)}
          {topic.comments?.slice(0, Math.ceil(topic.comments.length / 2)).map((item: any) => renderItem(item, false))}
        </div>
        <div className="space-y-6">
          {topic.comments?.slice(Math.ceil(topic.comments.length / 2)).map((item: any) => renderItem(item, false))}
        </div>
      </div>
    </div>
  );
};

export default Teil4;
