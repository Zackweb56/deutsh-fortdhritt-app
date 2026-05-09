import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, User } from 'lucide-react';

interface Teil1Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil1: React.FC<Teil1Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const persons = topic.personen || [];
  const items = topic.items || [];
  const beispiel = topic.beispiel;

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
            {['a', 'b', 'c', 'd'].map((option) => {
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
    <div className="flex h-full animate-in fade-in duration-500 overflow-hidden bg-white">
      {/* Left: Statements (People) */}
      <div className="flex-1 overflow-y-auto p-16 bg-white border-r border-gray-200 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-12">
           <div className="border-b-4 border-gray-900 pb-8">
              <h2 className="text-3xl font-serif font-bold text-gray-900 leading-tight tracking-tight">
                Leseverstehen — Teil 1
              </h2>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Statements zur Diskussion</p>
           </div>
           
           <div className="space-y-10">
              {topic.personen?.map((person: any) => (
                <div key={person.id} className="space-y-4 border-l-4 border-gray-100 pl-8 py-4 bg-gray-50/50 rounded-r-sm">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center font-bold text-white text-sm">
                        {person.id.toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900 text-base">{person.name}</span>
                   </div>
                   <div className="text-[17px] leading-relaxed text-gray-700 font-serif italic">
                      "{person.text}"
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right: Questions Area */}
      <div className="w-[480px] overflow-y-auto bg-gray-50/50 p-10 custom-scrollbar shrink-0 border-l border-gray-200">
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-gray-300 pb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Fragen</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Ordnen Sie die Aussagen zu (a-d)</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-xs">
                01
              </div>
           </div>
           
           <div className="space-y-6">
              {topic.beispiel && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Beispiel</span>
                  {renderItem(topic.beispiel, true)}
                </div>
              )}
              {topic.items?.map((item: any) => renderItem(item))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Teil1;
