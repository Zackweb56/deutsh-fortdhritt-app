import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, UserCheck, Users } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';

interface Teil4Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (itemId: string, value: string) => void;
}

const Teil4: React.FC<Teil4Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const { items, personen, transkript, audio } = topic;
  const maxPlays = 2; // Fixed for Teil 4

  const renderTask = (item: any) => {
    const selectedValue = answers[item.id];
    const isCorrect = selectedValue === item.correct;

    return (
      <div 
        key={item.id} 
        className={cn(
          "p-5 rounded-2xl border transition-all duration-300 relative",
          showResults 
            ? (isCorrect ? "border-emerald-500/50 bg-emerald-500/5" : "border-red-500/50 bg-red-500/5") 
            : "bg-[#111] border-white/5 hover:border-white/10"
        )}
      >
        <div className="flex gap-4 mb-5">
           <span className="font-black text-[#ffcc00] text-sm shrink-0 mt-0.5">{item.id}</span>
           <p className="text-sm font-bold text-white/90 leading-relaxed italic">"{item.text}"</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['A', 'B', 'C'].map((opt) => {
            const isSelected = selectedValue === opt;
            const isOptionCorrect = item.correct === opt;
            const personName = personen?.[opt] || opt;

            return (
              <button
                key={opt}
                disabled={showResults}
                onClick={() => onAnswerChange(item.id, opt)}
                className={cn(
                  "py-3 rounded-xl font-black uppercase transition-all border-2 text-xs flex flex-col items-center gap-1",
                  isSelected 
                    ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-md shadow-[#ffcc00]/10" 
                    : "bg-transparent border-white/5 text-white/40 hover:border-white/20 hover:text-white",
                  showResults && isOptionCorrect && !isSelected && "border-emerald-500 text-emerald-500"
                )}
              >
                <span>{opt}</span>
                <span className="text-[8px] opacity-60 truncate w-full px-1">{personName.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {showResults && (
          <div className="absolute right-4 top-4">
            {isCorrect ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Discussion Info */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
           <div className="h-12 w-12 rounded-2xl bg-[#ffcc00]/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#ffcc00]" />
           </div>
           <div className="flex-1">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{topic.title}</h2>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Radiodiskussion • 3 Personen • 2x Hören</p>
           </div>
        </div>

        <div className="mb-8 max-w-md mx-auto">
           {audio && (
             <AudioPlayer 
               src={`/media/audio/goethe/horen/b1/${audio}`} 
               maxPlays={maxPlays} 
             />
           )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {personen && Object.entries(personen).map(([key, name]: [string, any]) => (
             <div key={key} className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[#ffcc00] font-black">
                   {key}
                </div>
                <div className="flex flex-col min-w-0">
                   <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Person {key}</span>
                   <span className="text-xs font-bold text-white/90 truncate">{name}</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Wer sagt was?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {items.map((item: any) => renderTask(item))}
        </div>
      </div>

      {/* Transkript */}
      {showResults && transkript && (
        <div className="mt-10 pt-10 border-t border-white/10 animate-in fade-in duration-700">
          <div className="flex items-center gap-3 mb-6">
             <UserCheck className="h-5 w-5 text-[#ffcc00]" />
             <h3 className="text-lg font-black text-white uppercase tracking-tight">Transkript der Diskussion</h3>
          </div>
          <div className="prose prose-invert max-w-none">
             <p className="text-sm text-white/50 leading-relaxed italic font-medium whitespace-pre-line bg-black/40 p-8 rounded-3xl border border-white/5">
                {transkript}
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teil4;
