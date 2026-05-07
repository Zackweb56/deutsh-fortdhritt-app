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
          "relative p-4 rounded-xl border transition-all duration-300",
          isBeispiel ? "bg-white/5 border-white/10 opacity-75" : "bg-[#111] border-white/5 hover:border-white/20",
          showResults && !isBeispiel && (isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5")
        )}
      >
        <div className="flex gap-4 items-start">
          <span className="font-black text-[#ffcc00] text-lg w-6 shrink-0">{item.id}</span>
          <div className="flex-1 space-y-4">
            <p className="text-sm text-white/90 leading-relaxed font-medium">{item.text}</p>
            
            <div className="grid grid-cols-4 gap-2">
              {['a', 'b', 'c', 'd'].map((option) => {
                const isSelected = selectedAnswer === option;
                const isItemCorrect = item.correct === option;
                
                return (
                  <button
                    key={option}
                    disabled={isBeispiel || showResults}
                    onClick={() => onAnswerChange(item.id, option)}
                    className={cn(
                      "py-2 rounded-lg font-black uppercase transition-all border-2 text-xs",
                      isSelected 
                        ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]" 
                        : "bg-transparent border-white/10 text-white/40 hover:border-white/30 hover:text-white/70",
                      showResults && !isBeispiel && isItemCorrect && !isSelected && "border-green-500 text-green-500",
                      isBeispiel && isSelected && "bg-white/20 border-white/30 text-white shadow-none"
                    )}
                  >
                    {option.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {showResults && !isBeispiel && (
          <div className="absolute right-3 top-3">
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
      {/* Persons Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {persons.map((person: any) => (
          <div key={person.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#ffcc00]/20 flex items-center justify-center text-[#ffcc00] font-black border border-[#ffcc00]/30 uppercase">
                {person.id}
              </div>
              <h3 className="text-lg font-black text-white">{person.name}</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed italic flex-1">
              "{person.text}"
            </p>
          </div>
        ))}
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3 mb-6">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Aufgaben</h2>
        </div>
        
        <div className="space-y-4">
          {beispiel && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Beispiel</span>
              {renderItem(beispiel, true)}
            </div>
          )}
          
          <div className="space-y-4 pt-4 border-t border-white/5">
             {items.map((item: any) => renderItem(item))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teil1;
