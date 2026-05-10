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
            {isBeispiel ? (
              <span className="inline-flex items-center justify-center bg-gray-200 border border-gray-400 text-gray-600 font-bold text-[10px] w-6 h-5 mx-1">
                0
              </span>
            ) : (
              <button
                disabled={showResults}
                onClick={() => {
                  // Handled by select
                }}
                className="relative"
              >
                <select
                  disabled={showResults}
                  value={selectedValue || ""}
                  onChange={(e) => onAnswerChange(gapId, e.target.value)}
                  className={cn(
                    "appearance-none bg-white border rounded-none px-2 py-0.5 text-[10px] font-bold min-w-[3rem] text-center cursor-pointer transition-none",
                    !selectedValue ? "border-blue-400 text-blue-600" : "border-gray-800 text-gray-800",
                    showResults && (isCorrect ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50")
                  )}
                  title={selectedValue ? selectedSentenceText : "Lücke wählen"}
                >
                  <option value="" disabled>{gapId}</option>
                  {sentences.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.id.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown className="h-2.5 w-2.5 absolute right-0.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </button>
            )}
            
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
    <div className="flex flex-col lg:flex-row h-full bg-[#f1f5f9]">
      {/* ── Left: Reading Text ── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white border-b lg:border-b-0 lg:border-r border-gray-300">
        <div className="max-w-2xl mx-auto space-y-5">
           <div className="border-b-2 border-gray-900 pb-3">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Leseverstehen — Teil 2</p>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight mt-0.5">{topic.title}</h2>
           </div>
           
           <div className="bg-gray-50 border border-gray-200 p-6 space-y-3">
             <div className="text-xs text-gray-800 leading-relaxed font-serif whitespace-pre-line italic">
               {renderTextWithGaps()}
             </div>
           </div>
        </div>
      </div>

      {/* ── Right: Sentences selection Area ── */}
      <div className="w-full lg:w-[420px] overflow-y-auto bg-gray-50 p-5 md:p-8 shrink-0 border-l border-gray-300">
        <div className="space-y-5">
           <div className="flex items-center justify-between border-b border-gray-300 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Sätze zur Auswahl</h3>
                <p className="text-[8px] text-gray-400 font-bold uppercase">Ordnen Sie die Sätze zu</p>
              </div>
           </div>

           <div className="bg-gray-100 border border-gray-300 p-2 flex items-center justify-center gap-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Beispiel: 0</span>
              <span className="text-[10px] font-bold text-gray-800 uppercase">Lösung: {beispiel.correct}</span>
           </div>
           
           <div className="grid grid-cols-1 gap-2.5">
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
                     "flex items-start gap-3 p-3 bg-white border transition-none",
                     usedInGap ? "bg-blue-50 border-blue-300" : "border-gray-300"
                   )}
                 >
                   <div className={cn(
                     "h-5 w-5 flex items-center justify-center font-bold text-[9px] shrink-0 uppercase border",
                     usedInGap ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-100 border-gray-300 text-gray-500"
                   )}>
                     {sentence.id}
                   </div>
                   <div className="flex-1 space-y-1">
                      <p className="text-[11px] text-gray-800 leading-snug font-medium">{sentence.text}</p>
                      {usedInGap && (
                        <span className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">
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
