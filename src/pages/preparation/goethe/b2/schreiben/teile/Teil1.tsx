import React from 'react';
import { cn } from '@/lib/utils';
import { PenTool, ImageIcon, ListChecks } from 'lucide-react';

interface Teil1Props {
  teil: any;
  topic: any;
  userText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  wordCount: number;
}

const Teil1: React.FC<Teil1Props> = ({ teil, topic, userText, onTextChange, wordCount }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Task Sheet */}
      <div className="bg-white border border-gray-200 shadow-sm p-12 space-y-10">
        <div className="border-b-4 border-gray-900 pb-8 flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold text-gray-900 uppercase tracking-tight">Kandidatenblatt</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Schreiben — Teil 1</p>
          </div>
          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-xs">
            01
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-gray-50/50 p-8 border border-gray-100 rounded-sm italic font-serif text-[16px] text-gray-700 leading-relaxed">
             {topic.context}
           </div>

           <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-l-4 border-gray-900 pl-4">Ihre Aufgabe</h3>
              <p className="text-[17px] font-serif text-gray-800 leading-relaxed">
                {teil.instructions}
              </p>
              <ul className="grid grid-cols-1 gap-4">
                {topic.aufgabenpunkte.map((point: string, idx: number) => (
                  <li key={idx} className="flex gap-4 items-start bg-gray-50/30 p-4 rounded-sm border border-gray-100/50">
                    <span className="h-2 w-2 rounded-full bg-gray-400 mt-2 shrink-0" />
                    <span className="text-[16px] text-gray-700 font-serif">{point}</span>
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>

      {/* Writing Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Antwortblatt</h3>
           <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                wordCount >= (teil.minWords || 150) ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
              )}>
                {wordCount} Wörter
              </span>
              <span className="text-[10px] text-gray-400 font-medium">/ min. {teil.minWords || 150}</span>
           </div>
        </div>
        
        <textarea
          value={userText}
          onChange={onTextChange}
          placeholder="Schreiben Sie hier Ihren Beitrag..."
          className="w-full h-[600px] p-12 bg-white border border-gray-200 focus:border-gray-900 focus:ring-0 rounded-sm text-[18px] font-serif leading-[1.8] text-gray-800 shadow-sm transition-all resize-none placeholder:text-gray-200"
        />
      </div>
    </div>
  );
};

export default Teil1;
