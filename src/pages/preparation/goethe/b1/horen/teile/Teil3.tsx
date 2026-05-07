import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Users } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';

interface Teil3Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (itemId: string, value: string) => void;
}

const Teil3: React.FC<Teil3Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const { items, transkript, audio } = topic;
  const maxPlays = 1; // Fixed for Teil 3

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
           <p className="text-sm font-bold text-white/90 leading-relaxed">{item.text}</p>
        </div>

        <div className="flex gap-2">
          {['Richtig', 'Falsch'].map((option) => (
            <button
              key={option}
              disabled={showResults}
              onClick={() => onAnswerChange(item.id, option)}
              className={cn(
                "flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-xs border-2 transition-all",
                selectedValue === option 
                  ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/10" 
                  : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white",
                showResults && item.correct === option && selectedValue !== option && "border-emerald-500 text-emerald-500"
              )}
            >
              {option}
            </button>
          ))}
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
      {/* Central Audio Player Section */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-50" />
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">{topic.title}</h2>
          <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">Alltagsgespräch • 1x Hören</p>
        </div>

        <div className="max-w-md mx-auto">
           {audio && (
             <AudioPlayer 
               src={`/media/audio/goethe/horen/b1/${audio}`} 
               maxPlays={maxPlays} 
             />
           )}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-[#ffcc00] pl-3">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Aufgaben 16–22</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {items.map((item: any) => renderTask(item))}
        </div>
      </div>

      {/* Transkript */}
      {showResults && transkript && (
        <div className="mt-10 pt-10 border-t border-white/10 animate-in fade-in duration-700">
          <div className="flex items-center gap-3 mb-6">
             <Users className="h-5 w-5 text-[#ffcc00]" />
             <h3 className="text-lg font-black text-white uppercase tracking-tight">Transkript des Gesprächs</h3>
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

export default Teil3;
