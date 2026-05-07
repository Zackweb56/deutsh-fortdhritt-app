import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, FileText } from 'lucide-react';

interface Teil5Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil5: React.FC<Teil5Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic || !topic.text) return null;

  const renderItem = (item: any) => {
    const isCorrect = answers[item.id] === item.correct;

    return (
      <div 
        key={item.id} 
        className={cn(
          "flex flex-col gap-4 p-5 rounded-xl border transition-all duration-300",
          "bg-[#111] border-white/5 hover:border-white/20",
          showResults && (isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5")
        )}
      >
        <div className="flex gap-3 items-start">
          <span className="font-black text-[#ffcc00] text-lg w-6 shrink-0 pt-0.5">{item.id}</span>
          <p className="text-base text-white/90 font-bold leading-snug flex-1">{item.text}</p>
          {showResults && (
            <div className="shrink-0">
              {isCorrect ? <Check className="h-6 w-6 text-green-500" /> : <X className="h-6 w-6 text-red-500" />}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-9">
          {item.options.map((opt: any) => {
            const isSelected = answers[item.id] === opt.value;
            const isActuallyCorrect = opt.value === item.correct;

            return (
              <button
                key={opt.value}
                disabled={showResults}
                onClick={() => onAnswerChange(item.id, opt.value)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all",
                  isSelected 
                    ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]" 
                    : "bg-transparent border-white/10 text-white/70 hover:border-white/30 hover:text-white",
                  showResults && isActuallyCorrect && !isSelected && "border-green-500 text-green-500 bg-green-500/10"
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Context Block */}
      {topic.context && (
        <div className="bg-[#1a1a1a] p-5 border-l-4 border-[#ffcc00] rounded-r-xl shadow-lg">
          <p className="text-sm text-white/90 font-medium leading-relaxed">
            {topic.context}
          </p>
        </div>
      )}

      {/* Main Official Text Section */}
      <div className="bg-[#111] text-white border border-white/10 rounded-xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <FileText className="absolute top-4 right-4 h-20 w-20 text-white/5 pointer-events-none" />
        
        <div className="mb-6 pb-4 border-b border-white/10">
          <h2 className="text-2xl font-black uppercase tracking-widest text-center">{topic.text.title}</h2>
        </div>
        
        <div className="prose prose-sm max-w-none prose-p:text-white/80 prose-strong:text-white">
          <p className="text-sm leading-relaxed whitespace-pre-line font-medium text-justify">
            {/* Simple parsing to make words before colon bold, as common in Hausordnungen */}
            {topic.text.content.split('\\n').map((line: string, i: number) => {
              if (line.includes(':')) {
                const parts = line.split(':');
                return (
                  <span key={i} className="block mb-3">
                    <strong>{parts[0]}:</strong>{parts.slice(1).join(':')}
                  </span>
                );
              }
              return <span key={i} className="block mb-3">{line}</span>;
            })}
          </p>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        {topic.items?.map((item: any) => renderItem(item))}
      </div>
    </div>
  );
};

export default Teil5;
