import React from 'react';
import { cn } from '@/lib/utils';
import { Globe, MessageCircle } from 'lucide-react';

interface Teil2Props {
  teil: any;
  topic: any;
  userText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  wordCount: number;
}

const Teil2: React.FC<Teil2Props> = ({ teil, topic, userText, onTextChange, wordCount }) => {
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

          {/* Forum Context Mockup - Dark Mode */}
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
             <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                   </div>
                   <div className="h-6 w-48 bg-white/5 rounded-lg flex items-center px-3 ml-2">
                      <Globe className="h-3 w-3 text-white/20 mr-2" />
                      <span className="text-[10px] font-black text-white/20 uppercase">gaestebuch-diskussion.de</span>
                   </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-[#ffcc00]" />
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-white/90 italic">
                      Thema: {topic.title}
                   </h3>
                   <p className="text-sm text-white/40 font-medium italic">Sie haben im Fernsehen eine Diskussionssendung zum Thema "{topic.title}" gesehen. Im Gästebuch der Sendung finden Sie folgende Meinung:</p>
                </div>
                <div className="bg-white/[0.03] p-8 rounded-2xl border-l-4 border-[#ffcc00] relative">
                   <MessageCircle className="absolute top-4 right-4 h-5 w-5 text-white/10" />
                   <p className="text-lg font-bold leading-relaxed text-[#ffcc00]/90">
                      {topic.ausgangsmeinung}
                   </p>
                </div>
             </div>
          </div>

          {/* Instructions */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-emerald-400">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
               <p className="text-base font-black uppercase text-[10px]">Ihre Aufgabe</p>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold leading-relaxed">Schreiben Sie nun Ihre Meinung (circa {teil.minWords} Wörter).</p>
              <ul className="space-y-2 text-white/60 text-sm font-medium pl-2">
                 <li>• Sagen Sie Ihre Meinung zu diesem Thema.</li>
                 <li>• Begründen Sie, warum Sie dafür oder dagegen sind.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Writing Area */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-black text-[#ffcc00] uppercase flex items-center gap-2">
              <span className="h-1 w-4 bg-[#ffcc00] rounded-full" />
              Ihre Meinung
           </h3>
           <div className="text-[10px] font-black text-white/20 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
              Gästebuch-Beitrag verfassen
           </div>
        </div>
        <textarea
          value={userText}
          onChange={onTextChange}
          placeholder="Ich bin der Meinung, dass ... weil ..."
          className="w-full h-80 bg-[#151515] border border-white/10 rounded-3xl p-8 text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#ffcc00]/30 transition-all placeholder:text-white/5 resize-none custom-scrollbar"
          dir="ltr"
        />
      </div>
    </div>
  );
};

export default Teil2;
