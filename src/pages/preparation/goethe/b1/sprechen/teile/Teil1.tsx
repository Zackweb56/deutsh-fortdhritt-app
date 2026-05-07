import React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface Teil1Props {
  teil: any;
  topic: any;
  hasStarted: boolean;
}

const Teil1: React.FC<Teil1Props> = ({ teil, topic, hasStarted }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Exam Paper Header */}
      <div className="bg-[#1a1a1a] border border-white/10 p-4 flex justify-between items-center text-white font-sans">
        <div className="flex flex-col">
          <span className="text-sm font-black uppercase leading-none">Zertifikat B1</span>
          <span className="text-xl font-black uppercase leading-none">Sprechen</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase">Modellsatz</span>
          <span className="text-[10px] font-bold uppercase">Kandidatenblätter</span>
        </div>
      </div>

      {/* Main Task Card */}
      <div className="bg-[#111] text-white p-8 sm:p-12 rounded-sm border border-white/10 relative overflow-hidden">
        <div className="relative z-10 space-y-10">
          {/* Title & Duration */}
          <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
            <h2 className="text-xl font-black flex items-center gap-4">
               {teil.label} <span className="text-2xl font-black text-[#ffcc00]">|</span> {teil.title}
            </h2>
            <span className="text-sm font-medium italic text-white/40">Dauer: {teil.dauer}</span>
          </div>

          {/* Instructions Block */}
          <div className="space-y-4 text-lg leading-relaxed italic font-medium text-white/70 pr-4">
            <p>{topic.situation}</p>
            <div className="space-y-2 pt-4 not-italic font-bold text-base text-white/90">
               <p>Sprechen Sie über die Punkte unten, machen Sie Vorschläge und reagieren Sie auf die Vorschläge Ihres Gesprächspartners/Ihrer Gesprächspartnerin.</p>
               <p>Planen und entscheiden Sie gemeinsam, was Sie tun möchten.</p>
            </div>
          </div>

          {/* Main Topic Header */}
          <div className="pt-8 space-y-8 pl-0 sm:pl-12">
            <h3 className="text-3xl font-black border-b-2 border-[#ffcc00] inline-block pb-1 text-[#ffcc00]">
              {topic.title}
            </h3>

            {/* Task Points */}
            <ul className="space-y-4 list-none">
              {topic.punkte.map((punkt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4">
                  <span className="text-3xl font-light mt-[-4px] text-[#ffcc00]/40">—</span>
                  <div className="space-y-1">
                     <span className="text-2xl font-medium italic">{punkt}</span>
                     {/* Sub-points hints (simulated for realism) */}
                     {idx === 0 && <span className="block text-xl font-light text-white/30 italic">(Tag, Uhrzeit?)</span>}
                     {idx === 3 && <span className="block text-xl font-light text-white/30 italic">(vom Krankenhaus abholen, einkaufen, ...)</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Context Alert */}
      {!hasStarted && (
        <div className="bg-[#ffcc00]/5 border border-[#ffcc00]/10 p-6 rounded-[32px] flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-[#ffcc00]/10 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-[#ffcc00]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase">Wichtiger Hinweis</h4>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
              In diesem Teil simulieren wir ein Gespräch mit Ihrem Partner (Kandidat B). Sobald Sie auf "Simulation Starten" klicken, wird der Partner das Gespräch eröffnen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teil1;
