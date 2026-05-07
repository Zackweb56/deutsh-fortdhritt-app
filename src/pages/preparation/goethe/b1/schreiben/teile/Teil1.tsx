import React from 'react';
import { cn } from '@/lib/utils';

interface Teil1Props {
  teil: any;
  topic: any;
  userText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  wordCount: number;
}

const Teil1: React.FC<Teil1Props> = ({ teil, topic, userText, onTextChange, wordCount }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Exam Paper Header - Dark Mode */}
      <div className="bg-[#1a1a1a] border border-white/10 p-4 flex justify-between items-center text-white font-sans rounded-t-xl">
        <div className="flex flex-col">
          <span className="text-sm font-black uppercase leading-none text-[#ffcc00]">Zertifikat B1</span>
          <span className="text-xl font-black uppercase leading-none">Schreiben</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase text-white/40">Modellsatz</span>
          <span className="text-[10px] font-bold uppercase text-white/40">Kandidatenblätter</span>
        </div>
      </div>

      {/* Main Task Card - Dark Mode */}
      <div className="bg-[#111] text-white p-8 sm:p-12 rounded-b-xl border border-white/10 relative overflow-hidden">
        <div className="relative z-10 space-y-10">
          {/* Title & Time */}
          <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black italic">{teil.label}</h2>
            <span className="text-sm font-medium italic text-white/40">Arbeitszeit: {teil.arbeitszeit}</span>
          </div>

          {/* Situation */}
          <div className="space-y-6">
            <p className="text-lg leading-relaxed italic font-medium text-white/80 border-l-2 border-[#ffcc00] pl-6 py-2 bg-white/[0.02]">
              {topic.situation}
            </p>
            
            {/* Task Points */}
            <ul className="space-y-4 pl-4">
              {topic.aufgabenpunkte.map((punkt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4">
                  <span className="text-black font-black mt-1.5 h-1.5 w-5 bg-[#ffcc00] shrink-0 rounded-full" />
                  <span className="text-lg font-bold">{punkt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="space-y-3 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 text-emerald-400">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
               <p className="text-base font-black uppercase text-[10px]">Anforderungen</p>
            </div>
            <p className="text-sm font-medium text-white/60">• Schreiben Sie eine E-Mail (circa {teil.minWords} Wörter).</p>
            <p className="text-sm font-medium text-white/60">• Schreiben Sie etwas zu allen drei Punkten.</p>
            <p className="text-sm font-medium text-white/60">• Achten Sie auf den Textaufbau (Anrede, Einleitung, Reihenfolge der Inhaltspunkte, Schluss).</p>
          </div>
        </div>
      </div>

      {/* Writing Area */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-black text-[#ffcc00] uppercase flex items-center gap-2">
              <span className="h-1 w-4 bg-[#ffcc00] rounded-full" />
              Ihr Text
           </h3>
           <div className="text-[10px] font-black text-white/20 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
              Anrede und Schluss nicht vergessen
           </div>
        </div>
        <textarea
          value={userText}
          onChange={onTextChange}
          placeholder="Liebe/r ..., wie geht es dir? ..."
          className="w-full h-80 bg-[#151515] border border-white/10 rounded-3xl p-8 text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#ffcc00]/30 transition-all placeholder:text-white/5 resize-none custom-scrollbar"
          dir="ltr"
        />
      </div>
    </div>
  );
};

export default Teil1;
