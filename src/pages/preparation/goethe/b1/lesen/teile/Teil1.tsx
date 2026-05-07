import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Teil1Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil1: React.FC<Teil1Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const renderItem = (item: any, isBeispiel = false) => {
    const isSelectedRichtig = isBeispiel ? item.correct === 'Richtig' : answers[item.id] === 'Richtig';
    const isSelectedFalsch = isBeispiel ? item.correct === 'Falsch' : answers[item.id] === 'Falsch';

    // Evaluation logic when showResults is true
    const isCorrect = answers[item.id] === item.correct;
    
    return (
      <div 
        key={item.id} 
        className={cn(
          "flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-all duration-300",
          isBeispiel ? "bg-white/5 border-white/10 opacity-75" : "bg-[#111] border-white/5 hover:border-white/20",
          showResults && !isBeispiel && (isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5")
        )}
      >
        <div className="flex-1 flex gap-3">
          <span className="font-black text-[#ffcc00] text-lg w-6 shrink-0">{item.id}</span>
          <p className="text-sm text-white/90 leading-relaxed font-medium">{item.text}</p>
        </div>
        <div className="flex gap-2 sm:shrink-0 sm:self-center pt-2 sm:pt-0">
          <button
            disabled={isBeispiel || showResults}
            onClick={() => onAnswerChange(item.id, 'Richtig')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs border-2 transition-all",
              isSelectedRichtig 
                ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]" 
                : "bg-transparent border-white/20 text-white/50 hover:border-white/50 hover:text-white",
              showResults && !isBeispiel && item.correct === 'Richtig' && !isSelectedRichtig && "border-green-500 text-green-500",
              isBeispiel && isSelectedRichtig && "bg-white/20 border-white/30 text-white shadow-none"
            )}
          >
            Richtig
          </button>
          <button
            disabled={isBeispiel || showResults}
            onClick={() => onAnswerChange(item.id, 'Falsch')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs border-2 transition-all",
              isSelectedFalsch 
                ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]" 
                : "bg-transparent border-white/20 text-white/50 hover:border-white/50 hover:text-white",
              showResults && !isBeispiel && item.correct === 'Falsch' && !isSelectedFalsch && "border-green-500 text-green-500",
              isBeispiel && isSelectedFalsch && "bg-white/20 border-white/30 text-white shadow-none"
            )}
          >
            Falsch
          </button>
        </div>
        
        {/* Result Icon */}
        {showResults && !isBeispiel && (
          <div className="absolute right-2 top-2 sm:relative sm:right-0 sm:top-0 flex items-center justify-center">
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Text Section */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="mb-6 pb-4 border-b border-white/10">
          <h2 className="text-xl md:text-2xl font-black text-white mb-2">{topic.text.title}</h2>
          {topic.text.datum && (
            <span className="text-sm font-bold text-[#ffcc00] uppercase tracking-wider">{topic.text.datum}</span>
          )}
        </div>
        <div className="prose prose-invert max-w-none">
          <p className="text-base md:text-lg text-white/80 leading-loose whitespace-pre-line font-medium">
            {topic.text.content}
          </p>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        {topic.beispiel && renderItem(topic.beispiel, true)}
        {topic.items?.map((item: any) => renderItem(item, false))}
      </div>
    </div>
  );
};

export default Teil1;
