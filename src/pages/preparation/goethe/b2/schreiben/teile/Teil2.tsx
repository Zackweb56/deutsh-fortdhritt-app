import React from 'react';
import { cn } from '@/lib/utils';

interface Teil2Props {
  teil: any;
  topic: any;
  userText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  wordCount: number;
}

const Teil2: React.FC<Teil2Props> = ({ teil, topic, userText, onTextChange, wordCount }) => {
  return (
    <div className="space-y-12">
      <div className="bg-white p-8 space-y-8 border border-gray-200">
        <div className="flex items-end justify-between border-b-2 border-gray-900 pb-4">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{teil.label}</h2>
          <span className="text-sm text-gray-600 font-serif">vorgeschlagene Arbeitszeit: {teil.arbeitszeit}</span>
        </div>

        <div className="space-y-6 font-serif">
           <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
             {topic.situation}
           </p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 pb-4">
             {topic.aufgabenpunkte?.map((point: string, idx: number) => (
               <div key={idx} className="border border-gray-300 p-4 bg-white shadow-sm flex items-center justify-center text-center min-h-[80px]">
                 <span className="text-gray-800 text-sm leading-snug">{point}</span>
               </div>
             ))}
           </div>

           <div className="pt-2 space-y-3 text-base text-gray-800 text-sm">
             <p>
               Überlegen Sie sich eine passende Reihenfolge für die Inhaltspunkte. Bei der Bewertung wird darauf geachtet, wie genau die Inhaltspunkte bearbeitet sind, wie korrekt der Text ist und wie gut die Sätze und Abschnitte sprachlich miteinander verknüpft sind. Vergessen Sie nicht Anrede und Gruß. Schreiben Sie circa <strong>100 Wörter</strong>.
             </p>
           </div>
        </div>
      </div>

      {/* Writing Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
           <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Antwortblatt</h3>
           <div className="flex items-center gap-2">
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 border",
                (wordCount > 0 && wordCount < 90) ? "bg-red-50 border-red-200 text-red-700" :
                wordCount >= (teil.minWords || 100) ? "bg-green-50 border-green-200 text-green-700" : 
                "bg-gray-100 border-gray-200 text-gray-400"
              )}>
                {wordCount} Wörter
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">/ min. {teil.minWords || 100}</span>
           </div>
        </div>
        
        <textarea
          value={userText}
          onChange={onTextChange}
          placeholder="Schreiben Sie hier..."
          className="w-full h-[400px] p-8 bg-white border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm font-serif leading-relaxed text-gray-800 transition-none resize-none placeholder:text-gray-200"
        />
      </div>
    </div>
  );
};

export default Teil2;
