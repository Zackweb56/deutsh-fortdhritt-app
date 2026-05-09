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
    const isCorrect = isBeispiel ? true : answers[item.id] === item.correct;
    const selectedAnswer = isBeispiel ? item.correct : answers[item.id];

    return (
      <div 
        key={item.id} 
        className={cn(
          "relative p-6 bg-white border border-gray-200 rounded-sm transition-all shadow-sm",
          showResults && !isBeispiel && (isCorrect ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200")
        )}
      >
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <span className="font-bold text-gray-400 text-sm pt-0.5">{item.id}.</span>
            <p className="text-[16px] text-gray-800 leading-relaxed font-medium flex-1">{item.text}</p>
          </div>
          
          <div className="flex gap-4 pl-9">
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].slice(0, topic.optionsCount || 10).map((option) => {
              const isSelected = selectedAnswer === option;
              
              return (
                <div 
                  key={option}
                  className={cn("goethe-option", isSelected && "active")}
                  onClick={() => !isBeispiel && !showResults && onAnswerChange(item.id, option)}
                >
                  <div className={cn("goethe-radio", isSelected && "active")} />
                  <span className="text-sm font-bold uppercase tracking-tight">{option}</span>
                </div>
              );
            })}
          </div>
        </div>

        {showResults && !isBeispiel && (
          <div className="absolute top-4 right-4">
            {isCorrect ? (
              <Check className="h-6 w-6 text-green-600" />
            ) : (
              <div className="flex flex-col items-end gap-1">
                <X className="h-6 w-6 text-red-600" />
                <span className="text-[10px] font-bold text-green-600 uppercase">Soll: {item.correct}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      <div className="bg-white border-b-4 border-gray-900 pb-8 text-center">
         <h2 className="text-3xl font-serif font-bold text-gray-900 leading-tight tracking-tight">
           Hörverstehen — Teil 1
         </h2>
         <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Kurze Texte — Notizen</p>
      </div>

      <div className="space-y-8">
        {topic.beispiel && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Beispiel</span>
            {renderItem(topic.beispiel, true)}
          </div>
        )}
        {topic.items?.map((item: any) => renderItem(item))}
      </div>
    </div>
  );
};

export default Teil1;
