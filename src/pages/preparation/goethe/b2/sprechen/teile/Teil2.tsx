import React from 'react';
import { Info, MessageSquare } from 'lucide-react';

interface Teil2Props {
  teil: any;
  topic: any;
}

const Teil2: React.FC<Teil2Props> = ({ teil, topic }) => {
  return (
    <div className="space-y-4">
      {/* Header Info Box - Compact */}
      <div className="bg-[#ffcc00] p-2.5 sm:p-3 rounded-xl flex items-start gap-2.5 border border-black/5 shadow-none">
        <div className="h-7 w-7 rounded-lg bg-black/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="h-4 w-4 text-black" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[11px] sm:text-xs font-black text-black leading-tight uppercase italic truncate tracking-widest">{teil.title}</h2>
          <div className="flex items-center gap-2 mt-0.5 opacity-60">
            <span className="text-[8px] font-bold text-black uppercase tracking-widest">{teil.pruefungsziel}</span>
            <span className="text-[8px] font-bold text-black uppercase opacity-40">•</span>
            <span className="text-[8px] font-bold text-black uppercase tracking-widest">{teil.dauer}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-[20px] p-4 sm:p-6 space-y-6 relative overflow-hidden shadow-none">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#ffcc00]/20" />
        
        {/* Images Section - Matches B2 Screenshot Style */}
        {/* <div className="grid grid-cols-2 gap-2">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/5 relative group">
                <img 
                    src="/home/zackweebdev/.gemini/antigravity/brain/ebddafb0-0830-4c18-b499-12c82031c643/lecture_hall_b2_1778038995690.png" 
                    alt="Lecture Hall" 
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/5 relative group">
                <img 
                    src="/home/zackweebdev/.gemini/antigravity/brain/ebddafb0-0830-4c18-b499-12c82031c643/writing_hand_b2_1778039051102.png" 
                    alt="Writing Hand" 
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
        </div> */}

        <div className="space-y-1.5 text-center">
          <span className="text-[7px] font-black text-[#ffcc00] uppercase tracking-[0.4em] opacity-60">DISKUSSIONSTHEMA</span>
          <h3 className="text-sm sm:text-base font-black text-white italic uppercase tracking-tight leading-tight">
            {topic.title}
          </h3>
          {topic.titleAr && (
            <p className="text-xs sm:text-sm font-black text-[#ffcc00] uppercase tracking-tight" dir="rtl">
              {topic.titleAr}
            </p>
          )}
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4 sm:p-5 border border-white/5 space-y-3 shadow-none">
           <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Debattierclub Frage:</p>
           {topic.frage && (
             <div className="relative py-2">
                <div className="absolute -left-2 top-0 text-3xl text-[#ffcc00]/20 font-serif">"</div>
                <p className="text-sm sm:text-base font-black text-white uppercase italic leading-tight px-2">
                  {topic.frage}
                </p>
                <div className="absolute -right-2 bottom-0 text-3xl text-[#ffcc00]/20 font-serif">"</div>
             </div>
           )}
        </div>

        {/* Stichpunkte Section */}
        {topic.stichpunkte && (
            <div className="space-y-3">
                <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Stichpunkte zur Hilfe:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topic.stichpunkte.map((point: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#ffcc00] shrink-0" />
                            <span className="text-[10px] sm:text-xs text-white/80 font-medium">{point}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex items-start gap-3 p-3.5 sm:p-4 border border-[#ffcc00]/10 rounded-xl bg-[#ffcc00]/5 italic shadow-none">
          <div className="h-6 w-6 rounded-lg bg-[#ffcc00]/20 flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare className="h-3 w-3 text-[#ffcc00]" />
          </div>
          <div className="space-y-1">
            <p className="text-[7px] font-black text-[#ffcc00] uppercase tracking-widest">Aufgabe:</p>
            <p className="text-[10px] sm:text-[11px] text-white/60 leading-relaxed font-medium">
              Diskutieren Sie mit Ihrem Partner. Tauschen Sie Standpunkte und Argumente aus und versuchen Sie am Ende, eine Einigung zu finden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teil2;
