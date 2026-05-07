import React from 'react';
import { cn } from '@/lib/utils';
import { Mail } from 'lucide-react';

interface Teil3Props {
  teil: any;
  topic: any;
  userText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  wordCount: number;
}

const Teil3: React.FC<Teil3Props> = ({ teil, topic, userText, onTextChange, wordCount }) => {
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

          {/* Formal Email Context - Dark Mode */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="h-12 w-12 rounded-xl bg-[#ffcc00]/10 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-[#ffcc00]" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-white/40 uppercase">Formelle Nachricht</h4>
                   <p className="text-lg font-bold leading-tight">{topic.title}</p>
                </div>
            </div>

            <p className="text-lg leading-relaxed italic font-medium text-white/80 border-l-2 border-[#ffcc00] pl-6 py-2">
              {topic.situation}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-6 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 text-emerald-400">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
               <p className="text-base font-black uppercase text-[10px]">Anforderungen</p>
            </div>
            <div className="space-y-3">
              <p className="text-base font-bold leading-relaxed">Schreiben Sie eine Entschuldigung (circa {teil.minWords} Wörter).</p>
              <p className="text-sm font-medium text-white/60">• Schreiben Sie höflich und begründen Sie Ihre Situation.</p>
              <p className="text-sm font-medium text-white/60">• Achten Sie auf den Textaufbau (Anrede, Einleitung, Grund, Schluss).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Writing Area */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-black text-[#ffcc00] uppercase flex items-center gap-2">
              <span className="h-1 w-4 bg-[#ffcc00] rounded-full" />
              Ihre E-Mail
           </h3>
           <div className="text-[10px] font-black text-white/20 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
              Sehr geehrte/r Frau/Herr ...
           </div>
        </div>
        <textarea
          value={userText}
          onChange={onTextChange}
          placeholder="Sehr geehrte/r Frau/Herr ..., ich schreibe Ihnen, weil ..."
          className="w-full h-64 bg-[#151515] border border-white/10 rounded-3xl p-8 text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#ffcc00]/30 transition-all placeholder:text-white/5 resize-none custom-scrollbar"
          dir="ltr"
        />
      </div>
    </div>
  );
};

export default Teil3;
