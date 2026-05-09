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
        const selectedSentenceText = sentences.find((s: any) => s.id === selectedValue)?.text;

        return (
          <span key={index} className="inline-block mx-1 align-middle relative group">
            <button
              disabled={isBeispiel || showResults}
              onClick={() => {
                // Simplified: Open a native-like selection or custom modal
                // For this implementation, we'll use a select but styled to look like an inline gap
              }}
              className="relative"
            >
              <select
                disabled={isBeispiel || showResults}
                value={selectedValue || ""}
                onChange={(e) => onAnswerChange(gapId, e.target.value)}
                className={cn(
                  "appearance-none bg-white border-2 rounded-sm px-3 py-1 text-sm font-bold min-w-[4rem] text-center cursor-pointer transition-all",
                  !selectedValue ? "border-blue-400 text-blue-600 animate-pulse" : "border-gray-800 text-gray-800",
                  showResults && !isBeispiel && (isCorrect ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"),
                  isBeispiel && "border-gray-200 opacity-60 text-gray-400 cursor-default"
                )}
                title={selectedValue ? selectedSentenceText : "Lücke wählen"}
              >
                <option value="" disabled>{gapId}</option>
                {sentences.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.id.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="h-3 w-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </button>
            
            {showResults && !isBeispiel && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2">
                {isCorrect ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
              </span>
            )}
            {showResults && !isBeispiel && !isCorrect && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-green-600 uppercase whitespace-nowrap bg-white px-1 border border-green-100 shadow-sm">
                Soll: {correctValue?.toUpperCase()}
              </span>
            )}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex h-full animate-in fade-in duration-500 overflow-hidden bg-white">
      {/* Left: Reading Text */}
      <div className="flex-1 overflow-y-auto p-16 bg-white border-r border-gray-200 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-10">
           <div className="border-b-4 border-gray-900 pb-8">
              <h2 className="text-4xl font-serif font-bold text-gray-900 leading-tight tracking-tight">
                {topic.title}
              </h2>
           </div>
           <div className="text-[18px] leading-[2] text-gray-800 whitespace-pre-line font-serif italic selection:bg-yellow-200">
             {renderTextWithGaps()}
           </div>
        </div>
      </div>

      {/* Right: Sentences selection Area */}
      <div className="w-[520px] overflow-y-auto bg-gray-50/50 p-10 custom-scrollbar shrink-0 border-l border-gray-200">
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-gray-300 pb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Sätze zur Auswahl</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Leseverstehen — Teil 2</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
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
                     "flex items-start gap-5 p-5 bg-white border rounded-sm transition-all shadow-sm",
                     usedInGap ? "border-blue-400 bg-blue-50/20" : "border-gray-200"
                   )}
                 >
                   <div className={cn(
                     "h-10 w-10 rounded-sm flex items-center justify-center font-bold text-sm shrink-0 uppercase border-2",
                     usedInGap ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-100 border-gray-200 text-gray-400"
                   )}>
                     {sentence.id}
                   </div>
                   <div className="flex-1 space-y-2">
                      <p className="text-[15px] text-gray-800 leading-relaxed font-medium">{sentence.text}</p>
                      {usedInGap && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                          Eingesetzt in Lücke {usedInGap}
                        </span>
                      )}
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Teil2;
