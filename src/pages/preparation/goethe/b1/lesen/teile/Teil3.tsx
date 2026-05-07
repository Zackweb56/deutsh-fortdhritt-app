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

  const getOptions = () => {
    const opts = topic.ads.map((ad: any) => ad.id);
    opts.push('0');
    return opts;
  };

  const options = getOptions();

  const renderSituation = (situation: any, isBeispiel = false) => {
    const isCorrect = answers[situation.id] === situation.correct;
    const value = isBeispiel ? situation.correct : answers[situation.id] || '';

    return (
      <div 
        key={situation.id} 
        className={cn(
          "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all duration-300",
          isBeispiel ? "bg-white/5 border-white/10 opacity-75" : "bg-[#111] border-white/5 hover:border-white/20",
          showResults && !isBeispiel && (isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5")
        )}
      >
        <div className="flex gap-3 mb-4 sm:mb-0 pr-4">
          <span className="font-black text-[#ffcc00] text-lg w-6 shrink-0">{situation.id}</span>
          <p className="text-sm text-white/90 font-medium leading-relaxed">{situation.text}</p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 bg-black/40 p-1.5 rounded-lg border border-white/10">
          <span className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-2">Anzeige:</span>
          
          <select
            disabled={isBeispiel || showResults}
            value={value}
            onChange={(e) => onAnswerChange(situation.id, e.target.value)}
            className={cn(
              "w-16 h-10 bg-[#1a1a1a] border-2 rounded-md font-black text-center text-sm uppercase appearance-none cursor-pointer outline-none transition-all",
              !value ? "border-dashed border-white/20 text-white/50" : "border-[#ffcc00] text-[#ffcc00] shadow-[0_0_10px_rgba(255,204,0,0.2)]",
              isBeispiel && "border-white/30 text-white bg-transparent shadow-none"
            )}
            style={{ textAlignLast: 'center' }}
          >
            <option value="" disabled>-</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          {/* Validation Icons */}
          {showResults && !isBeispiel && (
            <div className="flex flex-col items-center justify-center w-6 ml-1">
              {isCorrect ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <div className="flex flex-col items-center">
                  <X className="h-5 w-5 text-red-500" />
                  <span className="text-[10px] font-black text-green-500 uppercase mt-1">{situation.correct}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Context Block */}
      {topic.context && (
        <div className="bg-[#1a1a1a] p-4 border-l-4 border-[#ffcc00] rounded-r-xl">
          <p className="text-sm text-white/80 font-medium italic">
            {topic.context}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Situations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="h-2 w-2 rounded-full bg-[#ffcc00]" />
            <h3 className="font-black text-white uppercase tracking-widest text-sm">Situationen</h3>
          </div>
          
          <div className="space-y-3">
            {topic.beispiel && renderSituation(topic.beispiel, true)}
            {topic.situations?.map((sit: any) => renderSituation(sit, false))}
          </div>
        </div>

        {/* Right Column: Ads */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <h3 className="font-black text-white uppercase tracking-widest text-sm">Anzeigen</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topic.ads?.map((ad: any) => (
              <div 
                key={ad.id}
                className={cn(
                  "bg-[#111] p-4 rounded-xl shadow-md border relative overflow-hidden flex flex-col",
                  ad.isBeispiel ? "border-white/10 opacity-60 bg-[#1a1a1a]" : "border-white/20"
                )}
              >
                {/* Ad ID Tag */}
                <div className="absolute top-0 right-0 bg-black text-white font-black px-3 py-1 rounded-bl-xl text-sm uppercase">
                  {ad.id}
                </div>
                
                {ad.isBeispiel && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                    Beispiel (vergeben)
                  </div>
                )}

                <h4 className={cn(
                  "font-black text-white leading-tight mb-3 pr-8",
                  ad.isBeispiel ? "mt-4" : ""
                )}>
                  {ad.title}
                </h4>
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                  {ad.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teil3;
