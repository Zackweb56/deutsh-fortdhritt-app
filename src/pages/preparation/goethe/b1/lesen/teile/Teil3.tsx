import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Teil3Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil3: React.FC<Teil3Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const validOptions = [...topic.ads.map((ad: any) => ad.id.toUpperCase()), '0'];

  const handleInputChange = (id: string, val: string) => {
    const upperVal = val.toUpperCase();
    if (upperVal === '' || validOptions.includes(upperVal)) {
      onAnswerChange(id, upperVal);
    }
  };

  const renderSituation = (situation: any, isBeispiel = false) => {
    const isCorrect = answers[situation.id] === situation.correct;
    const value = isBeispiel ? situation.correct : answers[situation.id] || '';

    return (
      <div 
        key={situation.id} 
        className={cn(
          "flex items-center justify-between p-3 bg-white border border-gray-300 mb-2 transition-none",
          isBeispiel ? "bg-gray-50 opacity-60" : "",
          showResults && !isBeispiel && (isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")
        )}
      >
        <div className="flex gap-3 pr-4 flex-1">
          <span className="font-bold text-gray-500 text-[10px] mt-0.5 w-5">{situation.id}.</span>
          <p className="text-[11px] text-gray-900 font-medium leading-normal">{situation.text}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <input
              type="text"
              maxLength={1}
              disabled={isBeispiel || showResults}
              value={value}
              onChange={(e) => handleInputChange(situation.id, e.target.value)}
              className={cn(
                "w-9 h-9 bg-white border border-gray-400 font-bold text-center text-xs uppercase outline-none focus:border-gray-900 focus:bg-gray-50",
                !value && !isBeispiel && "border-dashed",
                isBeispiel && "bg-transparent border-gray-200 text-gray-400"
              )}
            />
          </div>

          {showResults && !isBeispiel && (
            <div className="flex flex-col items-center justify-center w-5">
              {isCorrect ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <div className="flex flex-col items-center">
                  <X className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-[8px] font-bold text-green-600 uppercase tracking-tighter">{situation.correct}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-[#e2e8f0]">
      {/* Left: Ads (Cards) */}
      <div className="flex-1 overflow-y-auto p-10 bg-white border-r border-gray-300">
        <div className="max-w-3xl mx-auto space-y-6">
           <div className="bg-[#f8fafc] border border-gray-200 p-6 mb-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Leseverstehen — Teil 3</h3>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight">
                Anzeigen zur Auswahl
              </h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topic.ads?.map((ad: any) => (
                <div 
                  key={ad.id}
                  className={cn(
                    "bg-white p-4 border border-gray-300 relative flex flex-col min-h-[120px] transition-none",
                    ad.isBeispiel ? "opacity-50 grayscale" : ""
                  )}
                >
                  <div className="absolute top-0 right-0 bg-gray-900 text-white font-bold px-2 py-1 text-[10px] uppercase">
                    {ad.id}
                  </div>
                  
                  <h4 className="text-[11px] font-bold text-gray-900 leading-tight mb-2 pr-6 uppercase tracking-tight">
                    {ad.title}
                  </h4>
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    {ad.content}
                  </p>
                </div>
              ))}
              
              <div className="bg-gray-100 p-4 border border-dashed border-gray-300 flex items-center justify-center text-center">
                 <div className="space-y-1">
                   <span className="text-xl font-bold text-gray-400">0</span>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Keine Anzeige</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Right: Situations */}
      <div className="w-[440px] overflow-y-auto bg-[#f1f5f9] p-8 shrink-0 border-l border-gray-300">
        <div className="space-y-6">
           <div className="border-b border-gray-300 pb-3 mb-2">
              <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Situationen</h3>
           </div>

           {topic.context && (
             <div className="bg-white border border-gray-300 p-4 mb-4">
               <p className="text-[11px] text-gray-600 leading-relaxed font-serif italic">
                 {topic.context}
               </p>
             </div>
           )}
           
           <div className="space-y-1">
              {topic.beispiel && (
                <div className="mb-4">
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Beispiel</span>
                   {renderSituation(topic.beispiel, true)}
                </div>
              )}
              {topic.situations?.map((sit: any) => renderSituation(sit, false))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Teil3;
