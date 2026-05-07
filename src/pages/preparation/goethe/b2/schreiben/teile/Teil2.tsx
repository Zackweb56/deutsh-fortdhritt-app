import React from 'react';
import { Mail, LayoutGrid, Info } from 'lucide-react';

interface Teil2Props {
  teil: any;
  topic: any;
}

const Teil2: React.FC<Teil2Props> = ({ teil, topic }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase italic">{teil.label}</h2>
            <p className="text-[10px] font-black text-white/30 uppercase">Vorgeschlagene Arbeitszeit: {teil.arbeitszeit}</p>
          </div>
        </div>
      </div>

      {/* Situation/Context */}
      <div className="bg-[#111] border border-white/5 p-8 rounded-[32px] space-y-4">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 text-[#ffcc00]" />
          <span className="text-[10px] font-black text-[#ffcc00] uppercase">Prüfungssituation</span>
        </div>
        <p className="text-lg font-medium text-white/90 leading-relaxed italic">
          {topic.situation}
        </p>
      </div>

      {/* Grid of 4 Cards (Leitpunkte) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-[#ffcc00]" />
          <span className="text-xs font-black text-white uppercase">Bearbeiten Sie alle vier Punkte:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topic.aufgabenpunkte.map((point: string, idx: number) => (
            <div 
              key={idx} 
              className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl min-h-[140px] flex items-center justify-center text-center relative group hover:border-[#ffcc00]/30 transition-all"
            >
              <div className="absolute top-4 left-4 h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/20">
                {idx + 1}
              </div>
              <p className="text-base font-bold text-white/80 leading-snug px-2">
                {point}
              </p>
              {/* Decorative corner */}
              <div className="absolute bottom-4 right-4 h-2 w-2 rounded-full bg-white/5 group-hover:bg-[#ffcc00]/40 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions/Tips */}
      <div className="bg-[#1a1a1a] p-8 rounded-[32px] space-y-4">
        <div className="flex flex-col gap-4">
            <p className="text-sm text-white/50 font-medium leading-relaxed uppercase italic">
              Überlegen Sie sich eine passende Reihenfolge für die Inhaltspunkte.
            </p>
            <p className="text-sm text-white/40 leading-relaxed">
              Bei der Bewertung wird darauf geachtet, wie genau die Inhaltspunkte bearbeitet sind, wie korrekt der Text ist und wie gut die Sätze und Abschnitte sprachlich miteinander verknüpft sind. <span className="text-white/80 font-black italic">Vergessen Sie nicht Anrede und Gruß.</span>
            </p>
        </div>
        <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[#ffcc00]">
          <span className="text-[10px] font-black uppercase">Vorgabe:</span>
          <span className="text-xs font-black uppercase italic">Schreiben Sie circa 100 Wörter.</span>
        </div>
      </div>
    </div>
  );
};

export default Teil2;
