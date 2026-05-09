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
  // Parse ausgangsmeinung, e.g. "Tania: 'Früher traf man sich...'"
  let speakerName = 'Gast';
  let commentText = topic.ausgangsmeinung || '';
  const match = commentText.match(/^([^:]+):\s*['"]?(.+?)['"]?$/);
  if (match) {
    speakerName = match[1].trim();
    commentText = match[2].trim();
  }

  return (
    <div className="space-y-12">
      <div className="bg-white p-8 space-y-8 border border-gray-200">
        <div className="flex items-end justify-between border-b-2 border-gray-900 pb-4">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{teil.label}</h2>
          <span className="text-sm text-gray-600 font-serif">Arbeitszeit: {teil.arbeitszeit}</span>
        </div>

        <div className="space-y-8 font-serif">
           <div className="space-y-1">
             <p className="text-base text-gray-800 italic leading-relaxed">
               Sie haben im Fernsehen eine Diskussionssendung zum Thema „{topic.title}“ gesehen.
             </p>
             <p className="text-base text-gray-800 italic leading-relaxed">
               Im Online-Gästebuch der Sendung finden Sie folgende Meinung:
             </p>
           </div>

           {/* Gästebuch UI */}
           <div className="border border-gray-400 bg-gray-100 font-sans max-w-2xl shadow-sm">
             <div className="bg-gray-300 px-4 py-2 border-b border-gray-400 flex items-center">
               <span className="font-bold text-gray-800 text-lg">Gästebuch</span>
             </div>
             <div className="p-4 space-y-3 bg-white">
               <div className="flex items-start gap-2 border-b border-gray-200 pb-2">
                 <span className="text-gray-400 mt-1">▶</span>
                 <div>
                   <p className="text-sm font-bold text-gray-700">15.01. 16:55 Uhr</p>
                   <p className="font-bold text-gray-900 mt-1">{speakerName}</p>
                 </div>
                 <div className="ml-4 pl-4 border-l border-gray-200 text-base text-gray-800 leading-relaxed font-serif">
                   {commentText}
                 </div>
               </div>
               <div className="flex items-center gap-2 text-gray-400 pt-1">
                 <span>▶</span>
                 <span className="text-sm font-bold">15.01. 17:02 Uhr</span>
               </div>
             </div>
           </div>

           <div className="pt-4 text-base text-gray-800 space-y-3">
             <p className="font-bold">Was ist Ihre Meinung dazu? Schreiben Sie einen Forumsbeitrag (ca. 80 Wörter).</p>
             <p className="text-red-600 text-sm font-bold bg-red-50 p-3 border border-red-100">
               ACHTUNG: Dies ist ein Forumsbeitrag. Benutzen Sie KEINE Anrede (wie "Liebe/r") und KEINE Grußformel am Ende. Beginnen Sie direkt mit Ihrer Meinung!
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
                (wordCount > 0 && (wordCount < 70 || wordCount > 100)) ? "bg-red-50 border-red-200 text-red-700" :
                wordCount >= (teil.minWords || 80) ? "bg-green-50 border-green-200 text-green-700" : 
                "bg-gray-100 border-gray-200 text-gray-400"
              )}>
                {wordCount} Wörter
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">/ min. {teil.minWords || 80}</span>
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
