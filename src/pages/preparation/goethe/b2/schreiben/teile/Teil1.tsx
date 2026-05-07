import React from 'react';
import { PenTool, ImageIcon, ListChecks } from 'lucide-react';

interface Teil1Props {
  teil: any;
  topic: any;
}

const Teil1: React.FC<Teil1Props> = ({ teil, topic }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#ffcc00]/10 flex items-center justify-center text-[#ffcc00]">
            <PenTool className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase italic">{teil.label}</h2>
            <p className="text-[10px] font-black text-white/30 uppercase">Vorgeschlagene Arbeitszeit: {teil.arbeitszeit}</p>
          </div>
        </div>
      </div>

      {/* Topic Image Description (Placeholder for actual image) */}
      <div className="relative aspect-video rounded-[32px] overflow-hidden bg-[#111] border border-white/5 group">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-white/10" />
          </div>
          <div className="space-y-2 max-w-sm">
             <p className="text-[10px] font-black text-white/20 uppercase">Themen-Visualisierung</p>
             <p className="text-sm text-white/40 italic font-medium leading-relaxed">
               {topic.topic_image_description}
             </p>
          </div>
        </div>
        {/* Subtle overlay for premium look */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Situation/Context */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-[#ffcc00]" />
          <span className="text-[10px] font-black text-white/40 uppercase">Situation</span>
        </div>
        <p className="text-lg font-medium text-white/90 leading-relaxed pl-4 border-l-2 border-[#ffcc00]/20">
          {topic.context}
        </p>
      </div>

      {/* Aufgabenpunkte */}
      <div className="bg-[#111] rounded-[32px] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <ListChecks className="h-5 w-5 text-[#ffcc00]" />
          <span className="text-xs font-black text-white uppercase">Schreiben Sie zu folgenden Punkten:</span>
        </div>
        
        <ul className="grid grid-cols-1 gap-4">
          {topic.aufgabenpunkte.map((point: string, idx: number) => (
            <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-colors">
              <span className="h-6 w-6 rounded-lg bg-[#ffcc00]/10 flex items-center justify-center text-[10px] font-black text-[#ffcc00] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-base text-white/70 font-medium leading-snug">
                {point}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions/Tips */}
      <div className="bg-[#ffcc00]/5 border border-[#ffcc00]/10 p-6 rounded-3xl space-y-4">
        <p className="text-sm text-white/60 font-medium leading-relaxed">
          Denken Sie an eine <span className="text-white font-bold italic">Einleitung</span> und einen <span className="text-white font-bold italic">Schluss</span>. Bei der Bewertung wird darauf geachtet, wie genau die Inhaltspunkte bearbeitet sind, wie korrekt der Text ist und wie gut die Sätze und Abschnitte sprachlich miteinander verknüpft sind.
        </p>
        <div className="flex items-center gap-2 text-[#ffcc00]">
          <span className="text-[10px] font-black uppercase">Vorgabe:</span>
          <span className="text-xs font-black uppercase italic">Schreiben Sie circa 150 Wörter.</span>
        </div>
      </div>
    </div>
  );
};

export default Teil1;
