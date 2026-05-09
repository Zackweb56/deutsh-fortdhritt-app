import React from 'react';
import { cn } from '@/lib/utils';

interface Teil3Props {
  teil: any;
  topic: any;
  userText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  wordCount: number;
}

const Teil3: React.FC<Teil3Props> = ({ teil, topic, userText, onTextChange, wordCount }) => {
  return (
    <div className="space-y-12">
      <div className="bg-white p-8 space-y-8 border border-gray-200">
        <div className="flex items-end justify-between border-b-2 border-gray-900 pb-4">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{teil.label}</h2>
          <span className="text-sm text-gray-600 font-serif">Arbeitszeit: {teil.arbeitszeit}</span>
        </div>

        <div className="space-y-6 font-serif">
           <p className="text-base text-gray-800 italic leading-relaxed whitespace-pre-wrap">
             {topic.situation}
           </p>

           <div className="text-base text-gray-800 leading-relaxed">
             <p>Schreiben Sie an {topic.situation?.match(/Ihre Kursleiterin, ([^,]+),/)?.[1] || 'die entsprechende Person'}. Entschuldigen Sie sich höflich und berichten Sie, warum Sie nicht kommen können.</p>
           </div>

           <div className="space-y-2 pl-2">
             {(topic.aufgabenpunkte || ["Entschuldigen Sie sich", "Erklären Sie den Grund", "Bitten Sie um einen neuen Termin"]).map((point: string, idx: number) => (
               <label key={idx} className="text-base text-gray-800 flex gap-3 items-start cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded">
                 <input type="checkbox" className="mt-1.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                 <span>{point}</span>
               </label>
             ))}
           </div>

           <div className="pt-4 space-y-3 text-base text-gray-800">
             <p className="font-bold">Schreiben Sie eine E-Mail ({teil.woerter}).</p>
             <p className="text-blue-700 text-sm font-bold bg-blue-50 p-3 border border-blue-100">
               WICHTIG: Verwenden Sie eine formelle Anrede ("Sehr geehrte/r...") und eine formelle Grußformel ("Mit freundlichen Grüßen").
             </p>
             <p className="text-red-600 text-sm font-bold bg-red-50 p-3 border border-red-100">
               ACHTUNG: Nur circa 40 Wörter! Sehr kurz und präzise schreiben.
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
                (wordCount > 0 && (wordCount < 30 || wordCount > 60)) ? "bg-red-50 border-red-200 text-red-700" :
                (wordCount >= 30 && wordCount <= 34) || (wordCount >= 51 && wordCount <= 60) ? "bg-yellow-50 border-yellow-200 text-yellow-700" :
                (wordCount >= 35 && wordCount <= 50) ? "bg-green-50 border-green-200 text-green-700" :
                "bg-gray-100 border-gray-200 text-gray-400"
              )}>
                {wordCount} Wörter
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">/ min. {teil.minWords || 40}</span>
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

export default Teil3;
