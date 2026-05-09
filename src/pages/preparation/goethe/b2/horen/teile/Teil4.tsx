import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Teil4Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil4: React.FC<Teil4Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const renderItem = (item: any) => {
    const isCorrect = answers[item.id] === item.correct;

    return (
      <div 
        key={item.id} 
        className={cn(
          "relative p-8 bg-white border border-gray-200 rounded-sm transition-all shadow-sm",
          showResults && (isCorrect ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200")
        )}
      >
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <span className="font-bold text-gray-400 text-sm pt-0.5">{item.id}.</span>
            <p className="text-[16px] text-gray-800 leading-snug font-bold flex-1">{item.text}</p>
          </div>
          
          <div className="flex flex-col gap-3 pl-8">
            {item.options.map((opt: any) => {
              const isSelected = answers[item.id] === opt.value;
              const isActuallyCorrect = opt.value === item.correct;

              return (
                <div
                  key={opt.value}
                  className={cn(
                    "goethe-option",
                    isSelected && "active",
                    showResults && isActuallyCorrect && !isSelected && "border-green-600 bg-green-50"
                  )}
                  onClick={() => !showResults && onAnswerChange(item.id, opt.value)}
                >
                  <div className={cn("goethe-radio", isSelected && "active")} />
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-gray-400 uppercase w-4">{opt.value}</span>
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showResults && (
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
           Hörverstehen — Teil 4
         </h2>
         <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Vortrag — Multiple Choice</p>
      </div>

      <div className="space-y-8">
        {topic.items?.map((item: any) => renderItem(item))}
      </div>
    </div>
  );
};

export default Teil4;
